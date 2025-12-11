// src/db/schema/subjects.js

const {
  pgTable,
  serial,
  integer,
  varchar,
  boolean,
  jsonb,
  timestamp,
} = require("drizzle-orm/pg-core");
const { colleges } = require("./colleges");
const { users } = require("./users");

const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),

  // Basic info
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),

  // College mapping
  collegeId: integer("college_id")
    .notNull()
    .references(() => colleges.id),

  // Academic mapping
  year: integer("year").notNull(),
  branch: varchar("branch", { length: 100 }).notNull(),
  semester: integer("semester").notNull(),

  // Teacher mapping
  teacherId: integer("teacher_id").references(() => users.id),

  // Units as JSONB (array of { number, name, description })
  units: jsonb("units"),

  // Credits
  credits: integer("credits").default(3),

  // Status
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { subjects };
