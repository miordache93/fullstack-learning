// WHAT: Inspect replica-set state so rerunning this setup remains idempotent.
try {
  rs.status();
} catch (error) {
  // WHAT: Give the local server replica-set capabilities required by transaction labs.
  rs.initiate({
    _id: 'rs0',
    members: [{ _id: 0, host: 'mongodb:27017' }],
  });
}

// CHECK: Index commands should target a writable primary, not an electing member.
let primaryReady = false;
// WHY: Bound election polling so a broken topology fails setup instead of hanging forever.
for (let attempt = 1; attempt <= 120; attempt += 1) {
  // WHAT: Stop polling as soon as this member accepts writes as primary.
  if (db.adminCommand({ hello: 1 }).isWritablePrimary) {
    primaryReady = true;
    break;
  }
  // WHY: Avoid a CPU-heavy tight loop while the one-node election completes.
  sleep(500);
}

// CHECK: Surface an actionable setup failure after one minute.
if (!primaryReady)
  throw new Error('MongoDB replica set did not elect a primary');

// BOUNDARY: Index definitions belong to database deployment, not request startup.
const learningDb = db.getSiblingDB('learning');

// WHY: Serve filtered, newest-first task pages with a deterministic id tie-breaker.
learningDb.tasks.createIndex(
  { done: 1, createdAt: -1, _id: 1 },
  { name: 'tasks_done_created_at_id' },
);

// WHY: Serve newest-first pages that omit the optional `done` predicate.
learningDb.tasks.createIndex(
  { createdAt: -1, _id: 1 },
  { name: 'tasks_created_at_id' },
);

// WHY: Support event history lookups without scanning every task's events.
learningDb.task_events.createIndex(
  { taskId: 1, createdAt: -1 },
  { name: 'task_events_task_id_created_at' },
);
