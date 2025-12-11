// src/middleware/rateLimit.middleware.js

const rateLimit = require("express-rate-limit");

/**
 * Skip rate limiting for SUPER_ADMIN
 */
const skipSuperAdmin = (req, res) => {
  return (
    req.user &&
    Array.isArray(req.user.roles) &&
    req.user.roles.includes("SUPER_ADMIN")
  );
};

/**
 * Authentication rate limiter
 */
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message:
    "Too many authentication attempts from this IP, please try again after a minute.",
  skip: skipSuperAdmin,
});

/**
 * AI Feature limiter
 */
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message:
    "Too many AI requests from this IP, please try again after a minute.",
  skip: skipSuperAdmin,
});

/**
 * Analytics limiter
 */
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message:
    "Too many analytics requests from this IP, please try again after a minute.",
  skip: skipSuperAdmin,
});

module.exports = {
  authLimiter,
  aiLimiter,
  analyticsLimiter,
};
