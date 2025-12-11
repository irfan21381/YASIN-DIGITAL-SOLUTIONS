// ------------------------------------------------------------
// s3.js (2025 Updated)
// Uses AWS SDK v3 (modular, faster, recommended)
// ------------------------------------------------------------

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// ------------------------------------------------------------
// 1️⃣ AWS Client Setup
// ------------------------------------------------------------
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ------------------------------------------------------------
// 2️⃣ Upload File to S3
// ------------------------------------------------------------
const uploadToS3 = async (file, folder = "uploads") => {
  if (!file || !file.buffer) {
    throw new Error("Invalid file input");
  }
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error("AWS_S3_BUCKET missing in .env");
  }

  // Unique filename
  const key = `${folder}/${Date.now()}-${file.originalname}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "private",
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;

    return {
      url: fileUrl,
      key,
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("File upload failed");
  }
};

// ------------------------------------------------------------
// 3️⃣ Generate Signed URL (Private Download Access)
// ------------------------------------------------------------
const generateSignedUrl = async (key, expiry = 3600) => {
  if (!key) throw new Error("S3 key is required");

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: expiry });

    return signedUrl;
  } catch (error) {
    console.error("S3 Signed URL Error:", error);
    throw new Error("Failed to generate signed URL");
  }
};

// ------------------------------------------------------------
// 4️⃣ Delete File From S3
// ------------------------------------------------------------
const deleteFromS3 = async (key) => {
  if (!key) throw new Error("S3 key is required");

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw new Error("File deletion failed");
  }
};

// ------------------------------------------------------------
// 5️⃣ Exports
// ------------------------------------------------------------
module.exports = {
  s3,
  uploadToS3,
  generateSignedUrl,
  deleteFromS3,
};
