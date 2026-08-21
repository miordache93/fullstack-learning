// WHAT: Import only domain command types, never an ORM-generated record.
import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from './task.schema.js'

// BOUNDARY: This stable domain shape is shared by every persistence adapter.
export type Task = {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  version: number;
  createdAt: string;
  updatedAt: string;
};

// WHY: Preserve missing versus stale-write semantics across database clients.
export type UpdateResult = { kind: 'updated'; task: Task } | { kind: 'missing' } | { kind: 'conflict' };

// BOUNDARY: Business policy depends on capabilities, not Prisma or Mongoose APIs.
export interface TaskRepository {
  // WHAT: Return a bounded page plus its total count.
  list(input: ListTasksInput): Promise<{ data: Task[]; total: number }>;
  // WHAT: Model ordinary absence explicitly.
  findById(id: string): Promise<Task | null>;
  // WHAT: Persist a validated create command.
  create(input: CreateTaskInput): Promise<Task>;
  // WHAT: Preserve optimistic-concurrency outcomes.
  update(id: string, input: UpdateTaskInput): Promise<UpdateResult>;
  // WHY: Give adapters a transaction-aware completion operation.
  complete(id: string, version: number): Promise<UpdateResult>;
  // WHAT: Translate engine-specific delete counts to one boolean.
  delete(id: string): Promise<boolean>;
}