// src/controllers/course.controller.js

const AppError = require("../utils/AppError");
// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"


const { courses } = require("../db/schema/courses");
const { users } = require("../db/schema/users");

const { eq, ilike, desc, and } = require("drizzle-orm");

/* =====================================================================
   📚 GET ALL COURSES (With optional search)
===================================================================== */
const getAllCourses = async (req, res, next) => {
  try {
    let filters = [];

    // Search filter
    if (req.query.search) {
      filters.push(ilike(courses.title, `%${req.query.search}%`));
    }

    const rows = await db
      .select({
        course: courses,
        createdBy: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(courses)
      .leftJoin(users, eq(courses.createdBy, users.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(courses.createdAt));

    const formatted = rows.map((row) => ({
      ...row.course,
      createdBy: row.createdBy,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Fetch courses error:", error);
    next(new AppError("Failed to fetch courses", 500));
  }
};

/* =====================================================================
   ➕ CREATE COURSE (Role + Permission Check)
===================================================================== */
const createCourse = async (req, res, next) => {
  try {
    const { title, code, description, thumbnailUrl } = req.body;

    if (!title || !code) {
      return next(new AppError("Course title and code are required", 400));
    }

    // Permission check
    const isSuperAdmin = req.user.roles.includes("SUPER_ADMIN");
    const hasPermission =
      Array.isArray(req.user.permissions) &&
      req.user.permissions.includes("can_add_course");

    if (!isSuperAdmin && !hasPermission) {
      return next(new AppError("You do not have permission to add courses.", 403));
    }

    // Insert
    const [course] = await db
      .insert(courses)
      .values({
        title,
        code: code.toUpperCase(),
        description,
        thumbnailUrl,
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    next(new AppError(error.message || "Failed to create course", 500));
  }
};

module.exports = { getAllCourses, createCourse };
