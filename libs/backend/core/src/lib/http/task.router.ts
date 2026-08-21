// WHAT: Use a Router so task HTTP translation can be mounted and tested separately.
import { Router } from 'express';
// BOUNDARY: HTTP may call service use cases but may not access a repository directly.
import type { TaskService } from '../tasks/task.service.js';
// BOUNDARY: Parse every untrusted parameter, query, and body before use.
import { CompleteTaskSchema, CreateTaskSchema, ListTasksSchema, TaskIdSchema, UpdateTaskSchema } from '../tasks/task.schema.js';

export function createTasksRouter(service: TaskService) {
  const router = Router();

  router.get('/', async (request, response) => {
    // BOUNDARY: Query strings become a typed, bounded list command here.
    const input = ListTasksSchema.parse(request.query);
    // WHAT: Await the use case rather than knowing how records are stored.
    const result = await service.list(input);
    // WHAT: Keep collection data and page metadata explicit in the HTTP shape.
    response.json({
      data: result.data,
      page: { limit: input.limit, offset: input.offset, total: result.total },
    });
  });

  router.get('/:id', async (request, response) => {
    // BOUNDARY: Reject malformed UUIDs before a repository query.
    const { id } = TaskIdSchema.parse(request.params);
    response.json({ data: await service.get(id) });
  });

  router.post('/', async (request, response) => {
    // BOUNDARY: Strip unknown input and apply domain defaults through Zod.
    const input = CreateTaskSchema.parse(request.body);
    // WHAT: Creation returns 201 and the server-owned representation.
    response.status(201).json({ data: await service.create(input) });
  });

  router.patch('/:id', async (request, response) => {
    const { id } = TaskIdSchema.parse(request.params);
    // BOUNDARY: Require a positive version and at least one change.
    const input = UpdateTaskSchema.parse(request.body);
    response.json({ data: await service.update(id, input) });
  });

  router.post('/:id/complete', async (request, response) => {
    const { id } = TaskIdSchema.parse(request.params);
    // WHY: A separate use case becomes transactional in the database lessons.
    const { version } = CompleteTaskSchema.parse(request.body);
    response.json({ data: await service.complete(id, version) });
  });

  router.delete('/:id', async (request, response) => {
    const { id } = TaskIdSchema.parse(request.params);
    await service.delete(id);
    // WHY: A successful delete has no representation to return.
    response.status(204).end();
  });

  return router;
}