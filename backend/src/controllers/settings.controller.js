// src/controllers/settings.controller.js

// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"

const AppError = require("../utils/AppError");

const { colleges } = require("../db/schema/colleges");

const { eq } = require("drizzle-orm");

// Temporary Dummy Global Settings (until DB model exists)
const GLOBAL_SETTINGS = {
  platformName: "YDS EduAI Learning Suite",
  defaultLanguage: "en",
  aiApiCostPerToken: 0.000002,
  defaultAIChatLimit: 10000,
  aiFeaturesEnabled: true,
  registrationOpen: true,
  defaultCollegeSettings: {
    maxStudents: 5000,
    maxTeachers: 100,
  },
};

/* ================================================================
   1️⃣ GET GLOBAL SETTINGS  (SUPER ADMIN ONLY)
================================================================ */
const getGlobalSettings = async (req, res, next) => {
  try {
    // authorize('SUPER_ADMIN') middleware already protects this route
    return res.json({
      success: true,
      data: GLOBAL_SETTINGS,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    next(new AppError("Failed to fetch global settings", 500));
  }
};

/* ================================================================
   2️⃣ UPDATE GLOBAL SETTINGS (SUPER ADMIN ONLY)
================================================================ */
const updateGlobalSettings = async (req, res, next) => {
  try {
    const updates = req.body;

    if (typeof updates !== "object") {
      return next(new AppError("Invalid settings update payload", 400));
    }

    // Apply updates (for actual production → use SettingsModel)
    Object.assign(GLOBAL_SETTINGS, updates);

    console.log("Updated Global Settings:", updates);

    return res.json({
      success: true,
      message: "Global settings updated successfully",
      data: GLOBAL_SETTINGS,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    next(new AppError("Failed to update global settings", 500));
  }
};

/* ================================================================
   3️⃣ GET COLLEGE AI LIMITS  (SUPER ADMIN ONLY)
================================================================ */
const getCollegeAILimits = async (req, res, next) => {
  try {
    const { collegeId } = req.params;

    const [college] = await db
      .select({
        id: colleges.id,
        name: colleges.name,
        code: colleges.code,
        aiChatLimit: colleges.aiChatLimit,
        aiIngestionLimit: colleges.aiIngestionLimit,
      })
      .from(colleges)
      .where(eq(colleges.id, Number(collegeId)));

    if (!college) {
      return next(new AppError("College not found", 404));
    }

    return res.json({
      success: true,
      data: {
        collegeId: college.id,
        name: college.name,
        aiChatLimit: college.aiChatLimit,
        aiIngestionLimit: college.aiIngestionLimit,
      },
    });
  } catch (error) {
    console.error("Get AI limits error:", error);
    next(new AppError("Failed to fetch college AI limits", 500));
  }
};

/* ================================================================
   4️⃣ UPDATE COLLEGE AI LIMITS (SUPER ADMIN ONLY)
================================================================ */
const updateCollegeAILimits = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const { chatLimit, ingestionLimit } = req.body;

    // Basic validation
    if (chatLimit == null || ingestionLimit == null) {
      return next(
        new AppError("chatLimit and ingestionLimit are required", 400)
      );
    }

    const [college] = await db
      .update(colleges)
      .set({
        aiChatLimit: chatLimit,
        aiIngestionLimit: ingestionLimit,
      })
      .where(eq(colleges.id, Number(collegeId)))
      .returning({
        id: colleges.id,
        name: colleges.name,
        code: colleges.code,
        aiChatLimit: colleges.aiChatLimit,
        aiIngestionLimit: colleges.aiIngestionLimit,
      });

    if (!college) {
      return next(new AppError("College not found", 404));
    }

    return res.json({
      success: true,
      message: "College AI limits updated successfully",
      data: college,
    });
  } catch (error) {
    console.error("Update AI limits error:", error);
    next(new AppError("Failed to update college AI limits", 500));
  }
};

module.exports = {
  getGlobalSettings,
  updateGlobalSettings,
  getCollegeAILimits,
  updateCollegeAILimits,
};
