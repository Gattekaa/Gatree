import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.GATREE_MIGRATION_DATABASE_URL || process.env.GATREE_DATABASE_URL || process.env.DATABASE_URL,
  },
});
