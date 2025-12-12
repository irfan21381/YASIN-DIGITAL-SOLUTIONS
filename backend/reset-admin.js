require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const resetAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@yds.com";
    const plainPassword = process.env.ADMIN_PASSWORD || "admin123";

    console.log("🔌 Using Postgres via Prisma (no MongoDB).");

    // 1. Delete existing admin (same email)
    console.log(`🗑️  Deleting existing user with email: ${email}...`);
    await prisma.user.deleteMany({
      where: { email },
    });

    // 2. Create NEW Super Admin
    console.log("⚡ Creating new Super Admin...");

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email,
        name: "Super Admin",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        isVerified: true,
        usageStats: JSON.stringify({
          totalLogins: 0,
          lastActive: null,
        }),
      },
    });

    console.log("------------------------------------------------");
    console.log("✅ ADMIN RESET SUCCESSFUL (PostgreSQL)");
    console.log(`📧 Email:    ${email}`);
    console.log(`🔑 Password: ${plainPassword}`);
    console.log("🆔 ID:       ", newAdmin.id);
    console.log("------------------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR:", error);
    process.exit(1);
  }
};

resetAdmin();
