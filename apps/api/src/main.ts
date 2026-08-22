// WHAT: Load ignored local values before configuration is parsed.
import 'dotenv/config';
// WHAT: `once` converts server events into an awaitable startup boundary.
import { once } from 'node:events';
import {
  createApp,
  createPersistence,
  loadConfig,
  TaskService,
  type PersistenceAdapter,
} from '@nx-fullstack-learning/backend-core';

// BOUNDARY: Keep resource construction and startup in one controlled async function.
async function bootstrap() {
  // WHAT: Retain a reference so a partial startup can release its pool.
  let persistence: PersistenceAdapter | undefined;
  try {
    // BOUNDARY: Parse configuration before constructing any resource or accepting traffic.
    const { port, host, ...rest } = loadConfig();
    // BOUNDARY: Select the concrete database implementation in exactly one place.
    persistence = createPersistence(rest);
    // CHECK: Fail startup if the selected database cannot be reached.
    await persistence.connect();
    // BOUNDARY: Domain policy sees the repository port, never PrismaClient.
    const taskService = new TaskService(persistence.tasks);
    // WHAT: Compose the HTTP graph after its dependencies are ready.
    const app = createApp({ taskService, persistence });
    // WHAT: Begin opening the socket only after configuration and connectivity pass.
    const server = app.listen(port, host);
    // CHECK: Reject this await on asynchronous socket errors such as EADDRINUSE.
    await once(server, 'listening');
    console.log(`[ready] API listening on http://${host}:${port}`);

    // WHAT: Ensure only the first termination signal begins shutdown.
    let shuttingDown = false;
    const shutdown = async (signal: string) => {
      if (shuttingDown) return;
      shuttingDown = true;

      console.log(`[shutdown] ${signal}`);
      // WHY: Bound draining so an orchestrator is not left waiting forever.
      const forcedExit = setTimeout(() => {
        console.error('[shutdown-timeout] forcing exit');
        // CHECK: Exit only after the explicit graceful deadline is exhausted.
        process.exit(1);
      }, 10_000).unref();
      try {
        // BOUNDARY: Stop accepting traffic and await in-flight connection closure.
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
        // WHAT: Close the selected database pool after HTTP draining.
        await persistence?.disconnect();
      } catch (error) {
        console.error('[shutdown-error]', error);
        process.exitCode = 1;
      } finally {
        clearTimeout(forcedExit);
      }
    };

     // WHAT: Register lifecycle behavior once for orchestrator and terminal signals.
    process.once('SIGTERM', () => void shutdown('SIGTERM'));
    process.once('SIGINT', () => void shutdown('SIGINT'));
  } catch (error) {
    // CHECK: A failed config parse, connection, or socket produces a non-zero outcome.
    console.error('[startup-error]', error);
    // WHAT: Release a pool that may have been constructed or partially connected.
    await persistence?.disconnect().catch((disconnectError) => {
      console.error('[startup-cleanup-error]', disconnectError);
    });
    process.exitCode = 1;
  }
}

// WHAT: Start without discarding the promise accidentally.
void bootstrap();
