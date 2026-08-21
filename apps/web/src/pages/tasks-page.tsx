// WHAT: Export a default component so React.lazy can load this route module.
export default function TasksPage() {
  return (
    <section>
      <h2>Tasks</h2>
      {/* CHECK: Remote state is intentionally deferred to the next branch. */}
      <p>The HTTP API is ready. Next, connect this route to it.</p>
    </section>
  );
}