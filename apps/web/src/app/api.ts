// BOUNDARY: This module owns translation between fetch and typed application calls.
import type {
  CreateTask,
  Task,
  TaskFilter,
  TaskListResponse,
} from './task.types';

// WHAT: Normalize status checking, safe error messages, and JSON decoding once.
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  // BOUNDARY: The browser sends a real HTTP request to the same-origin Vite proxy.
  const response = await fetch(url, {
    ...init,
    headers: {
      // WHAT: Every current mutation sends JSON.
      'content-type': 'application/json',
      // WHY: Callers may still supply future authorization or request identifiers.
      ...init?.headers,
    },
  });

  if (!response.ok) {
    // SECURITY: Treat an error body as optional untrusted data.
    const problem = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    // WHAT: Reject so TanStack Query owns the operation's error state.
    throw new Error(problem?.message ?? `Request failed (${response.status})`);
  }

  // WHY: HTTP 204 intentionally has no JSON body to parse.
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

// BOUNDARY: Components call use-case-shaped functions, never assemble URLs themselves.
export const taskApi = {
  list: (filter: TaskFilter) => {
    // WHAT: Omit the filter for all tasks; serialize a real boolean otherwise.
    const done = filter === 'all' ? '' : `&done=${filter === 'done'}`;
    return request<TaskListResponse>(`/api/tasks?limit=200${done}`);
  },
  // WHY: The virtualization lab pages through the real dataset instead of loading it all.
  page: ({ offset, limit }: { offset: number; limit: number }) =>
    request<TaskListResponse>(`/api/tasks?limit=${limit}&offset=${offset}`),
  create: (input: CreateTask, idempotencyKey?: string) =>
    request<{ data: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
      // WHY: A stable key lets the server replay this exact attempt instead of duplicating it.
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    }),
  update: (task: Task, patch: Partial<Pick<Task, 'title' | 'done'>>) =>
    request<{ data: Task }>(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      // WHY: Carry the version observed by this client to reject stale writes.
      body: JSON.stringify({ ...patch, version: task.version }),
    }),
  remove: (id: string) => request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
};
