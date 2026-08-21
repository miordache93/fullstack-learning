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
  persistence: Pick<
    PersistenceAdapter,
    'kind' | 'checkReadiness' | 'readStats'
  >;
  taskService: TaskService;
};

export function createApp({
  config,
  persistence,
  taskService,
}: ApplicationDependencies) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(
    pinoHttp({
      genReqId: (request) =>
        request.headers['x-request-id']?.toString() ?? randomUUID(),
      redact: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers.x-api-key',
      ],
    }),
  );
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || config.corsOrigins.includes(origin));
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    }),
  );
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health/live', (_request, response) => {
    response.json({ status: 'ok' });
  });
  app.get('/api/health/ready', async (_request, response) => {
    // CHECK: The selected adapter owns its smallest meaningful connectivity probe.
    await persistence.checkReadiness();
    response.json({ status: 'ready', persistence: persistence.kind });
  });

  app.use('/api', requireApiKey(config.apiKey));
  app.use('/api/tasks', createTasksRouter(taskService));
  app.use('/api/uploads', createUploadsRouter(config));

  app.get('/api/stats', async (_request, response) => {
    // BOUNDARY: HTTP depends on a stable capability, not an ORM-specific client.
    const stats = await persistence.readStats();
    response.json({
      data: {
        ...stats,
        persistence: persistence.kind,
      },
    });
  });

  app.post('/api/tools/fibonacci', async (request, response) => {
    const { n } = z
      .object({ n: z.number().int().min(0).max(42) })
      .parse(request.body);
    response.json({ data: { n, value: await fibonacciInWorker(n) } });
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
