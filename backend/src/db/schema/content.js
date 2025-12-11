// src/db/schema/content.js

const {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
} = require("drizzle-orm/pg-core");
const { colleges } = require("./colleges");
const { subjects } = require("./subjects");
const { users } = require("./users");

const content = pgTable("content", {
  id: serial("id").primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 5000 }),
  type: varchar("type", { length: 50 }).default("pdf"),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileKey: varchar("file_key", { length: 500 }),

  collegeId: integer("college_id")
    .notNull()
    .references(() => colleges.id),

  subjectId: integer("subject_id").references(() => subjects.id),

  unit: integer("unit"),
  uploadedBy: integer("uploaded_by").references(() => users.id),

  extractedText: varchar("extracted_text", { length: 20000 }),

  isEmbedded: boolean("is_embedded").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { content };
