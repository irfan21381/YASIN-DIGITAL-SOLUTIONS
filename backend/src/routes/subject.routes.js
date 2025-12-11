const express = require("express");
const router = express.Router();

const subjectController = require("../controllers/subject.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// 🔐 All subject routes require authentication
router.use(authenticate);

/* =========================================================
   📘 GET ALL SUBJECTS (College-based Filtering)
   Accessible by: All authenticated roles (Student, Teacher, Manager, Admin)
========================================================= */
router.get("/", subjectController.getSubjects);

/* =========================================================
   ➕ CREATE SUBJECT
   Allowed Roles: COLLEGE_MANAGER, SUPER_ADMIN
========================================================= */
router.post(
  "/",
  authorize("COLLEGE_MANAGER", "SUPER_ADMIN"),
  subjectController.createSubject
);

/* =========================================================
   ✏️ UPDATE SUBJECT
   Allowed Roles: COLLEGE_MANAGER, SUPER_ADMIN
========================================================= */
router.put(
  "/:id",
  authorize("COLLEGE_MANAGER", "SUPER_ADMIN"),
  subjectController.updateSubject
);

module.exports = router;
