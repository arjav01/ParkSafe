require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const multer = require("multer");
const { Pool } = require("pg");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const AUTHORITY_CODE =
  process.env.AUTHORITY_REGISTRATION_CODE;

const SUPABASE_URL =
  process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const EVIDENCE_BUCKET = "report-evidence";

if (
  !JWT_SECRET ||
  !AUTHORITY_CODE ||
  !process.env.DATABASE_URL ||
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY
) {
  console.error(
    "Missing required environment variables."
  );

  process.exit(1);
}

/* =====================================================
   DATABASE
===================================================== */

const db = new Pool({
  connectionString:
    process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false
  },

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

db.on("error", (error) => {
  console.error(
    "Unexpected database error:",
    error.message
  );
});

/* =====================================================
   SUPABASE STORAGE
===================================================== */

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(cors());

app.use(
  express.json({
    limit: "2mb"
  })
);

/* =====================================================
   EVIDENCE UPLOAD
===================================================== */

const IMAGE_LIMIT =
  5 * 1024 * 1024;

const VIDEO_LIMIT =
  10 * 1024 * 1024;

const evidenceUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: VIDEO_LIMIT
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {
    const isImage =
      file.mimetype?.startsWith(
        "image/"
      );

    const isVideo =
      file.mimetype?.startsWith(
        "video/"
      );

    if (
      !isImage &&
      !isVideo
    ) {
      return callback(
        new Error(
          "Only image and video evidence is allowed."
        )
      );
    }

    callback(null, true);
  }
});

/* =====================================================
   HELPERS
===================================================== */

async function logLogin(
  req,
  mobile,
  success,
  userId = null
) {
  try {
    await db.query(
      `
        INSERT INTO public.login_activity
        (
          user_id,
          mobile,
          login_success,
          ip_address,
          user_agent
        )
        VALUES ($1,$2,$3,$4,$5)
      `,
      [
        userId,
        mobile,
        success,
        req.ip || null,
        req.get("user-agent") ||
          null
      ]
    );
  } catch (error) {
    console.error(
      "Login activity logging failed:",
      error.message
    );
  }
}

function safeFileName(fileName) {
  return String(
    fileName || "evidence"
  )
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    )
    .slice(0, 120);
}

async function createEvidenceSignedUrl(
  evidencePath
) {
  if (!evidencePath) {
    return null;
  }

  try {
    const {
      data,
      error
    } =
      await supabase.storage
        .from(EVIDENCE_BUCKET)
        .createSignedUrl(
          evidencePath,
          60 * 60
        );

    if (error) {
      console.error(
        "Signed URL error:",
        error.message
      );

      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.error(
      "Signed URL exception:",
      error.message
    );

    return null;
  }
}

async function addEvidenceUrls(
  rows
) {
  return Promise.all(
    rows.map(
      async (row) => ({
        ...row,

        evidenceUrl:
          await createEvidenceSignedUrl(
            row.evidencePath
          )
      })
    )
  );
}

/* =====================================================
   HOME
===================================================== */

app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      "ParkSafe Backend is Running!"
    );
});

/* =====================================================
   HEALTH
===================================================== */

app.get(
  "/api/health",
  async (req, res) => {
    try {
      await db.query("SELECT 1");

      res.status(200).json({
        success: true,
        message:
          "ParkSafe API, Supabase PostgreSQL and Storage are connected"
      });
    } catch (error) {
      console.error(
        "Health check error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Database connection failed"
      });
    }
  }
);

/* =====================================================
   AUTHENTICATION MIDDLEWARE
===================================================== */

function authenticateToken(
  req,
  res,
  next
) {
  const authHeader =
    req.headers.authorization;

  const token =
    authHeader?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Login required"
      });
  }

  jwt.verify(
    token,
    JWT_SECRET,
    (error, decoded) => {
      if (error) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Invalid or expired token"
          });
      }

      req.user = decoded;
      next();
    }
  );
}

function requireRole(role) {
  return async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await db.query(
          `
            SELECT id, role
            FROM public.users
            WHERE id = $1
          `,
          [
            req.user.userId
          ]
        );

      const user =
        result.rows[0];

      if (
        !user ||
        user.role !== role
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Access denied. Insufficient permissions."
          });
      }

      req.user.role =
        user.role;

      next();
    } catch (error) {
      console.error(
        "Role check failed:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Permission verification failed"
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

/* =====================================================
   REGISTER USER
===================================================== */

app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const {
        name,
        mobile,
        password
      } = req.body;

      if (
        !name?.trim() ||
        !mobile ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "All fields are required"
          });
      }

      if (
        !/^\d{10}$/.test(
          mobile
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Enter a valid 10-digit mobile number"
          });
      }

      if (
        password.length < 6
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Password must contain at least 6 characters"
          });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const result =
        await db.query(
          `
            INSERT INTO public.users
            (
              name,
              mobile,
              password,
              role
            )
            VALUES
            ($1,$2,$3,'user')
            RETURNING id
          `,
          [
            name.trim(),
            mobile,
            hashedPassword
          ]
        );

      res.status(201).json({
        success: true,
        message:
          "User registration successful!",
        userId:
          result.rows[0].id
      });
    } catch (error) {
      if (
        error.code === "23505"
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Mobile number already registered"
          });
      }

      console.error(
        "Registration error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "User registration failed"
      });
    }
  }
);

/* =====================================================
   REGISTER AUTHORITY
===================================================== */

app.post(
  "/api/auth/register-authority",
  async (req, res) => {
    try {
      const {
        name,
        mobile,
        password,
        authorityCode
      } = req.body;

      if (
        !name?.trim() ||
        !mobile ||
        !password ||
        !authorityCode
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "All fields are required"
          });
      }

      if (
        authorityCode !==
        AUTHORITY_CODE
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              "Invalid authority registration code"
          });
      }

      if (
        !/^\d{10}$/.test(
          mobile
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Enter a valid 10-digit mobile number"
          });
      }

      if (
        password.length < 6
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Password must contain at least 6 characters"
          });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const result =
        await db.query(
          `
            INSERT INTO public.users
            (
              name,
              mobile,
              password,
              role
            )
            VALUES
            ($1,$2,$3,'authority')
            RETURNING id
          `,
          [
            name.trim(),
            mobile,
            hashedPassword
          ]
        );

      res.status(201).json({
        success: true,
        message:
          "Authority registration successful!",
        userId:
          result.rows[0].id
      });
    } catch (error) {
      if (
        error.code === "23505"
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Mobile number already registered"
          });
      }

      console.error(
        "Authority registration error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Authority registration failed"
      });
    }
  }
);

/* =====================================================
   RESET PASSWORD
===================================================== */

app.post(
  "/api/auth/reset-password",
  async (req, res) => {
    try {
      const {
        mobile,
        newPassword
      } = req.body;

      if (
        !mobile ||
        !newPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Mobile number and new password are required"
          });
      }

      if (
        !/^\d{10}$/.test(
          mobile
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Enter a valid 10-digit mobile number"
          });
      }

      if (
        newPassword.length < 6
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Password must contain at least 6 characters"
          });
      }

      const userResult =
        await db.query(
          `
            SELECT id, mobile
            FROM public.users
            WHERE mobile = $1
          `,
          [mobile]
        );

      if (
        userResult.rows.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "No account found with this mobile number"
          });
      }

      const user =
        userResult.rows[0];

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      await db.query(
        `
          UPDATE public.users
          SET password = $1
          WHERE id = $2
        `,
        [
          hashedPassword,
          user.id
        ]
      );

      try {
        await db.query(
          `
            INSERT INTO public.audit_logs
            (
              actor_user_id,
              action,
              entity_type,
              entity_id,
              details
            )
            VALUES
            ($1,$2,$3,$4,$5)
          `,
          [
            user.id,
            "PASSWORD_RESET_DEMO",
            "user",
            String(user.id),
            JSON.stringify({
              mobile:
                user.mobile
            })
          ]
        );
      } catch (auditError) {
        console.error(
          "Password audit failed:",
          auditError.message
        );
      }

      res.json({
        success: true,
        message:
          "Password changed successfully. Please login."
      });
    } catch (error) {
      console.error(
        "Password reset error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not reset password"
      });
    }
  }
);

/* =====================================================
   LOGIN
===================================================== */

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const {
        mobile,
        password
      } = req.body;

      if (
        !mobile ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Mobile and password are required"
          });
      }

      const result =
        await db.query(
          `
            SELECT
              id,
              name,
              mobile,
              password,
              role,
              profile_photo
                AS "profilePhoto"
            FROM public.users
            WHERE mobile = $1
          `,
          [mobile]
        );

      const user =
        result.rows[0];

      if (!user) {
        await logLogin(
          req,
          mobile,
          false
        );

        return res
          .status(401)
          .json({
            success: false,
            message:
              "Invalid mobile number or password"
          });
      }

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!validPassword) {
        await logLogin(
          req,
          mobile,
          false,
          user.id
        );

        return res
          .status(401)
          .json({
            success: false,
            message:
              "Invalid mobile number or password"
          });
      }

      await logLogin(
        req,
        mobile,
        true,
        user.id
      );

      const token =
        jwt.sign(
          {
            userId: user.id,
            role: user.role
          },
          JWT_SECRET,
          {
            expiresIn: "7d"
          }
        );

      res.json({
        success: true,
        message:
          "Login successful!",
        token,

        user: {
          id: user.id,
          name: user.name,
          mobile: user.mobile,
          role: user.role,
          profilePhoto:
            user.profilePhoto ||
            null
        }
      });
    } catch (error) {
      console.error(
        "Login error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message: "Login failed"
      });
    }
  }
);

/* =====================================================
   CURRENT PROFILE
===================================================== */

app.get(
  "/api/auth/me",
  authenticateToken,
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
            SELECT
              id,
              name,
              mobile,
              role,
              profile_photo
                AS "profilePhoto",
              created_at
                AS "createdAt"
            FROM public.users
            WHERE id = $1
          `,
          [
            req.user.userId
          ]
        );

      if (
        result.rows.length === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User not found"
          });
      }

      res.json({
        success: true,
        user:
          result.rows[0]
      });
    } catch (error) {
      console.error(
        "Profile error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not fetch profile"
      });
    }
  }
);

/* =====================================================
   UPDATE PROFILE
===================================================== */

app.patch(
  "/api/auth/profile",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        name,
        profilePhoto
      } = req.body;

      if (
        !name?.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Full name is required"
          });
      }

      if (
        name.trim().length < 2
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Name must contain at least 2 characters"
          });
      }

      if (
        profilePhoto &&
        profilePhoto.length >
          1500000
      ) {
        return res
          .status(413)
          .json({
            success: false,
            message:
              "Profile photo is too large"
          });
      }

      if (
        profilePhoto &&
        !profilePhoto.startsWith(
          "data:image/"
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid profile photo"
          });
      }

      const result =
        await db.query(
          `
            UPDATE public.users
            SET
              name = $1,
              profile_photo = $2,
              updated_at = NOW()
            WHERE id = $3
            RETURNING
              id,
              name,
              mobile,
              role,
              profile_photo
                AS "profilePhoto",
              created_at
                AS "createdAt"
          `,
          [
            name.trim(),
            profilePhoto || null,
            req.user.userId
          ]
        );

      res.json({
        success: true,
        message:
          "Profile updated successfully",
        user:
          result.rows[0]
      });
    } catch (error) {
      console.error(
        "Profile update error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not update profile"
      });
    }
  }
);

/* =====================================================
   MY VEHICLES
===================================================== */

app.get(
  "/api/vehicles/my",
  ...requireUser,
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
            SELECT
              id,
              vehicle_number
                AS "vehicleNumber",
              vehicle_type
                AS "vehicleType",
              vehicle_model
                AS "vehicleModel",
              owner_reference
                AS "ownerReference",
              status,
              created_at
                AS "createdAt",
              updated_at
                AS "updatedAt"
            FROM public.vehicles
            WHERE user_id = $1
            ORDER BY id DESC
          `,
          [
            req.user.userId
          ]
        );

      res.json({
        success: true,
        vehicles:
          result.rows
      });
    } catch (error) {
      console.error(
        "My vehicles error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not fetch vehicles"
      });
    }
  }
);

/* =====================================================
   ADD VEHICLE
===================================================== */

app.post(
  "/api/vehicles",
  ...requireUser,
  async (req, res) => {
    try {
      const {
        vehicleNumber,
        vehicleType,
        vehicleModel
      } = req.body;

      const cleanNumber =
        vehicleNumber
          ?.trim()
          .toUpperCase();

      if (
        !cleanNumber ||
        !vehicleType ||
        !vehicleModel?.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Vehicle number, type and model are required"
          });
      }

      const ownerReference =
        `OWN-${req.user.userId}`;

      const result =
        await db.query(
          `
            INSERT INTO public.vehicles
            (
              user_id,
              vehicle_number,
              vehicle_type,
              vehicle_model,
              owner_reference,
              status,
              created_at,
              updated_at
            )
            VALUES
            (
              $1,$2,$3,$4,$5,
              'Active',
              NOW(),
              NOW()
            )
            RETURNING
              id,
              vehicle_number
                AS "vehicleNumber",
              vehicle_type
                AS "vehicleType",
              vehicle_model
                AS "vehicleModel",
              owner_reference
                AS "ownerReference",
              status,
              created_at
                AS "createdAt"
          `,
          [
            req.user.userId,
            cleanNumber,
            vehicleType,
            vehicleModel.trim(),
            ownerReference
          ]
        );

      res.status(201).json({
        success: true,
        message:
          "Vehicle registered successfully",
        vehicle:
          result.rows[0]
      });
    } catch (error) {
      if (
        error.code === "23505"
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "This vehicle is already registered"
          });
      }

      console.error(
        "Vehicle registration error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not register vehicle"
      });
    }
  }
);

/* =====================================================
   UPDATE VEHICLE
===================================================== */

app.put(
  "/api/vehicles/:id",
  ...requireUser,
  async (req, res) => {
    try {
      const {
        vehicleNumber,
        vehicleType,
        vehicleModel
      } = req.body;

      const cleanNumber =
        vehicleNumber
          ?.trim()
          .toUpperCase();

      if (
        !cleanNumber ||
        !vehicleType ||
        !vehicleModel?.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Vehicle number, type and model are required"
          });
      }

      const result =
        await db.query(
          `
            UPDATE public.vehicles
            SET
              vehicle_number = $1,
              vehicle_type = $2,
              vehicle_model = $3,
              updated_at = NOW()
            WHERE
              id = $4
              AND user_id = $5
            RETURNING
              id,
              vehicle_number
                AS "vehicleNumber",
              vehicle_type
                AS "vehicleType",
              vehicle_model
                AS "vehicleModel",
              owner_reference
                AS "ownerReference",
              status
          `,
          [
            cleanNumber,
            vehicleType,
            vehicleModel.trim(),
            req.params.id,
            req.user.userId
          ]
        );

      if (
        result.rowCount === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Vehicle not found"
          });
      }

      res.json({
        success: true,
        message:
          "Vehicle updated successfully",
        vehicle:
          result.rows[0]
      });
    } catch (error) {
      if (
        error.code === "23505"
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Vehicle number already registered"
          });
      }

      console.error(
        "Vehicle update error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not update vehicle"
      });
    }
  }
);

/* =====================================================
   DELETE VEHICLE
===================================================== */

app.delete(
  "/api/vehicles/:id",
  ...requireUser,
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
            DELETE FROM public.vehicles
            WHERE
              id = $1
              AND user_id = $2
            RETURNING id
          `,
          [
            req.params.id,
            req.user.userId
          ]
        );

      if (
        result.rowCount === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Vehicle not found"
          });
      }

      res.json({
        success: true,
        message:
          "Vehicle removed successfully"
      });
    } catch (error) {
      console.error(
        "Vehicle delete error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not remove vehicle"
      });
    }
  }
);

/* =====================================================
   QR VEHICLE LOOKUP
===================================================== */

app.get(
  "/api/vehicles/qr/:id",
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
            SELECT
              id,
              vehicle_number
                AS "vehicleNumber",
              vehicle_type
                AS "vehicleType",
              vehicle_model
                AS "vehicleModel",
              owner_reference
                AS "ownerReference",
              status
            FROM public.vehicles
            WHERE id = $1
          `,
          [
            req.params.id
          ]
        );

      if (
        result.rows.length === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Vehicle not found"
          });
      }

      res.json({
        success: true,
        vehicle:
          result.rows[0]
      });
    } catch (error) {
      console.error(
        "QR lookup error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not load vehicle"
      });
    }
  }
);

/* =====================================================
   VEHICLE SEARCH
===================================================== */

app.get(
  "/api/vehicles/:number",
  async (req, res) => {
    try {
      const number =
        req.params.number
          .trim()
          .toUpperCase();

      const result =
        await db.query(
          `
            SELECT
              id,
              vehicle_number
                AS "vehicleNumber",
              vehicle_type
                AS "vehicleType",
              vehicle_model
                AS "vehicleModel",
              owner_reference
                AS "ownerReference",
              status
            FROM public.vehicles
            WHERE vehicle_number = $1
          `,
          [number]
        );

      if (
        result.rows.length === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Vehicle not found"
          });
      }

      res.json({
        success: true,
        vehicle:
          result.rows[0]
      });
    } catch (error) {
      console.error(
        "Vehicle search error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Vehicle search failed"
      });
    }
  }
);

/* =====================================================
   CREATE ALERT
===================================================== */

app.post(
  "/api/alerts",
  ...requireUser,
  async (req, res) => {
    try {
      const {
        vehicleId
      } = req.body;

      if (!vehicleId) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Vehicle ID is required"
          });
      }

      const vehicleResult =
        await db.query(
          `
            SELECT id
            FROM public.vehicles
            WHERE id = $1
          `,
          [vehicleId]
        );

      if (
        vehicleResult.rows.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Vehicle not found"
          });
      }

      const alertId =
        "ALT-" +
        crypto.randomUUID();

      const result =
        await db.query(
          `
            INSERT INTO public.parking_alerts
            (
              alert_id,
              sender_user_id,
              vehicle_id,
              status,
              created_at
            )
            VALUES
            ($1,$2,$3,'Sent',NOW())
            RETURNING
              alert_id AS "alertId",
              status,
              created_at AS "createdAt"
          `,
          [
            alertId,
            req.user.userId,
            vehicleId
          ]
        );

      res.status(201).json({
        success: true,
        message:
          "Parking alert created successfully",
        alert:
          result.rows[0]
      });
    } catch (error) {
      console.error(
        "Alert creation error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not create parking alert"
      });
    }
  }
);

/* =====================================================
   MY ALERTS
===================================================== */

app.get(
  "/api/alerts/my",
  ...requireUser,
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
            SELECT
              a.alert_id
                AS "alertId",
              a.status,
              a.owner_response
                AS "ownerResponse",
              a.call_unlocked
                AS "callUnlocked",
              a.call_attempted
                AS "callAttempted",
              a.created_at
                AS "createdAt",

              v.id
                AS "vehicleId",
              v.vehicle_number
                AS "vehicleNumber",
              v.vehicle_type
                AS "vehicleType",
              v.vehicle_model
                AS "vehicleModel",
              v.owner_reference
                AS "ownerReference"

            FROM public.parking_alerts a

            JOIN public.vehicles v
              ON a.vehicle_id =
                 v.id

            WHERE
              a.sender_user_id = $1

            ORDER BY
              a.id DESC
          `,
          [
            req.user.userId
          ]
        );

      res.json({
        success: true,
        alerts:
          result.rows
      });
    } catch (error) {
      console.error(
        "Alert history error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not fetch parking alerts"
      });
    }
  }
);

/* =====================================================
   ALERT RESPONSE
===================================================== */

app.patch(
  "/api/alerts/:alertId/respond",
  ...requireUser,
  async (req, res) => {
    try {
      const {
        response
      } = req.body;

      if (
        !response?.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Owner response is required"
          });
      }

      const result =
        await db.query(
          `
            UPDATE public.parking_alerts
            SET
              owner_response = $1,
              status = 'Responded',
              responded_at = NOW()
            WHERE
              alert_id = $2
              AND sender_user_id = $3
            RETURNING
              alert_id
                AS "alertId",
              status,
              owner_response
                AS "ownerResponse"
          `,
          [
            response.trim(),
            req.params.alertId,
            req.user.userId
          ]
        );

      if (
        result.rowCount === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Parking alert not found"
          });
      }

      res.json({
        success: true,
        message:
          "Owner response saved",
        alert:
          result.rows[0]
      });
    } catch (error) {
      console.error(
        "Alert response error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not save response"
      });
    }
  }
);

/* =====================================================
   ALERT CALL
===================================================== */

app.patch(
  "/api/alerts/:alertId/call",
  ...requireUser,
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
            UPDATE public.parking_alerts
            SET
              call_unlocked = TRUE,
              call_attempted = TRUE,
              status = 'Call Attempted',
              called_at = NOW()
            WHERE
              alert_id = $1
              AND sender_user_id = $2
              AND owner_response IS NULL
            RETURNING
              alert_id
                AS "alertId",
              status
          `,
          [
            req.params.alertId,
            req.user.userId
          ]
        );

      if (
        result.rowCount === 0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Alert not found or owner already responded"
          });
      }

      res.json({
        success: true,
        message:
          "Demo call recorded successfully",
        alert:
          result.rows[0]
      });
    } catch (error) {
      console.error(
        "Call error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not update call status"
      });
    }
  }
);

/* =====================================================
   SUBMIT REPORT + VEHICLE + EVIDENCE
===================================================== */

app.post(
  "/api/reports",
  ...requireUser,

  (req, res, next) => {
    evidenceUpload.single(
      "evidence"
    )(
      req,
      res,
      (error) => {
        if (
          error instanceof
          multer.MulterError
        ) {
          if (
            error.code ===
            "LIMIT_FILE_SIZE"
          ) {
            return res
              .status(413)
              .json({
                success: false,
                message:
                  "Evidence is too large. Images: max 5 MB. Videos: max 10 MB."
              });
          }

          return res
            .status(400)
            .json({
              success: false,
              message:
                error.message
            });
        }

        if (error) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                error.message
            });
        }

        next();
      }
    );
  },

  async (req, res) => {
    let uploadedPath = null;

    try {
      const {
        vehicleId,
        vehicleNumber,
        violationType,
        description,
        location,
        coordinates
      } = req.body;

      const cleanVehicleNumber =
        vehicleNumber
          ?.trim()
          .toUpperCase();

      /* =========================================
         VEHICLE REQUIRED
      ========================================= */

      if (
        !vehicleId ||
        !cleanVehicleNumber
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Please identify a valid vehicle before submitting the report."
          });
      }

      if (
        !violationType ||
        !description?.trim() ||
        !location?.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Violation type, description and location are required"
          });
      }

      /* =========================================
         VERIFY VEHICLE FROM DATABASE
      ========================================= */

      const vehicleResult =
        await db.query(
          `
            SELECT
              id,
              vehicle_number
                AS "vehicleNumber",
              vehicle_type
                AS "vehicleType",
              vehicle_model
                AS "vehicleModel",
              owner_reference
                AS "ownerReference",
              status
            FROM public.vehicles
            WHERE
              id = $1
              AND UPPER(vehicle_number) = $2
            LIMIT 1
          `,
          [
            vehicleId,
            cleanVehicleNumber
          ]
        );

      if (
        vehicleResult.rows.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "The selected vehicle could not be verified."
          });
      }

      const verifiedVehicle =
        vehicleResult.rows[0];

      /* =========================================
         EVIDENCE VALIDATION
      ========================================= */

      if (req.file) {
        const isImage =
          req.file.mimetype
            .startsWith(
              "image/"
            );

        const isVideo =
          req.file.mimetype
            .startsWith(
              "video/"
            );

        if (
          isImage &&
          req.file.size >
            IMAGE_LIMIT
        ) {
          return res
            .status(413)
            .json({
              success: false,
              message:
                "Photo evidence must be 5 MB or smaller."
            });
        }

        if (
          isVideo &&
          req.file.size >
            VIDEO_LIMIT
        ) {
          return res
            .status(413)
            .json({
              success: false,
              message:
                "Video evidence must be 10 MB or smaller."
            });
        }
      }

      const reportId =
        "RPT-" +
        crypto.randomUUID();

      let evidencePath = null;
      let evidenceType = null;
      let evidenceSize = null;

      let fileName =
        "No attachment";

      /* =========================================
         SUPABASE EVIDENCE UPLOAD
      ========================================= */

      if (req.file) {
        const cleanedName =
          safeFileName(
            req.file.originalname
          );

        const fileExtension =
          cleanedName.includes(".")
            ? cleanedName
                .split(".")
                .pop()
                .toLowerCase()
            : req.file.mimetype
                .startsWith(
                  "video/"
                )
            ? "mp4"
            : "jpg";

        const storageFileName =
          `${Date.now()}-${crypto
            .randomBytes(8)
            .toString(
              "hex"
            )}.${fileExtension}`;

        evidencePath =
          `user-${req.user.userId}/${storageFileName}`;

        const {
          error: uploadError
        } =
          await supabase.storage
            .from(
              EVIDENCE_BUCKET
            )
            .upload(
              evidencePath,
              req.file.buffer,
              {
                contentType:
                  req.file.mimetype,

                upsert: false,

                cacheControl:
                  "3600"
              }
            );

        if (uploadError) {
          console.error(
            "Evidence upload error:",
            uploadError.message
          );

          return res
            .status(500)
            .json({
              success: false,
              message:
                "Could not upload evidence."
            });
        }

        uploadedPath =
          evidencePath;

        evidenceType =
          req.file.mimetype;

        evidenceSize =
          req.file.size;

        fileName =
          req.file.originalname;
      }

      /* =========================================
         SAVE REPORT + VEHICLE
      ========================================= */

      await db.query(
        `
          INSERT INTO public.reports
          (
            report_id,
            user_id,

            vehicle_id,
            vehicle_number,

            violation_type,
            description,
            location,
            coordinates,

            file_name,
            evidence_path,
            evidence_type,
            evidence_size
          )

          VALUES
          (
            $1,$2,$3,$4,
            $5,$6,$7,$8,
            $9,$10,$11,$12
          )
        `,
        [
          reportId,
          req.user.userId,

          verifiedVehicle.id,
          verifiedVehicle
            .vehicleNumber,

          violationType,
          description.trim(),
          location.trim(),
          coordinates || "",

          fileName,
          evidencePath,
          evidenceType,
          evidenceSize
        ]
      );

      res.status(201).json({
        success: true,

        message:
          req.file
            ? "Report and evidence submitted successfully"
            : "Report submitted successfully",

        reportId,

        vehicle: {
          id:
            verifiedVehicle.id,

          vehicleNumber:
            verifiedVehicle
              .vehicleNumber,

          vehicleType:
            verifiedVehicle
              .vehicleType,

          vehicleModel:
            verifiedVehicle
              .vehicleModel
        }
      });
    } catch (error) {
      /*
        Storage upload succeeded
        but DB insert failed:
        remove orphan file.
      */

      if (uploadedPath) {
        try {
          await supabase.storage
            .from(
              EVIDENCE_BUCKET
            )
            .remove([
              uploadedPath
            ]);
        } catch (
          cleanupError
        ) {
          console.error(
            "Evidence cleanup error:",
            cleanupError.message
          );
        }
      }

      console.error(
        "Report submission error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not submit report"
      });
    }
  }
);

/* =====================================================
   USER REPORT HISTORY + VEHICLE
===================================================== */

app.get(
  "/api/reports/my",
  ...requireUser,
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
            SELECT
              r.report_id
                AS "reportId",

              r.vehicle_id
                AS "vehicleId",

              r.vehicle_number
                AS "vehicleNumber",

              v.vehicle_type
                AS "vehicleType",

              v.vehicle_model
                AS "vehicleModel",

              r.violation_type
                AS "violationType",

              r.description,
              r.location,
              r.coordinates,

              r.file_name
                AS "fileName",

              r.evidence_path
                AS "evidencePath",

              r.evidence_type
                AS "evidenceType",

              r.evidence_size
                AS "evidenceSize",

              r.status,

r.authority_remark
  AS "authorityRemark",

r.reviewed_at
  AS "reviewedAt",

r.submitted_at
  AS "submittedAt"

            FROM public.reports r

            LEFT JOIN public.vehicles v
              ON r.vehicle_id =
                 v.id

            WHERE
              r.user_id = $1

            ORDER BY
              r.id DESC
          `,
          [
            req.user.userId
          ]
        );

      const reports =
        await addEvidenceUrls(
          result.rows
        );

      res.json({
        success: true,
        reports
      });
    } catch (error) {
      console.error(
        "Report history error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not fetch reports"
      });
    }
  }
);

/* =====================================================
   AUTHORITY ALL REPORTS + VEHICLE
===================================================== */

app.get(
  "/api/reports",
  ...requireAuthority,
  async (req, res) => {
    try {
      const result =
        await db.query(
          `
            SELECT
              reports.report_id
                AS "reportId",

              reports.vehicle_id
                AS "vehicleId",

              reports.vehicle_number
                AS "vehicleNumber",

              vehicles.vehicle_type
                AS "vehicleType",

              vehicles.vehicle_model
                AS "vehicleModel",

              vehicles.owner_reference
                AS "ownerReference",

              reports.violation_type
                AS "violationType",

              reports.description,
              reports.location,
              reports.coordinates,

              reports.file_name
                AS "fileName",

              reports.evidence_path
                AS "evidencePath",

              reports.evidence_type
                AS "evidenceType",

              reports.evidence_size
                AS "evidenceSize",

              reports.status,

              reports.submitted_at
                AS "submittedAt",

              users.name
                AS "userName",

              users.mobile
                AS "userMobile"

            FROM public.reports

            JOIN public.users
              ON reports.user_id =
                 users.id

            LEFT JOIN public.vehicles
              ON reports.vehicle_id =
                 vehicles.id

            ORDER BY
              reports.id DESC
          `
        );

      const reports =
        await addEvidenceUrls(
          result.rows
        );

      res.json({
        success: true,
        reports
      });
    } catch (error) {
      console.error(
        "Authority reports error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not fetch reports"
      });
    }
  }
);

/* =====================================================
   AUTHORITY UPDATE REPORT STATUS
===================================================== */

// ==========================================
// AUTHORITY UPDATE REPORT STATUS + REMARK
// ==========================================

app.patch(
  "/api/reports/:reportId/status",
  ...requireAuthority,
  async (req, res) => {
    let client;

    try {
      const {
        status,
        remark
      } = req.body;

      if (
        ![
          "Approved",
          "Rejected"
        ].includes(status)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid report status"
          });
      }

      const cleanRemark =
        typeof remark === "string"
          ? remark.trim()
          : "";

      if (
        cleanRemark.length >
        1000
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Authority remark cannot exceed 1000 characters"
          });
      }

      client =
        await db.connect();

      await client.query(
        "BEGIN"
      );

      const result =
        await client.query(
          `
            UPDATE public.reports

            SET
              status = $1,

              authority_remark = $2,

              reviewed_at = NOW()

            WHERE
              report_id = $3

            RETURNING
              report_id
                AS "reportId",

              status,

              authority_remark
                AS "authorityRemark",

              reviewed_at
                AS "reviewedAt"
          `,
          [
            status,
            cleanRemark || null,
            req.params.reportId
          ]
        );

      if (
        result.rowCount === 0
      ) {
        await client.query(
          "ROLLBACK"
        );

        return res
          .status(404)
          .json({
            success: false,
            message:
              "Report not found"
          });
      }

      const updatedReport =
        result.rows[0];

      await client.query(
        `
          INSERT INTO public.audit_logs
          (
            actor_user_id,
            action,
            entity_type,
            entity_id,
            details
          )

          VALUES
          ($1,$2,$3,$4,$5)
        `,
        [
          req.user.userId,

          `REPORT_${status.toUpperCase()}`,

          "report",

          req.params.reportId,

          JSON.stringify({
            status,
            remark:
              cleanRemark || null
          })
        ]
      );

      await client.query(
        "COMMIT"
      );

      res.json({
        success: true,

        message:
          `Report ${status.toLowerCase()} successfully`,

        report:
          updatedReport
      });
    } catch (error) {
      if (client) {
        await client
          .query("ROLLBACK")
          .catch(() => {});
      }

      console.error(
        "Status update error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Could not update report status"
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

/* =====================================================
   START SERVER
===================================================== */

async function startServer() {
  try {
    await db.query(
      "SELECT 1"
    );

    console.log(
      "Supabase PostgreSQL connected."
    );

    console.log(
      "Supabase Storage configured:",
      EVIDENCE_BUCKET
    );

    console.log(
      "REGISTERED ROUTES:",
      app.router.stack
        .filter(
          (layer) =>
            layer.route
        )
        .map(
          (layer) =>
            layer.route.path
        )
    );

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `ParkSafe Backend running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Could not connect to Supabase:",
      error.message
    );

    process.exit(1);
  }
}

startServer();