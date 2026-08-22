// WHAT: Load the ignored local environment for Prisma CLI commands.
import 'dotenv/config';
// BOUNDARY: Prisma's CLI owns schema, migration, and credential configuration here.
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    // WHAT: Point every CLI operation at the learner-authored schema.
    schema: 'prisma/schema.prisma',
    // WHAT: Keep ordered, reviewable database history in source control.
    migrations: { path: 'prisma/migrations'},
      // SECRET: Read the URL from process configuration, never the Prisma schema.
    datasource: { url: env('DATABASE_URL')},
})