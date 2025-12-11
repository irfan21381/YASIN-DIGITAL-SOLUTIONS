// src/middleware/permission.middleware.js

const AppError = require("../utils/AppError");

/**
 * Role + Permission Guard Middleware
 * - SUPER_ADMIN always bypasses checks
 * - Uses PostgreSQL TEXT[] permissions array
 */
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return next(new AppError("Not authenticated. Please login.", 401));
      }

      const userRoles = req.user.roles || [];
      const userPermissions = req.user.permissions || [];

      /* ----------------------------------------------------------
         1. SUPER_ADMIN always gets full access
      ---------------------------------------------------------- */
      if (userRoles.includes("SUPER_ADMIN")) {
        return next();
      }

      /* ----------------------------------------------------------
         2. Check granular permission in PostgreSQL TEXT[]
      ---------------------------------------------------------- */
      if (userPermissions.includes(permission)) {
        return next();
      }

      /* ----------------------------------------------------------
         3. Reject request
      ---------------------------------------------------------- */
      return next(
        new AppError(
          `Access Denied. Requires '${permission}' permission.`,
          403
        )
      );
    } catch (err) {
      return next(new AppError("Permission validation failed", 500));
    }
  };
};

module.exports = { requirePermission };
