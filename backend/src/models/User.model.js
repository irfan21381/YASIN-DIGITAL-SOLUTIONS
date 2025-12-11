// src/models/user.model.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"
const { users } = require("../db/schema/users");
const { eq, and, desc, sql } = require("drizzle-orm");

/**
 * Mongoose-style User Model for PostgreSQL + Drizzle ORM
 */
class UserModel {
  /**
   * Create a new user
   */
  static async create(data) {
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  /**
   * Find users by collegeId
   */
  static async findByCollege(collegeId) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.collegeId, collegeId))
      .orderBy(desc(users.createdAt));
    return result;
  }

  /**
   * Find users by role
   */
  static async findByRole(role) {
    const result = await db
      .select()
      .from(users)
      .where(sql`${users.roles} @> ARRAY[${role}]::text[]`)
      .orderBy(desc(users.createdAt));
    return result;
  }

  /**
   * Find users by roll number and college
   */
  static async findByRollNumberAndCollege(rollNumber, collegeId) {
    const result = await db
      .select()
      .from(users)
      .where(
        and(
          sql`${users.studentData}->>'rollNumber' = ${rollNumber}`,
          eq(users.collegeId, collegeId)
        )
      )
      .orderBy(desc(users.createdAt));
    return result;
  }

  /**
   * Find all users (with optional filters)
   */
  static async find(filters = {}) {
    let where = [];

    if (filters.email) where.push(eq(users.email, filters.email));
    if (filters.collegeId) where.push(eq(users.collegeId, filters.collegeId));
    if (filters.roles) where.push(sql`${users.roles} @> ARRAY[${filters.roles}]::text[]`);
    if (filters.studentData?.rollNumber) where.push(sql`${users.studentData}->>'rollNumber' = ${filters.studentData.rollNumber}`);

    const result = await db
      .select()
      .from(users)
      .where(where.length ? and(...where) : undefined)
      .orderBy(desc(users.createdAt));

    return result;
  }

  /**
   * Update user by ID
   */
  static async findByIdAndUpdate(id, updates) {
    const [updated] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete user by ID
   */
  static async findByIdAndDelete(id) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return deleted;
  }
}

module.exports = UserModel;
