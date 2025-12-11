// src/models/content.model.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const { content } = require("../db/schema/content");
const { eq, and, desc } = require("drizzle-orm");

/**
 * Mongoose-style Content Model for PostgreSQL + Drizzle ORM
 */
class ContentModel {
  /**
   * Create a new content
   */
  static async create(data) {
    // Auto-update pages/duration based on file type
    if (data.type !== "video") data.duration = null;
    if (data.type !== "pdf") data.pages = null;

    const [content] = await db
      .insert(content)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return content;
  }

  /**
   * Find content by ID
   */
  static async findById(id) {
    const [content] = await db
      .select()
      .from(content)
      .where(eq(content.id, id));
    return content;
  }

  /**
   * Find content by collegeId and subjectId
   */
  static async findByCollegeAndSubject(collegeId, subjectId) {
    const result = await db
      .select()
      .from(content)
      .where(
        and(
          eq(content.collegeId, collegeId),
          eq(content.subjectId, subjectId)
        )
      )
      .orderBy(desc(content.createdAt));
    return result;
  }

  /**
   * Find all contents (with optional filters)
   */
  static async find(filters = {}) {
    let where = [];

    if (filters.collegeId) where.push(eq(content.collegeId, filters.collegeId));
    if (filters.subjectId) where.push(eq(content.subjectId, filters.subjectId));
    if (filters.unit) where.push(eq(content.unit, filters.unit));
    if (filters.isVerified !== undefined)
      where.push(eq(content.isVerified, filters.isVerified));
    if (filters.isEmbedded !== undefined)
      where.push(eq(content.isEmbedded, filters.isEmbedded));
    if (filters.accessLevel) where.push(eq(content.accessLevel, filters.accessLevel));

    const result = await db
      .select()
      .from(content)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(content.createdAt));

    return result;
  }

  /**
   * Update content by ID
   */
  static async findByIdAndUpdate(id, updates) {
    // Auto-update pages/duration based on file type
    if (updates.type !== "video") updates.duration = null;
    if (updates.type !== "pdf") updates.pages = null;

    const [updated] = await db
      .update(content)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(content.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete content by ID
   */
  static async findByIdAndDelete(id) {
    const [deleted] = await db
      .delete(content)
      .where(eq(content.id, id))
      .returning();
    return deleted;
  }

  /**
   * Virtual: Check if content is private (has fileKey)
   */
  static isPrivate(content) {
    return !!content.fileKey;
  }
}

module.exports = ContentModel;
