// src/db/schema/chatMessages.js

const {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} = require("drizzle-orm/pg-core");
const { chats } = require("./chats");

const chatMessages = pgTable(
  "chat_messages",
  {
    id: serial("id").primaryKey(),

    chatId: integer("chat_id")
      .references(() => chats.id, { onDelete: "cascade" })
      .notNull(),

    role: varchar("role", { length: 32 }).notNull(), // "user" | "assistant" | "system"

    content: text("content").notNull(),

    timestamp: timestamp("timestamp", {
      withTimezone: false,
      mode: "date",
    }).defaultNow(),

    // array of RAG source objects as JSONB
    sources: jsonb("sources"),

    // AI metadata as JSONB
    aiMeta: jsonb("ai_meta"),
  },
  (table) => ({
    chatTimeIdx: index("chat_messages_chat_time_idx").on(
      table.chatId,
      table.timestamp,
    ),
  }),
);

module.exports = { chatMessages };
