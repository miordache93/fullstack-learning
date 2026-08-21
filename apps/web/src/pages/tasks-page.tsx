// WHAT: Form text is local and short-lived, so keep it in this component.
import { useState, type FormEvent } from 'react';
import { Button, ErrorState, PageState } from '@nx-fullstack-learning/frontend-ui';
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '../app/task.queries';
import { useTaskUiStore } from '../app/task.store';
import type { TaskFilter } from '../app/task.types';

export default function TasksPage() {
  // WHAT: Draft form input has one owner and does not need a global store.
  const [title, setTitle] = useState('');
  // WHAT: Subscribe to shared client preferences.
  const { filter, setFilter, compact, toggleCompact } = useTaskUiStore();
  // WHAT: Subscribe to server state at the cache address for the selected filter.
  const tasks = useTasks(filter);
  // WHAT: Create independent mutation state for each remote command.
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  // WHAT: Derive rows from the query result instead of duplicating them in state.
  const rows = tasks.data?.data ?? [];

  function submit(event: FormEvent) {
    // WHAT: Keep the browser on this client-rendered route.
    event.preventDefault();
    // BOUNDARY: Normalize before sending, while the API remains authoritative.
    const nextTitle = title.trim();
    if (!nextTitle) return;
    // WHAT: Clear the draft only after the server accepts the task.
    createTask.mutate({ title: nextTitle, priority: 'medium' }, { onSuccess: () => setTitle('') });
  }

  return (
    <section>
      <h2>Tasks</h2>
      <p>TanStack Query owns server state; Zustand owns display preferences.</p>

      <form className="task-form" onSubmit={submit}>
        <label>
          Task title
          <input value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <Button type="submit" disabled={createTask.isPending}>
          {createTask.isPending ? 'Adding…' : 'Add task'}
        </Button>
      </form>

      <div className="toolbar">
        <label>
          Filter <select
            value={filter}
            // BOUNDARY: The select options below constrain this runtime cast.
            onChange={(event) => setFilter(event.target.value as TaskFilter)}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="done">Done</option>
          </select>
        </label>
        <Button variant="secondary" onClick={toggleCompact}>
          {compact ? 'Comfortable rows' : 'Compact rows'}
        </Button>
      </div>

      {/* WHAT: Render remote states explicitly rather than as one ambiguous boolean. */}
      {tasks.isPending && <PageState>Loading tasks…</PageState>}
      {tasks.isError && <ErrorState error={tasks.error} />}
      {tasks.isSuccess && rows.length === 0 && <PageState>No tasks match this filter.</PageState>}
      {tasks.isSuccess && rows.length > 0 && (
        <div className={compact ? 'task-list task-list--compact' : 'task-list'}>
          {rows.map((task) => (
            // WHY: Stable server identity preserves row state across refetches.
            <article className="task-row" key={task.id}>
              <label>
                <input type="checkbox" checked={task.done} onChange={(event) => updateTask.mutate({ task, done: event.target.checked })} /> <span className={task.done ? 'task-row__done' : ''}>{task.title}</span>
              </label>
              <Button variant="danger" aria-label={`Delete ${task.title}`} onClick={() => deleteTask.mutate(task.id)}>
                Delete
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}