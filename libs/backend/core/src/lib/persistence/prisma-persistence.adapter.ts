import type { AppConfig } from '../config.js';
import { createPrismaClient } from '../db.js';
import { PrismaTaskRepository } from '../tasks/prisma-task.repository.js';
import type { PersistenceAdapter, PersistenceStats } from './persistence.js';

// WHAT: Own the Prisma client, PostgreSQL pool lifecycle, and Prisma repositories together.
export class PrismaPersistenceAdapter implements PersistenceAdapter {
  readonly kind = 'postgresql-prisma' as const;
  private readonly prisma;
  readonly tasks;

  constructor(config: AppConfig) {
    // WHAT: Create exactly one client/pool per API process.
    this.prisma = createPrismaClient(config);
    // BOUNDARY: Expose only the domain-owned repository contract to callers.
    this.tasks = new PrismaTaskRepository(this.prisma);
  }

  async connect() {
    // CHECK: Make invalid credentials or unavailable PostgreSQL fail startup.
    await this.prisma.$connect();
  }

  async disconnect() {
    // WHAT: Drain Prisma and the pg adapter's underlying connections.
    await this.prisma.$disconnect();
  }

  async checkReadiness() {
    // CHECK: A tiny raw selector tests the connection rather than a domain model.
    await this.prisma.$queryRaw`SELECT 1`;
  }

  async readStats(): Promise<PersistenceStats> {
    // WHY: These independent waits may overlap while the bounded pool limits resources.
    const [tasks, events, databaseClock] = await Promise.all([
      this.prisma.task.count(),
      this.prisma.taskEvent.count(),
      // WHY: Database-native time is a deliberate, parameter-free raw SQL example.
      this.prisma.$queryRaw<Array<{ now: Date }>>`SELECT now() AS now`,
    ]);

    return {
      tasks,
      events,
      databaseTime: databaseClock[0].now.toISOString(),
    };
  }
}
