// src/models/course.model.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"
const { courses } = require("../db/schema/courses");
const { eq, desc } = require("drizzle-orm");

/**
 * Mongoose-style Course Model for PostgreSQL + Drizzle ORM
 */
class CourseModel {
  /**
   * Create a new course
   */
  static async create(data) {
    const [course] = await db
      .insert(courses)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return course;
  }

  /**
   * Find course by ID
   */
  static async findById(id) {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id));
    return course;
  }

  /**
   * Find course by code
   */
  static async findByCode(code) {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.code, code));
    return course;
  }

  /**
   * Find all courses (with optional filters)
   */
  static async find(filters = {}) {
    let where = [];

    if (filters.instructor) where.push(eq(courses.instructor, filters.instructor));
    if (filters.isActive !== undefined)
      where.push(eq(courses.isActive, filters.isActive));

    const result = await db
      .select()
      .from(courses)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(courses.createdAt));

    return result;
  }

  /**
   * Update course by ID
   */
  static async findByIdAndUpdate(id, updates) {
    const [updated] = await db
      .update(courses)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete course by ID
   */
  static async findByIdAndDelete(id) {
    const [deleted] = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();
    return deleted;
  }
}

module.exports = CourseModel;
