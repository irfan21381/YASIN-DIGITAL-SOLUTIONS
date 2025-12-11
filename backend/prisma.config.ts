import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    // Required FIX for Render Free PostgreSQL (no SUPERUSER rights)
    dbExecute: {
      disableTerminateConnections: true,
    },
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});
