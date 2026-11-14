
import { useParams, Link } from "react-router-dom";

const demoVehicles = {
  "PS-DEMO-1001": {
    vehicleNumber: "UK01AB1234",
    vehicleModel: "Hyundai Creta",
    vehicleType: "Car",
  },
  "PS-DEMO-1002": {
    vehicleNumber: "UK07CD5678",
    vehicleModel: "Honda Activa",
    vehicleType: "Scooter",
  },
};

export default function ScanVehicle() {
  const { id } = useParams();
  const vehicle = demoVehicles[id];

  return (
    <main className="scan-page">
      <section className="scan-card">
        <div className="scan-brand">P</div>

        <h1>Park Safe</h1>
        <p className="scan-subtitle">
          Smart Parking Assistance
        </p>

        {vehicle ? (
          <>
            <div className="scan-success">QR Code Recognised</div>

            <h2>{vehicle.vehicleModel}</h2>

            <p className="scan-registration">
              {vehicle.vehicleNumber}
            </p>

            <div className="scan-details">
              <span>Vehicle Type</span>
              <strong>{vehicle.vehicleType}</strong>
            </div>

            <p className="scan-message">
              You have successfully scanned this ParkSafe
              vehicle identification QR code.
            </p>
          </>
        ) : (
          <>
            <h2>Vehicle Not Found</h2>
            <p className="scan-message">
              This QR code does not match a recognised
              demonstration vehicle.
            </p>
          </>
        )}

        <Link to="/login" className="scan-login-link">
          Login to ParkSafe
        </Link>

        <p className="scan-footer">
          Park Safe · Smarter Parking, Better Roads
        </p>
      </section>
    </main>
  );
}
