// src/controllers/quiz.controller.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const AppError = require("../utils/AppError");

const { quizzes } = require("../db/schema/quizzes");
const { quizAttempts } = require("../db/schema/quizAttempts");
const { users } = require("../db/schema/users");

const { eq, and, desc, inArray } = require("drizzle-orm");

/* ================================================================
   1️⃣ CREATE QUIZ  (Teacher | Manager | SuperAdmin)
================================================================ */
const createQuiz = async (req, res) => {
  try {
    const allowedRoles = ["TEACHER", "COLLEGE_MANAGER", "SUPER_ADMIN"];
    if (!allowedRoles.includes(req.user.activeRole)) {
      return res.status(403).json({
        success: false,
        message: "Only teachers or managers can create quizzes",
      });
    }

    const {
      title,
      description,
      subjectId,
      unit,
      questions,
      settings,
      year,
      branch,
      semester,
      allowedStudents,
    } = req.body;

    if (!title || !subjectId || !questions?.length) {
      return res.status(400).json({
        success: false,
        message: "Title, subjectId, and questions are required",
      });
    }

    const [quiz] = await db
      .insert(quizzes)
      .values({
        title,
        description,
        collegeId: req.user.collegeId,
        subjectId,
        unit,
        createdBy: req.user.id,
        questions,
        settings,
        year,
        branch,
        semester,
        allowedStudents,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create quiz",
    });
  }
};

/* ================================================================
   2️⃣ GET QUIZ ATTEMPTS (Owner | Manager | SuperAdmin)
================================================================ */
const getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, Number(quizId)));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const sameCollege = quiz.collegeId === req.user.collegeId;

    const allowed =
      req.user.id === quiz.createdBy ||
      (req.user.roles.includes("COLLEGE_MANAGER") && sameCollege) ||
      req.user.roles.includes("SUPER_ADMIN");

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const attempts = await db
      .select({
        attempt: quizAttempts,
        student: {
          id: users.id,
          name: users.name,
          email: users.email,
          studentData: users.studentData,
        },
      })
      .from(quizAttempts)
      .leftJoin(users, eq(quizAttempts.studentId, users.id))
      .where(eq(quizAttempts.quizId, Number(quizId)))
      .orderBy(desc(quizAttempts.submittedAt));

    return res.json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error("Get attempts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attempts",
    });
  }
};

/* ================================================================
   3️⃣ UPDATE QUIZ (Owner | Manager | SuperAdmin)
================================================================ */
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, Number(id)));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const sameCollege = quiz.collegeId === req.user.collegeId;

    const allowed =
      quiz.createdBy === req.user.id ||
      (req.user.roles.includes("COLLEGE_MANAGER") && sameCollege) ||
      req.user.roles.includes("SUPER_ADMIN");

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Prevent modifying restricted fields
    const blockedFields = ["id", "createdBy", "collegeId", "status"];
    const updatePayload = {};

    for (const key of Object.keys(req.body)) {
      if (!blockedFields.includes(key)) {
        updatePayload[key] = req.body[key];
      }
    }

    if (Object.keys(updatePayload).length > 0) {
      updatePayload.updatedAt = new Date();
      await db
        .update(quizzes)
        .set(updatePayload)
        .where(eq(quizzes.id, quiz.id));
    }

    const [updated] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quiz.id));

    return res.json({
      success: true,
      message: "Quiz updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update quiz",
    });
  }
};

/* ================================================================
   4️⃣ PUBLISH QUIZ (Owner | Manager | SuperAdmin)
================================================================ */
const publishQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, Number(id)));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const sameCollege = quiz.collegeId === req.user.collegeId;

    const allowed =
      quiz.createdBy === req.user.id ||
      (req.user.roles.includes("COLLEGE_MANAGER") && sameCollege) ||
      req.user.roles.includes("SUPER_ADMIN");

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    await db
      .update(quizzes)
      .set({
        status: "published",
        updatedAt: new Date(),
      })
      .where(eq(quizzes.id, quiz.id));

    const [updated] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quiz.id));

    return res.json({
      success: true,
      message: "Quiz published successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Publish quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to publish quiz",
    });
  }
};

module.exports = {
  createQuiz,
  getQuizAttempts,
  updateQuiz,
  publishQuiz,
};
