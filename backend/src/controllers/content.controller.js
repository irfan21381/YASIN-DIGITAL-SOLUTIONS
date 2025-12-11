// src/controllers/content.controller.js

const AppError = require("../utils/AppError");
// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"


const { content } = require("../db/schema/content");
const { users } = require("../db/schema/users");
const { subjects } = require("../db/schema/subjects");

const { uploadToS3, getSignedUrl, deleteFromS3 } = require("../config/aws");
const { extractTextFromPDF } = require("../utils/pdfExtractor");
const { processContentForEmbedding } = require("../services/ai/doubtSolver.service");

const { eq, and, sql, desc } = require("drizzle-orm");

/* ====================================================================
   🔥 UTIL: Extract clean S3 key from URL
==================================================================== */
const extractS3Key = (url) => {
  try {
    const parts = url.split("/");
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  } catch {
    return null;
  }
};

/* ====================================================================
   🟩 1. UPLOAD CONTENT
==================================================================== */
const uploadContent = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "File is required" });
    }

    const {
      title,
      description,
      type,
      subjectId,
      unit,
      year,
      branch,
      semester,
      accessLevel,
    } = req.body;

    if (!title || !subjectId) {
      return res.status(400).json({
        success: false,
        message: "Title and subjectId are required",
      });
    }

    const fileUrl = await uploadToS3(req.file, "content");
    const fileKey = extractS3Key(fileUrl);

    if (!fileKey) {
      return next(new AppError("Failed to parse S3 key", 500));
    }

    // Extract text for RAG
    let extractedText = "";
    if (type === "pdf" && req.file.mimetype === "application/pdf") {
      try {
        extractedText = await extractTextFromPDF(req.file.buffer);
      } catch (err) {
        console.error("PDF extract error:", err);
      }
    }

    // Insert content record
    const [content] = await db
      .insert(content)
      .values({
        title,
        description,
        type,
        fileUrl,
        fileKey,
        collegeId: req.user.collegeId,
        subjectId: Number(subjectId),
        unit: unit ? Number(unit) : null,
        year: year ? Number(year) : null,
        branch,
        semester: semester ? Number(semester) : null,
        uploadedBy: req.user.id,
        extractedText,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        accessLevel: accessLevel || "all",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Background RAG embedding
    if (extractedText && ["pdf", "notes"].includes(type)) {
      processContentForEmbedding(content.id).catch((e) =>
        console.error("RAG embedding error:", e)
      );
    }

    res.status(201).json({
      success: true,
      message: "Content uploaded successfully",
      data: content,
    });
  } catch (error) {
    console.error("Upload error:", error);
    next(new AppError("Failed to upload content", 500));
  }
};

/* ====================================================================
   🟦 2. GET CONTENT BY ID (Signed URL + Access Control)
==================================================================== */
const getContent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rows = await db
      .select({
        content: content,
        subject: {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
        },
        uploader: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(content)
      .leftJoin(subjects, eq(content.subjectId, subjects.id))
      .leftJoin(users, eq(content.uploadedBy, users.id))
      .where(eq(content.id, Number(id)));

    const row = rows[0];
    if (!row) {
      return next(new AppError("Content not found", 404));
    }

    const content = {
      ...row.content,
      subject: row.subject,
      uploadedBy: row.uploader,
    };

    // College access
    if (
      content.collegeId !== req.user.collegeId &&
      !req.user.roles.includes("SUPER_ADMIN")
    ) {
      return next(new AppError("Access denied", 403));
    }

    // Students can only view verified
    if (req.user.roles.includes("STUDENT") && !content.isVerified) {
      return next(new AppError("Content pending verification", 403));
    }

    content.signedUrl = await getSignedUrl(content.fileKey);

    res.json({ success: true, data: content });
  } catch (error) {
    console.error("Get content error:", error);
    next(new AppError("Failed to fetch content", 500));
  }
};

/* ====================================================================
   🟨 3. GET ALL CONTENT (Filters + Pagination)
==================================================================== */
const getAllContent = async (req, res, next) => {
  try {
    const {
      subjectId,
      unit,
      year,
      branch,
      semester,
      type,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = [eq(content.collegeId, req.user.collegeId)];

    if (subjectId) filters.push(eq(content.subjectId, Number(subjectId)));
    if (unit) filters.push(eq(content.unit, Number(unit)));
    if (year) filters.push(eq(content.year, Number(year)));
    if (branch) filters.push(eq(content.branch, branch));
    if (semester) filters.push(eq(content.semester, Number(semester)));
    if (type) filters.push(eq(content.type, type));

    if (req.user.roles.includes("STUDENT")) {
      filters.push(eq(content.isVerified, true));
    }

    const offset = (page - 1) * limit;

    const data = await db
      .select({
        content: content,
        subject: {
          id: subjects.id,
          name: subjects.name,
          code: subjects.code,
        },
        uploader: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(content)
      .leftJoin(subjects, eq(content.subjectId, subjects.id))
      .leftJoin(users, eq(content.uploadedBy, users.id))
      .where(and(...filters))
      .orderBy(desc(content.createdAt))
      .limit(Number(limit))
      .offset(offset);

    const totalRows = await db
      .select({ count: sql`COUNT(*)` })
      .from(content)
      .where(and(...filters));

    const total = Number(totalRows[0].count);

    res.json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all content error:", error);
    next(new AppError("Failed to fetch content", 500));
  }
};

/* ====================================================================
   🟧 4. VERIFY CONTENT (Teacher / Manager / SuperAdmin)
==================================================================== */
const verifyContent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [content] = await db
      .select()
      .from(content)
      .where(eq(content.id, Number(id)));

    if (!content) return next(new AppError("Content not found", 404));

    const isTeacher =
      req.user.roles.includes("TEACHER") &&
      req.user.collegeId === content.collegeId;

    const isManager =
      req.user.roles.includes("COLLEGE_MANAGER") &&
      req.user.collegeId === content.collegeId;

    const isSuper = req.user.roles.includes("SUPER_ADMIN");

    if (!isTeacher && !isManager && !isSuper) {
      return next(new AppError("No permission to verify", 403));
    }

    const [updated] = await db
      .update(content)
      .set({
        isVerified: true,
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(content.id, content.id))
      .returning();

    res.json({
      success: true,
      message: "Content verified successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Verify content error:", error);
    next(new AppError("Failed to verify content", 500));
  }
};

/* ====================================================================
   🟥 5. DELETE CONTENT (Owner + Manager + SuperAdmin)
==================================================================== */
const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [content] = await db
      .select()
      .from(content)
      .where(eq(content.id, Number(id)));

    if (!content) return next(new AppError("Content not found", 404));

    const isOwner = content.uploadedBy === req.user.id;
    const isManager =
      req.user.roles.includes("COLLEGE_MANAGER") &&
      req.user.collegeId === content.collegeId;
    const isSuper = req.user.roles.includes("SUPER_ADMIN");

    if (!isOwner && !isManager && !isSuper) {
      return next(new AppError("No permission to delete content", 403));
    }

    if (content.fileKey) {
      await deleteFromS3(content.fileKey);
    }

    await db.delete(content).where(eq(content.id, content.id));

    res.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Delete content error:", error);
    next(new AppError("Failed to delete content", 500));
  }
};

module.exports = {
  uploadContent,
  getContent,
  getAllContent,
  verifyContent,
  deleteContent,
};
