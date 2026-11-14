
import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const STORAGE_KEY = "parksafeVehicles";

const initialVehicles = [
  {
    id: "PS-DEMO-1001",
    vehicleNumber: "UK01AB1234",
    vehicleType: "Car",
    vehicleModel: "Hyundai Creta",
  },
  {
    id: "PS-DEMO-1002",
    vehicleNumber: "UK07CD5678",
    vehicleType: "Scooter",
    vehicleModel: "Honda Activa",
  },
];

function getInitialVehicles() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      return JSON.parse(saved);
    }

    return initialVehicles;
  } catch {
    return initialVehicles;
  }
}

export default function MyVehicles() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [vehicleModel, setVehicleModel] = useState("");

  const [vehicles, setVehicles] = useState(getInitialVehicles);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  const resetForm = () => {
    setVehicleNumber("");
    setVehicleType("Car");
    setVehicleModel("");
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanNumber = vehicleNumber.trim().toUpperCase();

    if (!cleanNumber || !vehicleModel.trim()) {
      setMessage("Please fill in all vehicle details.");
      return;
    }

    const duplicate = vehicles.some(
      (vehicle) =>
        vehicle.vehicleNumber.toUpperCase() === cleanNumber &&
        vehicle.id !== editingId
    );

    if (duplicate) {
      setMessage("This vehicle is already registered.");
      return;
    }

    if (editingId) {
      setVehicles((previous) =>
        previous.map((vehicle) =>
          vehicle.id === editingId
            ? {
                ...vehicle,
                vehicleNumber: cleanNumber,
                vehicleType,
                vehicleModel: vehicleModel.trim(),
              }
            : vehicle
        )
      );

      setMessage("Vehicle details updated successfully.");
    } else {
      const newVehicle = {
        id: `PS-${Date.now()}`,
        vehicleNumber: cleanNumber,
        vehicleType,
        vehicleModel: vehicleModel.trim(),
      };

      setVehicles((previous) => [...previous, newVehicle]);
      setMessage("Vehicle added successfully.");
    }

    resetForm();
  };

  const handleEdit = (vehicle) => {
    setVehicleNumber(vehicle.vehicleNumber);
    setVehicleType(vehicle.vehicleType);
    setVehicleModel(vehicle.vehicleModel);
    setEditingId(vehicle.id);
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemove = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this vehicle?"
    );

    if (!confirmed) return;

    setVehicles((previous) =>
      previous.filter((vehicle) => vehicle.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }

    setMessage("Vehicle removed successfully.");
  };

  const downloadQR = (vehicle) => {
    const canvas = document.getElementById(`qr-${vehicle.id}`);

    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${vehicle.vehicleNumber}-ParkSafe-QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="my-vehicles-page">
      <span className="eyebrow">VEHICLE MANAGEMENT</span>

      <h1>My Vehicles</h1>

      <p className="subtitle">
        Register and manage your vehicles on ParkSafe.
      </p>

      <section className="search-card vehicle-form-card">
        <h2>
          {editingId ? "Edit Vehicle Details" : "Register a Vehicle"}
        </h2>

        <p>
          Add your vehicle details to prepare it for
          ParkSafe QR identification.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="vehicle-number">Registration Number</label>

          <input
            id="vehicle-number"
            type="text"
            placeholder="Example: UK01AB1234"
            value={vehicleNumber}
            onChange={(e) =>
              setVehicleNumber(e.target.value.toUpperCase())
            }
            required
          />

          <label htmlFor="vehicle-type">Vehicle Type</label>

          <select
            id="vehicle-type"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Scooter">Scooter</option>
            <option value="Commercial">Commercial Vehicle</option>
          </select>

          <label htmlFor="vehicle-model">Vehicle Model</label>

          <input
            id="vehicle-model"
            type="text"
            placeholder="Example: Hyundai Creta"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            required
          />

          <div className="vehicle-form-actions">
            <button type="submit" className="primary-button">
              {editingId ? "Save Changes" : "Register Vehicle"}
            </button>

            {editingId && (
              <button
                type="button"
                className="vehicle-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

          {message && (
            <p className="vehicle-message" role="status">
              {message}
            </p>
          )}
        </form>
      </section>

      <section className="search-card vehicles-section">
        <div className="vehicles-section-heading">
          <div>
            <h2>Your Registered Vehicles</h2>
            <p>Manage your vehicles and their ParkSafe QR codes.</p>
          </div>

          <span className="vehicle-count">
            {vehicles.length}{" "}
            {vehicles.length === 1 ? "Vehicle" : "Vehicles"}
          </span>
        </div>

        {vehicles.length === 0 ? (
          <div className="empty-vehicles">
            <div className="empty-vehicles-icon">🚘</div>
            <h3>No Vehicles Registered Yet</h3>
            <p>
              Register your first vehicle to generate its
              unique ParkSafe QR code.
            </p>
          </div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map((vehicle) => (
              <article className="vehicle-card" key={vehicle.id}>
                <div className="vehicle-card-header">
                  <div className="vehicle-type-icon">
                    {vehicle.vehicleType === "Car"
                      ? "🚘"
                      : vehicle.vehicleType === "Bike"
                      ? "🏍️"
                      : vehicle.vehicleType === "Scooter"
                      ? "🛵"
                      : "🚚"}
                  </div>

                  <span className="vehicle-status">Demo</span>
                </div>

                <h3>{vehicle.vehicleModel}</h3>
                <p className="vehicle-number">{vehicle.vehicleNumber}</p>

                <div className="vehicle-details">
                  <span>Vehicle Type</span>
                  <strong>{vehicle.vehicleType}</strong>
                </div>

                <div className="vehicle-qr-area">
                  <h3 className="parksafe-qr-title">Park Safe</h3>

                  <QRCodeCanvas
                    id={`qr-${vehicle.id}`}
                    value={`https://park-safe-sigma.vercel.app/scan/${vehicle.id}`}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />

                  <strong>Vehicle Identification QR</strong>

                  <p>
                    Scan this QR code using your mobile camera.
                  </p>

                  <button
                    type="button"
                    className="download-qr-button"
                    onClick={() => downloadQR(vehicle)}
                  >
                    Download QR Code
                  </button>
                </div>

                <div className="vehicle-card-actions">
                  <button
                    type="button"
                    className="vehicle-edit-button"
                    onClick={() => handleEdit(vehicle)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="vehicle-remove-button"
                    onClick={() => handleRemove(vehicle.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="vehicle-demo-note">
          Vehicle records are currently stored locally in this browser
          and are not yet connected to the ParkSafe database.
        </p>
      </section>
    </div>
  );
}
