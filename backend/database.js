
const Database = require("better-sqlite3");

const db = new Database("parking.db");

// Enable foreign key support
db.pragma("foreign_keys = ON");

// ==========================================
// 1. VEHICLES TABLE
// ==========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_number TEXT UNIQUE NOT NULL,
    vehicle_type TEXT,
    vehicle_model TEXT,
    owner_reference TEXT,
    status TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_vehicle_number
  ON vehicles(vehicle_number);
`);

// ==========================================
// 2. USERS TABLE
// ==========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ==========================================
// 3. DATABASE MIGRATION
// ==========================================

// Existing users table mein role column check karo
const userColumns = db.prepare(
  "PRAGMA table_info(users)"
).all();

const hasRoleColumn = userColumns.some(
  (column) => column.name === "role"
);

if (!hasRoleColumn) {
  db.exec(`
    ALTER TABLE users
    ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
  `);
}

// ==========================================
// 4. REPORTS TABLE
// ==========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    violation_type TEXT NOT NULL,
    description TEXT,
    location TEXT,
    coordinates TEXT,
    file_name TEXT,
    status TEXT DEFAULT 'Pending Review',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_reports_user_id
  ON reports(user_id);

  CREATE INDEX IF NOT EXISTS idx_reports_status
  ON reports(status);
`);

// ==========================================
// 5. INSERT 500 DEMO VEHICLES
// ==========================================

const states = [
  "UK", "UP", "DL", "HR", "PB",
  "HP", "RJ", "CH", "MH", "GJ"
];

const types = [
  "Car",
  "Bike",
  "Scooter",
  "Commercial"
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO vehicles
  (
    vehicle_number,
    vehicle_type,
    vehicle_model,
    owner_reference,
    status
  )
  VALUES (?, ?, ?, ?, ?)
`);

const insertMany = db.transaction(() => {

  for (let i = 0; i < 500; i++) {

    const state = states[i % 10];

    const rto = String(
      (Math.floor(i / 10) % 99) + 1
    ).padStart(2, "0");

    const letter1 = String.fromCharCode(
      65 + Math.floor(i / 100)
    );

    const letter2 = String.fromCharCode(
      65 + (i % 26)
    );

    const vehicleNumber =
      `${state}${rto}${letter1}${letter2}${1000 + i}`;

    const type = types[i % 4];

    insert.run(
      vehicleNumber,
      type,
      `Sample ${type}`,
      `OWN${String(i + 1).padStart(4, "0")}`,
      "Demo Verified"
    );
  }

});

insertMany();

// ==========================================
// 6. DATABASE INFORMATION
// ==========================================

const vehicleCount = db.prepare(
  "SELECT COUNT(*) AS total FROM vehicles"
).get();

const userCount = db.prepare(
  "SELECT COUNT(*) AS total FROM users"
).get();

const reportCount = db.prepare(
  "SELECT COUNT(*) AS total FROM reports"
).get();

console.log("--------------------------------");
console.log("ParkSafe Database Initialized");
console.log("--------------------------------");
console.log("Total Vehicles:", vehicleCount.total);
console.log("Total Users:", userCount.total);
console.log("Total Reports:", reportCount.total);
console.log("User Roles: Configured");
console.log("B-Tree Index: Enabled");
console.log("--------------------------------");

// ==========================================
// 7. EXPORT DATABASE
// ==========================================

module.exports = db;
