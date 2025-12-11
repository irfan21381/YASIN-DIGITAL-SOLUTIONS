// src/controllers/quizStudent.controller.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"
const AppError = require("../utils/AppError");

const { quizzes } = require("../db/schema/quizzes");
const { quizAttempts } = require("../db/schema/quizAttempts");
const { subjects } = require("../db/schema/subjects");
const { users } = require("../db/schema/users");
const { analytics } = require("../db/schema/analytics");

const { eq, and, inArray, desc, sql } = require("drizzle-orm");

/* =====================================================================
   🟦 1. GET ALL QUIZZES (Role-based)
===================================================================== */
const getQuizzes = async (req, res) => {
  try {
    const { subjectId, status, page = 1, limit = 20 } = req.query;

    const filters = [eq(quizzes.collegeId, req.user.collegeId)];

    if (subjectId) filters.push(eq(quizzes.subjectId, Number(subjectId)));
    if (status) filters.push(eq(quizzes.status, status));

    // Students see only published quizzes, and only those matching their year/branch or assigned to them
    if (req.user.roles.includes("STUDENT")) {
      filters.push(eq(quizzes.status, "published"));

      // You can add further filtering by year/branch/allowedStudents here in application logic
    }

    const offset = (Number(page) - 1) * Number(limit);

    const quizRows = await db
      .select({
        quiz: quizzes,
        subject: {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
        },
        createdBy: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(quizzes)
      .leftJoin(subjects, eq(quizzes.subjectId, subjects.id))
      .leftJoin(users, eq(quizzes.createdBy, users.id))
      .where(and(...filters))
      .orderBy(desc(quizzes.createdAt))
      .limit(Number(limit))
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql`COUNT(*)` })
      .from(quizzes)
      .where(and(...filters));

    const total = Number(count);

    return res.json({
      success: true,
      data: quizRows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get quizzes error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
    });
  }
};

/* =====================================================================
   🟦 2. GET QUIZ BY ID (Student Shuffle Included)
===================================================================== */
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const [quizRow] = await db
      .select({
        quiz: quizzes,
        subject: {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
        },
        createdBy: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(quizzes)
      .leftJoin(subjects, eq(quizzes.subjectId, subjects.id))
      .leftJoin(users, eq(quizzes.createdBy, users.id))
      .where(eq(quizzes.id, Number(id)));

    if (!quizRow) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Only same college or super-admin
    if (
      quizRow.quiz.collegeId !== req.user.collegeId &&
      !req.user.roles.includes("SUPER_ADMIN")
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    let qList = [...quizRow.quiz.questions];

    // Student shuffle logic
    if (req.user.roles.includes("STUDENT")) {
      if (quizRow.quiz.settings?.shuffleQuestions) {
        qList = qList.sort(() => Math.random() - 0.5);
      }

      if (quizRow.quiz.settings?.shuffleOptions) {
        qList = qList.map((q) => {
          if (q.type === "mcq" && q.options) {
            return {
              ...q,
              options: [...q.options].sort(() => Math.random() - 0.5),
            };
          }
          return q;
        });
      }
    }

    const quiz = {
      ...quizRow.quiz,
      questions: qList,
      subject: quizRow.subject,
      createdBy: quizRow.createdBy,
    };

    return res.json({ success: true, data: quiz });
  } catch (error) {
    console.error("Get quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz",
    });
  }
};

/* =====================================================================
   🟦 3. START QUIZ ATTEMPT
===================================================================== */
const startQuizAttempt = async (req, res) => {
  try {
    const { id } = req.params;

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, Number(id)));

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Prevent multiple attempts
    const [existing] = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.quizId, Number(id)),
          eq(quizAttempts.studentId, req.user.id),
          inArray(quizAttempts.status, ["in_progress", "completed", "disqualified"])
        )
      );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already attempted this quiz",
      });
    }

    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        quizId: Number(id),
        studentId: req.user.id,
        collegeId: req.user.collegeId,
        startedAt: new Date(),
        status: "in_progress",
        deviceInfo: {
          userAgent: req.headers["user-agent"],
          platform: req.headers["platform"] || "unknown",
        },
        ipAddress: req.ip,
      })
      .returning();

    return res.json({ success: true, data: attempt });
  } catch (error) {
    console.error("Start attempt error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start quiz",
    });
  }
};

/* =====================================================================
   🟥  SAFE ANSWER CHECKER
===================================================================== */
const isAnswerCorrect = (userAnswer, correctAnswer) => {
  if (correctAnswer === null || correctAnswer === undefined) return false;

  // MCQ (string compare)
  if (typeof correctAnswer === "string") {
    return userAnswer === correctAnswer;
  }

  // Multi-select (array)
  if (Array.isArray(correctAnswer)) {
    if (!Array.isArray(userAnswer)) return false;
    return (
      userAnswer.length === correctAnswer.length &&
      userAnswer.every((v) => correctAnswer.includes(v))
    );
  }

  // Object structured answers
  if (typeof correctAnswer === "object") {
    return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
  }

  return false;
};

/* =====================================================================
   🟦 4. SUBMIT QUIZ ATTEMPT (Cheating Analytics Included)
===================================================================== */
const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers = [], cheatingEvents = [] } = req.body;

    const [attempt] = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, Number(attemptId)));

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }

    if (attempt.studentId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (["completed", "disqualified"].includes(attempt.status)) {
      return res.status(400).json({
        success: false,
        message: "Quiz already submitted",
      });
    }

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, attempt.quizId));

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    let obtained = 0;
    let totalMarks = 0;

    const processed = quiz.questions.map((q, index) => {
      const userAns = answers[index]?.answer ?? answers[index];
      const correct = q.correctAnswer;

      const isCorrect = isAnswerCorrect(userAns, correct);
      const marks = isCorrect ? q.marks || 1 : 0;

      obtained += marks;
      totalMarks += q.marks || 1;

      return {
        questionId: q._id,
        answer: userAns,
        isCorrect,
        marksObtained: marks,
      };
    });

    // Cheating Score
    const cheatingScore = Math.min(100, cheatingEvents.length * 12);

    await db
      .update(quizAttempts)
      .set({
        answers: processed,
        cheatingScore,
        cheatingEvents,
        totalMarks,
        marksObtained: obtained,
        percentage: (obtained / totalMarks) * 100,
        submittedAt: new Date(),
        timeSpent: Math.floor((new Date() - attempt.startedAt) / 1000),
        status: cheatingScore > 50 ? "disqualified" : "completed",
      })
      .where(eq(quizAttempts.id, Number(attemptId)));

    // Analytics logging
    await db.insert(analytics).values({
      userId: req.user.id,
      collegeId: req.user.collegeId,
      type: "quiz_attempt",
      metadata: {
        quizId: quiz.id,
        subjectId: quiz.subjectId,
        marksObtained: obtained,
        totalMarks: totalMarks,
        percentage: (obtained / totalMarks) * 100,
        cheatingScore,
      },
      timestamp: new Date(),
    });

    return res.json({
      success: true,
      message: "Quiz submitted successfully",
      data: attempt,
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
    });
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  startQuizAttempt,
  submitQuizAttempt,
};
