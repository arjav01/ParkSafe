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

function ParkingScene() {
  return (
    <div className="ps-home-scene" aria-label="Animated illustration of a car entering a smart parking space">
      <div className="ps-scene-glow ps-scene-glow-one" />
      <div className="ps-scene-glow ps-scene-glow-two" />

      <div className="ps-scene-topline">
        <span className="ps-live-dot" />
        SMART PARKING, MADE SIMPLE
      </div>

      <svg className="ps-parking-svg" viewBox="0 0 680 390" role="img" aria-label="A blue car moves into a marked parking bay">
        <defs>
          <linearGradient id="psCarBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#72d9ff" />
            <stop offset="48%" stopColor="#328fe5" />
            <stop offset="100%" stopColor="#2461bc" />
          </linearGradient>
          <linearGradient id="psGlass" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#e6f8ff" />
            <stop offset="100%" stopColor="#79b6df" />
          </linearGradient>
          <linearGradient id="psBay" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#42dfc0" stopOpacity=".26" />
            <stop offset="100%" stopColor="#42a8f5" stopOpacity=".06" />
          </linearGradient>
          <filter id="psCarShadow" x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Parking bay and approach lane */}
        <path d="M365 83 L594 83 L594 314 L365 314 Z" fill="url(#psBay)" stroke="#70e6d2" strokeWidth="2" strokeDasharray="9 8" opacity=".9" />
        <path d="M388 103 L571 103 L571 294 L388 294 Z" fill="none" stroke="#a0e9e1" strokeWidth="1.5" opacity=".28" />
        <path d="M35 316 H635" stroke="#b9d8f5" strokeWidth="2" opacity=".25" />
        <path d="M40 336 H640" stroke="#b9d8f5" strokeWidth="1" strokeDasharray="12 13" opacity=".16" />
        <path d="M345 105 V292" stroke="#b5e8f2" strokeWidth="2" strokeDasharray="7 10" opacity=".3" />
        <text x="480" y="267" textAnchor="middle" fill="#a9f6e7" fontSize="13" fontWeight="700" letterSpacing="3">PARKING BAY</text>

        {/* Parking sensor rings */}
        <g className="ps-sensor-rings" fill="none" stroke="#67e7d0" strokeWidth="2">
          <path d="M490 76 C515 54 545 54 570 76" opacity=".65" />
          <path d="M475 61 C511 29 550 29 586 61" opacity=".4" />
          <path d="M460 46 C505 4 557 4 601 46" opacity=".22" />
        </g>

        {/* Vehicle shadow */}
        <ellipse className="ps-car-shadow" cx="195" cy="289" rx="126" ry="17" fill="#071b3d" opacity=".45" filter="url(#psCarShadow)" />

        {/* Vehicle drives into the marked bay */}
        <g className="ps-moving-car">
          <g className="ps-car-bounce">
            {/* body */}
            <path d="M67 249 L79 216 Q84 203 102 198 L145 188 Q169 153 207 148 L280 148 Q304 150 324 177 L351 210 L372 218 Q383 223 386 238 L386 260 Q386 272 372 275 L77 275 Q61 271 67 249Z" fill="url(#psCarBody)" stroke="#a9e8ff" strokeWidth="2.5" />
            {/* windows */}
            <path d="M158 190 Q177 160 209 157 L244 157 L244 198 L146 198Z" fill="url(#psGlass)" stroke="#d8f5ff" strokeWidth="2" />
            <path d="M254 157 L278 157 Q298 159 315 184 L326 198 L254 198Z" fill="url(#psGlass)" stroke="#d8f5ff" strokeWidth="2" />
            <path d="M249 157 V201" stroke="#2362a8" strokeWidth="5" />
            {/* details */}
            <path d="M84 225 H111" stroke="#dff8ff" strokeWidth="5" strokeLinecap="round" opacity=".85" />
            <path d="M348 226 L372 234" stroke="#fff0c5" strokeWidth="6" strokeLinecap="round" />
            <path d="M104 265 H351" stroke="#174c91" strokeWidth="3" opacity=".6" />
            <path d="M180 207 H314" stroke="#d8f6ff" strokeWidth="2" opacity=".35" />
            <rect x="62" y="238" width="12" height="19" rx="5" fill="#e5f8ff" />
            <rect x="376" y="244" width="9" height="17" rx="4" fill="#ff7889" />
            {/* wheels */}
            <g className="ps-wheel" transform="translate(133 270)">
              <circle r="27" fill="#102440" stroke="#8bb8db" strokeWidth="4" />
              <circle r="15" fill="#c9e4f4" />
              <circle r="7" fill="#4b7099" />
              <path d="M0 -13 V13 M-13 0 H13 M-9 -9 L9 9 M9 -9 L-9 9" stroke="#6288ad" strokeWidth="2" />
            </g>
            <g className="ps-wheel" transform="translate(324 270)">
              <circle r="27" fill="#102440" stroke="#8bb8db" strokeWidth="4" />
              <circle r="15" fill="#c9e4f4" />
              <circle r="7" fill="#4b7099" />
              <path d="M0 -13 V13 M-13 0 H13 M-9 -9 L9 9 M9 -9 L-9 9" stroke="#6288ad" strokeWidth="2" />
            </g>
            {/* subtle QR badge on the side */}
            <g transform="translate(265 218)">
              <rect width="31" height="31" rx="5" fill="#f7fdff" />
              <path d="M5 5 H12 V12 H5Z M19 5 H26 V12 H19Z M5 19 H12 V26 H5Z M17 18 H20 V21 H17Z M23 18 H26 V21 H23Z M18 24 H26 V27 H18Z" fill="#173c68" />
            </g>
          </g>
        </g>

        {/* Scan beam and parking confirmation marker */}
        <g className="ps-scan-beam">
          <path d="M270 118 V285" stroke="#6fffe0" strokeWidth="3" strokeDasharray="7 7" />
          <path d="M257 118 H283 M257 285 H283" stroke="#6fffe0" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g className="ps-park-check" transform="translate(490 150)">
          <circle r="34" fill="#20c997" opacity=".15" />
          <circle r="24" fill="#20c997" />
          <path d="M-11 0 L-3 8 L12 -9" fill="none" stroke="#073d49" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>

      <div className="ps-scene-chip ps-chip-scan">
        <span className="ps-chip-icon">⌗</span>
        <span><strong>QR ready</strong><small>Vehicle identification</small></span>
      </div>
      <div className="ps-scene-chip ps-chip-notify">
        <span className="ps-chip-icon ps-chip-icon-green">✓</span>
        <span><strong>ParkSafe connected</strong><small>Responsible parking assistance</small></span>
      </div>
      <div className="ps-scene-caption">A smarter way to keep spaces clear.</div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="ps-home-page">
      <style>{`
        .ps-home-page{--ps-navy:#142d53;--ps-blue:#286fca;--ps-purple:#685cf0;--ps-muted:#8292ad;color:#1b2b49;width:100%;overflow:hidden}
        .ps-home-page *{box-sizing:border-box}
        .ps-home-welcome{max-width:900px;margin:0 0 30px}
        .ps-home-eyebrow{display:inline-flex;align-items:center;gap:9px;color:#655cf0;font-size:12px;font-weight:800;letter-spacing:2.1px;text-transform:uppercase}
        .ps-home-welcome h1{max-width:850px;margin:18px 0 12px;font-size:clamp(34px,4.2vw,58px);line-height:1.08;letter-spacing:-2.2px;color:#1b2b49;font-weight:850}
        .ps-home-welcome p{max-width:720px;margin:0;color:#8090aa;font-size:16px;line-height:1.8}
        .ps-home-hero{position:relative;display:grid;grid-template-columns:minmax(310px,.82fr) minmax(0,1.18fr);align-items:center;gap:28px;min-height:430px;padding:38px 42px;border-radius:28px;overflow:hidden;background:linear-gradient(112deg,#12294e 0%,#173c6b 53%,#2368a4 100%);box-shadow:0 24px 55px rgba(24,55,99,.16);isolation:isolate}
        .ps-home-hero:before{content:"";position:absolute;width:470px;height:470px;border:1px solid rgba(164,224,255,.13);border-radius:50%;right:8%;top:-55%;z-index:-1}
        .ps-home-hero:after{content:"";position:absolute;width:330px;height:330px;border:1px solid rgba(164,224,255,.11);border-radius:50%;right:18%;bottom:-68%;z-index:-1}
        .ps-home-copy{position:relative;z-index:2;max-width:490px}
        .ps-home-hero-label{color:#7ce8e2;font-size:11px;font-weight:850;letter-spacing:2.4px;text-transform:uppercase}
        .ps-home-copy h2{margin:18px 0 15px;color:#fff;font-size:clamp(30px,3.1vw,43px);line-height:1.13;letter-spacing:-1.4px;font-weight:850}
        .ps-home-copy p{max-width:460px;margin:0;color:#d3e2f5;font-size:15px;line-height:1.85}
        .ps-home-actions{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:27px}
        .ps-home-button{display:inline-flex;align-items:center;gap:22px;padding:16px 20px;border-radius:13px;background:#fff;color:#18365c;text-decoration:none;font-weight:800;font-size:14px;box-shadow:0 8px 22px rgba(4,20,45,.13);transition:transform .2s ease,box-shadow .2s ease}
        .ps-home-button:hover{transform:translateY(-3px);box-shadow:0 13px 28px rgba(4,20,45,.22)}
        .ps-home-button span{font-size:21px;line-height:1}
        .ps-home-note{display:flex;align-items:center;gap:9px;margin-top:23px;color:#c7d8ed;font-size:12px}
        .ps-home-note-dot,.ps-live-dot{width:8px;height:8px;border-radius:50%;background:#53dfbd;box-shadow:0 0 0 5px rgba(83,223,189,.12)}
        .ps-home-scene{position:relative;min-width:0;min-height:345px;border:1px solid rgba(184,225,255,.15);border-radius:22px;background:radial-gradient(ellipse at 54% 58%,rgba(71,157,222,.24),transparent 57%),rgba(7,27,57,.15);overflow:hidden}
        .ps-scene-glow{position:absolute;border-radius:50%;filter:blur(2px);pointer-events:none}
        .ps-scene-glow-one{width:240px;height:240px;right:12%;top:10%;background:rgba(58,168,218,.10)}
        .ps-scene-glow-two{width:180px;height:180px;left:8%;bottom:-30%;background:rgba(70,116,230,.13)}
        .ps-scene-topline{position:absolute;top:18px;left:22px;display:flex;align-items:center;gap:10px;color:#c2e9f6;font-size:9px;font-weight:800;letter-spacing:1.7px;z-index:3}
        .ps-live-dot{width:7px;height:7px}
        .ps-parking-svg{position:absolute;inset:15px 0 0;width:100%;height:calc(100% - 35px);overflow:visible}
        .ps-moving-car{animation:ps-drive-in 8s ease-in-out infinite;transform-box:view-box;transform-origin:0 0}
        .ps-car-bounce{animation:ps-car-bob 1.8s ease-in-out infinite}
        .ps-wheel{transform-box:fill-box;transform-origin:center;animation:ps-wheel-turn 8s linear infinite}
        .ps-car-shadow{animation:ps-shadow-move 8s ease-in-out infinite}
        .ps-sensor-rings path{animation:ps-sensor-pulse 2.2s ease-out infinite;transform-origin:520px 70px}
        .ps-sensor-rings path:nth-child(2){animation-delay:.35s}.ps-sensor-rings path:nth-child(3){animation-delay:.7s}
        .ps-scan-beam{animation:ps-scan 8s ease-in-out infinite;opacity:0}
        .ps-park-check{opacity:0;animation:ps-check-pop 8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
        .ps-scene-chip{position:absolute;display:flex;align-items:center;gap:10px;padding:10px 13px;border:1px solid rgba(218,241,255,.75);border-radius:13px;background:rgba(255,255,255,.96);box-shadow:0 12px 28px rgba(3,19,43,.2);color:#1b3152;z-index:4;animation:ps-chip-float 4s ease-in-out infinite}
        .ps-scene-chip strong,.ps-scene-chip small{display:block;white-space:nowrap}
        .ps-scene-chip strong{font-size:11px;font-weight:850}
        .ps-scene-chip small{margin-top:3px;color:#8090a9;font-size:9px}
        .ps-chip-icon{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:#e8f1ff;color:#3276d0;font-size:19px;font-weight:900}
        .ps-chip-icon-green{background:#e2f8ef;color:#13996e}
        .ps-chip-scan{top:22%;right:4%;animation-delay:-1.2s}
        .ps-chip-notify{bottom:13%;right:4%;animation-delay:-2.3s}
        .ps-scene-caption{position:absolute;left:22px;bottom:18px;color:#b5d0e8;font-size:10px;letter-spacing:.3px}
        .ps-home-process{margin-top:58px}
        .ps-home-section-heading{margin-bottom:24px}
        .ps-home-section-heading h2{margin:10px 0 6px;color:#1b2b49;font-size:30px;letter-spacing:-.8px}
        .ps-home-section-heading p{margin:0;color:#8292ad;font-size:15px}
        .ps-home-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
        .ps-home-step{position:relative;padding:25px 23px 26px;border:1px solid #e3eaf5;border-radius:19px;background:#fff;box-shadow:0 8px 25px rgba(26,57,100,.035);transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease;overflow:hidden}
        .ps-home-step:after{content:"";position:absolute;width:95px;height:95px;right:-42px;bottom:-48px;border-radius:50%;background:linear-gradient(135deg,rgba(104,92,240,.08),rgba(46,163,207,.07));transition:transform .3s ease}
        .ps-home-step:hover{transform:translateY(-6px);border-color:#cbd8f8;box-shadow:0 17px 34px rgba(35,75,130,.09)}
        .ps-home-step:hover:after{transform:scale(1.5)}
        .ps-home-step-number{display:grid;place-items:center;width:53px;height:53px;border-radius:15px;background:#edf2ff;color:#3569c4;font-size:17px;font-weight:900}
        .ps-home-step h3{position:relative;z-index:1;margin:22px 0 9px;color:#263957;font-size:16px;font-weight:850}
        .ps-home-step p{position:relative;z-index:1;margin:0;color:#8292ad;font-size:13px;line-height:1.8}
        .ps-home-bottom{display:flex;align-items:flex-start;gap:16px;margin-top:26px;padding:22px 24px;border:1px solid #dce8ff;border-radius:18px;background:linear-gradient(105deg,#f0f5ff,#f6f9ff)}
        .ps-home-bottom-icon{display:grid;place-items:center;flex:0 0 42px;height:42px;border-radius:12px;background:#dceaff;color:#326bc4;font-size:19px;font-weight:900}
        .ps-home-bottom h3{margin:2px 0 6px;color:#2a3e5e;font-size:15px;font-weight:850}
        .ps-home-bottom p{margin:0;color:#7184a3;font-size:13px;line-height:1.75}
        @keyframes ps-drive-in{0%,8%{transform:translateX(-135px)}42%,68%{transform:translateX(0)}82%,100%{transform:translateX(-135px)}}
        @keyframes ps-car-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
        @keyframes ps-wheel-turn{0%,40%{transform:rotate(0deg)}70%,100%{transform:rotate(360deg)}}
        @keyframes ps-shadow-move{0%,8%{transform:translateX(-135px);opacity:.25}42%,68%{transform:translateX(0);opacity:.5}82%,100%{transform:translateX(-135px);opacity:.25}}
        @keyframes ps-sensor-pulse{0%{opacity:.15;transform:scale(.94)}50%{opacity:.8;transform:scale(1.04)}100%{opacity:.15;transform:scale(.94)}}
        @keyframes ps-scan{0%,32%{opacity:0;transform:translateX(-85px)}42%,57%{opacity:1;transform:translateX(0)}70%,100%{opacity:0;transform:translateX(25px)}}
        @keyframes ps-check-pop{0%,43%{opacity:0;transform:scale(.5)}51%,67%{opacity:1;transform:scale(1)}78%,100%{opacity:0;transform:scale(.7)}}
        @keyframes ps-chip-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @media(max-width:1050px){.ps-home-hero{grid-template-columns:1fr;gap:18px}.ps-home-copy{max-width:720px}.ps-home-scene{min-height:330px}.ps-home-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:600px){.ps-home-welcome{margin-bottom:22px}.ps-home-welcome h1{font-size:36px;letter-spacing:-1.4px}.ps-home-welcome p{font-size:14px}.ps-home-hero{padding:27px 20px;border-radius:21px;min-height:0}.ps-home-copy h2{font-size:31px}.ps-home-copy p{font-size:13px}.ps-home-scene{min-height:265px;border-radius:16px}.ps-scene-chip{padding:8px 9px}.ps-scene-chip strong{font-size:9px}.ps-scene-chip small{font-size:8px}.ps-chip-scan{right:2%;top:20%}.ps-chip-notify{right:2%;bottom:12%}.ps-home-process{margin-top:42px}.ps-home-section-heading h2{font-size:25px}.ps-home-steps{grid-template-columns:1fr;gap:12px}.ps-home-step{padding:20px}.ps-home-step h3{margin-top:15px}.ps-home-bottom{padding:17px;gap:12px}}
        @media(prefers-reduced-motion:reduce){.ps-home-page *,.ps-home-page *:before,.ps-home-page *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
      `}</style>

      <section className="ps-home-welcome">
        <span className="ps-home-eyebrow">SMART PARKING SOLUTION</span>
        <h1>Making parking safer, one scan at a time.</h1>
        <p>
          A smarter way to connect people, notify vehicle owners and help resolve
          parking issues responsibly.
        </p>
      </section>

      <section className="ps-home-hero">
        <div className="ps-home-copy">
          <span className="ps-home-hero-label">PARKSAFE ASSISTANCE</span>
          <h2>Is a vehicle blocking your way?</h2>
          <p>
            Identify the vehicle, notify its owner and give them an opportunity
            to correct the parking issue before taking further action.
          </p>
          <div className="ps-home-actions">
            <Link to="/vehicles" className="ps-home-button">
              Identify a Vehicle <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="ps-home-note">
            <span className="ps-home-note-dot" />
            Fair notification before escalation
          </div>
        </div>
        <ParkingScene />
      </section>

      <section className="ps-home-process">
        <div className="ps-home-section-heading">
          <span className="ps-home-eyebrow">SIMPLE &amp; RESPONSIBLE</span>
          <h2>How ParkSafe Works</h2>
          <p>A step-by-step approach to resolving parking issues.</p>
        </div>

        <div className="ps-home-steps">
          {steps.map((step) => (
            <article className="ps-home-step" key={step.number}>
              <span className="ps-home-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ps-home-bottom">
        <div className="ps-home-bottom-icon" aria-hidden="true">i</div>
        <div>
          <h3>Responsible reporting matters</h3>
          <p>
            ParkSafe follows a progressive notification process. Formal reporting
            is intended for parking issues that remain unresolved after the owner
            has been notified.
          </p>
        </div>
      </section>
    </div>
  );
}
