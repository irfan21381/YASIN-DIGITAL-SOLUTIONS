// src/middlewares/error.middleware.js

const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    err.message ||
    (statusCode === 500 ? "Internal Server Error" : "Request failed");

  const isDev = process.env.NODE_ENV === "development";

  logger.error({
    statusCode,
    message,
    method: req.method,
    url: req.originalUrl,
    ip: req.headers["x-forwarded-for"] || req.ip,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
