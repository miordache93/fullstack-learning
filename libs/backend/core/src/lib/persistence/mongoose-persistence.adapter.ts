// WHAT: Own a connection explicitly instead of using Mongoose's global singleton.
import { createConnection } from 'mongoose';
import type { AppConfig } from '../config.js';
import { MongooseTaskRepository } from '../tasks/mongoose-task.repository.js';
import { createMongoModels } from '../tasks/mongoose.models.js';
import type { PersistenceAdapter } from './persistence.js';

export class MongoosePersistenceAdapter implements PersistenceAdapter {
  readonly kind = 'mongodb-mongoose' as const;
  // WHAT: One connection owns a bounded MongoDB pool for this process.
  private readonly connection = createConnection();
  // WHAT: Models compile against this owned connection.
  private readonly models = createMongoModels(this.connection);
  // BOUNDARY: Expose only the shared repository port.
  readonly tasks = new MongooseTaskRepository(this.connection, this.models);

  constructor(private readonly config: AppConfig) {}

  async connect() {
    await this.connection.openUri(this.config.mongodbUrl, {
      // WHY: Use the same per-process pool budget as the PostgreSQL adapter.
      maxPoolSize: this.config.databasePoolMax,
      // WHY: Fail startup promptly when topology selection cannot succeed.
      serverSelectionTimeoutMS: 5_000,
      // WHY: Development convenience must not build indexes implicitly in production.
      autoIndex: this.config.nodeEnv !== 'production',
    });
  }

  async disconnect() {
    // WHAT: Close driver sockets during the shared graceful lifecycle.
    await this.connection.close();
  }

  async checkReadiness() {
    // CHECK: Require an open database and a successful server ping.
    if (!this.connection.db) throw new Error('MongoDB connection is not open');
    await this.connection.db.command({ ping: 1 });
  }
}