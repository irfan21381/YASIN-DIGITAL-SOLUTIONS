// src/routes/content.routes.js
const express = require('express');
const router = express.Router();

const contentController = require('../controllers/content.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');

/* =========================================================
   🔐 AUTH REQUIRED FOR ALL CONTENT ROUTES
========================================================= */
router.use(authenticate);

/* =========================================================
   📚 CONTENT ROUTES
========================================================= */

// 1️⃣ Get all content (with filters: subject, unit, type, search)
router.get(
  '/',
  contentController.getAllContent
);

// 2️⃣ Get single content by id
router.get(
  '/:id',
  contentController.getContent
);

// 3️⃣ Upload content (Teacher / Manager / Super Admin)
router.post(
  '/',
  authorize('TEACHER', 'COLLEGE_MANAGER', 'SUPER_ADMIN'),
  uploadSingle('file'),
  contentController.uploadContent
);

// 4️⃣ Mark content as Verified (Teacher / Manager / Admin)
router.put(
  '/:id/verify',
  authorize('TEACHER', 'COLLEGE_MANAGER', 'SUPER_ADMIN'),
  contentController.verifyContent
);

// 5️⃣ Delete content (owner or manager or admin – checked inside controller)
router.delete(
  '/:id',
  contentController.deleteContent
);

module.exports = router;
