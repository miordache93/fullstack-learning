import type { TaskRepository } from '../tasks/task.repository.js';

// WHAT: Keep process diagnostics stable without exposing a client API.
export type PersistenceKind = 'postgresql-prisma' | 'mongodb-mongoose';

// BOUNDARY: Startup and health depend on lifecycle capabilities, not PrismaClient.
export interface PersistenceAdapter {
  readonly kind: PersistenceKind;
  // BOUNDARY: Business policy receives only the domain repository port.
  readonly tasks: TaskRepository;
  // CHECK: Establish connectivity before accepting traffic.
  connect(): Promise<void>;
  // WHAT: Release the selected driver's pool during shutdown.
  disconnect(): Promise<void>;
  // CHECK: Throw when the dependency cannot currently serve requests.
  checkReadiness(): Promise<void>;
}