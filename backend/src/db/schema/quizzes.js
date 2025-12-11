// src/db/schema/quizzes.js

const {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  jsonb,
  timestamp,
} = require("drizzle-orm/pg-core");
const { colleges } = require("./colleges");
const { subjects } = require("./subjects");
const { users } = require("./users");

const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),

  // Basic info
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  // Relations
  collegeId: integer("college_id")
    .notNull()
    .references(() => colleges.id),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id),
  unit: integer("unit"),

  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),

  // Questions + settings stored as JSONB
  questions: jsonb("questions"),        // array of question objects
  settings: jsonb("settings"),          // duration, totalMarks, antiCheat, etc.

  // Scheduling
  status: varchar("status", { length: 20 }).default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  expiresAt: timestamp("expires_at"),

  // Access control
  allowedStudents: jsonb("allowed_students"), // array of user ids
  year: integer("year"),
  branch: varchar("branch", { length: 100 }),
  semester: integer("semester"),
  restrictMultipleAttempts: integer("restrict_multiple_attempts"),
  maxAttempts: integer("max_attempts"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { quizzes };
