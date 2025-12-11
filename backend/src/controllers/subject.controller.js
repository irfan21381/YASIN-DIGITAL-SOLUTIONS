// src/controllers/subject.controller.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const AppError = require("../utils/AppError");

const { subjects } = require("../db/schema/subjects");
const { users } = require("../db/schema/users");

const { eq, and } = require("drizzle-orm");

/* ====================================================================
   🟦 1. GET ALL SUBJECTS (Filtered + College Based)
===================================================================== */
const getSubjects = async (req, res) => {
  try {
    const { year, branch, semester } = req.query;

    const filters = [eq(subjects.collegeId, req.user.collegeId)];

    if (year) filters.push(eq(subjects.year, Number(year)));
    if (branch) filters.push(eq(subjects.branch, branch));
    if (semester) filters.push(eq(subjects.semester, Number(semester)));

    const subjectRows = await db
      .select({
        subject: subjects,
        teacher: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(subjects)
      .leftJoin(users, eq(subjects.teacherId, users.id))
      .where(and(...filters))
      .orderBy(subjects.year, subjects.semester);

    return res.json({ success: true, data: subjectRows });
  } catch (error) {
    console.error("Get subjects error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
    });
  }
};

/* ====================================================================
   🟦 2. CREATE SUBJECT (Managers / Super Admin Only)
===================================================================== */
const createSubject = async (req, res) => {
  try {
    const isManager = req.user.roles.includes("COLLEGE_MANAGER");
    const isAdmin = req.user.roles.includes("SUPER_ADMIN");

    if (!isManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only managers or admins can create subjects",
      });
    }

    const {
      name,
      code,
      year,
      branch,
      semester,
      teacherId,
      units,
      credits,
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and Code are required",
      });
    }

    // Prevent duplicate subject code in same college
    const existing = await db
      .select()
      .from(subjects)
      .where(
        and(
          eq(subjects.collegeId, req.user.collegeId),
          eq(subjects.code, code.toUpperCase())
        )
      );

    if (existing.length) {
      return res.status(400).json({
        success: false,
        message: "Subject code already exists in this college",
      });
    }

    // Validate teacher belongs to same college
    if (teacherId) {
      const [teacher] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, Number(teacherId)),
            eq(users.collegeId, req.user.collegeId),
            sql`roles @> '["TEACHER"]'::jsonb`
          )
        );

      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: "Invalid teacher ID or teacher not in this college",
        });
      }
    }

    const [subject] = await db
      .insert(subjects)
      .values({
        name,
        code: code.toUpperCase(),
        collegeId: req.user.collegeId,
        year: Number(year),
        branch,
        semester: Number(semester),
        teacherId: teacherId ? Number(teacherId) : null,
        units,
        credits,
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Create subject error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create subject",
    });
  }
};

/* ====================================================================
   🟦 3. UPDATE SUBJECT (Teacher / Manager / Admin)
===================================================================== */
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const [subject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, Number(id)));

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    const sameCollege = subject.collegeId === req.user.collegeId;

    const isTeacher = req.user.roles.includes("TEACHER");
    const isManager = req.user.roles.includes("COLLEGE_MANAGER");
    const isAdmin = req.user.roles.includes("SUPER_ADMIN");

    const teacherOwnsSubject =
      isTeacher && subject.teacherId === req.user.id;

    const allowed =
      teacherOwnsSubject || (isManager && sameCollege) || isAdmin;

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to update subject",
      });
    }

    // Validate teacher if changed
    if (req.body.teacherId) {
      const [teacher] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, Number(req.body.teacherId)),
            eq(users.collegeId, req.user.collegeId),
            sql`roles @> '["TEACHER"]'::jsonb`
          )
        );

      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: "Invalid teacher ID",
        });
      }
    }

    // Allowed update fields only
    const allowedFields = [
      "name",
      "year",
      "branch",
      "semester",
      "teacherId",
      "units",
      "credits",
    ];

    const updatePayload = {};
    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined) {
        updatePayload[key] = req.body[key];
      }
    });

    if (Object.keys(updatePayload).length > 0) {
      updatePayload.updatedAt = new Date();
      await db
        .update(subjects)
        .set(updatePayload)
        .where(eq(subjects.id, subject.id));
    }

    const [updated] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, subject.id));

    return res.json({
      success: true,
      message: "Subject updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update subject error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update subject",
    });
  }
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
};
