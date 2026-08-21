// WHAT: Keep decision notes on a route users need not download initially.
export default function ArchitecturePage() {
  return (
    <section>
      <h2>Architecture decisions</h2>
      <p>The task service depends on a repository port, not an ORM client.</p>
    </section>
  );
}