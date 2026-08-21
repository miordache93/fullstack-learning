// WHAT: Use platform UUID generation so identity matches both future adapters.
import { randomUUID } from 'node:crypto';
// WHAT: Import the domain port and result types this adapter must satisfy.
import type { Task, TaskRepository, UpdateResult } from './task.repository.js';
// WHAT: Import validated command shapes, not HTTP request objects.
import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from './task.schema.js';

// WHAT: Implement the same contract without a database process.
export class InMemoryTaskRepository implements TaskRepository {
  // WHY: Keep mutable records private so callers cannot bypass version checks.
  private readonly records = new Map<string, Task>();

  async list(input: ListTasksInput) {
    // WHAT: Work on a new array rather than exposing the internal Map.
    const matches = [...this.records.values()]
      // WHAT: Apply the optional completion filter when supplied.
      .filter((task) => input.done === undefined || task.done === input.done)
      // WHAT: Use the shared case-insensitive literal-substring contract.
      .filter((task) => !input.q || task.title.toLowerCase().includes(input.q.toLowerCase()))
      // WHY: Make pagination deterministic when timestamps collide.
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || left.id.localeCompare(right.id));

    // WHAT: Slice only after filtering and sorting, as the databases must later do.
    const data = matches.slice(input.offset, input.offset + input.limit);
    // BOUNDARY: Return copies so a test or service cannot mutate stored state.
    return { data: data.map((task) => ({ ...task })), total: matches.length };
  }

  async findById(id: string) {
    // WHAT: Return a defensive copy or explicit absence.
    const task = this.records.get(id);
    return task ? { ...task } : null;
  }

  async create(input: CreateTaskInput) {
    // WHAT: Use one timestamp for a new record's creation and first update.
    const now = new Date().toISOString();
    // WHAT: Translate a validated command into the stable domain representation.
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description ?? null,
      done: false,
      priority: input.priority,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    // WHAT: Persist the owned record under its portable identity.
    this.records.set(task.id, task);
    // BOUNDARY: Do not expose the mutable stored object.
    return { ...task };
  }

  async update(id: string, input: UpdateTaskInput): Promise<UpdateResult> {
    // CHECK: Distinguish a missing identity from a stale known identity.
    const current = this.records.get(id);
    if (!current) return { kind: 'missing' };
    if (current.version !== input.version) return { kind: 'conflict' };

    // WHAT: Apply only supplied fields and advance the token atomically in this adapter.
    const updated: Task = {
      ...current,
      title: input.title ?? current.title,
      description: input.description === undefined ? current.description : input.description,
      priority: input.priority ?? current.priority,
      done: input.done ?? current.done,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
    };
    // WHAT: Replace the record only after every condition passes.
    this.records.set(id, updated);
    return { kind: 'updated', task: { ...updated } };
  }

  async complete(id: string, version: number) {
    // WHY: Reuse the same compare-and-swap behavior for the database-free checkpoint.
    return this.update(id, { done: true, version });
  }

  async delete(id: string) {
    // WHAT: Map `Map.delete` directly to the port's boolean contract.
    return this.records.delete(id);
  }
}