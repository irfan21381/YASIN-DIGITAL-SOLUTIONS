const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  bulkUploadStudents,
  bulkUploadTeachers,
} = require("../controllers/user.controller");

const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { uploadCSV } = require("../middlewares/upload.middleware");

// 🔐 All user routes require authentication
router.use(authenticate);

/* ============================================================
   📌 BULK UPLOAD ROUTES  
   IMPORTANT: Keep ABOVE '/:id' to avoid conflict
============================================================ */
router.post(
  "/bulk/students",
  authorize("COLLEGE_MANAGER", "SUPER_ADMIN"),
  uploadCSV,
  bulkUploadStudents
);

router.post(
  "/bulk/teachers",
  authorize("COLLEGE_MANAGER", "SUPER_ADMIN"),
  uploadCSV,
  bulkUploadTeachers
);

/* ============================================================
   📌 USER CRUD ROUTES
   (PostgreSQL + Drizzle Compatible)
============================================================ */

// Get all users (with role/college/search filters)
router.get("/", getUsers);

// Create new user (Admin / Manager only)
router.post(
  "/",
  authorize("SUPER_ADMIN", "COLLEGE_MANAGER"),
  createUser
);

// Get user by ID
router.get("/:id", getUserById);

// Update user (self / admin / manager)
router.put("/:id", updateUser);

module.exports = router;
