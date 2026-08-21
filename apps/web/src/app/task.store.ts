// WHAT: Zustand owns small synchronous state shared across distant UI components.
import { create } from 'zustand';
// WHAT: Persist only user preferences, never authoritative task records.
import { persist } from 'zustand/middleware';
import type { TaskFilter } from './task.types';

type TaskUiState = {
  filter: TaskFilter;
  compact: boolean;
  setFilter: (filter: TaskFilter) => void;
  toggleCompact: () => void;
};

export const useTaskUiStore = create<TaskUiState>()(
  persist((set) => ({
    // WHAT: Define deterministic first-visit preferences.
    filter: 'all',
    compact: false,
    // WHAT: Replace one scalar preference without touching remote data.
    setFilter: (filter) => set({filter}),
    // WHY: Functional updates are correct even when events are batched.
    toggleCompact: () => set((state) => ({ compact: !state.compact })),
    // BOUNDARY: Namespace this client-owned value in localStorage.
  }), { name: 'task-ui-preferences' }),
);
