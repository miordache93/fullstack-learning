// WHAT: Prisma 7 uses an explicit PostgreSQL driver adapter.
import { PrismaPg } from '@prisma/adapter-pg';
// WHAT: Import the client generated from your schema, never hand-write it.
import { PrismaClient } from '../generated/prisma/client.js';
import type { AppConfig } from './config.js';

// WHAT: Construct one client and one bounded pool per API process.
export function createPrismaClient(config: Omit<AppConfig, 'host'| 'port'>) {
  const adapter = new PrismaPg({
    // SECRET: Supply validated runtime credentials rather than embedding them in code.
    connectionString: config.databaseUrl,
    // WHY: Bound total connections as API instance count grows.
    max: config.databasePoolMax,
    // WHY: Fail instead of waiting forever when the pool cannot acquire a connection.
    connectionTimeoutMillis: 5_000,
    // WHY: Release long-idle connections while retaining a useful warm pool.
    idleTimeoutMillis: 30_000,
    // CHECK: Make this workload recognizable in `pg_stat_activity`.
    application_name: 'nx-learning-api',
  });

  // BOUNDARY: The generated query API runs over the configured driver adapter.
  return new PrismaClient({ adapter });
}