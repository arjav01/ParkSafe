
import { useState } from "react";
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

const issueTypes = [
  "Parked in a No Parking Zone",
  "Blocking an Entrance or Gate",
  "Blocking a Road or Pathway",
  "Wrongly Parked",
  "Other Parking Issue",
];

export default function ScanVehicle() {
  const { id } = useParams();
  const vehicle = demoVehicles[id];

  const [showReportForm, setShowReportForm] = useState(false);
  const [issueType, setIssueType] = useState(issueTypes[0]);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleReportSubmit = (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError("Please describe the parking issue.");
      return;
    }

    // Demonstration only: no report is sent to the backend yet.
    setSubmitted(true);
    setError("");
  };

  return (
    <main className="scan-page">
      <section className="scan-card">
        <div className="scan-brand">P</div>

        <h1>Park Safe</h1>

        <p className="scan-subtitle">
          Smart Parking Assistance
        </p>

        {!vehicle ? (
          <>
            <h2>Vehicle Not Found</h2>

            <p className="scan-message">
              This QR code does not match a recognised
              demonstration vehicle.
            </p>
          </>
        ) : submitted ? (
          <>
            <div className="scan-success">
              Report Submitted
            </div>

            <div className="report-success-icon">✓</div>

            <h2>Thank You!</h2>

            <p className="scan-message">
              Your parking issue report has been recorded
              in this demonstration session.
            </p>

            <div className="scan-details">
              <span>Vehicle</span>
              <strong>{vehicle.vehicleNumber}</strong>
            </div>

            <div className="scan-details">
              <span>Issue</span>
              <strong>{issueType}</strong>
            </div>

            <button
              type="button"
              className="scan-secondary-button"
              onClick={() => {
                setSubmitted(false);
                setShowReportForm(false);
                setDescription("");
                setIssueType(issueTypes[0]);
              }}
            >
              Back to Vehicle Details
            </button>
          </>
        ) : (
          <>
            <div className="scan-success">
              QR Code Recognised
            </div>

            <h2>{vehicle.vehicleModel}</h2>

            <p className="scan-registration">
              {vehicle.vehicleNumber}
            </p>

            <div className="scan-details">
              <span>Vehicle Type</span>
              <strong>{vehicle.vehicleType}</strong>
            </div>

            {!showReportForm ? (
              <>
                <p className="scan-message">
                  Have you noticed a parking issue involving
                  this vehicle? You can notify its owner
                  through Park Safe.
                </p>

                <button
                  type="button"
                  className="scan-report-button"
                  onClick={() => setShowReportForm(true)}
                >
                  Report Parking Issue
                </button>
              </>
            ) : (
              <form
                className="scan-report-form"
                onSubmit={handleReportSubmit}
              >
                <h3>Report a Parking Issue</h3>

                <p>
                  Tell us what is wrong with this vehicle's
                  parking.
                </p>

                <label htmlFor="issue-type">
                  Type of Issue
                </label>

                <select
                  id="issue-type"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                >
                  {issueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <label htmlFor="issue-description">
                  Describe the Issue
                </label>

                <textarea
                  id="issue-description"
                  rows="4"
                  placeholder="Explain how this vehicle is causing a parking problem..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                {error && (
                  <p className="scan-form-error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="scan-report-button"
                >
                  Submit Report
                </button>

                <button
                  type="button"
                  className="scan-secondary-button"
                  onClick={() => {
                    setShowReportForm(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </form>
            )}
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
