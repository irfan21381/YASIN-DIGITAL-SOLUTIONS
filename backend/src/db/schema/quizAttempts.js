// src/db/schema/quizAttempts.js

const {
  pgTable,
  serial,
  integer,
  text,
  jsonb,
  timestamp,
  varchar,
} = require("drizzle-orm/pg-core");
const { quizzes } = require("./quizzes");
const { users } = require("./users");
const { colleges } = require("./colleges");

const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),

  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id),

  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),

  collegeId: integer("college_id")
    .notNull()
    .references(() => colleges.id),

  // answers, cheatingEvents, deviceInfo as JSONB blobs
  answers: jsonb("answers"),
  cheatingEvents: jsonb("cheating_events"),
  deviceInfo: jsonb("device_info"),

  startedAt: timestamp("started_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),

  timeSpent: integer("time_spent").default(0),

  totalMarks: integer("total_marks").default(0),
  marksObtained: integer("marks_obtained").default(0),
  percentage: integer("percentage").default(0),

  status: varchar("status", { length: 32 }).default("in_progress"),

  cheatingScore: integer("cheating_score").default(0),

  ipAddress: text("ip_address"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { quizAttempts };
