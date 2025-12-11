// test-connection.js

require("dotenv").config();
const { db } = require("./src/config/database");
const { users } = require("./src/db/schema/users");
const { colleges } = require("./src/db/schema/colleges");
const { subjects } = require("./src/db/schema/subjects");
const { sql } = require("drizzle-orm");

(async () => {
  try {
    console.log("🔄 Testing PostgreSQL + Drizzle connection...");

    // Basic ping (simple query)
    const [{ now }] = await db.execute(sql`SELECT NOW() AS now`);
    console.log("✅ Connected to PostgreSQL");
    console.log("   Server time:", now);

    // Count some core tables (if they exist)
    const [[{ userCount }]] = await Promise.all([
      db.execute(sql`SELECT COUNT(*)::int AS "userCount" FROM users`),
    ]).catch(() => [[{ userCount: 0 }]]);

    console.log("\n📈 Document Counts (tables):");

    try {
      const [{ collegeCount }] = await db.execute(
        sql`SELECT COUNT(*)::int AS "collegeCount" FROM colleges`
      );
      console.log(`   Colleges: ${collegeCount}`);
    } catch {
      console.log("   Colleges: (table not found)");
    }

    try {
      const [{ subjectCount }] = await db.execute(
        sql`SELECT COUNT(*)::int AS "subjectCount" FROM subjects`
      );
      console.log(`   Subjects: ${subjectCount}`);
    } catch {
      console.log("   Subjects: (table not found)");
    }

    console.log(`   Users: ${userCount}`);

    // Sample select from users (if any)
    try {
      const sampleUsers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          roles: users.roles,
        })
        .from(users)
        .limit(5);

      console.log("\n👤 Sample users (up to 5):");
      if (!sampleUsers.length) {
        console.log("   No users found.");
      } else {
        sampleUsers.forEach((u) =>
          console.log(`   - ${u.id}: ${u.email} (${u.name}) [${u.roles?.join(", ") ?? ""}]`)
        );
      }
    } catch {
      console.log("\n👤 Users table not readable or not present yet.");
    }

    console.log("\n✅ Postgres + Drizzle connection test completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection test failed:", err.message);
    process.exit(1);
  }
})();
