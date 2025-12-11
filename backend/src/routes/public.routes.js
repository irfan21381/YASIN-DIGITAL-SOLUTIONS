const express = require('express');
const router = express.Router();

const publicController = require('../controllers/public.controller');
const { aiLimiter } = require("../middlewares/rateLimit.middleware");

// --------------------------------------------
// PUBLIC API — No Auth Required
// --------------------------------------------

// Doubt Solver (AI-powered)
router.post(
  "/doubt-solver",
  aiLimiter, // optional but recommended
  publicController.publicDoubtSolver
);

// Coding Lab (public sandbox)
router.post(
  "/coding-lab",
  publicController.publicCodingLab
);

// Career Guidance (AI-powered)
router.post(
  "/career-guidance",
  aiLimiter,
  publicController.careerGuidance
);

// Sample Public Quizzes
router.get("/quizzes", publicController.getPublicQuizzes);

module.exports = router;
