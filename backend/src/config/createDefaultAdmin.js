const bcrypt = require("bcryptjs");
const logger = require("./logger");

const { db } = require("../lib/db"); // Drizzle PostgreSQL connection
const { users } = require("../db/schema/users");
const { eq } = require("drizzle-orm");

const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@yds.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    // --------------------------------------------------------
    // 1️⃣ Check if Admin Already Exists
    // --------------------------------------------------------
    const existing = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, adminEmail),
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (!existing) {
      // --------------------------------------------------------
      // CASE 1: Admin does not exist → Create new admin
      // --------------------------------------------------------
      logger.info("⚡ Creating default Super Admin account...");

      await db.insert(users).values({
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        roles: ["SUPER_ADMIN"],
        activeRole: "SUPER_ADMIN",
        isActive: true,
      });

      logger.info(`✅ Super Admin created: ${adminEmail} / ${adminPassword}`);
    } else {
      // --------------------------------------------------------
      // CASE 2: Admin exists → FORCE RESET password
      // --------------------------------------------------------
      logger.info("⚠️ Admin exists — forcing password reset...");

      await db
        .update(users)
        .set({
          password: hashedPassword,
          roles: ["SUPER_ADMIN"],
          activeRole: "SUPER_ADMIN",
          isActive: true,
        })
        .where(eq(users.email, adminEmail));

      logger.info(`✅ Super Admin password FORCE RESET: ${adminPassword}`);
    }
  } catch (error) {
    logger.error(`❌ Failed to create/reset admin: ${error.message}`);
  }
};

module.exports = createDefaultAdmin;
