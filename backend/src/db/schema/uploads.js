// src/db/schema/uploads.js

const {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
} = require("drizzle-orm/pg-core");
const { users } = require("./users");
const { colleges } = require("./colleges");

const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),

  // Owner (teacher)
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id),

  teacherEmail: varchar("teacher_email", { length: 255 })
    .notNull(),

  // File information
  originalName: varchar("original_name", { length: 255 }).notNull(),
  path: text("path").notNull(),
  fileUrl: text("file_url"),
  fileKey: varchar("file_key", { length: 500 }),

  // Mapping & tagging
  subject: varchar("subject", { length: 255 }),
  unit: integer("unit"),

  // Institutional mapping
  collegeId: integer("college_id")
    .notNull()
    .references(() => colleges.id),

  // Metadata
  uploadedAt: timestamp("uploaded_at").defaultNow(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { uploads };
