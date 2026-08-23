import { randomUUID } from 'node:crypto';
import type { ClientSession, Connection, QueryFilter } from 'mongoose';
import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from './task.schema.js';
import { PrioritySchema } from './task.schema.js';
import type { Task, TaskRepository, UpdateResult } from './task.repository.js';
import type { MongoModels, MongoTaskRecord } from './mongoose.models.js';

// SECURITY: Make user text literal before placing it in a regular expression.
function escapeRegularExpression(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// BOUNDARY: Translate `_id` and BSON dates into the stable domain representation.
function mapTask(row: MongoTaskRecord): Task {
  return {
    id: row._id,
    title: row.title,
    description: row.description,
    done: row.done,
    priority: PrioritySchema.parse(row.priority),
    version: row.version,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// WHAT: Implement the same domain port with Mongoose and MongoDB.
export class MongooseTaskRepository implements TaskRepository {
  constructor(
    private readonly connection: Connection,
    private readonly models: MongoModels,
  ) {}

  async list(input: ListTasksInput) {
    // BOUNDARY: Translate shared semantics to a MongoDB predicate here.
    const filter: QueryFilter<MongoTaskRecord> = {
      ...(input.done === undefined ? {} : { done: input.done }),
      ...(input.q ? { title: { $regex: escapeRegularExpression(input.q), $options: 'i' } } : {}),
    };
    // WHY: Independent reads may overlap; `lean` skips unnecessary hydration.
    const [rows, total] = await Promise.all([this.models.Task.find(filter).sort({ createdAt: -1, _id: 1 }).skip(input.offset).limit(input.limit).lean().exec(), this.models.Task.countDocuments(filter).exec()]);
    return { data: rows.map(mapTask), total };
  }

  async findById(id: string) {
    // WHY: Read-only output needs no document methods or change tracking.
    const row = await this.models.Task.findById(id).lean().exec();
    return row ? mapTask(row) : null;
  }

  async create(input: CreateTaskInput) {
    // WHAT: Generate the portable UUID at the infrastructure boundary.
    const row = await this.models.Task.create({
      _id: randomUUID(),
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
    });
    return mapTask(row.toObject());
  }

  async update(id: string, input: UpdateTaskInput): Promise<UpdateResult> {
    // WHY: Never write undefined properties through `$set`.
    const changes: Record<string, unknown> = { updatedAt: new Date() };
    if (input.title !== undefined) changes.title = input.title;
    if (input.description !== undefined) changes.description = input.description;
    if (input.priority !== undefined) changes.priority = input.priority;
    if (input.done !== undefined) changes.done = input.done;

    // WHY: Identity plus version makes compare-and-swap one atomic document update.
    const row = await this.models.Task.findOneAndUpdate({ _id: id, version: input.version }, { $set: changes, $inc: { version: 1 } }, { new: true, runValidators: true })
      .lean()
      .exec();
    return row ? { kind: 'updated', task: mapTask(row) } : this.classifyMiss(id);
  }

  async complete(id: string, version: number): Promise<UpdateResult> {
    let result: UpdateResult = { kind: 'missing' };
    // BOUNDARY: The replica-set transaction keeps task and event atomic.
    await this.connection.transaction(async (session) => {
      // IMPORTANT: Do not run operations in parallel inside a MongoDB transaction.
      const row = await this.models.Task.findOneAndUpdate({ _id: id, version }, { $set: { done: true, updatedAt: new Date() }, $inc: { version: 1 } }, { new: true, runValidators: true, session })
        .lean()
        .exec();
      if (!row) {
        result = await this.classifyMiss(id, session);
        return;
      } 
      // WHAT: Passing the same session includes the event in the transaction.
      await this.models.TaskEvent.create([{ taskId: id, eventType: 'completed', payload: { previousVersion: version } }], { session });
      result = { kind: 'updated', task: mapTask(row) };
    });
    return result;
  }

  async delete(id: string) {
    // WHAT: Map MongoDB's delete count to the port's boolean contract.
    const deleted = await this.models.Task.deleteOne({ _id: id }).exec();
    return deleted.deletedCount === 1;
  }

  private async classifyMiss(id: string, session?: ClientSession): Promise<UpdateResult> {
    // WHAT: Distinguish missing identity from a stale known identity.
    const query = this.models.Task.exists({ _id: id });
    if (session) query.session(session);
    return (await query.exec()) ? { kind: 'conflict' } : { kind: 'missing' };
  }
}