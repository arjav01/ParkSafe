
import { useEffect, useMemo, useState } from "react";

const API_URL = "http://https://parksafe-backend-s51i.onrender.com";

function Icon({ name, size = 20 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.5-2L20 12M4 12l2.9 5a7 7 0 0 0 11.5-2"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
    reject: <><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15m6-12v15"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 6-7"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>
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
      {paths[name]}
    </svg>
  );
}

function getDate(report) {
  const value = report.submittedAt;
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = getDate({ submittedAt: value });
  if (!date) return value || "Not available";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function StatusBadge({ status }) {
  const className =
    status === "Approved"
      ? "report-status approved"
      : status === "Rejected"
        ? "report-status rejected"
        : "report-status pending";

  return <span className={className}>{status || "Pending Review"}</span>;
}

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const token = localStorage.getItem("parksafeToken");

  async function loadReports() {
    if (!token) {
      setError("Please login first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reports");
      }

      setReports(Array.isArray(data.reports) ? data.reports : []);
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function updateStatus(reportId, status) {
    const action = status === "Approved" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this report?`)) {
      return;
    }

    setError("");
    setUpdatingId(reportId);

    try {
      const response = await fetch(
        `${API_URL}/api/reports/${encodeURIComponent(reportId)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed");
      }

      await loadReports();

      setSelectedReport((current) =>
        current?.reportId === reportId
          ? { ...current, status }
          : current
      );
    } catch (err) {
      setError(err.message || "Status update failed");
    } finally {
      setUpdatingId("");
    }
  }

  const pending = reports.filter(
    (r) => r.status === "Pending Review"
  ).length;

  const approved = reports.filter(
    (r) => r.status === "Approved"
  ).length;

  const rejected = reports.filter(
    (r) => r.status === "Rejected"
  ).length;

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports
      .filter((report) => {
        const matchesFilter =
          filter === "All" || report.status === filter;

        const searchableText = [
          report.reportId,
          report.userName,
          report.userMobile,
          report.violationType,
          report.description,
          report.location,
          report.fileName
        ].filter(Boolean).join(" ").toLowerCase();

        return matchesFilter && searchableText.includes(query);
      })
      .sort((a, b) => {
        const dateA = getDate(a)?.getTime() || 0;
        const dateB = getDate(b)?.getTime() || 0;
        return dateB - dateA;
      });
  }, [reports, filter, search]);

  const analytics = useMemo(() => {
    const now = new Date();

    const todayStart = new Date(
      now.getFullYear(), now.getMonth(), now.getDate()
    );

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const monthStart = new Date(
      now.getFullYear(), now.getMonth(), 1
    );

    const validDates = reports
      .map(getDate)
      .filter(Boolean);

    return {
      today: validDates.filter((date) => date >= todayStart).length,
      week: validDates.filter((date) => date >= weekStart).length,
      month: validDates.filter((date) => date >= monthStart).length
    };
  }, [reports]);

  const statCards = [
    {
      title: "Total Reports",
      value: reports.length,
      icon: "file",
      theme: "purple"
    },
    {
      title: "Pending Review",
      value: pending,
      icon: "clock",
      theme: "orange"
    },
    {
      title: "Approved",
      value: approved,
      icon: "check",
      theme: "green"
    },
    {
      title: "Rejected",
      value: rejected,
      icon: "reject",
      theme: "red"
    }
  ];

  const maxAnalytics = Math.max(
    analytics.today,
    analytics.week,
    analytics.month,
    1
  );

  return (
    <div className="authority-dashboard">

      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">ADMINISTRATION / OVERVIEW</span>
          <h1>Authority Dashboard</h1>
          <p className="subtitle">
            Monitor, review and manage parking violation reports.
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={loadReports}
          disabled={loading}
        >
          <Icon name="refresh" size={17}/>
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <div className="dashboard-stats modern-stats">
        {statCards.map((stat) => (
          <div className={`modern-stat-card ${stat.theme}`} key={stat.title}>
            <div className="stat-top">
              <span>{stat.title}</span>
              <div className="stat-icon">
                <Icon name={stat.icon} size={21}/>
              </div>
            </div>
            <strong className="stat-number">{stat.value}</strong>
            <small>Live report records</small>
          </div>
        ))}
      </div>

      <section className="analytics-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">REPORT ACTIVITY</span>
            <h2>Analytics Overview</h2>
            <p>Report submissions across different time periods.</p>
          </div>
          <div className="analytics-icon">
            <Icon name="chart" size={23}/>
          </div>
        </div>

        <div className="analytics-grid">
          {[
            { label: "Today", value: analytics.today, color: "today" },
            { label: "Last 7 Days", value: analytics.week, color: "week" },
            { label: "This Month", value: analytics.month, color: "month" }
          ].map((item) => (
            <div className="analytics-item" key={item.label}>
              <div className="analytics-item-top">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="analytics-track">
                <div
                  className={`analytics-fill ${item.color}`}
                  style={{
                    width: `${(item.value / maxAnalytics) * 100}%`
                  }}
                />
              </div>
              <small>Submitted reports</small>
            </div>
          ))}
        </div>
      </section>

      <section className="reports-panel">
        <div className="panel-heading reports-panel-heading">
          <div>
            <span className="eyebrow">CASE MANAGEMENT</span>
            <h2>Violation Reports</h2>
            <p>Search and review all submitted parking violations.</p>
          </div>
          <div className="report-count">
            {filteredReports.length} results
          </div>
        </div>

        <div className="report-toolbar">
          <div className="report-search">
            <Icon name="search" size={19}/>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, reporter, mobile, location..."
              aria-label="Search reports"
            />
          </div>

          <select
            className="report-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter reports by status"
          >
            <option value="All">All Reports</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {loading && reports.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon"><Icon name="refresh" size={26}/></div>
            <h3>Loading reports...</h3>
            <p>Please wait while we fetch the latest records.</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon"><Icon name="file" size={26}/></div>
            <h3>No reports found</h3>
            <p>
              {search || filter !== "All"
                ? "Try changing your search or filter."
                : "Submitted violation reports will appear here."}
            </p>
          </div>
        ) : (
          <div className="reports-list">
            {filteredReports.map((report) => (
              <article className="report-item" key={report.reportId}>
                <div className="report-item-main">
                  <div className="report-item-heading">
                    <div>
                      <span className="report-id">{report.reportId}</span>
                      <h3>{report.violationType || "Parking Violation"}</h3>
                    </div>
                    <StatusBadge status={report.status}/>
                  </div>

                  <div className="report-meta-grid">
                    <div>
                      <span>Submitted By</span>
                      <strong>{report.userName || "Not available"}</strong>
                    </div>
                    <div>
                      <span>Mobile Number</span>
                      <strong>{report.userMobile || "Not available"}</strong>
                    </div>
                    <div>
                      <span>Location</span>
                      <strong>{report.location || "Not available"}</strong>
                    </div>
                    <div>
                      <span>Submitted On</span>
                      <strong>{formatDate(report.submittedAt)}</strong>
                    </div>
                  </div>

                  <div className="report-item-footer">
                    <button
                      className="view-report-button"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Icon name="eye" size={17}/>
                      View Details
                    </button>

                    {report.status === "Pending Review" && (
                      <div className="report-actions">
                        <button
                          className="approve-button"
                          onClick={() => updateStatus(report.reportId, "Approved")}
                          disabled={updatingId === report.reportId}
                        >
                          {updatingId === report.reportId ? "Updating..." : "Approve"}
                        </button>

                        <button
                          className="reject-button"
                          onClick={() => updateStatus(report.reportId, "Rejected")}
                          disabled={updatingId === report.reportId}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedReport && (
        <div
          className="report-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedReport(null);
          }}
        >
          <div className="report-modal">
            <div className="report-modal-header">
              <div>
                <span className="eyebrow">REPORT DETAILS</span>
                <h2>{selectedReport.reportId}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedReport(null)}
                aria-label="Close report details"
              >
                <Icon name="close" size={21}/>
              </button>
            </div>

            <div className="report-modal-content">
              <div className="modal-status-row">
                <span>Current Status</span>
                <StatusBadge status={selectedReport.status}/>
              </div>

              <h3>Violation Information</h3>
              <div className="detail-grid">
                <div>
                  <span>Violation Type</span>
                  <strong>{selectedReport.violationType || "Not available"}</strong>
                </div>
                <div>
                  <span>Submitted Date</span>
                  <strong>{formatDate(selectedReport.submittedAt)}</strong>
                </div>
                <div className="detail-full">
                  <span>Description</span>
                  <strong>{selectedReport.description || "No description provided"}</strong>
                </div>
              </div>

              <h3>Reporter Information</h3>
              <div className="detail-grid">
                <div>
                  <span>Name</span>
                  <strong>{selectedReport.userName || "Not available"}</strong>
                </div>
                <div>
                  <span>Mobile</span>
                  <strong>{selectedReport.userMobile || "Not available"}</strong>
                </div>
              </div>

              <h3>Location & Evidence</h3>
              <div className="detail-grid">
                <div className="detail-full">
                  <span>Address / Location</span>
                  <strong>{selectedReport.location || "Not available"}</strong>
                </div>
                <div className="detail-full">
                  <span>GPS Coordinates</span>
                  <strong>{selectedReport.coordinates || "Not available"}</strong>
                </div>
                <div className="detail-full">
                  <span>Evidence File</span>
                  <strong>{selectedReport.fileName || "No evidence filename recorded"}</strong>
                </div>
              </div>

              {selectedReport.coordinates && (
                <a
                  className="map-link"
                  href={`https://www.google.com/maps?q=${encodeURIComponent(selectedReport.coordinates)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="map" size={17}/>
                  Open location in Google Maps
                </a>
              )}

              <p className="evidence-note">
                Evidence preview is not available yet. The current prototype stores
                the submitted filename only, not the actual photo or video.
              </p>
            </div>

            {selectedReport.status === "Pending Review" && (
              <div className="report-modal-actions">
                <button
                  className="approve-button"
                  disabled={updatingId === selectedReport.reportId}
                  onClick={() => updateStatus(selectedReport.reportId, "Approved")}
                >
                  Approve Report
                </button>
                <button
                  className="reject-button"
                  disabled={updatingId === selectedReport.reportId}
                  onClick={() => updateStatus(selectedReport.reportId, "Rejected")}
                >
                  Reject Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
  