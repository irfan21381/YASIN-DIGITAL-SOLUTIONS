// src/db/schema/auditLogs.js

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

const { users } = require("./users");
const { colleges } = require("./colleges");

const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),

    // User performing action
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),

    // College scope
    collegeId: integer("college_id")
      .notNull()
      .references(() => colleges.id),

    // Action performed
    action: varchar("action", { length: 50 }).notNull(),

    // Resource (User, Content, Quiz)
    resource: varchar("resource", { length: 100 }).notNull(),

    // Optional resource ID
    resourceId: integer("resource_id"),

    // Flexible metadata (JSONB)
    details: jsonb("details").default({}).notNull(),

    // Device + network
    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: text("user_agent"),

    // Geo-location (JSONB)
    location: jsonb("location").default(null),

    // Primary timestamp
    timestamp: timestamp("timestamp").notNull().defaultNow(),

    // Auto timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },

  // INDEXES
  (table) => ({
    collegeTS: index("audit_college_ts_idx").on(
      table.collegeId,
      table.timestamp
    ),
    userTS: index("audit_user_ts_idx").on(
      table.userId,
      table.timestamp
    ),
    actionTS: index("audit_action_ts_idx").on(
      table.action,
      table.timestamp
    ),
    resourceTS: index("audit_resource_ts_idx").on(
      table.resource,
      table.timestamp
    ),
  })
);

module.exports = { auditLogs };
