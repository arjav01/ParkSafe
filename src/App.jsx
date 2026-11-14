
import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import VehicleSearch from "./pages/VehicleSearch";
import MyVehicles from "./pages/MyVehicles";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Dashboard from "./pages/Dashboard";
import ScanVehicle from "./pages/ScanVehicle";

const API_URL = "https://parksafe-backend-s51i.onrender.com";

function Icon({ name, size = 20 }) {
  const paths = {
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="M6 6l12 12M18 6L6 18"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3-7 8-7s8 3 8 7"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6"/></>,
    chevron: <><path d="m6 9 6 6 6-6"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.7L7.1 10a16 16 0 0 0 6.9 6.9l1.6-1.9a2 2 0 0 1 1.7-.6l3 .5a2 2 0 0 1 1.7 2Z"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>
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
      {paths[name]}
    </svg>
  );
}

function Login({ onLogin }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("parksafeToken", data.token);
      localStorage.setItem("parksafeUser", JSON.stringify(data.user));

      onLogin(data.user);
      navigate(data.user.role === "authority" ? "/dashboard" : "/");
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-intro">
        <div className="auth-brand">
          <div className="auth-brand-mark">P</div>
          ParkSafe
        </div>

        <div className="auth-intro-content">
          <span className="auth-kicker">SMART PARKING PLATFORM</span>
          <h1>Smarter streets.<br/>Safer parking.</h1>
          <p>
            A unified demo platform for parking alerts,
            violation reporting and authority review.
          </p>
          <div className="auth-feature">
            <Icon name="shield" size={23}/>
            Secure role-based access
          </div>
        </div>

        <span className="auth-footnote">
          ParkSafe Prototype • Sample vehicle data
        </span>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Sign in to ParkSafe</h1>
          <p className="subtitle">
            Enter your credentials to access your workspace.
          </p>

          <form onSubmit={handleLogin} className="auth-form">
            <label htmlFor="login-mobile">Mobile number</label>
            <input
              id="login-mobile"
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
              maxLength={10}
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            {error && <p className="error-message">{error}</p>}

            <button className="primary-button auth-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-links">
            <p>
              New to ParkSafe?{" "}
              <button type="button" onClick={() => navigate("/register")}>
                Create account
              </button>
            </p>

            <p>
              Authority official?{" "}
              <button
                type="button"
                onClick={() => navigate("/authority-register")}
              >
                Authority registration
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegistrationForm({ authority = false }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [authorityCode, setAuthorityCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = authority
      ? "/api/auth/register-authority"
      : "/api/auth/register";

    const body = authority
      ? { name, mobile, password, authorityCode }
      : { name, mobile, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert((data.message || "Registration successful.") + " Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-intro">
        <div className="auth-brand">
          <div className="auth-brand-mark">P</div>
          ParkSafe
        </div>

        <div className="auth-intro-content">
          <span className="auth-kicker">
            {authority ? "AUTHORITY ACCESS" : "JOIN PARKSAFE"}
          </span>

          <h1>
            {authority ? "Manage with confidence." : "Make every parking spot safer."}
          </h1>

          <p>
            {authority
              ? "Create an authorized demo account to review submitted parking violations."
              : "Join the ParkSafe community to send alerts and report parking issues."}
          </p>
        </div>

        <span className="auth-footnote">ParkSafe • Demo Environment</span>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">
            {authority ? "AUTHORITY REGISTRATION" : "USER REGISTRATION"}
          </span>

          <h1>Create your account</h1>
          <p className="subtitle">Complete the details below to get started.</p>

          <form onSubmit={handleRegister} className="auth-form">
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />

            <label htmlFor="register-mobile">Mobile number</label>
            <input
              id="register-mobile"
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile number"
              maxLength={10}
              required
            />

            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />

            {authority && (
              <>
                <label htmlFor="authority-code">Authority registration code</label>
                <input
                  id="authority-code"
                  type="password"
                  value={authorityCode}
                  onChange={(e) => setAuthorityCode(e.target.value)}
                  placeholder="Enter your authority code"
                  required
                />
              </>
            )}

            {error && <p className="error-message">{error}</p>}

            <button className="primary-button auth-submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Already registered?{" "}
              <button type="button" onClick={() => navigate("/login")}>
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Profile({ user }) {
  return (
    <div className="profile-page">
      <div className="page-heading">
        <span className="eyebrow">ACCOUNT SETTINGS</span>
        <h1>My Profile</h1>
        <p className="subtitle">View your ParkSafe account information.</p>
      </div>

      <div className="profile-card">
        <div className="profile-cover"></div>

        <div className="profile-card-body">
          <div className="profile-large-avatar">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <h2>{user.name}</h2>

          <span className="profile-role-tag">
            {user.role === "authority" ? "Authority Account" : "User Account"}
          </span>

          <div className="profile-details">
            <div>
              <span>Full Name</span>
              <strong>{user.name}</strong>
            </div>

            <div>
              <span>Mobile Number</span>
              <strong>{user.mobile}</strong>
            </div>

            <div>
              <span>Account Role</span>
              <strong>
                {user.role === "authority" ? "Authority" : "User"}
              </strong>
            </div>

            <div>
              <span>Account Status</span>
              <strong className="profile-active">Active</strong>
            </div>
          </div>

          <p className="profile-note">
            Profile details are read-only in this demo version.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "authority" ? "/dashboard" : "/"}
        replace
      />
    );
  }

  return children;
}

function AppContent() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("parksafeUser") || "null");
    } catch {
      return null;
    }
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function logout() {
    localStorage.removeItem("parksafeToken");
    localStorage.removeItem("parksafeUser");
    setUser(null);
    setProfileOpen(false);
    setMenuOpen(false);
    navigate("/login", { replace: true });
  }

  const homePath = user?.role === "authority" ? "/dashboard" : "/";
  const isAuthenticated = Boolean(user);

  return (
    <div className={isAuthenticated ? "app-layout" : "app-layout auth-layout"}>
      {isAuthenticated && (
        <>
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="icon-button menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
              >
                <Icon name="menu" size={23}/>
              </button>

              <button
                className="topbar-brand"
                onClick={() => navigate(homePath)}
              >
                <span className="topbar-logo">P</span>
                <span>ParkSafe</span>
              </button>

              <span className="topbar-divider"></span>

              <span className="topbar-workspace">
                {user.role === "authority" ? "Authority Workspace" : "User Workspace"}
              </span>
            </div>

            <div className="topbar-right">
              <span className="topbar-demo">
                <span className="status-dot"></span>
                Demo Mode
              </span>

              <div className="profile-wrapper" ref={profileRef}>
                <button
                  className="profile-trigger"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-expanded={profileOpen}
                  aria-label="Open account menu"
                >
                  <span className="profile-avatar">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>

                  <span className="profile-trigger-text">
                    <strong>{user.name}</strong>
                    <small>
                      {user.role === "authority" ? "Authority" : "User"}
                    </small>
                  </span>

                  <Icon name="chevron" size={16}/>
                </button>

                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-user">
                      <span className="dropdown-avatar">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>

                      <div>
                        <strong>{user.name}</strong>
                        <small>{user.mobile}</small>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <button onClick={() => navigate("/profile")}>
                      <Icon name="user" size={18}/>
                      My Profile
                    </button>

                    <button className="dropdown-logout" onClick={logout}>
                      <Icon name="logout" size={18}/>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {menuOpen && (
            <div
              className="sidebar-overlay"
              onClick={() => setMenuOpen(false)}
            ></div>
          )}

          <Navbar
            user={user}
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
          />
        </>
      )}

      <main className={isAuthenticated ? "main-content" : "main-content auth-main"}>
        <Routes>
          <Route
            path="/login"
            element={
              user
                ? <Navigate to={homePath} replace />
                : <Login onLogin={setUser}/>
            }
          />

          <Route
            path="/register"
            element={
              user
                ? <Navigate to={homePath} replace />
                : <RegistrationForm/>
            }
          />

          <Route
            path="/authority-register"
            element={
              user
                ? <Navigate to={homePath} replace />
                : <RegistrationForm authority/>
            }
          />

          <Route 
          path="/scan/:id" 
          element={<ScanVehicle />} 
          />

          <Route
            path="/"
            element={
              <ProtectedRoute user={user} role="user">
                <Home/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicles"
            element={
              <ProtectedRoute user={user} role="user">
                <VehicleSearch/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-vehicles"
            element={
              <ProtectedRoute user={user} role="user">
                <MyVehicles/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedRoute user={user} role="user">
                <Alerts/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute user={user} role="user">
                <Reports/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} role="authority">
                <Dashboard/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <Profile user={user}/>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to={homePath} replace />}/>
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent/>
    </BrowserRouter>
  );
}
