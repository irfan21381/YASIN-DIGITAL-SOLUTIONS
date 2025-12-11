// src/db/schema/assignments.js
// PostgreSQL + Drizzle version of Assignment.model.js (FINAL JS VERSION)

const {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
} = require("drizzle-orm/pg-core");

const { colleges } = require("./colleges");
const { users } = require("./users");

const assignments = pgTable(
  "assignments",
  {
    id: serial("id").primaryKey(),

    // BASIC FIELDS
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    // RELATIONS
    collegeId: integer("college_id")
      .notNull()
      .references(() => colleges.id),

    subjectId: integer("subject_id").notNull(),

    unit: integer("unit"),

    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),

    // 🎯 JSONB FIELDS (No TS generics in JS)
    assignedTo: jsonb("assigned_to").default([]),

    assignmentCriteria: jsonb("assignment_criteria").default({}),

    // 📅 Timeline
    dueDate: timestamp("due_date"),

    maxMarks: integer("max_marks").default(100),

    // 📎 Attachments
    attachments: jsonb("attachments").default([]),

    // 🏷️ Status
    status: varchar("status", { length: 20 }).default("draft"),

    // 📤 Submissions
    submissions: jsonb("submissions").default([]),

    // TIMESTAMPS
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    collegeSubjectIdx: index("assignments_college_subject_idx").on(
      table.collegeId,
      table.subjectId
    ),

    createdByIdx: index("assignments_created_by_idx").on(table.createdBy),

    statusIdx: index("assignments_status_idx").on(table.status),

    dueDateIdx: index("assignments_due_date_idx").on(table.dueDate),
  })
);

module.exports = { assignments };
