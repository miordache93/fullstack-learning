import { Router } from 'express';
import type { TaskService } from '../tasks/task.service.js';
import {
  CompleteTaskSchema,
  CreateTaskSchema,
  ListTasksSchema,
  TaskIdSchema,
  UpdateTaskSchema,
} from '../tasks/task.schema.js';

export function createTasksRouter(service: TaskService) {
  const router = Router();

  router.get('/', async (request, response) => {
    const input = ListTasksSchema.parse(request.query);
    const result = await service.list(input);
    response.json({
      data: result.data,
      page: { limit: input.limit, offset: input.offset, total: result.total },
    });
  });

  router.get('/:id', async (request, response) => {
    const { id } = TaskIdSchema.parse(request.params);
    response.json({ data: await service.get(id) });
  });

  router.post('/', async (request, response) => {
    const input = CreateTaskSchema.parse(request.body);
    response.status(201).json({ data: await service.create(input) });
  });

  router.patch('/:id', async (request, response) => {
    const { id } = TaskIdSchema.parse(request.params);
    const input = UpdateTaskSchema.parse(request.body);
    response.json({ data: await service.update(id, input) });
  });

  router.post('/:id/complete', async (request, response) => {
    const { id } = TaskIdSchema.parse(request.params);
    const { version } = CompleteTaskSchema.parse(request.body);
    response.json({ data: await service.complete(id, version) });
  });

  router.delete('/:id', async (request, response) => {
    const { id } = TaskIdSchema.parse(request.params);
    await service.delete(id);
    response.status(204).end();
  });

  return router;
}
