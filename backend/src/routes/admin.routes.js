// src/routes/admin.routes.js

const express = require("express");
const router = express.Router();

// --- DB + DRIZZLE IMPORTS ---
const { db } = require("../config/database");
const { sql } = require("drizzle-orm");

const { users } = require("../db/schema/users");
const { colleges } = require("../db/schema/colleges");
const { content } = require("../db/schema/content");
const { quizzes } = require("../db/schema/quizzes");
const { analytics } = require("../db/schema/analytics");

// --- CONTROLLER IMPORTS ---
const collegeController = require("../controllers/college.controller");
const userController = require("../controllers/user.controller");
const analyticsController = require("../controllers/analytics.controller");
const settingsController = require("../controllers/settings.controller");
const certificateController = require("../controllers/certificate.controller");

// --- MIDDLEWARE IMPORTS ---
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { requirePermission } = require("../middlewares/permission.middleware");

/* =====================================================
   📌 ADMIN OVERVIEW (Drizzle + PostgreSQL)
   Endpoint: /api/admin/overview
   ===================================================== */
router.get(
  "/overview",
  authenticate,
  authorize("SUPER_ADMIN"),
  async (req, res) => {
    try {
      // Generic count(*) helper
      const getCount = async (table) => {
        const [row] = await db
          .select({
            count: sql`count(*)`.mapWith(Number),
          })
          .from(table);
        return row?.count || 0;
      };

      // Count users by role (roles is assumed to be text[] in PostgreSQL)
      const countByRole = async (role) => {
        const [row] = await db
          .select({
            count: sql`count(*)`.mapWith(Number),
          })
          .from(users)
          .where(sql`${users.roles} @> ARRAY[${role}]::text[]`);
        return row?.count || 0;
      };

      const [
        collegeCount,
        studentCount,
        teacherCount,
        managerCount,
        contentCount,
        quizCount,
        aiUsageRows,
      ] = await Promise.all([
        getCount(colleges),
        countByRole("STUDENT"),
        countByRole("TEACHER"),
        countByRole("COLLEGE_MANAGER"),
        getCount(content),
        getCount(quizzes),
        db
          .select({
            type: analytics.type,
            count: sql`count(*)`.mapWith(Number),
          })
          .from(analytics)
          .groupBy(analytics.type),
      ]);

      const aiUsage = {
        total: 0,
        chatMessages: 0,
        notesGenerated: 0,
        quizAttempts: 0,
      };

      aiUsageRows.forEach((row) => {
        aiUsage.total += row.count;
        if (row.type === "chat_message") aiUsage.chatMessages = row.count;
        if (row.type === "notes_generated") aiUsage.notesGenerated = row.count;
        if (row.type === "quiz_attempt") aiUsage.quizAttempts = row.count;
      });

      return res.json({
        success: true,
        data: {
          colleges: collegeCount,
          students: studentCount,
          teachers: teacherCount,
          managers: managerCount,
          contents: contentCount,
          quizzes: quizCount,
          aiUsage,
        },
      });
    } catch (err) {
      console.error("Admin Overview Route CRASH:", err);
      return res.status(500).json({
        success: false,
        message:
          "Admin overview failed to load due to server error",
      });
    }
  }
);

/* =====================================================
   ⚙️ SETTINGS ROUTES
   Base: /api/admin/settings
   ===================================================== */
router.get(
  "/settings",
  authenticate,
  authorize("SUPER_ADMIN"),
  settingsController.getGlobalSettings
);
router.patch(
  "/settings",
  authenticate,
  authorize("SUPER_ADMIN"),
  settingsController.updateGlobalSettings
);

/* =====================================================
   🏛️ COLLEGE MANAGEMENT ROUTES
   Base: /api/admin/colleges
   ===================================================== */
router.get("/colleges", authenticate, collegeController.getColleges);
router.get("/colleges/:id", authenticate, collegeController.getCollegeById);
router.post(
  "/colleges",
  authenticate,
  authorize("SUPER_ADMIN"),
  collegeController.createCollege
);
router.patch("/colleges/:id", authenticate, collegeController.updateCollege);
router.delete(
  "/colleges/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  collegeController.deleteCollege
);
router.get(
  "/colleges/:id/stats",
  authenticate,
  collegeController.getCollegeStats
);
router.get("/colleges/stats", authenticate, collegeController.getCollegeStats);

/* =====================================================
   👥 USER MANAGEMENT ROUTES
   Base: /api/admin/users
   ===================================================== */
router.get("/users", authenticate, userController.getUsers);
router.get("/users/:id", authenticate, userController.getUserById);
router.post("/users", authenticate, userController.createUser);
router.patch("/users/:id", authenticate, userController.updateUser);
router.patch(
  "/users/:id/roles",
  authenticate,
  authorize("SUPER_ADMIN"),
  userController.updateUserRoles
);
// status toggle still uses same controller (it already checks fields)
router.patch(
  "/users/:id/status",
  authenticate,
  authorize("SUPER_ADMIN"),
  userController.updateUser
);

/* =====================================================
   📊 ANALYTICS ROUTES
   Base: /api/admin/analytics/...
   ===================================================== */
router.get(
  "/analytics/overview",
  authenticate,
  authorize("SUPER_ADMIN"),
  analyticsController.getAnalyticsOverview
);

router.get(
  "/analytics/usage/student",
  authenticate,
  analyticsController.getStudentUsage
);
router.get(
  "/analytics/ai/questions",
  authenticate,
  authorize("SUPER_ADMIN", "COLLEGE_MANAGER"),
  analyticsController.getAIQuestionTypes
);
router.get(
  "/analytics/quiz/weak-subjects",
  authenticate,
  analyticsController.getWeakSubjects
);
router.get(
  "/analytics/quiz/marks",
  authenticate,
  authorize("SUPER_ADMIN", "COLLEGE_MANAGER", "TEACHER"),
  analyticsController.getQuizMarks
);
router.get(
  "/analytics/time-spent",
  authenticate,
  analyticsController.getTimeSpent
);
router.get(
  "/analytics/streak",
  authenticate,
  analyticsController.getStudyStreak
);
router.get(
  "/analytics/difficulty-heatmap",
  authenticate,
  authorize("SUPER_ADMIN", "COLLEGE_MANAGER", "TEACHER"),
  analyticsController.getDifficultyHeatmap
);

/* =====================================================
   📚 BULK UPLOAD ROUTES
   Base: /api/admin/upload/...
   ===================================================== */
router.post(
  "/upload/students",
  authenticate,
  authorize("COLLEGE_MANAGER"),
  userController.bulkUploadStudents
);
router.post(
  "/upload/teachers",
  authenticate,
  authorize("COLLEGE_MANAGER"),
  userController.bulkUploadTeachers
);

/* =====================================================
   📜 CERTIFICATE APPROVAL SYSTEM
   Base: /api/admin/certificates
   ===================================================== */
// 1. Get Pending Requests
router.get(
  "/certificates/pending",
  authenticate,
  requirePermission("approve_certificates"),
  certificateController.getPendingRequests
);

// 2. Approve Request
router.patch(
  "/certificates/:id/approve",
  authenticate,
  requirePermission("approve_certificates"),
  certificateController.approveCertificate
);

// 3. Reject Request
router.patch(
  "/certificates/:id/reject",
  authenticate,
  requirePermission("approve_certificates"),
  certificateController.rejectCertificate
);

module.exports = router;
