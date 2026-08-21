import { createConnection } from 'mongoose';
import type { AppConfig } from '../config.js';
import { createMongoModels } from '../tasks/mongoose.models.js';
import { MongooseTaskRepository } from '../tasks/mongoose-task.repository.js';
import type { PersistenceAdapter, PersistenceStats } from './persistence.js';

// WHAT: Own one Mongoose connection, its pool, models, and repositories per process.
export class MongoosePersistenceAdapter implements PersistenceAdapter {
  readonly kind = 'mongodb-mongoose' as const;
  private readonly connection = createConnection();
  private readonly models = createMongoModels(this.connection);
  readonly tasks = new MongooseTaskRepository(this.connection, this.models);

  constructor(private readonly config: AppConfig) {}

  async connect() {
    // BOUNDARY: URI options describe topology; stable pool limits remain explicit here.
    await this.connection.openUri(this.config.mongodbUrl, {
      maxPoolSize: this.config.databasePoolMax,
      serverSelectionTimeoutMS: 5_000,
      // WHY: Development convenience must not trigger expensive index builds in production.
      autoIndex: this.config.nodeEnv !== 'production',
    });
  }

  async disconnect() {
    // WHAT: Close the MongoDB driver's sockets during graceful shutdown.
    await this.connection.close();
  }

  async checkReadiness() {
    // CHECK: Fail if startup never opened a database or MongoDB does not answer ping.
    if (!this.connection.db) throw new Error('MongoDB connection is not open');
    await this.connection.db.command({ ping: 1 });
  }

  async readStats(): Promise<PersistenceStats> {
    if (!this.connection.db) throw new Error('MongoDB connection is not open');

    // WHY: Counts and server time are independent I/O operations.
    const [tasks, events, hello] = await Promise.all([
      this.models.Task.countDocuments().exec(),
      this.models.TaskEvent.countDocuments().exec(),
      // CHECK: `hello.localTime` reports the selected MongoDB server's clock.
      this.connection.db.command({ hello: 1 }),
    ]);
    const databaseTime = hello.localTime;
    if (!(databaseTime instanceof Date)) {
      throw new Error('MongoDB hello response did not include localTime');
    }

    return { tasks, events, databaseTime: databaseTime.toISOString() };
  }
}
