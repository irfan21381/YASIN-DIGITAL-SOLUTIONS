// ------------------------------------------------------------
// Admin Controller (PostgreSQL + Drizzle ORM)
// ------------------------------------------------------------

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const { users } = require("../db/schema/users");
const { colleges } = require("../db/schema/colleges");
const { content } = require("../db/schema/content");
const { quizzes } = require("../db/schema/quizzes");
const { analytics } = require("../db/schema/analytics");

const { eq, and, ilike, sql } = require("drizzle-orm");

// ------------------------------------------------------------
// SUPER_ADMIN role check
// ------------------------------------------------------------
const assertSuperAdmin = (req, res) => {
  if (!req.user?.roles?.includes("SUPER_ADMIN")) {
    res.status(403).json({
      success: false,
      message: "Access denied. SUPER_ADMIN only.",
    });
    return false;
  }
  return true;
};

/* ============================================================
   1. ADMIN DASHBOARD OVERVIEW
   GET /api/admin/overview
   ============================================================ */
const getAdminOverview = async (req, res) => {
  try {
    if (!assertSuperAdmin(req, res)) return;

    const [
      collegeCount,
      studentCount,
      teacherCount,
      managerCount,
      contentCount,
      quizCount,
      aiUsage,
    ] = await Promise.all([
      db.select({ count: sql`COUNT(*)` }).from(colleges),
      db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(sql`roles @> ${JSON.stringify(["STUDENT"])}::jsonb`),
      db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(sql`roles @> ${JSON.stringify(["TEACHER"])}::jsonb`),
      db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(sql`roles @> ${JSON.stringify(["COLLEGE_MANAGER"])}::jsonb`),
      db.select({ count: sql`COUNT(*)` }).from(content),
      db.select({ count: sql`COUNT(*)` }).from(quizzes),
      db
        .select({
          type: analytics.type,
          count: sql`COUNT(*)`,
        })
        .from(analytics)
        .groupBy(analytics.type),
    ]);

    const usage = {
      total: 0,
      chatMessages: 0,
      notesGenerated: 0,
      quizAttempts: 0,
    };

    aiUsage.forEach((row) => {
      usage.total += Number(row.count);
      if (row.type === "chat_message") usage.chatMessages = Number(row.count);
      if (row.type === "notes_generated") usage.notesGenerated = Number(row.count);
      if (row.type === "quiz_attempt") usage.quizAttempts = Number(row.count);
    });

    res.json({
      success: true,
      data: {
        colleges: Number(collegeCount[0].count),
        students: Number(studentCount[0].count),
        teachers: Number(teacherCount[0].count),
        managers: Number(managerCount[0].count),
        content: Number(contentCount[0].count),
        quizzes: Number(quizCount[0].count),
        aiUsage: usage,
      },
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load admin overview",
    });
  }
};

/* ============================================================
   2. LIST USERS
   GET /api/admin/users
   ============================================================ */
const listUsers = async (req, res) => {
  try {
    if (!assertSuperAdmin(req, res)) return;

    const { role, q, limit = 50, page = 1 } = req.query;

    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;

    let where = [];

    if (role) {
      where.push(sql`roles @> ${JSON.stringify([role])}::jsonb`);
    }

    if (q) {
      where.push(
        sql`(LOWER(name) LIKE ${"%" + q.toLowerCase() + "%"} OR LOWER(email) LIKE ${
          "%" + q.toLowerCase() + "%"
        })`
      );
    }

    const usersList = await db
      .select()
      .from(users)
      .leftJoin(colleges, eq(users.collegeId, colleges.id))
      .where(where.length > 0 ? and(...where) : undefined)
      .orderBy(sql`users.created_at DESC`)
      .offset(skip)
      .limit(take);

    const total = await db
      .select({ count: sql`COUNT(*)` })
      .from(users)
      .where(where.length > 0 ? and(...where) : undefined);

    res.json({
      success: true,
      data: usersList.map((u) => ({
        ...u.users,
        college: u.colleges ? { name: u.colleges.name, code: u.colleges.code } : null,
      })),
      pagination: {
        total: Number(total[0].count),
        limit: take,
        page: Number(page),
        pages: Math.ceil(Number(total[0].count) / take),
      },
    });
  } catch (err) {
    console.error("Admin listUsers error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
};

/* ============================================================
   3. UPDATE USER ROLES
   PATCH /api/admin/users/:id/roles
   ============================================================ */
const updateUserRoles = async (req, res) => {
  try {
    if (!assertSuperAdmin(req, res)) return;

    const { id } = req.params;
    const { roles, activeRole } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Roles array is required",
      });
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)));

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await db
      .update(users)
      .set({
        roles,
        activeRole: activeRole || roles[0],
      })
      .where(eq(users.id, Number(id)));

    res.json({
      success: true,
      data: {
        roles,
        activeRole: activeRole || roles[0],
      },
    });
  } catch (err) {
    console.error("updateUserRoles error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update user roles",
    });
  }
};

/* ============================================================
   4. UPDATE USER STATUS
   PATCH /api/admin/users/:id/status
   ============================================================ */
const updateUserStatus = async (req, res) => {
  try {
    if (!assertSuperAdmin(req, res)) return;

    const { id } = req.params;
    const { isActive } = req.body;

    await db
      .update(users)
      .set({ isActive: Boolean(isActive) })
      .where(eq(users.id, Number(id)));

    res.json({
      success: true,
      data: { isActive: Boolean(isActive) },
    });
  } catch (err) {
    console.error("updateUserStatus error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

/* ============================================================
   5. LIST COLLEGES
   GET /api/admin/colleges
   ============================================================ */
const listColleges = async (req, res) => {
  try {
    if (!assertSuperAdmin(req, res)) return;

    const data = await db
      .select()
      .from(colleges)
      .orderBy(sql`created_at DESC`);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Admin listColleges error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load colleges",
    });
  }
};

/* ============================================================
   6. CREATE COLLEGE
   ============================================================ */
const createCollege = async (req, res) => {
  try {
    if (!assertSuperAdmin(req, res)) return;

    const { name, code, location } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required",
      });
    }

    const exists = await db
      .select()
      .from(colleges)
      .where(eq(colleges.code, code));

    if (exists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "College with this code already exists",
      });
    }

    const inserted = await db
      .insert(colleges)
      .values({
        name,
        code,
        location: location || "",
      })
      .returning();

    res.status(201).json({
      success: true,
      data: inserted[0],
    });
  } catch (err) {
    console.error("createCollege error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create college",
    });
  }
};

/* ============================================================
   7. UPDATE COLLEGE
   ============================================================ */
const updateCollege = async (req, res) => {
  try {
    if (!assertSuperAdmin(req, res)) return;

    const { id } = req.params;
    const { name, code, location } = req.body;

    const existing = await db
      .select()
      .from(colleges)
      .where(eq(colleges.id, Number(id)));

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    const updated = await db
      .update(colleges)
      .set({
        ...(name && { name }),
        ...(code && { code }),
        ...(location !== undefined && { location }),
      })
      .where(eq(colleges.id, Number(id)))
      .returning();

    res.json({
      success: true,
      data: updated[0],
    });
  } catch (err) {
    console.error("updateCollege error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update college",
    });
  }
};

/* ============================================================
   8. DELETE COLLEGE
   ============================================================ */
const deleteCollege = async (req, res) => {
  try {
    if (!assertSuperAdmin(req, res)) return;

    const { id } = req.params;

    const existing = await db
      .select()
      .from(colleges)
      .where(eq(colleges.id, Number(id)));

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    await db.delete(colleges).where(eq(colleges.id, Number(id)));

    res.json({
      success: true,
      message: "College deleted",
    });
  } catch (err) {
    console.error("deleteCollege error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete college",
    });
  }
};

/* ============================================================
   9. ANALYTICS OVERVIEW
   GET /api/admin/analytics/overview
   ============================================================ */
const getAnalyticsOverview = async (req, res) => {
  try {
    if (!assertSuperAdmin(req, res)) return;

    const aiEvents = await db
      .select({
        type: analytics.type,
        count: sql`COUNT(*)`,
      })
      .from(analytics)
      .groupBy(analytics.type);

    const quizStats = await db
      .select({
        totalQuizzes: sql`COUNT(*)`,
        totalAttempts: sql`SUM(attempt_count)`,
        avgScore: sql`AVG(avg_score)`,
      })
      .from(quizzes);

    res.json({
      success: true,
      data: {
        aiEvents,
        quizStats: quizStats[0] || {
          totalQuizzes: 0,
          totalAttempts: 0,
          avgScore: 0,
        },
      },
    });
  } catch (err) {
    console.error("getAnalyticsOverview error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load analytics",
    });
  }
};

module.exports = {
  getAdminOverview,
  listUsers,
  listColleges,
  createCollege,
  updateCollege,
  deleteCollege,
  updateUserRoles,
  updateUserStatus,
  getAnalyticsOverview,
};
