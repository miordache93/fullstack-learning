// WHAT: Use real in-memory behavior rather than mocking the behavior under test.
import { describe, expect, it } from 'vitest';
import { ConflictError, NotFoundError } from '../errors.js';
import { InMemoryTaskRepository } from './in-memory-task.repository.js';
import { TaskService } from './task.service.js';

// WHAT: Build an isolated use-case graph for each test.
function setup() {
  const repository = new InMemoryTaskRepository();
  return { repository, service: new TaskService(repository) };
}

describe('TaskService', () => {
  it('creates defaults and lists through the repository port', async () => {
    // WHAT: Exercise the same command shape future adapters receive.
    const { service } = setup();
    const created = await service.create({ title: 'Learn ports', priority: 'medium' });
    // CHECK: Server-owned defaults exist without either database.
    expect(created).toMatchObject({ title: 'Learn ports', done: false, version: 1 });
    // CHECK: The list contract includes data and pagination total.
    await expect(service.list({ limit: 50, offset: 0 })).resolves.toMatchObject({
      data: [created],
      total: 1,
    });
  });

  it('distinguishes missing records from stale writes', async () => {
    const { service } = setup();
    // CHECK: A never-seen identity maps to not found.
    await expect(service.get(crypto.randomUUID())).rejects.toBeInstanceOf(NotFoundError);
    const created = await service.create({ title: 'Race safely', priority: 'high' });
    // WHAT: Commit one update using the observed version.
    await service.update(created.id, { done: true, version: created.version });
    // CHECK: Reusing that version now maps to an intentional conflict.
    await expect(service.update(created.id, { title: 'Stale title', version: created.version })).rejects.toBeInstanceOf(ConflictError);
  });
});