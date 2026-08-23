import type { Connection } from 'mongoose';
import type { MongoTaskRecord } from './mongoose.models.js';

// WHAT: Describe only the projected fields returned by this native selector.
export type RecentOpenMongoTask = Pick<MongoTaskRecord, '_id' | 'title' | 'createdAt'>;

export async function selectRecentOpenTasksWithMongoDriver(connection: Connection, since: Date, limit: number) {
  // CHECK: Callers validate values before this deliberately low-level helper.
  if (!connection.db) throw new Error('MongoDB connection is not open');

  // BOUNDARY: `.collection()` deliberately bypasses Mongoose casting and middleware.
  return (
    connection.db
      .collection<MongoTaskRecord>('tasks')
      .find(
        // WHAT: Native selectors are data objects, not interpolated query strings.
        { done: false, createdAt: { $gte: since } },
        // WHY: Project only fields consumed by this reporting path.
        { projection: { _id: 1, title: 1, createdAt: 1 } },
      )
      // WHY: Match compound-index order and keep ties deterministic.
      .sort({ createdAt: -1, _id: 1 })
      // WHY: Bound database work, transfer size, and application memory.
      .limit(limit)
      .toArray() as Promise<RecentOpenMongoTask[]>
  );
}