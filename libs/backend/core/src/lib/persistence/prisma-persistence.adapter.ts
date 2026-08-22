import type { AppConfig } from '../config.js';
import { createPrismaClient } from '../db.js';
import { PrismaTaskRepository } from '../tasks/prisma-task.repository.js';
import type { PersistenceAdapter } from './persistence.js';

// WHAT: Own the Prisma client, pool lifecycle, and repositories as one resource boundary.
export class PrismaPersistenceAdapter implements PersistenceAdapter {
  readonly kind = 'postgresql-prisma' as const;
  private readonly prisma;
  readonly tasks;

  constructor(config: Omit<AppConfig, 'host'| 'port'>) {
    // WHY: Construct exactly one client/pool for this process.
    this.prisma = createPrismaClient(config);
    // BOUNDARY: Expose the domain port rather than the generated client.
    this.tasks = new PrismaTaskRepository(this.prisma);
  }

  async connect() {
    // CHECK: Invalid credentials or unavailable PostgreSQL fail startup.
    await this.prisma.$connect();
  }

  async disconnect() {
    // WHAT: Drain Prisma and its underlying PostgreSQL pool.
    await this.prisma.$disconnect();
  }

  async checkReadiness() {
    // CHECK: A tiny database-native query proves current connectivity.
    await this.prisma.$queryRaw`SELECT 1`;
  }
}