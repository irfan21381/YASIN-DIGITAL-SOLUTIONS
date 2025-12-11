// src/models/embedding.model.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"
const { embeddings } = require("../db/schema/embeddings");
const { eq, and, desc } = require("drizzle-orm");

/**
 * Mongoose-style Embedding Model for PostgreSQL + Drizzle ORM
 */
class EmbeddingModel {
  /**
   * Create a new embedding
   */
  static async create(data) {
    // Prevent storing empty embeddings
    if (!data.embeddings || data.embeddings.length === 0) {
      data.isProcessed = false;
    }

    const [embedding] = await db
      .insert(embeddings)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return embedding;
  }

  /**
   * Find embedding by ID
   */
  static async findById(id) {
    const [embedding] = await db
      .select()
      .from(embeddings)
      .where(eq(embeddings.id, id));
    return embedding;
  }

  /**
   * Find embeddings by teacherId, subject, and unit
   */
  static async findByTeacherSubjectUnit(teacherId, subject, unit) {
    const result = await db
      .select()
      .from(embeddings)
      .where(
        and(
          eq(embeddings.teacherId, teacherId),
          eq(embeddings.subject, subject),
          eq(embeddings.unit, unit)
        )
      )
      .orderBy(desc(embeddings.createdAt));
    return result;
  }

  /**
   * Find embeddings by contentId and unit
   */
  static async findByContentAndUnit(contentId, unit) {
    const result = await db
      .select()
      .from(embeddings)
      .where(
        and(
          eq(embeddings.contentId, contentId),
          eq(embeddings.unit, unit)
        )
      )
      .orderBy(desc(embeddings.createdAt));
    return result;
  }

  /**
   * Find embeddings by collegeId and subject
   */
  static async findByCollegeAndSubject(collegeId, subject) {
    const result = await db
      .select()
      .from(embeddings)
      .where(
        and(
          eq(embeddings.collegeId, collegeId),
          eq(embeddings.subject, subject)
        )
      )
      .orderBy(desc(embeddings.createdAt));
    return result;
  }

  /**
   * Find all embeddings (with optional filters)
   */
  static async find(filters = {}) {
    let where = [];

    if (filters.teacherId) where.push(eq(embeddings.teacherId, filters.teacherId));
    if (filters.subject) where.push(eq(embeddings.subject, filters.subject));
    if (filters.unit) where.push(eq(embeddings.unit, filters.unit));
    if (filters.contentId) where.push(eq(embeddings.contentId, filters.contentId));
    if (filters.collegeId) where.push(eq(embeddings.collegeId, filters.collegeId));
    if (filters.isProcessed !== undefined)
      where.push(eq(embeddings.isProcessed, filters.isProcessed));

    const result = await db
      .select()
      .from(embeddings)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(embeddings.createdAt));

    return result;
  }

  /**
   * Update embedding by ID
   */
  static async findByIdAndUpdate(id, updates) {
    // Prevent storing empty embeddings
    if (updates.embeddings && updates.embeddings.length === 0) {
      updates.isProcessed = false;
    }

    const [updated] = await db
      .update(embeddings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(embeddings.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete embedding by ID
   */
  static async findByIdAndDelete(id) {
    const [deleted] = await db
      .delete(embeddings)
      .where(eq(embeddings.id, id))
      .returning();
    return deleted;
  }
}

module.exports = EmbeddingModel;
