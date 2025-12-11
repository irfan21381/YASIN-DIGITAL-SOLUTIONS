// src/models/codingSession.model.js

import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "../db/schema/users.js";
import { colleges } from "../db/schema/colleges.js";

/**
 * JSONB helper shapes (documented for reference)
 *
 * codeSubmission: {
 *   code, language, input, output, error,
 *   executionTime, memoryUsed,
 *   testCases: [{ input, expectedOutput, actualOutput, passed }],
 *   status, aiFeedback: { suggestion, confidence }, timestamp
 * }
 *
 * problem: {
 *   title, description, difficulty, category,
 *   testCases: [{ input, expectedOutput, isHidden }],
 *   constraints,
 *   examples: [{ input, output, explanation }]
 * }
 *
 * aiAssistance: [
 *   { prompt, response, agentType, tokensUsed, model, timestamp }
 * ]
 */

export const codingSessions = pgTable(
  "coding_sessions",
  {
    id: serial("id").primaryKey(),

    // userId: ObjectId → integer FK
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    collegeId: integer("college_id").references(() => colleges.id),

    title: varchar("title", { length: 255 }),

    // problem subdocument → JSONB
    problem: jsonb("problem"),

    // language enum
    language: varchar("language", { length: 32 }).default("python"),

    // submissions: [codeSubmissionSchema] → JSONB array
    submissions: jsonb("submissions").default([]),

    currentCode: text("current_code").default(""),

    isPublic: boolean("is_public").default(false).notNull(),

    // aiAssistance array → JSONB array
    aiAssistance: jsonb("ai_assistance").default([]),

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
    // codingSessionSchema.index({ userId: 1, updatedAt: -1 });
    userUpdatedIdx: index("coding_sessions_user_updated_idx").on(
      table.userId,
      table.updatedAt,
    ),
    // codingSessionSchema.index({ collegeId: 1 });
    collegeIdx: index("coding_sessions_college_idx").on(table.collegeId),
    // codingSessionSchema.index({ "problem.category": 1 });
    // In Postgres you would add a functional index on (problem->>'category')
    isPublicIdx: index("coding_sessions_is_public_idx").on(table.isPublic),
  }),
);
