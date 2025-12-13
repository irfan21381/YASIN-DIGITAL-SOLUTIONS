// src/config/database.js

require("dotenv").config();
const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool);

// Non-fatal connection test
(async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("🟩 [DB] Drizzle + pg connected");
  } catch (err) {
    console.error("❌ [DB] Connection error:", err.message);
  }
})();

module.exports = { db, pool };
