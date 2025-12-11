// src/db/schema/codingSessions.js

const {
  pgTable,
  serial,
  integer,
  text,
  jsonb,
  timestamp,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");

const codingSessions = pgTable("coding_sessions", {
  id: serial("id").primaryKey(),

  studentId: integer("student_id")
    .notNull()
    .references(() => users.id),

  questionId: integer("question_id"),

  language: text("language"),
  status: text("status"), // e.g. "in_progress", "completed"

  currentCode: text("current_code"),
  submissions: jsonb("submissions"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { codingSessions };
