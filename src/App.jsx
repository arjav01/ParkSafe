import { useEffect, useRef, useState } from "react";
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

const API_URL =
  "https://parksafe-backend-s51i.onrender.com";

// ==========================================
// ICON COMPONENT
// ==========================================

function Icon({ name, size = 20 }) {
  const paths = {
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),

    close: (
      <>
        <path d="M6 6l12 12M18 6L6 18" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
      </>
    ),

    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
      </>
    ),

    chevron: (
      <>
        <path d="m6 9 6 6 6-6" />
      </>
    ),

    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),

    phone: (
      <>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.7L7.1 10a16 16 0 0 0 6.9 6.9l1.6-1.9a2 2 0 0 1 1.7-.6l3 .5a2 2 0 0 1 1.7 2Z" />
      </>
    ),

    lock: (
      <>
        <rect
          x="4"
          y="10"
          width="16"
          height="11"
          rx="2"
        />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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
      {paths[name]}
    </svg>
  );
}

// ==========================================
// LOGIN PAGE
// ==========================================

function Login({ onLogin }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            mobile,
            password
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Login failed"
        );
      }

      localStorage.removeItem(
        "parksafeToken"
      );

      localStorage.removeItem(
        "parksafeUser"
      );

      localStorage.setItem(
        "parksafeToken",
        data.token
      );

      localStorage.setItem(
        "parksafeUser",
        JSON.stringify(data.user)
      );

      onLogin(data.user);

      navigate(
        data.user.role === "authority"
          ? "/dashboard"
          : "/"
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="premium-login-page">

      <div
        className="login-ambient"
        aria-hidden="true"
      >
        <span className="login-orb login-orb-one" />
        <span className="login-orb login-orb-two" />
        <span className="login-orb login-orb-three" />

        <span className="login-particle particle-login-one" />
        <span className="login-particle particle-login-two" />
        <span className="login-particle particle-login-three" />
        <span className="login-particle particle-login-four" />
      </div>

      {/* LEFT SIDE */}

      <section className="premium-login-showcase">

        <div className="premium-login-brand">

          <div className="login-brand-logo">
            P
          </div>

          <div>
            <strong>
              ParkSafe
            </strong>

            <span>
              Smart Parking Platform
            </span>
          </div>

        </div>

        <div className="login-showcase-content">

          <div className="login-live-pill">
            <span />
            SMART PARKING NETWORK ONLINE
          </div>

          <span className="login-kicker">
            SMARTER PARKING • SAFER STREETS
          </span>

          <h1>
            Parking problems,
            <br />
            <span>
              solved smarter.
            </span>
          </h1>

          <p>
            Identify vehicles, notify owners,
            manage your garage and report parking
            issues through one connected platform.
          </p>

          <div className="login-feature-grid">

            <div className="login-feature-item">
              <span className="login-feature-icon purple">
                ⌕
              </span>

              <div>
                <strong>
                  Vehicle Identification
                </strong>
                <small>
                  Search or scan instantly
                </small>
              </div>
            </div>

            <div className="login-feature-item">
              <span className="login-feature-icon cyan">
                !
              </span>

              <div>
                <strong>
                  Smart Alerts
                </strong>
                <small>
                  Notify owners privately
                </small>
              </div>
            </div>

            <div className="login-feature-item">
              <span className="login-feature-icon green">
                ✓
              </span>

              <div>
                <strong>
                  Privacy Focused
                </strong>
                <small>
                  Personal details protected
                </small>
              </div>
            </div>

          </div>
        </div>

        {/* ANIMATION */}

        <div
          className="login-smart-visual"
          aria-hidden="true"
        >

          <div className="login-radar">

            <span className="login-radar-ring radar-login-one" />
            <span className="login-radar-ring radar-login-two" />
            <span className="login-radar-ring radar-login-three" />

            <div className="login-radar-core">
              P
            </div>

            <span className="login-radar-node node-login-one" />
            <span className="login-radar-node node-login-two" />
            <span className="login-radar-node node-login-three" />

            <div className="login-radar-sweep" />

          </div>

          <div className="login-car-scene">

            <div className="login-road">

              <span className="login-road-line road-line-one" />
              <span className="login-road-line road-line-two" />

              <div className="login-car">

                <div className="login-car-roof" />
                <div className="login-car-window" />

                <span className="login-car-light car-light-one" />
                <span className="login-car-light car-light-two" />

                <span className="login-car-wheel wheel-login-one" />
                <span className="login-car-wheel wheel-login-two" />

              </div>

              <div className="login-car-scan" />

            </div>
          </div>

          <div className="login-float-card login-float-one">

            <div className="login-float-icon purple">
              ⌕
            </div>

            <div>
              <small>
                VEHICLE
              </small>
              <strong>
                Identified
              </strong>
            </div>

            <span className="login-float-check">
              ✓
            </span>

          </div>

          <div className="login-float-card login-float-two">

            <div className="login-float-icon orange">
              !
            </div>

            <div>
              <small>
                PARKING ALERT
              </small>
              <strong>
                Owner notified
              </strong>
            </div>

            <span className="login-float-live" />

          </div>

          <div className="login-float-card login-float-three">

            <div className="login-float-icon green">
              ✓
            </div>

            <div>
              <small>
                NETWORK
              </small>
              <strong>
                Protected
              </strong>
            </div>

          </div>

        </div>

        <div className="login-showcase-footer">

          <span>
            <span className="login-footer-dot" />
            ParkSafe System
          </span>

          <small>
            Smart Parking Management
          </small>

        </div>

      </section>

      {/* RIGHT LOGIN PANEL */}

      <section className="premium-login-panel">

        <div className="login-panel-glow" />

        <div
          className={
            error
              ? "premium-login-card login-card-error"
              : "premium-login-card"
          }
        >

          <div className="login-card-header">

            <div className="login-welcome-icon">

              <span className="welcome-icon-ring welcome-ring-one" />
              <span className="welcome-icon-ring welcome-ring-two" />

              <div>
                <Icon
                  name="shield"
                  size={24}
                />
              </div>

            </div>

            <span className="login-card-kicker">
              WELCOME BACK
            </span>

            <h2>
              Sign in to ParkSafe
            </h2>

            <p>
              Access your smart parking workspace
              and continue where you left off.
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="premium-login-form"
          >

            <div className="premium-login-field">

              <label htmlFor="login-mobile">
                Mobile Number
              </label>

              <div className="premium-login-input">

                <span className="login-input-icon">
                  <Icon
                    name="phone"
                    size={18}
                  />
                </span>

                <span className="login-country-code">
                  +91
                </span>

                <input
                  id="login-mobile"
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="Enter mobile number"
                  maxLength={10}
                  autoComplete="tel"
                  required
                />

                {mobile.length === 10 && (
                  <span className="login-field-valid">
                    ✓
                  </span>
                )}

              </div>
            </div>

            <div className="premium-login-field">

              <div className="login-label-row">

                <label htmlFor="login-password">
                  Password
                </label>

                <button
                  type="button"
                  className="premium-forgot-link"
                  onClick={() =>
                    navigate(
                      "/forgot-password"
                    )
                  }
                >
                  Forgot password?
                </button>

              </div>

              <div className="premium-login-input">

                <span className="login-input-icon">
                  <Icon
                    name="lock"
                    size={18}
                  />
                </span>

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>
            </div>

            {error && (
              <div className="premium-login-error">
                <div>!</div>

                <div>
                  <strong>
                    Sign in unsuccessful
                  </strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <button
              className={
                loading
                  ? "premium-login-submit loading"
                  : "premium-login-submit"
              }
              disabled={loading}
              type="submit"
            >

              <span className="login-button-shine" />

              {loading ? (
                <>
                  <span className="login-submit-loader" />
                  <span>
                    Signing you in...
                  </span>
                </>
              ) : (
                <>
                  <span className="login-submit-icon">
                    →
                  </span>

                  <span>
                    Sign In to ParkSafe
                  </span>

                  <strong>
                    →
                  </strong>
                </>
              )}

            </button>

          </form>

          <div className="login-security-row">

            <span>
              <Icon
                name="shield"
                size={14}
              />
            </span>

            <p>
              Secure authentication powered by
              ParkSafe
            </p>

            <span className="login-security-live">
              <span />
              SECURE
            </span>

          </div>

          <div className="premium-login-divider">
            <span />
            <small>
              NEW TO PARKSAFE?
            </small>
            <span />
          </div>

          <button
            type="button"
            className="premium-create-account"
            onClick={() =>
              navigate("/register")
            }
          >

            <span className="create-account-icon">
              +
            </span>

            <div>
              <strong>
                Create ParkSafe Account
              </strong>

              <small>
                Register as a vehicle owner
              </small>
            </div>

            <span className="create-account-arrow">
              →
            </span>

          </button>

          <button
            type="button"
            className="premium-authority-login-link"
            onClick={() =>
              navigate(
                "/authority-register"
              )
            }
          >
            <span>◆</span>
            Authority official?
            <strong>
              Register here →
            </strong>
          </button>

          <div className="login-demo-note">

            <span className="login-demo-icon">
              i
            </span>

            <div>
              <strong>
                ParkSafe Demo Environment
              </strong>

              <p>
                Smart parking management
                demonstration platform.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

// ==========================================
// FORGOT PASSWORD
// ==========================================

function ForgotPassword() {
  const [mobile, setMobile] =
    useState("");

  const [
    newPassword,
    setNewPassword
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate =
    useNavigate();

  async function handleResetPassword(
    e
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !/^\d{10}$/.test(
        mobile
      )
    ) {
      setError(
        "Enter a valid 10-digit mobile number."
      );
      return;
    }

    if (
      newPassword.length < 6
    ) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/auth/reset-password`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                mobile,
                newPassword
              })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to change password"
        );
      }

      localStorage.removeItem(
        "parksafeToken"
      );

      localStorage.removeItem(
        "parksafeUser"
      );

      setSuccess(
        "Password changed successfully! Redirecting to login..."
      );

      setMobile("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate(
          "/login",
          {
            replace: true
          }
        );
      }, 1500);
    } catch (err) {
      setError(
        err.message ||
          "Unable to change password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">

      <div className="auth-intro">

        <div className="auth-brand">
          <div className="auth-brand-mark">
            P
          </div>
          ParkSafe
        </div>

        <div className="auth-intro-content">

          <span className="auth-kicker">
            ACCOUNT RECOVERY
          </span>

          <h1>
            Reset your
            <br />
            password.
          </h1>

          <p>
            Enter your registered mobile
            number and create a new password
            for your ParkSafe account.
          </p>

          <div className="auth-feature">
            <Icon
              name="lock"
              size={23}
            />
            Secure password storage
          </div>

        </div>

        <span className="auth-footnote">
          ParkSafe Prototype • Demo password recovery
        </span>

      </div>

      <div className="auth-panel">

        <div className="auth-card">

          <span className="eyebrow">
            FORGOT PASSWORD
          </span>

          <h1>
            Change Password
          </h1>

          <p className="subtitle">
            Enter your registered mobile
            number and choose a new password.
          </p>

          <form
            onSubmit={
              handleResetPassword
            }
            className="auth-form"
          >

            <label htmlFor="forgot-mobile">
              Registered Mobile Number
            </label>

            <input
              id="forgot-mobile"
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) =>
                setMobile(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              required
            />

            <label htmlFor="new-password">
              New Password
            </label>

            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />

            <label htmlFor="confirm-password">
              Confirm New Password
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Enter new password again"
              minLength={6}
              required
            />

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            {success && (
              <div
                style={{
                  padding:
                    "12px 14px",
                  background:
                    "#eaf9f4",
                  color:
                    "#16845f",
                  borderRadius:
                    "10px",
                  marginBottom:
                    "16px",
                  fontWeight:
                    "700",
                  fontSize:
                    "13px"
                }}
              >
                {success}
              </div>
            )}

            <button
              className="primary-button auth-submit"
              disabled={loading}
            >
              {loading
                ? "Changing Password..."
                : "Change Password"}
            </button>

          </form>

          <div className="auth-links">
            <p>
              Remember your password?{" "}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/login"
                  )
                }
              >
                Back to Sign In
              </button>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

// ==========================================
// REGISTRATION
// ==========================================

function RegistrationForm({
  authority = false
}) {
  const [name, setName] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    authorityCode,
    setAuthorityCode
  ] = useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const navigate =
    useNavigate();

  async function handleRegister(
    e
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const endpoint =
      authority
        ? "/api/auth/register-authority"
        : "/api/auth/register";

    const body =
      authority
        ? {
            name,
            mobile,
            password,
            authorityCode
          }
        : {
            name,
            mobile,
            password
          };

    try {
      const response =
        await fetch(
          `${API_URL}${endpoint}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                body
              )
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Registration failed"
        );
      }

      alert(
        (data.message ||
          "Registration successful.") +
          " Please login."
      );

      navigate("/login");
    } catch (err) {
      setError(
        err.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">

      <div className="auth-intro">

        <div className="auth-brand">
          <div className="auth-brand-mark">
            P
          </div>
          ParkSafe
        </div>

        <div className="auth-intro-content">

          <span className="auth-kicker">
            {authority
              ? "AUTHORITY ACCESS"
              : "JOIN PARKSAFE"}
          </span>

          <h1>
            {authority
              ? "Manage with confidence."
              : "Make every parking spot safer."}
          </h1>

          <p>
            {authority
              ? "Create an authorized account to review submitted parking violations."
              : "Join the ParkSafe community to send alerts and report parking issues."}
          </p>

        </div>

        <span className="auth-footnote">
          ParkSafe • Smart Parking Platform
        </span>

      </div>

      <div className="auth-panel">

        <div className="auth-card">

          <span className="eyebrow">
            {authority
              ? "AUTHORITY REGISTRATION"
              : "USER REGISTRATION"}
          </span>

          <h1>
            Create your account
          </h1>

          <p className="subtitle">
            Complete the details below
            to get started.
          </p>

          <form
            onSubmit={
              handleRegister
            }
            className="auth-form"
          >

            <label htmlFor="register-name">
              Full name
            </label>

            <input
              id="register-name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Your full name"
              required
            />

            <label htmlFor="register-mobile">
              Mobile number
            </label>

            <input
              id="register-mobile"
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) =>
                setMobile(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="10-digit mobile number"
              maxLength={10}
              required
            />

            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />

            {authority && (
              <>
                <label htmlFor="authority-code">
                  Authority registration code
                </label>

                <input
                  id="authority-code"
                  type="password"
                  value={
                    authorityCode
                  }
                  onChange={(e) =>
                    setAuthorityCode(
                      e.target.value
                    )
                  }
                  placeholder="Enter your authority code"
                  required
                />
              </>
            )}

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            <button
              className="primary-button auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>

          <div className="auth-links">
            <p>
              Already registered?{" "}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/login"
                  )
                }
              >
                Sign in
              </button>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

// ==========================================
// DYNAMIC PROFILE
// ==========================================

function Profile({
  user,
  onUserUpdate
}) {
  const [name, setName] =
    useState(
      user?.name || ""
    );

  const [
    profilePhoto,
    setProfilePhoto
  ] = useState(
    user?.profilePhoto || ""
  );

  const [loading, setLoading] =
    useState(false);

  const [
    fetching,
    setFetching
  ] = useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const fileInputRef =
    useRef(null);

  const token =
    localStorage.getItem(
      "parksafeToken"
    );

  // LOAD FRESH PROFILE

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setFetching(false);
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/auth/me`,
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
              "Could not load profile"
          );
        }

        setName(
          data.user.name ||
            ""
        );

        setProfilePhoto(
          data.user
            .profilePhoto ||
            ""
        );

        localStorage.setItem(
          "parksafeUser",
          JSON.stringify(
            data.user
          )
        );

        onUserUpdate(
          data.user
        );
      } catch (err) {
        setError(
          err.message ||
            "Could not load profile"
        );
      } finally {
        setFetching(false);
      }
    }

    loadProfile();
  }, []);

  // PHOTO SELECT

  function handlePhotoChange(
    e
  ) {
    const selected =
      e.target.files?.[0];

    if (!selected) return;

    setError("");
    setSuccess("");

    if (
      !selected.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select an image file."
      );
      return;
    }

    if (
      selected.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Please choose an image smaller than 5 MB."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const image =
        new Image();

      image.onload = () => {
        const MAX_SIZE =
          500;

        let width =
          image.width;

        let height =
          image.height;

        if (
          width > height &&
          width > MAX_SIZE
        ) {
          height =
            Math.round(
              height *
                (MAX_SIZE /
                  width)
            );

          width =
            MAX_SIZE;
        }

        if (
          height >= width &&
          height > MAX_SIZE
        ) {
          width =
            Math.round(
              width *
                (MAX_SIZE /
                  height)
            );

          height =
            MAX_SIZE;
        }

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          width;

        canvas.height =
          height;

        const context =
          canvas.getContext(
            "2d"
          );

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const compressed =
          canvas.toDataURL(
            "image/jpeg",
            0.78
          );

        setProfilePhoto(
          compressed
        );
      };

      image.src =
        reader.result;
    };

    reader.readAsDataURL(
      selected
    );
  }

  function removePhoto() {
    setProfilePhoto("");
    setError("");
    setSuccess("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  // SAVE PROFILE

  async function saveProfile(
    e
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (
      name.trim().length <
      2
    ) {
      setError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/api/auth/profile`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body:
              JSON.stringify({
                name:
                  name.trim(),

                profilePhoto:
                  profilePhoto ||
                  null
              })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not update profile"
        );
      }

      localStorage.setItem(
        "parksafeUser",
        JSON.stringify(
          data.user
        )
      );

      onUserUpdate(
        data.user
      );

      setName(
        data.user.name
      );

      setProfilePhoto(
        data.user
          .profilePhoto ||
          ""
      );

      setSuccess(
        "Profile updated successfully!"
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err.message ||
          "Could not update profile"
      );
    } finally {
      setLoading(false);
    }
  }

  const initial =
    name
      ?.charAt(0)
      ?.toUpperCase() ||
    "U";

  if (fetching) {
    return (
      <div className="profile-page">

        <div className="profile-card">

          <div className="profile-card-body">

            <h2>
              Loading Profile...
            </h2>

            <p>
              Syncing your account with ParkSafe...
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="profile-page dynamic-profile-page">

      <div className="page-heading">

        <span className="eyebrow">
          ACCOUNT SETTINGS
        </span>

        <h1>
          My Profile
        </h1>

        <p className="subtitle">
          Manage your ParkSafe identity
          and profile photo.
        </p>

      </div>

      <div className="profile-card dynamic-profile-card">

        <div className="profile-cover">

          <div className="profile-cover-content">

            <span>
              PARKSAFE MEMBER
            </span>

            <h2>
              Your Digital Identity
            </h2>

            <p>
              Keep your ParkSafe
              account up to date.
            </p>

          </div>

        </div>

        <div className="profile-card-body">

          {/* PHOTO */}

          <div className="dynamic-profile-photo-area">

            <div className="dynamic-profile-photo">

              {profilePhoto ? (
                <img
                  src={
                    profilePhoto
                  }
                  alt={
                    `${name} profile`
                  }
                />
              ) : (
                <span>
                  {initial}
                </span>
              )}

              <span className="profile-photo-online" />

            </div>

            <div className="profile-photo-actions">

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/*"
                hidden
                onChange={
                  handlePhotoChange
                }
              />

              <button
                type="button"
                className="profile-upload-button"
                onClick={() =>
                  fileInputRef
                    .current
                    ?.click()
                }
              >
                {profilePhoto
                  ? "Change Photo"
                  : "Upload Photo"}
              </button>

              {profilePhoto && (
                <button
                  type="button"
                  className="profile-remove-photo"
                  onClick={
                    removePhoto
                  }
                >
                  Remove Photo
                </button>
              )}

            </div>

            <p className="profile-photo-note">
              JPG, PNG or WebP •
              Maximum 5 MB
            </p>

          </div>

          <div className="dynamic-profile-heading">

            <h2>
              {name ||
                user.name}
            </h2>

            <span className="profile-role-tag">
              {user.role ===
              "authority"
                ? "Authority Account"
                : "User Account"}
            </span>

            <span className="dynamic-account-active">
              <span />
              Active
            </span>

          </div>

          {/* ERROR */}

          {error && (
            <div className="profile-update-message error">

              <strong>
                !
              </strong>

              <span>
                {error}
              </span>

            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="profile-update-message success">

              <strong>
                ✓
              </strong>

              <span>
                {success}
              </span>

            </div>
          )}

          {/* FORM */}

          <form
            className="dynamic-profile-form"
            onSubmit={
              saveProfile
            }
          >

            <div className="dynamic-profile-field">

              <label htmlFor="profile-name">
                Full Name
              </label>

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Your full name"
                maxLength={80}
                required
              />

              <small>
                This name appears
                across your ParkSafe
                account.
              </small>

            </div>

            <div className="dynamic-profile-field readonly">

              <label>
                Mobile Number
              </label>

              <input
                value={
                  user.mobile ||
                  ""
                }
                readOnly
              />

              <small>
                Your login mobile
                number cannot be
                changed here.
              </small>

            </div>

            <div className="dynamic-profile-field readonly">

              <label>
                Account Role
              </label>

              <input
                value={
                  user.role ===
                  "authority"
                    ? "Authority"
                    : "User"
                }
                readOnly
              />

              <small>
                Your access level is
                managed by ParkSafe.
              </small>

            </div>

            <div className="dynamic-profile-field readonly">

              <label>
                Account Status
              </label>

              <div className="dynamic-profile-status">
                <span />
                Active
              </div>

              <small>
                Your ParkSafe account
                is currently active.
              </small>

            </div>

            <div className="dynamic-profile-save-area">

              <div>
                <span>
                  ✓
                </span>

                <p>
                  Changes are stored
                  in your ParkSafe
                  database account.
                </p>
              </div>

              <button
                type="submit"
                className="primary-button profile-save-button"
                disabled={
                  loading
                }
              >
                {loading
                  ? "Saving Changes..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

// ==========================================
// PROTECTED ROUTE
// ==========================================

function ProtectedRoute({
  user,
  role,
  children
}) {
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    role &&
    user.role !== role
  ) {
    return (
      <Navigate
        to={
          user.role ===
          "authority"
            ? "/dashboard"
            : "/"
        }
        replace
      />
    );
  }

  return children;
}

// ==========================================
// APP CONTENT
// ==========================================

function AppContent() {
  const [user, setUser] =
    useState(() => {
      try {
        return JSON.parse(
          localStorage.getItem(
            "parksafeUser"
          ) || "null"
        );
      } catch {
        return null;
      }
    });

  const [
    menuOpen,
    setMenuOpen
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen
  ] = useState(false);

  const profileRef =
    useRef(null);

  const navigate =
    useNavigate();

  const location =
    useLocation();

  // CLOSE MENUS ON ROUTE CHANGE

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // OUTSIDE CLICK

  useEffect(() => {
    function handleClick(e) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          e.target
        )
      ) {
        setProfileOpen(
          false
        );
      }
    }

    function handleEscape(
      e
    ) {
      if (
        e.key === "Escape"
      ) {
        setProfileOpen(
          false
        );

        setMenuOpen(
          false
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // ==========================================
  // REFRESH USER FROM DATABASE
  // ==========================================

  useEffect(() => {
    if (!user) return;

    const token =
      localStorage.getItem(
        "parksafeToken"
      );

    if (!token) return;

    async function refreshUser() {
      try {
        const response =
          await fetch(
            `${API_URL}/api/auth/me`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (
          data.success &&
          data.user
        ) {
          setUser(
            data.user
          );

          localStorage.setItem(
            "parksafeUser",
            JSON.stringify(
              data.user
            )
          );
        }
      } catch {
        // Keep cached user
      }
    }

    refreshUser();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  function logout() {
    localStorage.removeItem(
      "parksafeToken"
    );

    localStorage.removeItem(
      "parksafeUser"
    );

    setUser(null);

    setProfileOpen(
      false
    );

    setMenuOpen(
      false
    );

    navigate(
      "/login",
      {
        replace: true
      }
    );
  }

  const homePath =
    user?.role ===
    "authority"
      ? "/dashboard"
      : "/";

  const isAuthenticated =
    Boolean(user);

  return (
    <div
      className={
        isAuthenticated
          ? "app-layout"
          : "app-layout auth-layout"
      }
    >

      {/* ======================================
          AUTHENTICATED HEADER
      ====================================== */}

      {isAuthenticated && (
        <>

          <header className="topbar">

            <div className="topbar-left">

              <button
                className="icon-button menu-toggle"
                onClick={() =>
                  setMenuOpen(
                    !menuOpen
                  )
                }
                aria-label="Toggle navigation menu"
                aria-expanded={
                  menuOpen
                }
              >
                <Icon
                  name="menu"
                  size={23}
                />
              </button>

              <button
                className="topbar-brand"
                onClick={() =>
                  navigate(
                    homePath
                  )
                }
              >

                <span className="topbar-logo">
                  P
                </span>

                <span>
                  ParkSafe
                </span>

              </button>

              <span className="topbar-divider" />

              <span className="topbar-workspace">
                {user.role ===
                "authority"
                  ? "Authority Workspace"
                  : "User Workspace"}
              </span>

            </div>

            {/* RIGHT */}

            <div className="topbar-right">

              <span className="topbar-demo">
                <span className="status-dot" />
                Online
              </span>

              <div
                className="profile-wrapper"
                ref={
                  profileRef
                }
              >

                <button
                  className="profile-trigger"
                  onClick={() =>
                    setProfileOpen(
                      !profileOpen
                    )
                  }
                  aria-expanded={
                    profileOpen
                  }
                  aria-label="Open account menu"
                >

                  {/* PROFILE PHOTO */}

                  <span className="profile-avatar">

                    {user.profilePhoto ? (
                      <img
                        src={
                          user.profilePhoto
                        }
                        alt={
                          user.name
                        }
                        className="profile-avatar-image"
                      />
                    ) : (
                      user.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                      "U"
                    )}

                  </span>

                  <span className="profile-trigger-text">

                    <strong>
                      {user.name}
                    </strong>

                    <small>
                      {user.role ===
                      "authority"
                        ? "Authority"
                        : "User"}
                    </small>

                  </span>

                  <Icon
                    name="chevron"
                    size={16}
                  />

                </button>

                {/* DROPDOWN */}

                {profileOpen && (
                  <div className="profile-dropdown">

                    <div className="dropdown-user">

                      <span className="dropdown-avatar">

                        {user.profilePhoto ? (
                          <img
                            src={
                              user.profilePhoto
                            }
                            alt={
                              user.name
                            }
                            className="profile-avatar-image"
                          />
                        ) : (
                          user.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                          "U"
                        )}

                      </span>

                      <div>

                        <strong>
                          {user.name}
                        </strong>

                        <small>
                          {user.mobile}
                        </small>

                      </div>

                    </div>

                    <div className="dropdown-divider" />

                    <button
                      onClick={() =>
                        navigate(
                          "/profile"
                        )
                      }
                    >
                      <Icon
                        name="user"
                        size={18}
                      />

                      My Profile
                    </button>

                    <button
                      className="dropdown-logout"
                      onClick={
                        logout
                      }
                    >
                      <Icon
                        name="logout"
                        size={18}
                      />

                      Logout
                    </button>

                  </div>
                )}

              </div>

            </div>

          </header>

          {/* MOBILE OVERLAY */}

          {menuOpen && (
            <div
              className="sidebar-overlay"
              onClick={() =>
                setMenuOpen(
                  false
                )
              }
            />
          )}

          <Navbar
            user={user}
            isOpen={
              menuOpen
            }
            onClose={() =>
              setMenuOpen(
                false
              )
            }
          />

        </>
      )}

      {/* ======================================
          CONTENT
      ====================================== */}

      <main
        className={
          isAuthenticated
            ? "main-content"
            : "main-content auth-main"
        }
      >

        <Routes>

          {/* LOGIN */}

          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={
                    homePath
                  }
                  replace
                />
              ) : (
                <Login
                  onLogin={
                    setUser
                  }
                />
              )
            }
          />

          {/* FORGOT PASSWORD */}

          <Route
            path="/forgot-password"
            element={
              user ? (
                <Navigate
                  to={
                    homePath
                  }
                  replace
                />
              ) : (
                <ForgotPassword />
              )
            }
          />

          {/* USER REGISTER */}

          <Route
            path="/register"
            element={
              user ? (
                <Navigate
                  to={
                    homePath
                  }
                  replace
                />
              ) : (
                <RegistrationForm />
              )
            }
          />

          {/* AUTHORITY REGISTER */}

          <Route
            path="/authority-register"
            element={
              user ? (
                <Navigate
                  to={
                    homePath
                  }
                  replace
                />
              ) : (
                <RegistrationForm
                  authority
                />
              )
            }
          />

          {/* PUBLIC QR */}

          <Route
            path="/scan/:id"
            element={
              <ScanVehicle />
            }
          />

          {/* USER HOME */}

          <Route
            path="/"
            element={
              <ProtectedRoute
                user={user}
                role="user"
              >
                <Home />
              </ProtectedRoute>
            }
          />

          {/* SEARCH */}

          <Route
            path="/vehicles"
            element={
              <ProtectedRoute
                user={user}
                role="user"
              >
                <VehicleSearch />
              </ProtectedRoute>
            }
          />

          {/* MY VEHICLES */}

          <Route
            path="/my-vehicles"
            element={
              <ProtectedRoute
                user={user}
                role="user"
              >
                <MyVehicles />
              </ProtectedRoute>
            }
          />

          {/* ALERTS */}

          <Route
            path="/alerts"
            element={
              <ProtectedRoute
                user={user}
                role="user"
              >
                <Alerts />
              </ProtectedRoute>
            }
          />

          {/* REPORTS */}

          <Route
            path="/reports"
            element={
              <ProtectedRoute
                user={user}
                role="user"
              >
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* AUTHORITY DASHBOARD */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                user={user}
                role="authority"
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* DYNAMIC PROFILE */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute
                user={user}
              >
                <Profile
                  user={user}
                  onUserUpdate={
                    setUser
                  }
                />
              </ProtectedRoute>
            }
          />

          {/* UNKNOWN */}

          <Route
            path="*"
            element={
              <Navigate
                to={
                  homePath
                }
                replace
              />
            }
          />

        </Routes>

      </main>

    </div>
  );
}

// ==========================================
// APP
// ==========================================

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}