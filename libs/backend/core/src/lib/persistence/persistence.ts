import type { TaskRepository } from '../tasks/task.repository.js';

// WHAT: Name the concrete adapter for diagnostics without exposing its client API.
export type PersistenceKind = 'postgresql-prisma' | 'mongodb-mongoose';

// WHAT: Keep the HTTP statistics contract identical whichever database is selected.
export type PersistenceStats = {
  tasks: number;
  events: number;
  databaseTime: string;
};

// BOUNDARY: This is the process-level persistence port used by startup and HTTP health.
export interface PersistenceAdapter {
  readonly kind: PersistenceKind;
  // BOUNDARY: Business policy receives the narrow task port, not Prisma or Mongoose.
  readonly tasks: TaskRepository;
  // WHAT: Prove connectivity before the API starts accepting requests.
  connect(): Promise<void>;
  // WHAT: Release the client's pool during graceful shutdown.
  disconnect(): Promise<void>;
  // CHECK: Throw when the database cannot currently serve traffic.
  checkReadiness(): Promise<void>;
  // WHAT: Supply database-neutral values for the existing HTTP endpoint.
  readStats(): Promise<PersistenceStats>;
}
