const express = require("express");
const router = express.Router();

// Controllers
const aiController = require("../controllers/ai.controller");

// Middlewares
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const { aiLimiter } = require("../middlewares/rateLimit.middleware");

// 🔒 Protect ALL AI routes (JWT required)
router.use(authenticate);

/* =========================================================
   📌 DOUBT SOLVER (RAG Chat)
   Endpoint: POST /api/ai/chat
========================================================= */
router.post("/chat", aiLimiter, aiController.sendChatMessage);

/* =========================================================
   📌 GET CHAT HISTORY
   Endpoint: GET /api/ai/chat
========================================================= */
router.get("/chat", aiController.getChatHistory);

/* =========================================================
   📌 AI QUIZ GENERATOR (Teachers + Managers + Admins)
   Endpoint: POST /api/ai/quiz/generate
========================================================= */
router.post(
  "/quiz/generate",
  authorize("TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"),
  aiLimiter,
  aiController.generateQuiz
);

/* =========================================================
   📌 AI NOTES GENERATOR
   Endpoint: POST /api/ai/notes/generate
========================================================= */
router.post("/notes/generate", aiLimiter, aiController.generateNotes);

/* =========================================================
   📌 AI MENTOR
   Endpoint: GET /api/ai/mentor
========================================================= */
router.get("/mentor", aiLimiter, aiController.getAIMentor);

module.exports = router;
