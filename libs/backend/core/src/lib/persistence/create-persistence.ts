import type { AppConfig } from '../config.js';
import type { PersistenceAdapter } from './persistence.js';
import { PrismaPersistenceAdapter } from './prisma-persistence.adapter.js';

// BOUNDARY: Keep infrastructure selection in one outer factory from the beginning.
export function createPersistence(config: Omit<AppConfig, 'host'| 'port'>): PersistenceAdapter {
  // WHY: Branch 05 has one honest implementation; Branch 07 adds the second case here.
  return new PrismaPersistenceAdapter(config);
}