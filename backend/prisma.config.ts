import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    // Render / managed Postgres friendly
    dbExecute: {
      disableTerminateConnections: true,
    },
  },

  datasource: {
    url: env("DATABASE_URL"), // must include ?sslmode=require
  },
});
