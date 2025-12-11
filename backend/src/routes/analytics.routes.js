const express = require("express");
const router = express.Router();

// Controllers
const analyticsController = require("../controllers/analytics.controller");

// Middlewares
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { analyticsLimiter } = require("../middlewares/rateLimit.middleware");

// 🔐 All analytics routes require authentication
router.use(authenticate);

/* =========================================================
   📊 STUDENT USAGE ANALYTICS
   Roles: TEACHER | MANAGER | ADMIN
   GET /api/analytics/student-usage
========================================================= */
router.get(
  "/student-usage",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  analyticsLimiter,
  analyticsController.getStudentUsage
);

/* =========================================================
   🤖 AI QUESTION ANALYTICS
   GET /api/analytics/ai-questions
========================================================= */
router.get(
  "/ai-questions",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  analyticsLimiter,
  analyticsController.getAIQuestionTypes
);

/* =========================================================
   📉 WEAK SUBJECTS
   GET /api/analytics/weak-subjects
========================================================= */
router.get(
  "/weak-subjects",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  analyticsLimiter,
  analyticsController.getWeakSubjects
);

/* =========================================================
   📝 QUIZ MARKS / PERFORMANCE
   GET /api/analytics/quiz-marks
========================================================= */
router.get(
  "/quiz-marks",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  analyticsLimiter,
  analyticsController.getQuizMarks
);

/* =========================================================
   ⏱ TIME SPENT ANALYTICS
   GET /api/analytics/time-spent
========================================================= */
router.get(
  "/time-spent",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  analyticsLimiter,
  analyticsController.getTimeSpent
);

/* =========================================================
   🔥 STUDY STREAK ANALYTICS
   GET /api/analytics/study-streak
========================================================= */
router.get(
  "/study-streak",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  analyticsLimiter,
  analyticsController.getStudyStreak
);

/* =========================================================
   📚 DIFFICULTY HEATMAP
   GET /api/analytics/difficulty-heatmap
========================================================= */
router.get(
  "/difficulty-heatmap",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  analyticsLimiter,
  analyticsController.getDifficultyHeatmap
);

module.exports = router;
