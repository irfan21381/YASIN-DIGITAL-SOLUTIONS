// ------------------------------------------------------------
// AuditLog.model.js (PostgreSQL + Drizzle ORM)
// ------------------------------------------------------------

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

const { users } = require("../schema/users");
const { colleges } = require("../schema/colleges");

// Allowed actions
const AUDIT_ACTIONS = [
  "login",
  "logout",

  "create",
  "update",
  "delete",
  "view",

  "upload",
  "download",

  "import",
  "export",
  "data_access",

  "assign_role",
  "change_permission",

  "quiz_attempt",
  "quiz_submit",
  "assignment_submit",
  "ai_query",
];

const AuditLog = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),

    /** USER performing action */
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),

    /** COLLEGE scope */
    collegeId: integer("college_id")
      .notNull()
      .references(() => colleges.id),

    /** ACTION performed */
    action: varchar("action", { length: 50 }).notNull(),

    /** RESOURCE modified */
    resource: varchar("resource", { length: 150 }).notNull(),

    /** Optional resource ID */
    resourceId: integer("resource_id"),

    /** Flexible JSON metadata */
    details: jsonb("details").default({}),

    /** Device / Network info */
    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: text("user_agent"),

    /** Optional Geo-location */
    location: jsonb("location").default(null),

    /** Timestamp */
    timestamp: timestamp("timestamp").defaultNow(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },

  (table) => ({
    /** Indexes for analytics speed */
    collegeTimeIdx: index("audit_college_timestamp_idx").on(
      table.collegeId,
      table.timestamp
    ),

    userTimeIdx: index("audit_user_timestamp_idx").on(
      table.userId,
      table.timestamp
    ),

    actionTimeIdx: index("audit_action_timestamp_idx").on(
      table.action,
      table.timestamp
    ),

    resourceTimeIdx: index("audit_resource_timestamp_idx").on(
      table.resource,
      table.timestamp
    ),
  })
);

module.exports = {
  AuditLog,
  AUDIT_ACTIONS,
};
