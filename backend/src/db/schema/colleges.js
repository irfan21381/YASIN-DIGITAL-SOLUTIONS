// src/db/schema/colleges.js

const {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
} = require("drizzle-orm/pg-core");

const colleges = pgTable("colleges", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),

  address: text("address"),
  // Can store phone/email/etc as JSON if you like
  contact: jsonb("contact"),

  // Just store UUID, FK can be added later if needed
  managerId: uuid("manager_id"),

  settings: jsonb("settings"),

  aiChatLimit: integer("ai_chat_limit"),
  aiIngestionLimit: integer("ai_ingestion_limit"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

module.exports = { colleges };
