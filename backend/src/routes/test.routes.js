const express = require('express');
const router = express.Router();
const { db } = require('../config/database'); // Drizzle instance
const { sql } = require('drizzle-orm');

/* ============================================================
   📌 Utility: Measure API Latency
============================================================== */
const getLatency = (reqTime) => `${Date.now() - reqTime}ms`;

/* ============================================================
   📌 AUTH TEST
============================================================== */
router.get('/auth/test', (req, res) => {
  const reqTime = Date.now();

  res.json({
    success: true,
    route: 'auth/test',
    message: 'Auth route is working',
    latency: getLatency(reqTime),
    timestamp: new Date().toISOString(),
  });
});

/* ============================================================
   📌 TEACHER TEST
============================================================== */
router.get('/teacher/test', (req, res) => {
  const reqTime = Date.now();

  res.json({
    success: true,
    route: 'teacher/test',
    message: 'Teacher route is working',
    latency: getLatency(reqTime),
    timestamp: new Date().toISOString(),
  });
});

/* ============================================================
   📌 STUDENT TEST
============================================================== */
router.get('/student/test', (req, res) => {
  const reqTime = Date.now();

  res.json({
    success: true,
    route: 'student/test',
    message: 'Student route is working',
    latency: getLatency(reqTime),
    timestamp: new Date().toISOString(),
  });
});

/* ============================================================
   📌 HEALTH CHECK — API + PostgreSQL
============================================================== */
router.get('/health-check', async (req, res) => {
  const reqTime = Date.now();

  let dbStatus = 'unknown';

  try {
    // Simple PostgreSQL ping
    await db.execute(sql`SELECT 1`);
    dbStatus = 'connected';
  } catch (err) {
    console.error("DB health check error:", err);
    dbStatus = 'disconnected';
  }

  res.json({
    success: true,
    message: 'System health status',
    latency: getLatency(reqTime),
    server: {
      status: 'running',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
    },
    services: {
      api: 'running',
      database: dbStatus,
    },
  });
});

module.exports = router;
