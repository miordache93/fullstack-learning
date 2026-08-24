import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { z } from 'zod';
import type { AppConfig } from '../config.js';
import type { PersistenceAdapter } from '../persistence/persistence.js';
import type { TaskService } from '../tasks/task.service.js';
import { fibonacciInWorker } from '../workers/fibonacci.js';
import { errorHandler, notFound, requireApiKey } from './middleware.js';
import { createTasksRouter } from './tasks.router.js';
import { createUploadsRouter } from './uploads.router.js';

export type ApplicationDependencies = {
  config: AppConfig;
  persistence: Pick<PersistenceAdapter, 'kind' | 'checkReadiness'>;
  taskService: TaskService;
};

export function createApp({ config, persistence, taskService }: ApplicationDependencies) {
  const app = express();
  app.disable('x-powered-by');
  // BOUNDARY: Trust exactly the one AWS/local reverse-proxy hop used by this design.
  app.set('trust proxy', 1);
  // WHAT: Assign/carry a correlation id and emit structured request logs first.
  app.use(
    pinoHttp({
      genReqId: (request) => request.headers['x-request-id']?.toString() ?? randomUUID(),
      // SECURITY: Redact credentials before serialization, not after log ingestion.
      redact: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.x-api-key'],
    }),
  );
  // SECURITY: Add defensive browser response headers.
  app.use(helmet());
  // BOUNDARY: CORS controls which browsers may read responses; it is not authentication.
  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || config.corsOrigins.includes(origin));
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    }),
  );
  // WHY: Bound abusive traffic per process; distributed enforcement needs a shared store.
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  // BOUNDARY: Parse only bounded JSON before application routes.
  app.use(express.json({ limit: '100kb' }));

  // CHECK: Load balancers can inspect process and dependency health without an API key.
  app.get('/api/health/live', (_request, response) => response.json({ status: 'ok' }));
  app.get('/api/health/ready', async (_request, response) => {
    await persistence.checkReadiness();
    response.json({ status: 'ready', persistence: persistence.kind });
  });

  // SECURITY: Authentication precedes every application capability below it.
  app.use('/api', requireApiKey(config.apiKey));
  app.use('/api/tasks', createTasksRouter(taskService));
  app.use('/api/uploads', createUploadsRouter(config));
  app.post('/api/tools/fibonacci', async (request, response) => {
    // BOUNDARY: Bound CPU cost before creating a worker.
    const { n } = z.object({ n: z.number().int().min(0).max(42) }).parse(request.body);
    response.json({ data: { n, value: await fibonacciInWorker(n) } });
  });

  // WHAT: Terminal translation middleware remains last.
  app.use(notFound);
  app.use(errorHandler);
  return app;
}