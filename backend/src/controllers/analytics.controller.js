// ------------------------------------------------------------
// analytics.controller.js — PostgreSQL + Drizzle ORM Version
// ------------------------------------------------------------

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const { analytics } = require("../db/schema/analytics");
const { users } = require("../db/schema/users");
const { quizAttempts } = require("../db/schema/quizAttempts");
const { chats } = require("../db/schema/chats");
const { quizzes } = require("../db/schema/quizzes");

const { eq, and, sql, gte, lte } = require("drizzle-orm");
const AppError = require("../utils/AppError");

// ------------------------------------------------------------
// 1️⃣ Admin AI Usage Summary
// ------------------------------------------------------------
const getAdminAiUsageSummary = async () => {
  try {
    const rows = await db
      .select({
        type: analytics.type,
        count: sql`COUNT(*)`,
      })
      .from(analytics)
      .groupBy(analytics.type);

    const usage = {
      total: 0,
      chatMessages: 0,
      notesGenerated: 0,
      quizAttempts: 0,
    };

    rows.forEach((row) => {
      usage.total += Number(row.count);
      if (row.type === "chat_message") usage.chatMessages = Number(row.count);
      if (row.type === "notes_generated") usage.notesGenerated = Number(row.count);
      if (row.type === "quiz_attempt") usage.quizAttempts = Number(row.count);
    });

    return usage;
  } catch (err) {
    console.error("AI summary failed:", err);
    return { total: 0, chatMessages: 0, notesGenerated: 0, quizAttempts: 0 };
  }
};

// ------------------------------------------------------------
// 2️⃣ Analytics Overview Page
// ------------------------------------------------------------
const getAnalyticsOverview = async (req, res, next) => {
  try {
    // AI Usage Group
    const aiEvents = await db
      .select({
        type: analytics.type,
        count: sql`COUNT(*)`,
      })
      .from(analytics)
      .groupBy(analytics.type);

    // Quiz Attempt Stats
    const quizAgg = await db
      .select({
        totalAttempts: sql`COUNT(*)`,
        avgScore: sql`AVG(percentage)`,
      })
      .from(quizAttempts);

    const totalQuizzes = await db
      .select({ count: sql`COUNT(*)` })
      .from(quizzes);

    res.json({
      success: true,
      data: {
        aiEvents,
        quizStats: {
          totalQuizzes: Number(totalQuizzes[0].count),
          totalAttempts: Number(quizAgg[0].totalAttempts),
          avgScore: Number(quizAgg[0].avgScore || 0),
        },
      },
    });
  } catch (err) {
    console.error("Analytics overview error:", err);
    next(new AppError("Failed to fetch analytics overview", 500));
  }
};

// ------------------------------------------------------------
// 3️⃣ Student Usage Analytics
// ------------------------------------------------------------
const getStudentUsage = async (req, res, next) => {
  try {
    const { studentId, startDate, endDate } = req.query;

    const targetId = studentId || req.user.id;

    // Security Check
    const studentRow = await db
      .select({ college: users.collegeId })
      .from(users)
      .where(eq(users.id, Number(targetId)));

    if (!studentRow.length) {
      return next(new AppError("Student not found", 404));
    }

    if (
      !req.user.roles.includes("SUPER_ADMIN") &&
      studentRow[0].college !== req.user.collegeId
    ) {
      return next(new AppError("Access denied to this student's analytics.", 403));
    }

    let where = [
      eq(analytics.userId, Number(targetId)),
      eq(analytics.collegeId, req.user.collegeId),
    ];

    if (startDate) where.push(gte(analytics.timestamp, new Date(startDate)));
    if (endDate) where.push(lte(analytics.timestamp, new Date(endDate)));

    const logs = await db
      .select()
      .from(analytics)
      .where(and(...where))
      .orderBy(sql`timestamp DESC`);

    const byType = {};

    logs.forEach((a) => {
      if (!byType[a.type]) byType[a.type] = [];
      byType[a.type].push(a);
    });

    res.json({
      success: true,
      data: {
        total: logs.length,
        byType,
        analytics: logs,
      },
    });
  } catch (err) {
    console.error("Student usage error:", err);
    next(new AppError("Failed to fetch student usage", 500));
  }
};

// ------------------------------------------------------------
// 4️⃣ AI Question Types (Topic Frequency)
// ------------------------------------------------------------
const getAIQuestionTypes = async (req, res, next) => {
  try {
    const { startDate, endDate, collegeId } = req.query;
    const targetCollege = req.user.roles.includes("SUPER_ADMIN")
      ? collegeId
      : req.user.collegeId;

    if (!targetCollege) return next(new AppError("College ID required", 400));

    let where = [
      eq(chats.collegeId, targetCollege),
    ];

    if (startDate) where.push(gte(chats.timestamp, new Date(startDate)));
    if (endDate) where.push(lte(chats.timestamp, new Date(endDate)));

    const chatList = await db
      .select()
      .from(chats)
      .where(and(...where));

    const topics = {};
    let totalQuestions = 0;

    chatList.forEach((c) => {
      c.messages?.forEach((m) => {
        if (m.role === "user") {
          totalQuestions++;
          const topic = m.content.substring(0, 50) + "...";
          topics[topic] = (topics[topic] || 0) + 1;
        }
      });
    });

    res.json({
      success: true,
      data: {
        totalQuestions,
        topics,
      },
    });
  } catch (err) {
    console.error("AI question types error:", err);
    next(new AppError("Failed to fetch question analytics", 500));
  }
};

// ------------------------------------------------------------
// 5️⃣ Weak Subject Detection
// ------------------------------------------------------------
const getWeakSubjects = async (req, res, next) => {
  try {
    const { studentId } = req.query;
    const targetId = studentId || req.user.id;

    const attempts = await db
      .select()
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(
        and(
          eq(quizAttempts.studentId, targetId),
          eq(quizAttempts.collegeId, req.user.collegeId),
          eq(quizAttempts.status, "completed")
        )
      );

    const subjects = {};

    attempts.forEach((a) => {
      const subjectId = a.quizzes.subjectId;
      if (!subjects[subjectId]) {
        subjects[subjectId] = { attempts: 0, obtained: 0, total: 0 };
      }
      subjects[subjectId].attempts++;
      subjects[subjectId].obtained += a.quizAttempts.marksObtained;
      subjects[subjectId].total += a.quizAttempts.totalMarks;
    });

    const allSubjects = Object.entries(subjects).map(([id, s]) => ({
      subjectId: id,
      attempts: s.attempts,
      percentage: s.total > 0 ? (s.obtained / s.total) * 100 : 0,
    }));

    const weakSubjects = allSubjects
      .filter((s) => s.percentage < 50)
      .sort((a, b) => a.percentage - b.percentage);

    res.json({
      success: true,
      data: { weakSubjects, allSubjects },
    });
  } catch (err) {
    console.error("Weak subjects error:", err);
    next(new AppError("Failed to fetch weak subjects", 500));
  }
};

// ------------------------------------------------------------
// 6️⃣ Quiz Marks Analytics
// ------------------------------------------------------------
const getQuizMarks = async (req, res, next) => {
  try {
    const { quizId, subjectId, collegeId } = req.query;

    const targetCollege = req.user.roles.includes("SUPER_ADMIN")
      ? collegeId
      : req.user.collegeId;

    let where = [
      eq(quizAttempts.collegeId, targetCollege),
      eq(quizAttempts.status, "completed"),
    ];

    if (quizId) where.push(eq(quizAttempts.quizId, Number(quizId)));

    const rows = await db
      .select()
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .innerJoin(users, eq(quizAttempts.studentId, users.id))
      .where(and(...where));

    let filtered = rows;

    if (subjectId) {
      filtered = rows.filter((r) => r.quizzes.subjectId == subjectId);
    }

    const data = filtered.map((row) => ({
      studentId: row.users.id,
      studentName: row.users.name,
      quizTitle: row.quizzes.title,
      marksObtained: row.quizAttempts.marksObtained,
      totalMarks: row.quizAttempts.totalMarks,
      percentage: row.quizAttempts.percentage,
      cheatingScore: row.quizAttempts.cheatingScore,
    }));

    const stats = {
      totalAttempts: data.length,
      averageMarks:
        data.reduce((sum, a) => sum + a.marksObtained, 0) / (data.length || 1),
      averagePercentage:
        data.reduce((sum, a) => sum + a.percentage, 0) / (data.length || 1),
      highestMarks: data.length ? Math.max(...data.map((d) => d.marksObtained)) : 0,
      lowestMarks: data.length ? Math.min(...data.map((d) => d.marksObtained)) : 0,
      attempts: data,
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    console.error("Quiz marks error:", err);
    next(new AppError("Failed to fetch quiz marks", 500));
  }
};

// ------------------------------------------------------------
// 7️⃣ Time Spent Analytics
// ------------------------------------------------------------
const getTimeSpent = async (req, res, next) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    const targetId = studentId || req.user.id;

    let where = [
      eq(analytics.userId, targetId),
      eq(analytics.collegeId, req.user.collegeId),
      sql`type IN ('content_view','quiz_attempt','chat_message','coding_session')`,
    ];

    if (startDate) where.push(gte(analytics.timestamp, new Date(startDate)));
    if (endDate) where.push(lte(analytics.timestamp, new Date(endDate)));

    const logs = await db.select().from(analytics).where(and(...where));

    const timeByType = {};

    logs.forEach((row) => {
      const dur = row.metadata?.duration || 0;
      timeByType[row.type] = (timeByType[row.type] || 0) + dur;
    });

    res.json({
      success: true,
      data: {
        totalTime: Object.values(timeByType).reduce((s, t) => s + t, 0),
        timeByType,
      },
    });
  } catch (err) {
    console.error("Time spent error:", err);
    next(new AppError("Failed to get time spent", 500));
  }
};

// ------------------------------------------------------------
// 8️⃣ Study Streak (past 30 days)
// ------------------------------------------------------------
const getStudyStreak = async (req, res, next) => {
  try {
    const targetId = req.query.studentId || req.user.id;

    const last30 = new Date(Date.now() - 30 * 24 * 3600 * 1000);

    const logs = await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.userId, targetId),
          eq(analytics.collegeId, req.user.collegeId),
          gte(analytics.timestamp, last30)
        )
      );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const check = new Date(today);
      check.setDate(check.getDate() - i);

      const has = logs.some((l) => {
        const d = new Date(l.timestamp);
        return d.toDateString() === check.toDateString();
      });

      if (has) streak++;
      else if (i > 0) break;
    }

    // fetch usageStats from user table
    const userRow = await db
      .select({
        lastStudyDate: users.lastStudyDate,
        totalLogins: users.totalLogins,
      })
      .from(users)
      .where(eq(users.id, targetId));

    res.json({
      success: true,
      data: {
        streak,
        lastStudyDate: userRow[0]?.lastStudyDate,
        totalLogins: userRow[0]?.totalLogins,
      },
    });
  } catch (err) {
    console.error("Study streak error:", err);
    next(new AppError("Failed to fetch study streak", 500));
  }
};

// ------------------------------------------------------------
// 9️⃣ Difficulty Heatmap
// ------------------------------------------------------------
const getDifficultyHeatmap = async (req, res, next) => {
  try {
    const { subjectId, collegeId } = req.query;
    const targetCollege = req.user.roles.includes("SUPER_ADMIN")
      ? collegeId
      : req.user.collegeId;

    let where = [
      eq(quizAttempts.collegeId, targetCollege),
      eq(quizAttempts.status, "completed"),
    ];

    const attempts = await db
      .select()
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(and(...where));

    let filtered = attempts;
    if (subjectId) {
      filtered = attempts.filter((a) => a.quizzes.subjectId == subjectId);
    }

    const difficultyData = { easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } };

    filtered.forEach((a) => {
      const qList = a.quizzes.questions || [];
      const answers = a.quizAttempts.answers || [];

      qList.forEach((q, index) => {
        const diff = q.difficulty || "medium";
        if (!difficultyData[diff]) return;

        difficultyData[diff].total++;

        if (answers[index]?.isCorrect) difficultyData[diff].correct++;
      });
    });

    const heatmap = Object.entries(difficultyData).map(([level, val]) => ({
      difficulty: level,
      total: val.total,
      correct: val.correct,
      percentage: val.total > 0 ? (val.correct / val.total) * 100 : 0,
    }));

    res.json({ success: true, data: heatmap });
  } catch (err) {
    console.error("Difficulty heatmap error:", err);
    next(new AppError("Failed to fetch heatmap", 500));
  }
};

module.exports = {
  getAdminAiUsageSummary,
  getAnalyticsOverview,
  getStudentUsage,
  getAIQuestionTypes,
  getWeakSubjects,
  getQuizMarks,
  getTimeSpent,
  getStudyStreak,
  getDifficultyHeatmap,
};
