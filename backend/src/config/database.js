// src/config/database.js

require("dotenv").config();
const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");

const DATABASE_URL = process.env.DATABASE_URL;

// Never log full DB URL in production
console.log("🔵 [DB] DATABASE_URL loaded =", !!DATABASE_URL);

// --------------------------------------------------
// PostgreSQL Pool (Render requires SSL)
// --------------------------------------------------
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // REQUIRED for Render / managed Postgres
  },
});

const db = drizzle(pool);

// --------------------------------------------------
// Connection Test (Non-fatal)
// --------------------------------------------------
(async () => {
  try {
    console.log("🔵 [DB] Pool created → testing connection...");
    const client = await pool.connect();
    const { rows } = await client.query("SELECT NOW()");
    console.log("✅ [DB] Connected. Time:", rows[0].now);
    client.release();
  } catch (err) {
    console.error("❌ [DB] Connection error:", err.message);
    // Do NOT crash server
  }
})();

module.exports = { db, pool };
