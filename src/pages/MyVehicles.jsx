 
import { useState, useEffect, useMemo, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

const STORAGE_KEY = "parksafeVehicles";
const QR_BASE_URL = "https://park-safe-sigma.vercel.app/scan/";

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

const vehicleTypes = [
  "All Vehicles",
  "Car",
  "Bike",
  "Scooter",
  "Commercial",
];

function getInitialVehicles() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : initialVehicles;
    }

    return initialVehicles;
  } catch {
    return initialVehicles;
  }
}

function VehicleIcon({ type }) {
  const icons = {
    Car: "🚘",
    Bike: "🏍️",
    Scooter: "🛵",
    Commercial: "🚚",
  };

  return <span aria-hidden="true">{icons[type] || "🚗"}</span>;
}

function StatCard({ icon, label, value, detail }) {
  return (
    <div className="garage-stat-card">
      <div className="garage-stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState(getInitialVehicles);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [vehicleModel, setVehicleModel] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Vehicles");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Reference to the registration/edit form
  const formRef = useRef(null);

  // Save vehicles to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  // Smoothly scroll to the form whenever it opens
  useEffect(() => {
    if (formOpen && formRef.current) {
      const timer = window.setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      return () => window.clearTimeout(timer);
    }
  }, [formOpen, editingId]);

  // Vehicle statistics
  const stats = useMemo(
    () => ({
      total: vehicles.length,
      cars: vehicles.filter((v) => v.vehicleType === "Car").length,
      twoWheelers: vehicles.filter(
        (v) => ["Bike", "Scooter"].includes(v.vehicleType)
      ).length,
      commercial: vehicles.filter(
        (v) => v.vehicleType === "Commercial"
      ).length,
    }),
    [vehicles]
  );

  // Search and filter vehicles
  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.vehicleNumber.toLowerCase().includes(query) ||
        vehicle.vehicleModel.toLowerCase().includes(query);

      const matchesType =
        activeFilter === "All Vehicles" ||
        vehicle.vehicleType === activeFilter;

      return matchesSearch && matchesType;
    });
  }, [vehicles, search, activeFilter]);

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);
  }

  function resetForm() {
    setVehicleNumber("");
    setVehicleType("Car");
    setVehicleModel("");
    setEditingId(null);
    setFormOpen(false);
  }

  // Open the form for adding a new vehicle
  function openAddForm() {
    setVehicleNumber("");
    setVehicleType("Car");
    setVehicleModel("");
    setEditingId(null);
    setMessage("");
    setFormOpen(true);
  }

  // Register or update a vehicle
  function handleSubmit(e) {
    e.preventDefault();

    const cleanNumber = vehicleNumber.trim().toUpperCase();
    const cleanModel = vehicleModel.trim();

    if (!cleanNumber || !cleanModel) {
      showMessage("Please complete all vehicle details.", "error");
      return;
    }

    const duplicate = vehicles.some(
      (vehicle) =>
        vehicle.vehicleNumber.toUpperCase() === cleanNumber &&
        vehicle.id !== editingId
    );

    if (duplicate) {
      showMessage(
        "This registration number is already in your garage.",
        "error"
      );
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
                vehicleModel: cleanModel,
              }
            : vehicle
        )
      );

      showMessage("Vehicle details updated successfully.");
    } else {
      const newVehicle = {
        id: `PS-${Date.now()}`,
        vehicleNumber: cleanNumber,
        vehicleType,
        vehicleModel: cleanModel,
      };

      setVehicles((previous) => [...previous, newVehicle]);

      showMessage("Your vehicle has been added to the garage.");
    }

    resetForm();
  }

  // Open the form for editing an existing vehicle
  function handleEdit(vehicle) {
    setVehicleNumber(vehicle.vehicleNumber);
    setVehicleType(vehicle.vehicleType);
    setVehicleModel(vehicle.vehicleModel);
    setEditingId(vehicle.id);
    setFormOpen(true);
    setMessage("");
  }

  // Remove a vehicle
  function handleRemove(vehicle) {
    const confirmed = window.confirm(
      `Remove ${vehicle.vehicleNumber} from your ParkSafe garage?`
    );

    if (!confirmed) return;

    setVehicles((previous) =>
      previous.filter((item) => item.id !== vehicle.id)
    );

    if (editingId === vehicle.id) {
      resetForm();
    }

    showMessage("Vehicle removed from your garage.");
  }

  // Download the vehicle QR code
  function downloadQR(vehicle) {
    const canvas = document.getElementById(`qr-${vehicle.id}`);

    if (!canvas) {
      showMessage(
        "QR code is not ready yet. Please try again.",
        "error"
      );
      return;
    }

    const link = document.createElement("a");
    link.download = `${vehicle.vehicleNumber}-ParkSafe-QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    showMessage(`QR code for ${vehicle.vehicleNumber} downloaded.`);
  }

  return (
    <div className="my-vehicles-page garage-page">

      {/* PAGE INTRO */}
      <div className="garage-welcome">
        <div>
          <span className="eyebrow">YOUR PERSONAL GARAGE</span>

          <h1>
            My Garage<span className="garage-heading-dot">.</span>
          </h1>

          <p className="subtitle">
            Every vehicle, one secure place. Manage your vehicles and
            their ParkSafe identities.
          </p>
        </div>

        <button
          type="button"
          className="garage-add-button"
          onClick={openAddForm}
        >
          <span>＋</span> Add Vehicle
        </button>
      </div>

      {/* GARAGE HERO */}
      <section className="garage-hero">
        <div className="garage-hero-content">
          <span className="garage-hero-tag">
            <span className="garage-live-dot"></span>
            YOUR PARKSAFE GARAGE
          </span>

          <h2>
            Your vehicles.<br />
            Your identity. Your safety.
          </h2>

          <p>
            Keep your vehicle information organised and make it easier
            for others to reach you through ParkSafe QR identification.
          </p>

          <div className="garage-hero-bottom">
            <div className="garage-hero-mini-stat">
              <strong>{stats.total.toString().padStart(2, "0")}</strong>
              <span>Registered vehicles</span>
            </div>

            <div className="garage-hero-divider"></div>

            <div className="garage-hero-mini-stat">
              <strong>{stats.total}</strong>
              <span>QR identities</span>
            </div>
          </div>
        </div>

        <div className="garage-hero-art" aria-hidden="true">
          <div className="garage-orbit garage-orbit-one"></div>
          <div className="garage-orbit garage-orbit-two"></div>

          <div className="garage-car-illustration">🚘</div>

          <div className="garage-floating-card">
            <span>✦</span>
            <div>
              <strong>ParkSafe ID</strong>
              <small>Vehicle protection</small>
            </div>
          </div>

          <div className="garage-floating-shield">✓</div>
        </div>
      </section>

      {/* VEHICLE STATISTICS */}
      <section className="garage-stats-grid">
        <StatCard
          icon="🚘"
          label="Total Vehicles"
          value={stats.total}
          detail="In your garage"
        />

        <StatCard
          icon="🚗"
          label="Cars"
          value={stats.cars}
          detail="Four-wheelers"
        />

        <StatCard
          icon="🏍️"
          label="Two Wheelers"
          value={stats.twoWheelers}
          detail="Bikes & scooters"
        />

        <StatCard
          icon="🚚"
          label="Commercial"
          value={stats.commercial}
          detail="Utility vehicles"
        />
      </section>

      {/* FEEDBACK MESSAGE */}
      {message && (
        <div
          className={`garage-message ${
            messageType === "error" ? "garage-message-error" : ""
          }`}
          role="status"
        >
          <span>{messageType === "error" ? "!" : "✓"}</span>

          {message}

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {formOpen && (
        <section
          className="garage-form-panel"
          id="garage-form"
          ref={formRef}
        >
          <div className="garage-form-heading">
            <div>
              <span className="eyebrow">
                {editingId ? "UPDATE YOUR DETAILS" : "EXPAND YOUR GARAGE"}
              </span>

              <h2>{editingId ? "Edit Vehicle" : "Add a Vehicle"}</h2>

              <p>
                Enter the details below to create your vehicle profile.
              </p>
            </div>

            <button
              type="button"
              className="garage-form-close"
              onClick={resetForm}
              aria-label="Close vehicle form"
            >
              ×
            </button>
          </div>

          <form className="garage-form" onSubmit={handleSubmit}>
            <div className="garage-form-grid">
              <div className="garage-field">
                <label htmlFor="garage-number">
                  Registration Number
                </label>

                <input
                  id="garage-number"
                  type="text"
                  placeholder="e.g. UK01AB1234"
                  value={vehicleNumber}
                  onChange={(e) =>
                    setVehicleNumber(e.target.value.toUpperCase())
                  }
                  required
                />

                <small>
                  Enter the number displayed on your number plate.
                </small>
              </div>

              <div className="garage-field">
                <label htmlFor="garage-type">Vehicle Category</label>

                <select
                  id="garage-type"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="Car">Car</option>
                  <option value="Bike">Motorcycle / Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Commercial">Commercial Vehicle</option>
                </select>

                <small>
                  Select the category that best describes it.
                </small>
              </div>

              <div className="garage-field garage-field-full">
                <label htmlFor="garage-model">
                  Vehicle Make & Model
                </label>

                <input
                  id="garage-model"
                  type="text"
                  placeholder="e.g. Hyundai Creta"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  required
                />

                <small>
                  For example, Honda Activa, Tata Nexon or Royal Enfield
                  Classic.
                </small>
              </div>
            </div>

            <div className="garage-form-actions">
              <button type="submit" className="garage-submit-button">
                {editingId ? "Save Vehicle Changes" : "Add to My Garage"}
                <span>→</span>
              </button>

              <button
                type="button"
                className="garage-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* VEHICLE COLLECTION */}
      <section className="garage-collection">
        <div className="garage-collection-heading">
          <div>
            <span className="eyebrow">YOUR COLLECTION</span>
            <h2>Registered Vehicles</h2>
            <p>
              Your vehicles and their individual ParkSafe QR identities.
            </p>
          </div>

          <span className="garage-total-pill">
            {stats.total} {stats.total === 1 ? "VEHICLE" : "VEHICLES"}
          </span>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="garage-toolbar">
          <div className="garage-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search by model or registration number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search vehicles"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="garage-filters" aria-label="Filter vehicles">
            {vehicleTypes.map((type) => (
              <button
                type="button"
                key={type}
                className={activeFilter === type ? "active" : ""}
                onClick={() => setActiveFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* EMPTY STATE OR VEHICLE CARDS */}
        {filteredVehicles.length === 0 ? (
          <div className="garage-empty-state">
            <div className="garage-empty-icon">🚘</div>

            <h3>
              {vehicles.length === 0
                ? "Your garage is waiting."
                : "No matching vehicles found."}
            </h3>

            <p>
              {vehicles.length === 0
                ? "Add your first vehicle and create its ParkSafe QR identity."
                : "Try another search term or choose a different vehicle category."}
            </p>

            {vehicles.length === 0 && (
              <button
                type="button"
                className="garage-submit-button"
                onClick={openAddForm}
              >
                Add Your First Vehicle →
              </button>
            )}

            {(search || activeFilter !== "All Vehicles") && (
              <button
                type="button"
                className="garage-reset-filter"
                onClick={() => {
                  setSearch("");
                  setActiveFilter("All Vehicles");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="garage-vehicle-grid">
            {filteredVehicles.map((vehicle, index) => (
              <article className="garage-vehicle-card" key={vehicle.id}>
                <div className="garage-card-top">
                  <div
                    className={`garage-vehicle-avatar garage-avatar-${index % 4}`}
                  >
                    <VehicleIcon type={vehicle.vehicleType} />
                  </div>

                  <span className="garage-demo-badge">
                    <span></span> Demo Profile
                  </span>
                </div>

                <div className="garage-vehicle-info">
                  <span className="garage-vehicle-category">
                    {vehicle.vehicleType.toUpperCase()}
                  </span>

                  <h3>{vehicle.vehicleModel}</h3>

                  <div className="garage-registration">
                    {vehicle.vehicleNumber}
                  </div>
                </div>

                <div className="garage-vehicle-meta">
                  <div>
                    <span>Vehicle type</span>
                    <strong>{vehicle.vehicleType}</strong>
                  </div>

                  <div>
                    <span>ParkSafe ID</span>
                    <strong>{vehicle.id}</strong>
                  </div>
                </div>

                {/* QR IDENTITY PASS */}
                <div className="garage-qr-pass">
                  <div className="garage-qr-pass-heading">
                    <div>
                      <span className="garage-qr-kicker">
                        DIGITAL VEHICLE ID
                      </span>

                      <h4>ParkSafe Identity</h4>
                    </div>

                    <span className="garage-qr-mark">P</span>
                  </div>

                  <div className="garage-qr-frame">
                    <QRCodeCanvas
                      id={`qr-${vehicle.id}`}
                      value={`${QR_BASE_URL}${encodeURIComponent(vehicle.id)}`}
                      size={190}
                      level="H"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor="#172747"
                    />
                  </div>

                  <p className="garage-qr-caption">
                    Scan to open this vehicle's ParkSafe page
                  </p>

                  <button
                    type="button"
                    className="garage-download-button"
                    onClick={() => downloadQR(vehicle)}
                  >
                    <span>↓</span> Download QR Code
                  </button>
                </div>

                <div className="garage-card-actions">
                  <button
                    type="button"
                    className="garage-edit-button"
                    onClick={() => handleEdit(vehicle)}
                  >
                    <span>✎</span> Edit Details
                  </button>

                  <button
                    type="button"
                    className="garage-remove-button"
                    onClick={() => handleRemove(vehicle)}
                    aria-label={`Remove ${vehicle.vehicleNumber}`}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* FOOTNOTE */}
      <div className="garage-storage-note">
        <span>ⓘ</span>

        <p>
          <strong>Demo storage:</strong> Your vehicle records are currently
          saved in this browser. They are not yet synchronised with the
          ParkSafe database.
        </p>
      </div>
    </div>
  );
}
