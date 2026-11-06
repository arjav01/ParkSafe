
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <span className="eyebrow">SMART PARKING SOLUTION</span>

      <h1>Welcome to ParkSafe</h1>

      <p className="subtitle">
        Identify vehicles, notify owners and report
        unresolved parking violations.
      </p>

      <div className="hero-card">
        <div>
          <span className="hero-tag">SMART PARKING SYSTEM</span>
          <h2>Report a Parking Violation</h2>
          <p>
            Help keep roads clear. Identify a vehicle and
            notify its owner before submitting a report.
          </p>

          <Link to="/vehicles" className="primary-button">
            Identify Vehicle →
          </Link>
        </div>
      </div>

      <h2 className="section-heading">How It Works</h2>

      <div className="info-grid">
        <div className="info-card">
          <span className="step-number">01</span>
          <h3>Identify</h3>
          <p>Scan QR code or search vehicle number.</p>
        </div>

        <div className="info-card">
          <span className="step-number">02</span>
          <h3>Notify</h3>
          <p>Send a parking alert to the owner.</p>
        </div>

        <div className="info-card">
          <span className="step-number">03</span>
          <h3>Report</h3>
          <p>Submit evidence if the issue continues.</p>
        </div>
      </div>
    </div>
  );
}

