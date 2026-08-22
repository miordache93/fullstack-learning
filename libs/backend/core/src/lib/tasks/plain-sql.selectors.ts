// WHAT: Accept the same long-lived client owned by the persistence adapter.
import type { PrismaClient } from '../../generated/prisma/client.js';

// WHAT: Describe only columns selected by this engine-specific query.
export type OpenTaskRow = { id: string; title: string; created_at: Date };


// WHY: Keep a deliberate SQL escape hatch for plans and database-native syntax.
export function selectRecentOpenTasks(prisma: PrismaClient, limit: number) {
// SECURITY: The tagged template sends `limit` as a parameter, not executable text.
    return prisma.$queryRaw<OpenTaskRow[]>`
        SELECT id, title, created_at
        FROM tasks
        WHERE done = false
        ORDER BY created_at DESC, id
        LIMIT ${limit}::int
    `;
}