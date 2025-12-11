// src/controllers/auth.controller.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// env
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const OTP_JWT_SECRET = process.env.OTP_JWT_SECRET || "otpsecret";
const OTP_EXPIRES_MIN = Number(process.env.OTP_EXPIRES_MIN || 10);

// Simple logger fallback (so file doesn't crash if you don't have config/logger)
const logger = console;

/* -------------------------
   Email transporter
--------------------------*/
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 465),
  secure: Number(process.env.EMAIL_PORT || 465) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* -------------------------
   Helpers
--------------------------*/
function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function signAuthToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function signOtpToken(payload) {
  return jwt.sign(payload, OTP_JWT_SECRET, { expiresIn: `${OTP_EXPIRES_MIN}m` });
}

async function sendOtpEmail(email, code) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your YDS OTP",
    text: `Your YDS OTP is ${code}. It is valid for ${OTP_EXPIRES_MIN} minutes.`,
    html: `<p>Your YDS OTP is <b>${code}</b>. It is valid for ${OTP_EXPIRES_MIN} minutes.</p>`,
  };
  return transporter.sendMail(mailOptions);
}

/* ===========================
   Controller functions
   =========================== */

/**
 * sendOTPToEmail
 * - expects: { email, role }
 * - If user not found and role === "STUDENT": creates user + student profile
 * - If user exists but role mismatch: returns error
 * - Returns otpToken (short-lived) to client; OTP is emailed
 */
const sendOTPToEmail = async (req, res, next) => {
  try {
    let { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ success: false, message: "Email and role are required" });
    }

    email = String(email).trim().toLowerCase();
    role = String(role).trim().toUpperCase();

    // find user
    const user = await prisma.user.findUnique({ where: { email } });

    // If user doesn't exist -> allow only STUDENT auto-create
    if (!user) {
      if (role !== "STUDENT") {
        return res.status(400).json({ success: false, message: `Email not registered as ${role}. Contact admin.` });
      }

      const otp = generateOtpCode();
      const otpHash = hashOtp(otp);

      // create user + student profile
      const created = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0],
          role: "STUDENT",
          // password left null for OTP-only accounts
          student: { create: {} },
          isVerified: true,
        },
        include: {
          student: true,
        },
      });

      // sign OTP token with hashed otp & email
      const otpToken = signOtpToken({ email: created.email, otpHash });

      // email OTP (best-effort)
      try {
        await sendOtpEmail(email, otp);
      } catch (e) {
        logger.error("Email send failed:", e?.message || e);
      }

      return res.json({
        success: true,
        message: "OTP sent and student account created",
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
        otpToken,
        email: created.email,
      });
    }

    // User exists -> check role match
    // NOTE: your Prisma model has single 'role' enum. If you previously used multiple roles,
    // you need to store array in DB. Here we check equality.
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This email exists but is not registered as ${role}.`,
      });
    }

    // create OTP token (stateless) and email OTP
    const otp = generateOtpCode();
    const otpHash = hashOtp(otp);
    const otpToken = signOtpToken({ email: user.email, otpHash });

    try {
      await sendOtpEmail(user.email, otp);
    } catch (e) {
      logger.error("Email send failed:", e?.message || e);
    }

    return res.json({
      success: true,
      message: "OTP sent successfully",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
      otpToken,
      email: user.email,
    });
  } catch (err) {
    logger.error("sendOTPToEmail error:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

/**
 * verifyOTPAndLogin
 * - expects { email, otp, otpToken }
 * - verifies signed otpToken + otp
 * - if user missing, creates a STUDENT user (but with schema above we already created in send step)
 * - returns JWT auth token and public user object
 */
const verifyOTPAndLogin = async (req, res, next) => {
  try {
    let { email, otp, otpToken } = req.body;
    if (!email || !otp || !otpToken) {
      return res.status(400).json({ success: false, message: "email, otp and otpToken required" });
    }

    email = String(email).trim().toLowerCase();
    otp = String(otp).trim();

    // verify token signature & expiry
    let decoded;
    try {
      decoded = jwt.verify(otpToken, OTP_JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, message: "Invalid or expired otpToken" });
    }

    if (decoded.email !== email) {
      return res.status(401).json({ success: false, message: "Token email mismatch" });
    }

    const otpHash = hashOtp(otp);
    if (otpHash !== decoded.otpHash) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    // find user, create if missing (rare)
    let user = await prisma.user.findUnique({
      where: { email },
      include: { student: true, teacher: true, manager: true },
    });

    if (!user) {
      // create student account
      user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0],
          role: "STUDENT",
          isVerified: true,
          student: { create: {} },
        },
        include: { student: true, teacher: true, manager: true },
      });
    }

    // create auth token
    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "login",
          resource: "auth",
          meta: { ip: req.ip, ua: req.headers["user-agent"] },
        },
      });
    } catch (e) {
      logger.error("Audit log failed:", e?.message || e);
    }

    // Build public user object
    const publicUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      // profile: student/teacher/manager
      studentData: user.student || null,
      teacherData: user.teacher || null,
      managerData: user.manager || null,
    };

    return res.json({ success: true, message: "Login successful", token, data: { token, user: publicUser } });
  } catch (err) {
    logger.error("verifyOTPAndLogin error:", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};

/**
 * loginWithPassword
 * - expects { email, password }
 */
const loginWithPassword = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    email = email ? String(email).trim().toLowerCase() : "";
    password = password ? String(password).trim() : "";

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email & password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true, teacher: true, manager: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: "Password login not enabled for this account" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });

    const publicUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      studentData: user.student || null,
      teacherData: user.teacher || null,
      managerData: user.manager || null,
    };

    return res.json({ success: true, message: "Password login successful", token, data: { token, user: publicUser } });
  } catch (err) {
    logger.error("loginWithPassword error:", err);
    return res.status(500).json({ success: false, message: "Password login failed" });
  }
};

/**
 * switchRole
 * - Your Prisma schema uses single enum `role`. Multi-role arrays are not present.
 * - To preserve safety, this endpoint will only succeed if requested role equals current role.
 * - If you want multi-role switching (like toggling activeRole), add a `roles Json` field to User schema.
 */
const switchRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ success: false, message: "Role required" });

    // req.user must be injected by your auth middleware (user id + email + role)
    const reqUser = req.user;
    if (!reqUser) return res.status(401).json({ success: false, message: "Unauthorized" });

    const desired = String(role).toUpperCase();
    if (reqUser.role !== desired) {
      return res.status(403).json({
        success: false,
        message:
          "Role switching to a role you don't have is not supported with the current schema. Contact admin.",
      });
    }

    // nothing to update in DB for single-role schema — just return success
    return res.json({ success: true, message: "Role switched", data: { activeRole: desired } });
  } catch (err) {
    logger.error("switchRole error:", err);
    return res.status(500).json({ success: false, message: "Failed to switch role" });
  }
};

/**
 * getCurrentUser
 * - Uses req.user.id (injected by auth middleware)
 * - Returns joined college if available via student/teacher/manager relationship
 */
const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: "Unauthorized" });
    const userId = Number(req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: { include: { college: true } },
        teacher: { include: { college: true } },
        manager: { include: { college: true } },
      },
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // derive college from available profile (student > teacher > manager)
    let college = null;
    if (user.student?.college) college = user.student.college;
    else if (user.teacher?.college) college = user.teacher.college;
    else if (user.manager?.college) college = user.manager.college;

    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      college: college ? { id: college.id, name: college.name, code: college.code } : null,
      studentData: user.student || null,
      teacherData: user.teacher || null,
      managerData: user.manager || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.json({ success: true, data: result });
  } catch (err) {
    logger.error("getCurrentUser error:", err);
    return res.status(500).json({ success: false, message: "Failed to load user" });
  }
};

/**
 * logout - logs audit record and returns success
 */
const logout = async (req, res) => {
  try {
    if (req.user && req.user.id) {
      await prisma.activityLog.create({
        data: {
          userId: Number(req.user.id),
          action: "logout",
          resource: "auth",
          meta: { ip: req.ip, ua: req.headers["user-agent"] },
        },
      });
    }
  } catch (e) {
    logger.error("Logout audit failed:", e?.message || e);
  }

  return res.json({ success: true, message: "Logout successful" });
};

module.exports = {
  sendOTPToEmail,
  verifyOTPAndLogin,
  loginWithPassword,
  switchRole,
  getCurrentUser,
  logout,
};
