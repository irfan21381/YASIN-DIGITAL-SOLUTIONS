// src/routes/coding.routes.js

const express = require("express");
const router = express.Router();

const codingController = require("../controllers/coding.controller");
const { authenticate } = require("../middlewares/auth.middleware");

/* =========================================================
   🔐 AUTH REQUIRED FOR ALL CODING WORKSPACE ROUTES
========================================================= */
router.use(authenticate);

/* =========================================================
   🟩 CREATE A NEW CODING SESSION
========================================================= */
router.post("/", codingController.createCodingSession);

/* =========================================================
   🟨 GET ALL CODING SESSIONS (personal + public)
========================================================= */
router.get("/", codingController.getCodingSessions);

/* =========================================================
   🟥 RUN CODE (executes inside mock/Judge0/Docker)
========================================================= */
router.post("/:sessionId/run", codingController.runCode);

/* =========================================================
   🟦 SUBMIT CODE (Test Case Evaluation)
========================================================= */
router.post("/:sessionId/submit", codingController.submitCode);

/* =========================================================
   🤖 AI ASSISTANCE (Debugging, Hints, Optimization)
========================================================= */
router.post("/:sessionId/ai-assist", codingController.getAIAssistance);

module.exports = router;
