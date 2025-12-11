// src/db/schema/users.js

const {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
} = require("drizzle-orm/pg-core");
const { colleges } = require("./colleges");

const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password"), // null for OTP-only students

  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),

  roles: text("roles").array(), // text[]
  permissions: text("permissions").array(),
  activeRole: text("active_role"),

  collegeId: uuid("college_id").references(() => colleges.id),

  studentData: jsonb("student_data"), // { rollNumber, year, branch, semester, subjects, ... }
  teacherData: jsonb("teacher_data"), // { employeeId, department, subjects, ... }
  managerData: jsonb("manager_data"),

  otp: jsonb("otp"), // { code, expiresAt }
  profilePicture: text("profile_picture"),

  isActive: boolean("is_active").notNull().default(true),

  lastLogin: timestamp("last_login", { withTimezone: true }),
  usageStats: jsonb("usage_stats"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

module.exports = { users };
