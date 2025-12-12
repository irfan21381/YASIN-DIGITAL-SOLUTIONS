import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    // Render / managed Postgres friendly: no SUPERUSER needed [web:21]
    dbExecute: {
      disableTerminateConnections: true,
    },
  },
  datasource: {
    url: env("DATABASE_URL"), // must be a valid postgres:// or postgresql:// URL [web:23][web:30]
  },
});
