// src/controllers/certificate.controller.js (Final Version)

const AppError = require("../utils/AppError");
// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"


const { certificates } = require("../db/schema/certificates");
const { courses } = require("../db/schema/courses");
const { users } = require("../db/schema/users");

const { eq, asc } = require("drizzle-orm");

/* ============================================================
   🔐 Helper: Role Check
============================================================ */
const assertApprover = (req, next) => {
  const allowed = ["SUPER_ADMIN", "COLLEGE_MANAGER"];
  if (!allowed.includes(req.user.activeRole)) {
    return next(new AppError("You are not allowed to approve/reject certificates", 403));
  }
};

/* ============================================================
   1. LIST ALL PENDING CERTIFICATE REQUESTS
============================================================ */
exports.getPendingRequests = async (req, res, next) => {
  try {
    const rows = await db
      .select({
        cert: certificates,
        student: {
          id: users.id,
          name: users.name,
          email: users.email,
          studentData: users.studentData,
          collegeId: users.collegeId,
        },
        course: {
          id: courses.id,
          title: courses.title,
          code: courses.code,
        },
      })
      .from(certificates)
      .innerJoin(users, eq(certificates.studentId, users.id))
      .innerJoin(courses, eq(certificates.courseId, courses.id))
      .where(eq(certificates.status, "PENDING"))
      .orderBy(asc(certificates.createdAt));

    const data = rows.map((row) => ({
      ...row.cert,
      student: row.student,
      course: row.course,
    }));

    res.json({ success: true, data });
  } catch (error) {
    next(new AppError("Failed to fetch pending certificates", 500));
  }
};

/* ============================================================
   2. APPROVE CERTIFICATE
============================================================ */
exports.approveCertificate = async (req, res, next) => {
  try {
    assertApprover(req, next);

    const { id } = req.params;

    const rows = await db
      .select({
        cert: certificates,
        student: {
          id: users.id,
          collegeId: users.collegeId,
        },
        course: courses,
      })
      .from(certificates)
      .innerJoin(users, eq(certificates.studentId, users.id))
      .innerJoin(courses, eq(certificates.courseId, courses.id))
      .where(eq(certificates.id, id));

    const row = rows[0];

    if (!row) return next(new AppError("Request not found", 404));

    // Prevent cross-college approvals
    if (row.student.collegeId !== req.user.collegeId && req.user.activeRole !== "SUPER_ADMIN") {
      return next(new AppError("Not allowed (cross-college)", 403));
    }

    if (row.cert.status !== "PENDING") {
      return next(new AppError("This request has already been processed", 400));
    }

    const uniqueId = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const mockUrl = `/api/certificates/download/${uniqueId}`;

    const updated = await db
      .update(certificates)
      .set({
        status: "APPROVED",
        approvedBy: req.user.id,
        certificateId: uniqueId,
        issueDate: new Date(),
        downloadUrl: mockUrl,
        updatedAt: new Date(),
      })
      .where(eq(certificates.id, id))
      .returning();

    res.json({
      success: true,
      message: "Certificate Approved & Generated",
      data: updated[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return next(new AppError("Certificate already exists for this student/course", 409));
    }
    next(new AppError("Approval failed", 500));
  }
};

/* ============================================================
   3. REJECT CERTIFICATE
============================================================ */
exports.rejectCertificate = async (req, res, next) => {
  try {
    assertApprover(req, next);

    const { id } = req.params;

    const updated = await db
      .update(certificates)
      .set({
        status: "REJECTED",
        approvedBy: req.user.id,
        updatedAt: new Date(),
      })
      .where(eq(certificates.id, id))
      .returning();

    if (!updated.length) return next(new AppError("Request not found", 404));

    res.json({
      success: true,
      message: "Request Rejected",
    });
  } catch (error) {
    next(new AppError("Rejection failed", 500));
  }
};
