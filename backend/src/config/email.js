// ------------------------------------------------------------
// email.js (2025 Updated – Production Ready)
// ------------------------------------------------------------

const nodemailer = require("nodemailer");
const logger = require("./logger");

// ------------------------------------------------------------
// 1️⃣ Create Nodemailer Transporter
// ------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: Number(process.env.EMAIL_PORT) === 465, // SSL only for 465

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  tls: {
    rejectUnauthorized: false, // required for shared hosting / cPanel SMTP
  },

  pool: true, // 🔥 improves performance for multiple emails
  maxConnections: 5,
  maxMessages: 30,
});

// ------------------------------------------------------------
// 2️⃣ Verify SMTP (dev mode only)
// ------------------------------------------------------------
if (process.env.NODE_ENV !== "production") {
  transporter.verify().then(() => {
    console.log("📩 Email SMTP Ready");
  }).catch((err) => {
    console.error("❌ Email Config Error:", err.message);
  });
}

// ------------------------------------------------------------
// 3️⃣ Send OTP Email
// ------------------------------------------------------------
const sendOTP = async (email, otp) => {
  try {
    const expire = Number(process.env.OTP_EXPIRE_MINUTES || 10);

    const mailOptions = {
      from: `"YDS EduAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for YDS EduAI Login",

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color: #4F46E5; text-align: center;">Your Login OTP</h2>

          <p>Hello,</p>
          <p>Your OTP to login into <strong>YDS EduAI</strong> is:</p>

          <div style="
            background: #F3F4F6;
            padding: 16px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
          ">
            <h1 style="color: #4F46E5; margin: 0; font-size: 34px; letter-spacing: 6px;">
              ${String(otp).padStart(6, "0")}
            </h1>
          </div>

          <p>This OTP is valid for <strong>${expire} minutes</strong>.</p>
          <p style="color: #6B7280; font-size: 12px;">
            If you did not request this OTP, please ignore this message.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`📨 OTP sent to: ${email}`);
    return true;

  } catch (error) {
    logger.error("❌ Email Send Error:", error.message);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = {
  transporter,
  sendOTP,
};
