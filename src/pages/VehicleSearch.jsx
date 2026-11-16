import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";

const STORAGE_KEY = "parksafeVehicles";
const API_URL = "https://parksafe-backend-s51i.onrender.com";

export default function VehicleSearch() {
  const [number, setNumber] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // SEARCH VEHICLE
  // ==========================================

  async function searchVehicle(vehicleNumber) {
    const cleanNumber = vehicleNumber
      .trim()
      .toUpperCase();

    if (!cleanNumber) return;

    setNumber(cleanNumber);
    setVehicle(null);
    setError("");
    setLoading(true);

    // Small delay so scanning animation is visible
    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    try {
      // First search browser-saved vehicles
      const savedVehicles = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const localMatch = savedVehicles.find(
        (item) =>
          item.vehicleNumber
            ?.trim()
            .toUpperCase() === cleanNumber
      );

      if (localMatch) {
        setVehicle({
          vehicleNumber: localMatch.vehicleNumber,
          vehicleType:
            localMatch.vehicleType || "Vehicle",
          vehicleModel:
            localMatch.vehicleModel || "Not specified",
          ownerReference:
            "Not available in demo mode",
          status: "Registered locally",
          id: localMatch.id
        });

        return;
      }

      // Backend search
      const response = await fetch(
        `${API_URL}/api/vehicles/${encodeURIComponent(
          cleanNumber
        )}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Vehicle not found."
        );
      }

      const v = data.vehicle;

      setVehicle({
        vehicleNumber: v.vehicle_number,
        vehicleType: v.vehicle_type,
        vehicleModel: v.vehicle_model,
        ownerReference: v.owner_reference,
        status: v.status,
        id: v.id
      });

    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "ParkSafe network connection failed. Please try again."
          : err.message
      );

    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // QR RESULT
  // ==========================================

  function handleScannedCode(decodedText) {
    try {
      const scannedUrl = new URL(decodedText);

      if (
        scannedUrl.pathname.startsWith("/scan/")
      ) {
        navigate(scannedUrl.pathname);
        return;
      }
    } catch {
      // Not a URL
    }

    if (
      decodedText.startsWith(
        "PARKSAFE-DEMO:"
      )
    ) {
      const id = decodedText
        .replace("PARKSAFE-DEMO:", "")
        .trim();

      navigate(
        `/scan/${encodeURIComponent(id)}`
      );

      return;
    }

    searchVehicle(decodedText);
  }

  // ==========================================
  // QR SCANNER
  // ==========================================

  useEffect(() => {
    if (!scanning) return;

    const scanner =
      new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,

          qrbox: {
            width: 250,
            height: 250
          }
        },
        false
      );

    scanner.render(
      (decodedText) => {
        setScanning(false);

        scanner
          .clear()
          .catch(() => {});

        handleScannedCode(decodedText);
      },
      () => {}
    );

    return () => {
      scanner
        .clear()
        .catch(() => {});
    };
  }, [scanning]);

  // ==========================================
  // SUBMIT
  // ==========================================

  function handleSubmit(e) {
    e.preventDefault();
    searchVehicle(number);
  }

  // ==========================================
  // CLEAR
  // ==========================================

  function clearSearch() {
    setNumber("");
    setVehicle(null);
    setError("");
    setLoading(false);
  }

  return (
    <div className="premium-vehicle-search-page">

      {/* BACKGROUND */}

      <div
        className="vehicle-page-ambient"
        aria-hidden="true"
      >
        <span className="vehicle-ambient-orb vehicle-orb-one" />
        <span className="vehicle-ambient-orb vehicle-orb-two" />

        <span className="vehicle-floating-dot vehicle-dot-one" />
        <span className="vehicle-floating-dot vehicle-dot-two" />
        <span className="vehicle-floating-dot vehicle-dot-three" />
      </div>

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <section className="vehicle-search-header">

        <div>

          <div className="vehicle-network-pill">
            <span />
            PARKSAFE VEHICLE NETWORK
          </div>

          <span className="eyebrow">
            VEHICLE IDENTIFICATION
          </span>

          <h1>
            Find a vehicle.{" "}
            <span>
              Connect responsibly.
            </span>
          </h1>

          <p>
            Search a registration number or scan
            a ParkSafe QR code to securely
            identify a vehicle.
          </p>

        </div>

        <div className="vehicle-header-status">

          <div className="vehicle-status-icon">
            ⌕
          </div>

          <div>
            <small>SEARCH SERVICE</small>
            <strong>Ready to identify</strong>
          </div>

          <span className="vehicle-online-dot" />

        </div>

      </section>

      {/* ======================================
          MAIN SEARCH AREA
      ====================================== */}

      <section className="vehicle-search-command">

        {/* LEFT SEARCH */}

        <div className="vehicle-search-control">

          <div className="vehicle-control-heading">

            <div className="vehicle-control-icon">
              ⌕
            </div>

            <div>
              <span>
                REGISTRATION LOOKUP
              </span>

              <h2>
                Search Vehicle
              </h2>
            </div>

          </div>

          <p className="vehicle-control-description">
            Enter the vehicle registration
            number exactly as displayed on
            the number plate.
          </p>

          <form
            onSubmit={handleSubmit}
            className="premium-vehicle-form"
          >

            <label htmlFor="vehicle-search-number">
              Vehicle Registration Number
            </label>

            <div
              className={
                loading
                  ? "premium-number-input input-searching"
                  : "premium-number-input"
              }
            >

              <div className="number-plate-icon">
                IND
              </div>

              <input
                id="vehicle-search-number"
                type="text"
                value={number}
                onChange={(e) =>
                  setNumber(
                    e.target.value
                      .toUpperCase()
                      .replace(/\s/g, "")
                  )
                }
                placeholder="UK01AA1000"
                autoComplete="off"
                required
              />

              {number && !loading && (
                <button
                  type="button"
                  className="vehicle-input-clear"
                  onClick={clearSearch}
                  aria-label="Clear vehicle number"
                >
                  ×
                </button>
              )}

              {loading && (
                <span className="vehicle-input-loader" />
              )}

            </div>

            <div className="vehicle-search-example">
              Example: UK01AA1000
            </div>

            <button
              className="premium-search-button"
              type="submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="search-button-spinner" />
                  Searching ParkSafe Network...
                </>
              ) : (
                <>
                  <span>⌕</span>
                  Search Vehicle
                  <strong>→</strong>
                </>
              )}

            </button>

          </form>

          <div className="vehicle-search-security">

            <span className="security-check">
              ✓
            </span>

            <div>
              <strong>
                Privacy protected
              </strong>

              <small>
                Personal owner information is
                never exposed during vehicle search.
              </small>
            </div>

          </div>

        </div>

        {/* RIGHT VISUAL */}

        <div
          className={
            loading
              ? "vehicle-radar-panel radar-searching"
              : vehicle
              ? "vehicle-radar-panel radar-success"
              : error
              ? "vehicle-radar-panel radar-error"
              : "vehicle-radar-panel"
          }
        >

          <div className="vehicle-radar-grid" />

          <div className="vehicle-radar">

            <span className="vehicle-radar-ring radar-a" />
            <span className="vehicle-radar-ring radar-b" />
            <span className="vehicle-radar-ring radar-c" />

            {loading && (
              <div className="vehicle-radar-sweep" />
            )}

            <div className="vehicle-radar-core">

              {loading ? (
                <span className="radar-car">
                  🚘
                </span>
              ) : vehicle ? (
                <span className="radar-success-check">
                  ✓
                </span>
              ) : error ? (
                <span className="radar-error-icon">
                  !
                </span>
              ) : (
                <span className="radar-search-icon">
                  ⌕
                </span>
              )}

            </div>

            <span className="radar-node node-one" />
            <span className="radar-node node-two" />
            <span className="radar-node node-three" />

          </div>

          <div className="vehicle-radar-copy">

            {loading ? (
              <>
                <span className="vehicle-radar-badge scanning">
                  ● SCANNING
                </span>

                <h3>
                  Searching ParkSafe Network
                </h3>

                <p>
                  Checking registration{" "}
                  <strong>
                    {number}
                  </strong>
                </p>

                <div className="vehicle-loading-lines">
                  <span />
                  <span />
                  <span />
                </div>
              </>
            ) : vehicle ? (
              <>
                <span className="vehicle-radar-badge success">
                  ✓ VEHICLE FOUND
                </span>

                <h3>
                  Identification Complete
                </h3>

                <p>
                  Vehicle successfully located
                  in ParkSafe.
                </p>
              </>
            ) : error ? (
              <>
                <span className="vehicle-radar-badge error">
                  ! NOT FOUND
                </span>

                <h3>
                  Vehicle Not Identified
                </h3>

                <p>
                  Check the registration number
                  and try again.
                </p>
              </>
            ) : (
              <>
                <span className="vehicle-radar-badge ready">
                  ● READY
                </span>

                <h3>
                  Vehicle Scanner Ready
                </h3>

                <p>
                  Enter a registration number to
                  begin identification.
                </p>
              </>
            )}

          </div>

        </div>

      </section>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="premium-vehicle-error">

          <div className="vehicle-error-symbol">
            !
          </div>

          <div>
            <strong>
              Vehicle search unsuccessful
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={clearSearch}
          >
            Try Again
          </button>

        </div>
      )}

      {/* ======================================
          VEHICLE FOUND
      ====================================== */}

      {vehicle && (
        <section className="premium-vehicle-result">

          <div className="vehicle-result-success-line" />

          <div className="vehicle-result-header">

            <div className="vehicle-result-title">

              <div className="vehicle-result-check">
                ✓
              </div>

              <div>

                <span className="vehicle-result-label">
                  {vehicle.status ===
                  "Registered locally"
                    ? "LOCAL DEMO VEHICLE"
                    : "VEHICLE VERIFIED"}
                </span>

                <h2>
                  Vehicle Identified
                </h2>

              </div>

            </div>

            <span className="vehicle-verified-badge">
              <span />
              Verified
            </span>

          </div>

          <div className="vehicle-number-display">

            <span>
              REGISTRATION
            </span>

            <strong>
              {vehicle.vehicleNumber}
            </strong>

          </div>

          <div className="vehicle-result-details">

            <div className="vehicle-detail-box">

              <span className="detail-box-icon purple">
                🚘
              </span>

              <div>
                <small>
                  VEHICLE TYPE
                </small>

                <strong>
                  {vehicle.vehicleType ||
                    "Not specified"}
                </strong>
              </div>

            </div>

            <div className="vehicle-detail-box">

              <span className="detail-box-icon cyan">
                ◈
              </span>

              <div>
                <small>
                  VEHICLE MODEL
                </small>

                <strong>
                  {vehicle.vehicleModel ||
                    "Not specified"}
                </strong>
              </div>

            </div>

            <div className="vehicle-detail-box">

              <span className="detail-box-icon green">
                ✓
              </span>

              <div>
                <small>
                  STATUS
                </small>

                <strong>
                  {vehicle.status}
                </strong>
              </div>

            </div>

            {vehicle.ownerReference !==
              "Not available in demo mode" && (
              <div className="vehicle-detail-box">

                <span className="detail-box-icon orange">
                  ◉
                </span>

                <div>
                  <small>
                    OWNER REFERENCE
                  </small>

                  <strong>
                    {vehicle.ownerReference}
                  </strong>
                </div>

              </div>
            )}

          </div>

          <div className="vehicle-result-privacy">

            <div className="vehicle-privacy-icon">
              ◈
            </div>

            <div>
              <strong>
                Owner privacy protected
              </strong>

              <p>
                ParkSafe lets you notify the
                vehicle owner without exposing
                their personal contact information.
              </p>
            </div>

          </div>

          <div className="vehicle-result-actions">

            <button
              className="vehicle-new-search"
              type="button"
              onClick={clearSearch}
            >
              Search Another Vehicle
            </button>

            <button
              className="vehicle-alert-action"
              type="button"
              onClick={() =>
                navigate(
                  "/alerts",
                  {
                    state: {
                      vehicle
                    }
                  }
                )
              }
            >
              <span className="vehicle-alert-bell">
                !
              </span>

              Send Parking Alert

              <span>
                →
              </span>
            </button>

          </div>

        </section>
      )}

      {/* ======================================
          QR SCANNER
      ====================================== */}

      <section
        className={
          scanning
            ? "premium-qr-card qr-active"
            : "premium-qr-card"
        }
      >

        <div className="premium-qr-heading">

          <div className="qr-heading-icon">
            ▦
          </div>

          <div>

            <span className="eyebrow">
              QUICK IDENTIFICATION
            </span>

            <h2>
              Scan Vehicle QR Code
            </h2>

            <p>
              Scan a ParkSafe QR code for
              instant vehicle identification.
            </p>

          </div>

        </div>

        {!scanning ? (
          <div className="qr-idle-area">

            <div className="qr-demo-animation">

              <span className="qr-corner qr-top-left" />
              <span className="qr-corner qr-top-right" />
              <span className="qr-corner qr-bottom-left" />
              <span className="qr-corner qr-bottom-right" />

              <div className="qr-demo-grid">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="qr-idle-beam" />

            </div>

            <div className="qr-idle-copy">

              <h3>
                Camera Scanner Ready
              </h3>

              <p>
                Allow camera access and point
                your device at a ParkSafe QR code.
              </p>

              <button
                className="premium-qr-button"
                type="button"
                onClick={() => {
                  setVehicle(null);
                  setError("");
                  setScanning(true);
                }}
              >
                <span>
                  ▦
                </span>

                Start QR Scanner
              </button>

            </div>

          </div>
        ) : (
          <div className="qr-scanner-active">

            <div className="qr-live-label">
              <span />
              CAMERA ACTIVE
            </div>

            <div className="qr-camera-frame">

              <span className="camera-corner camera-one" />
              <span className="camera-corner camera-two" />
              <span className="camera-corner camera-three" />
              <span className="camera-corner camera-four" />

              <div className="camera-scan-line" />

              <div id="qr-reader" />

            </div>

            <p>
              Position the QR code inside
              the scanning frame.
            </p>

            <button
              className="premium-stop-scanner"
              type="button"
              onClick={() =>
                setScanning(false)
              }
            >
              Stop Scanner
            </button>

          </div>
        )}

      </section>

      {/* ======================================
          BOTTOM INFO
      ====================================== */}

      <section className="vehicle-search-bottom">

        <div className="vehicle-bottom-icon">
          ✓
        </div>

        <div>

          <span>
            RESPONSIBLE IDENTIFICATION
          </span>

          <h3>
            Search without exposing personal details.
          </h3>

          <p>
            ParkSafe uses vehicle references to
            enable communication while keeping
            personal owner information private.
          </p>

        </div>

      </section>

    </div>
  );
}