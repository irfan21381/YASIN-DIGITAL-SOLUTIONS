const express = require("express");
const router = express.Router();

// Controllers
const authController = require("../controllers/auth.controller");

// Middlewares
const { authenticate } = require("../middlewares/auth.middleware");
const { authLimiter } = require("../middlewares/rateLimit.middleware");

/* =========================================================
   🔐 AUTH ROUTES
========================================================= */

// Send OTP to email
router.post("/send-otp", authLimiter, authController.sendOTPToEmail);

// Verify OTP and login
router.post("/verify-otp", authLimiter, authController.verifyOTPAndLogin);

// Login using password
router.post("/login-password", authLimiter, authController.loginWithPassword);

// Switch active role (TEACHER <-> MANAGER <-> STUDENT)
router.post("/switch-role", authenticate, authController.switchRole);

// Get current logged-in user
router.get("/me", authenticate, authController.getCurrentUser);

// Logout
router.post("/logout", authenticate, authController.logout);

module.exports = router;
