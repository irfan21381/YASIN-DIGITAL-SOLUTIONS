// src/db/schema/certificates.js

const {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  index,
} = require("drizzle-orm/pg-core");

const { users } = require("./users");
const { courses } = require("./courses");

// CERTIFICATES TABLE
const certificates = pgTable(
  "certificates",
  {
    id: serial("id").primaryKey(),

    // student -> FK users
    studentId: integer("student_id")
      .notNull()
      .references(() => users.id),

    // course -> FK courses
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),

    // status
    status: varchar("status", { length: 20 })
      .notNull()
      .default("PENDING"),

    // approver -> FK users
    approvedBy: integer("approved_by").references(() => users.id),

    // cert unique ID
    certificateId: varchar("certificate_id", { length: 255 }),

    issueDate: timestamp("issue_date"),
    downloadUrl: text("download_url"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },

  // INDEXES
  (table) => ({
    studentIdx: index("cert_student_idx").on(table.studentId),
    courseIdx: index("cert_course_idx").on(table.courseId),

    // unique pair (student + course)
    uniqueStudentCourse: index("cert_unique_student_course_idx")
      .on(table.studentId, table.courseId)
      .unique(),

    certificateIdIdx: index("cert_certificate_id_idx")
      .on(table.certificateId)
      .unique(),
  })
);

module.exports = { certificates };
