// src/controllers/user.controller.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const { users } = require("../db/schema/users");
const { colleges } = require("../db/schema/colleges");

const {
  eq,
  and,
  or,
  sql,
} = require("drizzle-orm");

const AppError = require("../utils/AppError");
const { hashPassword } = require("../config/encryption");
const {
  parseCSV,
  validateStudentCSV,
  validateTeacherCSV,
} = require("../utils/csvParser");

/* =====================================================================
   1. GET USERS (with role/search/college filtering)
===================================================================== */
const getUsers = async (req, res, next) => {
  try {
    const { role, collegeId, search, page = 1, limit = 20 } = req.query;

    const pageNum = Number(page) || 1;
    const perPage = Number(limit) || 20;
    const offset = (pageNum - 1) * perPage;

    const isSuperAdmin = req.user.roles.includes("SUPER_ADMIN");

    const filters = [];

    // ACCESS CONTROL
    if (isSuperAdmin) {
      if (collegeId) {
        filters.push(eq(users.collegeId, collegeId));
      }
    } else {
      if (!req.user.collegeId) {
        return res.json({
          success: true,
          data: [],
          pagination: { page: pageNum, limit: perPage, total: 0, pages: 0 },
        });
      }
      filters.push(eq(users.collegeId, req.user.collegeId));
    }

    // ROLE FILTER: roles @> ARRAY[role]
    if (role) {
      filters.push(
        sql`${users.roles} @> ARRAY[${role}]::text[]`
      );
    }

    // SEARCH FILTER
    if (search) {
      const pattern = `%${search}%`;
      filters.push(
        or(
          sql`${users.name} ILIKE ${pattern}`,
          sql`${users.email} ILIKE ${pattern}`
        )
      );
    }

    const whereExpr = filters.length ? and(...filters) : undefined;

    // Data query
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        roles: users.roles,
        activeRole: users.activeRole,
        collegeId: users.collegeId,
        profilePicture: users.profilePicture,
        isActive: users.isActive,
        usageStats: users.usageStats,
        studentData: users.studentData,
        teacherData: users.teacherData,
        createdAt: users.createdAt,
        college: {
          id: colleges.id,
          name: colleges.name,
          code: colleges.code,
        },
      })
      .from(users)
      .leftJoin(colleges, eq(users.collegeId, colleges.id))
      .where(whereExpr)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(perPage)
      .offset(offset);

    // Total count
    const totalResult = await db
      .select({
        count: sql`CAST(count(*) AS INTEGER)`,
      })
      .from(users)
      .where(whereExpr);

    const total = totalResult[0]?.count || 0;

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: pageNum,
        limit: perPage,
        total,
        pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    next(new AppError("Failed to fetch users", 500));
  }
};

/* =====================================================================
   2. GET USER BY ID (Access restricted by college & role)
===================================================================== */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        roles: users.roles,
        activeRole: users.activeRole,
        collegeId: users.collegeId,
        profilePicture: users.profilePicture,
        isActive: users.isActive,
        usageStats: users.usageStats,
        studentData: users.studentData,
        teacherData: users.teacherData,
        managerData: users.managerData,
        otp: users.otp,
        college: {
          id: colleges.id,
          name: colleges.name,
          code: colleges.code,
        },
      })
      .from(users)
      .leftJoin(colleges, eq(users.collegeId, colleges.id))
      .where(eq(users.id, id));

    const user = rows[0];

    if (!user) return next(new AppError("User not found", 404));

    // Access control for non-super admins
    if (
      !req.user.roles.includes("SUPER_ADMIN") &&
      user.college?.id?.toString() !== req.user.collegeId?.toString()
    ) {
      return next(new AppError("Access denied", 403));
    }

    // Strip otp from response
    delete user.otp;

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Get user error:", error);
    next(new AppError("Failed to fetch user", 500));
  }
};

/* =====================================================================
   3. CREATE / UPSERT USER (Admins / College Managers)
===================================================================== */
const createUser = async (req, res, next) => {
  try {
    const {
      email,
      name,
      roles = [],
      collegeId,
      password,
      studentData,
      teacherData,
    } = req.body;

    const isManager = req.user.roles.includes("COLLEGE_MANAGER");
    const isAdmin = req.user.roles.includes("SUPER_ADMIN");

    if (!isManager && !isAdmin) {
      return next(new AppError("Insufficient permissions", 403));
    }

    const finalCollegeId = isAdmin ? collegeId : req.user.collegeId;

    if (!finalCollegeId) {
      return next(new AppError("collegeId is required", 400));
    }

    const validRoles = [
      "STUDENT",
      "TEACHER",
      "COLLEGE_MANAGER",
      "EMPLOYEE",
      "CLIENT",
    ];
    const filteredRoles = roles.filter((r) => validRoles.includes(r));

    if (filteredRoles.length === 0) {
      return next(
        new AppError("At least one valid role must be provided", 400)
      );
    }

    const emailLower = email.toLowerCase();

    // Check if user exists
    const existingRows = await db
      .select()
      .from(users)
      .where(eq(users.email, emailLower));

    const existing = existingRows[0];

    // --- UPDATE EXISTING USER ---
    if (existing) {
      const mergedRoles = Array.from(
        new Set([...(existing.roles || []), ...filteredRoles])
      );

      const mergedStudentData = studentData
        ? { ...(existing.studentData || {}), ...studentData }
        : existing.studentData;
      const mergedTeacherData = teacherData
        ? { ...(existing.teacherData || {}), ...teacherData }
        : existing.teacherData;

      const updatedRows = await db
        .update(users)
        .set({
          roles: mergedRoles,
          collegeId: finalCollegeId,
          studentData: mergedStudentData,
          teacherData: mergedTeacherData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning();

      return res.json({
        success: true,
        message: "User updated with new roles",
        data: updatedRows[0],
      });
    }

    // --- CREATE NEW USER ---
    let hashedPassword = null;
    if (password) {
      hashedPassword = await hashPassword(password);
    } else if (
      filteredRoles.includes("COLLEGE_MANAGER") ||
      filteredRoles.includes("EMPLOYEE")
    ) {
      return next(
        new AppError(
          "Password is required for staff roles (Manager/Employee)",
          400
        )
      );
    }

    const insertRows = await db
      .insert(users)
      .values({
        email: emailLower,
        name,
        password: hashedPassword,
        roles: filteredRoles,
        activeRole: filteredRoles[0],
        collegeId: finalCollegeId,
        studentData: studentData || null,
        teacherData: teacherData || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const newUser = insertRows[0];

    // If manager, attach to college
    if (filteredRoles.includes("COLLEGE_MANAGER")) {
      await db
        .update(colleges)
        .set({ managerId: newUser.id, updatedAt: new Date() })
        .where(eq(colleges.id, finalCollegeId));
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Create user error:", error);
    next(new AppError(error.message || "Failed to create user", 500));
  }
};

/* =====================================================================
   4. UPDATE USER (Self, Manager of same college, Admin)
===================================================================== */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rows = await db.select().from(users).where(eq(users.id, id));
    const user = rows[0];

    if (!user) return next(new AppError("User not found", 404));

    const isOwner = req.user.id === user.id;
    const isManager = req.user.roles.includes("COLLEGE_MANAGER");
    const isAdmin = req.user.roles.includes("SUPER_ADMIN");
    const sameCollege =
      user.collegeId && user.collegeId.toString() === req.user.collegeId?.toString();

    if (!isOwner && !isManager && !isAdmin) {
      return next(new AppError("No permission to update this user", 403));
    }

    if (isManager && !sameCollege && !isAdmin) {
      return next(
        new AppError("Cannot update user from another college", 403)
      );
    }

    if (updates.roles || updates.activeRole) {
      return next(
        new AppError(
          "Use dedicated admin routes to change user roles or college status.",
          400
        )
      );
    }

    // Allowed fields to update
    const allowedFields = [
      "name",
      "phone",
      "profilePicture",
      "studentData",
      "teacherData",
      "managerData",
      "usageStats",
      "isActive",
    ];

    const payload = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        payload[key] = updates[key];
      }
    }

    if (Object.keys(payload).length === 0) {
      return res.json({
        success: true,
        message: "Nothing to update",
        data: user,
      });
    }

    payload.updatedAt = new Date();

    const updatedRows = await db
      .update(users)
      .set(payload)
      .where(eq(users.id, id))
      .returning();

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedRows[0],
    });
  } catch (error) {
    console.error("Update user error:", error);
    next(new AppError("Failed to update user", 500));
  }
};

/* =====================================================================
   5. BULK UPLOAD STUDENTS (CSV)
===================================================================== */
const bulkUploadStudents = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError("CSV file is required", 400));

    const collegeId = req.user.collegeId;
    if (!collegeId)
      return next(new AppError("User is not linked to a college", 403));

    const rows = await parseCSV(req.file.buffer);
    const validation = validateStudentCSV(rows);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "CSV validation failed",
        errors: validation.errors,
      });
    }

    const results = { created: 0, updated: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        const email = r.email.toLowerCase();

        const existingRows = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
        const existing = existingRows[0];

        const studentData = {
          rollNumber: r.rollNumber,
          year: Number(r.year),
          branch: r.branch,
          semester: Number(r.semester),
        };

        if (existing) {
          const newRoles = existing.roles || [];
          if (!newRoles.includes("STUDENT")) newRoles.push("STUDENT");

          await db
            .update(users)
            .set({
              name: r.name,
              collegeId,
              roles: newRoles,
              studentData,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existing.id));

          results.updated++;
        } else {
          await db.insert(users).values({
            email,
            name: r.name,
            roles: ["STUDENT"],
            activeRole: "STUDENT",
            collegeId,
            studentData,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          results.created++;
        }
      } catch (err) {
        results.errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: "Bulk upload completed",
      data: results,
    });
  } catch (error) {
    console.error("Bulk upload students error:", error);
    next(new AppError("Bulk upload failed", 500));
  }
};

/* =====================================================================
   6. BULK UPLOAD TEACHERS (CSV)
===================================================================== */
const bulkUploadTeachers = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError("CSV file is required", 400));

    const collegeId = req.user.collegeId;
    if (!collegeId)
      return next(new AppError("User is not linked to a college", 403));

    const rows = await parseCSV(req.file.buffer);
    const validation = validateTeacherCSV(rows);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "CSV validation failed",
        errors: validation.errors,
      });
    }

    const results = { created: 0, updated: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        const email = r.email.toLowerCase();

        const existingRows = await db
          .select()
          .from(users)
          .where(eq(users.email, email));
        const existing = existingRows[0];

        const teacherData = {
          employeeId: r.employeeId,
          department: r.department,
        };

        if (existing) {
          const newRoles = existing.roles || [];
          if (!newRoles.includes("TEACHER")) newRoles.push("TEACHER");

          await db
            .update(users)
            .set({
              name: r.name,
              collegeId,
              roles: newRoles,
              teacherData,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existing.id));

          results.updated++;
        } else {
          await db.insert(users).values({
            email,
            name: r.name,
            roles: ["TEACHER"],
            activeRole: "TEACHER",
            collegeId,
            teacherData,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          results.created++;
        }
      } catch (err) {
        results.errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: "Bulk upload completed",
      data: results,
    });
  } catch (error) {
    console.error("Bulk upload teachers error:", error);
    next(new AppError("Bulk upload failed", 500));
  }
};

/* =====================================================================
   7. UPDATE USER ROLES (Dedicated Admin Route)
===================================================================== */
const updateUserRoles = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activeRole, roles } = req.body;

    const isSuperAdmin = req.user.roles.includes("SUPER_ADMIN");
    if (!isSuperAdmin) {
      return next(
        new AppError("Only Super Admins can change user roles", 403)
      );
    }

    const rows = await db.select().from(users).where(eq(users.id, id));
    const user = rows[0];

    if (!user) return next(new AppError("User not found", 404));

    const updated = { updatedAt: new Date() };

    if (roles) {
      updated.roles = Array.isArray(roles) ? roles : [roles];
    }

    if (activeRole) {
      const finalRoles = updated.roles || user.roles || [];
      if (!finalRoles.includes(activeRole)) {
        finalRoles.push(activeRole);
        updated.roles = finalRoles;
      }
      updated.activeRole = activeRole;
    }

    const updatedRows = await db
      .update(users)
      .set(updated)
      .where(eq(users.id, id))
      .returning();

    const result = updatedRows[0];

    res.json({
      success: true,
      message: `User role updated${result.activeRole ? ` to ${result.activeRole}` : ""
        }`,
      data: {
        _id: result.id,
        roles: result.roles,
        activeRole: result.activeRole,
      },
    });
  } catch (error) {
    console.error("Update role error:", error);
    next(new AppError("Failed to update user roles", 500));
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  bulkUploadStudents,
  bulkUploadTeachers,
  updateUserRoles,
};
