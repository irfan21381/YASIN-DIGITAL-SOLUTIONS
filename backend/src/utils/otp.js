const otpGenerator = require("otp-generator");

/* ============================================================
   🔹 Generate 6-Digit OTP (Secure, Numeric Only)
============================================================== */
const generateOTP = () => {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });
};

/* ============================================================
   🔹 Calculate OTP Expiry Timestamp
============================================================== */
const getOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/* ============================================================
   🔹 Check If OTP is Expired
============================================================== */
const isExpired = (expiresAt) => {
  return !expiresAt || new Date() > new Date(expiresAt);
};

/* ============================================================
   🔹 Constant-Time Comparison (prevents timing attacks)
============================================================== */
const safeCompare = (a, b) => {
  if (!a || !b || a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

/* ============================================================
   🔹 Verify OTP (Secure)
============================================================== */
const verifyOTP = (userOTP, storedOTP, expiresAt) => {
  userOTP = String(userOTP || "").trim();
  storedOTP = String(storedOTP || "").trim();

  // Expired
  if (isExpired(expiresAt)) {
    return {
      valid: false,
      reason: "expired",
    };
  }

  // Invalid format
  if (!/^\d{6}$/.test(userOTP)) {
    return {
      valid: false,
      reason: "invalid_format",
    };
  }

  // Not matching
  if (!safeCompare(userOTP, storedOTP)) {
    return {
      valid: false,
      reason: "incorrect",
    };
  }

  return {
    valid: true,
    reason: "success",
  };
};

module.exports = {
  generateOTP,
  getOTPExpiry,
  verifyOTP,
  isExpired,
};
