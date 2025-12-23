// ------------------------------------------------------------
// server.js — FINAL WORKING VERSION (Frontend + Backend CONNECT)
// ------------------------------------------------------------

require("dotenv").config();
console.log("🟦 Server booting...");

// ------------------------------------------------------------
// GLOBAL CRASH LOGGING
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

// ------------------------------------------------------------
// PRISMA
// ------------------------------------------------------------
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();

// ------------------------------------------------------------
// BASIC MIDDLEWARE
// ------------------------------------------------------------
app.use(helmet());
app.use(compression());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ------------------------------------------------------------
// ✅ CORS + PREFLIGHT (MOST IMPORTANT FIX)
// ------------------------------------------------------------
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://yasin-digital-solutions-lhpb.vercel.app"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // 🔥 Handle browser preflight request
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ------------------------------------------------------------
// LOGGING
// ------------------------------------------------------------
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// ------------------------------------------------------------
// RATE LIMITING
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
// ROUTES
// ------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("🚀 YDS EDU-AI Backend is running");
});

// 🔐 AUTH
app.use("/api/auth", require("./src/routes/auth.routes"));

// OTHER MODULES
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
// HEALTH CHECK
// ------------------------------------------------------------
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "OK",
      database: "connected",
      time: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "ERROR",
      database: "disconnected",
      time: new Date().toISOString(),
    });
  }
});

// ------------------------------------------------------------
// GLOBAL ERROR HANDLER
// ------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ------------------------------------------------------------
// START SERVER
// ------------------------------------------------------------
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, async () => {
  console.log(`🟩 Server running on port ${PORT}`);

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("🟩 Database connected");
  } catch {
    console.warn("⚠️ Database not reachable");
  }
});

// ------------------------------------------------------------
// GRACEFUL SHUTDOWN
// ------------------------------------------------------------
process.on("SIGTERM", async () => {
  console.log("🛑 Shutting down server...");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

module.exports = app;
