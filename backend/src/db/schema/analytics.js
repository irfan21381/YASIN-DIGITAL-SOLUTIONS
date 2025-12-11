// src/db/schema/analytics.js

const {
  pgTable,
  serial,
  integer,
  varchar,
  jsonb,
  timestamp,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");
const { colleges } = require("./colleges");

const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  collegeId: integer("college_id").notNull().references(() => colleges.id),
  type: varchar("type", { length: 50 }).notNull(),
  metadata: jsonb("metadata").default({}),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { analytics };
