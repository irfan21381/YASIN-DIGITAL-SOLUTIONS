// ------------------------------------------------------------
// CertificateRequest.model.js (PostgreSQL + Drizzle ORM)
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

const CertificateRequest = pgTable(
  "certificate_requests",
  {
    id: serial("id").primaryKey(),

    // Student who requested certificate
    studentId: integer("student_id")
      .notNull()
      .references(() => users.id),

    // Course completed
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),

    // pending | approved | rejected
    status: varchar("status", { length: 20 }).default("pending"),

    // Admin who approved
    approvedBy: integer("approved_by").references(() => users.id),

    // When certificate was issued
    issuedAt: timestamp("issued_at"),

    // PDF file URL (S3 or Cloudinary)
    certificateUrl: text("certificate_url"),

    // Unique verification code for online validation
    verificationCode: varchar("verification_code", { length: 100 }),

    // Auto timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },

  (table) => ({
    // Unique verification code
    verificationUniqueIdx: index("verification_code_unique_idx")
      .on(table.verificationCode)
      .unique(),

    // Useful filtering
    studentIndex: index("certificate_request_student_idx").on(table.studentId),
    courseIndex: index("certificate_request_course_idx").on(table.courseId),
    statusIndex: index("certificate_request_status_idx").on(table.status),
  })
);

module.exports = { CertificateRequest };
