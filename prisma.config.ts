import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// WHAT: Tell every Prisma CLI command where the schema and migration history live.
export default defineConfig({
  // BOUNDARY: Keep the ORM schema at the workspace root rather than inside one app.
  schema: 'prisma/schema.prisma',
  // WHAT: Version database changes beside the schema and deploy them in order.
  migrations: {
    path: 'prisma/migrations',
  },
  // SECRET: Read credentials from the environment; never write them into the schema.
  datasource: {
    url: env('DATABASE_URL'),
  },
});
