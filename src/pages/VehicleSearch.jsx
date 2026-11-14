
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";

const STORAGE_KEY = "parksafeVehicles";

export default function VehicleSearch() {
  const [number, setNumber] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function searchVehicle(vehicleNumber) {
    const cleanNumber = vehicleNumber.trim().toUpperCase();

    if (!cleanNumber) return;

    setNumber(cleanNumber);
    setVehicle(null);
    setError("");
    setLoading(true);

    try {
      // First search vehicles saved in this browser.
      const savedVehicles = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const localMatch = savedVehicles.find(
        (item) =>
          item.vehicleNumber?.trim().toUpperCase() === cleanNumber
      );

      if (localMatch) {
        setVehicle({
          vehicleNumber: localMatch.vehicleNumber,
          vehicleType: localMatch.vehicleType,
          vehicleModel: localMatch.vehicleModel,
          ownerReference: "Not available in demo mode",
          status: "Registered locally",
          id: localMatch.id,
        });

        return;
      }

      // If no local match, check the existing backend.
      const response = await fetch(
        `https://parksafe-backend-s51i.onrender.com/api/vehicles/${encodeURIComponent(cleanNumber)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Vehicle not found.");
      }

      const v = data.vehicle;

      setVehicle({
        vehicleNumber: v.vehicle_number,
        vehicleType: v.vehicle_type,
        vehicleModel: v.vehicle_model,
        ownerReference: v.owner_reference,
        status: v.status,
        id: v.id,
      });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Backend connection failed. Check whether the server is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

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
      // Not a URL: check whether it is a ParkSafe demo identifier.
    }

    if (decodedText.startsWith("PARKSAFE-DEMO:")) {
      const id = decodedText.replace("PARKSAFE-DEMO:", "").trim();
      navigate(`/scan/${encodeURIComponent(id)}`);
      return;
    }

    // Otherwise treat the scanned content as a vehicle number.
    searchVehicle(decodedText);
  }

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setScanning(false);
        scanner.clear().catch(() => {});
        handleScannedCode(decodedText);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanning]);

  function handleSubmit(e) {
    e.preventDefault();
    searchVehicle(number);
  }

  return (
    <div>
      <span className="eyebrow">VEHICLE IDENTIFICATION</span>

      <h1>Search Vehicle</h1>

      <p className="subtitle">
        Enter a registration number or scan its QR code.
      </p>

      <form className="search-card" onSubmit={handleSubmit}>
        <label htmlFor="vehicle-search-number">
          Vehicle Registration Number
        </label>

        <input
          id="vehicle-search-number"
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value.toUpperCase())}
          placeholder="Example: UK01AA1000"
          required
        />

        <button
          className="primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search Vehicle"}
        </button>
      </form>

      <div className="qr-section">
        <h2>Or Scan Vehicle QR Code</h2>

        {!scanning && (
          <button
            className="primary-button"
            type="button"
            onClick={() => setScanning(true)}
          >
            Start QR Scanner
          </button>
        )}

        {scanning && (
          <>
            <div id="qr-reader"></div>

            <button
              className="stop-button"
              type="button"
              onClick={() => setScanning(false)}
            >
              Stop Scanner
            </button>
          </>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {vehicle && (
        <div className="result-card">
          <span className="success-label">
            {vehicle.status === "Registered locally"
              ? "LOCAL DEMO VEHICLE"
              : "VEHICLE VERIFIED"}
          </span>

          <h2>{vehicle.vehicleNumber}</h2>

          <p><strong>Type:</strong> {vehicle.vehicleType}</p>
          <p><strong>Model:</strong> {vehicle.vehicleModel}</p>
          <p><strong>Status:</strong> {vehicle.status}</p>

          {vehicle.ownerReference !== "Not available in demo mode" && (
            <p>
              <strong>Owner Reference:</strong>{" "}
              {vehicle.ownerReference}
            </p>
          )}

          <button
            className="primary-button"
            type="button"
            onClick={() =>
              navigate("/alerts", { state: { vehicle } })
            }
          >
            Send Parking Alert →
          </button>
        </div>
      )}
    </div>
  );
}
