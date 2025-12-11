// src/db/schema/assignments.js

const {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  jsonb,
  timestamp,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");
const { colleges } = require("./colleges");
const { subjects } = require("./subjects");

const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

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

  dueDate: timestamp("due_date").notNull(),
  maxMarks: integer("max_marks"),

  assignmentCriteria: jsonb("assignment_criteria").default({}),
  assignedTo: jsonb("assigned_to").default([]),   // array of student ids
  submissions: jsonb("submissions").default([]),  // array of { studentId, status, marks, files, submittedAt }

  status: varchar("status", { length: 32 }).default("active"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { assignments };
