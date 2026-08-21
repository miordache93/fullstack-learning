import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TaskFilter = 'all' | 'open' | 'done';

type TaskUiState = {
  filter: TaskFilter;
  compact: boolean;
  setFilter: (filter: TaskFilter) => void;
  toggleCompact: () => void;
};

export const useTaskUiStore = create<TaskUiState>()(
  persist(
    (set) => ({
      filter: 'all',
      compact: false,
      setFilter: (filter) => set({ filter }),
      toggleCompact: () => set((state) => ({ compact: !state.compact })),
    }),
    { name: 'task-ui-preferences' },
  ),
);
