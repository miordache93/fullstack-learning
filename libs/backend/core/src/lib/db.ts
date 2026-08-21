import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import type { AppConfig } from './config.js';

// WHAT: Construct one driver adapter so this process owns one bounded pg connection pool.
export function createPrismaClient(config: AppConfig) {
  const adapter = new PrismaPg({
    // SECRET: Supply the validated runtime URL rather than embedding credentials in code.
    connectionString: config.databaseUrl,
    // WHY: Bound total connections as instance count grows horizontally.
    max: config.databasePoolMax,
    // WHY: Fail a request instead of waiting forever when no connection can be acquired.
    connectionTimeoutMillis: 5_000,
    // WHY: Release long-idle connections while retaining a useful warm pool.
    idleTimeoutMillis: 30_000,
    // CHECK: Make this workload recognizable in PostgreSQL activity views.
    application_name: 'nx-learning-api',
  });

  // BOUNDARY: Prisma supplies the generated query API over the configured pg adapter.
  return new PrismaClient({ adapter });
}
