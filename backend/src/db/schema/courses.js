// src/db/schema/courses.js

const { pgTable, serial, varchar, text, boolean, integer, timestamp } = require("drizzle-orm/pg-core");
const { users } = require("./users");

const courses = pgTable("courses", {
  id: serial("id").primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),

  description: text("description"),

  instructor: integer("instructor")
    .references(() => users.id),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { courses };
