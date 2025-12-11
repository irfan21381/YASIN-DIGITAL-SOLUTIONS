// src/models/subject.model.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const { subjects } = require("../db/schema/subjects");
const { eq, and, desc } = require("drizzle-orm");

/**
 * Mongoose-style Subject Model for PostgreSQL + Drizzle ORM
 */
class SubjectModel {
  /**
   * Create a new subject
   */
  static async create(data) {
    // Pre-save validation: sort units by number
    if (data.units && data.units.length > 0) {
      data.units.sort((a, b) => a.number - b.number);
    }

    const [subject] = await db
      .insert(subjects)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return subject;
  }

  /**
   * Find subject by ID
   */
  static async findById(id) {
    const [subject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id));
    return subject;
  }

  /**
   * Find subjects by collegeId, year, branch, semester
   */
  static async findByCollegeYearBranchSemester(collegeId, year, branch, semester) {
    const result = await db
      .select()
      .from(subjects)
      .where(
        and(
          eq(subjects.collegeId, collegeId),
          eq(subjects.year, year),
          eq(subjects.branch, branch),
          eq(subjects.semester, semester)
        )
      )
      .orderBy(desc(subjects.createdAt));
    return result;
  }

  /**
   * Find subjects by collegeId and code (unique per college)
   */
  static async findByCollegeAndCode(collegeId, code) {
    const [subject] = await db
      .select()
      .from(subjects)
      .where(
        and(
          eq(subjects.collegeId, collegeId),
          eq(subjects.code, code)
        )
      );
    return subject;
  }

  /**
   * Find all subjects (with optional filters)
   */
  static async find(filters = {}) {
    let where = [];

    if (filters.collegeId) where.push(eq(subjects.collegeId, filters.collegeId));
    if (filters.year) where.push(eq(subjects.year, filters.year));
    if (filters.branch) where.push(eq(subjects.branch, filters.branch));
    if (filters.semester) where.push(eq(subjects.semester, filters.semester));
    if (filters.isActive !== undefined) where.push(eq(subjects.isActive, filters.isActive));
    if (filters.teacherId) where.push(eq(subjects.teacherId, filters.teacherId));

    const result = await db
      .select()
      .from(subjects)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(subjects.createdAt));

    return result;
  }

  /**
   * Update subject by ID
   */
  static async findByIdAndUpdate(id, updates) {
    // Pre-save validation: sort units by number
    if (updates.units && updates.units.length > 0) {
      updates.units.sort((a, b) => a.number - b.number);
    }

    const [updated] = await db
      .update(subjects)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(subjects.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete subject by ID
   */
  static async findByIdAndDelete(id) {
    const [deleted] = await db
      .delete(subjects)
      .where(eq(subjects.id, id))
      .returning();
    return deleted;
  }
}

module.exports = SubjectModel;
