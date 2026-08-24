// WHAT: Reuse an already initialized topology when the setup job runs again.
try {
  // CHECK: This succeeds only after replica-set configuration exists.
  rs.status();
} catch (error) {
  // WHAT: Configure the one local member using the DNS name visible to containers.
  rs.initiate({
    // WHAT: Match the `--replSet rs0` server argument.
    _id: 'rs0',
    // WHY: Other Compose services resolve `mongodb`; their localhost is different.
    members: [{ _id: 0, host: 'mongodb:27017' }],
  });
}

// CHECK: Remember whether election completed before the deadline.
let primaryReady = false;
// WHY: Fail after roughly one minute instead of hanging forever.
for (let attempt = 1; attempt <= 120; attempt += 1) {
  // WHAT: Ask whether this member currently accepts writes as primary.
  if (db.adminCommand({ hello: 1 }).isWritablePrimary) {
    // CHECK: Preserve success for the final assertion.
    primaryReady = true;
    // WHAT: Stop polling as soon as the invariant holds.
    break;
  }
  // WHY: Yield between attempts rather than spin in a tight loop.
  sleep(500);
}

// CHECK: Make an election failure visible through the setup service's exit code.
if (!primaryReady) {
  throw new Error('MongoDB replica set did not elect a primary');
}
