import { AppConfig } from '../config.js';
import { MongoosePersistenceAdapter } from './mongoose-persistence.adapter.js';
import { PersistenceAdapter } from './persistence.js';
import { PrismaPersistenceAdapter } from './prisma-persistence.adapter.js';

export function createPersistence(config: AppConfig): PersistenceAdapter {
  // BOUNDARY: This is the only database-client conditional in the application.
  if (config.databaseClient === 'mongoose') {
    return new MongoosePersistenceAdapter(config);
  }
  // WHY: Prisma/PostgreSQL remains the default documented path.
  return new PrismaPersistenceAdapter(config);
}