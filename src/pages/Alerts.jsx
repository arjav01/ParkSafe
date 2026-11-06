
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Alerts() {
  const location = useLocation();
  const vehicle = location.state?.vehicle;

  const [sent, setSent] = useState(false);
  const [reply, setReply] = useState("");
  const [seconds, setSeconds] = useState(600);
  const [callUnlocked, setCallUnlocked] = useState(false);
  const [callStatus, setCallStatus] = useState("");

  useEffect(() => {
    if (!sent || reply || callUnlocked) return;

    const timer = setInterval(() => {
      setSeconds((previous) => {
        if (previous <= 1) {
          setCallUnlocked(true);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sent, reply, callUnlocked]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const secs = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  function sendAlert() {
    setSent(true);
    setReply("");
    setSeconds(600);
    setCallUnlocked(false);
    setCallStatus("");
  }

  function simulateReply(message) {
    setReply(message);
  }

  return (
    <div>
      <span className="eyebrow">NOTIFICATION SYSTEM</span>
      <h1>Parking Alerts</h1>
      <p className="subtitle">
        Notify vehicle owners about parking issues.
      </p>

      <div className="result-card">
        <h2>Vehicle Information</h2>
        <p>
          <strong>Registration:</strong>{" "}
          {vehicle?.vehicleNumber || "UK01AA1000 (Demo)"}
        </p>
        <p>
          <strong>Owner Reference:</strong>{" "}
          {vehicle?.ownerReference || "OWN0001"}
        </p>
        <p><strong>Notification:</strong> Simulated SMS</p>

        {!sent && (
          <button className="primary-button" onClick={sendAlert}>
            Send Parking Alert
          </button>
        )}
      </div>

      {sent && (
        <div className="result-card">
          <span className="success-label">ALERT SENT</span>
          <h2>SMS Notification</h2>
          <p>
            Your vehicle is reported to be parked in a restricted
            or inconvenient location. Please check and respond.
          </p>

          <h3>Owner Response (Simulation)</h3>

          {!reply ? (
            <div>
              <p>Waiting for owner response...</p>
              <button
                className="primary-button"
                onClick={() => simulateReply("I will move my vehicle shortly.")}
              >
                Reply: I will move it
              </button>

              <button
                className="primary-button"
                onClick={() => simulateReply("I have already moved my vehicle.")}
              >
                Reply: Already moved
              </button>
            </div>
          ) : (
            <p><strong>Owner:</strong> {reply}</p>
          )}

          <div>
            <h3>Call Owner</h3>

            {reply ? (
              <p>Owner has responded. Call is not required.</p>
            ) : callUnlocked ? (
              <>
                <p>10 minutes completed. Calling is now available.</p>
                <button
                  className="primary-button"
                  onClick={() => setCallStatus("Demo call initiated successfully.")}
                >
                  Call Owner
                </button>
              </>
            ) : (
              <>
                <h2>{formatTime(seconds)}</h2>
                <p>Call option unlocks after 10 minutes.</p>
              </>
            )}

            {callStatus && <p>{callStatus}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
