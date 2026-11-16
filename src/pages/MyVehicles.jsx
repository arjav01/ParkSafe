import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  QRCodeCanvas
} from "qrcode.react";

const API_URL =
  "https://parksafe-backend-s51i.onrender.com";

const QR_BASE_URL =
  "https://park-safe-sigma.vercel.app/scan/";

const vehicleTypes = [
  "All Vehicles",
  "Car",
  "Bike",
  "Scooter",
  "Commercial"
];

/* =========================================================
   VEHICLE ICON
========================================================= */

function VehicleIcon({
  type
}) {
  const icons = {
    Car: "🚘",
    Bike: "🏍️",
    Scooter: "🛵",
    Commercial: "🚚"
  };

  return (
    <span aria-hidden="true">
      {icons[type] || "🚗"}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  detail
}) {
  return (
    <div className="garage-stat-card">

      <div className="garage-stat-icon">
        {icon}
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {detail}
        </small>
      </div>

    </div>
  );
}

/* =========================================================
   MY VEHICLES
========================================================= */

export default function MyVehicles() {

  const [
    vehicles,
    setVehicles
  ] = useState([]);

  const [
    vehicleNumber,
    setVehicleNumber
  ] = useState("");

  const [
    vehicleType,
    setVehicleType
  ] = useState("Car");

  const [
    vehicleModel,
    setVehicleModel
  ] = useState("");

  const [
    editingId,
    setEditingId
  ] = useState(null);

  const [
    formOpen,
    setFormOpen
  ] = useState(false);

  const [
    search,
    setSearch
  ] = useState("");

  const [
    activeFilter,
    setActiveFilter
  ] = useState(
    "All Vehicles"
  );

  const [
    message,
    setMessage
  ] = useState("");

  const [
    messageType,
    setMessageType
  ] = useState(
    "success"
  );

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    deletingId,
    setDeletingId
  ] = useState(null);

  const formRef =
    useRef(null);

  const token =
    localStorage.getItem(
      "parksafeToken"
    );

  /* =======================================================
     MESSAGE
  ======================================================= */

  function showMessage(
    text,
    type = "success"
  ) {
    setMessage(text);
    setMessageType(type);
  }

  /* =======================================================
     LOAD REAL VEHICLES FROM DATABASE
  ======================================================= */

  async function loadVehicles() {

    if (!token) {
      setVehicles([]);

      showMessage(
        "Please login to manage your vehicles.",
        "error"
      );

      setLoading(false);

      return;
    }

    setLoading(true);

    try {

      const response =
        await fetch(
          `${API_URL}/api/vehicles/my`,
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
          "Could not load vehicles."
        );
      }

      setVehicles(
        Array.isArray(
          data.vehicles
        )
          ? data.vehicles
          : []
      );

    } catch (error) {

      console.error(
        "Vehicle loading error:",
        error
      );

      showMessage(
        error.message ||
        "Unable to load your vehicles.",
        "error"
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  /* =======================================================
     SCROLL TO FORM
  ======================================================= */

  useEffect(() => {

    if (
      formOpen &&
      formRef.current
    ) {

      const timer =
        window.setTimeout(
          () => {

            formRef.current
              ?.scrollIntoView({
                behavior:
                  "smooth",

                block:
                  "center"
              });

          },
          100
        );

      return () =>
        window.clearTimeout(
          timer
        );
    }

  }, [
    formOpen,
    editingId
  ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(
      () => ({

        total:
          vehicles.length,

        cars:
          vehicles.filter(
            (vehicle) =>
              vehicle.vehicleType ===
              "Car"
          ).length,

        twoWheelers:
          vehicles.filter(
            (vehicle) =>
              [
                "Bike",
                "Scooter"
              ].includes(
                vehicle.vehicleType
              )
          ).length,

        commercial:
          vehicles.filter(
            (vehicle) =>
              vehicle.vehicleType ===
              "Commercial"
          ).length

      }),
      [vehicles]
    );

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const filteredVehicles =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      return vehicles.filter(
        (vehicle) => {

          const number =
            String(
              vehicle.vehicleNumber ||
              ""
            ).toLowerCase();

          const model =
            String(
              vehicle.vehicleModel ||
              ""
            ).toLowerCase();

          const matchesSearch =
            number.includes(query) ||
            model.includes(query);

          const matchesType =
            activeFilter ===
              "All Vehicles" ||
            vehicle.vehicleType ===
              activeFilter;

          return (
            matchesSearch &&
            matchesType
          );
        }
      );

    }, [
      vehicles,
      search,
      activeFilter
    ]);

  /* =======================================================
     RESET FORM
  ======================================================= */

  function resetForm() {

    setVehicleNumber("");
    setVehicleType("Car");
    setVehicleModel("");

    setEditingId(null);
    setFormOpen(false);
  }

  /* =======================================================
     OPEN ADD
  ======================================================= */

  function openAddForm() {

    setVehicleNumber("");
    setVehicleType("Car");
    setVehicleModel("");

    setEditingId(null);

    setMessage("");

    setFormOpen(true);
  }

  /* =======================================================
     EDIT
  ======================================================= */

  function handleEdit(
    vehicle
  ) {

    setVehicleNumber(
      vehicle.vehicleNumber ||
      ""
    );

    setVehicleType(
      vehicle.vehicleType ||
      "Car"
    );

    setVehicleModel(
      vehicle.vehicleModel ||
      ""
    );

    setEditingId(
      vehicle.id
    );

    setFormOpen(true);
    setMessage("");
  }

  /* =======================================================
     ADD / UPDATE VEHICLE
  ======================================================= */

  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    if (!token) {

      showMessage(
        "Please login first.",
        "error"
      );

      return;
    }

    const cleanNumber =
      vehicleNumber
        .trim()
        .toUpperCase()
        .replace(/\s/g, "");

    const cleanModel =
      vehicleModel.trim();

    if (
      !cleanNumber ||
      !vehicleType ||
      !cleanModel
    ) {

      showMessage(
        "Please complete all vehicle details.",
        "error"
      );

      return;
    }

    setSaving(true);
    setMessage("");

    try {

      const isEditing =
        Boolean(editingId);

      const url =
        isEditing
          ? `${API_URL}/api/vehicles/${encodeURIComponent(
              editingId
            )}`
          : `${API_URL}/api/vehicles`;

      const response =
        await fetch(
          url,
          {
            method:
              isEditing
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body:
              JSON.stringify({
                vehicleNumber:
                  cleanNumber,

                vehicleType,

                vehicleModel:
                  cleanModel
              })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Could not save vehicle."
        );
      }

      showMessage(
        isEditing
          ? "Vehicle details updated successfully."
          : "Vehicle registered successfully. Its ParkSafe QR identity is now active."
      );

      resetForm();

      await loadVehicles();

    } catch (error) {

      console.error(
        "Vehicle save error:",
        error
      );

      showMessage(
        error.message ||
        "Could not save vehicle.",
        "error"
      );

    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     REMOVE VEHICLE
  ======================================================= */

  async function handleRemove(
    vehicle
  ) {

    if (!token) {

      showMessage(
        "Please login first.",
        "error"
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${vehicle.vehicleNumber} from your ParkSafe garage?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      vehicle.id
    );

    setMessage("");

    try {

      const response =
        await fetch(
          `${API_URL}/api/vehicles/${encodeURIComponent(
            vehicle.id
          )}`,
          {
            method:
              "DELETE",

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
          "Could not remove vehicle."
        );
      }

      setVehicles(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              vehicle.id
          )
      );

      if (
        editingId ===
        vehicle.id
      ) {
        resetForm();
      }

      showMessage(
        "Vehicle removed from your garage."
      );

    } catch (error) {

      console.error(
        "Vehicle removal error:",
        error
      );

      showMessage(
        error.message ||
        "Could not remove vehicle.",
        "error"
      );

    } finally {

      setDeletingId(null);
    }
  }

  /* =======================================================
     DOWNLOAD QR
  ======================================================= */

  function downloadQR(
    vehicle
  ) {

    const canvas =
      document.getElementById(
        `qr-${vehicle.id}`
      );

    if (!canvas) {

      showMessage(
        "QR code is not ready yet. Please try again.",
        "error"
      );

      return;
    }

    const link =
      document.createElement(
        "a"
      );

    link.download =
      `${vehicle.vehicleNumber}-ParkSafe-QR.png`;

    link.href =
      canvas.toDataURL(
        "image/png"
      );

    link.click();

    showMessage(
      `QR code for ${vehicle.vehicleNumber} downloaded.`
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="my-vehicles-page garage-page">

      {/* =================================================
          PAGE INTRO
      ================================================= */}

      <div className="garage-welcome">

        <div>

          <span className="eyebrow">
            YOUR PERSONAL GARAGE
          </span>

          <h1>
            My Garage
            <span className="garage-heading-dot">
              .
            </span>
          </h1>

          <p className="subtitle">
            Every vehicle, one secure
            place. Manage your vehicles
            and their ParkSafe identities.
          </p>

        </div>

        <button
          type="button"
          className="garage-add-button"
          onClick={openAddForm}
        >
          <span>
            ＋
          </span>

          Add Vehicle
        </button>

      </div>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="garage-hero">

        <div className="garage-hero-content">

          <span className="garage-hero-tag">

            <span className="garage-live-dot" />

            PARKSAFE DATABASE CONNECTED

          </span>

          <h2>
            Your vehicles.
            <br />

            Your identity.
            Your safety.
          </h2>

          <p>
            Your registered vehicles are
            securely linked with ParkSafe
            and each vehicle receives its
            own scannable QR identity.
          </p>

          <div className="garage-hero-bottom">

            <div className="garage-hero-mini-stat">

              <strong>
                {stats.total
                  .toString()
                  .padStart(
                    2,
                    "0"
                  )}
              </strong>

              <span>
                Registered vehicles
              </span>

            </div>

            <div className="garage-hero-divider" />

            <div className="garage-hero-mini-stat">

              <strong>
                {stats.total}
              </strong>

              <span>
                Active QR identities
              </span>

            </div>

          </div>

        </div>

        <div
          className="garage-hero-art"
          aria-hidden="true"
        >

          <div className="garage-orbit garage-orbit-one" />

          <div className="garage-orbit garage-orbit-two" />

          <div className="garage-car-illustration">
            🚘
          </div>

          <div className="garage-floating-card">

            <span>
              ✦
            </span>

            <div>

              <strong>
                ParkSafe ID
              </strong>

              <small>
                Database verified
              </small>

            </div>

          </div>

          <div className="garage-floating-shield">
            ✓
          </div>

        </div>

      </section>

      {/* =================================================
          STATISTICS
      ================================================= */}

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
          value={
            stats.commercial
          }
          detail="Utility vehicles"
        />

      </section>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div
          className={`garage-message ${
            messageType ===
            "error"
              ? "garage-message-error"
              : ""
          }`}
          role="status"
        >

          <span>
            {messageType ===
            "error"
              ? "!"
              : "✓"}
          </span>

          {message}

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
            aria-label="Dismiss message"
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          ADD / EDIT FORM
      ================================================= */}

      {formOpen && (
        <section
          className="garage-form-panel"
          id="garage-form"
          ref={formRef}
        >

          <div className="garage-form-heading">

            <div>

              <span className="eyebrow">
                {editingId
                  ? "UPDATE YOUR DETAILS"
                  : "REGISTER VEHICLE"}
              </span>

              <h2>
                {editingId
                  ? "Edit Vehicle"
                  : "Add a Vehicle"}
              </h2>

              <p>
                Vehicle details will be
                securely registered with
                ParkSafe.
              </p>

            </div>

            <button
              type="button"
              className="garage-form-close"
              onClick={resetForm}
              aria-label="Close vehicle form"
              disabled={saving}
            >
              ×
            </button>

          </div>

          <form
            className="garage-form"
            onSubmit={
              handleSubmit
            }
          >

            <div className="garage-form-grid">

              <div className="garage-field">

                <label htmlFor="garage-number">
                  Registration Number
                </label>

                <input
                  id="garage-number"
                  type="text"
                  placeholder="e.g. UK01AB1234"
                  value={
                    vehicleNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setVehicleNumber(
                      event.target.value
                        .toUpperCase()
                    )
                  }
                  required
                  disabled={saving}
                />

                <small>
                  Enter the number displayed
                  on your number plate.
                </small>

              </div>

              <div className="garage-field">

                <label htmlFor="garage-type">
                  Vehicle Category
                </label>

                <select
                  id="garage-type"
                  value={
                    vehicleType
                  }
                  onChange={(
                    event
                  ) =>
                    setVehicleType(
                      event.target.value
                    )
                  }
                  disabled={saving}
                >

                  <option value="Car">
                    Car
                  </option>

                  <option value="Bike">
                    Motorcycle / Bike
                  </option>

                  <option value="Scooter">
                    Scooter
                  </option>

                  <option value="Commercial">
                    Commercial Vehicle
                  </option>

                </select>

                <small>
                  Select the vehicle
                  category.
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
                  value={
                    vehicleModel
                  }
                  onChange={(
                    event
                  ) =>
                    setVehicleModel(
                      event.target.value
                    )
                  }
                  required
                  disabled={saving}
                />

                <small>
                  For example, Honda
                  Activa, Tata Nexon or
                  Royal Enfield Classic.
                </small>

              </div>

            </div>

            <div className="garage-form-actions">

              <button
                type="submit"
                className="garage-submit-button"
                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : editingId
                  ? "Save Vehicle Changes"
                  : "Add to My Garage"}

                {!saving && (
                  <span>
                    →
                  </span>
                )}

              </button>

              <button
                type="button"
                className="garage-cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>

        </section>
      )}

      {/* =================================================
          VEHICLE COLLECTION
      ================================================= */}

      <section className="garage-collection">

        <div className="garage-collection-heading">

          <div>

            <span className="eyebrow">
              YOUR COLLECTION
            </span>

            <h2>
              Registered Vehicles
            </h2>

            <p>
              Database-linked vehicles
              and their individual
              ParkSafe QR identities.
            </p>

          </div>

          <span className="garage-total-pill">
            {stats.total}{" "}
            {stats.total === 1
              ? "VEHICLE"
              : "VEHICLES"}
          </span>

        </div>

        {/* =============================================
            TOOLBAR
        ============================================= */}

        <div className="garage-toolbar">

          <div className="garage-search">

            <span>
              ⌕
            </span>

            <input
              type="search"
              placeholder="Search by model or registration number..."
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              aria-label="Search vehicles"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

          <div
            className="garage-filters"
            aria-label="Filter vehicles"
          >

            {vehicleTypes.map(
              (type) => (
                <button
                  type="button"
                  key={type}
                  className={
                    activeFilter ===
                    type
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveFilter(
                      type
                    )
                  }
                >
                  {type}
                </button>
              )
            )}

          </div>

        </div>

        {/* =============================================
            LOADING
        ============================================= */}

        {loading ? (
          <div className="garage-empty-state">

            <div className="garage-empty-icon">
              ↻
            </div>

            <h3>
              Loading your garage...
            </h3>

            <p>
              Syncing your registered
              vehicles with ParkSafe.
            </p>

          </div>
        ) : filteredVehicles.length ===
          0 ? (
          <div className="garage-empty-state">

            <div className="garage-empty-icon">
              🚘
            </div>

            <h3>
              {vehicles.length === 0
                ? "Your garage is waiting."
                : "No matching vehicles found."}
            </h3>

            <p>
              {vehicles.length === 0
                ? "Add your first vehicle to create its database-linked ParkSafe QR identity."
                : "Try another search term or choose a different vehicle category."}
            </p>

            {vehicles.length ===
              0 && (
              <button
                type="button"
                className="garage-submit-button"
                onClick={
                  openAddForm
                }
              >
                Add Your First Vehicle →
              </button>
            )}

            {(search ||
              activeFilter !==
                "All Vehicles") && (
              <button
                type="button"
                className="garage-reset-filter"
                onClick={() => {
                  setSearch("");
                  setActiveFilter(
                    "All Vehicles"
                  );
                }}
              >
                Clear filters
              </button>
            )}

          </div>
        ) : (
          <div className="garage-vehicle-grid">

            {filteredVehicles.map(
              (
                vehicle,
                index
              ) => (

                <article
                  className="garage-vehicle-card"
                  key={
                    vehicle.id
                  }
                >

                  {/* TOP */}

                  <div className="garage-card-top">

                    <div
                      className={`garage-vehicle-avatar garage-avatar-${
                        index % 4
                      }`}
                    >
                      <VehicleIcon
                        type={
                          vehicle.vehicleType
                        }
                      />
                    </div>

                    <span className="garage-demo-badge">

                      <span />

                      DATABASE VERIFIED

                    </span>

                  </div>

                  {/* VEHICLE */}

                  <div className="garage-vehicle-info">

                    <span className="garage-vehicle-category">
                      {String(
                        vehicle.vehicleType ||
                        "Vehicle"
                      ).toUpperCase()}
                    </span>

                    <h3>
                      {vehicle.vehicleModel ||
                        "Registered Vehicle"}
                    </h3>

                    <div className="garage-registration">
                      {
                        vehicle.vehicleNumber
                      }
                    </div>

                  </div>

                  {/* META */}

                  <div className="garage-vehicle-meta">

                    <div>

                      <span>
                        Vehicle type
                      </span>

                      <strong>
                        {vehicle.vehicleType}
                      </strong>

                    </div>

                    <div>

                      <span>
                        ParkSafe DB ID
                      </span>

                      <strong>
                        {vehicle.id}
                      </strong>

                    </div>

                  </div>

                  {/* =========================================
                      QR IDENTITY
                  ========================================= */}

                  <div className="garage-qr-pass">

                    <div className="garage-qr-pass-heading">

                      <div>

                        <span className="garage-qr-kicker">
                          DIGITAL VEHICLE ID
                        </span>

                        <h4>
                          ParkSafe Identity
                        </h4>

                      </div>

                      <span className="garage-qr-mark">
                        P
                      </span>

                    </div>

                    <div className="garage-qr-frame">

                      <QRCodeCanvas
                        id={`qr-${vehicle.id}`}
                        value={`${QR_BASE_URL}${encodeURIComponent(
                          vehicle.id
                        )}`}
                        size={190}
                        level="H"
                        includeMargin
                        bgColor="#ffffff"
                        fgColor="#172747"
                      />

                    </div>

                    <p className="garage-qr-caption">
                      Scan to securely identify{" "}
                      <strong>
                        {
                          vehicle.vehicleNumber
                        }
                      </strong>
                    </p>

                    <button
                      type="button"
                      className="garage-download-button"
                      onClick={() =>
                        downloadQR(
                          vehicle
                        )
                      }
                    >
                      <span>
                        ↓
                      </span>

                      Download QR Code
                    </button>

                  </div>

                  {/* ACTIONS */}

                  <div className="garage-card-actions">

                    <button
                      type="button"
                      className="garage-edit-button"
                      onClick={() =>
                        handleEdit(
                          vehicle
                        )
                      }
                    >
                      <span>
                        ✎
                      </span>

                      Edit Details
                    </button>

                    <button
                      type="button"
                      className="garage-remove-button"
                      onClick={() =>
                        handleRemove(
                          vehicle
                        )
                      }
                      disabled={
                        deletingId ===
                        vehicle.id
                      }
                      aria-label={`Remove ${vehicle.vehicleNumber}`}
                    >

                      {deletingId ===
                      vehicle.id
                        ? "Removing..."
                        : "Remove"}

                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>

      {/* =================================================
          DATABASE NOTE
      ================================================= */}

      <div className="garage-storage-note">

        <span>
          ✓
        </span>

        <p>
          <strong>
            ParkSafe database:
          </strong>{" "}

          Your vehicles are now stored
          in your ParkSafe account.
          QR codes use the real database
          vehicle ID, so they can be
          scanned from another device.
        </p>

      </div>

    </div>
  );
}