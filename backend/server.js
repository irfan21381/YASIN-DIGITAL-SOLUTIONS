// ------------------------------------------------------------
// server.js (PostgreSQL + Prisma FINAL)
// ------------------------------------------------------------

console.log("🟦 DEBUG: Server starting...");
require("dotenv").config();

console.log("🟦 DEBUG: Loaded .env");
console.log("🟦 DEBUG: DATABASE_URL =", process.env.DATABASE_URL);

// Global crash logging
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const corsMiddleware = require("./src/config/cors");
const errorHandler = require("./src/middlewares/error.middleware");
const logger = require("./src/config/logger");

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
    message: "Too many requests from this IP, please try again later.",
  })
);

// ------------------------------------------------------------
// 3️⃣ ROUTES (each must export `module.exports = router`)
// ------------------------------------------------------------
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const adminRoutes = require("./src/routes/admin.routes");
const collegeRoutes = require("./src/routes/college.routes");
const subjectRoutes = require("./src/routes/subject.routes");
const contentRoutes = require("./src/routes/content.routes");
const quizRoutes = require("./src/routes/quiz.routes");
const aiRoutes = require("./src/routes/ai.routes");
const analyticsRoutes = require("./src/routes/analytics.routes");
const codingRoutes = require("./src/routes/coding.routes");
const publicRoutes = require("./src/routes/public.routes");
const teacherRoutes = require("./src/routes/teacher.routes");
const studentRoutes = require("./src/routes/student.routes");
const managerRoutes = require("./src/routes/manager.routes");
const testRoutes = require("./src/routes/test.routes");

// Quick type check (can remove after everything works)
if (process.env.NODE_ENV === 'development') {
  console.log("🟦 DEBUG route types:", {
    auth: typeof authRoutes,
    users: typeof userRoutes,
    admin: typeof adminRoutes,
    colleges: typeof collegeRoutes,
    subjects: typeof subjectRoutes,
    content: typeof contentRoutes,
    quiz: typeof quizRoutes,
    ai: typeof aiRoutes,
    analytics: typeof analyticsRoutes,
    coding: typeof codingRoutes,
    public: typeof publicRoutes,
    teacher: typeof teacherRoutes,
    student: typeof studentRoutes,
    manager: typeof managerRoutes,
    test: typeof testRoutes,
  });
}

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/coding", codingRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/test", testRoutes);

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
  } catch (e) {
    console.error("Health DB error:", e.message);
    res.status(503).json({
      status: "ERROR",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// ------------------------------------------------------------
// 5️⃣ ERROR HANDLER
// ------------------------------------------------------------
app.use(errorHandler);

// ------------------------------------------------------------
// 6️⃣ START SERVER
// ------------------------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🟩 DEBUG: Server started on port ${PORT}`);
  logger.info(`🚀 YDS EDU-AI Backend running on port ${PORT}`);

  try {
    console.log("🟦 DEBUG: Pinging DB with SELECT 1...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("🟩 DEBUG: DB SELECT 1 OK");
  } catch (err) {
    console.error("❌ DEBUG DB ERROR on startup (non-fatal):", err.message);
    logger.error("❌ Database ping failed on startup:", err.message);
  }
});

module.exports = app;

