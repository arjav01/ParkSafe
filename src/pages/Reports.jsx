import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useLocation } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";

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

/* =========================================================
   NORMALIZE VEHICLE DATA
========================================================= */

function normalizeVehicle(vehicle) {
  if (!vehicle) {
    return null;
  }

  return {
    id:
      vehicle.id ??
      vehicle.vehicleId ??
      null,

    vehicleNumber:
      vehicle.vehicleNumber ??
      vehicle.vehicle_number ??
      "",

    vehicleType:
      vehicle.vehicleType ??
      vehicle.vehicle_type ??
      "Vehicle",

    vehicleModel:
      vehicle.vehicleModel ??
      vehicle.vehicle_model ??
      "Not available",

    ownerReference:
      vehicle.ownerReference ??
      vehicle.owner_reference ??
      "",

    status:
      vehicle.status ??
      "Active"
  };
}

/* =========================================================
   REPORTS
========================================================= */

export default function Reports() {
  const routeLocation = useLocation();

  const incomingVehicle =
    routeLocation.state?.vehicle;

  const incomingSource =
    routeLocation.state?.source;

  /* =======================================================
     VEHICLE
  ======================================================= */

  const [
    selectedVehicle,
    setSelectedVehicle
  ] = useState(() =>
    normalizeVehicle(incomingVehicle)
  );

  const [
    vehicleNumber,
    setVehicleNumber
  ] = useState(
    incomingVehicle?.vehicleNumber ||
      incomingVehicle?.vehicle_number ||
      ""
  );

  const [
    vehicleSearching,
    setVehicleSearching
  ] = useState(false);

  const [
    vehicleMessage,
    setVehicleMessage
  ] = useState(
    incomingVehicle
      ? "Vehicle automatically selected from the parking alert."
      : ""
  );

  const [
    scanning,
    setScanning
  ] = useState(false);

  const scannerRef = useRef(null);

  /* =======================================================
     REPORT FORM
  ======================================================= */

  const [
    violationType,
    setViolationType
  ] = useState("Illegal Parking");

  const [
    description,
    setDescription
  ] = useState("");

  const [
    location,
    setLocation
  ] = useState("");

  const [
    coordinates,
    setCoordinates
  ] = useState("");

  const [
    file,
    setFile
  ] = useState(null);

  /* =======================================================
     PAGE STATE
  ======================================================= */

  const [
    reports,
    setReports
  ] = useState([]);

  const [
    success,
    setSuccess
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    locating,
    setLocating
  ] = useState(false);

  const [
    historyFilter,
    setHistoryFilter
  ] = useState("All");

  const token =
    localStorage.getItem("parksafeToken");

  /* =======================================================
     RECEIVE VEHICLE FROM PARKING ALERT
  ======================================================= */

  useEffect(() => {
    if (!incomingVehicle) {
      return;
    }

    const normalized =
      normalizeVehicle(incomingVehicle);

    setSelectedVehicle(normalized);

    setVehicleNumber(
      normalized?.vehicleNumber || ""
    );

    setVehicleMessage(
      "Vehicle automatically identified from your parking alert."
    );
  }, [incomingVehicle]);

  /* =======================================================
     REPORT STATS
  ======================================================= */

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

  /* =======================================================
     FILTER HISTORY
  ======================================================= */

  const filteredReports =
    useMemo(() => {
      if (historyFilter === "All") {
        return reports;
      }

      return reports.filter(
        (report) =>
          (report.status || "Pending") ===
          historyFilter
      );
    }, [
      reports,
      historyFilter
    ]);

  /* =======================================================
     LOAD REPORT HISTORY
  ======================================================= */

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
        data.reports || []
      );
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

  /* =======================================================
     MANUAL VEHICLE SEARCH
  ======================================================= */

  async function searchVehicle(
    numberToSearch = vehicleNumber
  ) {
    const cleanNumber =
      String(
        numberToSearch || ""
      )
        .trim()
        .toUpperCase();

    if (!cleanNumber) {
      setError(
        "Please enter a vehicle registration number."
      );

      return;
    }

    setVehicleSearching(true);
    setError("");
    setSuccess("");
    setVehicleMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/vehicles/${encodeURIComponent(
          cleanNumber
        )}`
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          "Vehicle not found."
        );
      }

      const vehicle =
        normalizeVehicle(
          data.vehicle
        );

      if (
        !vehicle?.id ||
        !vehicle?.vehicleNumber
      ) {
        throw new Error(
          "Vehicle record is incomplete."
        );
      }

      setSelectedVehicle(vehicle);

      setVehicleNumber(
        vehicle.vehicleNumber
      );

      setVehicleMessage(
        "Vehicle verified successfully."
      );
    } catch (err) {
      setSelectedVehicle(null);

      setError(
        err.message ===
          "Failed to fetch"
          ? "Unable to connect to the ParkSafe server."
          : err.message ||
            "Vehicle search failed."
      );
    } finally {
      setVehicleSearching(false);
    }
  }

  /* =======================================================
     FETCH VEHICLE USING QR ID
  ======================================================= */

  async function fetchVehicleById(
    vehicleId
  ) {
    const cleanId =
      String(vehicleId || "")
        .trim();

    if (!cleanId) {
      throw new Error(
        "Invalid ParkSafe QR code."
      );
    }

    setVehicleSearching(true);
    setError("");
    setSuccess("");
    setVehicleMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/vehicles/qr/${encodeURIComponent(
          cleanId
        )}`
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          "Vehicle not found."
        );
      }

      const vehicle =
        normalizeVehicle(
          data.vehicle
        );

      if (
        !vehicle?.id ||
        !vehicle?.vehicleNumber
      ) {
        throw new Error(
          "Vehicle record is incomplete."
        );
      }

      setSelectedVehicle(vehicle);

      setVehicleNumber(
        vehicle.vehicleNumber
      );

      setVehicleMessage(
        "Vehicle identified successfully from ParkSafe QR."
      );

      return vehicle;
    } finally {
      setVehicleSearching(false);
    }
  }

  /* =======================================================
     HANDLE QR RESULT
  ======================================================= */

  async function handleScannedCode(
    decodedText
  ) {
    const scanned =
      String(
        decodedText || ""
      ).trim();

    if (!scanned) {
      setError(
        "The scanned QR code is empty."
      );

      return;
    }

    setError("");

    try {
      /*
        FORMAT 1

        https://park-safe-sigma.vercel.app/scan/123
      */

      try {
        const scannedUrl =
          new URL(scanned);

        const parts =
          scannedUrl.pathname
            .split("/")
            .filter(Boolean);

        const scanIndex =
          parts.indexOf("scan");

        if (
          scanIndex !== -1 &&
          parts[scanIndex + 1]
        ) {
          const id =
            decodeURIComponent(
              parts[
                scanIndex + 1
              ]
            );

          await fetchVehicleById(
            id
          );

          return;
        }
      } catch {
        // Not a full URL.
      }

      /*
        FORMAT 2

        /scan/123
      */

      if (
        scanned.startsWith(
          "/scan/"
        )
      ) {
        const id =
          scanned
            .replace(
              "/scan/",
              ""
            )
            .split(/[?#]/)[0]
            .trim();

        await fetchVehicleById(
          decodeURIComponent(id)
        );

        return;
      }

      /*
        FORMAT 3

        PARKSAFE-DEMO:123
      */

      if (
        scanned.startsWith(
          "PARKSAFE-DEMO:"
        )
      ) {
        const id =
          scanned
            .replace(
              "PARKSAFE-DEMO:",
              ""
            )
            .trim();

        await fetchVehicleById(
          id
        );

        return;
      }

      /*
        FORMAT 4

        QR contains plain registration.
      */

      await searchVehicle(scanned);
    } catch (err) {
      setSelectedVehicle(null);

      setError(
        err.message ||
        "Unable to identify the scanned vehicle."
      );
    }
  }

  /* =======================================================
     QR SCANNER
  ======================================================= */

  useEffect(() => {
    if (!scanning) {
      return;
    }

    let active = true;

    const scanner =
      new Html5QrcodeScanner(
        "report-qr-reader",
        {
          fps: 10,

          qrbox: {
            width: 240,
            height: 240
          },

          rememberLastUsedCamera:
            true
        },
        false
      );

    scannerRef.current =
      scanner;

    scanner.render(
      async (decodedText) => {
        if (!active) {
          return;
        }

        active = false;

        try {
          await scanner.clear();
        } catch {
          // Scanner already closed.
        }

        scannerRef.current =
          null;

        setScanning(false);

        await handleScannedCode(
          decodedText
        );
      },

      () => {
        // Ignore per-frame scan failures.
      }
    );

    return () => {
      active = false;

      if (
        scannerRef.current
      ) {
        scannerRef.current
          .clear()
          .catch(() => {});

        scannerRef.current =
          null;
      }
    };
  }, [scanning]);

  /* =======================================================
     STOP QR
  ======================================================= */

  async function stopScanner() {
    setScanning(false);

    if (
      scannerRef.current
    ) {
      try {
        await scannerRef.current
          .clear();
      } catch {
        // Already cleared.
      }

      scannerRef.current =
        null;
    }
  }

  /* =======================================================
     CHANGE VEHICLE
  ======================================================= */

  async function changeVehicle() {
    await stopScanner();

    setSelectedVehicle(null);
    setVehicleNumber("");
    setVehicleMessage("");
    setError("");
    setSuccess("");
  }

  /* =======================================================
     GPS
  ======================================================= */

  function getLocation() {
    setError("");

    if (
      !navigator.geolocation
    ) {
      setError(
        "Location is not supported by this browser."
      );

      return;
    }

    setLocating(true);

    navigator.geolocation
      .getCurrentPosition(
        (position) => {
          const coords =
            `${position.coords.latitude.toFixed(
              6
            )}, ` +
            `${position.coords.longitude.toFixed(
              6
            )}`;

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

  /* =======================================================
     FILE SIZE
  ======================================================= */

  function formatFileSize(
    bytes
  ) {
    if (!bytes) {
      return "0 MB";
    }

    const mb =
      bytes /
      (1024 * 1024);

    return `${mb.toFixed(2)} MB`;
  }

  /* =======================================================
     EVIDENCE SELECT
  ======================================================= */

  function handleEvidenceChange(
    event
  ) {
    const selected =
      event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!selected) {
      setFile(null);
      return;
    }

    const isImage =
      selected.type.startsWith(
        "image/"
      );

    const isVideo =
      selected.type.startsWith(
        "video/"
      );

    if (
      !isImage &&
      !isVideo
    ) {
      setFile(null);

      event.target.value = "";

      setError(
        "Only photo or video evidence is allowed."
      );

      return;
    }

    if (
      isImage &&
      selected.size >
        IMAGE_LIMIT
    ) {
      setFile(null);

      event.target.value = "";

      setError(
        "Photo evidence must be 5 MB or smaller."
      );

      return;
    }

    if (
      isVideo &&
      selected.size >
        VIDEO_LIMIT
    ) {
      setFile(null);

      event.target.value = "";

      setError(
        "Video evidence must be 10 MB or smaller."
      );

      return;
    }

    setFile(selected);
  }

  /* =======================================================
     REMOVE EVIDENCE
  ======================================================= */

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

  /* =======================================================
     SUBMIT REPORT
  ======================================================= */

  async function submitReport(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "Please login before submitting a report."
      );

      return;
    }

    /* VEHICLE IS REQUIRED */

    if (
      !selectedVehicle?.id ||
      !selectedVehicle?.vehicleNumber
    ) {
      setError(
        "Please identify the vehicle before submitting this report."
      );

      return;
    }

    if (
      !description.trim()
    ) {
      setError(
        "Please describe the parking violation."
      );

      return;
    }

    if (!location.trim()) {
      setError(
        "Please enter the parking location."
      );

      return;
    }

    /* FILE VALIDATION */

    if (file) {
      const isImage =
        file.type.startsWith(
          "image/"
        );

      const isVideo =
        file.type.startsWith(
          "video/"
        );

      if (
        isImage &&
        file.size >
          IMAGE_LIMIT
      ) {
        setError(
          "Photo evidence must be 5 MB or smaller."
        );

        return;
      }

      if (
        isVideo &&
        file.size >
          VIDEO_LIMIT
      ) {
        setError(
          "Video evidence must be 10 MB or smaller."
        );

        return;
      }
    }

    setSubmitting(true);

    try {
      const formData =
        new FormData();

      /* VEHICLE */

      formData.append(
        "vehicleId",
        String(
          selectedVehicle.id
        )
      );

      formData.append(
        "vehicleNumber",
        selectedVehicle.vehicleNumber
      );

      /* REPORT */

      formData.append(
        "violationType",
        violationType
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "location",
        location.trim()
      );

      formData.append(
        "coordinates",
        coordinates || ""
      );

      /* EVIDENCE */

      if (file) {
        formData.append(
          "evidence",
          file
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/reports`,
          {
            method: "POST",

            headers: {
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

      setSuccess(
        data.reportId
      );

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

  /* =======================================================
     DATE
  ======================================================= */

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

  /* =======================================================
     STATUS
  ======================================================= */

  function statusClass(
    status
  ) {
    if (
      status === "Approved"
    ) {
      return "approved";
    }

    if (
      status === "Rejected"
    ) {
      return "rejected";
    }

    return "pending";
  }

  function statusIcon(
    status
  ) {
    if (
      status === "Approved"
    ) {
      return "✓";
    }

    if (
      status === "Rejected"
    ) {
      return "×";
    }

    return "◷";
  }

  /* =======================================================
     EVIDENCE LABEL
  ======================================================= */

  function evidenceLabel(
    report
  ) {
    if (
      !report.evidenceType
    ) {
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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="premium-reports-page">

      {/* AMBIENT */}

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

      {/* =================================================
          HEADER
      ================================================= */}

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
            Identify the vehicle,
            document the unresolved
            parking issue and submit
            supporting evidence for
            authority review.
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

      {/* =================================================
          HERO
      ================================================= */}

      <section className="reports-hero">

        <div className="reports-hero-copy">

          <div className="reports-hero-label">
            <span />
            RESPONSIBLE ESCALATION
          </div>

          <h2>
            Identify. Document.
            <br />

            <span>
              Report responsibly.
            </span>
          </h2>

          <p>
            ParkSafe connects every
            violation report with the
            exact registered vehicle,
            location and supporting
            evidence.
          </p>

          <div className="reports-hero-features">

            <div>
              <span>✓</span>
              Vehicle verification
            </div>

            <div>
              <span>✓</span>
              Private evidence storage
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

              {selectedVehicle
                ? "Vehicle Verified"
                : "Ready to Identify"}
            </div>

          </div>

          <div className="report-floating-card report-float-one">

            <span className="report-float-icon purple">
              🚘
            </span>

            <div>

              <small>
                VEHICLE
              </small>

              <strong>
                {selectedVehicle
                  ? selectedVehicle.vehicleNumber
                  : "Identification"}
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

      {/* =================================================
          STATS
      ================================================= */}

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

          <div>
            !
          </div>

          <div>

            <strong>
              Something needs attention
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <section className="report-success-card">

          <div className="report-success-animation">

            <span className="report-success-ring success-ring-one" />
            <span className="report-success-ring success-ring-two" />

            <div>
              ✓
            </div>

          </div>

          <div className="report-success-copy">

            <span>
              REPORT SUBMITTED
            </span>

            <h2>
              Violation report submitted
            </h2>

            <p>
              Your report for{" "}
              <strong>
                {selectedVehicle?.vehicleNumber}
              </strong>{" "}
              has been added to the
              authority review queue.
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

      {/* =================================================
          REPORT FORM
      ================================================= */}

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
              Identify the vehicle and
              provide supporting evidence.
            </p>

          </div>

          <span className="report-form-ready">
            <span />

            {selectedVehicle
              ? "VEHICLE READY"
              : "IDENTIFY VEHICLE"}
          </span>

        </div>

        <form
          onSubmit={submitReport}
          className="premium-report-form"
        >

          {/* =================================================
              01 VEHICLE
          ================================================= */}

          <div className="report-form-section report-vehicle-identification-section">

            <div className="report-form-section-title">

              <span>
                01
              </span>

              <div>

                <strong>
                  Vehicle Identification
                </strong>

                <small>
                  Identify the vehicle
                  being reported
                </small>

              </div>

            </div>

            {/* VERIFIED VEHICLE */}

            {selectedVehicle ? (
              <div className="report-verified-vehicle">

                <div className="report-verified-top">

                  <div className="report-verified-icon">
                    🚘
                  </div>

                  <div className="report-verified-heading">

                    <span>
                      {incomingSource ===
                      "parking-alert"
                        ? "VEHICLE FROM PARKING ALERT"
                        : "VERIFIED PARKSAFE VEHICLE"}
                    </span>

                    <h3>
                      {selectedVehicle.vehicleNumber}
                    </h3>

                    <p>
                      {selectedVehicle.vehicleModel}
                      {" • "}
                      {selectedVehicle.vehicleType}
                    </p>

                  </div>

                  <span className="report-verified-badge">
                    <span />
                    VERIFIED
                  </span>

                </div>

                <div className="report-verified-details">

                  <div>

                    <span>
                      REGISTRATION
                    </span>

                    <strong>
                      {selectedVehicle.vehicleNumber}
                    </strong>

                  </div>

                  <div>

                    <span>
                      VEHICLE TYPE
                    </span>

                    <strong>
                      {selectedVehicle.vehicleType}
                    </strong>

                  </div>

                  <div>

                    <span>
                      MODEL
                    </span>

                    <strong>
                      {selectedVehicle.vehicleModel}
                    </strong>

                  </div>

                  <div>

                    <span>
                      SOURCE
                    </span>

                    <strong>
                      {incomingSource ===
                      "parking-alert"
                        ? "Parking Alert"
                        : "Vehicle Search"}
                    </strong>

                  </div>

                </div>

                {vehicleMessage && (
                  <div className="report-vehicle-success-message">

                    <span>
                      ✓
                    </span>

                    {vehicleMessage}

                  </div>
                )}

                <button
                  type="button"
                  className="report-change-vehicle-button"
                  onClick={changeVehicle}
                >
                  Change Vehicle
                </button>

              </div>
            ) : (
              <div className="report-identify-vehicle">

                <div className="report-identify-intro">

                  <div className="report-identify-icon">
                    ◎
                  </div>

                  <div>

                    <h3>
                      Which vehicle are you reporting?
                    </h3>

                    <p>
                      Scan the ParkSafe QR code
                      or enter the registration
                      number manually.
                    </p>

                  </div>

                </div>

                <div className="report-identification-methods">

                  {/* =======================================
                      MANUAL SEARCH
                  ======================================= */}

                  <div className="report-identification-card">

                    <div className="report-method-heading">

                      <span className="report-method-icon">
                        ⌕
                      </span>

                      <div>

                        <strong>
                          Registration Number
                        </strong>

                        <small>
                          Search manually
                        </small>

                      </div>

                    </div>

                    {/* NO NESTED FORM */}

                    <div className="report-vehicle-search-form">

                      <div className="report-vehicle-number-input">

                        <span>
                          IN
                        </span>

                        <input
                          type="text"
                          value={vehicleNumber}
                          onChange={(event) =>
                            setVehicleNumber(
                              event.target.value
                                .toUpperCase()
                            )
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              event.preventDefault();

                              searchVehicle(
                                vehicleNumber
                              );
                            }
                          }}
                          placeholder="Example: UK01AB1234"
                          autoComplete="off"
                        />

                      </div>

                      <button
                        type="button"
                        className="report-search-vehicle-button"
                        disabled={vehicleSearching}
                        onClick={() =>
                          searchVehicle(
                            vehicleNumber
                          )
                        }
                      >

                        {vehicleSearching
                          ? "Searching..."
                          : "Search Vehicle"}

                        {!vehicleSearching && (
                          <span>
                            →
                          </span>
                        )}

                      </button>

                    </div>

                  </div>

                  {/* =======================================
                      QR SCANNER
                  ======================================= */}

                  <div className="report-identification-card report-qr-method">

                    <div className="report-method-heading">

                      <span className="report-method-icon qr">
                        ▦
                      </span>

                      <div>

                        <strong>
                          ParkSafe QR Code
                        </strong>

                        <small>
                          Scan vehicle QR
                        </small>

                      </div>

                    </div>

                    {!scanning ? (
                      <button
                        type="button"
                        className="report-start-scanner-button"
                        onClick={() => {
                          setError("");
                          setSuccess("");
                          setScanning(true);
                        }}
                      >

                        <span className="report-scanner-icon">
                          ▦
                        </span>

                        <div>

                          <strong>
                            Scan Vehicle QR
                          </strong>

                          <small>
                            Use your camera
                          </small>

                        </div>

                        <span>
                          →
                        </span>

                      </button>
                    ) : (
                      <div className="report-scanner-active">

                        <div className="report-scanner-live">
                          <span />
                          SCANNER ACTIVE
                        </div>

                        <div
                          id="report-qr-reader"
                          className="report-qr-reader"
                        />

                        <button
                          type="button"
                          className="report-stop-scanner"
                          onClick={stopScanner}
                        >
                          Stop Scanner
                        </button>

                      </div>
                    )}

                  </div>

                </div>

                <div className="report-identification-note">

                  <span>
                    🔒
                  </span>

                  <p>
                    ParkSafe verifies the
                    vehicle before linking it
                    with your violation report.
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              02 VIOLATION
          ================================================= */}

          <div className="report-form-section">

            <div className="report-form-section-title">

              <span>
                02
              </span>

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
                      <strong>
                        ✓
                      </strong>
                    )}

                  </button>
                )
              )}

            </div>

          </div>

          {/* =================================================
              03 DESCRIPTION
          ================================================= */}

          <div className="report-form-section">

            <div className="report-form-section-title">

              <span>
                03
              </span>

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
                onChange={(event) =>
                  setDescription(
                    event.target.value
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

          {/* =================================================
              04 LOCATION
          ================================================= */}

          <div className="report-form-section">

            <div className="report-form-section-title">

              <span>
                04
              </span>

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

                <span>
                  ◉
                </span>

                <input
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
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
                    <span>
                      ◎
                    </span>

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

          {/* =================================================
              05 EVIDENCE
          ================================================= */}

          <div className="report-form-section">

            <div className="report-form-section-title">

              <span>
                05
              </span>

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
                onChange={handleEvidenceChange}
              />

              {!file ? (
                <>

                  <div className="evidence-upload-animation">

                    <span className="upload-ring upload-ring-one" />
                    <span className="upload-ring upload-ring-two" />

                    <div>
                      ↑
                    </div>

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
                      🖼 Photo{" "}

                      <strong>
                        Max 5 MB
                      </strong>
                    </span>

                    <span>
                      🎥 Video{" "}

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
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

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

              <span>
                🔒
              </span>

              <p>
                Evidence is stored privately
                and made available to
                authorized ParkSafe reviewers.
              </p>

            </div>

          </div>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="report-submit-area">

            <div className="report-submit-note">

              <span>
                {selectedVehicle
                  ? "✓"
                  : "!"}
              </span>

              <p>
                {selectedVehicle
                  ? `Report will be linked to ${selectedVehicle.vehicleNumber}.`
                  : "Identify a vehicle before submitting the report."}
              </p>

            </div>

            <button
              className={
                submitting
                  ? "premium-report-submit submitting"
                  : "premium-report-submit"
              }
              type="submit"
              disabled={
                submitting ||
                !selectedVehicle
              }
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

                  <strong>
                    →
                  </strong>
                </>
              )}

            </button>

          </div>

        </form>

      </section>

      {/* =================================================
          HISTORY
      ================================================= */}

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
              Follow your reports,
              reported vehicles and
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

            <span>
              ↻
            </span>

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

              <div>
                ↻
              </div>

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

              <div>
                ⚑
              </div>

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
                  statusClass(status);

                return (
                  <article
                    className={`premium-history-card ${state}`}
                    key={report.reportId}
                    style={{
                      "--report-delay":
                        `${index * 0.08}s`
                    }}
                  >

                    <div className="history-card-status-line" />

                    {/* TOP */}

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

                    {/* VEHICLE */}

                    {report.vehicleNumber && (
                      <div className="history-reported-vehicle">

                        <div className="history-vehicle-icon">
                          🚘
                        </div>

                        <div>

                          <span>
                            REPORTED VEHICLE
                          </span>

                          <strong>
                            {report.vehicleNumber}
                          </strong>

                          <small>
                            {report.vehicleModel ||
                              "Registered Vehicle"}

                            {report.vehicleType
                              ? ` • ${report.vehicleType}`
                              : ""}
                          </small>

                        </div>

                        <span className="history-vehicle-linked">
                          <span />
                          LINKED
                        </span>

                      </div>
                    )}

                    {/* VIOLATION */}

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

                    {/* DETAILS */}

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

                    {/* EVIDENCE */}

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
                          href={report.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="user-evidence-view-button"
                        >
                          View Evidence →
                        </a>

                      </div>
                    )}
                    {/* AUTHORITY REVIEW / REMARK */}

{(report.status === "Approved" ||
  report.status === "Rejected") && (
  <div
    className={`user-authority-review ${
      report.status === "Approved"
        ? "approved"
        : "rejected"
    }`}
  >
    <div className="user-authority-review-icon">
      {report.status === "Approved"
        ? "✓"
        : "×"}
    </div>

    <div className="user-authority-review-content">

      <div className="user-authority-review-heading">

        <div>
          <span>
            AUTHORITY REVIEW
          </span>

          <strong>
            {report.status === "Approved"
              ? "Report Approved"
              : "Report Rejected"}
          </strong>
        </div>

        <span
          className={`user-review-status ${
            report.status === "Approved"
              ? "approved"
              : "rejected"
          }`}
        >
          {report.status}
        </span>

      </div>

      {report.authorityRemark ? (
        <div className="user-authority-remark">

          <span>
            AUTHORITY REMARK
          </span>

          <p>
            “{report.authorityRemark}”
          </p>

        </div>
      ) : (
        <div className="user-authority-remark no-remark">

          <span>
            AUTHORITY REMARK
          </span>

          <p>
            No additional remark was provided
            by the reviewing authority.
          </p>

        </div>
      )}

      {report.reviewedAt && (
        <div className="user-review-time">

          <span>
            ◷
          </span>

          Reviewed on{" "}

          <strong>
            {formatDate(
              report.reviewedAt
            )}
          </strong>

        </div>
      )}

    </div>

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

      {/* =================================================
          BOTTOM NOTE
      ================================================= */}

      <section className="reports-bottom-note">

        <div className="reports-bottom-icon">
          i
        </div>

        <div>

          <span>
            RESPONSIBLE REPORTING
          </span>

          <h3>
            Identify the correct vehicle
            before reporting.
          </h3>

          <p>
            ParkSafe links the selected
            vehicle, location and supporting
            evidence with every violation
            report to help authorities review
            the issue accurately.
          </p>

        </div>

      </section>

    </div>
  );
}