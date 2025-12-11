// src/middleware/upload.middleware.js

const multer = require("multer");
const path = require("path");

/* ====================================================================
   🔐 MEMORY STORAGE (for S3)
   ==================================================================== */
const storage = multer.memoryStorage();

/* ====================================================================
   🔐 Allowed MIME types (prevent MIME spoofing)
   ==================================================================== */
const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "video/webm",
  "image/jpeg",
  "image/png",
  "text/plain",
];

/* ====================================================================
   🔐 Allowed file extensions (extra safety)
   ==================================================================== */
const allowedExtensions = [
  ".pdf",
  ".ppt",
  ".pptx",
  ".doc",
  ".docx",
  ".mp4",
  ".webm",
  ".png",
  ".jpg",
  ".jpeg",
  ".txt",
];

/* ====================================================================
   🔥 FILE FILTER — Strong Validation
   ==================================================================== */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (!allowedMimeTypes.includes(mime)) {
    return cb(new Error("Invalid file mimetype"), false);
  }

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Invalid file extension"), false);
  }

  // Prevent uploading executables or scripts
  const forbiddenExt = [".exe", ".bat", ".sh", ".js", ".ts", ".php", ".py"];
  if (forbiddenExt.includes(ext)) {
    return cb(new Error("Executable files are not allowed"), false);
  }

  cb(null, true);
};

/* ====================================================================
   🔥 MAIN MULTER INSTANCE
   ==================================================================== */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});

/* ====================================================================
   📂 SINGLE FILE UPLOADER
   ==================================================================== */
const uploadSingle = (fieldName) => upload.single(fieldName);

/* ====================================================================
   📂 MULTIPLE FILES UPLOADER
   ==================================================================== */
const uploadMultiple = (fieldName, maxCount = 10) =>
  upload.array(fieldName, maxCount);

/* ====================================================================
   📊 CSV IMPORT UPLOADER (Strict Security)
   ==================================================================== */
const uploadCSV = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedCSV = ["text/csv", "application/vnd.ms-excel"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedCSV.includes(file.mimetype)) {
      return cb(new Error("Only CSV files are allowed"), false);
    }

    if (ext !== ".csv") {
      return cb(new Error("File must have .csv extension"), false);
    }

    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
}).single("csv");

/* ====================================================================
   🔥 EXPORTS
   ==================================================================== */
module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadCSV,
};
