// scripts/reset-admin.js

require("dotenv").config();
const bcrypt = require("bcryptjs");
const { db } = require("../src/config/database");
const { users } = require("../src/db/schema/users");
const { eq, sql } = require("drizzle-orm");

const resetAdmin = async () => {
  try {
    const email = "admin@yds.com";
    const plainPassword = "admin123";

    console.log("🔌 Using Postgres via Drizzle (no MongoDB).");

    // 1. Delete existing admin (same email)
    console.log(`🗑️  Deleting existing user with email: ${email}...`);
    await db.delete(users).where(eq(users.email, email));

    // 2. Create NEW Super Admin
    console.log("⚡ Creating new Super Admin...");

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const [newAdmin] = await db
      .insert(users)
      .values({
        email,
        name: "Super Admin",
        password: hashedPassword,
        roles: ["SUPER_ADMIN"],
        activeRole: "SUPER_ADMIN",
        isActive: true,
        usageStats: {
          totalLogins: 0,
          lastActive: null,
        },
        createdAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .returning();

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
