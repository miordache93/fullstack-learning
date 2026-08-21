import type { Connection, Model } from 'mongoose';
import { Schema } from 'mongoose';

// BOUNDARY: This storage record is private to the MongoDB adapter.
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

// BOUNDARY: Events are persistence records; services never import this shape.
export type MongoTaskEventRecord = {
  taskId: string;
  eventType: 'completed';
  payload: { previousVersion: number };
  createdAt: Date;
};

export type MongoModels = {
  Task: Model<MongoTaskRecord>;
  TaskEvent: Model<MongoTaskEventRecord>;
};

const taskSchema = new Schema<MongoTaskRecord>(
  {
    // WHY: A UUID string preserves the public identity contract across both databases.
    _id: { type: String, required: true },
    // CHECK: Storage validation remains defense in depth behind the Zod HTTP boundary.
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
    // WHY: This domain token makes conditional updates portable across storage engines.
    version: { type: Number, required: true, default: 1, min: 1 },
  },
  {
    // WHAT: Let MongoDB persist both timestamps while the repository returns ISO strings.
    timestamps: true,
    // WHY: The explicit domain `version` field replaces Mongoose's internal `__v` key.
    versionKey: false,
    // SECURITY: Reject writes attempted before the connection is ready instead of buffering.
    bufferCommands: false,
    collection: 'tasks',
  },
);

// WHY: Match list filtering followed by deterministic newest-first ordering.
taskSchema.index({ done: 1, createdAt: -1, _id: 1 });
// WHY: Preserve an efficient ordering path when the optional `done` filter is absent.
taskSchema.index({ createdAt: -1, _id: 1 });

const taskEventSchema = new Schema<MongoTaskEventRecord>(
  {
    // WHY: A scalar task id avoids coupling the domain contract to MongoDB ObjectId.
    taskId: { type: String, required: true },
    eventType: { type: String, required: true, enum: ['completed'] },
    // WHAT: Mixed stores event-specific metadata; the repository owns its runtime shape.
    payload: { type: Schema.Types.Mixed, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    bufferCommands: false,
    collection: 'task_events',
  },
);

// WHY: Match event-history lookup by task while returning newest events first.
taskEventSchema.index({ taskId: 1, createdAt: -1 });

// WHAT: Compile models on an owned connection rather than Mongoose's global connection.
export function createMongoModels(connection: Connection): MongoModels {
  return {
    Task: connection.model<MongoTaskRecord>('Task', taskSchema),
    TaskEvent: connection.model<MongoTaskEventRecord>(
      'TaskEvent',
      taskEventSchema,
    ),
  };
}
