// WHAT: Query owns remote reads; mutations own remote writes and cache reconciliation.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskApi } from './api';
import type { CreateTask, Task, TaskFilter } from './task.types';


// WHY: Query keys are deterministic cache addresses, not arbitrary labels.
export const taskKeys = {
  // WHAT: Address every task-related entry for broad invalidation.
  all: ['tasks'] as const,
  // WHAT: Include every input that changes the returned collection.
  list: (filter: TaskFilter) => [...taskKeys.all, 'list', filter] as const,
};

export function useTasks(filter: TaskFilter) {
  return useQuery({
    queryKey: taskKeys.list(filter),
    // BOUNDARY: The query function is the only remote read for this cache address.
    queryFn: () => taskApi.list(filter),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    // WHY: One key per attempt makes retrying this exact call safe instead of duplicating it.
    mutationFn: ({ input, idempotencyKey }: { input: CreateTask; idempotencyKey: string }) =>
      taskApi.create(input, idempotencyKey),
    // CHECK: Refetch every filtered list after server success.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    // WHY: Send the complete observed task because its version is the concurrency token.
    mutationFn: ({ task, done }: { task: Task; done: boolean }) => taskApi.update(task, { done }),
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