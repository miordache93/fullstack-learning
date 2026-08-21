import type { CreateTask, Task, TaskListResponse } from './task.types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(problem?.message ?? `Request failed (${response.status})`);
  }

  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}

export const taskApi = {
  list: (filter: 'all' | 'open' | 'done') => {
    const done = filter === 'all' ? '' : `&done=${filter === 'done'}`;
    return request<TaskListResponse>(`/api/tasks?limit=200${done}`);
  },
  create: (input: CreateTask) =>
    request<{ data: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (task: Task, patch: Partial<Pick<Task, 'title' | 'done'>>) =>
    request<{ data: Task }>(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...patch, version: task.version }),
    }),
  remove: (id: string) =>
    request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
};
