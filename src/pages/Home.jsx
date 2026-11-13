
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Identify Vehicle",
    description:
      "Scan the vehicle's QR code or search its registration number."
  },
  {
    number: "02",
    title: "Notify Owner",
    description:
      "Send a parking alert so the owner knows about the obstruction."
  },
  {
    number: "03",
    title: "Allow Response Time",
    description:
      "Give the vehicle owner an opportunity to acknowledge and resolve the issue."
  },
  {
    number: "04",
    title: "Escalate if Unresolved",
    description:
      "If the issue continues, proceed with further action and submit evidence."
  }
];

export default function Home() {
  return (
    <div className="home-page">

      {/* Welcome Section */}
      <section className="home-welcome">
        <span className="eyebrow">SMART PARKING SOLUTION</span>

        <h1>Making parking safer, one scan at a time.</h1>

        <p className="subtitle">
          A smarter way to connect people, notify vehicle owners
          and help resolve parking issues responsibly.
        </p>
      </section>

      {/* Main Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-hero-label">
            PARKSAFE ASSISTANCE
          </span>

          <h2>
            Is a vehicle blocking your way?
          </h2>

          <p>
            Identify the vehicle, notify its owner and give them
            an opportunity to correct the parking issue before
            taking further action.
          </p>

          <Link to="/vehicles" className="home-hero-button">
            Identify a Vehicle
            <span>→</span>
          </Link>

          <div className="home-hero-note">
            <span className="home-note-dot"></span>
            Fair notification before escalation
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="home-visual-circle">
            <div className="home-visual-icon">P</div>
          </div>

          <div className="home-visual-card">
            <span className="home-visual-check">✓</span>
            <div>
              <strong>ParkSafe</strong>
              <small>Smarter parking management</small>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="home-process">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">SIMPLE & RESPONSIBLE</span>
            <h2>How ParkSafe Works</h2>
            <p>
              A step-by-step approach to resolving parking issues.
            </p>
          </div>
        </div>

        <div className="home-steps-grid">
          {steps.map((step) => (
            <article className="home-step-card" key={step.number}>
              <span className="home-step-number">
                {step.number}
              </span>

              <h3>{step.title}</h3>

              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom Information */}
      <section className="home-bottom-note">
        <div className="home-bottom-icon">i</div>

        <div>
          <h3>Responsible reporting matters</h3>
          <p>
            ParkSafe follows a progressive notification process.
            Formal reporting is intended for parking issues that
            remain unresolved after the owner has been notified.
          </p>
        </div>
      </section>

    </div>
  );
}
