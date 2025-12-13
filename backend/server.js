// ------------------------------------------------------------
// server.js — FINAL (PostgreSQL + Prisma | Render-ready)
// ------------------------------------------------------------

console.log("🟦 DEBUG: Server starting...");
require("dotenv").config();

console.log("🟦 DEBUG: ENV loaded");
console.log("🟦 DEBUG: DATABASE_URL loaded =", !!process.env.DATABASE_URL);

// ------------------------------------------------------------
// GLOBAL CRASH LOGGING (do not remove)
// ------------------------------------------------------------
process.on("unhandledRejection", (reason) => {
  console.error("❌ UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
});

const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const corsMiddleware = require("./src/config/cors");
const errorHandler = require("./src/middlewares/error.middleware");
const logger = require("./src/config/logger");

// ------------------------------------------------------------
// PRISMA (SAFE INITIALIZATION)
// ------------------------------------------------------------
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();

// ------------------------------------------------------------
// 1️⃣ GLOBAL MIDDLEWARE
// ------------------------------------------------------------
app.use(corsMiddleware);
app.options("*", corsMiddleware);

app.use(helmet());
app.use(compression());

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Fix sendBeacon JSON
app.use((req, res, next) => {
  if (req.is("text/plain") && typeof req.body === "string") {
    try {
      req.body = JSON.parse(req.body);
    } catch {
      // ignore
    }
  }
  next();
});

// ------------------------------------------------------------
// 2️⃣ RATE LIMITER
// ------------------------------------------------------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ------------------------------------------------------------
// 3️⃣ ROUTES
// ------------------------------------------------------------
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/users", require("./src/routes/user.routes"));
app.use("/api/admin", require("./src/routes/admin.routes"));
app.use("/api/colleges", require("./src/routes/college.routes"));
app.use("/api/subjects", require("./src/routes/subject.routes"));
app.use("/api/content", require("./src/routes/content.routes"));
app.use("/api/quiz", require("./src/routes/quiz.routes"));
app.use("/api/ai", require("./src/routes/ai.routes"));
app.use("/api/analytics", require("./src/routes/analytics.routes"));
app.use("/api/coding", require("./src/routes/coding.routes"));
app.use("/api/public", require("./src/routes/public.routes"));
app.use("/api/teacher", require("./src/routes/teacher.routes"));
app.use("/api/student", require("./src/routes/student.routes"));
app.use("/api/manager", require("./src/routes/manager.routes"));
app.use("/api/test", require("./src/routes/test.routes"));

// ------------------------------------------------------------
// 4️⃣ HEALTH CHECK
// ------------------------------------------------------------
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "OK",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Health DB error:", err.message);
    res.status(503).json({
      status: "ERROR",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// ------------------------------------------------------------
// 5️⃣ ERROR HANDLER (LAST)
// ------------------------------------------------------------
app.use(errorHandler);

// ------------------------------------------------------------
// 6️⃣ START SERVER
// ------------------------------------------------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, async () => {
  console.log(`🟩 Server running on port ${PORT}`);
  logger.info(`🚀 YDS EDU-AI Backend live on port ${PORT}`);

  // DB warm-up (non-fatal)
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("🟩 DB connection verified");
  } catch (err) {
    console.error("⚠️ DB ping failed (non-fatal):", err.message);
  }
});

module.exports = app;
