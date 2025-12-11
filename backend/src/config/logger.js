const winston = require("winston");
const path = require("path");
const fs = require("fs");
require("winston-daily-rotate-file");

// ------------------------------------------------------------
// Ensure /logs folder exists
// ------------------------------------------------------------
const logDir = path.join(__dirname, "../logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// ------------------------------------------------------------
// Log Levels
// ------------------------------------------------------------
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

// Determine logging level based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "info";
};

// ------------------------------------------------------------
// Colors for Console Logs
// ------------------------------------------------------------
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "white",
  debug: "cyan",
  silly: "grey",
};

winston.addColors(colors);

// ------------------------------------------------------------
// Formats (Color for console, JSON for files)
// ------------------------------------------------------------
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// ------------------------------------------------------------
// Daily Rotating File Transports
// ------------------------------------------------------------
const dailyRotateFile = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: "app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
  level: "info",
  format: fileFormat,
});

const dailyRotateErrors = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: "errors-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "30d",
  level: "error",
  format: fileFormat,
});

// ------------------------------------------------------------
// Create Logger
// ------------------------------------------------------------
const logger = winston.createLogger({
  level: level(),
  levels,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    dailyRotateFile,
    dailyRotateErrors,
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, "exceptions.log") }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, "rejections.log") }),
  ],
});

// ------------------------------------------------------------
// HTTP Request Logger Helper (For Express Apps)
// ------------------------------------------------------------
logger.httpRequest = (req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl}`);
  next();
};

module.exports = logger;
