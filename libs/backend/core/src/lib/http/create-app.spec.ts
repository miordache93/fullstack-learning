// WHAT: Exercise the real HTTP translation without binding a public port.
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { InMemoryTaskRepository } from '../tasks/in-memory-task.repository.js';
import { TaskService } from '../tasks/task.service.js';
import { createApp } from './create-app.js';

// WHAT: Compose the same layers as production with an isolated in-memory adapter.
function setup() {
  // WHAT: Use real domain/in-memory behavior for HTTP contract tests.
  const taskService = new TaskService(new InMemoryTaskRepository());
  // BOUNDARY: Stub only the external lifecycle capability this test does not own.
  const persistence = {
    kind: 'postgresql-prisma' as const,
    checkReadiness: async () => undefined,
  };
  return createApp({ taskService, persistence });
}

describe('task HTTP contract', () => {
  it('creates and lists a task through the full request boundary', async () => {
    const app = setup();
    // BOUNDARY: Send untrusted JSON exactly as a real client would.
    const created = await request(app).post('/api/tasks').send({ title: 'Trace E2E', priority: 'high' }).expect(201);
    // CHECK: The HTTP representation includes server-owned defaults.
    expect(created.body.data).toMatchObject({ title: 'Trace E2E', version: 1 });
    // CHECK: A second request observes the stored record.
    const listed = await request(app).get('/api/tasks?limit=10').expect(200);
    expect(listed.body.page.total).toBe(1);
  });

  it('returns stable validation and not-found envelopes', async () => {
    const app = setup();
    // CHECK: Runtime validation rejects a value TypeScript cannot protect at the network.
    const invalid = await request(app).post('/api/tasks').send({ title: '' }).expect(400);
    expect(invalid.body.code).toBe('VALIDATION_ERROR');
    // CHECK: A valid but absent UUID reaches domain-aware not-found policy.
    const missing = await request(app).get(`/api/tasks/${crypto.randomUUID()}`).expect(404);
    expect(missing.body.code).toBe('NOT_FOUND');
  });
});