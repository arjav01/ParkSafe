
require("dotenv").config();

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database_name,
        NOW() AS server_time,
        version() AS postgres_version
    `);

    console.log("--------------------------------");
    console.log("PARKSAFE CLOUD DATABASE CONNECTED");
    console.log("--------------------------------");
    console.log("Database:", result.rows[0].database_name);
    console.log("Server Time:", result.rows[0].server_time);
    console.log("PostgreSQL:", result.rows[0].postgres_version);
    console.log("--------------------------------");
  } catch (error) {
    console.error("DATABASE CONNECTION FAILED");
    console.error(error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
