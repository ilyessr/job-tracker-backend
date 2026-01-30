import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production' });

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  datasource: { url: databaseUrl },
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
});
