const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",           // Dev
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,         // Production frontend
  process.env.ADMIN_URL             // Admin panel
].filter(Boolean); // remove undefined values

module.exports = cors({
  origin: function (origin, callback) {
    // Allow all in dev mode (no origin header for mobile apps, curl, etc)
    if (!origin || process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn("🛑 Blocked CORS origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Active-Role",
    "X-Requested-With",
  ],

  exposedHeaders: [
    "Content-Disposition", // Needed for file downloads
    "X-Total-Count",
  ],

  maxAge: 600, // Cache preflight response for 10 minutes
});
