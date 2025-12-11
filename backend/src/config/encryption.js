// ------------------------------------------------------------
// crypto.js (2025 Updated — Production Ready)
// AES-256-GCM Encryption + Password Hashing Utilities
// ------------------------------------------------------------

const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// ------------------------------------------------------------
// AES-256-GCM Setup
// ------------------------------------------------------------
const ALGO = "aes-256-gcm";
const DEFAULT_KEY = "1234567890abcdef1234567890abcdef"; // Dev only (32 chars)

// Ensure key is 32 bytes
let key = process.env.ENCRYPTION_KEY || DEFAULT_KEY;

if (key.length !== 32) {
  console.warn(
    "⚠ WARNING: ENCRYPTION_KEY must be 32 chars long. Using fallback development key."
  );
  key = DEFAULT_KEY;
}

key = Buffer.from(key, "utf8");

// ------------------------------------------------------------
// 1️⃣ Encrypt (Text or JSON)
// ------------------------------------------------------------
const encrypt = (data) => {
  try {
    const plain = typeof data === "string" ? data : JSON.stringify(data);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGO, key, iv);

    const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString("hex"),
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    };
  } catch (err) {
    console.error("❌ Encryption Error:", err.message);
    throw new Error("Encryption failed");
  }
};

// ------------------------------------------------------------
// 2️⃣ Decrypt (Text or JSON)
// ------------------------------------------------------------
const decrypt = (payload) => {
  try {
    const { encrypted, iv, authTag } = payload;

    const decipher = crypto.createDecipheriv(
      ALGO,
      key,
      Buffer.from(iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, "hex")),
      decipher.final(),
    ]).toString("utf8");

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted; // plain text
    }
  } catch (err) {
    console.error("❌ Decryption Error:", err.message);
    throw new Error("Decryption failed");
  }
};

// ------------------------------------------------------------
// 3️⃣ Hash Password (bcrypt)
// ------------------------------------------------------------
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  } catch (err) {
    console.error("❌ Password Hashing Error:", err.message);
    throw new Error("Password hashing failed");
  }
};

// ------------------------------------------------------------
// 4️⃣ Compare Passwords
// ------------------------------------------------------------
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (err) {
    console.error("❌ Password Compare Error:", err.message);
    return false;
  }
};

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  comparePassword,
};
