// src/models/quizAttempt.model.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"
const { quizAttempts } = require("../db/schema/quizAttempts");
const { eq, and, desc } = require("drizzle-orm");

/**
 * Mongoose-style QuizAttempt Model for PostgreSQL + Drizzle ORM
 */
class QuizAttemptModel {
  /**
   * Create a new quiz attempt
   */
  static async create(data) {
    // Auto-calculate percentage if totalMarks > 0
    if (data.totalMarks > 0) {
      data.percentage = (data.marksObtained / data.totalMarks) * 100;
    }

    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return attempt;
  }

  /**
   * Find attempt by ID
   */
  static async findById(id) {
    const [attempt] = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, id));
    return attempt;
  }

  /**
   * Find attempts by quizId and studentId
   */
  static async findByQuizAndStudent(quizId, studentId) {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.quizId, quizId),
          eq(quizAttempts.studentId, studentId)
        )
      )
      .orderBy(desc(quizAttempts.createdAt));
    return result;
  }

  /**
   * Find attempts by studentId
   */
  static async findByStudent(studentId) {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.studentId, studentId))
      .orderBy(desc(quizAttempts.createdAt));
    return result;
  }

  /**
   * Find attempts by collegeId
   */
  static async findByCollege(collegeId) {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.collegeId, collegeId))
      .orderBy(desc(quizAttempts.createdAt));
    return result;
  }

  /**
   * Find attempts by cheatingScore
   */
  static async findByCheatingScore(score) {
    const result = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.cheatingScore, score))
      .orderBy(desc(quizAttempts.createdAt));
    return result;
  }

  /**
   * Find all attempts (with optional filters)
   */
  static async find(filters = {}) {
    let where = [];

    if (filters.quizId) where.push(eq(quizAttempts.quizId, filters.quizId));
    if (filters.studentId) where.push(eq(quizAttempts.studentId, filters.studentId));
    if (filters.collegeId) where.push(eq(quizAttempts.collegeId, filters.collegeId));
    if (filters.status) where.push(eq(quizAttempts.status, filters.status));
    if (filters.cheatingScore) where.push(eq(quizAttempts.cheatingScore, filters.cheatingScore));

    const result = await db
      .select()
      .from(quizAttempts)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(quizAttempts.createdAt));

    return result;
  }

  /**
   * Update attempt by ID
   */
  static async findByIdAndUpdate(id, updates) {
    // Auto-calculate percentage if totalMarks updated
    if (updates.totalMarks > 0) {
      updates.percentage = (updates.marksObtained / updates.totalMarks) * 100;
    }

    const [updated] = await db
      .update(quizAttempts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(quizAttempts.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete attempt by ID
   */
  static async findByIdAndDelete(id) {
    const [deleted] = await db
      .delete(quizAttempts)
      .where(eq(quizAttempts.id, id))
      .returning();
    return deleted;
  }

  /**
   * Method: Calculate cheating score
   */
  static calculateCheatingScore(events) {
    let score = 0;

    events.forEach((event) => {
      switch (event.type) {
        case "tab_switch":
        case "screen_blur":
          score += 10;
          break;
        case "copy_paste":
        case "right_click":
          score += 15;
          break;
        case "device_change":
          score += 25;
          break;
        case "multiple_faces_detected":
          score += 30;
          break;
        default:
          score += 5;
      }
    });

    return Math.min(100, score);
  }
}

module.exports = QuizAttemptModel;
