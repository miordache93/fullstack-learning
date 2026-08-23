// WHAT: Compile schemas against an owned connection, not Mongoose's global singleton.
import type { Connection, Model } from 'mongoose';
import { Schema } from 'mongoose';

// BOUNDARY: This storage record remains private to the MongoDB adapter.
export type MongoTaskRecord = {
  _id: string;
  title: string;
  description: string | null;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

// BOUNDARY: Services never import the event storage shape.
export type MongoTaskEventRecord = {
  taskId: string;
  eventType: 'completed';
  payload: { previousVersion: number };
  createdAt: Date;
};

// WHAT: Deduplicate a retried command whose prior outcome the caller never observed.
export type MongoIdempotencyRecord = {
  scope: string;
  key: string;
  requestHash: string;
  status: 'pending' | 'completed';
  statusCode: number;
  responseBody: unknown;
  createdAt: Date;
};

export type MongoModels = {
  Task: Model<MongoTaskRecord>;
  TaskEvent: Model<MongoTaskEventRecord>;
  IdempotencyRecord: Model<MongoIdempotencyRecord>;
};

const taskSchema = new Schema<MongoTaskRecord>(
  {
    // WHY: UUID strings preserve identity across PostgreSQL, MongoDB, URLs, and caches.
    _id: { type: String, required: true },
    // CHECK: Storage validation remains defense in depth behind Zod.
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    description: { type: String, default: null, maxlength: 2_000 },
    done: { type: Boolean, required: true, default: false },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    // WHY: Use the same explicit domain token as PostgreSQL, not Mongoose `__v`.
    version: { type: Number, required: true, default: 1, min: 1 },
  },
  {
    // WHAT: Store both timestamps as native BSON dates.
    timestamps: true,
    // WHY: Prevent a second, Mongoose-specific version authority.
    versionKey: false,
    // SECURITY: Reject writes before connection instead of buffering them.
    bufferCommands: false,
    collection: 'tasks',
  },
);

// WHY: Match filtered and unfiltered deterministic list access paths.
taskSchema.index({ done: 1, createdAt: -1, _id: 1 });
taskSchema.index({ createdAt: -1, _id: 1 });

const taskEventSchema = new Schema<MongoTaskEventRecord>(
  {
    taskId: { type: String, required: true },
    eventType: { type: String, required: true, enum: ['completed'] },
    // BOUNDARY: The repository owns this event-specific runtime shape.
    payload: { type: Schema.Types.Mixed, required: true },
  },
  {
    // WHAT: Events need a creation time but no meaningless update time.
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    bufferCommands: false,
    collection: 'task_events',
  },
);

// WHY: Match newest-first history lookup for one task.
taskEventSchema.index({ taskId: 1, createdAt: -1 });

const idempotencyRecordSchema = new Schema<MongoIdempotencyRecord>(
  {
    scope: { type: String, required: true, maxlength: 100 },
    key: { type: String, required: true, maxlength: 200 },
    requestHash: { type: String, required: true, maxlength: 64 },
    status: { type: String, required: true, enum: ['pending', 'completed'], default: 'pending' },
    statusCode: { type: Number, required: true },
    responseBody: { type: Schema.Types.Mixed, required: true },
  },
  {
    // WHAT: A record needs a creation time but no meaningful update time.
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    bufferCommands: false,
    collection: 'idempotency_records',
  },
);

// WHY: One caller-chosen key can only ever mean one command per scope.
idempotencyRecordSchema.index({ scope: 1, key: 1 }, { unique: true });

export function createMongoModels(connection: Connection): MongoModels {
  return {
    // WHAT: Bind both models to the lifecycle-owned connection.
    Task: connection.model<MongoTaskRecord>('Task', taskSchema),
    TaskEvent: connection.model<MongoTaskEventRecord>(
      'TaskEvent',
      taskEventSchema,
    ),
    IdempotencyRecord: connection.model<MongoIdempotencyRecord>(
      'IdempotencyRecord',
      idempotencyRecordSchema,
    ),
  };
}
