const express = require("express");
const router = express.Router();

const studentController = require("../controllers/student.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// 🔐 All student routes require login
router.use(authenticate);

/* =========================================================
   🎓 STUDENT QUIZ ROUTES
========================================================= */

// Get list of quizzes available for student
router.get(
  "/quizzes",
  authorize("STUDENT"),
  studentController.getQuizzes
);

// Get single quiz by ID (auto-shuffle questions/options)
router.get(
  "/quizzes/:id",
  authorize("STUDENT"),
  studentController.getQuizById
);

// Start quiz attempt
router.post(
  "/quizzes/:id/start",
  authorize("STUDENT"),
  studentController.startQuizAttempt
);

// Submit quiz attempt
router.post(
  "/quizzes/:attemptId/submit",
  authorize("STUDENT"),
  studentController.submitQuizAttempt
);

module.exports = router;
