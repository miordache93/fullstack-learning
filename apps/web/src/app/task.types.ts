// BOUNDARY: Describe the public HTTP representation, not a Prisma or Mongoose record.
export type Task = {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  version: number;
  createdAt: string;
  updatedAt: string;
};

// WHAT: Preserve data and pagination metadata from the list endpoint.
export type TaskListResponse = {
  data: Task[];
  page: { limit: number; offset: number; total: number };
};

// WHAT: A create command contains caller-owned fields only.
export type CreateTask = Pick<Task, 'title' | 'priority'> & {
  description?: string;
};

// WHAT: Reuse one finite filter vocabulary in URL construction and UI state.
export type TaskFilter = 'all' | 'open' | 'done';
