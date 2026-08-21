// WHAT: Keep application construction separate from opening a network socket.
import express from 'express';
import type { TaskService } from '../tasks/task.service.js';
import { errorHandler, notFound } from './middleware.js';
import { createTasksRouter } from './task.router.js';


// WHAT: Build a testable Express graph around an injected use-case service.
export function createApp(taskService: TaskService) {
    const app = express();

    // SECURITY: Avoid advertising an unnecessary implementation detail.
    app.disable('x-powered-by');
    // BOUNDARY: Parse JSON once and reject bodies larger than this learning API accepts. 
    app.use(express.json({ limit: '100kb'}));

    // CHECK: Liveness proves only that the process can serve HTTP.
    app.get('/api/health/live', (_request, response) => {
        response.json({ status: 'ok'});
    });

    // BOUNDARY: Mount feature translation after process-level endpoints.
    app.use('/api/tasks', createTasksRouter(taskService));
    // WHAT: Unmatched routes become an intentional 404 representation.
    app.use(notFound);
    // BOUNDARY: Error handling is last so it can translate failures above it.
    app.use(errorHandler);
    return app;
}