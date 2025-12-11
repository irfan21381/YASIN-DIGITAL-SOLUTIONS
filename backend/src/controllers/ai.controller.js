// ------------------------------------------------------------
// ai.controller.js — PostgreSQL + Drizzle Version
// ------------------------------------------------------------

// controllers, services, etc.
const { db } = require("../config/database");

// DRIZZLE Schemas
const { chats } = require("../db/schema/chats");
const { content } = require("../db/schema/content");
const { quizzes } = require("../db/schema/quizzes");
const { analytics } = require("../db/schema/analytics");
const { eq, and, sql, ilike } = require("drizzle-orm");

// RAG system
const { answerDoubt } = require("../services/ai/doubtSolver.service");

// GROQ client
const Groq = require("groq-sdk");
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ------------------------------------------------------------
// GROQ helper
// ------------------------------------------------------------
const askGroq = async (messages, model = "mixtral-8x7b-32768") => {
  try {
    const response = await groq.chat.completions.create({
      model,
      messages,
      max_tokens: 1500,
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("Groq AI Error:", err);
    throw new Error("Groq AI request failed");
  }
};

// ------------------------------------------------------------
// 1️⃣ Send Chat Message (RAG)
// ------------------------------------------------------------
const sendChatMessage = async (req, res) => {
  try {
    const { message, chatId, subjectId, unit } = req.body;
    const studentId = req.user.id;
    const collegeId = req.user.collegeId;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    let chat;

    // Existing chat
    if (chatId) {
      const found = await db
        .select()
        .from(chats)
        .where(and(eq(chats.id, Number(chatId)), eq(chats.studentId, studentId)));

      if (!found.length) {
        return res
          .status(404)
          .json({ success: false, message: "Chat not found" });
      }

      chat = found[0];
    }
    // New chat
    else {
      const inserted = await db
        .insert(chats)
        .values({
          studentId,
          collegeId,
          subjectId,
          unit: Number(unit),
          title: message.substring(0, 50),
          messages: [],
          contextContentIds: [],
        })
        .returning();

      chat = inserted[0];
    }

    // Add user message
    const updatedMessages = [
      ...(chat.messages || []),
      { role: "user", content: message },
    ];

    // RAG pipeline
    const rag = await answerDoubt(message, studentId, collegeId, subjectId, unit);

    const aiAnswer = rag.answer || "I couldn't find the answer right now.";
    const sources = Array.isArray(rag.sources) ? rag.sources : [];

    const updatedAI = [
      ...updatedMessages,
      {
        role: "assistant",
        content: aiAnswer,
        sources,
      },
    ];

    // Context IDs
    const newIds = sources.map((s) => s.contentId).filter(Boolean);
    const finalContextIds = Array.from(
      new Set([...(chat.contextContentIds || []), ...newIds])
    );

    // Save back to DB
    await db
      .update(chats)
      .set({
        messages: updatedAI,
        contextContentIds: finalContextIds,
        updatedAt: new Date(),
      })
      .where(eq(chats.id, chat.id));

    // Analytics
    await db.insert(analytics).values({
      userId: studentId,
      collegeId,
      type: "chat_message",
      metadata: {
        subjectId,
        unit,
        topic: message.substring(0, 50),
      },
    });

    res.json({
      success: true,
      data: {
        chatId: chat.id,
        answer: aiAnswer,
        sources,
        confidence: rag.confidence || null,
        messages: updatedAI,
      },
    });
  } catch (err) {
    console.error("SendChat Error:", err);
    res.status(500).json({
      success: false,
      message: "AI assistant failed",
    });
  }
};

// ------------------------------------------------------------
// 2️⃣ Chat History
// ------------------------------------------------------------
const getChatHistory = async (req, res) => {
  try {
    const { subjectId, unit, page = 1, limit = 20 } = req.query;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where = [
      eq(chats.studentId, req.user.id),
      eq(chats.collegeId, req.user.collegeId),
    ];

    if (subjectId) where.push(eq(chats.subjectId, subjectId));
    if (unit) where.push(eq(chats.unit, Number(unit)));

    const list = await db
      .select()
      .from(chats)
      .where(and(...where))
      .orderBy(sql`updated_at DESC`)
      .limit(take)
      .offset(skip);

    const total = await db
      .select({ count: sql`COUNT(*)` })
      .from(chats)
      .where(and(...where));

    res.json({
      success: true,
      data: list,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total[0].count),
        pages: Math.ceil(Number(total[0].count) / Number(limit)),
      },
    });
  } catch (err) {
    console.error("ChatHistory Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
    });
  }
};

// ------------------------------------------------------------
// 3️⃣ Generate Quiz (Groq + PG)
// ------------------------------------------------------------
const generateQuiz = async (req, res) => {
  try {
    const { subjectId, unit, difficulty, numberOfQuestions, quizTitle } =
      req.body;

    const rows = await db
      .select()
      .from(content)
      .where(
        and(
          eq(content.collegeId, req.user.collegeId),
          eq(content.subjectId, subjectId),
          eq(content.unit, Number(unit)),
          eq(content.isEmbedded, true)
        )
      );

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "No content available for quiz.",
      });
    }

    const context = rows
      .map((c) => c.extractedText || c.description || c.title)
      .join("\n\n")
      .slice(0, 8000);

    const prompt = `
      Generate ${numberOfQuestions} ${difficulty} MCQs.
      Response MUST be a valid JSON array.
      No text outside JSON.

      Content:
      ${context}
    `;

    const raw = await askGroq(
      [
        { role: "system", content: "Return ONLY a pure JSON array of MCQs." },
        { role: "user", content: prompt },
      ],
      "mixtral-8x7b-32768"
    );

    let questions = [];
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      questions = JSON.parse(match ? match[0] : raw);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid quiz data",
      });
    }

    const quiz = await db
      .insert(quizzes)
      .values({
        title: quizTitle || `Quiz - Unit ${unit}`,
        collegeId: req.user.collegeId,
        subjectId,
        unit: Number(unit),
        createdBy: req.user.id,
        questions,
        attemptCount: 0,
        avgScore: 0,
        status: "draft",
      })
      .returning();

    res.json({
      success: true,
      message: "Quiz generated",
      data: quiz[0],
    });
  } catch (err) {
    console.error("Quiz Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate quiz",
    });
  }
};

// ------------------------------------------------------------
// 4️⃣ Generate Notes
// ------------------------------------------------------------
const generateNotes = async (req, res) => {
  try {
    const { subjectId, unit, noteType } = req.body;

    const rows = await db
      .select()
      .from(content)
      .where(
        and(
          eq(content.collegeId, req.user.collegeId),
          eq(content.subjectId, subjectId),
          eq(content.unit, Number(unit)),
          eq(content.isEmbedded, true)
        )
      );

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "No content found.",
      });
    }

    const context = rows
      .map((c) => c.extractedText || c.description || c.title)
      .join("\n\n")
      .slice(0, 8000);

    const prompt = `
      Generate ${noteType} academic notes.
      Use headings, bullets, examples.
      Content:
      ${context}
    `;

    const notes = await askGroq(
      [
        {
          role: "system",
          content: "You create structured academic notes.",
        },
        { role: "user", content: prompt },
      ],
      "mixtral-8x7b-32768"
    );

    await db.insert(analytics).values({
      userId: req.user.id,
      collegeId: req.user.collegeId,
      type: "notes_generated",
      metadata: { subjectId, unit, noteType },
    });

    res.json({
      success: true,
      data: { notes },
    });
  } catch (err) {
    console.error("Notes Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate notes",
    });
  }
};

// ------------------------------------------------------------
// 5️⃣ AI Mentor (Personalized Feedback)
// ------------------------------------------------------------
const getAIMentor = async (req, res) => {
  try {
    const studentId = req.user.id;

    const logs = await db
      .select()
      .from(analytics)
      .where(eq(analytics.userId, studentId))
      .orderBy(sql`timestamp DESC`)
      .limit(50);

    const topicCount = {};

    logs.forEach((a) => {
      if (a.metadata?.topic) {
        topicCount[a.metadata.topic] =
          (topicCount[a.metadata.topic] || 0) + 1;
      }
    });

    const weakTopics = Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((t) => t[0]);

    const prompt = `
      Student Weak Topics: ${weakTopics.join(", ")}

      Provide a study plan including:
      - Weak topic analysis
      - Unit-wise revision strategy
      - Exam prep roadmap
      - Improvement recommendations
    `;

    const guidance = await askGroq([
      { role: "system", content: "You are an AI Academic Mentor." },
      { role: "user", content: prompt },
    ]);

    res.json({
      success: true,
      data: {
        recommendations: guidance,
        weakTopics,
      },
    });
  } catch (err) {
    console.error("AI Mentor Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load AI mentor",
    });
  }
};

module.exports = {
  sendChatMessage,
  getChatHistory,
  generateQuiz,
  generateNotes,
  getAIMentor,
};
