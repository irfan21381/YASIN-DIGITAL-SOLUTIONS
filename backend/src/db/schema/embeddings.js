// src/db/schema/embeddings.js

const {
  pgTable,
  serial,
  integer,
  text,
  jsonb,
  timestamp,
  varchar,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");
const { colleges } = require("./colleges");
const { content } = require("./content");

const embeddings = pgTable("embeddings", {
  id: serial("id").primaryKey(),

  // Source document mapping
  docId: integer("doc_id"), // optional legacy upload id
  contentId: integer("content_id").references(() => content.id),

  // Teacher info
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),
  teacherEmail: varchar("teacher_email", { length: 255 })
    .notNull(),

  // Academic metadata
  subject: varchar("subject", { length: 255 }),
  unit: integer("unit"),
  collegeId: integer("college_id")
    .notNull()
    .references(() => colleges.id),

  // Raw extracted text
  textExtracted: text("text_extracted"),

  // Embedding chunks
  embeddings: jsonb("embeddings"), // array of { chunk, embedding, startIndex, endIndex, relevanceScore }

  // Processing status
  isProcessed: integer("is_processed").default(0), // 0/1 boolean-like
  embeddingVersion: integer("embedding_version").default(1),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { embeddings };
