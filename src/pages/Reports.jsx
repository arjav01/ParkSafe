
import { useState, useEffect, useRef } from "react";

const API_URL = "https://parksafe-backend-s51i.onrender.com";

function ReportIcon({ name, size = 22 }) {
  const icons = {
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    close: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6m0-6-6 6" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4m-4 4 4-4 4 4" />
        <path d="M4 16v4h16v-4" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2" />
      </>
    ),
    car: (
      <>
        <path d="m5 11 2-5h10l2 5 2 2v5H3v-5z" />
        <path d="M3 13h18M7 18v2m10-2v2" />
        <circle cx="7" cy="15" r="1" />
        <circle cx="17" cy="15" r="1" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    )
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getStatus(status) {
  const normalized = String(status || "Pending").toLowerCase();

  if (normalized === "approved") return "Approved";
  if (normalized === "rejected") return "Rejected";

  return "Pending";
}

function getAuthorityRemark(report) {
  return (
    report.remark ||
    report.authorityRemark ||
    report.authority_remark ||
    ""
  );
}

function getReportId(report) {
  return report.reportId || report.report_id || report.id || "Report";
}

function getVehicleIcon(type) {
  const value = String(type || "").toLowerCase();

  if (value.includes("bike")) return "🏍️";
  if (value.includes("scooter")) return "🛵";
  if (value.includes("commercial")) return "🚚";

  return "🚘";
}

export default function Reports() {
  const [violationType, setViolationType] = useState("Illegal Parking");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [file, setFile] = useState(null);

  const [reports, setReports] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("parksafeToken");

  async function loadReports() {
    if (!token) {
      setError("Please login to view your report history.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/reports/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reports.");
      }

      setReports(data.reports || []);
    } catch (err) {
      setError(err.message || "Unable to load your reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    // Load the signed-in user's report history on page entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scrollToForm() {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function getLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude}, ${position.coords.longitude}`;

        setCoordinates(coords);
        setLocation(coords);
        setLocating(false);
      },
      () => {
        setError("Unable to access your location. Please allow location permission.");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000
      }
    );
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null;

    if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
      setError("Please select a file smaller than 20 MB.");
      event.target.value = "";
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  }

  async function submitReport(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Please login before submitting a report.");
      return;
    }

    if (!description.trim() || !location.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          violationType,
          description: description.trim(),
          location: location.trim(),
          coordinates,
          fileName: file ? file.name : "No attachment"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Report submission failed.");
      }

      setSuccess(data.reportId || "Your report has been submitted.");

      setDescription("");
      setLocation("");
      setCoordinates("");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      event.target.reset();

      await loadReports();

      window.setTimeout(() => {
        document.getElementById("report-success")?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 100);
    } catch (err) {
      setError(err.message || "Something went wrong while submitting.");
    } finally {
      setSubmitting(false);
    }
  }

  const totalReports = reports.length;
  const pendingReports = reports.filter(
    (report) => getStatus(report.status) === "Pending"
  ).length;
  const approvedReports = reports.filter(
    (report) => getStatus(report.status) === "Approved"
  ).length;
  const rejectedReports = reports.filter(
    (report) => getStatus(report.status) === "Rejected"
  ).length;

  return (
    <div className="reports-page">

      {/* PAGE HEADER */}
      <section className="reports-heading">
        <div>
          <span className="eyebrow">PARKSAFE • REPORTING CENTRE</span>
          <h1>My Reports<span className="reports-title-dot">.</span></h1>
          <p className="subtitle">
            Report parking violations, submit evidence and follow every
            decision made by the authority.
          </p>
        </div>

        <button
          type="button"
          className="primary-button reports-new-button"
          onClick={scrollToForm}
        >
          <span>＋</span> New Report
        </button>
      </section>

      {/* HERO */}
      <section className="reports-hero">
        <div className="reports-hero-content">
          <span className="reports-hero-label">
            <span className="reports-live-dot"></span>
            PARKSAFE REPORTING SYSTEM
          </span>

          <h2>
            Help keep every
            <br />
            parking space <span>accessible.</span>
          </h2>

          <p>
            Submit a parking concern with clear details and supporting
            evidence. Your report can then be reviewed by the authorised
            ParkSafe team.
          </p>

          <button
            type="button"
            className="reports-hero-button"
            onClick={scrollToForm}
          >
            Submit a Report <span>→</span>
          </button>

          <div className="reports-hero-note">
            <ReportIcon name="shield" size={17} />
            Responsible reporting. Transparent review.
          </div>
        </div>

        <div className="reports-hero-visual" aria-hidden="true">
          <div className="reports-orbit reports-orbit-one"></div>
          <div className="reports-orbit reports-orbit-two"></div>
          <div className="reports-orbit reports-orbit-three"></div>

          <div className="reports-hero-car">🚘</div>

          <div className="reports-floating-card reports-floating-top">
            <span className="reports-floating-icon">
              <ReportIcon name="file" size={20} />
            </span>
            <div>
              <strong>Report received</strong>
              <small>Case submitted to ParkSafe</small>
            </div>
          </div>

          <div className="reports-floating-card reports-floating-bottom">
            <span className="reports-floating-check">✓</span>
            <div>
              <strong>Transparent review</strong>
              <small>Track your report status</small>
            </div>
          </div>
        </div>
      </section>

      {/* REPORT STATISTICS */}
      <section className="reports-stats">
        <article className="reports-stat-card">
          <div className="reports-stat-icon stat-total">
            <ReportIcon name="file" />
          </div>
          <div>
            <span>Total Reports</span>
            <strong>{totalReports}</strong>
            <small>All submitted cases</small>
          </div>
        </article>

        <article className="reports-stat-card">
          <div className="reports-stat-icon stat-pending">
            <ReportIcon name="clock" />
          </div>
          <div>
            <span>Pending</span>
            <strong>{pendingReports}</strong>
            <small>Awaiting review</small>
          </div>
        </article>

        <article className="reports-stat-card">
          <div className="reports-stat-icon stat-approved">
            <ReportIcon name="check" />
          </div>
          <div>
            <span>Approved</span>
            <strong>{approvedReports}</strong>
            <small>Verified reports</small>
          </div>
        </article>

        <article className="reports-stat-card">
          <div className="reports-stat-icon stat-rejected">
            <ReportIcon name="close" />
          </div>
          <div>
            <span>Rejected</span>
            <strong>{rejectedReports}</strong>
            <small>Not approved</small>
          </div>
        </article>
      </section>

      {/* ERROR */}
      {error && (
        <div className="reports-alert reports-error" role="alert">
          <span>!</span>
          <p>{error}</p>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div
          id="report-success"
          className="reports-success-panel"
          role="status"
        >
          <div className="reports-success-icon">✓</div>
          <div>
            <span>SUBMISSION COMPLETE</span>
            <h3>Your report has been submitted!</h3>
            <p>
              Keep this reference number to track your case:
            </p>
            <strong className="reports-success-id">{success}</strong>
          </div>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      {/* REPORT FORM */}
      <section className="reports-form-section" ref={formRef}>
        <div className="reports-section-heading">
          <div className="reports-section-icon">
            <ReportIcon name="file" size={24} />
          </div>
          <div>
            <span className="eyebrow">NEW CASE</span>
            <h2>Submit a Violation Report</h2>
            <p>Provide accurate details to help the authority review your report.</p>
          </div>
        </div>

        <form className="reports-form" onSubmit={submitReport}>
          <div className="reports-form-grid">
            <div className="reports-field reports-field-full">
              <label htmlFor="violation-type">Violation Category</label>
              <select
                id="violation-type"
                value={violationType}
                onChange={(e) => setViolationType(e.target.value)}
              >
                <option>Illegal Parking</option>
                <option>Blocking Entrance</option>
                <option>Wrong Side Parking</option>
                <option>No Parking Zone</option>
                <option>Blocking Emergency Access</option>
                <option>Other</option>
              </select>
              <small>Select the category that best describes the issue.</small>
            </div>

            <div className="reports-field reports-field-full">
              <label htmlFor="report-description">Incident Description</label>
              <textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, how the vehicle is causing an obstruction, and any other relevant details..."
                rows={5}
                maxLength={1000}
                required
              />
              <div className="reports-field-footer">
                <small>Keep the description clear and factual.</small>
                <small>{description.length}/1000</small>
              </div>
            </div>

            <div className="reports-field reports-field-full">
              <label htmlFor="report-location">Incident Location</label>
              <div className="reports-location-input">
                <ReportIcon name="pin" size={19} />
                <input
                  id="report-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter the location of the parking violation"
                  required
                />
              </div>

              <button
                type="button"
                className="reports-gps-button"
                onClick={getLocation}
                disabled={locating}
              >
                <ReportIcon name="pin" size={17} />
                {locating ? "Detecting your location..." : "Use my current GPS location"}
              </button>

              {coordinates && (
                <div className="reports-gps-confirmation">
                  <span>✓</span>
                  GPS coordinates captured: {coordinates}
                </div>
              )}
            </div>

            <div className="reports-field reports-field-full">
              <label>Photo / Video Evidence</label>

              <label className="reports-upload-area" htmlFor="report-evidence">
                <input
                  ref={fileInputRef}
                  id="report-evidence"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />

                <span className="reports-upload-icon">
                  <ReportIcon name="upload" size={25} />
                </span>

                <strong>
                  {file ? "Evidence selected" : "Choose your evidence file"}
                </strong>

                <span>
                  {file
                    ? file.name
                    : "Select a photo or video from your device (maximum 20 MB)."}
                </span>

                <small>Supported formats depend on your device and browser.</small>
              </label>

              {file && (
                <div className="reports-file-selected">
                  <span className="reports-file-icon">
                    {file.type.startsWith("video/") ? "▶" : "▧"}
                  </span>
                  <div>
                    <strong>{file.name}</strong>
                    <small>{(file.size / (1024 * 1024)).toFixed(2)} MB</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              <p className="reports-evidence-note">
                Evidence filename is currently recorded with the report.
                Actual photo/video uploading is not yet connected to the backend.
              </p>
            </div>
          </div>

          <div className="reports-form-bottom">
            <div className="reports-form-assurance">
              <ReportIcon name="shield" size={19} />
              <span>Review your details before submitting.</span>
            </div>

            <button
              className="primary-button reports-submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="reports-spinner"></span>
                  Submitting Report...
                </>
              ) : (
                <>
                  Submit Violation Report <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* REPORT HISTORY */}
      <section className="reports-history-section">
        <div className="reports-history-heading">
          <div>
            <span className="eyebrow">YOUR CASES</span>
            <h2>Report History</h2>
            <p>Follow the progress and decisions for your submitted reports.</p>
          </div>

          <button
            type="button"
            className="reports-refresh-button"
            onClick={loadReports}
            disabled={loading}
          >
            <ReportIcon name="refresh" size={17} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading && reports.length === 0 && (
          <div className="reports-loading">
            <span className="reports-spinner"></span>
            Loading your report history...
          </div>
        )}

        {!loading && reports.length === 0 && !error && (
          <div className="reports-empty-state">
            <div className="reports-empty-icon">
              <ReportIcon name="file" size={34} />
            </div>
            <h3>No reports submitted yet</h3>
            <p>
              When you submit a parking violation, its case details and
              review status will appear here.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={scrollToForm}
            >
              Create your first report →
            </button>
          </div>
        )}

        {reports.length > 0 && (
          <div className="reports-history-list">
            {reports.map((report, index) => {
              const status = getStatus(report.status);
              const authorityRemark = getAuthorityRemark(report);
              const reportId = getReportId(report);

              return (
                <article
                  className={`report-record report-record-${status.toLowerCase()}`}
                  key={reportId}
                >
                  <div className="report-record-top">
                    <div className="report-record-reference">
                      <span className="report-record-icon">
                        <ReportIcon name="file" size={21} />
                      </span>
                      <div>
                        <span>CASE REFERENCE</span>
                        <strong>{reportId}</strong>
                      </div>
                    </div>

                    <span className={`report-status-badge status-${status.toLowerCase()}`}>
                      <span></span>
                      {status}
                    </span>
                  </div>

                  <div className="report-record-main">
                    <div className="report-record-title">
                      <h3>{report.violationType || "Parking Violation"}</h3>
                      <p>{report.description || "No description provided."}</p>
                    </div>

                    <div className="report-record-details">
                      <div>
                        <span>SUBMITTED ON</span>
                        <strong>{formatDate(report.submittedAt || report.submitted_at)}</strong>
                      </div>
                      <div>
                        <span>LOCATION</span>
                        <strong>{report.location || "Not provided"}</strong>
                      </div>
                      <div>
                        <span>EVIDENCE</span>
                        <strong>{report.fileName || report.file_name || "No attachment"}</strong>
                      </div>
                    </div>

                    {report.coordinates && (
                      <div className="report-gps-detail">
                        <ReportIcon name="pin" size={16} />
                        GPS: {report.coordinates}
                      </div>
                    )}
                  </div>

                  {/* AUTHORITY DECISION */}
                  {status === "Pending" && (
                    <div className="report-review-message review-pending">
                      <span className="report-review-icon">
                        <ReportIcon name="clock" size={20} />
                      </span>
                      <div>
                        <strong>Awaiting authority review</strong>
                        <p>
                          Your report has been submitted and is waiting
                          for the authority's decision.
                        </p>
                      </div>
                    </div>
                  )}

                  {(status === "Approved" || status === "Rejected") && (
                    <div className={`report-authority-decision decision-${status.toLowerCase()}`}>
                      <div className="report-decision-heading">
                        <span className="report-decision-icon">
                          {status === "Approved" ? (
                            <ReportIcon name="check" size={20} />
                          ) : (
                            <ReportIcon name="close" size={20} />
                          )}
                        </span>
                        <div>
                          <span>OFFICIAL REVIEW DECISION</span>
                          <strong>
                            {status === "Approved"
                              ? "Report Approved"
                              : "Report Rejected"}
                          </strong>
                        </div>
                      </div>

                      <div className="report-authority-remark">
                        <strong>Authority's Remark</strong>
                        <p>
                          {authorityRemark ||
                            "No remark was provided by the authority."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="report-record-footer">
                    <span>
                      {getVehicleIcon(report.vehicleType)} ParkSafe Case
                    </span>
                    <span>Record {index + 1}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOTER NOTE */}
      <div className="reports-footer-note">
        <span><ReportIcon name="shield" size={19} /></span>
        <div>
          <strong>Responsible reporting matters</strong>
          <p>
            Please provide accurate information and genuine evidence.
            Reports are subject to review by the authorised ParkSafe team.
          </p>
        </div>
      </div>
    </div>
  );
}
