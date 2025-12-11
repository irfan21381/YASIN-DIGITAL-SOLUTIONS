// src/models/upload.model.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"
const { uploads } = require("../db/schema/uploads");
const { eq, and, desc } = require("drizzle-orm");

/**
 * Mongoose-style Upload Model for PostgreSQL + Drizzle ORM
 */
class UploadModel {
  /**
   * Create a new upload
   */
  static async create(data) {
    const [upload] = await db
      .insert(uploads)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return upload;
  }

  /**
   * Find upload by ID
   */
  static async findById(id) {
    const [upload] = await db
      .select()
      .from(uploads)
      .where(eq(uploads.id, id));
    return upload;
  }

  /**
   * Find uploads by teacherId, subject, and unit
   */
  static async findByTeacherSubjectUnit(teacherId, subject, unit) {
    const result = await db
      .select()
      .from(uploads)
      .where(
        and(
          eq(uploads.teacherId, teacherId),
          eq(uploads.subject, subject),
          eq(uploads.unit, unit)
        )
      )
      .orderBy(desc(uploads.createdAt));
    return result;
  }

  /**
   * Find uploads by collegeId, subject, and unit
   */
  static async findByCollegeSubjectUnit(collegeId, subject, unit) {
    const result = await db
      .select()
      .from(uploads)
      .where(
        and(
          eq(uploads.collegeId, collegeId),
          eq(uploads.subject, subject),
          eq(uploads.unit, unit)
        )
      )
      .orderBy(desc(uploads.createdAt));
    return result;
  }

  /**
   * Find all uploads (with optional filters)
   */
  static async find(filters = {}) {
    let where = [];

    if (filters.teacherId) where.push(eq(uploads.teacherId, filters.teacherId));
    if (filters.subject) where.push(eq(uploads.subject, filters.subject));
    if (filters.unit) where.push(eq(uploads.unit, filters.unit));
    if (filters.collegeId) where.push(eq(uploads.collegeId, filters.collegeId));
    if (filters.originalName) where.push(eq(uploads.originalName, filters.originalName));

    const result = await db
      .select()
      .from(uploads)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(uploads.createdAt));

    return result;
  }

  /**
   * Update upload by ID
   */
  static async findByIdAndUpdate(id, updates) {
    const [updated] = await db
      .update(uploads)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(uploads.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete upload by ID
   */
  static async findByIdAndDelete(id) {
    const [deleted] = await db
      .delete(uploads)
      .where(eq(uploads.id, id))
      .returning();
    return deleted;
  }
}

module.exports = UploadModel;
