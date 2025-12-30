import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  datasource: databaseUrl ? { url: databaseUrl } : undefined,
  migrations: {
    seed: "ts-node prisma/seed.ts",
  },
});
