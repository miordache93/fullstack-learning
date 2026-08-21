import type { Connection } from 'mongoose';
import type { MongoTaskRecord } from './mongoose.models.js';

export type RecentOpenMongoTask = Pick<
  MongoTaskRecord,
  '_id' | 'title' | 'createdAt'
>;

// WHAT: Demonstrate a native MongoDB query selector without replacing the repository.
export async function selectRecentOpenTasksWithMongoDriver(
  connection: Connection,
  since: Date,
  limit: number,
) {
  // CHECK: Validate callers before this low-level helper; it accepts already-trusted values.
  if (!connection.db) throw new Error('MongoDB connection is not open');

  // BOUNDARY: `.collection()` intentionally drops Mongoose casting and middleware here.
  return (
    connection.db
      .collection<MongoTaskRecord>('tasks')
      .find(
        // WHAT: Native selectors are data objects, not interpolated query strings.
        { done: false, createdAt: { $gte: since } },
        {
          // WHY: Project only fields this reporting path consumes.
          projection: { _id: 1, title: 1, createdAt: 1 },
        },
      )
      // WHY: Match the compound index order and keep ties deterministic.
      .sort({ createdAt: -1, _id: 1 })
      // WHY: Bound database work, memory, and response size.
      .limit(limit)
      .toArray() as Promise<RecentOpenMongoTask[]>
  );
}
