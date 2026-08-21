import type {
  CreateTaskInput,
  ListTasksInput,
  UpdateTaskInput,
} from './task.schema.js';

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

export type UpdateResult =
  | { kind: 'updated'; task: Task }
  | { kind: 'missing' }
  | { kind: 'conflict' };

export interface TaskRepository {
  list(input: ListTasksInput): Promise<{ data: Task[]; total: number }>;
  findById(id: string): Promise<Task | null>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: string, input: UpdateTaskInput): Promise<UpdateResult>;
  complete(id: string, version: number): Promise<UpdateResult>;
  delete(id: string): Promise<boolean>;
}
