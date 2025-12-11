// src/controllers/codingSession.controller.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"
const AppError = require("../utils/AppError");
const { chatCompletion } = require("../config/ai");

const { codingSessions } = require("../db/schema/codingSessions");
const { analytics } = require("../db/schema/analytics");

const { eq, and, or, desc, sql } = require("drizzle-orm");

/* ====================================================================
   ⚙️ 1. MOCK COMPILER (Integrate Judge0 / Docker Sandbox Here)
   ==================================================================== */
const executeCode = async (code, language, input) => {
  // TODO: Replace with actual compiler integration (Judge0, Docker, etc.)
  return {
    output: "Mock output - integrate with real compiler",
    error: null,
    executionTime: 100,
    memoryUsed: 1024,
  };
};

/* ====================================================================
   🟩 2. CREATE CODING SESSION
   ==================================================================== */
const createCodingSession = async (req, res) => {
  try {
    const { title, problem, language } = req.body;

    if (!title || !problem) {
      return res.status(400).json({
        success: false,
        message: "Title and problem are required",
      });
    }

    const [session] = await db
      .insert(codingSessions)
      .values({
        userId: req.user.id,
        collegeId: req.user.collegeId,
        title,
        problem, // stored as JSONB
        language: language || "python",
        currentCode: problem?.template || "",
        submissions: [],
        aiAssistance: [],
      })
      .returning();

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Create coding session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coding session",
    });
  }
};

/* ====================================================================
   🟨 3. GET CODING SESSIONS
   ==================================================================== */
const getCodingSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Number(page) || 1;
    const perPage = Number(limit) || 20;
    const offset = (pageNum - 1) * perPage;

    // (userId = me) OR (isPublic = true AND same college)
    const where = or(
      eq(codingSessions.userId, req.user.id),
      and(
        eq(codingSessions.isPublic, true),
        eq(codingSessions.collegeId, req.user.collegeId)
      )
    );

    const sessions = await db
      .select()
      .from(codingSessions)
      .where(where)
      .orderBy(desc(codingSessions.updatedAt))
      .limit(perPage)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql`COUNT(*)` })
      .from(codingSessions)
      .where(where);

    const total = Number(count);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: pageNum,
        limit: perPage,
        total,
        pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Get coding sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coding sessions",
    });
  }
};

/* ====================================================================
   🟦 4. RUN CODE
   ==================================================================== */
const runCode = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { code, input } = req.body;

    const [session] = await db
      .select()
      .from(codingSessions)
      .where(eq(codingSessions.id, Number(sessionId)));

    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Session not found or unauthorized",
      });
    }

    // Run mock compiler
    const result = await executeCode(code, session.language, input);

    const submissions = Array.isArray(session.submissions)
      ? [...session.submissions]
      : [];

    submissions.push({
      code,
      language: session.language,
      input,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      status: result.error ? "error" : "success",
      testCases: [],
      aiFeedback: null,
      timestamp: new Date(),
    });

    await db
      .update(codingSessions)
      .set({
        submissions,
        currentCode: code,
        updatedAt: new Date(),
      })
      .where(eq(codingSessions.id, session.id));

    // Log analytics
    await db.insert(analytics).values({
      userId: req.user.id,
      collegeId: req.user.collegeId,
      type: "coding_session",
      metadata: {
        language: session.language,
        executionTime: result.executionTime,
      },
      timestamp: new Date(),
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Run code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to run code",
    });
  }
};

/* ====================================================================
   🟥 5. SUBMIT CODE WITH TEST CASES
   ==================================================================== */
const submitCode = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { code } = req.body;

    const [session] = await db
      .select()
      .from(codingSessions)
      .where(eq(codingSessions.id, Number(sessionId)));

    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Session not found or unauthorized",
      });
    }

    const problem = session.problem || {};
    const testCases = problem.testCases || [];

    if (!testCases.length) {
      return res.status(400).json({
        success: false,
        message: "No test cases available",
      });
    }

    const testResults = [];
    let allPassed = true;

    for (const tc of testCases) {
      const result = await executeCode(code, session.language, tc.input);

      const actual = result.output?.trim();
      const expected = tc.expectedOutput?.trim();

      const passed = !result.error && actual === expected;

      testResults.push({
        input: tc.input,
        expectedOutput: expected,
        actualOutput: actual,
        passed,
      });

      if (!passed) allPassed = false;
    }

    const submissions = Array.isArray(session.submissions)
      ? [...session.submissions]
      : [];

    submissions.push({
      code,
      language: session.language,
      testCases: testResults,
      status: allPassed ? "success" : "failed",
      timestamp: new Date(),
    });

    await db
      .update(codingSessions)
      .set({
        submissions,
        currentCode: code,
        updatedAt: new Date(),
      })
      .where(eq(codingSessions.id, session.id));

    res.json({
      success: true,
      data: {
        allPassed,
        testResults,
      },
    });
  } catch (error) {
    console.error("Submit code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit code",
    });
  }
};

/* ====================================================================
   🤖 6. AI CODING ASSISTANCE
   ==================================================================== */
const getAIAssistance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { prompt } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prompt required",
      });
    }

    const [session] = await db
      .select()
      .from(codingSessions)
      .where(eq(codingSessions.id, Number(sessionId)));

    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Session not found or unauthorized",
      });
    }

    const messages = [
      {
        role: "system",
        content: `You are an expert AI coding assistant.
Help students understand logic, debug errors, and improve their ${session.language} code.
Return clean explanations + code examples.`,
      },
      {
        role: "user",
        content: `
Problem:
${session.problem?.description || "No description"}

Current Code:
${session.currentCode || ""}

Question:
${prompt}
        `,
      },
    ];

    const response = await chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 1000,
    });

    const aiAssistance = Array.isArray(session.aiAssistance)
      ? [...session.aiAssistance]
      : [];

    aiAssistance.push({
      prompt,
      response,
      agentType: "explain",
      tokensUsed: null,
      model: "groq-mixtral", // or set dynamically
      timestamp: new Date(),
    });

    await db
      .update(codingSessions)
      .set({
        aiAssistance,
        updatedAt: new Date(),
      })
      .where(eq(codingSessions.id, session.id));

    res.json({
      success: true,
      data: { response },
    });
  } catch (error) {
    console.error("AI assistance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI assistance",
    });
  }
};

module.exports = {
  createCodingSession,
  getCodingSessions,
  runCode,
  submitCode,
  getAIAssistance,
};
