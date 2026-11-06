
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const AUTHORITY_CODE = process.env.AUTHORITY_REGISTRATION_CODE;

// ==========================================
// CONFIGURATION CHECK
// ==========================================

if (!JWT_SECRET || !AUTHORITY_CODE) {
  console.error("Missing JWT_SECRET or AUTHORITY_REGISTRATION_CODE.");
  process.exit(1);
}

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
  res.send("ParkSafe Backend is Running!");
});

// ==========================================
// VEHICLE SEARCH
// ==========================================

app.get("/api/vehicles/:number", (req, res) => {
  const number = req.params.number.trim().toUpperCase();

  const vehicle = db.prepare(`
    SELECT * FROM vehicles
    WHERE vehicle_number = ?
  `).get(number);

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: "Vehicle not found"
    });
  }

  res.json({
    success: true,
    vehicle
  });
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
// ROLE AUTHORIZATION MIDDLEWARE
// ==========================================

function requireRole(role) {
  return (req, res, next) => {
    const user = db.prepare(`
      SELECT id, role FROM users WHERE id = ?
    `).get(req.user.userId);

    if (!user || user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions."
      });
    }

    req.user.role = user.role;
    next();
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

    const existing = db.prepare(`
      SELECT id FROM users WHERE mobile = ?
    `).get(mobile);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db.prepare(`
      INSERT INTO users (name, mobile, password, role)
      VALUES (?, ?, ?, 'user')
    `).run(name.trim(), mobile, hashedPassword);

    res.status(201).json({
      success: true,
      message: "User registration successful!",
      userId: result.lastInsertRowid
    });

  } catch (error) {
    console.error(error);

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
    const {
      name,
      mobile,
      password,
      authorityCode
    } = req.body;

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

    const existing = db.prepare(`
      SELECT id FROM users WHERE mobile = ?
    `).get(mobile);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = db.prepare(`
      INSERT INTO users (name, mobile, password, role)
      VALUES (?, ?, ?, 'authority')
    `).run(name.trim(), mobile, hashedPassword);

    res.status(201).json({
      success: true,
      message: "Authority registration successful!",
      userId: result.lastInsertRowid
    });

  } catch (error) {
    console.error(error);

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

    const user = db.prepare(`
      SELECT * FROM users WHERE mobile = ?
    `).get(mobile);

    if (!user) {
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
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password"
      });
    }

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
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

// ==========================================
// CURRENT USER PROFILE
// ==========================================

app.get("/api/auth/me", authenticateToken, (req, res) => {
  const user = db.prepare(`
    SELECT id, name, mobile, role, created_at
    FROM users
    WHERE id = ?
  `).get(req.user.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.json({
    success: true,
    user
  });
});

// ==========================================
// USER - SUBMIT REPORT
// ==========================================

app.post("/api/reports", ...requireUser, (req, res) => {
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

    db.prepare(`
      INSERT INTO reports (
        report_id,
        user_id,
        violation_type,
        description,
        location,
        coordinates,
        file_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      reportId,
      req.user.userId,
      violationType,
      description.trim(),
      location.trim(),
      coordinates || "",
      fileName || "No attachment"
    );

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      reportId
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not submit report"
    });
  }
});

// ==========================================
// USER - OWN REPORT HISTORY
// ==========================================

app.get("/api/reports/my", ...requireUser, (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT
        report_id AS reportId,
        violation_type AS violationType,
        description,
        location,
        coordinates,
        file_name AS fileName,
        status,
        submitted_at AS submittedAt
      FROM reports
      WHERE user_id = ?
      ORDER BY id DESC
    `).all(req.user.userId);

    res.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch reports"
    });
  }
});

// ==========================================
// AUTHORITY - ALL REPORTS
// ==========================================

app.get("/api/reports", ...requireAuthority, (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT
        reports.report_id AS reportId,
        reports.violation_type AS violationType,
        reports.description,
        reports.location,
        reports.coordinates,
        reports.file_name AS fileName,
        reports.status,
        reports.submitted_at AS submittedAt,
        users.name AS userName,
        users.mobile AS userMobile
      FROM reports
      JOIN users ON reports.user_id = users.id
      ORDER BY reports.id DESC
    `).all();

    res.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error(error);

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
  (req, res) => {
    try {
      const { status } = req.body;

      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid report status"
        });
      }

      const result = db.prepare(`
        UPDATE reports
        SET status = ?
        WHERE report_id = ?
      `).run(status, req.params.reportId);

      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found"
        });
      }

      res.json({
        success: true,
        message: "Report status updated successfully"
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Could not update report status"
      });
    }
  }
);

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`ParkSafe Backend running on port ${PORT}`);
});
