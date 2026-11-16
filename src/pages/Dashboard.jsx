import {
  useEffect,
  useMemo,
  useState
} from "react";

const API_URL =
  "https://parksafe-backend-s51i.onrender.com";

/* =========================================================
   ICONS
========================================================= */

function Icon({
  name,
  size = 20
}) {
  const paths = {
    search: (
      <>
        <circle
          cx="11"
          cy="11"
          r="7"
        />
        <path d="m20 20-4-4" />
      </>
    ),

    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.6 9a7 7 0 0 1 11.5-2L20 12M4 12l2.9 5a7 7 0 0 0 11.5-2" />
      </>
    ),

    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </>
    ),

    clock: (
      <>
        <circle
          cx="12"
          cy="12"
          r="9"
        />
        <path d="M12 7v5l3 2" />
      </>
    ),

    check: (
      <>
        <circle
          cx="12"
          cy="12"
          r="9"
        />
        <path d="m8 12 3 3 5-6" />
      </>
    ),

    reject: (
      <>
        <circle
          cx="12"
          cy="12"
          r="9"
        />
        <path d="m9 9 6 6m0-6-6 6" />
      </>
    ),

    calendar: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),

    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
        <path d="M9 3v15m6-12v15" />
      </>
    ),

    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),

    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle
          cx="12"
          cy="12"
          r="3"
        />
      </>
    ),

    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 3 6-7" />
      </>
    ),

    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle
          cx="12"
          cy="10"
          r="2.5"
        />
      </>
    ),

    message: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
      </>
    ),

    car: (
      <>
        <path d="M5 17h14l1-5-2-5H6l-2 5 1 5Z" />
        <path d="M4 12h16" />
        <path d="M7 17v2M17 17v2" />
        <circle
          cx="7.5"
          cy="16.5"
          r="1"
        />
        <circle
          cx="16.5"
          cy="16.5"
          r="1"
        />
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
      {paths[name]}
    </svg>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getDate(report) {
  if (!report?.submittedAt) {
    return null;
  }

  const date =
    new Date(
      report.submittedAt
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function formatEvidenceSize(
  bytes
) {
  if (!bytes) {
    return "Not available";
  }

  const size =
    Number(bytes);

  if (
    Number.isNaN(size)
  ) {
    return "Not available";
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status
}) {
  const normalizedStatus =
    status || "Pending Review";

  const className =
    normalizedStatus ===
    "Approved"
      ? "report-status approved"
      : normalizedStatus ===
        "Rejected"
      ? "report-status rejected"
      : "report-status pending";

  return (
    <span className={className}>
      {normalizedStatus}
    </span>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const [
    reports,
    setReports
  ] = useState([]);

  const [
    filter,
    setFilter
  ] = useState("All");

  const [
    search,
    setSearch
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    updatingId,
    setUpdatingId
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const [
    success,
    setSuccess
  ] = useState("");

  const [
    selectedReport,
    setSelectedReport
  ] = useState(null);

  const [
    decisionReport,
    setDecisionReport
  ] = useState(null);

  const [
    decisionStatus,
    setDecisionStatus
  ] = useState("");

  const [
    remark,
    setRemark
  ] = useState("");

  const token =
    localStorage.getItem(
      "parksafeToken"
    );

  /* =======================================================
     LOAD REPORTS
  ======================================================= */

  async function loadReports() {
    if (!token) {
      setError(
        "Please login first."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `${API_URL}/api/reports`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to load reports"
        );
      }

      setReports(
        Array.isArray(
          data.reports
        )
          ? data.reports
          : []
      );
    } catch (err) {
      setError(
        err.message ||
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  /* =======================================================
     OPEN DECISION
  ======================================================= */

  function openDecision(
    report,
    status
  ) {
    setDecisionReport(
      report
    );

    setDecisionStatus(
      status
    );

    setRemark("");
    setError("");
    setSuccess("");
  }

  function closeDecision() {
    if (updatingId) {
      return;
    }

    setDecisionReport(null);
    setDecisionStatus("");
    setRemark("");
  }

  /* =======================================================
     APPROVE / REJECT
  ======================================================= */

  async function submitDecision(
    event
  ) {
    event.preventDefault();

    if (!decisionReport) {
      return;
    }

    const cleanRemark =
      remark.trim();

    if (
      cleanRemark.length >
      1000
    ) {
      setError(
        "Remark cannot exceed 1000 characters."
      );

      return;
    }

    const reportId =
      decisionReport.reportId;

    setError("");
    setSuccess("");
    setUpdatingId(
      reportId
    );

    try {
      const response =
        await fetch(
          `${API_URL}/api/reports/${encodeURIComponent(
            reportId
          )}/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body:
              JSON.stringify({
                status:
                  decisionStatus,

                remark:
                  cleanRemark
              })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Status update failed"
        );
      }

      const updatedReport = {
        ...decisionReport,

        status:
          decisionStatus,

        authorityRemark:
          cleanRemark || null,

        reviewedAt:
          data.report
            ?.reviewedAt ||
          new Date()
            .toISOString()
      };

      setReports(
        (current) =>
          current.map(
            (report) =>
              report.reportId ===
              reportId
                ? updatedReport
                : report
          )
      );

      setSelectedReport(
        (current) =>
          current?.reportId ===
          reportId
            ? updatedReport
            : current
      );

      setDecisionReport(
        null
      );

      setDecisionStatus("");
      setRemark("");

      setSuccess(
        `Report ${decisionStatus.toLowerCase()} successfully.`
      );

      await loadReports();
    } catch (err) {
      setError(
        err.message ||
        "Status update failed"
      );
    } finally {
      setUpdatingId("");
    }
  }

  /* =======================================================
     STATS
  ======================================================= */

  const pending =
    reports.filter(
      (report) =>
        !report.status ||
        report.status ===
          "Pending Review" ||
        report.status ===
          "Pending"
    ).length;

  const approved =
    reports.filter(
      (report) =>
        report.status ===
        "Approved"
    ).length;

  const rejected =
    reports.filter(
      (report) =>
        report.status ===
        "Rejected"
    ).length;

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const filteredReports =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return reports
        .filter(
          (report) => {
            const reportStatus =
              report.status ||
              "Pending Review";

            const matchesFilter =
              filter === "All" ||
              reportStatus ===
                filter ||
              (
                filter ===
                  "Pending Review" &&
                reportStatus ===
                  "Pending"
              );

            const searchableText =
              [
                report.reportId,

                /* VEHICLE */

                report.vehicleNumber,
                report.vehicleType,
                report.vehicleModel,
                report.ownerReference,

                /* REPORTER */

                report.userName,
                report.userMobile,

                /* REPORT */

                report.violationType,
                report.description,
                report.location,
                report.fileName
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return (
              matchesFilter &&
              searchableText.includes(
                query
              )
            );
          }
        )
        .sort(
          (a, b) => {
            const dateA =
              getDate(a)
                ?.getTime() ||
              0;

            const dateB =
              getDate(b)
                ?.getTime() ||
              0;

            return (
              dateB -
              dateA
            );
          }
        );
    }, [
      reports,
      filter,
      search
    ]);

  /* =======================================================
     ANALYTICS
  ======================================================= */

  const analytics =
    useMemo(() => {
      const now =
        new Date();

      const todayStart =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

      const weekStart =
        new Date(
          todayStart
        );

      weekStart.setDate(
        weekStart.getDate() -
          6
      );

      const monthStart =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

      const validDates =
        reports
          .map(getDate)
          .filter(Boolean);

      return {
        today:
          validDates.filter(
            (date) =>
              date >=
              todayStart
          ).length,

        week:
          validDates.filter(
            (date) =>
              date >=
              weekStart
          ).length,

        month:
          validDates.filter(
            (date) =>
              date >=
              monthStart
          ).length
      };
    }, [reports]);

  const statCards = [
    {
      title:
        "Total Reports",

      value:
        reports.length,

      icon:
        "file",

      theme:
        "purple",

      description:
        "All submitted cases"
    },

    {
      title:
        "Pending Review",

      value:
        pending,

      icon:
        "clock",

      theme:
        "orange",

      description:
        "Require your attention"
    },

    {
      title:
        "Approved",

      value:
        approved,

      icon:
        "check",

      theme:
        "green",

      description:
        "Verified violations"
    },

    {
      title:
        "Rejected",

      value:
        rejected,

      icon:
        "reject",

      theme:
        "red",

      description:
        "Reports not accepted"
    }
  ];

  const maxAnalytics =
    Math.max(
      analytics.today,
      analytics.week,
      analytics.month,
      1
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="authority-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-welcome">

        <div>

          <span className="eyebrow">
            ADMINISTRATION / OVERVIEW
          </span>

          <h1>
            Authority Dashboard
          </h1>

          <p className="subtitle">
            Monitor, review and manage
            parking violation reports.
          </p>

        </div>

        <button
          className="dashboard-refresh"
          onClick={loadReports}
          disabled={loading}
        >
          <Icon
            name="refresh"
            size={17}
          />

          {loading
            ? "Refreshing..."
            : "Refresh Data"}
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div
          className="dashboard-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div
          className="dashboard-success"
          role="status"
        >
          {success}
        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="dashboard-stats modern-stats">

        {statCards.map(
          (stat) => (
            <div
              className={`modern-stat-card ${stat.theme}`}
              key={
                stat.title
              }
            >

              <div className="stat-top">

                <span>
                  {stat.title}
                </span>

                <div className="stat-icon">
                  <Icon
                    name={
                      stat.icon
                    }
                    size={21}
                  />
                </div>

              </div>

              <strong className="stat-number">
                {stat.value}
              </strong>

              <small>
                {stat.description}
              </small>

            </div>
          )
        )}

      </div>

      {/* =================================================
          ANALYTICS
      ================================================= */}

      <section className="analytics-panel">

        <div className="panel-heading">

          <div>

            <span className="eyebrow">
              REPORT ACTIVITY
            </span>

            <h2>
              Analytics Overview
            </h2>

            <p>
              Understand reporting activity
              across different periods.
            </p>

          </div>

          <div className="analytics-icon">
            <Icon
              name="chart"
              size={23}
            />
          </div>

        </div>

        <div className="analytics-grid">

          {[
            {
              label:
                "Today",

              value:
                analytics.today,

              color:
                "today"
            },

            {
              label:
                "Last 7 Days",

              value:
                analytics.week,

              color:
                "week"
            },

            {
              label:
                "This Month",

              value:
                analytics.month,

              color:
                "month"
            }
          ].map(
            (item) => (
              <div
                className="analytics-item"
                key={
                  item.label
                }
              >

                <div className="analytics-item-top">

                  <span>
                    {item.label}
                  </span>

                  <strong>
                    {item.value}
                  </strong>

                </div>

                <div className="analytics-track">

                  <div
                    className={`analytics-fill ${item.color}`}
                    style={{
                      width:
                        `${(
                          item.value /
                          maxAnalytics
                        ) *
                        100}%`
                    }}
                  />

                </div>

                <small>
                  Submitted reports
                </small>

              </div>
            )
          )}

        </div>

      </section>

      {/* =================================================
          CASE MANAGEMENT
      ================================================= */}

      <section className="reports-panel">

        <div className="panel-heading reports-panel-heading">

          <div>

            <span className="eyebrow">
              CASE MANAGEMENT
            </span>

            <h2>
              Violation Reports
            </h2>

            <p>
              Search, inspect and make
              decisions on submitted reports.
            </p>

          </div>

          <div className="report-count">
            {filteredReports.length}{" "}
            results
          </div>

        </div>

        {/* TOOLBAR */}

        <div className="report-toolbar">

          <div className="report-search">

            <Icon
              name="search"
              size={19}
            />

            <input
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search report ID, vehicle number, reporter, location..."
              aria-label="Search reports"
            />

          </div>

          <select
            className="report-filter"
            value={filter}
            onChange={(
              event
            ) =>
              setFilter(
                event.target.value
              )
            }
            aria-label="Filter reports by status"
          >
            <option value="All">
              All Reports
            </option>

            <option value="Pending Review">
              Pending Review
            </option>

            <option value="Approved">
              Approved
            </option>

            <option value="Rejected">
              Rejected
            </option>
          </select>

        </div>

        {/* LOADING */}

        {loading &&
        reports.length === 0 ? (
          <div className="dashboard-empty">

            <div className="empty-icon">
              <Icon
                name="refresh"
                size={26}
              />
            </div>

            <h3>
              Loading reports...
            </h3>

            <p>
              Please wait while we fetch
              the latest records.
            </p>

          </div>
        ) : filteredReports.length ===
          0 ? (
          <div className="dashboard-empty">

            <div className="empty-icon">
              <Icon
                name="file"
                size={26}
              />
            </div>

            <h3>
              No reports found
            </h3>

            <p>
              {search ||
              filter !== "All"
                ? "Try changing your search or filter."
                : "Submitted violation reports will appear here."}
            </p>

          </div>
        ) : (
          <div className="reports-list">

            {filteredReports.map(
              (report) => (
                <article
                  className="report-item"
                  key={
                    report.reportId
                  }
                >

                  <div className="report-item-main">

                    {/* HEADING */}

                    <div className="report-item-heading">

                      <div>

                        <span className="report-id">
                          {
                            report.reportId
                          }
                        </span>

                        <h3>
                          {report.violationType ||
                            "Parking Violation"}
                        </h3>

                      </div>

                      <StatusBadge
                        status={
                          report.status
                        }
                      />

                    </div>

                    {/* =====================================
                        REPORTED VEHICLE
                    ===================================== */}

                    <div className="authority-reported-vehicle">

                      <div className="authority-vehicle-icon">
                        <Icon
                          name="car"
                          size={21}
                        />
                      </div>

                      <div className="authority-vehicle-main">

                        <span>
                          REPORTED VEHICLE
                        </span>

                        <strong>
                          {report.vehicleNumber ||
                            "Vehicle not linked"}
                        </strong>

                        {(report.vehicleModel ||
                          report.vehicleType) && (
                          <small>
                            {report.vehicleModel ||
                              "Registered Vehicle"}

                            {report.vehicleType
                              ? ` • ${report.vehicleType}`
                              : ""}
                          </small>
                        )}

                      </div>

                      {report.vehicleNumber && (
                        <span className="authority-vehicle-badge">
                          <span />
                          VERIFIED
                        </span>
                      )}

                    </div>

                    {/* META */}

                    <div className="report-meta-grid">

                      <div>
                        <span>
                          Submitted By
                        </span>

                        <strong>
                          {report.userName ||
                            "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Mobile Number
                        </span>

                        <strong>
                          {report.userMobile ||
                            "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Location
                        </span>

                        <strong>
                          {report.location ||
                            "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Submitted On
                        </span>

                        <strong>
                          {formatDate(
                            report.submittedAt
                          )}
                        </strong>
                      </div>

                    </div>

                    {/* REMARK */}

                    {report.authorityRemark && (
                      <div className="report-remark-preview">

                        <Icon
                          name="message"
                          size={17}
                        />

                        <div>

                          <strong>
                            Authority Remark
                          </strong>

                          <p>
                            {
                              report.authorityRemark
                            }
                          </p>

                        </div>

                      </div>
                    )}

                    {/* FOOTER */}

                    <div className="report-item-footer">

                      <button
                        className="view-report-button"
                        onClick={() =>
                          setSelectedReport(
                            report
                          )
                        }
                      >
                        <Icon
                          name="eye"
                          size={17}
                        />

                        View Details
                      </button>

                      {(
                        !report.status ||
                        report.status ===
                          "Pending Review" ||
                        report.status ===
                          "Pending"
                      ) && (
                        <div className="report-actions">

                          <button
                            className="approve-button"
                            onClick={() =>
                              openDecision(
                                report,
                                "Approved"
                              )
                            }
                            disabled={
                              updatingId ===
                              report.reportId
                            }
                          >
                            Approve
                          </button>

                          <button
                            className="reject-button"
                            onClick={() =>
                              openDecision(
                                report,
                                "Rejected"
                              )
                            }
                            disabled={
                              updatingId ===
                              report.reportId
                            }
                          >
                            Reject
                          </button>

                        </div>
                      )}

                    </div>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>

      {/* =================================================
          REPORT DETAILS MODAL
      ================================================= */}

      {selectedReport && (
        <div
          className="report-modal-backdrop"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedReport(
                null
              );
            }
          }}
        >

          <div className="report-modal">

            {/* MODAL HEADER */}

            <div className="report-modal-header">

              <div>

                <span className="eyebrow">
                  REPORT DETAILS
                </span>

                <h2>
                  {
                    selectedReport.reportId
                  }
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedReport(
                    null
                  )
                }
                aria-label="Close report details"
              >
                <Icon
                  name="close"
                  size={21}
                />
              </button>

            </div>

            <div className="report-modal-content">

              {/* STATUS */}

              <div className="modal-status-row">

                <span>
                  Current Status
                </span>

                <StatusBadge
                  status={
                    selectedReport.status
                  }
                />

              </div>

              {/* =========================================
                  REPORTED VEHICLE
              ========================================= */}

              <h3>
                Reported Vehicle
              </h3>

              <div className="authority-vehicle-detail-card">

                <div className="authority-vehicle-detail-head">

                  <div className="authority-vehicle-detail-icon">
                    <Icon
                      name="car"
                      size={24}
                    />
                  </div>

                  <div>

                    <span>
                      REGISTRATION NUMBER
                    </span>

                    <strong>
                      {selectedReport.vehicleNumber ||
                        "Vehicle not linked"}
                    </strong>

                    {(selectedReport.vehicleModel ||
                      selectedReport.vehicleType) && (
                      <p>
                        {selectedReport.vehicleModel ||
                          "Registered Vehicle"}

                        {selectedReport.vehicleType
                          ? ` • ${selectedReport.vehicleType}`
                          : ""}
                      </p>
                    )}

                  </div>

                  {selectedReport.vehicleNumber && (
                    <span className="authority-vehicle-verified">
                      <span />
                      VERIFIED
                    </span>
                  )}

                </div>

                <div className="authority-vehicle-detail-grid">

                  <div>

                    <span>
                      VEHICLE NUMBER
                    </span>

                    <strong>
                      {selectedReport.vehicleNumber ||
                        "Not available"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      VEHICLE TYPE
                    </span>

                    <strong>
                      {selectedReport.vehicleType ||
                        "Not available"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      MODEL
                    </span>

                    <strong>
                      {selectedReport.vehicleModel ||
                        "Not available"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      OWNER REFERENCE
                    </span>

                    <strong>
                      {selectedReport.ownerReference ||
                        "Not available"}
                    </strong>

                  </div>

                </div>

              </div>

              {/* =========================================
                  VIOLATION
              ========================================= */}

              <h3>
                Violation Information
              </h3>

              <div className="detail-grid">

                <div>

                  <span>
                    Violation Type
                  </span>

                  <strong>
                    {selectedReport.violationType ||
                      "Not available"}
                  </strong>

                </div>

                <div>

                  <span>
                    Submitted Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedReport.submittedAt
                    )}
                  </strong>

                </div>

                <div className="detail-full">

                  <span>
                    Description
                  </span>

                  <strong>
                    {selectedReport.description ||
                      "No description provided"}
                  </strong>

                </div>

              </div>

              {/* =========================================
                  REPORTER
              ========================================= */}

              <h3>
                Reporter Information
              </h3>

              <div className="detail-grid">

                <div>

                  <span>
                    Name
                  </span>

                  <strong>
                    {selectedReport.userName ||
                      "Not available"}
                  </strong>

                </div>

                <div>

                  <span>
                    Mobile
                  </span>

                  <strong>
                    {selectedReport.userMobile ||
                      "Not available"}
                  </strong>

                </div>

              </div>

              {/* =========================================
                  LOCATION
              ========================================= */}

              <h3>
                Location & Evidence
              </h3>

              <div className="detail-grid">

                <div className="detail-full">

                  <span>
                    Address / Location
                  </span>

                  <strong>
                    {selectedReport.location ||
                      "Not available"}
                  </strong>

                </div>

                <div className="detail-full">

                  <span>
                    GPS Coordinates
                  </span>

                  <strong>
                    {selectedReport.coordinates ||
                      "Not available"}
                  </strong>

                </div>

                <div className="detail-full">

                  <span>
                    Evidence File
                  </span>

                  <strong>
                    {selectedReport.fileName ||
                      "No evidence attached"}
                  </strong>

                </div>

                {selectedReport.evidenceType && (
                  <div>

                    <span>
                      Evidence Type
                    </span>

                    <strong>
                      {selectedReport.evidenceType.startsWith(
                        "image/"
                      )
                        ? "Photo Evidence"
                        : selectedReport.evidenceType.startsWith(
                            "video/"
                          )
                        ? "Video Evidence"
                        : selectedReport.evidenceType}
                    </strong>

                  </div>
                )}

                {selectedReport.evidenceSize && (
                  <div>

                    <span>
                      File Size
                    </span>

                    <strong>
                      {formatEvidenceSize(
                        selectedReport.evidenceSize
                      )}
                    </strong>

                  </div>
                )}

              </div>

              {/* GOOGLE MAP */}

              {selectedReport.coordinates && (
                <a
                  className="map-link"
                  href={`https://www.google.com/maps?q=${encodeURIComponent(
                    selectedReport.coordinates
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon
                    name="map"
                    size={17}
                  />

                  Open location in Google Maps
                </a>
              )}

              {/* =========================================
                  ACTUAL EVIDENCE PREVIEW
              ========================================= */}

              {selectedReport.evidenceUrl ? (
                <div className="authority-evidence-section">

                  <div className="authority-evidence-heading">

                    <div>

                      <span className="eyebrow">
                        SECURE EVIDENCE
                      </span>

                      <h3>
                        Submitted Evidence
                      </h3>

                      <p>
                        Evidence uploaded by
                        the reporting user.
                      </p>

                    </div>

                    <span className="authority-evidence-secure">
                      <span />
                      PRIVATE
                    </span>

                  </div>

                  {/* IMAGE */}

                  {selectedReport.evidenceType?.startsWith(
                    "image/"
                  ) && (
                    <div className="authority-image-preview">

                      <img
                        src={
                          selectedReport.evidenceUrl
                        }
                        alt={`Evidence for ${selectedReport.reportId}`}
                      />

                      <div className="authority-evidence-overlay">

                        <span>
                          PHOTO EVIDENCE
                        </span>

                        <strong>
                          {selectedReport.fileName}
                        </strong>

                      </div>

                    </div>
                  )}

                  {/* VIDEO */}

                  {selectedReport.evidenceType?.startsWith(
                    "video/"
                  ) && (
                    <div className="authority-video-preview">

                      <video
                        controls
                        preload="metadata"
                        src={
                          selectedReport.evidenceUrl
                        }
                      >
                        Your browser does not
                        support video playback.
                      </video>

                      <div className="authority-video-information">

                        <span>
                          VIDEO EVIDENCE
                        </span>

                        <strong>
                          {selectedReport.fileName}
                        </strong>

                      </div>

                    </div>
                  )}

                  {/* UNKNOWN */}

                  {!selectedReport.evidenceType?.startsWith(
                    "image/"
                  ) &&
                    !selectedReport.evidenceType?.startsWith(
                      "video/"
                    ) && (
                      <div className="authority-unknown-evidence">

                        <Icon
                          name="file"
                          size={25}
                        />

                        <div>

                          <strong>
                            Evidence Attached
                          </strong>

                          <p>
                            {
                              selectedReport.fileName
                            }
                          </p>

                        </div>

                      </div>
                    )}

                  {/* FILE INFO */}

                  <div className="authority-evidence-info">

                    <div>

                      <span>
                        FILE NAME
                      </span>

                      <strong>
                        {selectedReport.fileName ||
                          "Evidence"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        TYPE
                      </span>

                      <strong>
                        {selectedReport.evidenceType ||
                          "Unknown"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        SIZE
                      </span>

                      <strong>
                        {formatEvidenceSize(
                          selectedReport.evidenceSize
                        )}
                      </strong>

                    </div>

                  </div>

                  {/* FULL VIEW */}

                  <a
                    href={
                      selectedReport.evidenceUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="authority-view-evidence-button"
                  >
                    <Icon
                      name="eye"
                      size={18}
                    />

                    View Full Evidence

                    <span>
                      ↗
                    </span>
                  </a>

                  <p className="authority-evidence-expiry">
                    🔒 Evidence is securely
                    loaded using a temporary
                    private access link.
                    Refresh reports if the
                    link expires.
                  </p>

                </div>
              ) : (
                <div className="authority-no-evidence">

                  <div className="authority-no-evidence-icon">
                    <Icon
                      name="file"
                      size={23}
                    />
                  </div>

                  <div>

                    <strong>
                      No Evidence Attached
                    </strong>

                    <p>
                      This report does not
                      contain uploaded photo
                      or video evidence.
                    </p>

                  </div>

                </div>
              )}

              {/* =========================================
                  AUTHORITY REMARK
              ========================================= */}

              {selectedReport.authorityRemark && (
                <div className="report-remark-preview detail-remark">

                  <Icon
                    name="message"
                    size={18}
                  />

                  <div>

                    <strong>
                      Authority's Review Remark
                    </strong>

                    <p>
                      {
                        selectedReport.authorityRemark
                      }
                    </p>

                    {selectedReport.reviewedAt && (
                      <small>
                        Reviewed on{" "}
                        {formatDate(
                          selectedReport.reviewedAt
                        )}
                      </small>
                    )}

                    {selectedReport.reviewedByName && (
                      <small>
                        Reviewed by{" "}
                        {
                          selectedReport.reviewedByName
                        }
                      </small>
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* MODAL ACTIONS */}

            {(
              !selectedReport.status ||
              selectedReport.status ===
                "Pending Review" ||
              selectedReport.status ===
                "Pending"
            ) && (
              <div className="report-modal-actions">

                <button
                  className="approve-button"
                  onClick={() =>
                    openDecision(
                      selectedReport,
                      "Approved"
                    )
                  }
                >
                  Approve Report
                </button>

                <button
                  className="reject-button"
                  onClick={() =>
                    openDecision(
                      selectedReport,
                      "Rejected"
                    )
                  }
                >
                  Reject Report
                </button>

              </div>
            )}

          </div>

        </div>
      )}

      {/* =================================================
          APPROVE / REJECT MODAL
      ================================================= */}

      {decisionReport && (
        <div
          className="report-modal-backdrop decision-backdrop"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDecision();
            }
          }}
        >

          <div className="report-modal decision-modal">

            <div className="report-modal-header">

              <div>

                <span className="eyebrow">
                  AUTHORITY REVIEW
                </span>

                <h2>
                  {decisionStatus ===
                  "Approved"
                    ? "Approve Report"
                    : "Reject Report"}
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={
                  closeDecision
                }
                disabled={
                  Boolean(
                    updatingId
                  )
                }
                aria-label="Close review dialog"
              >
                <Icon
                  name="close"
                  size={21}
                />
              </button>

            </div>

            <form
              onSubmit={
                submitDecision
              }
            >

              <div className="report-modal-content">

                <p className="decision-report-id">
                  Report ID:{" "}

                  <strong>
                    {
                      decisionReport.reportId
                    }
                  </strong>
                </p>

                {/* VEHICLE IN DECISION */}

                {decisionReport.vehicleNumber && (
                  <div className="authority-reported-vehicle">

                    <div className="authority-vehicle-icon">
                      <Icon
                        name="car"
                        size={20}
                      />
                    </div>

                    <div className="authority-vehicle-main">

                      <span>
                        REPORTED VEHICLE
                      </span>

                      <strong>
                        {
                          decisionReport.vehicleNumber
                        }
                      </strong>

                      <small>
                        {decisionReport.vehicleModel ||
                          "Registered Vehicle"}

                        {decisionReport.vehicleType
                          ? ` • ${decisionReport.vehicleType}`
                          : ""}
                      </small>

                    </div>

                  </div>
                )}

                <div
                  className={`decision-notice ${
                    decisionStatus ===
                    "Rejected"
                      ? "reject-notice"
                      : "approve-notice"
                  }`}
                >
                  {decisionStatus ===
                  "Rejected"
                    ? "You may add an optional remark explaining the reason for rejecting this report."
                    : "You may add an optional remark explaining this approval."}
                </div>

                <label
                  className="remark-label"
                  htmlFor="authority-remark"
                >
                  Authority Remark{" "}

                  <span className="optional-mark">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="authority-remark"
                  className="authority-remark-input"
                  value={remark}
                  onChange={(
                    event
                  ) =>
                    setRemark(
                      event.target.value
                    )
                  }
                  placeholder="Add an optional remark..."
                  rows={5}
                  maxLength={1000}
                  disabled={
                    Boolean(
                      updatingId
                    )
                  }
                />

                <div className="remark-character-count">
                  {remark.length}/1000
                  characters
                </div>

              </div>

              <div className="report-modal-actions decision-actions">

                <button
                  type="button"
                  className="view-report-button"
                  onClick={
                    closeDecision
                  }
                  disabled={
                    Boolean(
                      updatingId
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    decisionStatus ===
                    "Approved"
                      ? "approve-button"
                      : "reject-button"
                  }
                  disabled={
                    Boolean(
                      updatingId
                    )
                  }
                >
                  {updatingId
                    ? "Saving..."
                    : decisionStatus ===
                      "Approved"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}