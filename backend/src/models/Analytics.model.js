// src/db/schema/analytics.js

const {
  pgTable,
  serial,
  integer,
  text,
  jsonb,
  timestamp,
} = require("drizzle-orm/pg-core");

const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),

  userId: integer("user_id"), // nullable (public users may not be logged in)

  collegeId: integer("college_id")
    .notNull(), // required field

  type: text("type")
    .notNull(), // login, content_view, quiz_attempt, etc

  metadata: jsonb("metadata").default({}), // flexible JSON object

  timestamp: timestamp("timestamp")
    .defaultNow(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { analytics };
