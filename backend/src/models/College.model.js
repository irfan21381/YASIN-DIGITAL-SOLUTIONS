// src/models/college.model.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"
const { colleges } = require("../db/schema/colleges");
const { eq, and, or, desc } = require("drizzle-orm");
const { generateCollegeSlug } = require("../services/college.service");
const { isSubscriptionActive } = require("../utils/college.utils");

/**
 * Mongoose-style College Model for PostgreSQL + Drizzle ORM
 */
class CollegeModel {
  /**
   * Create a new college
   */
  static async create(data) {
    const slug = await generateCollegeSlug(data.name, data.code);
    const [college] = await db
      .insert(colleges)
      .values({
        ...data,
        slug,
        updatedAt: new Date(),
      })
      .returning();
    return college;
  }

  /**
   * Find college by ID
   */
  static async findById(id) {
    const [college] = await db
      .select()
      .from(colleges)
      .where(eq(colleges.id, id));
    return college;
  }

  /**
   * Find college by code
   */
  static async findByCode(code) {
    const [college] = await db
      .select()
      .from(colleges)
      .where(eq(colleges.code, code));
    return college;
  }

  /**
   * Find college by slug
   */
  static async findBySlug(slug) {
    const [college] = await db
      .select()
      .from(colleges)
      .where(eq(colleges.slug, slug));
    return college;
  }

  /**
   * Find all colleges (with optional filters)
   */
  static async find(filters = {}) {
    let where = [];

    if (filters.code) where.push(eq(colleges.code, filters.code));
    if (filters.slug) where.push(eq(colleges.slug, filters.slug));
    if (filters.isActive !== undefined)
      where.push(eq(colleges.isActive, filters.isActive));
    if (filters.managerId) where.push(eq(colleges.managerId, filters.managerId));

    const result = await db
      .select()
      .from(colleges)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(colleges.createdAt));

    return result;
  }

  /**
   * Update college by ID
   */
  static async findByIdAndUpdate(id, updates) {
    // Auto-generate slug if name or code changed
    if (updates.name || updates.code) {
      const [college] = await db.select().from(colleges).where(eq(colleges.id, id));
      if (college) {
        updates.slug = await generateCollegeSlug(
          updates.name || college.name,
          updates.code || college.code
        );
      }
    }

    const [updated] = await db
      .update(colleges)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(colleges.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete college by ID
   */
  static async findByIdAndDelete(id) {
    const [deleted] = await db
      .delete(colleges)
      .where(eq(colleges.id, id))
      .returning();
    return deleted;
  }

  /**
   * Virtual: Check if subscription is active
   */
  static isSubscriptionActive(college) {
    return isSubscriptionActive(college);
  }
}

module.exports = CollegeModel;
