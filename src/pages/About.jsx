import {
  useEffect,
  useRef,
  useState
} from "react";

import arjavPhoto from "../assets/team/arjav.webp";
import nihitaPhoto from "../assets/team/nihita.webp";
import gauranshPhoto from "../assets/team/gauransh.webp";
import namanPhoto from "../assets/team/naman.webp";

/* =========================================================
   TEAM DATA
========================================================= */

const teamMembers = [
  {
    name: "Arjav Jain",
    sapId: "590012057",
    role: "Backend Developer",
    shortRole:
      "Backend • Database • Deployment",
    photo: arjavPhoto,
    gender: "him",

    description:
      "Responsible for backend development, Supabase database integration, REST APIs, deployment and overall system integration.",

    about:
      "I am a third-year Data Science student at UPES with an interest in backend development, databases and building practical full-stack applications. While working on ParkSafe, I focused on understanding how frontend, backend and database components connect to form a complete working system.",

    interests: [
      "Data Science",
      "Backend Development",
      "Databases",
      "Full Stack"
    ],

    contributions: [
      "Backend",
      "Database",
      "REST APIs",
      "Supabase",
      "Deployment"
    ],

    number: "01"
  },

  {
    name: "Gauransh Baunthiyal",
    sapId: "590016981",
    role: "Frontend Developer",
    shortRole:
      "Frontend • Authority Dashboard",
    photo: gauranshPhoto,
    gender: "him",

    description:
      "Developed major frontend components including the Authority Dashboard, report management interface and authority interactions.",

    about:
      "I am a third-year Data Science student at UPES with an interest in frontend development and creating interactive user experiences. Through ParkSafe, I worked on designing interfaces that make complex operations simple and easy for users and authorities.",

    interests: [
      "Data Science",
      "Frontend Development",
      "UI Design",
      "Web Development"
    ],

    contributions: [
      "Frontend",
      "Authority Dashboard",
      "Reports",
      "UI Design"
    ],

    number: "02"
  },

  {
    name: "Nihita Gupta",
    sapId: "590013029",
    role: "Documentation & Frontend",
    shortRole:
      "Documentation • Profile • Vehicles",
    photo: nihitaPhoto,
    gender: "her",

    description:
      "Contributed to project documentation and frontend features including My Profile and My Vehicles.",

    about:
      "I am a third-year Data Science student at UPES with an interest in documentation, frontend development and presenting technical information in a clear and organised way. In ParkSafe, I contributed to both project documentation and user-focused features.",

    interests: [
      "Data Science",
      "Documentation",
      "Frontend",
      "User Experience"
    ],

    contributions: [
      "Documentation",
      "My Profile",
      "My Vehicles",
      "Frontend"
    ],

    number: "03"
  },

  {
    name: "Naman Kakkar",
    sapId: "590016199",
    role: "Frontend Contributor",
    shortRole:
      "Home Page • Documentation",
    photo: namanPhoto,
    gender: "him",

    description:
      "Contributed to the ParkSafe Home page and helped explain and document frontend components and their functionality.",

    about:
      "I am a third-year Data Science student at UPES with an interest in frontend development and designing simple, user-friendly web interfaces. Through ParkSafe, I contributed to the Home page and helped explain the frontend implementation of the project.",

    interests: [
      "Data Science",
      "Frontend Development",
      "Web Design",
      "Documentation"
    ],

    contributions: [
      "Home Page",
      "Frontend",
      "Documentation",
      "UI"
    ],

    number: "04"
  }
];

/* =========================================================
   TECHNOLOGIES
========================================================= */

const technologies = [
  {
    name: "React",
    type: "Frontend"
  },
  {
    name: "Node.js",
    type: "Backend"
  },
  {
    name: "Express.js",
    type: "REST API"
  },
  {
    name: "PostgreSQL",
    type: "Database"
  },
  {
    name: "Supabase",
    type: "Database & Storage"
  },
  {
    name: "Vercel",
    type: "Frontend Deployment"
  },
  {
    name: "Render",
    type: "Backend Deployment"
  },
  {
    name: "GitHub",
    type: "Version Control"
  }
];

/* =========================================================
   ABOUT PAGE
========================================================= */

export default function About() {
  const pageRef = useRef(null);

  const [
    openMember,
    setOpenMember
  ] = useState(null);

  /* =======================================================
     TEAM MEMBER EXPAND / COLLAPSE
  ======================================================= */

  const toggleMember = (sapId) => {
    setOpenMember((current) =>
      current === sapId
        ? null
        : sapId
    );
  };

  /* =======================================================
     REVEAL ANIMATION
  ======================================================= */

  useEffect(() => {
    const elements =
      pageRef.current?.querySelectorAll(
        ".about-reveal"
      );

    if (!elements?.length) {
      return;
    }

    /* Fallback:
       Content visible rahe even if
       IntersectionObserver supported na ho.
    */

    if (
      !(
        "IntersectionObserver"
        in window
      )
    ) {
      elements.forEach(
        (element) => {
          element.classList.add(
            "about-visible"
          );
        }
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                entry.target.classList.add(
                  "about-visible"
                );

                observer.unobserve(
                  entry.target
                );
              }
            }
          );
        },
        {
          threshold: 0.05
        }
      );

    elements.forEach(
      (element) => {
        observer.observe(element);
      }
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="parksafe-about-page"
      ref={pageRef}
    >

      {/* =================================================
          INTRO
      ================================================= */}

      <section className="about-page-intro about-reveal">

        <div>

          <div className="about-network-pill">
            <span />

            PARKSAFE PROJECT
          </div>

          <span className="eyebrow">
            ABOUT US
          </span>

          <h1>
            Meet the people behind{" "}

            <span>
              ParkSafe.
            </span>
          </h1>

          <p>
            A smart parking assistance
            platform developed by
            third-year Data Science
            students at UPES.
          </p>

        </div>

        {/* UNIVERSITY */}

        <div className="about-university-card">

          <div className="about-university-logo">
            U
          </div>

          <div>

            <span>
              DEVELOPED AT
            </span>

            <strong>
              UPES
            </strong>

            <small>
              3rd Year • Data Science
            </small>

          </div>

          <span className="about-live-dot" />

        </div>

      </section>

      {/* =================================================
          TEAM
      ================================================= */}

      <section className="about-team-section about-reveal">

        <div className="about-team-heading">

          <div>

            <div className="about-team-label">

              <span />

              THE PEOPLE BEHIND PARKSAFE

            </div>

            <span className="eyebrow">
              MEET OUR TEAM
            </span>

            <h2>
              Four students.

              <br />

              <span>
                One shared vision.
              </span>
            </h2>

          </div>

          <div className="about-team-heading-copy">

            <p>
              ParkSafe was designed and
              developed collaboratively
              by four third-year Data
              Science students at UPES.
            </p>

            <div className="about-team-meta">

              <span>
                UPES
              </span>

              <span>
                DATA SCIENCE
              </span>

              <span>
                3RD YEAR
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            TEAM CARDS
        ================================================= */}

        <div className="about-team-grid">

          {teamMembers.map(
            (member, index) => {
              const isOpen =
                openMember ===
                member.sapId;

              return (
                <article
                  className={`about-member-card ${
                    isOpen
                      ? "about-member-card-open"
                      : ""
                  }`}
                  key={member.sapId}
                  style={{
                    "--member-delay":
                      `${index * 0.1}s`
                  }}
                >

                  {/* =======================================
                      PHOTO
                  ======================================= */}

                  <div className="about-member-image">

                    <img
  src={member.photo}
  alt={member.name}
  loading="lazy"
  decoding="async"
/>

                    <div className="about-member-image-overlay" />

                    <span className="about-member-number">
                      {member.number}
                    </span>

                    <div className="about-member-role-floating">
                      {member.role}
                    </div>

                  </div>

                  {/* =======================================
                      MEMBER DETAILS
                  ======================================= */}

                  <div className="about-member-content">

                    <span className="about-member-course">
                      UPES • DATA SCIENCE • 3RD YEAR
                    </span>

                    <h3>
                      {member.name}
                    </h3>

                    {/* SAP ID */}

                    <div className="about-member-sap">

                      <span>
                        SAP ID
                      </span>

                      <strong>
                        {member.sapId}
                      </strong>

                    </div>

                    {/* PROJECT DESCRIPTION */}

                    <p>
                      {member.description}
                    </p>

                    {/* CONTRIBUTIONS */}

                    <div className="about-member-contributions">

                      {member.contributions.map(
                        (item) => (
                          <span
                            key={item}
                          >
                            {item}
                          </span>
                        )
                      )}

                    </div>

                    {/* RESPONSIBILITY */}

                    <div className="about-member-footer">

                      <span>
                        PRIMARY RESPONSIBILITY
                      </span>

                      <strong>
                        {member.shortRole}
                      </strong>

                    </div>

                    {/* =====================================
                        KNOW ABOUT BUTTON
                    ===================================== */}

                    <button
                      type="button"
                      className={`about-know-button ${
                        isOpen
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleMember(
                          member.sapId
                        )
                      }
                      aria-expanded={
                        isOpen
                      }
                    >

                      <span className="about-know-icon">

                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >

                          <circle
                            cx="12"
                            cy="8"
                            r="4"
                          />

                          <path
                            d="M4 21c0-4 3-7 8-7s8 3 8 7"
                          />

                        </svg>

                      </span>

                      <span>
                        {isOpen
                          ? "Close"
                          : `Know About ${
                              member.gender ===
                              "her"
                                ? "Her"
                                : "Him"
                            }`}
                      </span>

                      <span className="about-know-arrow">
                        {isOpen
                          ? "−"
                          : "+"}
                      </span>

                    </button>

                    {/* =====================================
                        PERSONAL INFORMATION
                    ===================================== */}

                    {isOpen && (
                      <div className="about-personal-info">

                        <div className="about-personal-heading">

                          <span>
                            ABOUT
                          </span>

                          <strong>
                            {
                              member.name.split(
                                " "
                              )[0]
                            }
                          </strong>

                        </div>

                        <p>
                          {member.about}
                        </p>

                        <div className="about-interest-heading">
                          INTERESTS
                        </div>

                        <div className="about-interest-list">

                          {member.interests.map(
                            (interest) => (
                              <span
                                key={
                                  interest
                                }
                              >
                                {interest}
                              </span>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  </div>

                </article>
              );
            }
          )}

        </div>

      </section>

      {/* =================================================
          ABOUT PROJECT
      ================================================= */}

      <section className="about-project-summary about-reveal">

        <span className="eyebrow">
          OUR PROJECT
        </span>

        <h2>
          About ParkSafe
        </h2>

        <p>
          ParkSafe is a smart parking
          assistance platform designed
          to make parking-related
          communication simple and
          organised. Users can identify
          registered vehicles using a QR
          code or vehicle registration
          number and send parking alerts
          to their owners. If the issue
          remains unresolved, users can
          submit a violation report with
          location and supporting
          evidence. The concerned
          authority can review the
          submitted report, approve or
          reject it and provide an
          official remark. ParkSafe
          connects users, vehicle owners
          and authorities through one
          digital platform.
        </p>

      </section>

      {/* =================================================
          TECHNOLOGIES
      ================================================= */}

      <section className="about-project-tech about-reveal">

        <div className="about-section-heading">

          <div>

            <span className="eyebrow">
              TECHNOLOGY
            </span>

            <h2>
              Technologies Used
            </h2>

          </div>

          <p>
            The main technologies used
            to build, store and deploy
            the ParkSafe platform.
          </p>

        </div>

        <div className="about-tech-grid">

          {technologies.map(
            (technology) => (
              <div
                className="about-tech-card"
                key={technology.name}
              >

                <span>
                  {technology.type}
                </span>

                <strong>
                  {technology.name}
                </strong>

              </div>
            )
          )}

        </div>

      </section>

    </div>
  );
}