// src/routes/college.routes.js

const express = require("express");
const router = express.Router();

const collegeController = require("../controllers/college.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

/* =========================================================
   🔐 ALL COLLEGE ROUTES REQUIRE AUTHENTICATION
========================================================= */
router.use(authenticate);

/* =========================================================
   🏛️ COLLEGE CRUD ROUTES
========================================================= */

// 1️⃣ Get all colleges (Admin + Manager)
router.get(
  "/",
  authorize("SUPER_ADMIN", "COLLEGE_MANAGER"),
  collegeController.getColleges
);

// 2️⃣ Get single college
router.get(
  "/:id",
  authorize("SUPER_ADMIN", "COLLEGE_MANAGER"),
  collegeController.getCollegeById
);

// 3️⃣ Create new college (Super Admin only)
router.post(
  "/",
  authorize("SUPER_ADMIN"),
  collegeController.createCollege
);

// 4️⃣ Update college (Super Admin + Manager)
router.put(
  "/:id",
  authorize("SUPER_ADMIN", "COLLEGE_MANAGER"),
  collegeController.updateCollege
);

// 5️⃣ Get stats for a college
router.get(
  "/:id/stats",
  authorize("SUPER_ADMIN", "COLLEGE_MANAGER"),
  collegeController.getCollegeStats
);

module.exports = router;
