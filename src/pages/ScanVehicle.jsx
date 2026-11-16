import {
  useEffect,
  useState
} from "react";

import {
  useParams,
  Link,
  useNavigate
} from "react-router-dom";

const API_URL =
  "https://parksafe-backend-s51i.onrender.com";

export default function ScanVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [
    vehicle,
    setVehicle
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  /* ==========================================
     LOAD VEHICLE FROM REAL DATABASE
  ========================================== */

  useEffect(() => {
    async function loadVehicle() {
      if (!id) {
        setError(
          "Invalid ParkSafe QR code."
        );

        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/api/vehicles/qr/${encodeURIComponent(
              id
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

        setVehicle(
          data.vehicle
        );
      } catch (err) {
        setVehicle(null);

        setError(
          err.message ===
            "Failed to fetch"
            ? "Unable to connect to ParkSafe."
            : err.message ||
                "Vehicle not found."
        );
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
  }, [id]);

  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <main className="scan-page">

        <section className="scan-card">

          <div className="scan-brand">
            P
          </div>

          <h1>
            ParkSafe
          </h1>

          <p className="scan-subtitle">
            Smart Parking Assistance
          </p>

          <div className="scan-success">
            VERIFYING QR
          </div>

          <h2>
            Identifying Vehicle...
          </h2>

          <p className="scan-message">
            Please wait while ParkSafe
            verifies this vehicle.
          </p>

        </section>

      </main>
    );
  }

  /* ==========================================
     NOT FOUND
  ========================================== */

  if (!vehicle) {
    return (
      <main className="scan-page">

        <section className="scan-card">

          <div className="scan-brand">
            P
          </div>

          <h1>
            ParkSafe
          </h1>

          <p className="scan-subtitle">
            Smart Parking Assistance
          </p>

          <h2>
            Vehicle Not Found
          </h2>

          <p className="scan-message">
            {error ||
              "This QR code does not match a registered ParkSafe vehicle."}
          </p>

          <Link
            to="/vehicles/search"
            className="scan-secondary-button"
          >
            Search Vehicle
          </Link>

          <p className="scan-footer">
            ParkSafe · Smarter Parking,
            Better Roads
          </p>

        </section>

      </main>
    );
  }

  /* ==========================================
     VEHICLE FOUND
  ========================================== */

  return (
    <main className="scan-page">

      <section className="scan-card">

        <div className="scan-brand">
          P
        </div>

        <h1>
          ParkSafe
        </h1>

        <p className="scan-subtitle">
          Smart Parking Assistance
        </p>

        <div className="scan-success">
          ✓ QR CODE VERIFIED
        </div>

        <div
          style={{
            fontSize: "42px",
            margin: "20px 0 10px"
          }}
        >
          🚘
        </div>

        <h2>
          {vehicle.vehicleModel ||
            "Registered Vehicle"}
        </h2>

        <p className="scan-registration">
          {vehicle.vehicleNumber}
        </p>

        <div className="scan-details">

          <span>
            Vehicle Type
          </span>

          <strong>
            {vehicle.vehicleType ||
              "Vehicle"}
          </strong>

        </div>

        <div className="scan-details">

          <span>
            Status
          </span>

          <strong>
            {vehicle.status ||
              "Active"}
          </strong>

        </div>

        {vehicle.ownerReference && (
          <div className="scan-details">

            <span>
              Owner Reference
            </span>

            <strong>
              {vehicle.ownerReference}
            </strong>

          </div>
        )}

        <p className="scan-message">
          This vehicle is registered
          with ParkSafe. You can notify
          the vehicle owner without
          exposing their personal contact
          information.
        </p>

        <button
          type="button"
          className="scan-report-button"
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
          Send Parking Alert
        </button>

        <Link
          to="/vehicles/search"
          className="scan-login-link"
        >
          Search Another Vehicle
        </Link>

        <p className="scan-footer">
          ParkSafe · Smarter Parking,
          Better Roads
        </p>

      </section>

    </main>
  );
}