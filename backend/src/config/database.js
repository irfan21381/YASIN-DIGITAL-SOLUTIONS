// src/config/database.js

require("dotenv").config();
const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");

const DATABASE_URL = process.env.DATABASE_URL;

console.log("🔵 [DB] DATABASE_URL =", DATABASE_URL);

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

(async () => {
  try {
    console.log("🔵 [DB] Pool created → testing connection...");
    const client = await pool.connect();
    const { rows } = await client.query("SELECT NOW()");
    console.log("✅ [DB] Connected. Time:", rows[0].now);
    client.release();
  } catch (err) {
    console.error("❌ [DB] Connection error:", err.message);
    // no process.exit() here
  }
})();

module.exports = { db, pool };
