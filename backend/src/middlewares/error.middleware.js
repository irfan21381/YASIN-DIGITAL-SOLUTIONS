// src/middleware/errorHandler.js

const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  // Normalize status + message
  const statusCode = err.statusCode || 500;
  const message =
    err.message ||
    (statusCode === 500 ? "Internal Server Error" : "An error occurred");

  const isDev = process.env.NODE_ENV === "development";

  /* -----------------------------------------------------------
     STRUCTURED ERROR LOG (Useful for Cloud / ELK / Loki)
  ----------------------------------------------------------- */
  logger.error({
    statusCode,
    message,
    method: req.method,
    url: req.originalUrl,
    ip: req.headers["x-forwarded-for"] || req.ip,
    stack: err.stack || null,
  });

  /* -----------------------------------------------------------
     RESPONSE  
     - Never expose stacktrace in production
     - Keeps API responses clean
  ----------------------------------------------------------- */
  return res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
