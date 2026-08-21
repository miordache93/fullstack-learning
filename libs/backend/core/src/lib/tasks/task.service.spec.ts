import { describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../errors.js';
import type { TaskRepository, UpdateResult } from './task.repository.js';
import { TaskService } from './task.service.js';

function repository(overrides: Partial<TaskRepository> = {}): TaskRepository {
  return {
    list: vi.fn(async () => ({ data: [], total: 0 })),
    findById: vi.fn(async () => null),
    create: vi.fn(),
    update: vi.fn(async (): Promise<UpdateResult> => ({ kind: 'missing' })),
    complete: vi.fn(async (): Promise<UpdateResult> => ({ kind: 'missing' })),
    delete: vi.fn(async () => false),
    ...overrides,
  };
}

describe('TaskService', () => {
  it('translates a missing repository record into a domain-aware HTTP error', async () => {
    const service = new TaskService(repository());
    await expect(service.get('missing')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('returns pagination data from the repository', async () => {
    const service = new TaskService(repository());
    await expect(service.list({ limit: 50, offset: 0 })).resolves.toEqual({
      data: [],
      total: 0,
    });
  });
});
