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

// BOUNDARY: Translate generated persistence values into the stable domain/API contract.
function mapTask(row: PrismaTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    done: row.done,
    // CHECK: The database constraint should make this parse succeed; failure exposes drift.
    priority: PrioritySchema.parse(row.priority),
    version: row.version,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// WHAT: Implement the domain-owned repository port with Prisma as the default adapter.
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(input: ListTasksInput) {
    // WHAT: Build a typed predicate; undefined filters are deliberately omitted.
    const where: Prisma.TaskWhereInput = {
      done: input.done,
      // WHY: Case-insensitive contains matches the API's human-oriented search semantics.
      title: input.q ? { contains: input.q, mode: 'insensitive' } : undefined,
    };

    // WHY: Run the page and count as one transaction unit instead of managing SQL strings.
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        // WHY: `id` is a stable tie-breaker when two creation timestamps are equal.
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data: rows.map(mapTask), total };
  }

  async findById(id: string) {
    // WHAT: A unique lookup returns null as an ordinary not-found outcome.
    const row = await this.prisma.task.findUnique({ where: { id } });
    return row ? mapTask(row) : null;
  }

  async create(input: CreateTaskInput) {
    // WHAT: Let generated input types and PostgreSQL constraints validate persistence shape.
    const row = await this.prisma.task.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
      },
    });
    return mapTask(row);
  }

  async update(id: string, input: UpdateTaskInput): Promise<UpdateResult> {
    // WHAT: Separate the concurrency token from fields that may be changed.
    const { version, ...patch } = input;

    return this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        // WHY: updateMany reports zero instead of throwing when id/version no longer matches.
        const updated = await transaction.task.updateMany({
          where: { id, version },
          data: {
            ...patch,
            // WHY: Advance the token atomically with the caller's requested changes.
            version: { increment: 1 },
            updatedAt: new Date(),
          },
        });

        if (updated.count === 0) {
          return this.classifyMiss(transaction, id);
        }

        // CHECK: The row must exist inside this transaction after a successful update.
        const row = await transaction.task.findUniqueOrThrow({ where: { id } });
        return { kind: 'updated' as const, task: mapTask(row) };
      },
    );
  }

  async complete(id: string, version: number): Promise<UpdateResult> {
    // BOUNDARY: Prisma keeps the task update and event insert on one transaction connection.
    return this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const updated = await transaction.task.updateMany({
          where: { id, version },
          data: {
            done: true,
            version: { increment: 1 },
            updatedAt: new Date(),
          },
        });

        if (updated.count === 0) {
          return this.classifyMiss(transaction, id);
        }

        // WHAT: Record the event only after this transaction owns the version transition.
        await transaction.taskEvent.create({
          data: {
            taskId: id,
            eventType: 'completed',
            payload: { previousVersion: version },
          },
        });

        const row = await transaction.task.findUniqueOrThrow({ where: { id } });
        return { kind: 'updated' as const, task: mapTask(row) };
      },
    );
  }

  async delete(id: string) {
    // WHY: deleteMany turns not-found into a useful count instead of an ORM exception.
    const deleted = await this.prisma.task.deleteMany({ where: { id } });
    return deleted.count === 1;
  }

  private async classifyMiss(
    transaction: Prisma.TransactionClient,
    id: string,
  ): Promise<UpdateResult> {
    // WHAT: Distinguish a missing id from a real optimistic-concurrency conflict.
    const existing = await transaction.task.findUnique({
      where: { id },
      select: { id: true },
    });
    return existing ? { kind: 'conflict' } : { kind: 'missing' };
  }
}
