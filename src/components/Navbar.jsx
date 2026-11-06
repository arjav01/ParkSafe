
import { NavLink } from "react-router-dom";

function MenuIcon({ name }) {
  const icons = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    alert: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    reports: <><path d="M8 3H5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-5-5H8Z"/><path d="M14 3v6h7M8 13h8M8 17h8"/></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3-7 8-7s8 3 8 7"/></>,
    close: <><path d="M6 6l12 12M18 6 6 18"/></>
  };

  return (
    <svg
      width="20"
      height="20"
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

  const links = isAuthority
    ? [
        { name: "Authority Dashboard", path: "/dashboard", icon: "dashboard" }
      ]
    : [
        { name: "Home", path: "/", icon: "home" },
        { name: "Vehicle Search", path: "/vehicles", icon: "search" },
        { name: "Parking Alerts", path: "/alerts", icon: "alert" },
        { name: "My Reports", path: "/reports", icon: "reports" }
      ];

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">P</div>
          <div>
            <h2>ParkSafe</h2>
            <small>Smart Parking Platform</small>
          </div>
        </div>

        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <MenuIcon name="close"/>
        </button>
      </div>

      <div className="sidebar-content">
        <p className="menu-heading">
          {isAuthority ? "ADMINISTRATION" : "MAIN MENU"}
        </p>

        <nav>
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <MenuIcon name={link.icon}/>
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        <p className="menu-heading sidebar-account-heading">ACCOUNT</p>

        <nav>
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <MenuIcon name="user"/>
            <span>My Profile</span>
          </NavLink>
        </nav>
      </div>

      <div className="demo-label">
        <span className="demo-indicator"></span>
        <div>
          <strong>Demo Environment</strong>
          <small>Sample data • Prototype</small>
        </div>
      </div>
    </aside>
  );
}
