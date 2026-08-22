// WHAT: Keep application construction separate from opening a socket.
import express from 'express';
import type { PersistenceAdapter } from '../persistence/persistence.js';
import type { TaskService } from '../tasks/task.service.js';
import { errorHandler, notFound } from './middleware.js';
import { createTasksRouter } from './task.router.js';

// WHAT: Name every capability HTTP composition needs.
export type ApplicationDependencies = {
    taskService: TaskService,
    // BOUNDARY: Health sees only diagnostics, never ORM methods.
    persistence: Pick<PersistenceAdapter, 'kind'| 'checkReadiness'>,
}

export function createApp({
    taskService,
    persistence,
}: ApplicationDependencies) {
    const app = express();
    app.disable('x-powered-by');
    app.use(express.json({limit: '100kb'}));

    // CHECK: Liveness never calls a dependency.
    app.get('/api/health/live', (_request, response) => {
        response.json({ status: 'ok'});
    });

    // CHECK: Readiness crosses the selected adapter's real connection.
    app.get('/api/health/ready', async (_request, response) => {
        await persistence.checkReadiness();
        response.json({ status: 'ready', persistence: persistence.kind });
    });

    app.use('/api/tasks', createTasksRouter(taskService));
    app.use(notFound);
    app.use(errorHandler);

    return app;
}