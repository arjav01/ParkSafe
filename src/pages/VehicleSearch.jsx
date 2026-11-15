
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";

const STORAGE_KEY = "parksafeVehicles";
const API_URL = "https://parksafe-backend-s51i.onrender.com";

function VehicleIllustration() {
  return (
    <svg
      className="vs-car-svg"
      viewBox="0 0 520 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Illustration of a vehicle in a parking space"
      role="img"
    >
      <defs>
        <linearGradient id="vs-car-body" x1="80" y1="130" x2="400" y2="250">
          <stop stopColor="#62C9F5" />
          <stop offset="1" stopColor="#3277DB" />
        </linearGradient>
        <linearGradient id="vs-window" x1="170" y1="100" x2="300" y2="180">
          <stop stopColor="#E1F7FF" />
          <stop offset="1" stopColor="#75B9E8" />
        </linearGradient>
        <filter id="vs-glow">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Parking bay */}
      <path
        d="M305 60V248H480V60"
        stroke="#64E5DE"
        strokeWidth="3"
        strokeDasharray="9 9"
        opacity=".7"
      />
      <path
        d="M330 85V224H455V85"
        stroke="#7FCFEF"
        strokeWidth="1.5"
        opacity=".35"
      />

      {/* Parking signal */}
      <circle cx="392" cy="43" r="28" fill="#48D9CE" opacity=".12" />
      <circle cx="392" cy="43" r="17" stroke="#58E5D7" opacity=".8" />
      <path d="M382 43H402M392 33V53" stroke="#58E5D7" strokeWidth="2" />

      {/* Car shadow */}
      <ellipse
        cx="190"
        cy="251"
        rx="145"
        ry="15"
        fill="#071D3E"
        opacity=".35"
        filter="url(#vs-glow)"
      />

      {/* Car body */}
      <g className="vs-moving-car">
        <path
          d="M50 204L65 163C70 150 80 142 95 138L133 128L165 91C174 80 187 74 202 74H288C306 74 322 84 332 98L363 143L402 158C414 163 421 175 421 189V218C421 230 412 239 400 239H75C59 239 47 225 50 204Z"
          fill="url(#vs-car-body)"
          stroke="#91E3FF"
          strokeWidth="3"
        />

        {/* Windows */}
        <path
          d="M150 126L179 91C185 83 194 80 204 80H237V145H137L150 126Z"
          fill="url(#vs-window)"
          stroke="#D3F4FF"
          strokeWidth="3"
        />
        <path
          d="M247 80H286C300 80 312 88 320 100L348 145H247V80Z"
          fill="url(#vs-window)"
          stroke="#D3F4FF"
          strokeWidth="3"
        />

        {/* Window divider */}
        <path d="M242 80V146" stroke="#D8F4FF" strokeWidth="5" />

        {/* Door */}
        <path
          d="M242 151V211"
          stroke="#1B5BB4"
          strokeWidth="2"
          opacity=".6"
        />
        <path
          d="M260 161H286"
          stroke="#B6E9FF"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* QR sticker */}
        <rect x="277" y="171" width="36" height="36" rx="5" fill="white" />
        <path
          d="M284 178H291V185H284ZM298 178H305V185H298ZM284 192H291V199H284ZM298 192H301V195H298ZM305 195V199H301"
          stroke="#245A9B"
          strokeWidth="2.5"
        />

        {/* Headlight and tail light */}
        <path d="M397 176L415 182" stroke="#FFF2B8" strokeWidth="7" strokeLinecap="round" />
        <rect x="53" y="192" width="8" height="24" rx="4" fill="#FF758A" />

        {/* Wheels */}
        <g>
          <circle cx="128" cy="235" r="29" fill="#102747" stroke="#7599C6" strokeWidth="4" />
          <circle cx="128" cy="235" r="15" fill="#B8D7EE" />
          <circle cx="128" cy="235" r="6" fill="#4874A8" />
          <circle cx="353" cy="235" r="29" fill="#102747" stroke="#7599C6" strokeWidth="4" />
          <circle cx="353" cy="235" r="15" fill="#B8D7EE" />
          <circle cx="353" cy="235" r="6" fill="#4874A8" />
        </g>
      </g>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v2M14 20h2M20 19v2" />
    </svg>
  );
}

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

      const response = await fetch(
        `${API_URL}/api/vehicles/${encodeURIComponent(cleanNumber)}`
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
          ? "Backend connection failed. Please try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function handleScannedCode(decodedText) {
    try {
      const scannedUrl = new URL(decodedText);

      if (scannedUrl.pathname.startsWith("/scan/")) {
        navigate(scannedUrl.pathname);
        return;
      }
    } catch {
      // Not a URL. Check the ParkSafe demo identifier.
    }

    if (decodedText.startsWith("PARKSAFE-DEMO:")) {
      const id = decodedText.replace("PARKSAFE-DEMO:", "").trim();
      navigate(`/scan/${encodeURIComponent(id)}`);
      return;
    }

    searchVehicle(decodedText);
  }

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 230, height: 230 },
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

  function startScanner() {
    setError("");
    setVehicle(null);
    setScanning(true);
  }

  return (
    <div className="vs-page">
      <style>{`
        .vs-page {
          width: 100%;
          color: #1c2c4d;
          animation: vs-fade-in .55s ease both;
        }

        @keyframes vs-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .vs-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #665af0;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .vs-eyebrow::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34c9b4;
          box-shadow: 0 0 0 4px rgba(52,201,180,.12);
        }

        .vs-heading {
          margin: 13px 0 9px;
          color: #192b4c;
          font-size: clamp(32px, 4vw, 46px);
          font-weight: 900;
          letter-spacing: -1.8px;
        }

        .vs-intro {
          margin: 0;
          color: #8192ad;
          font-size: 16px;
          line-height: 1.7;
        }

        /* HERO */

        .vs-hero {
          position: relative;
          display: grid;
          grid-template-columns: 1fr .95fr;
          align-items: center;
          gap: 20px;
          min-height: 310px;
          margin: 29px 0 31px;
          padding: 35px 43px;
          overflow: hidden;
          border-radius: 25px;
          background: linear-gradient(112deg, #142f58 0%, #1b477b 58%, #2469a2 100%);
          box-shadow: 0 20px 45px rgba(26,62,110,.15);
        }

        .vs-hero::before,
        .vs-hero::after {
          content: "";
          position: absolute;
          border: 1px solid rgba(159,218,255,.12);
          border-radius: 50%;
          pointer-events: none;
        }

        .vs-hero::before {
          width: 410px;
          height: 410px;
          top: -270px;
          right: 10%;
        }

        .vs-hero::after {
          width: 290px;
          height: 290px;
          bottom: -230px;
          right: 25%;
        }

        .vs-hero-content {
          position: relative;
          z-index: 2;
          max-width: 460px;
        }

        .vs-hero-label {
          color: #73e5dc;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2.2px;
        }

        .vs-hero h2 {
          max-width: 440px;
          margin: 17px 0 13px;
          color: white;
          font-size: clamp(27px, 3vw, 38px);
          line-height: 1.2;
          letter-spacing: -1.2px;
          font-weight: 900;
        }

        .vs-hero p {
          max-width: 420px;
          margin: 0;
          color: #c7d9f0;
          font-size: 14px;
          line-height: 1.85;
        }

        .vs-hero-points {
          display: flex;
          flex-wrap: wrap;
          gap: 17px;
          margin-top: 22px;
        }

        .vs-hero-point {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #d4e7fa;
          font-size: 11px;
          font-weight: 650;
        }

        .vs-hero-point span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #53dec1;
        }

        .vs-hero-art {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
        }

        .vs-art-panel {
          position: relative;
          width: 100%;
          max-width: 470px;
          padding: 14px 8px 4px;
          border: 1px solid rgba(184,221,255,.16);
          border-radius: 24px;
          background: rgba(255,255,255,.045);
          backdrop-filter: blur(5px);
        }

        .vs-art-caption {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-left: 13px;
          color: #c6e7f9;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.6px;
        }

        .vs-art-caption span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #55dfc3;
          box-shadow: 0 0 0 5px rgba(85,223,195,.12);
        }

        .vs-car-svg {
          display: block;
          width: 100%;
          max-height: 240px;
          overflow: visible;
        }

        .vs-moving-car {
          transform-origin: 230px 220px;
          animation: vs-car-bob 3.5s ease-in-out infinite;
        }

        @keyframes vs-car-bob {
          0%, 100% { transform: translateX(-5px); }
          50% { transform: translateX(7px); }
        }

        .vs-art-footer {
          padding: 0 15px 10px;
          color: #a9c9e8;
          font-size: 10px;
        }

        .vs-floating-badge {
          position: absolute;
          right: 8px;
          top: 49px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border: 1px solid #e4edfa;
          border-radius: 13px;
          background: #fff;
          color: #243b60;
          box-shadow: 0 9px 25px rgba(3,22,48,.2);
          animation: vs-float 3s ease-in-out infinite;
        }

        @keyframes vs-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        .vs-floating-icon {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: #e9f2ff;
          color: #3878d9;
        }

        .vs-floating-badge strong,
        .vs-floating-badge small {
          display: block;
        }

        .vs-floating-badge strong {
          font-size: 10px;
        }

        .vs-floating-badge small {
          margin-top: 3px;
          color: #8798b0;
          font-size: 9px;
        }

        /* SEARCH AREA */

        .vs-section-heading {
          margin-bottom: 17px;
        }

        .vs-section-heading h2 {
          margin: 0;
          color: #1b2d4e;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -.5px;
        }

        .vs-section-heading p {
          margin: 6px 0 0;
          color: #8797b0;
          font-size: 13px;
        }

        .vs-method-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 19px;
        }

        .vs-method-card {
          position: relative;
          padding: 25px;
          overflow: hidden;
          border: 1px solid #e4ebf6;
          border-radius: 20px;
          background: white;
          box-shadow: 0 8px 25px rgba(38,68,111,.045);
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }

        .vs-method-card:hover {
          transform: translateY(-5px);
          border-color: #cbdafa;
          box-shadow: 0 16px 32px rgba(38,68,111,.09);
        }

        .vs-method-top {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 19px;
        }

        .vs-method-icon {
          display: grid;
          place-items: center;
          width: 47px;
          height: 47px;
          border-radius: 14px;
          color: #5c65e9;
          background: linear-gradient(135deg, #edf0ff, #e8f5ff);
        }

        .vs-method-card h3 {
          margin: 0;
          color: #213453;
          font-size: 17px;
          font-weight: 850;
        }

        .vs-method-card > p {
          margin: 7px 0 18px;
          color: #8796af;
          font-size: 12px;
          line-height: 1.7;
        }

        .vs-search-form label {
          display: block;
          margin-bottom: 9px;
          color: #344563;
          font-size: 12px;
          font-weight: 800;
        }

        .vs-input-wrap {
          position: relative;
        }

        .vs-search-input {
          width: 100%;
          height: 53px;
          padding: 0 15px;
          border: 1.5px solid #dfe7f3;
          border-radius: 12px;
          outline: none;
          background: #f9fbff;
          color: #1d3153;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
        }

        .vs-search-input:focus {
          border-color: #7770f2;
          background: white;
          box-shadow: 0 0 0 4px rgba(112,103,240,.11);
        }

        .vs-search-input::placeholder {
          color: #a5b0c2;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0;
        }

        .vs-primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 48px;
          margin-top: 15px;
          padding: 0 20px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(110deg, #665bea, #477ee9);
          color: white;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          box-shadow: 0 7px 17px rgba(83,99,222,.2);
          transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease;
        }

        .vs-primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 11px 22px rgba(83,99,222,.3);
        }

        .vs-primary-button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .vs-scanner-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          width: 100%;
          min-height: 105px;
          border: 1.5px dashed #cbd8ee;
          border-radius: 15px;
          background: linear-gradient(135deg, #f8faff, #f1f6ff);
          color: #4c62bc;
          font-size: 14px;
          font-weight: 850;
          cursor: pointer;
          transition: all .22s ease;
        }

        .vs-scanner-button:hover {
          border-color: #7d82ed;
          background: #f0f2ff;
          transform: translateY(-2px);
        }

        .vs-scanner-button span {
          display: block;
          margin-top: 5px;
          color: #8c9bb3;
          font-size: 11px;
          font-weight: 500;
        }

        .vs-scanner-area {
          margin-top: 15px;
        }

        .vs-scanner-area #qr-reader {
          width: 100%;
          overflow: hidden;
          border: 1px solid #dce6f4 !important;
          border-radius: 14px;
        }

        .vs-scanner-area #qr-reader video {
          border-radius: 12px;
        }

        .vs-scanner-area #qr-reader button {
          padding: 8px 13px;
          border: 0;
          border-radius: 8px;
          background: #5666df;
          color: white;
          cursor: pointer;
        }

        .vs-scanner-area #qr-reader select {
          max-width: 100%;
          padding: 7px;
          border: 1px solid #dce6f4;
          border-radius: 7px;
        }

        .vs-stop-button {
          margin-top: 12px;
          padding: 10px 16px;
          border: 1px solid #f2c7ce;
          border-radius: 10px;
          background: #fff3f4;
          color: #c64d60;
          font-weight: 800;
          cursor: pointer;
        }

        /* STATUS AND RESULT */

        .vs-error {
          margin-top: 20px;
          padding: 14px 17px;
          border: 1px solid #fecaca;
          border-radius: 12px;
          background: #fff1f2;
          color: #c33b4b;
          font-size: 13px;
          font-weight: 650;
        }

        .vs-result {
          margin-top: 24px;
          padding: 25px;
          border: 1px solid #dce8f7;
          border-radius: 20px;
          background: white;
          box-shadow: 0 12px 30px rgba(37,67,112,.07);
          animation: vs-fade-in .35s ease both;
        }

        .vs-result-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .vs-verified-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: 30px;
          background: #e9f9f3;
          color: #168b69;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .8px;
        }

        .vs-verified-label::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #24b88b;
        }

        .vs-result h2 {
          margin: 18px 0;
          color: #1b2e50;
          font-size: 25px;
          font-weight: 900;
          letter-spacing: .5px;
        }

        .vs-result-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .vs-result-detail {
          padding: 14px;
          border: 1px solid #edf1f8;
          border-radius: 12px;
          background: #f8faff;
        }

        .vs-result-detail small {
          display: block;
          margin-bottom: 6px;
          color: #8a9ab3;
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: .8px;
        }

        .vs-result-detail strong {
          color: #304461;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .vs-result-action {
          margin-top: 20px;
        }

        .vs-result-action .vs-primary-button {
          margin-top: 0;
        }

        .vs-help-note {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-top: 22px;
          padding: 17px 19px;
          border: 1px solid #dce8fa;
          border-radius: 15px;
          background: #edf4ff;
        }

        .vs-help-icon {
          display: grid;
          place-items: center;
          flex: 0 0 30px;
          height: 30px;
          border-radius: 9px;
          background: #dceaff;
          color: #4779cf;
          font-weight: 900;
        }

        .vs-help-note strong {
          display: block;
          margin-bottom: 5px;
          color: #30496e;
          font-size: 12px;
        }

        .vs-help-note p {
          margin: 0;
          color: #788da9;
          font-size: 11px;
          line-height: 1.7;
        }

        @media (max-width: 900px) {
          .vs-hero {
            grid-template-columns: 1fr 1fr;
            padding: 28px;
          }

          .vs-method-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .vs-hero {
            grid-template-columns: 1fr;
            padding: 27px 22px;
          }

          .vs-hero-art {
            margin-top: 8px;
          }

          .vs-art-panel {
            max-width: 420px;
          }

          .vs-floating-badge {
            right: 0;
            top: 35px;
            transform: scale(.85);
            transform-origin: top right;
          }

          .vs-result-grid {
            grid-template-columns: 1fr;
          }

          .vs-method-card {
            padding: 21px;
          }

          .vs-heading {
            letter-spacing: -1px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vs-page *,
          .vs-page *::before,
          .vs-page *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* PAGE HEADING */}
      <section className="vs-page-heading">
        <span className="vs-eyebrow">Vehicle Identification</span>

        <h1 className="vs-heading">Find a Vehicle</h1>

        <p className="vs-intro">
          Identify a vehicle through its registration number or
          scan its ParkSafe QR code.
        </p>
      </section>

      {/* HERO */}
      <section className="vs-hero">
        <div className="vs-hero-content">
          <span className="vs-hero-label">
            PARKSAFE VEHICLE IDENTIFICATION
          </span>

          <h2>
            Every vehicle.
            <br />
            One simple scan.
          </h2>

          <p>
            Quickly identify registered vehicles, access their
            ParkSafe profile and help resolve parking issues
            responsibly.
          </p>

          <div className="vs-hero-points">
            <div className="vs-hero-point">
              <span /> Quick identification
            </div>

            <div className="vs-hero-point">
              <span /> QR enabled
            </div>
          </div>
        </div>

        <div className="vs-hero-art">
          <div className="vs-art-panel">
            <div className="vs-art-caption">
              <span />
              SMART PARKING IDENTIFICATION
            </div>

            <VehicleIllustration />

            <div className="vs-art-footer">
              ParkSafe makes vehicle identification simple.
            </div>
          </div>

          <div className="vs-floating-badge">
            <div className="vs-floating-icon">
              <QrIcon />
            </div>

            <div>
              <strong>QR Ready</strong>
              <small>Vehicle identification</small>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH METHODS */}
      <section>
        <div className="vs-section-heading">
          <h2>Choose Identification Method</h2>
          <p>
            Search by registration number or scan the vehicle's QR code.
          </p>
        </div>

        <div className="vs-method-grid">
          {/* REGISTRATION SEARCH */}
          <article className="vs-method-card">
            <div className="vs-method-top">
              <div className="vs-method-icon">
                <SearchIcon />
              </div>

              <h3>Search by Number</h3>
            </div>

            <p>
              Enter the vehicle's registration number to find
              its ParkSafe record.
            </p>

            <form className="vs-search-form" onSubmit={handleSubmit}>
              <label htmlFor="vehicle-search-number">
                Vehicle Registration Number
              </label>

              <div className="vs-input-wrap">
                <input
                  id="vehicle-search-number"
                  className="vs-search-input"
                  type="text"
                  value={number}
                  onChange={(e) =>
                    setNumber(e.target.value.toUpperCase())
                  }
                  placeholder="Example: UK01AA1000"
                  required
                  autoComplete="off"
                />
              </div>

              <button
                className="vs-primary-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search Vehicle"}
                {!loading && <SearchIcon />}
              </button>
            </form>
          </article>

          {/* QR SCANNER */}
          <article className="vs-method-card">
            <div className="vs-method-top">
              <div className="vs-method-icon">
                <QrIcon />
              </div>

              <h3>Scan Vehicle QR</h3>
            </div>

            <p>
              Use your device camera to scan the ParkSafe QR
              code attached to a vehicle.
            </p>

            {!scanning && (
              <button
                className="vs-scanner-button"
                type="button"
                onClick={startScanner}
              >
                <QrIcon />

                <div>
                  Start QR Scanner
                  <span>Open your camera to scan a code</span>
                </div>
              </button>
            )}

            {scanning && (
              <div className="vs-scanner-area">
                <div id="qr-reader" />

                <button
                  className="vs-stop-button"
                  type="button"
                  onClick={() => setScanning(false)}
                >
                  Stop Scanner
                </button>
              </div>
            )}
          </article>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="vs-error" role="alert">
          {error}
        </div>
      )}

      {/* VEHICLE RESULT */}
      {vehicle && (
        <section className="vs-result">
          <div className="vs-result-top">
            <span className="vs-verified-label">
              {vehicle.status === "Registered locally"
                ? "LOCAL DEMO VEHICLE"
                : "VEHICLE VERIFIED"}
            </span>
          </div>

          <h2>{vehicle.vehicleNumber}</h2>

          <div className="vs-result-grid">
            <div className="vs-result-detail">
              <small>Vehicle Type</small>
              <strong>{vehicle.vehicleType || "Not available"}</strong>
            </div>

            <div className="vs-result-detail">
              <small>Vehicle Model</small>
              <strong>{vehicle.vehicleModel || "Not available"}</strong>
            </div>

            <div className="vs-result-detail">
              <small>Registration Status</small>
              <strong>{vehicle.status || "Not available"}</strong>
            </div>
          </div>

          <div className="vs-result-action">
            <button
              className="vs-primary-button"
              type="button"
              onClick={() =>
                navigate("/alerts", { state: { vehicle } })
              }
            >
              Continue to Parking Alerts →
            </button>
          </div>
        </section>
      )}

      {/* INFORMATION */}
      <section className="vs-help-note">
        <div className="vs-help-icon">i</div>

        <div>
          <strong>Responsible vehicle identification</strong>

          <p>
            ParkSafe helps people identify vehicles and notify
            owners about parking concerns. Use the reporting
            process responsibly and only for genuine parking issues.
          </p>
        </div>
      </section>
    </div>
  );
}
