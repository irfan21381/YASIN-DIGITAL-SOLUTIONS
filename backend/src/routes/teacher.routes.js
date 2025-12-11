const express = require('express');
const router = express.Router();

const teacherController = require('../controllers/teacher.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');

/* ============================================================
   🔐 All teacher routes require authentication
============================================================ */
router.use(authenticate);

/* ============================================================
   📌 1. UPLOAD MATERIAL  
   Allowed: TEACHER, COLLEGE_MANAGER
============================================================ */
router.post(
  '/upload-material',
  authorize('TEACHER', 'COLLEGE_MANAGER'),
  uploadSingle('file'),
  teacherController.uploadMaterial
);

/* ============================================================
   📌 2. MANUAL EMBEDDING PROCESS  
   Allowed: TEACHER, COLLEGE_MANAGER
============================================================ */
router.post(
  '/content/:id/process-embedding',
  authorize('TEACHER', 'COLLEGE_MANAGER'),
  teacherController.processEmbedding
);

module.exports = router;
