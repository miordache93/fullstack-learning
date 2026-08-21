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

export type TaskListResponse = {
  data: Task[];
  page: { limit: number; offset: number; total: number };
};

export type CreateTask = Pick<Task, 'title' | 'priority'> & {
  description?: string;
};
