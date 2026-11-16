
require("dotenv").config();

const Database = require("better-sqlite3");
const { Pool } = require("pg");

const sqlite = new Database("parking.db", {
  readonly: true
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log("\nStarting ParkSafe migration...\n");

    await client.query("BEGIN");

    // 1. Migrate users first
    const users = sqlite.prepare(
      "SELECT * FROM users ORDER BY id"
    ).all();

    for (const user of users) {
      await client.query(
        `INSERT INTO public.users
         (id, name, mobile, password, role, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           mobile = EXCLUDED.mobile,
           password = EXCLUDED.password,
           role = EXCLUDED.role`,
        [
          user.id,
          user.name,
          user.mobile,
          user.password,
          user.role || "user",
          user.created_at
        ]
      );
    }

    console.log("Users migrated:", users.length);

    // 2. Migrate vehicles
    const vehicles = sqlite.prepare(
      "SELECT * FROM vehicles ORDER BY id"
    ).all();

    for (const vehicle of vehicles) {
      await client.query(
        `INSERT INTO public.vehicles
         (id, vehicle_number, vehicle_type, vehicle_model,
          owner_reference, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (vehicle_number) DO UPDATE SET
           vehicle_type = EXCLUDED.vehicle_type,
           vehicle_model = EXCLUDED.vehicle_model,
           owner_reference = EXCLUDED.owner_reference,
           status = EXCLUDED.status`,
        [
          vehicle.id,
          vehicle.vehicle_number,
          vehicle.vehicle_type,
          vehicle.vehicle_model,
          vehicle.owner_reference,
          vehicle.status
        ]
      );
    }

    console.log("Vehicles migrated:", vehicles.length);

    // 3. Migrate reports
    const reports = sqlite.prepare(
      "SELECT * FROM reports ORDER BY id"
    ).all();

    for (const report of reports) {
      await client.query(
        `INSERT INTO public.reports
         (id, report_id, user_id, violation_type, description,
          location, coordinates, file_name, status, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (report_id) DO UPDATE SET
           description = EXCLUDED.description,
           location = EXCLUDED.location,
           coordinates = EXCLUDED.coordinates,
           file_name = EXCLUDED.file_name,
           status = EXCLUDED.status`,
        [
          report.id,
          report.report_id,
          report.user_id,
          report.violation_type,
          report.description,
          report.location,
          report.coordinates,
          report.file_name,
          report.status,
          report.submitted_at
        ]
      );
    }

    console.log("Reports migrated:", reports.length);

    // 4. Reset PostgreSQL ID sequences
    for (const table of ["users", "vehicles", "reports"]) {
      await client.query(
        `SELECT setval(
          pg_get_serial_sequence('public.${table}', 'id'),
          COALESCE((SELECT MAX(id) FROM public.${table}), 1),
          EXISTS (SELECT 1 FROM public.${table})
        )`
      );
    }

    await client.query("COMMIT");

    console.log("\n-------------------------------");
    console.log("PARKSAFE MIGRATION SUCCESSFUL");
    console.log("-------------------------------");

    for (const table of [
      "users",
      "vehicles",
      "reports"
    ]) {
      const result = await client.query(
        `SELECT COUNT(*) AS total FROM public.${table}`
      );

      console.log(
        `${table}:`,
        result.rows[0].total
      );
    }

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("\nMigration failed:", error.message);
    console.error("Changes rolled back.");
  } finally {
    client.release();
    await pool.end();
    sqlite.close();
  }
}

migrate();
