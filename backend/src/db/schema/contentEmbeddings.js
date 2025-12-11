// src/db/schema/contentEmbeddings.js

const {
  pgTable,
  serial,
  integer,
  text,
  jsonb,
  timestamp,
} = require("drizzle-orm/pg-core");

const { content } = require("./content");

const contentEmbeddings = pgTable("content_embeddings", {
  id: serial("id").primaryKey(),

  contentId: integer("content_id")
    .notNull()
    .references(() => content.id),

  chunk: text("chunk").notNull(),

  // JSONB array (example: [0.12, -0.44, ...])
  embedding: jsonb("embedding").notNull(),

  startIndex: integer("start_index"),
  endIndex: integer("end_index"),

  createdAt: timestamp("created_at").defaultNow(),
});

module.exports = { contentEmbeddings };
