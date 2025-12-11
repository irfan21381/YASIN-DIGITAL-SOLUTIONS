// src/controllers/material.controller.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const AppError = require("../utils/AppError");

const { uploads } = require("../db/schema/uploads");
const { content } = require("../db/schema/content");
const { embeddings } = require("../db/schema/embeddings");

const { uploadToS3 } = require("../config/aws");
const { extractTextFromPDF } = require("../utils/pdfExtractor");
const { processContentForEmbedding } = require("../services/ai/doubtSolver.service");

const { eq } = require("drizzle-orm");

/* ========================================================================
   📌 1. UPLOAD MATERIAL (Teacher / Manager)
======================================================================== */
const uploadMaterial = async (req, res) => {
  try {
    const { subjectId, subject, unit, title, description, type } = req.body;

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No file provided",
      });
    }

    const teacherId = req.user.id;
    const teacherEmail = req.user.email;
    const collegeId = req.user.collegeId;

    const finalSubject = subjectId || subject;
    const finalUnit = parseInt(unit) || 1;
    const finalType = type || "pdf";

    /* ---------------------------------------------------------
       1️⃣ Upload file to S3
    --------------------------------------------------------- */
    let fileUrl = "";
    let fileKey = "";

    try {
      fileUrl = await uploadToS3(req.file, "content");

      // example: bucket/content/filename.pdf → content/filename.pdf
      const parts = fileUrl.split("/");
      fileKey = `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
    } catch (err) {
      console.error("❌ S3 Upload Failed:", err);

      // Fallback (optional)
      fileUrl = `/uploads/${req.file.originalname}`;
      fileKey = "";
    }

    /* ---------------------------------------------------------
       2️⃣ PDF → Extract Text
    --------------------------------------------------------- */
    let extractedText = "EXTRACT_PLACEHOLDER";

    const isPDF = finalType === "pdf" || req.file.mimetype === "application/pdf";

    if (isPDF) {
      try {
        extractedText = await extractTextFromPDF(req.file.buffer);
      } catch (err) {
        console.error("❌ PDF Extraction Failed:", err);
      }
    }

    /* ---------------------------------------------------------
       3️⃣ Save Upload Record
    --------------------------------------------------------- */
    const [upload] = await db
      .insert(uploads)
      .values({
        teacherId,
        teacherEmail,
        originalName: req.file.originalname,
        fileUrl,
        fileKey,
        subject: finalSubject,
        unit: finalUnit,
        collegeId,
      })
      .returning();

    /* ---------------------------------------------------------
       4️⃣ Create Content Record
    --------------------------------------------------------- */
    const [content] = await db
      .insert(content)
      .values({
        title: title || req.file.originalname,
        description: description || "",
        type: finalType,
        fileUrl,
        fileKey,
        collegeId,
        subjectId: finalSubject,
        unit: finalUnit,
        uploadedBy: teacherId,
        extractedText,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      })
      .returning();

    /* ---------------------------------------------------------
       5️⃣ Create Embedding Task
    --------------------------------------------------------- */
    const [embedding] = await db
      .insert(embeddings)
      .values({
        docId: upload.id,
        contentId: content.id,
        teacherId,
        teacherEmail,
        subject: finalSubject,
        unit: finalUnit,
        textExtracted: extractedText,
        collegeId,
        isProcessed: false,
      })
      .returning();

    /* ---------------------------------------------------------
       6️⃣ Background RAG Processing
    --------------------------------------------------------- */
    if (extractedText !== "EXTRACT_PLACEHOLDER") {
      processContentForEmbedding(content.id).catch((err) =>
        console.error("❌ Embedding background error:", err)
      );
    }

    /* ---------------------------------------------------------
       7️⃣ Response
    --------------------------------------------------------- */
    return res.json({
      ok: true,
      message: "Material uploaded successfully",
      data: {
        uploadId: upload.id,
        contentId: content.id,
        embeddingId: embedding.id,
      },
    });
  } catch (error) {
    console.error("❌ Upload Material Error:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to upload material",
      error: error.message,
    });
  }
};

/* ========================================================================
   📌 2. MANUAL EMBEDDING PROCESS
======================================================================== */
const processEmbedding = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await processContentForEmbedding(id);

    res.json({
      success: true,
      message: "Content processed for AI successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Embedding Process Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process content",
    });
  }
};

module.exports = {
  uploadMaterial,
  processEmbedding,
};
