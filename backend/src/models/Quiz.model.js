// src/models/quiz.model.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const { quizzes } = require("../db/schema/quizzes");
const { eq, and, desc } = require("drizzle-orm");

/**
 * Mongoose-style Quiz Model for PostgreSQL + Drizzle ORM
 */
class QuizModel {
  /**
   * Create a new quiz
   */
  static async create(data) {
    // Auto-calculate total marks if not provided
    if (!data.settings?.totalMarks && data.questions?.length > 0) {
      data.settings = {
        ...data.settings,
        totalMarks: data.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      };
    }

    const [quiz] = await db
      .insert(quizzes)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return quiz;
  }

  /**
   * Find quiz by ID
   */
  static async findById(id) {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id));
    return quiz;
  }

  /**
   * Find quizzes by collegeId and subjectId
   */
  static async findByCollegeAndSubject(collegeId, subjectId) {
    const result = await db
      .select()
      .from(quizzes)
      .where(
        and(
          eq(quizzes.collegeId, collegeId),
          eq(quizzes.subjectId, subjectId)
        )
      )
      .orderBy(desc(quizzes.createdAt));
    return result;
  }

  /**
   * Find quizzes by status
   */
  static async findByStatus(status) {
    const result = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.status, status))
      .orderBy(desc(quizzes.createdAt));
    return result;
  }

  /**
   * Find quizzes by year, branch, semester
   */
  static async findByYearBranchSemester(year, branch, semester) {
    const result = await db
      .select()
      .from(quizzes)
      .where(
        and(
          eq(quizzes.year, year),
          eq(quizzes.branch, branch),
          eq(quizzes.semester, semester)
        )
      )
      .orderBy(desc(quizzes.createdAt));
    return result;
  }

  /**
   * Find all quizzes (with optional filters)
   */
  static async find(filters = {}) {
    let where = [];

    if (filters.collegeId) where.push(eq(quizzes.collegeId, filters.collegeId));
    if (filters.subjectId) where.push(eq(quizzes.subjectId, filters.subjectId));
    if (filters.unit) where.push(eq(quizzes.unit, filters.unit));
    if (filters.createdBy) where.push(eq(quizzes.createdBy, filters.createdBy));
    if (filters.status) where.push(eq(quizzes.status, filters.status));
    if (filters.year) where.push(eq(quizzes.year, filters.year));
    if (filters.branch) where.push(eq(quizzes.branch, filters.branch));
    if (filters.semester) where.push(eq(quizzes.semester, filters.semester));

    const result = await db
      .select()
      .from(quizzes)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(quizzes.createdAt));

    return result;
  }

  /**
   * Update quiz by ID
   */
  static async findByIdAndUpdate(id, updates) {
    // Auto-calculate total marks if questions updated
    if (updates.questions && !updates.settings?.totalMarks) {
      updates.settings = {
        ...updates.settings,
        totalMarks: updates.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      };
    }

    const [updated] = await db
      .update(quizzes)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(quizzes.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete quiz by ID
   */
  static async findByIdAndDelete(id) {
    const [deleted] = await db
      .delete(quizzes)
      .where(eq(quizzes.id, id))
      .returning();
    return deleted;
  }
}

module.exports = QuizModel;
