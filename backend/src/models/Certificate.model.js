// ------------------------------------------------------------
// Certificate.model.js (PostgreSQL + Drizzle ORM)
// ------------------------------------------------------------

const {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  index,
} = require("drizzle-orm/pg-core");

const { users } = require("../schema/users");
const { courses } = require("../schema/courses");

// Allowed certificate statuses
const CERTIFICATE_STATUS = ["PENDING", "APPROVED", "REJECTED"];

const Certificate = pgTable(
  "certificates",
  {
    id: serial("id").primaryKey(),

    // Student who receives certificate
    studentId: integer("student_id")
      .notNull()
      .references(() => users.id),

    // Course completed
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),

    // Certificate approval status
    status: varchar("status", { length: 20 }).default("PENDING"),

    // Admin who approved it
    approvedBy: integer("approved_by").references(() => users.id),

    // Unique certificate string (CERT-2025-XYZ)
    certificateId: varchar("certificate_id", { length: 100 }),

    // Issue date
    issueDate: timestamp("issue_date"),

    // PDF Download URL
    downloadUrl: text("download_url"),

    // Auto timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },

  (table) => ({
    // Unique certificate for same student + same course
    studentCourseUnique: index("certificate_student_course_idx")
      .on(table.studentId, table.courseId)
      .unique(),

    certificateIdUnique: index("certificate_id_unique_idx")
      .on(table.certificateId)
      .unique(),
  })
);

module.exports = {
  Certificate,
  CERTIFICATE_STATUS,
};
