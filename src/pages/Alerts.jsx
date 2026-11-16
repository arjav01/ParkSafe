import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useLocation,
  useNavigate
} from "react-router-dom";

export default function Alerts() {
  const location = useLocation();
  const navigate = useNavigate();

  const vehicle = location.state?.vehicle;

  const [sent, setSent] = useState(false);
  const [reply, setReply] = useState("");
  const [seconds, setSeconds] = useState(60);

  const [callUnlocked, setCallUnlocked] =
    useState(false);

  const [callStatus, setCallStatus] =
    useState("");

  const [calling, setCalling] =
    useState(false);

  /* =====================================================
     VEHICLE INFORMATION
  ===================================================== */

  const registration =
    vehicle?.vehicleNumber ||
    "UK01AA1000";

  const ownerReference =
    vehicle?.ownerReference ||
    "OWN0001";

  const vehicleModel =
    vehicle?.vehicleModel ||
    "Registered ParkSafe Vehicle";

  const vehicleType =
    vehicle?.vehicleType ||
    "Vehicle";

  /* =====================================================
     DYNAMIC MASKED DEMO NUMBER
  ===================================================== */

  const maskedOwnerNumber = useMemo(() => {
    const reference =
      vehicle?.ownerReference ||
      vehicle?.vehicleNumber ||
      "OWN0001";

    let hash = 0;

    for (
      let i = 0;
      i < reference.length;
      i++
    ) {
      hash =
        (
          hash * 31 +
          reference.charCodeAt(i)
        ) % 10000;
    }

    const prefixes = [
      "98",
      "97",
      "96",
      "95",
      "88",
      "87",
      "86",
      "79",
      "78",
      "76"
    ];

    const prefix =
      prefixes[
        hash % prefixes.length
      ];

    const ending = String(
      (hash * 17 + 42) % 100
    ).padStart(2, "0");

    return `+91 ${prefix}XXXXXX${ending}`;
  }, [vehicle]);

  /* =====================================================
     TIMER
  ===================================================== */

  useEffect(() => {
    if (
      !sent ||
      reply ||
      callUnlocked
    ) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((previous) => {
        if (previous <= 1) {
          setCallUnlocked(true);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    sent,
    reply,
    callUnlocked
  ]);

  /* =====================================================
     WAITING STATUS
  ===================================================== */

  const waitingStatus =
    useMemo(() => {
      if (seconds > 50) {
        return {
          title:
            "Alert delivered",

          text:
            "The parking alert has reached the vehicle owner.",

          step:
            "DELIVERED"
        };
      }

      if (seconds > 30) {
        return {
          title:
            "Waiting for owner response",

          text:
            "The owner has received the notification. Waiting for acknowledgement.",

          step:
            "WAITING"
        };
      }

      if (seconds > 10) {
        return {
          title:
            "Still waiting...",

          text:
            "No response yet. ParkSafe will unlock the call option automatically.",

          step:
            "NO RESPONSE"
        };
      }

      return {
        title:
          "Preparing call access",

        text:
          "No response received. Direct call access is about to unlock.",

        step:
          "UNLOCKING"
      };
    }, [seconds]);

  /* =====================================================
     FORMAT TIME
  ===================================================== */

  function formatTime(time) {
    const minutes =
      Math.floor(time / 60);

    const secs =
      time % 60;

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      secs
    ).padStart(
      2,
      "0"
    )}`;
  }

  /* =====================================================
     SEND ALERT
  ===================================================== */

  function sendAlert() {
    setSent(true);
    setReply("");
    setSeconds(60);

    setCallUnlocked(false);

    setCallStatus("");
    setCalling(false);
  }

  /* =====================================================
     OWNER REPLY
  ===================================================== */

  function simulateReply(message) {
    setReply(message);

    setCallUnlocked(false);

    setCallStatus("");
    setCalling(false);
  }

  /* =====================================================
     CALL OWNER
  ===================================================== */

  function callOwner() {
    if (calling) {
      return;
    }

    setCalling(true);

    setCallStatus(
      `Calling ${maskedOwnerNumber}...`
    );

    setTimeout(() => {
      setCalling(false);

      setCallStatus(
        "Demo call connected successfully."
      );
    }, 2500);
  }

  /* =====================================================
     REPORT THIS PARTICULAR VEHICLE
  ===================================================== */

  function reportVehicle() {
    const reportVehicleData = {
      id:
        vehicle?.id ||
        null,

      vehicleNumber:
        vehicle?.vehicleNumber ||
        registration,

      vehicleType:
        vehicle?.vehicleType ||
        vehicleType,

      vehicleModel:
        vehicle?.vehicleModel ||
        vehicleModel,

      ownerReference:
        vehicle?.ownerReference ||
        ownerReference,

      status:
        vehicle?.status ||
        "Identified"
    };

    navigate(
      "/reports",
      {
        state: {
          vehicle:
            reportVehicleData,

          source:
            "parking-alert",

          alertEscalated:
            true
        }
      }
    );
  }

  /* =====================================================
     TIMER PROGRESS
  ===================================================== */

  const progress =
    ((60 - seconds) / 60) *
    100;

  const urgent =
    seconds <= 10 &&
    seconds > 0;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="premium-alert-page">

      {/* =================================================
          AMBIENT BACKGROUND
      ================================================= */}

      <div
        className="alert-page-ambient"
        aria-hidden="true"
      >
        <span className="alert-ambient-orb alert-orb-one" />
        <span className="alert-ambient-orb alert-orb-two" />

        <span className="alert-particle alert-particle-one" />
        <span className="alert-particle alert-particle-two" />
        <span className="alert-particle alert-particle-three" />
      </div>

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="premium-alert-header">

        <div>

          <div className="alert-network-pill">
            <span />
            PARKSAFE ALERT NETWORK
          </div>

          <span className="eyebrow">
            NOTIFICATION SYSTEM
          </span>

          <h1>
            Notify responsibly.{" "}
            <span>
              Resolve quickly.
            </span>
          </h1>

          <p>
            Contact the registered vehicle
            owner without exposing their
            private information.
          </p>

        </div>

        <div className="alert-header-status">

          <div className="alert-header-icon">
            !
          </div>

          <div>
            <small>
              ALERT SERVICE
            </small>

            <strong>
              {sent
                ? "Notification active"
                : "Ready to notify"}
            </strong>
          </div>

          <span className="alert-online-dot" />

        </div>

      </section>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="premium-alert-hero">

        <div className="alert-hero-copy">

          <div className="alert-hero-label">
            <span />
            PARKING ASSISTANCE
          </div>

          <h2>
            Reach the owner
            <br />

            <span>
              without sharing details.
            </span>
          </h2>

          <p>
            ParkSafe sends a privacy-focused
            parking notification and allows the
            owner one minute to respond before
            call access becomes available.
          </p>

          <div className="alert-hero-features">

            <div>
              <span>✓</span>
              Private contact
            </div>

            <div>
              <span>✓</span>
              1-minute response window
            </div>

            <div>
              <span>✓</span>
              Fair escalation
            </div>

          </div>

        </div>

        {/* ANIMATED PHONE */}

        <div className="alert-network-visual">

          <span className="network-ring network-ring-one" />
          <span className="network-ring network-ring-two" />
          <span className="network-ring network-ring-three" />

          <div className="network-phone">

            <div className="network-phone-speaker" />

            <div className="network-phone-screen">

              <span className="network-phone-logo">
                P
              </span>

              <small>
                PARKSAFE
              </small>

              <strong>
                {sent
                  ? "Alert Active"
                  : "Ready"}
              </strong>

            </div>

          </div>

          <div className="network-message message-one">

            <span className="network-message-icon">
              !
            </span>

            <div>
              <small>
                ALERT
              </small>

              <strong>
                Parking issue
              </strong>
            </div>

          </div>

          <div className="network-message message-two">

            <span className="network-message-icon green">
              ✓
            </span>

            <div>
              <small>
                PRIVACY
              </small>

              <strong>
                Number protected
              </strong>
            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          VEHICLE CARD
      ================================================= */}

      <section className="premium-alert-vehicle">

        <div className="alert-vehicle-top">

          <div className="alert-vehicle-identity">

            <div className="alert-car-icon">
              🚘
            </div>

            <div>

              <span className="eyebrow">
                SELECTED VEHICLE
              </span>

              <h2>
                {registration}
              </h2>

            </div>

          </div>

          <div
            className={
              sent
                ? "alert-vehicle-state active"
                : "alert-vehicle-state"
            }
          >
            <span />

            {sent
              ? "Alert Active"
              : "Ready"}
          </div>

        </div>

        <div className="alert-vehicle-details">

          <div>
            <span>
              REGISTRATION
            </span>

            <strong>
              {registration}
            </strong>
          </div>

          <div>
            <span>
              VEHICLE
            </span>

            <strong>
              {vehicleModel}
            </strong>
          </div>

          <div>
            <span>
              OWNER REFERENCE
            </span>

            <strong>
              {ownerReference}
            </strong>
          </div>

          <div>
            <span>
              CONTACT
            </span>

            <strong>
              {maskedOwnerNumber}
            </strong>
          </div>

        </div>

        {!sent && (
          <div className="alert-send-area">

            <div>

              <span>
                READY TO SEND
              </span>

              <h3>
                Notify the vehicle owner?
              </h3>

              <p>
                A privacy-protected parking
                alert will be sent to the
                registered owner.
              </p>

            </div>

            <button
              type="button"
              className="premium-send-alert"
              onClick={sendAlert}
            >

              <span className="send-alert-icon">
                !
              </span>

              Send Parking Alert

              <strong>
                →
              </strong>

            </button>

          </div>
        )}

      </section>

      {/* =================================================
          ALERT WORKFLOW
      ================================================= */}

      {sent && (
        <section className="premium-alert-workflow">

          {/* =============================================
              WORKFLOW HEADER
          ============================================= */}

          <div className="alert-workflow-heading">

            <div>

              <div className="alert-sent-pill">
                <span />
                ALERT SENT
              </div>

              <h2>
                Parking Notification Active
              </h2>

              <p>
                The registered vehicle owner
                has been notified about the
                parking issue.
              </p>

            </div>

            <div className="alert-workflow-live">

              <span />

              <div>
                <small>
                  STATUS
                </small>

                <strong>
                  Live
                </strong>
              </div>

            </div>

          </div>

          {/* =============================================
              SMS PREVIEW
          ============================================= */}

          <div className="alert-sms-preview">

            <div className="sms-preview-phone">

              <div className="sms-avatar">
                P
              </div>

              <div>
                <span>
                  ParkSafe Alert
                </span>

                <small>
                  just now
                </small>
              </div>

            </div>

            <div className="sms-bubble">

              <span className="sms-bubble-label">
                PARKING NOTIFICATION
              </span>

              <p>
                Your vehicle{" "}
                <strong>
                  {registration}
                </strong>{" "}
                has been reported as parked
                in a restricted or inconvenient
                location. Please check and
                respond.
              </p>

              <div className="sms-delivered">
                Delivered ✓✓
              </div>

            </div>

          </div>

          {/* =============================================
              OWNER RESPONSE
          ============================================= */}

          <div className="premium-owner-response">

            <div className="owner-response-heading">

              <div>

                <span className="eyebrow">
                  OWNER RESPONSE
                </span>

                <h3>
                  Response Simulation
                </h3>

              </div>

              {!reply && (
                <span className="owner-waiting-small">
                  <span />
                  Waiting
                </span>
              )}

            </div>

            {!reply ? (
              <div className="premium-reply-options">

                {/* WILL MOVE */}

                <button
                  type="button"
                  onClick={() =>
                    simulateReply(
                      "I will move my vehicle shortly."
                    )
                  }
                >

                  <span className="reply-option-icon">
                    ✓
                  </span>

                  <div>
                    <strong>
                      I will move it
                    </strong>

                    <small>
                      Owner acknowledges the issue
                    </small>
                  </div>

                  <span className="reply-arrow">
                    →
                  </span>

                </button>

                {/* ALREADY MOVED */}

                <button
                  type="button"
                  onClick={() =>
                    simulateReply(
                      "I have already moved my vehicle."
                    )
                  }
                >

                  <span className="reply-option-icon cyan">
                    🚘
                  </span>

                  <div>
                    <strong>
                      Already moved
                    </strong>

                    <small>
                      Vehicle is no longer blocking
                    </small>
                  </div>

                  <span className="reply-arrow">
                    →
                  </span>

                </button>

              </div>
            ) : (
              <div className="premium-owner-replied">

                <div className="owner-replied-animation">

                  <span className="owner-success-ring ring-one" />
                  <span className="owner-success-ring ring-two" />

                  <div>
                    ✓
                  </div>

                </div>

                <div className="owner-replied-copy">

                  <span>
                    OWNER RESPONDED
                  </span>

                  <h3>
                    Response received successfully
                  </h3>

                  <div className="owner-chat-bubble">
                    {reply}
                  </div>

                  <p>
                    No phone call is required.
                    The parking issue can now
                    be resolved directly.
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* =============================================
              TIMER
          ============================================= */}

          {!reply &&
            !callUnlocked && (
              <div
                className={
                  urgent
                    ? "premium-alert-timer alert-timer-urgent"
                    : "premium-alert-timer"
                }
              >

                {/* LEFT */}

                <div className="timer-phone-zone">

                  <div className="timer-phone-animation">

                    <span className="timer-signal signal-a" />
                    <span className="timer-signal signal-b" />
                    <span className="timer-signal signal-c" />

                    <div
                      className={
                        urgent
                          ? "timer-phone-core urgent"
                          : "timer-phone-core"
                      }
                    >
                      📱
                    </div>

                  </div>

                  <div className="timer-live-label">
                    <span />
                    LIVE ALERT
                  </div>

                </div>

                {/* RIGHT */}

                <div className="timer-main-content">

                  <span
                    className={
                      urgent
                        ? "timer-status-badge urgent"
                        : "timer-status-badge"
                    }
                  >
                    {waitingStatus.step}
                  </span>

                  <h2>
                    {waitingStatus.title}
                  </h2>

                  <p>
                    {waitingStatus.text}
                  </p>

                  <div className="timer-owner-contact">

                    <div>
                      <small>
                        REGISTERED OWNER
                      </small>

                      <strong>
                        {maskedOwnerNumber}
                      </strong>
                    </div>

                    <span>
                      MASKED
                    </span>

                  </div>

                  <div
                    className={
                      urgent
                        ? "premium-countdown urgent"
                        : "premium-countdown"
                    }
                  >
                    {formatTime(seconds)}
                  </div>

                  <div className="premium-timer-track">

                    <div
                      className={
                        urgent
                          ? "premium-timer-fill urgent"
                          : "premium-timer-fill"
                      }
                      style={{
                        width:
                          `${progress}%`
                      }}
                    />

                  </div>

                  <div className="timer-track-labels">

                    <span>
                      Alert sent
                    </span>

                    <span>
                      Call unlock
                    </span>

                  </div>

                  {urgent ? (
                    <div className="timer-urgent-message">

                      <span>
                        !
                      </span>

                      Call access unlocking in{" "}

                      <strong>
                        {seconds} seconds
                      </strong>

                    </div>
                  ) : (
                    <p className="timer-normal-message">
                      The call option will unlock
                      automatically if no response
                      is received within one minute.
                    </p>
                  )}

                  <button
                    type="button"
                    className="premium-locked-call"
                    disabled
                  >

                    <span>
                      🔒
                    </span>

                    Call Owner

                    <strong>
                      {formatTime(seconds)}
                    </strong>

                  </button>

                </div>

              </div>
            )}

          {/* =============================================
              CALL AVAILABLE
          ============================================= */}

          {!reply &&
            callUnlocked && (
              <div className="premium-call-ready">

                {/* CALL VISUAL */}

                <div className="call-ready-visual">

                  <span className="call-ready-ring ready-ring-one" />
                  <span className="call-ready-ring ready-ring-two" />
                  <span className="call-ready-ring ready-ring-three" />

                  <div
                    className={
                      calling
                        ? "call-ready-phone ringing"
                        : "call-ready-phone"
                    }
                  >
                    📞
                  </div>

                </div>

                {/* CALL CONTENT */}

                <div className="call-ready-content">

                  <span className="call-available-pill">
                    <span />
                    CALL AVAILABLE
                  </span>

                  <h2>
                    No Response Received
                  </h2>

                  <p>
                    The owner did not respond
                    within the one-minute
                    notification window.
                    Demo call access is now
                    available.
                  </p>

                  <div className="call-owner-number">

                    <div>

                      <small>
                        REGISTERED OWNER
                      </small>

                      <strong>
                        {maskedOwnerNumber}
                      </strong>

                      <span>
                        Privacy protected
                      </span>

                    </div>

                    <div className="call-unlocked-icon">
                      ✓
                    </div>

                  </div>

                  {/* CALL BUTTON */}

                  <button
                    type="button"
                    className={
                      calling
                        ? "premium-call-button calling"
                        : "premium-call-button"
                    }
                    onClick={callOwner}
                    disabled={calling}
                  >

                    <span className="call-button-icon">
                      📞
                    </span>

                    {calling
                      ? "Calling Owner..."
                      : "Call Owner"}

                    {!calling && (
                      <strong>
                        →
                      </strong>
                    )}

                  </button>

                  {/* CALL STATUS */}

                  {callStatus && (
                    <div
                      className={
                        calling
                          ? "premium-call-status calling"
                          : "premium-call-status connected"
                      }
                    >

                      {calling ? (
                        <span className="premium-call-loader" />
                      ) : (
                        <span className="call-connected-check">
                          ✓
                        </span>
                      )}

                      <div>

                        <strong>
                          {calling
                            ? "Connecting call"
                            : "Demo call connected"}
                        </strong>

                        <p>
                          {callStatus}
                        </p>

                      </div>

                    </div>
                  )}

                  {/* =====================================
                      REPORT ESCALATION

                      IMPORTANT:
                      Ye sirf call attempt complete hone
                      ke baad show hoga.
                  ===================================== */}

                  {callStatus &&
                    !calling && (
                      <div className="alert-report-escalation">

                        <div className="report-escalation-top">

                          <div className="report-escalation-icon">
                            !
                          </div>

                          <div>

                            <span>
                              ISSUE STILL UNRESOLVED?
                            </span>

                            <h3>
                              Vehicle still blocking
                              your way?
                            </h3>

                            <p>
                              If the owner did not
                              answer the call or the
                              vehicle has still not
                              been moved, you can
                              escalate this parking
                              issue.
                            </p>

                          </div>

                        </div>

                        {/* VEHICLE */}

                        <div className="report-escalation-vehicle">

                          <div>

                            <small>
                              VEHICLE TO BE REPORTED
                            </small>

                            <strong>
                              {registration}
                            </strong>

                            <span>
                              {vehicleModel}
                              {vehicleType
                                ? ` • ${vehicleType}`
                                : ""}
                            </span>

                          </div>

                          <span className="report-vehicle-verified">
                            <span />
                            IDENTIFIED
                          </span>

                        </div>

                        {/* WARNING */}

                        <div className="report-escalation-warning">

                          <span>
                            i
                          </span>

                          <p>
                            Submit a report only
                            if the parking issue
                            remains unresolved
                            after attempting to
                            contact the vehicle
                            owner.
                          </p>

                        </div>

                        {/* REPORT BUTTON */}

                        <button
                          type="button"
                          className="report-this-vehicle-button"
                          onClick={reportVehicle}
                        >

                          <span className="report-button-icon">
                            ⚑
                          </span>

                          <div>

                            <strong>
                              Report This Vehicle
                            </strong>

                            <small>
                              Continue with violation
                              details & evidence
                            </small>

                          </div>

                          <span className="report-button-arrow">
                            →
                          </span>

                        </button>

                      </div>
                    )}

                </div>

              </div>
            )}

        </section>
      )}

      {/* =================================================
          PRIVACY NOTE
      ================================================= */}

      <section className="alert-privacy-note">

        <div className="alert-privacy-icon">
          ✓
        </div>

        <div>

          <span>
            PRIVACY FIRST
          </span>

          <h3>
            Contact without exposing
            personal information.
          </h3>

          <p>
            ParkSafe uses masked demo contact
            information so parking issues can
            be resolved without displaying the
            owner's actual phone number.
          </p>

        </div>

      </section>

    </div>
  );
}