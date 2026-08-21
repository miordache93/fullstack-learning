import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from './api';
import type { CreateTask, Task } from './task.types';

export const taskKeys = {
  all: ['tasks'] as const,
  list: (filter: string) => [...taskKeys.all, 'list', filter] as const,
};

export function useTasks(filter: 'all' | 'open' | 'done') {
  return useQuery({
    queryKey: taskKeys.list(filter),
    queryFn: () => taskApi.list(filter),
    refetchInterval: 30_000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTask) => taskApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ task, done }: { task: Task; done: boolean }) =>
      taskApi.update(task, { done }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}
