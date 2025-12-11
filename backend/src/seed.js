// src/scripts/seed.js
require("dotenv").config();
// controllers, services, etc.
const { db } = require("../config/database");   // or "../../config/database"
const { users } = require("../db/schema/users");
const { colleges } = require("../db/schema/colleges");
const { subjects } = require("../db/schema/subjects");
const bcrypt = require("bcryptjs");
const { eq } = require("drizzle-orm");

(async () => {
  try {
    console.log("🌱 Seeding Postgres with Drizzle...");

    const defaultPassword = await bcrypt.hash("Admin@123", 10);

    // 1) SUPER ADMIN
    const [superAdmin] = await db
      .insert(users)
      .values({
        email: "admin@yds.com",
        name: "Super Admin",
        password: defaultPassword,
        roles: ["SUPER_ADMIN"],
        activeRole: "SUPER_ADMIN",
        isActive: true,
      })
      .returning();

    // 2) MANAGER
    const [manager] = await db
      .insert(users)
      .values({
        email: "manager@yds.com",
        name: "Test Manager",
        password: defaultPassword,
        roles: ["COLLEGE_MANAGER"],
        activeRole: "COLLEGE_MANAGER",
        isActive: true,
      })
      .returning();

    // 3) COLLEGE
    const existing = await db
      .select()
      .from(colleges)
      .where(eq(colleges.code, "YDS001"));

    let collegeRow = existing[0];
    if (!collegeRow) {
      [collegeRow] = await db
        .insert(colleges)
        .values({
          name: "YDS Test College",
          code: "YDS001",
          managerId: manager.id,
          address: {
            street: "Test Road",
            city: "Hyderabad",
            state: "Telangana",
            pincode: "500001",
          },
          contact: { email: "info@yds.edu", phone: "1234567890" },
          settings: {
            academicYear: "2024-25",
            semesters: [1, 2, 3, 4, 5, 6, 7, 8],
            branches: ["CSE", "ECE", "ME", "CE"],
            years: [1, 2, 3, 4],
          },
        })
        .returning();
    }

    // 4) TEACHER / 5) STUDENT / 6) SUBJECT:
    // do similar db.insert(...) calls into users + subjects.

    console.log("✅ Seed completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ SEED ERROR:", err);
    process.exit(1);
  }
})();
