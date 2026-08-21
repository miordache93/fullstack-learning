// WHAT: Import capabilities through the backend library's public surface.
import { createApp, InMemoryTaskRepository, TaskService } from '@nx-fullstack-learning/backend-core';


// BOUNDARY: Keep resource construction and startup in one controlled async function.
async function bootstrap() {
  try {
    // BOUNDARY: Choose the concrete repository in the outermost application layer.
    const repository = new InMemoryTaskRepository();
    // WHAT: Give domain policy only the narrow storage capability it needs.
    const taskService = new TaskService(repository);
    // WHAT: Compose HTTP translation without letting it select infrastructure.
    const app = createApp(taskService);
    // BOUNDARY: Parse process input before accepting traffic.

    const host = process.env.HOST ?? 'localhost';
    const port = Number(process.env.PORT ?? 3000);

    // WHAT: Open the socket only after every synchronous startup step succeeds.
    const server = app.listen(port, host, () => {
      console.log(`[ready] API listenting on http://${host}:${port}`);
    });

    // CHECK: Convert asynchronous socket failures such as EADDRINUSE to startup failure.
    server.once('error', (error) => {
      console.error(['[startup-error]', error]);
      process.exitCode = 1;
    });
  } catch (error) {
    // CHECK: Produce one intentional startup diagnostic and a failing exit status.
    console.error('[startup-error]', error);
    process.exitCode = 1;
  }
}

// WHAT: Start without discarding the promise accidentally.
void bootstrap();