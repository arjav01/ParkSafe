
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const AUTHORITY_CODE = process.env.AUTHORITY_REGISTRATION_CODE;

if (!JWT_SECRET || !AUTHORITY_CODE || !process.env.DATABASE_URL) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

// Supabase PostgreSQL connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ==========================================
// DATABASE HELPERS
// ==========================================

async function logLogin(req, mobile, success, userId = null) {
  try {
    await db.query(
      `INSERT INTO public.login_activity
       (user_id, mobile, login_success, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        mobile,
        success,
        req.ip || null,
        req.get("user-agent") || null
      ]
    );
  } catch (error) {
    console.error("Login activity logging failed:", error.message);
  }
}

// ==========================================
// HOME AND HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.send("ParkSafe Backend is Running!");
});

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      success: true,
      message: "ParkSafe API and Supabase are connected"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// ==========================================
// VEHICLE SEARCH
// ==========================================

app.get("/api/vehicles/:number", async (req, res) => {
  try {
    const number = req.params.number.trim().toUpperCase();

    const result = await db.query(
      `SELECT id, vehicle_number, vehicle_type,
              vehicle_model, owner_reference, status
       FROM public.vehicles
       WHERE vehicle_number = $1`,
      [number]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.json({
      success: true,
      vehicle: result.rows[0]
    });
  } catch (error) {
    console.error("Vehicle search error:", error.message);

    res.status(500).json({
      success: false,
      message: "Vehicle search failed"
    });
  }
});

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Login required"
    });
  }

  jwt.verify(token, JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    req.user = decoded;
    next();
  });
}

// ==========================================
// ROLE AUTHORIZATION
// ==========================================

function requireRole(role) {
  return async (req, res, next) => {
    try {
      const result = await db.query(
        `SELECT id, role
         FROM public.users
         WHERE id = $1`,
        [req.user.userId]
      );

      const user = result.rows[0];

      if (!user || user.role !== role) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions."
        });
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      console.error("Role check failed:", error.message);

      res.status(500).json({
        success: false,
        message: "Permission verification failed"
      });
    }
  };
}

const requireAuthority = [
  authenticateToken,
  requireRole("authority")
];

const requireUser = [
  authenticateToken,
  requireRole("user")
];

// ==========================================
// USER REGISTRATION
// ==========================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, mobile, password } = req.body;

    if (!name?.trim() || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO public.users
       (name, mobile, password, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id`,
      [name.trim(), mobile, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "User registration successful!",
      userId: result.rows[0].id
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Mobile number already registered"
      });
    }

    console.error("Registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "User registration failed"
    });
  }
});

// ==========================================
// AUTHORITY REGISTRATION
// ==========================================

app.post("/api/auth/register-authority", async (req, res) => {
  try {
    const { name, mobile, password, authorityCode } = req.body;

    if (!name?.trim() || !mobile || !password || !authorityCode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (authorityCode !== AUTHORITY_CODE) {
      return res.status(403).json({
        success: false,
        message: "Invalid authority registration code"
      });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO public.users
       (name, mobile, password, role)
       VALUES ($1, $2, $3, 'authority')
       RETURNING id`,
      [name.trim(), mobile, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "Authority registration successful!",
      userId: result.rows[0].id
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Mobile number already registered"
      });
    }

    console.error("Authority registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Authority registration failed"
    });
  }
});

// ==========================================
// LOGIN - USER AND AUTHORITY
// ==========================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Mobile and password are required"
      });
    }

    const result = await db.query(
      `SELECT id, name, mobile, password, role
       FROM public.users
       WHERE mobile = $1`,
      [mobile]
    );

    const user = result.rows[0];

    if (!user) {
      await logLogin(req, mobile, false);

      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      await logLogin(req, mobile, false, user.id);

      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password"
      });
    }

    await logLogin(req, mobile, true, user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

// ==========================================
// CURRENT USER PROFILE
// ==========================================

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, mobile, role, created_at AS "createdAt"
       FROM public.users
       WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch profile"
    });
  }
});

// ==========================================
// USER - SUBMIT REPORT
// ==========================================

app.post("/api/reports", ...requireUser, async (req, res) => {
  try {
    const {
      violationType,
      description,
      location,
      coordinates,
      fileName
    } = req.body;

    if (!violationType || !description?.trim() || !location?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Violation type, description and location are required"
      });
    }

    const reportId = "RPT-" + crypto.randomUUID();

    await db.query(
      `INSERT INTO public.reports
       (report_id, user_id, violation_type, description,
        location, coordinates, file_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        reportId,
        req.user.userId,
        violationType,
        description.trim(),
        location.trim(),
        coordinates || "",
        fileName || "No attachment"
      ]
    );

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      reportId
    });
  } catch (error) {
    console.error("Report submission error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not submit report"
    });
  }
});

// ==========================================
// USER - OWN REPORT HISTORY
// ==========================================

app.get("/api/reports/my", ...requireUser, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         report_id AS "reportId",
         violation_type AS "violationType",
         description,
         location,
         coordinates,
         file_name AS "fileName",
         status,
         submitted_at AS "submittedAt"
       FROM public.reports
       WHERE user_id = $1
       ORDER BY id DESC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      reports: result.rows
    });
  } catch (error) {
    console.error("Report history error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch reports"
    });
  }
});

// ==========================================
// AUTHORITY - ALL REPORTS
// ==========================================

app.get("/api/reports", ...requireAuthority, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         reports.report_id AS "reportId",
         reports.violation_type AS "violationType",
         reports.description,
         reports.location,
         reports.coordinates,
         reports.file_name AS "fileName",
         reports.status,
         reports.submitted_at AS "submittedAt",
         users.name AS "userName",
         users.mobile AS "userMobile"
       FROM public.reports
       JOIN public.users ON reports.user_id = users.id
       ORDER BY reports.id DESC`
    );

    res.json({
      success: true,
      reports: result.rows
    });
  } catch (error) {
    console.error("Authority reports error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch reports"
    });
  }
});

// ==========================================
// AUTHORITY - UPDATE REPORT STATUS
// ==========================================

app.patch(
  "/api/reports/:reportId/status",
  ...requireAuthority,
  async (req, res) => {
    const client = await db.connect();

    try {
      const { status } = req.body;

      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid report status"
        });
      }

      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE public.reports
         SET status = $1
         WHERE report_id = $2
         RETURNING report_id`,
        [status, req.params.reportId]
      );

      if (result.rowCount === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Report not found"
        });
      }

      await client.query(
        `INSERT INTO public.audit_logs
         (actor_user_id, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          req.user.userId,
          `REPORT_${status.toUpperCase()}`,
          "report",
          req.params.reportId,
          JSON.stringify({ status })
        ]
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "Report status updated successfully"
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Status update error:", error.message);

      res.status(500).json({
        success: false,
        message: "Could not update report status"
      });
    } finally {
      client.release();
    }
  }
);

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
  try {
    await db.query("SELECT 1");

    console.log("Supabase PostgreSQL connected.");
    console.log(
  "REGISTERED ROUTES:",
  app.router.stack
    .filter(layer => layer.route)
    .map(layer => layer.route.path)
);

    app.listen(PORT, () => {
      console.log(`ParkSafe Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to Supabase:", error.message);
    process.exit(1);
  }
}

startServer();
