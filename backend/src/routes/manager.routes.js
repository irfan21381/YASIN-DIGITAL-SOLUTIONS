// src/routes/manager.routes.js

const express = require("express");
const router = express.Router();

const managerController = require("../controllers/manager.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const { users } = require("../db/schema/users");
const { content } = require("../db/schema/content");
const { subjects } = require("../db/schema/subjects");
const { eq, sql } = require("drizzle-orm");

/* =========================================================
   🔐 All Manager Routes Require Authentication
========================================================= */
router.use(authenticate);

/* =========================================================
   📊 MANAGER DASHBOARD (PostgreSQL + Drizzle)
========================================================= */
router.get(
  "/dashboard",
  authorize("COLLEGE_MANAGER", "SUPER_ADMIN"),
  async (req, res) => {
    try {
      const collegeId = req.user.collegeId;

      const [[studentCount], [teacherCount], [contentCount], [subjectCount]] =
        await Promise.all([
          db.select({ count: sql`COUNT(*)` }).from(users)
            .where(eq(users.collegeId, collegeId)).where(eq(users.activeRole, "STUDENT")),
          db.select({ count: sql`COUNT(*)` }).from(users)
            .where(eq(users.collegeId, collegeId)).where(eq(users.activeRole, "TEACHER")),
          db.select({ count: sql`COUNT(*)` }).from(content)
            .where(eq(content.collegeId, collegeId)),
          db.select({ count: sql`COUNT(*)` }).from(subjects)
            .where(eq(subjects.collegeId, collegeId)),
        ]);

      return res.json({
        success: true,
        data: {
          students: Number(studentCount.count),
          teachers: Number(teacherCount.count),
          content: Number(contentCount.count),
          subjects: Number(subjectCount.count),
        },
      });
    } catch (error) {
      console.error("Manager dashboard error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard data",
      });
    }
  }
);

/* =========================================================
   📊 CLASSROOM ANALYTICS (Teacher / Manager / Admin)
========================================================= */

// List of active students (24 hrs)
router.get(
  "/active-students",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  managerController.getActiveStudents
);

// Student course-wise progress
router.get(
  "/student-progress",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  managerController.getStudentProgress
);

// AI recommendations
router.get(
  "/ai-recommendations",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  managerController.getAIRecommendations
);

/* =========================================================
   📚 ASSIGNMENTS ROUTES
========================================================= */

// Students can view their assignments (handled inside controller)
router.get("/assignments", managerController.getAssignments);

// Teachers / Managers / Admins can create assignments
router.post(
  "/assignments",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  managerController.createAssignment
);

module.exports = router;
