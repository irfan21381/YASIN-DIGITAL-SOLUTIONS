// src/controllers/manager.controller.js

// DB
const { db } = require("../config/database");

const AppError = require("../utils/AppError");
const { chatCompletion } = require("../config/ai");

// DRIZZLE SCHEMAS
const { users } = require("../db/schema/users");
const { analytics } = require("../db/schema/analytics");
const { quizAttempts } = require("../db/schema/quizAttempts");
const { quizzes } = require("../db/schema/quizzes");
const { assignments } = require("../db/schema/assignments");
const { subjects } = require("../db/schema/subjects");

const { eq, and, inArray, desc, sql } = require("drizzle-orm");

/* ============================================================
   🔥 1. GET ACTIVE STUDENTS
============================================================ */
exports.getActiveStudents = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const collegeId = req.user.collegeId;

    const studentFilters = [
      eq(users.collegeId, collegeId),
      sql`${users.roles} @> ARRAY['STUDENT']::text[]`,
    ];

    if (subjectId) {
      studentFilters.push(
        sql`(student_data->'subjects') ? ${subjectId}`
      );
    }

    const studentsRows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        studentData: users.studentData,
        usageStats: users.usageStats,
      })
      .from(users)
      .where(and(...studentFilters));

    if (studentsRows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const studentIds = studentsRows.map((s) => s.id);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const activityRows = await db
      .select({
        userId: analytics.userId,
        timestamp: analytics.timestamp,
      })
      .from(analytics)
      .where(
        and(
          eq(analytics.collegeId, collegeId),
          inArray(analytics.userId, studentIds),
          sql`${analytics.timestamp} >= ${oneDayAgo}`
        )
      );

    const activityMap = new Map();
    activityRows.forEach((a) => {
      if (!activityMap.has(a.userId)) activityMap.set(a.userId, []);
      activityMap.get(a.userId).push(a.timestamp);
    });

    const result = studentsRows.map((s) => {
      const acts = activityMap.get(s.id) || [];
      let lastActivity = s.usageStats?.lastActive || null;

      if (acts.length > 0) {
        acts.sort((a, b) => b - a);
        lastActivity = acts[0];
      }

      return {
        _id: s.id,
        name: s.name,
        email: s.email,
        studentData: s.studentData,
        usageStats: s.usageStats,
        isActive: acts.length > 0,
        activityCount: acts.length,
        lastActivity,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get active students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active students",
    });
  }
};

/* ============================================================
   🔥 2. STUDENT PROGRESS
============================================================ */
exports.getStudentProgress = async (req, res) => {
  try {
    const { studentId, subjectId } = req.query;
    const reqId = Number(studentId);

    if (req.user.activeRole === "STUDENT" && req.user.id !== reqId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const collegeId = req.user.collegeId;

    const attempts = await db
      .select({
        attempt: quizAttempts,
        quiz: quizzes,
      })
      .from(quizAttempts)
      .leftJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(
        and(
          eq(quizAttempts.studentId, reqId),
          eq(quizAttempts.collegeId, collegeId),
          eq(quizAttempts.status, "completed")
        )
      );

    const filtered = subjectId
      ? attempts.filter(
          (a) => String(a.quiz.subjectId) === String(subjectId)
        )
      : attempts;

    const totalQuizzes = filtered.length;
    const avgScore =
      totalQuizzes > 0
        ? filtered.reduce(
            (s, a) => s + (a.attempt.percentage || 0),
            0
          ) / totalQuizzes
        : 0;

    const allAssignments = await db
      .select()
      .from(assignments)
      .where(eq(assignments.collegeId, collegeId));

    let completedAssignments = 0;
    for (const a of allAssignments) {
      const subs = a.submissions || [];
      if (
        subs.some(
          (s) =>
            Number(s.studentId) === reqId &&
            s.status === "submitted"
        )
      ) {
        completedAssignments++;
      }
    }

    res.json({
      success: true,
      data: {
        totalQuizzes,
        averageScore: avgScore,
        completedAssignments,
      },
    });
  } catch (error) {
    console.error("Get student progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
    });
  }
};

/* ============================================================
   🔥 3. AI RECOMMENDATIONS
============================================================ */
exports.getAIRecommendations = async (req, res) => {
  try {
    const studentId = Number(req.query.studentId);
    const collegeId = req.user.collegeId;

    const [student] = await db
      .select()
      .from(users)
      .where(eq(users.id, studentId));

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const analyticsRows = await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.userId, studentId),
          eq(analytics.collegeId, collegeId)
        )
      )
      .orderBy(desc(analytics.timestamp))
      .limit(50);

    const attempts = await db
      .select({
        attempt: quizAttempts,
        quiz: quizzes,
      })
      .from(quizAttempts)
      .leftJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(
        and(
          eq(quizAttempts.studentId, studentId),
          eq(quizAttempts.collegeId, collegeId),
          eq(quizAttempts.status, "completed")
        )
      );

    const avgScore =
      attempts.length > 0
        ? (
            attempts.reduce(
              (s, a) => s + (a.attempt.percentage || 0),
              0
            ) / attempts.length
          ).toFixed(1)
        : 0;

    const prompt = `
Analyze this student's performance.

Student: ${student.name}
Quiz Attempts: ${attempts.length}
Average Score: ${avgScore}%
Activities: ${analyticsRows.length}

Provide:
1. Weak areas
2. Custom study plan
3. Unit-wise tips
4. Motivation
5. Suggested next steps
`;

    const completion = await chatCompletion(
      [
        { role: "system", content: "You are an academic mentor." },
        { role: "user", content: prompt },
      ],
      { temperature: 0.7 }
    );

    res.json({
      success: true,
      data: {
        studentName: student.name,
        recommendations: completion,
      },
    });
  } catch (error) {
    console.error("AI recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI recommendations",
    });
  }
};

/* ============================================================
   🔥 4. CREATE ASSIGNMENT
============================================================ */
exports.createAssignment = async (req, res) => {
  try {
    if (!["TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"].includes(req.user.activeRole)) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const {
      title,
      description,
      subjectId,
      unit,
      dueDate,
      maxMarks,
      assignmentCriteria,
      assignedTo,
    } = req.body;

    if (!title || !subjectId || !dueDate) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const [inserted] = await db
      .insert(assignments)
      .values({
        title,
        description,
        collegeId: req.user.collegeId,
        subjectId: Number(subjectId),
        unit,
        createdBy: req.user.id,
        dueDate: new Date(dueDate),
        maxMarks,
        assignmentCriteria: assignmentCriteria || {},
        assignedTo: assignedTo || [],
        submissions: [],
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json({ success: true, data: inserted });
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create assignment",
    });
  }
};

/* ============================================================
   🔥 5. GET ASSIGNMENTS
============================================================ */
exports.getAssignments = async (req, res) => {
  try {
    const { subjectId, status } = req.query;
    const collegeId = req.user.collegeId;

    const filters = [eq(assignments.collegeId, collegeId)];
    if (subjectId) filters.push(eq(assignments.subjectId, Number(subjectId)));
    if (status) filters.push(eq(assignments.status, status));

    const rows = await db
      .select({
        assignment: assignments,
        subject: subjects,
        creator: users,
      })
      .from(assignments)
      .leftJoin(subjects, eq(assignments.subjectId, subjects.id))
      .leftJoin(users, eq(assignments.createdBy, users.id))
      .where(and(...filters))
      .orderBy(desc(assignments.createdAt));

    let result = rows.map((r) => ({
      ...r.assignment,
      subjectId: r.subject,
      createdBy: r.creator,
    }));

    if (req.user.activeRole === "STUDENT") {
      const userId = req.user.id;
      const year = req.user.studentData?.year;
      const branch = req.user.studentData?.branch;

      result = result.filter((a) => {
        const assignedList = a.assignedTo || [];
        const cri = a.assignmentCriteria || {};

        return (
          assignedList.includes(userId) ||
          cri.year === year ||
          cri.branch === branch
        );
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
    });
  }
};
