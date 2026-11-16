
import { NavLink } from "react-router-dom";

function MenuIcon({ name, size = 21 }) {
  const icons = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    alert: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
    reports: (
      <>
        <path d="M8 3H5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-5-5H8Z" />
        <path d="M14 3v6h7M8 13h8M8 17h8" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
      </>
    ),
    car: (
      <>
        <path d="M5 17h14l1-5-2-5H6l-2 5 1 5Z" />
        <path d="M4 12h16M7 17v2m10-2v2" />
        <circle cx="7.5" cy="17" r="1" />
        <circle cx="16.5" cy="17" r="1" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12M18 6 6 18" />
      </>
    )
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

export default function Navbar({ user, isOpen, onClose }) {
  const isAuthority = user?.role === "authority";

  const userLinks = [
    { name: "Home", path: "/", icon: "home" },
    { name: "Vehicle Search", path: "/vehicles", icon: "search" },
    { name: "My Vehicles", path: "/my-vehicles", icon: "car" },
    { name: "Parking Alerts", path: "/alerts", icon: "alert" },
    { name: "My Reports", path: "/reports", icon: "reports" }
  ];

  const authorityLinks = [
    {
      name: "Authority Dashboard",
      path: "/dashboard",
      icon: "dashboard"
    }
  ];

  const links = isAuthority ? authorityLinks : userLinks;

  return (
    <>
      <style>{`
        /* ==============================
           PARKSAFE SIDEBAR REDESIGN
        ============================== */

        .ps-sidebar {
          background: linear-gradient(
            155deg,
            #142f56 0%,
            #1b315d 52%,
            #272b60 100%
          ) !important;
          color: #ffffff;
          border-right: 1px solid rgba(255,255,255,.08);
          box-shadow: 12px 0 40px rgba(12,31,63,.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          isolation: isolate;
        }

        .ps-sidebar::before {
          content: "";
          position: absolute;
          width: 270px;
          height: 270px;
          top: -140px;
          right: -140px;
          border: 1px solid rgba(94,215,234,.12);
          border-radius: 50%;
          pointer-events: none;
        }

        .ps-sidebar::after {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          bottom: 100px;
          left: -160px;
          border: 1px solid rgba(122,112,255,.12);
          border-radius: 50%;
          pointer-events: none;
        }

        .ps-sidebar-header {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 27px 23px 25px;
          border-bottom: 1px solid rgba(255,255,255,.09);
        }

        .ps-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .ps-sidebar-logo {
          display: grid;
          place-items: center;
          flex: 0 0 56px;
          height: 56px;
          border-radius: 17px;
          background: linear-gradient(
            135deg,
            #7465f5,
            #29b9d1
          );
          color: white;
          font-size: 31px;
          font-weight: 900;
          box-shadow:
            0 8px 22px rgba(63,135,224,.27),
            inset 0 1px 0 rgba(255,255,255,.35);
          transition: transform .3s ease, box-shadow .3s ease;
        }

        .ps-sidebar-brand:hover .ps-sidebar-logo {
          transform: rotate(-7deg) scale(1.05);
          box-shadow: 0 10px 27px rgba(67,174,226,.4);
        }

        .ps-sidebar-brand-text h2 {
          margin: 0;
          color: #fff;
          font-size: 23px;
          font-weight: 900;
          letter-spacing: -.8px;
        }

        .ps-sidebar-brand-text small {
          display: block;
          margin-top: 4px;
          color: #aebfdd;
          font-size: 12px;
          letter-spacing: .2px;
        }

        .ps-sidebar-close {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 13px;
          background: rgba(255,255,255,.09);
          color: white;
          cursor: pointer;
          transition: background .2s ease, transform .2s ease;
        }

        .ps-sidebar-close:hover {
          background: rgba(255,255,255,.19);
          transform: rotate(90deg);
        }

        .ps-sidebar-content {
          position: relative;
          z-index: 2;
          flex: 1;
          overflow-y: auto;
          padding: 27px 16px 20px;
        }

        .ps-sidebar-content::-webkit-scrollbar {
          width: 4px;
        }

        .ps-sidebar-content::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.2);
          border-radius: 10px;
        }

        .ps-menu-heading {
          margin: 0 0 14px 13px;
          color: #93a9cc;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .ps-sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .ps-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 15px;
          min-height: 57px;
          padding: 0 16px;
          border: 1px solid transparent;
          border-radius: 15px;
          color: #bdcce4;
          text-decoration: none;
          font-size: 14px;
          font-weight: 750;
          overflow: hidden;
          transition:
            color .22s ease,
            background .22s ease,
            border-color .22s ease,
            transform .22s ease,
            box-shadow .22s ease;
        }

        .ps-nav-link::before {
          content: "";
          position: absolute;
          left: 0;
          top: 14%;
          bottom: 14%;
          width: 3px;
          border-radius: 0 5px 5px 0;
          background: #45e1dc;
          transform: scaleY(0);
          transition: transform .22s ease;
        }

        .ps-nav-icon {
          display: grid;
          place-items: center;
          width: 27px;
          height: 27px;
          flex: 0 0 27px;
          color: #b5c9e9;
          transition:
            color .22s ease,
            transform .22s ease;
        }

        .ps-nav-link:hover {
          color: #fff;
          background: rgba(255,255,255,.09);
          border-color: rgba(255,255,255,.07);
          transform: translateX(3px);
        }

        .ps-nav-link:hover .ps-nav-icon {
          color: #70e8e6;
          transform: scale(1.1);
        }

        .ps-nav-link.active {
          color: #fff;
          background: linear-gradient(
            105deg,
            rgba(101,102,225,.68),
            rgba(42,130,178,.37)
          );
          border-color: rgba(132,205,246,.16);
          box-shadow:
            0 7px 20px rgba(7,22,52,.15),
            inset 0 1px 0 rgba(255,255,255,.08);
        }

        .ps-nav-link.active::before {
          transform: scaleY(1);
        }

        .ps-nav-link.active .ps-nav-icon {
          color: #fff;
        }

        .ps-nav-link.active .ps-nav-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .ps-nav-arrow {
          margin-left: auto;
          color: #b8f4ed;
          font-size: 19px;
          opacity: 0;
          transform: translateX(-5px);
          transition: .2s ease;
        }

        .ps-sidebar-account {
          margin-top: 37px;
        }

        .ps-sidebar-footer {
          position: relative;
          z-index: 2;
          margin: 12px 16px 18px;
          padding: 17px 15px;
          border: 1px solid rgba(174,194,255,.17);
          border-radius: 17px;
          background: linear-gradient(
            125deg,
            rgba(255,255,255,.10),
            rgba(255,255,255,.045)
          );
          box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
          transition: border-color .25s ease, background .25s ease;
        }

        .ps-sidebar-footer:hover {
          border-color: rgba(99,224,217,.35);
          background: rgba(255,255,255,.12);
        }

        .ps-footer-top {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .ps-footer-status {
          position: relative;
          width: 9px;
          height: 9px;
          flex: 0 0 9px;
          border-radius: 50%;
          background: #35d7a5;
          box-shadow: 0 0 0 4px rgba(53,215,165,.12);
        }

        .ps-footer-status::after {
          content: "";
          position: absolute;
          inset: -4px;
          border: 1px solid rgba(53,215,165,.6);
          border-radius: 50%;
          animation: ps-status-pulse 2.2s ease-out infinite;
        }

        .ps-footer-title {
          color: #fff;
          font-size: 13px;
          font-weight: 850;
        }

        .ps-footer-subtitle {
          margin: 8px 0 0 20px;
          color: #aebfdd;
          font-size: 11px;
          line-height: 1.5;
        }

        @keyframes ps-status-pulse {
          0% {
            transform: scale(.8);
            opacity: .8;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        @media (max-width: 600px) {
          .ps-sidebar-header {
            padding: 22px 19px;
          }

          .ps-sidebar-logo {
            width: 50px;
            height: 50px;
            flex-basis: 50px;
            font-size: 27px;
          }

          .ps-sidebar-brand-text h2 {
            font-size: 21px;
          }

          .ps-sidebar-content {
            padding: 24px 13px;
          }

          .ps-nav-link {
            min-height: 54px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ps-sidebar *,
          .ps-sidebar *::before,
          .ps-sidebar *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <aside
        className={`sidebar ps-sidebar ${isOpen ? "sidebar-open" : ""}`}
      >
        {/* Branding */}
        <div className="ps-sidebar-header">
          <div className="ps-sidebar-brand">
            <div className="ps-sidebar-logo">P</div>

            <div className="ps-sidebar-brand-text">
              <h2>ParkSafe</h2>
              <small>Smart Parking Platform</small>
            </div>
          </div>

          <button
            className="ps-sidebar-close"
            onClick={onClose}
            aria-label="Close navigation menu"
            type="button"
          >
            <MenuIcon name="close" size={23} />
          </button>
        </div>

        {/* Navigation */}
        <div className="ps-sidebar-content">
          <p className="ps-menu-heading">
            {isAuthority ? "Administration" : "Main Menu"}
          </p>

          <nav className="ps-sidebar-nav" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `ps-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="ps-nav-icon">
                  <MenuIcon name={link.icon} />
                </span>

                <span>{link.name}</span>

                <span className="ps-nav-arrow" aria-hidden="true">
                  ›
                </span>
              </NavLink>
            ))}
          </nav>

          {/* Account */}
          <div className="ps-sidebar-account">
            <p className="ps-menu-heading">Account</p>

            <nav className="ps-sidebar-nav" aria-label="Account navigation">
              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) =>
                  `ps-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="ps-nav-icon">
                  <MenuIcon name="user" />
                </span>

                <span>My Profile</span>

                <span className="ps-nav-arrow" aria-hidden="true">
                  ›
                </span>
              </NavLink>
            </nav>
          </div>
        </div>

        {/* System Status */}
        <div className="ps-sidebar-footer">
          <div className="ps-footer-top">
            <span className="ps-footer-status" />

            <span className="ps-footer-title">
              ParkSafe System
            </span>
          </div>

          <p className="ps-footer-subtitle">
            Smart Parking Management
          </p>
        </div>
      </aside>
    </>
  );
}
