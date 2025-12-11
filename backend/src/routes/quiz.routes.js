// src/routes/quiz.routes.js
const express = require("express");
const router = express.Router();

const quizController = require("../controllers/quiz.controller");
const studentController = require("../controllers/student.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// 🔐 All quiz routes require auth
router.use(authenticate);

/* =========================================================
   🚨 ANTI-CHEAT LOGGER
   (Placed BEFORE dynamic /:id routes to avoid overlaps)
========================================================= */
router.post(
  "/anti-cheat",
  authorize("STUDENT"),
  async (req, res) => {
    try {
      let body = req.body;

      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      const { attemptId, eventType, details, event, time } = body;

      if (!attemptId) {
        return res.status(400).json({
          success: false,
          message: "Attempt ID is required",
        });
      }

      const QuizAttempt = require("../models/QuizAttempt.model");

      const attempt = await QuizAttempt.findById(attemptId);

      if (!attempt) {
        return res.json({
          success: true,
          message: "Event logged (attempt not initialized yet)",
        });
      }

      if (attempt.studentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized attempt access",
        });
      }

      const finalType = eventType || event || "unknown";

      attempt.cheatingEvents.push({
        type: finalType,
        timestamp: new Date(time || Date.now()),
        details: details || finalType,
      });

      attempt.cheatingScore = Math.min(
        100,
        attempt.cheatingEvents.length * 10
      );

      await attempt.save();

      res.json({
        success: true,
        message: "Cheating event recorded",
        data: { cheatingScore: attempt.cheatingScore },
      });
    } catch (error) {
      console.error("Anti-cheat error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to log cheating event",
      });
    }
  }
);

// TODO: add other quiz routes here (list quizzes, start quiz, submit, etc.)
// e.g.
// router.get("/", quizController.getQuizzes);
// router.post("/", authorize("TEACHER"), quizController.createQuiz);

module.exports = router;
