import { useEffect, useMemo, useState } from "react";

const API_URL =
  "https://parksafe-backend-s51i.onrender.com";

const IMAGE_LIMIT = 5 * 1024 * 1024;
const VIDEO_LIMIT = 10 * 1024 * 1024;

const violationOptions = [
  {
    value: "Illegal Parking",
    icon: "P",
    label: "Illegal Parking"
  },
  {
    value: "Blocking Entrance",
    icon: "↔",
    label: "Blocking Entrance"
  },
  {
    value: "Wrong Side Parking",
    icon: "↩",
    label: "Wrong Side Parking"
  },
  {
    value: "No Parking Zone",
    icon: "!",
    label: "No Parking Zone"
  },
  {
    value: "Blocking Emergency Access",
    icon: "+",
    label: "Emergency Access"
  },
  {
    value: "Other",
    icon: "•••",
    label: "Other"
  }
];

export default function Reports() {
  const [violationType, setViolationType] =
    useState("Illegal Parking");

  const [description, setDescription] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [coordinates, setCoordinates] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [reports, setReports] =
    useState([]);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [locating, setLocating] =
    useState(false);

  const [historyFilter, setHistoryFilter] =
    useState("All");

  const token =
    localStorage.getItem("parksafeToken");

  // ==========================================
  // STATS
  // ==========================================

  const stats = useMemo(() => {
    return {
      total: reports.length,

      pending: reports.filter(
        (report) =>
          !report.status ||
          report.status === "Pending"
      ).length,

      approved: reports.filter(
        (report) =>
          report.status === "Approved"
      ).length,

      rejected: reports.filter(
        (report) =>
          report.status === "Rejected"
      ).length
    };
  }, [reports]);

  // ==========================================
  // FILTER REPORTS
  // ==========================================

  const filteredReports = useMemo(() => {
    if (historyFilter === "All") {
      return reports;
    }

    return reports.filter(
      (report) =>
        (report.status || "Pending") ===
        historyFilter
    );
  }, [reports, historyFilter]);

  // ==========================================
  // LOAD USER REPORTS
  // ==========================================

  async function loadReports() {
    if (!token) {
      setError(
        "Please login to view your report history."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/reports/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load reports"
        );
      }

      setReports(data.reports || []);
    } catch (err) {
      setError(
        err.message ||
        "Unable to load reports"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  // ==========================================
  // GPS
  // ==========================================

  function getLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Location is not supported by this browser."
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords =
          `${position.coords.latitude.toFixed(6)}, ` +
          `${position.coords.longitude.toFixed(6)}`;

        setCoordinates(coords);
        setLocation(coords);
        setLocating(false);
      },

      () => {
        setError(
          "Location access was not available. Enter the location manually."
        );

        setLocating(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  // ==========================================
  // FILE SIZE FORMAT
  // ==========================================

  function formatFileSize(bytes) {
    if (!bytes) {
      return "0 MB";
    }

    const mb =
      bytes / (1024 * 1024);

    return `${mb.toFixed(2)} MB`;
  }

  // ==========================================
  // EVIDENCE SELECTION
  // ==========================================

  function handleEvidenceChange(e) {
    const selected =
      e.target.files?.[0];

    setError("");
    setSuccess("");

    if (!selected) {
      setFile(null);
      return;
    }

    const isImage =
      selected.type.startsWith("image/");

    const isVideo =
      selected.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setFile(null);

      e.target.value = "";

      setError(
        "Only photo or video evidence is allowed."
      );

      return;
    }

    if (
      isImage &&
      selected.size > IMAGE_LIMIT
    ) {
      setFile(null);

      e.target.value = "";

      setError(
        "Photo evidence must be 5 MB or smaller."
      );

      return;
    }

    if (
      isVideo &&
      selected.size > VIDEO_LIMIT
    ) {
      setFile(null);

      e.target.value = "";

      setError(
        "Video evidence must be 10 MB or smaller."
      );

      return;
    }

    setFile(selected);
  }

  // ==========================================
  // REMOVE SELECTED EVIDENCE
  // ==========================================

  function removeEvidence() {
    setFile(null);

    const input =
      document.getElementById(
        "report-evidence-input"
      );

    if (input) {
      input.value = "";
    }
  }

  // ==========================================
  // SUBMIT REPORT + ACTUAL FILE
  // ==========================================

  async function submitReport(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "Please login before submitting a report."
      );
      return;
    }

    // Extra safety before upload
    if (file) {
      const isImage =
        file.type.startsWith("image/");

      const isVideo =
        file.type.startsWith("video/");

      if (
        isImage &&
        file.size > IMAGE_LIMIT
      ) {
        setError(
          "Photo evidence must be 5 MB or smaller."
        );
        return;
      }

      if (
        isVideo &&
        file.size > VIDEO_LIMIT
      ) {
        setError(
          "Video evidence must be 10 MB or smaller."
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      // IMPORTANT:
      // We now use FormData instead of JSON.
      const formData =
        new FormData();

      formData.append(
        "violationType",
        violationType
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "location",
        location
      );

      formData.append(
        "coordinates",
        coordinates || ""
      );

      if (file) {
        // Must match:
        // evidenceUpload.single("evidence")
        // in server.js
        formData.append(
          "evidence",
          file
        );
      }

      const response = await fetch(
        `${API_URL}/api/reports`,
        {
          method: "POST",

          headers: {
            // DO NOT SET Content-Type HERE.
            // Browser automatically creates
            // multipart/form-data boundary.
            Authorization:
              `Bearer ${token}`
          },

          body: formData
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Report submission failed"
        );
      }

      setSuccess(data.reportId);

      setDescription("");
      setLocation("");
      setCoordinates("");
      setFile(null);

      const input =
        document.getElementById(
          "report-evidence-input"
        );

      if (input) {
        input.value = "";
      }

      await loadReports();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } catch (err) {
      setError(
        err.message ||
        "Report submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // DATE FORMAT
  // ==========================================

  function formatDate(value) {
    if (!value) {
      return "Not available";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return value;
    }

    return date.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
  }

  // ==========================================
  // STATUS
  // ==========================================

  function statusClass(status) {
    if (status === "Approved") {
      return "approved";
    }

    if (status === "Rejected") {
      return "rejected";
    }

    return "pending";
  }

  function statusIcon(status) {
    if (status === "Approved") {
      return "✓";
    }

    if (status === "Rejected") {
      return "×";
    }

    return "◷";
  }

  // ==========================================
  // EVIDENCE TYPE
  // ==========================================

  function evidenceLabel(report) {
    if (!report.evidenceType) {
      return "No evidence";
    }

    if (
      report.evidenceType.startsWith(
        "image/"
      )
    ) {
      return "Photo Evidence";
    }

    if (
      report.evidenceType.startsWith(
        "video/"
      )
    ) {
      return "Video Evidence";
    }

    return "Evidence";
  }

  return (
    <div className="premium-reports-page">

      {/* AMBIENT BACKGROUND */}

      <div
        className="reports-ambient"
        aria-hidden="true"
      >
        <span className="reports-orb reports-orb-one" />
        <span className="reports-orb reports-orb-two" />

        <span className="reports-particle reports-particle-one" />
        <span className="reports-particle reports-particle-two" />
        <span className="reports-particle reports-particle-three" />
      </div>

      {/* ======================================
          HEADER
      ====================================== */}

      <section className="reports-header">

        <div>

          <div className="reports-network-pill">
            <span />
            PARKSAFE REPORT NETWORK
          </div>

          <span className="eyebrow">
            REPORTING SYSTEM
          </span>

          <h1>
            Report responsibly.{" "}
            <span>
              Track transparently.
            </span>
          </h1>

          <p>
            Submit unresolved parking
            violations with location and
            real photo or video evidence,
            then follow their review status.
          </p>

        </div>

        <div className="reports-header-status">

          <div className="reports-header-icon">
            ⚑
          </div>

          <div>
            <small>
              YOUR REPORTS
            </small>

            <strong>
              {reports.length}{" "}
              {reports.length === 1
                ? "Report"
                : "Reports"}
            </strong>
          </div>

          <span className="reports-online-dot" />

        </div>

      </section>

      {/* ======================================
          HERO
      ====================================== */}

      <section className="reports-hero">

        <div className="reports-hero-copy">

          <div className="reports-hero-label">
            <span />
            RESPONSIBLE ESCALATION
          </div>

          <h2>
            Evidence-backed
            <br />

            <span>
              parking reports.
            </span>
          </h2>

          <p>
            When a parking issue remains
            unresolved, submit clear
            information together with
            photo or video evidence.
          </p>

          <div className="reports-hero-features">

            <div>
              <span>✓</span>
              Private evidence storage
            </div>

            <div>
              <span>✓</span>
              GPS support
            </div>

            <div>
              <span>✓</span>
              Authority review
            </div>

          </div>

        </div>

        <div className="reports-hero-visual">

          <span className="report-radar-ring report-ring-one" />
          <span className="report-radar-ring report-ring-two" />
          <span className="report-radar-ring report-ring-three" />

          <div className="report-document">

            <div className="report-document-top">

              <span>P</span>

              <div>
                <small>
                  PARKSAFE
                </small>

                <strong>
                  Violation Report
                </strong>
              </div>

            </div>

            <div className="report-document-line long" />
            <div className="report-document-line medium" />
            <div className="report-document-line short" />

            <div className="report-document-status">
              <span />
              Evidence Ready
            </div>

          </div>

          <div className="report-floating-card report-float-one">

            <span className="report-float-icon purple">
              ◉
            </span>

            <div>
              <small>
                LOCATION
              </small>

              <strong>
                GPS Supported
              </strong>
            </div>

          </div>

          <div className="report-floating-card report-float-two">

            <span className="report-float-icon green">
              ✓
            </span>

            <div>
              <small>
                EVIDENCE
              </small>

              <strong>
                Secure Storage
              </strong>
            </div>

          </div>

        </div>

      </section>

      {/* ======================================
          STATS
      ====================================== */}

      <section className="reports-stats-grid">

        <div className="report-stat-card report-stat-total">
          <div className="report-stat-icon">
            ▤
          </div>

          <div>
            <span>
              TOTAL REPORTS
            </span>
            <strong>
              {stats.total}
            </strong>
            <small>
              Submitted by you
            </small>
          </div>
        </div>

        <div className="report-stat-card report-stat-pending">
          <div className="report-stat-icon">
            ◷
          </div>

          <div>
            <span>
              PENDING
            </span>
            <strong>
              {stats.pending}
            </strong>
            <small>
              Awaiting review
            </small>
          </div>
        </div>

        <div className="report-stat-card report-stat-approved">
          <div className="report-stat-icon">
            ✓
          </div>

          <div>
            <span>
              APPROVED
            </span>
            <strong>
              {stats.approved}
            </strong>
            <small>
              Accepted reports
            </small>
          </div>
        </div>

        <div className="report-stat-card report-stat-rejected">
          <div className="report-stat-icon">
            ×
          </div>

          <div>
            <span>
              REJECTED
            </span>
            <strong>
              {stats.rejected}
            </strong>
            <small>
              Closed reports
            </small>
          </div>
        </div>

      </section>

      {/* ERROR */}

      {error && (
        <div className="premium-report-error">

          <div>!</div>

          <div>
            <strong>
              Something needs attention
            </strong>

            <p>{error}</p>
          </div>

        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <section className="report-success-card">

          <div className="report-success-animation">

            <span className="report-success-ring success-ring-one" />
            <span className="report-success-ring success-ring-two" />

            <div>✓</div>

          </div>

          <div className="report-success-copy">

            <span>
              REPORT SUBMITTED
            </span>

            <h2>
              Report and evidence submitted
            </h2>

            <p>
              Your report has been added
              to the ParkSafe authority
              review queue.
            </p>

            <div className="report-success-id">

              <small>
                REPORT ID
              </small>

              <strong>
                {success}
              </strong>

            </div>

          </div>

        </section>
      )}

      {/* ======================================
          REPORT FORM
      ====================================== */}

      <section className="premium-report-form-card">

        <div className="report-form-heading">

          <div className="report-form-icon">
            ⚑
          </div>

          <div>

            <span className="eyebrow">
              NEW REPORT
            </span>

            <h2>
              Submit Violation Report
            </h2>

            <p>
              Provide clear information
              and supporting evidence.
            </p>

          </div>

          <span className="report-form-ready">
            <span />
            READY
          </span>

        </div>

        <form
          onSubmit={submitReport}
          className="premium-report-form"
        >

          {/* VIOLATION */}

          <div className="report-form-section">

            <div className="report-form-section-title">

              <span>01</span>

              <div>
                <strong>
                  Violation Type
                </strong>

                <small>
                  Select the parking issue
                </small>
              </div>

            </div>

            <div className="violation-option-grid">

              {violationOptions.map(
                (option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      violationType ===
                      option.value
                        ? "violation-option active"
                        : "violation-option"
                    }
                    onClick={() =>
                      setViolationType(
                        option.value
                      )
                    }
                  >

                    <span className="violation-option-icon">
                      {option.icon}
                    </span>

                    <span>
                      {option.label}
                    </span>

                    {violationType ===
                      option.value && (
                      <strong>✓</strong>
                    )}

                  </button>
                )
              )}

            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="report-form-section">

            <div className="report-form-section-title">

              <span>02</span>

              <div>
                <strong>
                  Description
                </strong>

                <small>
                  Explain what happened
                </small>
              </div>

            </div>

            <div className="premium-report-textarea">

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Describe the parking violation clearly..."
                rows="5"
                maxLength={500}
                required
              />

              <span>
                {description.length}/500
              </span>

            </div>

          </div>

          {/* LOCATION */}

          <div className="report-form-section">

            <div className="report-form-section-title">

              <span>03</span>

              <div>
                <strong>
                  Location
                </strong>

                <small>
                  Enter manually or use GPS
                </small>
              </div>

            </div>

            <div className="report-location-row">

              <div className="report-location-input">

                <span>◉</span>

                <input
                  value={location}
                  onChange={(e) =>
                    setLocation(
                      e.target.value
                    )
                  }
                  placeholder="Enter parking location"
                  required
                />

              </div>

              <button
                type="button"
                className={
                  locating
                    ? "report-gps-button locating"
                    : "report-gps-button"
                }
                onClick={getLocation}
                disabled={locating}
              >

                {locating ? (
                  <>
                    <span className="report-gps-loader" />
                    Locating...
                  </>
                ) : (
                  <>
                    <span>◎</span>
                    Use Current GPS
                  </>
                )}

              </button>

            </div>

            {coordinates && (
              <div className="report-coordinate-box">

                <span className="coordinate-live">
                  <span />
                  GPS CAPTURED
                </span>

                <strong>
                  {coordinates}
                </strong>

              </div>
            )}

          </div>

          {/* ==================================
              ACTUAL EVIDENCE
          ================================== */}

          <div className="report-form-section">

            <div className="report-form-section-title">

              <span>04</span>

              <div>
                <strong>
                  Evidence
                </strong>

                <small>
                  Upload supporting photo
                  or video
                </small>
              </div>

            </div>

            <label className="premium-evidence-upload">

              <input
                id="report-evidence-input"
                type="file"
                accept="image/*,video/*"
                onChange={
                  handleEvidenceChange
                }
              />

              {!file ? (
                <>
                  <div className="evidence-upload-animation">

                    <span className="upload-ring upload-ring-one" />
                    <span className="upload-ring upload-ring-two" />

                    <div>↑</div>

                  </div>

                  <strong>
                    Upload Photo or Video Evidence
                  </strong>

                  <p>
                    Select supporting evidence
                    from your device.
                  </p>

                  <div className="report-evidence-limits">

                    <span>
                      🖼 Photo
                      <strong>
                        Max 5 MB
                      </strong>
                    </span>

                    <span>
                      🎥 Video
                      <strong>
                        Max 10 MB
                      </strong>
                    </span>

                  </div>

                  <span className="evidence-upload-button">
                    Choose Evidence
                  </span>
                </>
              ) : (
                <div className="evidence-selected">

                  <div className="evidence-selected-icon">
                    {file.type.startsWith(
                      "video/"
                    )
                      ? "▶"
                      : "✓"}
                  </div>

                  <div>

                    <span>
                      {file.type.startsWith(
                        "video/"
                      )
                        ? "VIDEO EVIDENCE"
                        : "PHOTO EVIDENCE"}
                    </span>

                    <strong>
                      {file.name}
                    </strong>

                    <small>
                      {formatFileSize(
                        file.size
                      )}{" "}
                      • {file.type}
                    </small>

                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeEvidence();
                    }}
                    aria-label="Remove evidence"
                  >
                    ×
                  </button>

                </div>
              )}

            </label>

            <div className="report-evidence-security">

              <span>🔒</span>

              <p>
                Evidence is stored privately
                and made available to
                authorized ParkSafe reviewers.
              </p>

            </div>

          </div>

          {/* SUBMIT */}

          <div className="report-submit-area">

            <div className="report-submit-note">

              <span>✓</span>

              <p>
                Submit only genuine parking
                issues with relevant evidence.
              </p>

            </div>

            <button
              className={
                submitting
                  ? "premium-report-submit submitting"
                  : "premium-report-submit"
              }
              type="submit"
              disabled={submitting}
            >

              {submitting ? (
                <>
                  <span className="report-submit-loader" />
                  Uploading & Submitting...
                </>
              ) : (
                <>
                  <span className="report-submit-icon">
                    ⚑
                  </span>

                  Submit Violation Report

                  <strong>→</strong>
                </>
              )}

            </button>

          </div>

        </form>

      </section>

      {/* ======================================
          HISTORY
      ====================================== */}

      <section className="premium-report-history">

        <div className="report-history-heading">

          <div>

            <span className="eyebrow">
              REPORT TRACKING
            </span>

            <h2>
              My Report History
            </h2>

            <p>
              Follow your reports and
              submitted evidence.
            </p>

          </div>

          <button
            type="button"
            className={
              loading
                ? "report-refresh-button loading"
                : "report-refresh-button"
            }
            onClick={loadReports}
            disabled={loading}
          >
            <span>↻</span>

            {loading
              ? "Refreshing..."
              : "Refresh History"}
          </button>

        </div>

        {/* FILTERS */}

        <div className="report-history-filters">

          {[
            "All",
            "Pending",
            "Approved",
            "Rejected"
          ].map(
            (filter) => (
              <button
                type="button"
                key={filter}
                className={
                  historyFilter === filter
                    ? `report-filter active ${filter.toLowerCase()}`
                    : "report-filter"
                }
                onClick={() =>
                  setHistoryFilter(
                    filter
                  )
                }
              >

                {filter}

                <span>
                  {filter === "All"
                    ? stats.total
                    : filter === "Pending"
                    ? stats.pending
                    : filter === "Approved"
                    ? stats.approved
                    : stats.rejected}
                </span>

              </button>
            )
          )}

        </div>

        {/* LOADING */}

        {loading &&
          reports.length === 0 && (
          <div className="report-history-loading">

            <div className="history-loader-radar">

              <span className="history-loader-ring ring-one" />
              <span className="history-loader-ring ring-two" />

              <div>↻</div>

            </div>

            <h3>
              Loading your reports
            </h3>

            <p>
              Syncing with ParkSafe...
            </p>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          filteredReports.length === 0 &&
          !error && (
          <div className="report-history-empty">

            <div className="history-empty-animation">

              <span className="history-empty-ring empty-one" />
              <span className="history-empty-ring empty-two" />

              <div>⚑</div>

            </div>

            <h3>
              {historyFilter === "All"
                ? "No Reports Yet"
                : `No ${historyFilter} Reports`}
            </h3>

            <p>
              {historyFilter === "All"
                ? "Your submitted violation reports will appear here."
                : `You currently have no ${historyFilter.toLowerCase()} reports.`}
            </p>

          </div>
        )}

        {/* REPORT LIST */}

        {filteredReports.length > 0 && (
          <div className="premium-report-list">

            {filteredReports.map(
              (report, index) => {
                const status =
                  report.status ||
                  "Pending";

                const state =
                  statusClass(
                    status
                  );

                return (
                  <article
                    className={`premium-history-card ${state}`}
                    key={
                      report.reportId
                    }
                    style={{
                      "--report-delay":
                        `${index * 0.08}s`
                    }}
                  >

                    <div className="history-card-status-line" />

                    <div className="history-card-top">

                      <div className="history-card-id">

                        <div
                          className={`history-status-icon ${state}`}
                        >
                          {statusIcon(
                            status
                          )}
                        </div>

                        <div>
                          <span>
                            REPORT ID
                          </span>

                          <strong>
                            {report.reportId}
                          </strong>
                        </div>

                      </div>

                      <span
                        className={`premium-report-status ${state}`}
                      >
                        <span />
                        {status}
                      </span>

                    </div>

                    <div className="history-violation">

                      <span>
                        VIOLATION
                      </span>

                      <h3>
                        {report.violationType}
                      </h3>

                      <p>
                        {report.description}
                      </p>

                    </div>

                    <div className="history-detail-grid">

                      <div>
                        <span className="history-detail-icon">
                          ◉
                        </span>

                        <div>
                          <small>
                            LOCATION
                          </small>

                          <strong>
                            {report.location}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <span className="history-detail-icon">
                          ◷
                        </span>

                        <div>
                          <small>
                            SUBMITTED
                          </small>

                          <strong>
                            {formatDate(
                              report.submittedAt
                            )}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <span className="history-detail-icon">
                          ▣
                        </span>

                        <div>
                          <small>
                            EVIDENCE
                          </small>

                          <strong>
                            {report.fileName ||
                              "No attachment"}
                          </strong>
                        </div>
                      </div>

                      {report.coordinates && (
                        <div>
                          <span className="history-detail-icon">
                            ◎
                          </span>

                          <div>
                            <small>
                              GPS
                            </small>

                            <strong>
                              {report.coordinates}
                            </strong>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* EVIDENCE VIEW */}

                    {report.evidenceUrl && (
                      <div className="user-report-evidence">

                        <div>

                          <span>
                            {report.evidenceType?.startsWith(
                              "video/"
                            )
                              ? "🎥"
                              : "🖼"}
                          </span>

                          <div>
                            <small>
                              SECURE EVIDENCE
                            </small>

                            <strong>
                              {evidenceLabel(
                                report
                              )}
                            </strong>

                            {report.evidenceSize && (
                              <span>
                                {formatFileSize(
                                  Number(
                                    report.evidenceSize
                                  )
                                )}
                              </span>
                            )}
                          </div>

                        </div>

                        <a
                          href={
                            report.evidenceUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="user-evidence-view-button"
                        >
                          View Evidence →
                        </a>

                      </div>
                    )}

                    <div className="history-card-footer">

                      <span>
                        {state === "approved"
                          ? "✓ Report approved by authority"
                          : state === "rejected"
                          ? "× Report review completed"
                          : "◷ Waiting for authority review"}
                      </span>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* BOTTOM NOTE */}

      <section className="reports-bottom-note">

        <div className="reports-bottom-icon">
          i
        </div>

        <div>

          <span>
            RESPONSIBLE REPORTING
          </span>

          <h3>
            Accurate evidence helps
            authorities review reports.
          </h3>

          <p>
            Upload only relevant photos
            or videos that clearly document
            the parking issue.
          </p>

        </div>

      </section>

    </div>
  );
}