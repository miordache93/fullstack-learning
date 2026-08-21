import type { AppConfig } from '../config.js';
import { MongoosePersistenceAdapter } from './mongoose-persistence.adapter.js';
import type { PersistenceAdapter } from './persistence.js';
import { PrismaPersistenceAdapter } from './prisma-persistence.adapter.js';

// BOUNDARY: This composition factory is the only database-client selection branch.
export function createPersistence(config: AppConfig): PersistenceAdapter {
  if (config.databaseClient === 'mongoose') {
    return new MongoosePersistenceAdapter(config);
  }
  return new PrismaPersistenceAdapter(config);
}
