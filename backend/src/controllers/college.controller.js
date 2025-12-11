// src/controllers/college.controller.js

const AppError = require("../utils/AppError");
// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"


const { colleges } = require("../db/schema/colleges");
const { users } = require("../db/schema/users");
const { subjects } = require("../db/schema/subjects");
const { content } = require("../db/schema/content");

const { eq, and, sql } = require("drizzle-orm");

/* ====================================================================
   🔧 UTILITY: Update Manager Role + Link to College
   ==================================================================== */
/**
 * Ensures a user has the COLLEGE_MANAGER role and is linked to the specified collegeId.
 * @param {number} managerId - user.id of the manager
 * @param {number} collegeId - colleges.id to link
 */
const updateManagerLink = async (managerId, collegeId) => {
  // 1. Load user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(managerId)));

  if (!user) {
    throw new AppError("Manager user not found during link update", 404);
  }

  const roles = Array.isArray(user.roles) ? [...user.roles] : [];
  if (!roles.includes("COLLEGE_MANAGER")) {
    roles.push("COLLEGE_MANAGER");
  }

  await db
    .update(users)
    .set({
      collegeId: collegeId,
      roles,
      activeRole: "COLLEGE_MANAGER",
    })
    .where(eq(users.id, user.id));
};

/* ====================================================================
   🔥 1. GET ALL COLLEGES (Super Admin → all | Others → own college)
   ==================================================================== */
const getColleges = async (req, res, next) => {
  try {
    const isSuper = req.user.roles?.includes("SUPER_ADMIN");

    let where;
    if (!isSuper) {
      if (!req.user.collegeId) {
        return res.json({ success: true, data: [] });
      }
      where = eq(colleges.id, req.user.collegeId);
    }

    const rows = await db
      .select({
        college: colleges,
        manager: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(colleges)
      .leftJoin(users, eq(colleges.managerId, users.id))
      .where(where);

    const result = rows.map((row) => ({
      ...row.college,
      managerId: row.manager?.id || null,
      manager: row.manager?.id
        ? { id: row.manager.id, name: row.manager.name, email: row.manager.email }
        : null,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get colleges error:", error);
    next(new AppError("Failed to fetch colleges", 500));
  }
};

/* ====================================================================
   🔥 2. GET COLLEGE BY ID (Access Restricted)
   ==================================================================== */
const getCollegeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [row] = await db
      .select({
        college: colleges,
        manager: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(colleges)
      .leftJoin(users, eq(colleges.managerId, users.id))
      .where(eq(colleges.id, Number(id)));

    if (!row) {
      return next(new AppError("College not found", 404));
    }

    const college = {
      ...row.college,
      manager: row.manager?.id
        ? { id: row.manager.id, name: row.manager.name, email: row.manager.email }
        : null,
    };

    const isSuper = req.user.roles?.includes("SUPER_ADMIN");
    const sameCollege = req.user.collegeId === college.id;

    if (!isSuper && !sameCollege) {
      return next(new AppError("Access denied: Not your college", 403));
    }

    res.json({ success: true, data: college });
  } catch (error) {
    console.error("Get college error:", error);
    next(new AppError("Failed to fetch college", 500));
  }
};

/* ====================================================================
   🔥 3. CREATE COLLEGE (Super Admin Only)
   ==================================================================== */
const createCollege = async (req, res, next) => {
  try {
    const { name, code, address, contact, managerId, settings } = req.body;

    if (!name || !code) {
      return next(new AppError("Name and code are required", 400));
    }

    const upperCode = String(code).toUpperCase();

    // Duplicate code check
    const existing = await db
      .select()
      .from(colleges)
      .where(eq(colleges.code, upperCode));

    if (existing.length) {
      return next(new AppError("College code already exists", 400));
    }

    // Validate manager existence
    if (managerId) {
      const [manager] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, Number(managerId)));

      if (!manager) {
        return next(new AppError("Invalid manager ID provided", 400));
      }
    }

    const [college] = await db
      .insert(colleges)
      .values({
        name,
        code: upperCode,
        address: address || null,
        contact: contact || null,
        managerId: managerId ? Number(managerId) : null,
        settings: settings || null,
      })
      .returning();

    if (managerId) {
      await updateManagerLink(Number(managerId), college.id);
    }

    const [row] = await db
      .select({
        college: colleges,
        manager: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(colleges)
      .leftJoin(users, eq(colleges.managerId, users.id))
      .where(eq(colleges.id, college.id));

    const createdCollege = {
      ...row.college,
      manager: row.manager?.id
        ? { id: row.manager.id, name: row.manager.name, email: row.manager.email }
        : null,
    };

    res.status(201).json({
      success: true,
      message: "College created successfully",
      data: createdCollege,
    });
  } catch (error) {
    console.error("Create college error:", error);
    next(new AppError(error.message || "Failed to create college", 500));
  }
};

/* ====================================================================
   🔥 4. UPDATE COLLEGE (Super Admin + Assigned Manager)
   ==================================================================== */
const updateCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [college] = await db
      .select()
      .from(colleges)
      .where(eq(colleges.id, Number(id)));

    if (!college) {
      return next(new AppError("College not found", 404));
    }

    const isSuperAdmin = req.user.roles?.includes("SUPER_ADMIN");
    const isManager =
      req.user.roles?.includes("COLLEGE_MANAGER") &&
      college.managerId === req.user.id;

    if (!isSuperAdmin && !isManager) {
      return next(
        new AppError("Insufficient permissions to update this college", 403)
      );
    }

    const oldManagerId = college.managerId;
    const newManagerId = updates.managerId != null ? Number(updates.managerId) : null;

    if (newManagerId !== oldManagerId) {
      // Unset old manager's college link
      if (oldManagerId) {
        await db
          .update(users)
          .set({ collegeId: null })
          .where(eq(users.id, oldManagerId));
      }

      // Assign new manager and ensure role
      if (newManagerId) {
        await updateManagerLink(newManagerId, college.id);
      }
    }

    const allowedFields = ["name", "address", "contact", "settings", "managerId", "code"];

    const updatedPayload = {};

    for (const key of Object.keys(updates)) {
      if (!allowedFields.includes(key)) continue;

      if (key === "code" && updates[key]) {
        updatedPayload.code = String(updates[key]).toUpperCase();
      } else if (key === "managerId") {
        updatedPayload.managerId = updates[key] ? Number(updates[key]) : null;
      } else {
        updatedPayload[key] = updates[key];
      }
    }

    if (Object.keys(updatedPayload).length) {
      updatedPayload.updatedAt = new Date();
      await db
        .update(colleges)
        .set(updatedPayload)
        .where(eq(colleges.id, college.id));
    }

    const [row] = await db
      .select({
        college: colleges,
        manager: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(colleges)
      .leftJoin(users, eq(colleges.managerId, users.id))
      .where(eq(colleges.id, college.id));

    const updatedCollege = {
      ...row.college,
      manager: row.manager?.id
        ? { id: row.manager.id, name: row.manager.name, email: row.manager.email }
        : null,
    };

    res.json({
      success: true,
      message: "College updated successfully",
      data: updatedCollege,
    });
  } catch (error) {
    console.error("Update college error:", error);
    next(new AppError(error.message || "Failed to update college", 500));
  }
};

/* ====================================================================
   🔥 5. DELETE COLLEGE (Super Admin Only)
   ==================================================================== */
const deleteCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collegeId = Number(id);

    const [deleted] = await db
      .delete(colleges)
      .where(eq(colleges.id, collegeId))
      .returning();

    if (!deleted) {
      return next(new AppError("College not found", 404));
    }

    // 1. Remove collegeId from all users
    await db
      .update(users)
      .set({ collegeId: null })
      .where(eq(users.collegeId, collegeId));

    // 2. Delete related subjects & content
    await db.delete(subjects).where(eq(subjects.collegeId, collegeId));
    await db.delete(content).where(eq(content.collegeId, collegeId));
    // (You can also delete quizzes / analytics here if you want strict isolation)

    res.status(200).json({
      success: true,
      message: "College and associated data deleted successfully.",
    });
  } catch (error) {
    console.error("Delete college error:", error);
    next(
      new AppError(
        error.message || "Failed to delete college and associated data",
        500
      )
    );
  }
};

/* ====================================================================
   🔥 6. COLLEGE STATISTICS (Students, Teachers, Subjects, Content)
   ==================================================================== */
const getCollegeStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collegeId = id ? Number(id) : req.user.collegeId;

    if (
      id &&
      !req.user.roles.includes("SUPER_ADMIN") &&
      req.user.collegeId !== collegeId
    ) {
      return next(
        new AppError("Access denied to view stats for this college", 403)
      );
    }

    const [studentCountRow, teacherCountRow, subjectCountRow, contentCountRow] =
      await Promise.all([
        db
          .select({ count: sql`COUNT(*)` })
          .from(users)
          .where(
            and(
              eq(users.collegeId, collegeId),
              sql`roles @> '["STUDENT"]'::jsonb`
            )
          ),
        db
          .select({ count: sql`COUNT(*)` })
          .from(users)
          .where(
            and(
              eq(users.collegeId, collegeId),
              sql`roles @> '["TEACHER"]'::jsonb`
            )
          ),
        db
          .select({ count: sql`COUNT(*)` })
          .from(subjects)
          .where(eq(subjects.collegeId, collegeId)),
        db
          .select({ count: sql`COUNT(*)` })
          .from(content)
          .where(eq(content.collegeId, collegeId)),
      ]);

    const students = Number(studentCountRow[0].count);
    const teachers = Number(teacherCountRow[0].count);
    const subjectsCount = Number(subjectCountRow[0].count);
    const contentCount = Number(contentCountRow[0].count);

    res.json({
      success: true,
      data: {
        students,
        teachers,
        subjects: subjectsCount,
        content: contentCount,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    next(new AppError("Failed to fetch statistics", 500));
  }
};

module.exports = {
  getColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  getCollegeStats,
};
