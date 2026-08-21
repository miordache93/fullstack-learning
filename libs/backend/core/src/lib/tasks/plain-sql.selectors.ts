import type { PrismaClient } from '../../generated/prisma/client.js';

// WHAT: Describe the exact columns selected by the raw teaching query.
export type OpenTaskRow = {
  id: string;
  title: string;
  created_at: Date;
};

// WHY: Keep one plain selector to teach SQL, query plans, and ORM escape hatches.
export function selectRecentOpenTasks(prisma: PrismaClient, limit: number) {
  // SECURITY: A Prisma tagged template sends `limit` as a parameter, not SQL text.
  return prisma.$queryRaw<OpenTaskRow[]>`
    SELECT id, title, created_at
    FROM tasks
    WHERE done = false
    ORDER BY created_at DESC, id
    LIMIT ${limit}::int
  `;
}
