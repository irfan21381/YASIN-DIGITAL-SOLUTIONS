// src/db/schema/chats.js

const {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");
const { colleges } = require("./colleges");
const { subjects } = require("./subjects");

const chats = pgTable(
  "chats",
  {
    id: serial("id").primaryKey(),

    studentId: integer("student_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    collegeId: integer("college_id")
      .references(() => colleges.id, { onDelete: "cascade" })
      .notNull(),

    subjectId: integer("subject_id").references(() => subjects.id),

    unit: integer("unit"),

    title: varchar("title", { length: 255 }),

    lastMessage: text("last_message").default(""),
    lastMessageAt: timestamp("last_message_at", {
      withTimezone: false,
      mode: "date",
    }).defaultNow(),

    isActive: boolean("is_active").default(true).notNull(),

    // store the enum in JS as plain string
    aiAgentType: varchar("ai_agent_type", { length: 64 }).default("doubt_solver"),

    contextContentIds: jsonb("context_content_ids").default([]),

    createdAt: timestamp("created_at", {
      withTimezone: false,
      mode: "date",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: false,
      mode: "date",
    }).defaultNow(),
  },
  (table) => ({
    studentUpdatedIdx: index("chats_student_updated_idx").on(
      table.studentId,
      table.updatedAt,
    ),
    collegeSubjectIdx: index("chats_college_subject_idx").on(
      table.collegeId,
      table.subjectId,
    ),
    lastMessageAtIdx: index("chats_last_message_at_idx").on(table.lastMessageAt),
    aiAgentTypeIdx: index("chats_ai_agent_type_idx").on(table.aiAgentType),
    isActiveIdx: index("chats_is_active_idx").on(table.isActive),
  }),
);

module.exports = { chats };
