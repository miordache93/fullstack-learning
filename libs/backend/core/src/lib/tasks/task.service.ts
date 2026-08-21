// WHAT: Translate persistence outcomes into use-case-aware errors here.
import { ConflictError, NotFoundError } from '../errors.js';
// BOUNDARY: The service knows only the domain-owned port.
import type { TaskRepository, UpdateResult } from './task.repository.js';
import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from './task.schema.js';


// WHAT: Keep use-case policy independent of HTTP and database libraries.
export class TaskService {
    // BOUNDARY: Constructor injection makes the repository explicit and replaceable.
    constructor(private readonly repository: TaskRepository) {}

    list(input: ListTasksInput) {
        // WHAT: Delegate storage-oriented listing through the narrow port.
        return this.repository.list(input);
    }

    async get(id: string) {
        // CHECK: Convert nullable persistence output into a public domain error.
        const task = await this.repository.findById(id);
        if (!task) throw new NotFoundError('Task not found');
        return task;
    }

    create(input: CreateTaskInput) {
        // WHAT: Creation policy is deliberately small at this checkpoint.
        return this.repository.create(input);
    }

      async update(id: string, input: UpdateTaskInput) {
    // WHAT: Keep result translation identical for every adapter.
    return this.unwrap(await this.repository.update(id, input));
  }

  async complete(id: string, version: number) {
    // WHY: Later adapters implement this as task-plus-event transaction policy.
    return this.unwrap(await this.repository.complete(id, version));
  }

  async delete(id: string) {
    // CHECK: A false delete result is an intentional not-found outcome.
    if (!(await this.repository.delete(id))) {
      throw new NotFoundError('Task not found');
    }
  }

   private unwrap(result: UpdateResult) {
    // WHAT: Preserve three distinct persistence outcomes at the service boundary.
    if (result.kind === 'missing') throw new NotFoundError('Task not found');
    if (result.kind === 'conflict') throw new ConflictError();
    return result.task;
  }
}