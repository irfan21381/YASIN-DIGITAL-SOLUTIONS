// src/middleware/auth.middleware.js

const jwt = require("jsonwebtoken");
// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const { users } = require("../db/schema/users");
const AppError = require("../utils/AppError");
const { eq } = require("drizzle-orm");

/* -------------------------------------------------------------
   Utility: Safe IP Extractor
------------------------------------------------------------- */
const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"] ||
    req.ip ||
    req.connection?.remoteAddress ||
    "unknown"
  );
};

/* =============================================================
   🔐 AUTHENTICATE — Verify JWT + Load User From PostgreSQL
============================================================= */
const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return next(new AppError("Authentication token missing", 401));
    }

    const token = auth.split(" ")[1];

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new AppError("Invalid or expired token", 401));
    }

    // Load user via Drizzle ORM
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    // Check blocked / inactive
    if (user.isBlocked) {
      return next(new AppError("Your account is blocked", 403));
    }
    if (user.isActive === false) {
      return next(new AppError("Your account is inactive", 403));
    }

    // Attach clean user
    req.user = user;
    req.requestIP = getClientIP(req);

    // 🟦 Ensure activeRole is valid
    try {
      const parsedRoles = Array.isArray(user.roles)
        ? user.roles
        : JSON.parse(user.roles || "[]");

      if (!parsedRoles.includes(user.activeRole)) {
        req.user.activeRole = parsedRoles[0] || null;
      }

      req.user.roles = parsedRoles;
      req.user.permissions = Array.isArray(user.permissions)
        ? user.permissions
        : JSON.parse(user.permissions || "[]");
    } catch {
      req.user.roles = [];
      req.user.permissions = [];
    }

    return next();
  } catch (err) {
    return next(new AppError("Authentication failed", 500));
  }
};

/* =============================================================
   🔐 AUTHORIZE — Require Certain Roles
============================================================= */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return next(new AppError("Not authenticated", 401));

    const userRoles = req.user.roles || [];

    const hasAccess = allowedRoles.some((r) => userRoles.includes(r));
    if (!hasAccess) {
      return next(new AppError("Insufficient permissions", 403));
    }

    next();
  };
};

/* =============================================================
   🏫 COLLEGE ACCESS — Data Isolation
============================================================= */
const checkCollegeAccess = (req, res, next) => {
  try {
    const requested =
      req.params.collegeId || req.query.collegeId || req.body.collegeId;

    // Super admin gets access to all
    if (req.user.roles.includes("SUPER_ADMIN")) return next();

    if (!requested) return next();

    if (req.user.collegeId === requested) return next();

    return next(new AppError("Access denied: College mismatch", 403));
  } catch (err) {
    return next(new AppError("College access check failed", 500));
  }
};

/* =============================================================
   🎭 ACTIVE ROLE SWITCH — Only if user owns that role
============================================================= */
const setActiveRole = (req, res, next) => {
  try {
    const requested =
      req.headers["x-active-role"] || req.body.activeRole || null;

    if (!requested || !req.user) return next();

    if (req.user.roles.includes(requested)) {
      req.user.activeRole = requested;
    }

    next();
  } catch (err) {
    return next();
  }
};

module.exports = {
  authenticate,
  authorize,
  checkCollegeAccess,
  setActiveRole,
};
