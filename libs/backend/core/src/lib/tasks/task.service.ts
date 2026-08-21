import { ConflictError, NotFoundError } from '../errors.js';
import type { TaskRepository, UpdateResult } from './task.repository.js';
import type {
  CreateTaskInput,
  ListTasksInput,
  UpdateTaskInput,
} from './task.schema.js';

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  list(input: ListTasksInput) {
    return this.repository.list(input);
  }

  async get(id: string) {
    const task = await this.repository.findById(id);
    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  create(input: CreateTaskInput) {
    return this.repository.create(input);
  }

  async update(id: string, input: UpdateTaskInput) {
    return this.unwrap(await this.repository.update(id, input));
  }

  async complete(id: string, version: number) {
    return this.unwrap(await this.repository.complete(id, version));
  }

  async delete(id: string) {
    if (!(await this.repository.delete(id))) {
      throw new NotFoundError('Task not found');
    }
  }

  private unwrap(result: UpdateResult) {
    if (result.kind === 'missing') throw new NotFoundError('Task not found');
    if (result.kind === 'conflict') throw new ConflictError();
    return result.task;
  }
}
