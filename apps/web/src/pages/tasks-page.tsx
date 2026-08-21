import { useRef, useState, type FormEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Button,
  ErrorState,
  PageState,
} from '@nx-fullstack-learning/frontend-ui';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from '../app/task.queries';
import { useTaskUiStore } from '../app/task.store';

export default function TasksPage() {
  const [title, setTitle] = useState('');
  const { filter, setFilter, compact, toggleCompact } = useTaskUiStore();
  const tasks = useTasks(filter);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = tasks.data?.data ?? [];
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (compact ? 48 : 72),
    overscan: 6,
    getItemKey: (index) => rows[index]?.id ?? index,
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    createTask.mutate(
      { title: nextTitle, priority: 'medium' },
      { onSuccess: () => setTitle('') },
    );
  }

  return (
    <section>
      <h2>Tasks</h2>
      <p>
        Server state comes from TanStack Query. Filter and density preferences
        live in Zustand.
      </p>

      <form className="task-form" onSubmit={submit}>
        <label>
          Task title
          <input
            value={title}
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <Button type="submit" disabled={createTask.isPending}>
          {createTask.isPending ? 'Adding…' : 'Add task'}
        </Button>
      </form>

      <div className="toolbar">
        <label>
          Filter{' '}
          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as 'all' | 'open' | 'done')
            }
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

      {tasks.isPending && <PageState>Loading tasks…</PageState>}
      {tasks.isError && <ErrorState error={tasks.error} />}
      {tasks.isSuccess && rows.length === 0 && (
        <PageState>No tasks match this filter.</PageState>
      )}
      {tasks.isSuccess && rows.length > 0 && (
        <div ref={scrollRef} className="virtual-list">
          <div
            className="virtual-list__inner"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const task = rows[virtualRow.index];
              return (
                <article
                  className="task-row"
                  key={task.id}
                  style={{
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(event) =>
                        updateTask.mutate({
                          task,
                          done: event.target.checked,
                        })
                      }
                    />{' '}
                    <span className={task.done ? 'task-row__done' : ''}>
                      {task.title}
                    </span>
                  </label>
                  <Button
                    variant="danger"
                    aria-label={`Delete ${task.title}`}
                    onClick={() => deleteTask.mutate(task.id)}
                  >
                    Delete
                  </Button>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
