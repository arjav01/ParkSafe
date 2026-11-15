
import { useState, useEffect } from "react";

const API_URL = "https://parksafe-backend-s51i.onrender.com";

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

  const token = localStorage.getItem("parksafeToken");

  // LOAD USER REPORT HISTORY
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
        throw new Error(data.message || "Unable to load reports");
      }

      setReports(data.reports || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  // GET GPS LOCATION
  function getLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords =
          `${position.coords.latitude}, ${position.coords.longitude}`;

        setCoordinates(coords);
        setLocation(coords);
      },
      () => {
        setError("Please allow location access.");
      }
    );
  }

  // SUBMIT REPORT
  async function submitReport(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Please login before submitting a report.");
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
          description,
          location,
          coordinates,
          fileName: file ? file.name : "No attachment"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Report submission failed");
      }

      setSuccess(data.reportId);

      setDescription("");
      setLocation("");
      setCoordinates("");
      setFile(null);

      e.target.reset();

      await loadReports();

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // STATUS COLORS
  function statusColor(status) {
    if (status === "Approved") return "#16a34a";
    if (status === "Rejected") return "#dc2626";
    return "#d97706";
  }

  // GET AUTHORITY REMARK
  function getAuthorityRemark(report) {
    return (
      report.remark ||
      report.authorityRemark ||
      report.authority_remark ||
      ""
    );
  }

  return (
    <div>
      <span className="eyebrow">REPORTING SYSTEM</span>

      <h1>Violation Reports</h1>

      <p className="subtitle">
        Submit parking violations and track your reports.
      </p>

      {/* REPORT FORM */}
      <form className="search-card" onSubmit={submitReport}>
        <label>Violation Type</label>

        <select
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

        <br /><br />

        <label>Description</label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the violation..."
          rows="4"
          required
        />

        <br /><br />

        <label>Location</label>

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
          required
        />

        <button
          type="button"
          className="primary-button"
          onClick={getLocation}
        >
          Get Current GPS Location
        </button>

        {coordinates && <p>GPS: {coordinates}</p>}

        <br />

        <label>Photo / Video Evidence</label>

        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />

        {file && <p>Selected: {file.name}</p>}

        <br /><br />

        <button
          className="primary-button"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Violation Report"}
        </button>
      </form>

      {error && (
        <p className="error-message">{error}</p>
      )}

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="result-card">
          <span className="success-label">
            REPORT SUBMITTED
          </span>

          <h2>Report Submitted Successfully!</h2>

          <p>
            Your Report ID: <strong>{success}</strong>
          </p>
        </div>
      )}

      {/* USER REPORT HISTORY */}
      <div className="search-card">
        <h2>My Report History</h2>

        <p>
          Track the status of all your submitted reports.
        </p>

        <button
          className="primary-button"
          onClick={loadReports}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh History"}
        </button>
      </div>

      {loading && reports.length === 0 && (
        <p>Loading your reports...</p>
      )}

      {!loading && reports.length === 0 && !error && (
        <div className="result-card">
          <p>You have not submitted any reports yet.</p>
        </div>
      )}

      {/* REPORT HISTORY CARDS */}
      {reports.map((report) => {
        const authorityRemark = getAuthorityRemark(report);

        return (
          <div className="result-card" key={report.reportId}>

            <span
              style={{
                color: statusColor(report.status),
                fontWeight: "bold"
              }}
            >
              ● {report.status}
            </span>

            {/* AUTHORITY REMARK */}
            {(report.status === "Approved" ||
              report.status === "Rejected") && (
              <div
                style={{
                  marginTop: "18px",
                  marginBottom: "20px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: report.status === "Approved"
                    ? "#f0fdf4"
                    : "#fef2f2",
                  border: `1px solid ${
                    report.status === "Approved" ? "#bbf7d0" : "#fecaca"
                  }`
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px",
                    color: report.status === "Approved"
                      ? "#15803d"
                      : "#b91c1c",
                    fontSize: "16px"
                  }}
                >
                  Authority's Remark
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#334155",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {authorityRemark ||
                    "No remark was provided by the authority."}
                </p>
              </div>
            )}

            <h2>{report.reportId}</h2>

            <p>
              <strong>Violation:</strong> {report.violationType}
            </p>

            <p>
              <strong>Location:</strong> {report.location}
            </p>

            <p>
              <strong>Submitted:</strong> {report.submittedAt}
            </p>

            <p>
              <strong>Description:</strong> {report.description}
            </p>

            <p>
              <strong>Evidence:</strong> {report.fileName}
            </p>

            {report.coordinates && (
              <p>
                <strong>GPS:</strong> {report.coordinates}
              </p>
            )}

          </div>
        );
      })}
    </div>
  );
}
