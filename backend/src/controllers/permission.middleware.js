// src/middleware/permission.middleware.js

const AppError = require("../utils/AppError");

/**
 * Permission Middleware
 * ---------------------------------------------
 * Used to protect routes that require a specific
 * granular permission (ex: 'can_add_course').
 *
 * SUPER_ADMIN automatically bypasses all checks.
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      // Missing user object → unauthorized
      if (!req.user) {
        return next(new AppError("Authentication required", 401));
      }

      const user = req.user;

      // 1. SUPER ADMIN has full access
      if (user.roles?.includes("SUPER_ADMIN")) {
        return next();
      }

      // 2. Normal users → check granular permissions
      if (Array.isArray(user.permissions) && user.permissions.includes(permission)) {
        return next();
      }

      // 3. Access denied
      return next(
        new AppError(
          `Access Denied. Requires '${permission}' permission.`,
          403
        )
      );
    } catch (error) {
      next(new AppError("Permission validation failed", 500));
    }
  };
};

module.exports = { requirePermission };
