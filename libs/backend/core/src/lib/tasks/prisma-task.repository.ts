// WHAT: Import generated storage types from the persistence-owning library.
import type {
  Prisma,
  PrismaClient,
  Task as PrismaTask,
} from '../../generated/prisma/client.js';
import type {
  CreateTaskInput,
  ListTasksInput,
  UpdateTaskInput,
} from './task.schema.js';
import { PrioritySchema } from './task.schema.js';
import type { Task, TaskRepository, UpdateResult } from './task.repository.js';

// BOUNDARY: Map storage values into the stable domain/API representation.
function mapTask(row: PrismaTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    done: row.done,
    // CHECK: A failure here exposes drift between database constraints and domain policy.
    priority: PrioritySchema.parse(row.priority),
    version: row.version,
    // BOUNDARY: Public HTTP dates are ISO strings, not JavaScript Date instances.
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// WHAT: Implement the same port previously satisfied by the in-memory adapter.
export class PrismaTaskRepository implements TaskRepository {
  // BOUNDARY: Keep Prisma private to this infrastructure adapter.
  constructor(private readonly prisma: PrismaClient) {}

  async list(input: ListTasksInput) {
    // WHAT: Build a typed predicate; undefined fields are deliberately omitted.
    const where: Prisma.TaskWhereInput = {
      done: input.done,
      // WHY: Match the shared case-insensitive substring behavior.
      title: input.q ? { contains: input.q, mode: 'insensitive' } : undefined,
    };

    // WHY: Return page and count from one consistent database transaction.
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        // WHY: Identity breaks ties when timestamps are equal.
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prisma.task.count({ where }),
    ]);
    return { data: rows.map(mapTask), total };
  }

  async findById(id: string) {
    // WHAT: A unique lookup returns null as an ordinary absence outcome.
    const row = await this.prisma.task.findUnique({ where: { id } });
    return row ? mapTask(row) : null;
  }

  async create(input: CreateTaskInput) {
    // WHAT: Use generated query types for ordinary CRUD.
    const row = await this.prisma.task.create({
      data: {
        title: input.title,
        // WHY: Translate an omitted optional command to explicit SQL null.
        description: input.description ?? null,
        priority: input.priority,
      },
    });
    return mapTask(row);
  }

  async update(id: string, input: UpdateTaskInput): Promise<UpdateResult> {
    // WHAT: Separate the condition token from mutable fields.
    const { version, ...patch } = input;
    return this.prisma.$transaction(async (transaction) => {
      // WHY: `updateMany` reports zero instead of throwing when id/version misses.
      const updated = await transaction.task.updateMany({
        where: { id, version },
        data: {
          ...patch,
          // WHY: Advance the version in the same statement as the requested change.
          version: { increment: 1 },
          updatedAt: new Date(),
        },
      });
      if (updated.count === 0) return this.classifyMiss(transaction, id);
      // CHECK: The row must exist in this transaction after a successful update.
      const row = await transaction.task.findUniqueOrThrow({ where: { id } });
      return { kind: 'updated' as const, task: mapTask(row) };
    });
  }

  async complete(id: string, version: number) {
    // WHAT: Reuse version-aware update until Branch 06 adds an atomic event record.
    return this.update(id, { done: true, version });
  }

  async delete(id: string) {
    // WHY: `deleteMany` converts not-found to a useful count rather than an exception.
    const deleted = await this.prisma.task.deleteMany({ where: { id } });
    return deleted.count === 1;
  }

  private async classifyMiss(
    transaction: Prisma.TransactionClient,
    id: string,
  ): Promise<UpdateResult> {
    // WHAT: Distinguish a missing id from a real version conflict.
    const existing = await transaction.task.findUnique({
      where: { id },
      select: { id: true },
    });
    return existing ? { kind: 'conflict' } : { kind: 'missing' };
  }
}
