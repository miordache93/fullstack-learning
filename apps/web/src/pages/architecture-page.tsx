export default function ArchitecturePage() {
  return (
    <section>
      <h2>Dependency direction</h2>
      <pre>{`web app  ──> frontend/ui

api app  ──> backend/core ──> PostgreSQL + S3

AWS edge ──> CloudFront ──> S3 (web)
                     └────> ALB ──> ECS (api)`}</pre>
      <p>
        Apps are composition roots. Libraries hold reusable policy and domain
        code; infrastructure remains replaceable at the edges.
      </p>
    </section>
  );
}
