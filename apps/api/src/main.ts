import 'dotenv/config';
import {
  createApp,
  createPersistence,
  loadConfig,
  TaskService,
} from '@nx-fullstack-learning/backend-core';

// BOUNDARY: Parse configuration before constructing any resource or accepting traffic.
const config = loadConfig();
// BOUNDARY: Select Prisma/PostgreSQL or Mongoose/MongoDB in exactly one place.
const persistence = createPersistence(config);
// CHECK: Fail startup if the selected database cannot be reached.
await persistence.connect();
// BOUNDARY: Domain policy sees the same repository port for either implementation.
const taskService = new TaskService(persistence.tasks);
const app = createApp({ config, persistence, taskService });

const server = app.listen(config.port, config.host, () => {
  console.log(`[ready] API listening on http://${config.host}:${config.port}`);
});

async function shutdown(signal: string) {
  console.log(`[shutdown] ${signal}`);
  server.close(async () => {
    // WHAT: Ask the selected adapter to close its underlying connection pool.
    await persistence.disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
