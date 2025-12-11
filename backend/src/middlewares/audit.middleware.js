// src/middleware/auditLog.middleware.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const { auditLogs } = require("../db/schema/auditLogs");

/**
 * Enterprise-Grade Audit Logging Middleware
 * Logs safe information AFTER response is sent.
 */
const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const startTime = Date.now();

    // Extract IP safely
    const ip =
      req.headers["x-forwarded-for"] ||
      req.ip ||
      req.connection?.remoteAddress;

    const userId = req.user?.id; // 🚀 For PostgreSQL (uuid)
    const collegeId = req.user?.collegeId;

    // Sanitize request body
    const sanitizeBody = (body) => {
      if (!body || typeof body !== "object") return undefined;

      const forbidden = ["password", "otp", "token", "file", "fileBuffer"];
      const cleaned = {};

      for (const key in body) {
        if (!forbidden.includes(key)) {
          if (typeof body[key] === "string" && body[key].length > 300) continue;
          cleaned[key] = body[key];
        }
      }

      return cleaned;
    };

    const safeBody = sanitizeBody(req.body);

    const resourceId =
      req.params?.id || req.body?.id || req.body?._id || null;

    // Log AFTER response ends
    res.on("finish", async () => {
      try {
        await db.insert(auditLogs).values({
          userId,
          collegeId,
          action,
          resource,
          resourceId,
          statusCode: res.statusCode,
          responseTime: `${Date.now() - startTime}ms`,
          ipAddress: ip,
          userAgent: req.headers["user-agent"],
          details: {
            method: req.method,
            url: req.originalUrl,
            body: safeBody,
            query: req.query,
          },
        });
      } catch (err) {
        console.error("⚠️ Audit Log Insert Error:", err.message);
      }
    });

    return next();
  };
};

module.exports = { auditLog };
