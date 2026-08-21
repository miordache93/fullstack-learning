# Production-minded full-stack learning path

Build a small task system with React, Node.js, PostgreSQL, MongoDB, Docker, GitHub Actions, and AWS. The UI is deliberately plain. The value of this project is in boundaries, correctness, performance, security, operations, and the reasoning behind each decision.

Last verified: 21 August 2026. The scaffold uses Nx 23.1.1, React 19, React Router 7.18.2, Node.js 24 LTS, Express 5, Zod 4, Prisma ORM 7.9.1 with its PostgreSQL driver adapter, Mongoose 9.9.1, TanStack Query 5, Zustand 5, PostgreSQL 18, MongoDB 8.0, and Docker Compose v2.

## What you will finish with

- An Nx monorepo containing one React app, one Node.js app, one frontend library, and one backend library.
- A task CRUD API that can use Prisma/PostgreSQL or Mongoose/MongoDB without changing its routers or business service, including validation, structured errors, optimistic concurrency, transactions, readiness, and graceful shutdown.
- A few deliberate parameterized-SQL escape hatches for query plans, partial indexes, queue locking, and database-native operations that should not be hidden by the ORM.
- Native MongoDB selector exercises for projections, atomic updates, indexes, transactions, change streams, replication, and sharding decisions.
- A React client with lazy routes, shared components, local state, Zustand client state, TanStack Query server state, mutations, polling, and list virtualization.
- Direct and presigned S3 upload examples.
- Development and production-oriented Docker images plus a local Compose stack.
- CI and AWS deployment workflows using short-lived GitHub OIDC credentials.
- A guided AWS architecture using S3, CloudFront, ALB, ECS/Fargate, RDS, ECR, IAM, and Budgets, plus decision lessons for API Gateway and EC2.

This is not a “type these commands and forget them” guide. At the end of each lesson, change something, break something, measure it, and explain the result in your own words.

## Repository map

```text
nx-fullstack-learning/
├── apps/
│   ├── web/                         # React composition root
│   └── api/                         # Node process composition root
├── libs/
│   ├── frontend/ui/                 # Shared presentational components
│   └── backend/core/                # Domain, HTTP policy, DB and S3 adapters
├── infra/                           # Empty/planned until database and AWS lessons
│   ├── postgres/                    # You create advanced plain-SQL labs
│   ├── mongodb/                     # You create replica-set/index setup
│   └── aws/                         # You create task, OIDC, and budget templates
├── prisma/                          # Absent initially; you author it in Branch 05
├── prisma.config.ts                 # Absent initially; you author it in Branch 05
├── .github/workflows/               # Absent initially; you author it in Branch 11
├── compose.yaml                     # Absent initially; you begin it in Lesson 0.3
└── FULLSTACK_TUTORIAL.md
```

The dependency direction is intentional:

```text
apps/web ─────────> libs/frontend/ui

apps/api ─────────> libs/backend/core ─┬───> PostgreSQL through Prisma
                                      ├───> MongoDB through Mongoose
                                      └───> S3

CloudFront ───────> S3 web origin
       └──────────> ALB ─────> ECS API ─────> RDS / S3 uploads
```

Apps are composition roots: they choose concrete implementations and start processes. Libraries own reusable policy. A frontend library must never import the API app, and the domain service must not import `apps/api`. Prisma and Mongoose are infrastructure adapters inside `backend/core`; domain policy depends on the `TaskRepository` interface rather than generated Prisma or Mongoose types. “Database-neutral” means the port owns explicit shared semantics—not that SQL and document databases behave identically.

## Prerequisites and cost guardrails

Install:

- Node.js 24 LTS and npm. Run `nvm use` in the repository if you use nvm.
- Docker Engine or Docker Desktop with Compose v2.
- Git, PostgreSQL client tools (`psql`, `pg_dump`, `pg_restore`), optionally `mongosh`, and optionally AWS CLI v2.
- An AWS account. Enable MFA on the root user and do not create root access keys.

Before the AWS lessons, create a budget. A budget alerts you; it does not automatically stop every service. NAT Gateway, ALB, RDS, and public IPv4 addresses can incur charges even when traffic is low. The least expensive learning path is local Docker first, then a time-boxed AWS deployment that you tear down.

## How to use the curriculum

This branch is an implementation starter, not a reference application. Only the Nx project shells compile initially. Follow the dependency-ordered exercise ladder below; the numbered Parts are topic chapters you visit in the order named by each integrated lab.

Read each lesson through five lenses. Some are expressed inline rather than repeated as headings:

1. **Outcome** — what capability you add.
2. **Create** — the absent file or smallest increment you must type.
3. **Why** — the engineering reason, not just syntax.
4. **Lab** — a change or command to run.
5. **Exit check** — evidence that you understood it.

An exit check is not a discussion prompt that can be skipped. Save the command output, test, query plan, screenshot, or short decision record named by the exercise. That evidence is the difference between “I followed the example” and “I can explain and operate the result.”

## Summit delivery guide

### Audience and learning levels

The core track assumes an attendee can build a small React form, write an `async` TypeScript function, and recognize basic HTTP and SQL. It is aimed at middle-level full-stack engineers moving toward senior ownership. The same project supports three levels without making everyone finish the most expensive exercise:

- **Core:** implement the happy path and one important failure path. Every attendee should finish it.
- **Senior challenge:** measure, break, recover, or defend the design under concurrency and failure.
- **Expert extension:** make or justify a distributed-systems and operational tradeoff. These are breakout or take-home exercises, not hidden core requirements.

The order is intentional: prove the Nx shells, implement a database-free HTTP contract, connect React to that real API, then add PostgreSQL, MongoDB, performance/security, images, automation, and cloud. Do not follow the Part numbers as a waterfall; use the integrated lab numbers as the build order.

The starter intentionally omits lesson implementations: routes, pages, Query hooks, Zustand stores, shared components, backend policy, validation, repositories, database schema, Compose, Dockerfiles, workflows, and cloud templates. You create each one from the commented lesson increment. The local `solution/reference` branch preserves the prior implementation for facilitator recovery; do not inspect it before an exit check.

### Curriculum triage

| Area             | Required core                     | Senior / expert extension                                    | Dependency                              |
| ---------------- | --------------------------------- | ------------------------------------------------------------ | --------------------------------------- |
| Nx and host run  | 0.1–0.2                           | Project-boundary rules and custom generators                 | None                                    |
| First E2E slice  | 2.3, 2.5 port/service, 2.2, 2.1   | Idempotency and contract tests                               | Nx host shells                          |
| React            | 1.1–1.4, 1.6                      | 1.5 polling; 1.7 virtualization                              | Working in-memory HTTP API              |
| Compose database | 0.3A–0.3C                         | Custom networks, resource limits, and secret providers       | None; schema is added later             |
| Node.js          | 2.4–2.13                          | TLS, S3, concurrency, worker pool, hardening                 | First in-memory vertical slice          |
| PostgreSQL       | 3.1–3.4, 3.8                      | 3.5 pooling/maintenance, 3.7 replicas; 3.6 sharding decision | Repository port from 2.5                |
| MongoDB          | 3B.1–3B.4, 3B.8                   | 3B.5–3B.6; 3B.7 shard-key decision                           | Repository contract and transaction lab |
| Docker images    | 4.1–4.3                           | 4.4 incident triage                                          | Learner-built database Compose file     |
| GitHub Actions   | 5.1–5.2                           | 5.3 deployment rollback                                      | Deterministic checks and images         |
| AWS              | Guided 6.1–6.10 and teardown 6.14 | 6.11–6.13; 6.5B managed MongoDB evaluation                   | Budget, reviewed IAM, passing CI        |

“Guided” AWS means the instructor demonstrates a pre-provisioned staging environment while attendees complete the architecture, IAM, cost, and verification tasks. Creating every network, RDS, ALB, ECS, CloudFront, and DNS resource from scratch needs a separate cloud lab. It should not consume the database and application learning time.

### Recommended formats

| Format                           | What fits honestly                                                                                   | Result                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 90-minute summit session         | Architecture walkthrough, one vertical-slice demo, transaction failure demo, and AWS decision review | Shared mental model; no claim of implementation mastery               |
| One-day workshop                 | Prework plus Labs 1–6; application images are demonstrated, not completed                            | Working local vertical slice and learner-built PostgreSQL service     |
| Two-day workshop                 | Prework plus Labs 1–12; AWS and CI are instructor demonstrations                                     | Tested application, both database paths, images, and composed runtime |
| Three-day workshop (recommended) | Two-day track plus Labs 13–15, attendee-owned AWS build, and advanced breakouts                      | Enforced CI, cloud creation, incident drill, restore, and teardown    |
| Self-study                       | Every numbered lesson and progression project, roughly 35–50 focused hours                           | Complete middle-to-expert reference path                              |

For workshop delivery, keep lectures to 10–15 minutes, core labs to 30–90 minutes, and debriefs to 5–10 minutes. Stop a lab at its core exit check; move unfinished senior challenges to the parking lot instead of delaying every dependent exercise.

### Dependency-ordered exercise ladder

These are the summit's integrated exercises. The smaller labs inside each lesson remain useful practice, but this ladder gives facilitators a finishable narrative and gives attendees one evidence folder to present at the end.

|   # | Integrated lab                        |                       Time | Required lessons                      | Evidence to keep                                                   |
| --: | ------------------------------------- | -------------------------: | ------------------------------------- | ------------------------------------------------------------------ |
|   0 | Tool-only preflight                   | 20–30 min before the event | Prerequisites                         | Versions and `npm ci`; no completed Compose stack                  |
|   1 | Recreate the Nx boundaries            |                     35 min | 0.1                                   | Project graph and a second cached task run                         |
|   2 | Prove the host process skeleton       |                     30 min | 0.2                                   | Starter web page and generated-style API response                  |
|   3 | Define domain and in-memory contract  |                     75 min | 2.3, 2.5 port/service                 | Repository contract and service tests without a database           |
|   4 | Expose the first HTTP CRUD slice      |                     75 min | 2.2, then 2.1 composition             | Valid/invalid HTTP transcript and centralized error response       |
|   5 | Build React against the real API      |                     90 min | 1.1–1.4, 1.6                          | Lazy route, shared component test, query-key and mutation trace    |
|   6 | Build PostgreSQL and Prisma           |                    105 min | 0.3, 2.4, 3.1                         | Health/persistence proof, migration, Prisma CRUD and raw query     |
|   7 | Defend concurrent completion          |                     60 min | 2.8, 3.2, 2.13                        | One winner, one HTTP 409, and rollback evidence                    |
|   8 | Extend Compose for MongoDB            |                     60 min | 3B.0–3B.3                             | Replica-set state, contract evidence, rollback proof               |
|   9 | Measure one bottleneck                |                     45 min | Choose 1.7, 2.6–2.7, 3.3–3.5, or 3B.5 | Before/after latency, plan, DOM count, or worker result            |
|  10 | Harden a boundary and lifecycle       |                     60 min | 2.9, 2.11; optionally 2.12            | Stable redacted error, request ID, graceful-shutdown trace         |
|  11 | Build application images              |                     60 min | 4.1–4.2                               | Context/image comparison, layers, runtime user, SPA route proof    |
|  12 | Complete Compose incrementally        |                     90 min | 4.3–4.4                               | Per-service success/failure evidence and final health chain        |
|  13 | Make CI enforce the contract          |                     60 min | 5.1–5.3                               | Passing workflow, affected graph, deliberate failing check         |
|  14 | Review the AWS production design      |                     60 min | 6.1–6.10, 6.13                        | Diagram, threat/cost notes, health and rollback observations       |
|  15 | Capstone incident and decision review |                     75 min | Parts 0–6                             | Runbook timeline, recovery proof, one architecture decision record |

Day 1 should finish Labs 1–6. Day 2 should finish Labs 7–12. A third day completes CI, cloud, and capstone Labs 13–15. Lab 0 is mandatory prework; it verifies tools only and must not distribute the completed Compose answer. If it fails, attendees join a setup lane instead of blocking the main room.

### Repeatable lab protocol

Use the same loop for every integrated lab:

1. **Predict:** write what should happen, including the status code, state transition, or query plan shape.
2. **Implement:** type the smallest change yourself; use the reference only after an honest attempt.
3. **Prove:** run a focused test or command before the broad suite.
4. **Break:** introduce the named stale write, bad input, missing dependency, or deployment failure.
5. **Observe:** capture logs, metrics, traces, database state, and user-visible behavior.
6. **Recover:** remove the fault and prove the invariant still holds.
7. **Explain:** write a three-sentence tradeoff or teach it to a partner without reading the tutorial.

Every numbered lesson also contains exactly two **Additional exercises**. They are an exercise bank, not two new hidden prerequisites: complete both during self-study, or let summit facilitators select one as the senior/expert breakout while the core group protects the dependency-ordered exit check. Any exercise that changes a shared contract must still be committed cumulatively before a later branch depends on it.

For pairs, swap driver and navigator after step 3. The navigator owns the prediction and watches for copy/paste without understanding; the driver owns the keyboard. For senior/expert tables, add an observer who challenges the failure model and the evidence.

### Summit definition of done

An attendee has completed the core summit path when all of the following are true:

- `npm run check` passes and the Nx graph has no app-to-app or library-to-app dependency leak.
- The same public CRUD and version-conflict contract passes against PostgreSQL and MongoDB.
- One generated Prisma query and one native SQL selector are explained with a real PostgreSQL plan.
- One Mongoose operation and one native MongoDB selector are explained with execution statistics.
- Invalid input, missing data, a stale update, and an unexpected error produce intentional, non-leaking behavior.
- A transaction rollback, graceful shutdown, unhealthy dependency, and failed staging deployment each have captured evidence.
- The container is reproducible, CI uses least-privilege short-lived AWS identity, and no secret appears in source or logs.
- The AWS design includes owner, cost guardrail, health signal, rollback path, restore test, and teardown result.

Expert completion is not “more endpoints.” It is evidence that the engineer can state consistency and failure guarantees, justify where an abstraction stops, measure a bottleneck, make a reversible deployment, and reject unnecessary distributed complexity.

### Facilitator readiness checklist

Complete this 48 hours before the summit:

- Verify the starter branch has no completed Compose/Dockerfile answer. Separately verify the pinned versions, `npm ci`, `npm run check`, both reference-solution profiles, migration history, and seed idempotency on a clean machine.
- Pre-pull the large Docker images on venue machines and provide a known-good archive or mirror for restricted networks.
- Keep a clean starter copy and a read-only solution copy. Reveal only the files required by the current lab.
- Prepare reset scripts or disposable databases per pair; never ask attendees to repair a shared schema after another pair's experiment.
- Prepare one healthy and one intentionally broken staging revision. Confirm GitHub OIDC, ECS rollback, CloudWatch logs, and teardown permissions before the room arrives.
- Give each AWS participant an isolated sandbox/role with a region, service quota, budget, tags, and an end time. Never distribute a shared administrator credential.
- Print the core exit checks and timeboxes. Assign a setup helper so the instructor can continue when an individual laptop fails.
- End with teardown and a cost-resource inventory. AWS Budgets are delayed monitoring and optional actions, not a universal real-time kill switch.

### Capstone scenario

At the end of the full summit path, deploy a revision that makes readiness fail after a database configuration mistake while a second client submits a stale task completion. The team must keep the old ECS revision serving, identify the configuration error from correlated telemetry, show that only one completion commits, restore service, and write a short decision record covering prevention and rollback.

Core evidence:

- The load balancer never routes to the unready revision.
- The stale writer receives the documented 409 response and no duplicate event is stored.
- Logs include the request ID but exclude secrets and internal stack details.
- The rollback returns health to target before the declared recovery objective.
- The decision record names owner, alert, prevention, rollback, and one rejected alternative.

Senior challenge: repeat with the MongoDB adapter and explain which observations remain identical because of the repository contract and which are engine-specific. Expert extension: introduce a backward-incompatible migration proposal and design an expand/contract deployment that makes rollback safe before running any migration.

### Comment-first learning contract

You—not the starter branch—should contain most of the implementation. Every lesson artifact is intentionally absent from the workspace: application routes, hooks, stores, components, domain policy, repositories, database files, container artifacts, workflows, and cloud templates. The tutorial explains the decision, gives you an exact small block to type, and requires a success check plus a failure experiment before the next block. The code being visible in this workbook is the teaching material; it is not preinstalled application code.

Code samples are intentionally more heavily commented than ordinary production code. Most meaningful lines carry one of these teaching signals:

- `WHAT:` describes the immediate effect of a statement.
- `WHY:` explains the design reason or tradeoff behind it.
- `BOUNDARY:` identifies where untrusted data or an architectural layer changes.
- `CHECK:` tells you what evidence should prove the line worked.
- `TODO:` marks code that you should write or adapt yourself.

Comments are attached to meaningful statements, not closing braces or self-explanatory punctuation. After completing a lesson, rewrite the behavior without copying, then remove comments that merely restate syntax. Keep comments that preserve a non-obvious decision, invariant, security rule, or operational warning.

Shell, TypeScript, and SQL examples use their native comment syntax and remain copy-pasteable where the lesson is demonstrating an application concept. Compose, Dockerfile, Nginx, and MongoDB-topology code is given as cumulative, commented increments rather than as files already present in the scaffold. Type and merge those increments yourself; never paste explanatory ellipsis lines. Strict JSON cannot contain comments; each JSON example therefore has a field-by-field explanation immediately before it. Never paste pseudo-comments into a production JSON document.

Use cumulative lesson branches. Each child starts from its completed parent and therefore contains all earlier behavior:

```text
workshop/start
└── lesson/01-domain-contract
    └── lesson/02-http-e2e
        └── lesson/03-react-routing-ui
            └── lesson/04-query-and-state
                └── lesson/05-postgres-prisma
                    └── lesson/06-concurrency-transactions
                        └── lesson/07-mongodb-mongoose
                            └── lesson/08-node-hardening-workers-s3
                                └── lesson/09-container-images
                                    └── lesson/10-compose-runtime
                                        └── lesson/11-ci-cd
                                            └── lesson/12-aws
```

Create the next branch only after the current exit check passes:

```bash
# CHECK: Confirm the current lesson is green before it becomes the next baseline.
npm run check
# WHAT: Save a small, explainable checkpoint containing your own implementation.
git add --all && git commit -m "lesson 01: define the task domain contract"
# WHAT: Branch from that commit, so lesson 02 includes lesson 01 by construction.
git switch -c lesson/02-http-e2e
```

Never create every `lesson/*` branch directly from `workshop/start`; that would make dependent lessons lose their prerequisites. Use the local `solution/reference` only for facilitator recovery after an honest attempt, then return to your own branch and retype the behavior from memory.

### Exact application build spine

The topic chapters below contain the deep explanations and senior/expert extensions. For the first end-to-end implementation, use this build spine instead of reading Parts 1 and 2 top-to-bottom: **domain and service → HTTP API → shared UI and routing → Query and Zustand → Prisma → concurrency → Mongoose**. This prevents React from being built against imaginary endpoints and prevents either ORM from becoming the domain model.

Each file block is a checkpoint, not a repository answer. Create the named file, type the block, run its focused check, and make the named change yourself before moving on. Most meaningful statements are deliberately commented here; after the summit, remove comments that only restate syntax and keep comments that defend boundaries or invariants.

#### Branch 01 — Build the domain contract without a database

Create `lesson/01-domain-contract` from `workshop/start`. The reason for starting in the backend library is important: business behavior should be testable without HTTP, React, Prisma, Mongoose, Docker, or AWS.

The root workspace already downloaded Zod for later lessons. Declare it at the project boundary so Nx can verify that the backend library owns what it imports:

```bash
# WHAT: Declare Zod as a runtime dependency of the backend library package.
npm pkg set 'dependencies.zod=^4.4.3' --workspace @nx-fullstack-learning/backend-core
```

Create `libs/backend/core/src/lib/tasks/task.schema.ts`:

```ts
// BOUNDARY: Zod preserves runtime checks after TypeScript types disappear.
import { z } from 'zod';

// BOUNDARY: Validate route identities before the service receives them.
export const TaskIdSchema = z.object({ id: z.uuid() });
// WHAT: Reuse one accepted vocabulary at HTTP and persistence boundaries.
export const PrioritySchema = z.enum(['low', 'medium', 'high']);

// BOUNDARY: Convert an untrusted create body into a domain command.
export const CreateTaskSchema = z.object({
  // WHY: Normalization makes whitespace-only titles invalid.
  title: z.string().trim().min(1).max(200),
  // WHY: Bound optional input before a database or log receives it.
  description: z.string().trim().max(2_000).optional(),
  // WHY: The server, not every caller, owns the default.
  priority: PrioritySchema.default('medium'),
});

// BOUNDARY: A patch may change selected fields but must carry a concurrency token.
export const UpdateTaskSchema = z
  .object({
    // WHAT: Every mutable field is optional in a partial update.
    title: z.string().trim().min(1).max(200).optional(),
    // WHY: `null` explicitly clears a description; `undefined` leaves it alone.
    description: z.string().trim().max(2_000).nullable().optional(),
    // WHAT: Reuse the same finite priority vocabulary.
    priority: PrioritySchema.optional(),
    // WHAT: Permit the completion state to change.
    done: z.boolean().optional(),
    // WHY: Reject stale writes later with optimistic concurrency.
    version: z.number().int().positive(),
  })
  .refine(
    // CHECK: A version by itself is not a useful patch.
    (input) => Object.entries(input).some(([property, value]) => property !== 'version' && value !== undefined),
    // WHAT: Return one stable validation message for an empty patch.
    { message: 'Provide at least one field to update' },
  );

// BOUNDARY: Completion also requires the version the caller observed.
export const CompleteTaskSchema = z.object({
  version: z.number().int().positive(),
});

// BOUNDARY: Query strings are strings until this parser deliberately transforms them.
export const ListTasksSchema = z.object({
  // WHY: Bound page size to protect memory and response latency.
  limit: z.coerce.number().int().min(1).max(500).default(50),
  // WHAT: Start with offset pagination before the later cursor exercise.
  offset: z.coerce.number().int().min(0).default(0),
  // WHY: Avoid `z.coerce.boolean()` because the string "false" is truthy in JavaScript.
  done: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  // WHY: Normalize and bound the optional search term.
  q: z.string().trim().max(100).optional(),
});

// WHAT: Derive compile-time command types from runtime authorities.
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type ListTasksInput = z.infer<typeof ListTasksSchema>;
```

Create `libs/backend/core/src/lib/tasks/task.repository.ts`:

```ts
// WHAT: Import only domain command types, never an ORM-generated record.
import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from './task.schema.js';

// BOUNDARY: This stable domain shape is shared by every persistence adapter.
export type Task = {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  version: number;
  createdAt: string;
  updatedAt: string;
};

// WHY: Preserve missing versus stale-write semantics across database clients.
export type UpdateResult = { kind: 'updated'; task: Task } | { kind: 'missing' } | { kind: 'conflict' };

// BOUNDARY: Business policy depends on capabilities, not Prisma or Mongoose APIs.
export interface TaskRepository {
  // WHAT: Return a bounded page plus its total count.
  list(input: ListTasksInput): Promise<{ data: Task[]; total: number }>;
  // WHAT: Model ordinary absence explicitly.
  findById(id: string): Promise<Task | null>;
  // WHAT: Persist a validated create command.
  create(input: CreateTaskInput): Promise<Task>;
  // WHAT: Preserve optimistic-concurrency outcomes.
  update(id: string, input: UpdateTaskInput): Promise<UpdateResult>;
  // WHY: Give adapters a transaction-aware completion operation.
  complete(id: string, version: number): Promise<UpdateResult>;
  // WHAT: Translate engine-specific delete counts to one boolean.
  delete(id: string): Promise<boolean>;
}
```

Create `libs/backend/core/src/lib/tasks/in-memory-task.repository.ts`. This is not throwaway mocking: it lets you prove the port and complete an E2E slice before infrastructure obscures mistakes.

```ts
// WHAT: Use platform UUID generation so identity matches both future adapters.
import { randomUUID } from 'node:crypto';
// WHAT: Import the domain port and result types this adapter must satisfy.
import type { Task, TaskRepository, UpdateResult } from './task.repository.js';
// WHAT: Import validated command shapes, not HTTP request objects.
import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from './task.schema.js';

// WHAT: Implement the same contract without a database process.
export class InMemoryTaskRepository implements TaskRepository {
  // WHY: Keep mutable records private so callers cannot bypass version checks.
  private readonly records = new Map<string, Task>();

  async list(input: ListTasksInput) {
    // WHAT: Work on a new array rather than exposing the internal Map.
    const matches = [...this.records.values()]
      // WHAT: Apply the optional completion filter when supplied.
      .filter((task) => input.done === undefined || task.done === input.done)
      // WHAT: Use the shared case-insensitive literal-substring contract.
      .filter((task) => !input.q || task.title.toLowerCase().includes(input.q.toLowerCase()))
      // WHY: Make pagination deterministic when timestamps collide.
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt) || left.id.localeCompare(right.id));

    // WHAT: Slice only after filtering and sorting, as the databases must later do.
    const data = matches.slice(input.offset, input.offset + input.limit);
    // BOUNDARY: Return copies so a test or service cannot mutate stored state.
    return { data: data.map((task) => ({ ...task })), total: matches.length };
  }

  async findById(id: string) {
    // WHAT: Return a defensive copy or explicit absence.
    const task = this.records.get(id);
    return task ? { ...task } : null;
  }

  async create(input: CreateTaskInput) {
    // WHAT: Use one timestamp for a new record's creation and first update.
    const now = new Date().toISOString();
    // WHAT: Translate a validated command into the stable domain representation.
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description ?? null,
      done: false,
      priority: input.priority,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    // WHAT: Persist the owned record under its portable identity.
    this.records.set(task.id, task);
    // BOUNDARY: Do not expose the mutable stored object.
    return { ...task };
  }

  async update(id: string, input: UpdateTaskInput): Promise<UpdateResult> {
    // CHECK: Distinguish a missing identity from a stale known identity.
    const current = this.records.get(id);
    if (!current) return { kind: 'missing' };
    if (current.version !== input.version) return { kind: 'conflict' };

    // WHAT: Apply only supplied fields and advance the token atomically in this adapter.
    const updated: Task = {
      ...current,
      title: input.title ?? current.title,
      description: input.description === undefined ? current.description : input.description,
      priority: input.priority ?? current.priority,
      done: input.done ?? current.done,
      version: current.version + 1,
      updatedAt: new Date().toISOString(),
    };
    // WHAT: Replace the record only after every condition passes.
    this.records.set(id, updated);
    return { kind: 'updated', task: { ...updated } };
  }

  async complete(id: string, version: number) {
    // WHY: Reuse the same compare-and-swap behavior for the database-free checkpoint.
    return this.update(id, { done: true, version });
  }

  async delete(id: string) {
    // WHAT: Map `Map.delete` directly to the port's boolean contract.
    return this.records.delete(id);
  }
}
```

Create `libs/backend/core/src/lib/errors.ts`:

```ts
// BOUNDARY: Carry intentional public HTTP policy without leaking driver errors.
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    // WHAT: Initialize the built-in Error message and stack.
    super(message);
    // WHY: Preserve the useful concrete subclass name in logs and tests.
    this.name = new.target.name;
  }
}

// WHAT: Give ordinary absence a stable status and machine-readable code.
export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

// WHAT: Represent a stale optimistic-concurrency token intentionally.
export class ConflictError extends HttpError {
  constructor(message = 'The resource changed; fetch it and retry') {
    super(409, message, 'VERSION_CONFLICT');
  }
}
```

Create `libs/backend/core/src/lib/tasks/task.service.ts`:

```ts
// WHAT: Translate persistence outcomes into use-case-aware errors here.
import { ConflictError, NotFoundError } from '../errors.js';
// BOUNDARY: The service knows only the domain-owned port.
import type { TaskRepository, UpdateResult } from './task.repository.js';
import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from './task.schema.js';

// WHAT: Keep use-case policy independent of HTTP and database libraries.
export class TaskService {
  // BOUNDARY: Constructor injection makes the repository explicit and replaceable.
  constructor(private readonly repository: TaskRepository) {}

  list(input: ListTasksInput) {
    // WHAT: Delegate storage-oriented listing through the narrow port.
    return this.repository.list(input);
  }

  async get(id: string) {
    // CHECK: Convert nullable persistence output into a public domain error.
    const task = await this.repository.findById(id);
    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  create(input: CreateTaskInput) {
    // WHAT: Creation policy is deliberately small at this checkpoint.
    return this.repository.create(input);
  }

  async update(id: string, input: UpdateTaskInput) {
    // WHAT: Keep result translation identical for every adapter.
    return this.unwrap(await this.repository.update(id, input));
  }

  async complete(id: string, version: number) {
    // WHY: Later adapters implement this as task-plus-event transaction policy.
    return this.unwrap(await this.repository.complete(id, version));
  }

  async delete(id: string) {
    // CHECK: A false delete result is an intentional not-found outcome.
    if (!(await this.repository.delete(id))) {
      throw new NotFoundError('Task not found');
    }
  }

  private unwrap(result: UpdateResult) {
    // WHAT: Preserve three distinct persistence outcomes at the service boundary.
    if (result.kind === 'missing') throw new NotFoundError('Task not found');
    if (result.kind === 'conflict') throw new ConflictError();
    return result.task;
  }
}
```

Replace `libs/backend/core/src/starter.spec.ts` with `libs/backend/core/src/lib/tasks/task.service.spec.ts`:

```ts
// WHAT: Use real in-memory behavior rather than mocking the behavior under test.
import { describe, expect, it } from 'vitest';
import { ConflictError, NotFoundError } from '../errors.js';
import { InMemoryTaskRepository } from './in-memory-task.repository.js';
import { TaskService } from './task.service.js';

// WHAT: Build an isolated use-case graph for each test.
function setup() {
  const repository = new InMemoryTaskRepository();
  return { repository, service: new TaskService(repository) };
}

describe('TaskService', () => {
  it('creates defaults and lists through the repository port', async () => {
    // WHAT: Exercise the same command shape future adapters receive.
    const { service } = setup();
    const created = await service.create({ title: 'Learn ports', priority: 'medium' });
    // CHECK: Server-owned defaults exist without either database.
    expect(created).toMatchObject({ title: 'Learn ports', done: false, version: 1 });
    // CHECK: The list contract includes data and pagination total.
    await expect(service.list({ limit: 50, offset: 0 })).resolves.toMatchObject({
      data: [created],
      total: 1,
    });
  });

  it('distinguishes missing records from stale writes', async () => {
    const { service } = setup();
    // CHECK: A never-seen identity maps to not found.
    await expect(service.get(crypto.randomUUID())).rejects.toBeInstanceOf(NotFoundError);
    const created = await service.create({ title: 'Race safely', priority: 'high' });
    // WHAT: Commit one update using the observed version.
    await service.update(created.id, { done: true, version: created.version });
    // CHECK: Reusing that version now maps to an intentional conflict.
    await expect(service.update(created.id, { title: 'Stale title', version: created.version })).rejects.toBeInstanceOf(ConflictError);
  });
});
```

Export only the capabilities later composition needs from `libs/backend/core/src/index.ts`:

```ts
// BOUNDARY: Keep consumers on the public library surface instead of deep imports.
export * from './lib/errors.js';
export * from './lib/tasks/in-memory-task.repository.js';
export * from './lib/tasks/task.repository.js';
export * from './lib/tasks/task.schema.js';
export * from './lib/tasks/task.service.js';
```

Run the focused proof, then the workspace proof:

```bash
# CHECK: Prove domain behavior without starting a database or HTTP socket.
npx nx test backend-core
# CHECK: Prove the new library surface did not break another project.
npm run check
```

Break exercise: temporarily remove the version comparison in the in-memory repository; confirm the stale-write test fails, restore it, then explain why passing TypeScript alone could never detect that correctness bug.

Branch 01 exit check: create, list, update, stale-update, and delete tests pass with no Express, Prisma, or Mongoose import in the task service.

#### Branch 02 — Expose the in-memory contract through HTTP

Create `lesson/02-http-e2e` from the green Branch 01 commit. Now HTTP is a translation boundary around behavior that already works; it is not where business rules are invented.

```bash
# WHAT: Declare the runtime framework imported by the backend library.
npm pkg set 'dependencies.express=^5.2.1' --workspace @nx-fullstack-learning/backend-core
```

Create `libs/backend/core/src/lib/http/tasks.router.ts`:

```ts
// WHAT: Use a Router so task HTTP translation can be mounted and tested separately.
import { Router } from 'express';
// BOUNDARY: HTTP may call service use cases but may not access a repository directly.
import type { TaskService } from '../tasks/task.service.js';
// BOUNDARY: Parse every untrusted parameter, query, and body before use.
import { CompleteTaskSchema, CreateTaskSchema, ListTasksSchema, TaskIdSchema, UpdateTaskSchema } from '../tasks/task.schema.js';

// WHAT: Receive the already-constructed service through explicit injection.
export function createTasksRouter(service: TaskService) {
  const router = Router();

  router.get('/', async (request, response) => {
    // BOUNDARY: Query strings become a typed, bounded list command here.
    const input = ListTasksSchema.parse(request.query);
    // WHAT: Await the use case rather than knowing how records are stored.
    const result = await service.list(input);
    // WHAT: Keep collection data and page metadata explicit in the HTTP shape.
    response.json({
      data: result.data,
      page: { limit: input.limit, offset: input.offset, total: result.total },
    });
  });

  router.get('/:id', async (request, response) => {
    // BOUNDARY: Reject malformed UUIDs before a repository query.
    const { id } = TaskIdSchema.parse(request.params);
    response.json({ data: await service.get(id) });
  });

  router.post('/', async (request, response) => {
    // BOUNDARY: Strip unknown input and apply domain defaults through Zod.
    const input = CreateTaskSchema.parse(request.body);
    // WHAT: Creation returns 201 and the server-owned representation.
    response.status(201).json({ data: await service.create(input) });
  });

  router.patch('/:id', async (request, response) => {
    const { id } = TaskIdSchema.parse(request.params);
    // BOUNDARY: Require a positive version and at least one change.
    const input = UpdateTaskSchema.parse(request.body);
    response.json({ data: await service.update(id, input) });
  });

  router.post('/:id/complete', async (request, response) => {
    const { id } = TaskIdSchema.parse(request.params);
    // WHY: A separate use case becomes transactional in the database lessons.
    const { version } = CompleteTaskSchema.parse(request.body);
    response.json({ data: await service.complete(id, version) });
  });

  router.delete('/:id', async (request, response) => {
    const { id } = TaskIdSchema.parse(request.params);
    await service.delete(id);
    // WHY: A successful delete has no representation to return.
    response.status(204).end();
  });

  return router;
}
```

Create `libs/backend/core/src/lib/http/middleware.ts`:

```ts
// WHAT: Import only Express middleware types and Zod's public error type.
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors.js';

// WHAT: Turn an unmatched route into the same stable problem envelope.
export const notFound: RequestHandler = (request, response) => {
  response.status(404).json({
    code: 'ROUTE_NOT_FOUND',
    message: `No route for ${request.method} ${request.path}`,
  });
};

// BOUNDARY: This must have four arguments so Express recognizes error middleware.
export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  // WHAT: Validation errors are safe, expected client failures.
  if (error instanceof ZodError) {
    response.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.issues,
    });
    return;
  }

  // WHAT: Intentional domain/HTTP errors keep their stable public policy.
  if (error instanceof HttpError) {
    response.status(error.status).json({
      code: error.code,
      message: error.message,
      details: error.details,
    });
    return;
  }

  // SECURITY: Do not serialize an unknown stack, SQL text, credentials, or driver object.
  console.error('[unexpected-request-error]', error);
  response.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
};
```

Create `libs/backend/core/src/lib/http/create-app.ts`:

```ts
// WHAT: Keep application construction separate from opening a network socket.
import express from 'express';
import type { TaskService } from '../tasks/task.service.js';
import { errorHandler, notFound } from './middleware.js';
import { createTasksRouter } from './tasks.router.js';

// WHAT: Build a testable Express graph around an injected use-case service.
export function createApp(taskService: TaskService) {
  const app = express();
  // SECURITY: Avoid advertising an unnecessary implementation detail.
  app.disable('x-powered-by');
  // BOUNDARY: Parse JSON once and reject bodies larger than this learning API accepts.
  app.use(express.json({ limit: '100kb' }));

  // CHECK: Liveness proves only that the process can serve HTTP.
  app.get('/api/health/live', (_request, response) => {
    response.json({ status: 'ok' });
  });

  // BOUNDARY: Mount feature translation after process-level endpoints.
  app.use('/api/tasks', createTasksRouter(taskService));
  // WHAT: Unmatched routes become an intentional 404 representation.
  app.use(notFound);
  // BOUNDARY: Error handling is last so it can translate failures above it.
  app.use(errorHandler);
  return app;
}
```

Add the new public capabilities to `libs/backend/core/src/index.ts`:

```ts
// WHAT: Keep all Branch 01 exports, then add these HTTP and composition capabilities.
export * from './lib/http/create-app.js';
export * from './lib/http/middleware.js';
export * from './lib/http/tasks.router.js';
```

Replace `apps/api/src/main.ts`. This is the first composition root, using memory on purpose:

```ts
// WHAT: Import capabilities through the backend library's public surface.
import { createApp, InMemoryTaskRepository, TaskService } from '@nx-fullstack-learning/backend-core';

// BOUNDARY: Keep resource construction and startup in one controlled async function.
async function bootstrap() {
  try {
    // BOUNDARY: Choose the concrete repository in the outermost application layer.
    const repository = new InMemoryTaskRepository();
    // WHAT: Give domain policy only the narrow storage capability it needs.
    const taskService = new TaskService(repository);
    // WHAT: Compose HTTP translation without letting it select infrastructure.
    const app = createApp(taskService);
    // BOUNDARY: Parse process input before accepting traffic.
    const host = process.env.HOST ?? 'localhost';
    const port = Number(process.env.PORT ?? 3000);

    // WHAT: Open the socket only after every synchronous startup step succeeds.
    const server = app.listen(port, host, () => {
      console.log(`[ready] API listening on http://${host}:${port}`);
    });
    // CHECK: Convert asynchronous socket failures such as EADDRINUSE to startup failure.
    server.once('error', (error) => {
      console.error('[startup-error]', error);
      process.exitCode = 1;
    });
  } catch (error) {
    // CHECK: Produce one intentional startup diagnostic and a failing exit status.
    console.error('[startup-error]', error);
    process.exitCode = 1;
  }
}

// WHAT: Start without discarding the promise accidentally.
void bootstrap();
```

Why the `try/catch` matters: without it, a thrown synchronous error or rejected awaited startup operation escapes `bootstrap`; modern Node normally terminates on an unhandled rejection, but the log format, cleanup, and exit intent are no longer controlled by your application. A `try/catch` does **not** catch future request failures or every event-emitter error, which is why Express error middleware and the server's `error` listener are separate boundaries. When databases arrive, `await persistence.connect()` belongs inside this `try` before `listen()`, and partial resources must be closed in the failure path.

Create `libs/backend/core/src/lib/http/create-app.spec.ts`:

```ts
// WHAT: Exercise the real HTTP translation without binding a public port.
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { InMemoryTaskRepository } from '../tasks/in-memory-task.repository.js';
import { TaskService } from '../tasks/task.service.js';
import { createApp } from './create-app.js';

// WHAT: Compose the same layers as production with an isolated in-memory adapter.
function setup() {
  return createApp(new TaskService(new InMemoryTaskRepository()));
}

describe('task HTTP contract', () => {
  it('creates and lists a task through the full request boundary', async () => {
    const app = setup();
    // BOUNDARY: Send untrusted JSON exactly as a real client would.
    const created = await request(app).post('/api/tasks').send({ title: 'Trace E2E', priority: 'high' }).expect(201);
    // CHECK: The HTTP representation includes server-owned defaults.
    expect(created.body.data).toMatchObject({ title: 'Trace E2E', version: 1 });
    // CHECK: A second request observes the stored record.
    const listed = await request(app).get('/api/tasks?limit=10').expect(200);
    expect(listed.body.page.total).toBe(1);
  });

  it('returns stable validation and not-found envelopes', async () => {
    const app = setup();
    // CHECK: Runtime validation rejects a value TypeScript cannot protect at the network.
    const invalid = await request(app).post('/api/tasks').send({ title: '' }).expect(400);
    expect(invalid.body.code).toBe('VALIDATION_ERROR');
    // CHECK: A valid but absent UUID reaches domain-aware not-found policy.
    const missing = await request(app).get(`/api/tasks/${crypto.randomUUID()}`).expect(404);
    expect(missing.body.code).toBe('NOT_FOUND');
  });
});
```

Run and probe it:

```bash
# CHECK: Prove both service and HTTP boundaries in isolation.
npx nx test backend-core
# WHAT: Start the API with the in-memory composition root.
npm run dev:api
# CHECK: Prove the liveness promise and validated CRUD representation.
curl -i http://localhost:3000/api/health/live
curl -i -X POST http://localhost:3000/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"My first vertical slice","priority":"high"}'
# CHECK: Prove invalid runtime input becomes a stable 400 response.
curl -i -X POST http://localhost:3000/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"","priority":"urgent"}'
```

Break exercise: start a second API on port 3000 and observe the `EADDRINUSE` startup path. Then throw inside a route and prove Express 5 forwards the rejected async handler to the error middleware while the process remains alive.

Branch 02 exit check: save transcripts for create, list, invalid input, missing task, stale update, unmatched route, and occupied port. There is still no database and therefore no readiness route yet.

#### Branch 03 — Add shared UI and lazy route boundaries

Create `lesson/03-react-routing-ui` from Branch 02. This checkpoint proves presentation ownership and browser routing before adding remote state. Keep the UI plain; the lesson is about boundaries, not a design system.

Declare the router where it is imported:

```bash
# WHAT: Declare browser routing as a runtime dependency of the web application.
npm pkg set 'dependencies.react-router-dom=7.18.2' --workspace @nx-fullstack-learning/web
```

Replace `libs/frontend/ui/src/starter.spec.ts` by creating `libs/frontend/ui/src/lib/button.tsx`:

```tsx
// WHAT: Preserve the browser's complete native button contract.
import type { ButtonHTMLAttributes } from 'react';

// WHAT: Add only the small semantic vocabulary shared by real consumers.
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  // WHY: A finite union prevents unsupported visual meanings.
  variant?: 'primary' | 'danger' | 'secondary';
};

// WHAT: Supply safe defaults while forwarding every other native attribute.
export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    // WHY: `button` avoids accidental form submission unless a caller opts into `submit`.
    <button type={type} className={`button button--${variant} ${className}`.trim()} {...props} />
  );
}
```

Create `libs/frontend/ui/src/lib/page-state.tsx`:

```tsx
// WHAT: Accept any renderable React content without owning feature policy.
import type { ReactNode } from 'react';

// WHAT: Announce loading and empty states politely to assistive technology.
export function PageState({ children }: { children: ReactNode }) {
  return <p role="status">{children}</p>;
}

// BOUNDARY: Convert an unknown client failure into a safe user-facing message.
export function ErrorState({ error }: { error: unknown }) {
  // SECURITY: Show only the normalized Error message, never an arbitrary object dump.
  const message = error instanceof Error ? error.message : 'Unexpected error';
  // WHAT: Use an alert role because the operation has failed.
  return <p role="alert">Could not load this page: {message}</p>;
}
```

Replace `libs/frontend/ui/src/index.ts`:

```ts
// BOUNDARY: Consumers import from the library contract, not private folders.
export * from './lib/button';
export * from './lib/page-state';
```

Create `libs/frontend/ui/src/lib/button.spec.tsx`:

```tsx
// WHAT: Test behavior visible to a consumer rather than implementation details.
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('keeps native semantics and forwards interaction', () => {
    const onClick = vi.fn();
    // WHAT: Render the component through its public props.
    render(<Button onClick={onClick}>Save</Button>);
    // CHECK: A real accessible role and name locate the control.
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.getAttribute('type')).toBe('button');
    // WHAT: Exercise the browser-level interaction the caller depends on.
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

Create the first route modules. `apps/web/src/pages/tasks-page.tsx` is deliberately static at this checkpoint:

```tsx
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
```

Create `apps/web/src/pages/performance-page.tsx`:

```tsx
// WHAT: Reserve a lazy boundary for the later measurement and virtualization lab.
export default function PerformancePage() {
  return (
    <section>
      <h2>Rendering performance</h2>
      <p>Measure a large normal list here before adding virtualization.</p>
    </section>
  );
}
```

Create `apps/web/src/pages/architecture-page.tsx`:

```tsx
// WHAT: Keep decision notes on a route users need not download initially.
export default function ArchitecturePage() {
  return (
    <section>
      <h2>Architecture decisions</h2>
      <p>The task service depends on a repository port, not an ORM client.</p>
    </section>
  );
}
```

Replace `apps/web/src/app/app.tsx`:

```tsx
// WHAT: Suspense owns loading feedback for modules downloaded on navigation.
import { lazy, Suspense } from 'react';
// WHAT: Declarative routes map browser locations to elements.
import { NavLink, Route, Routes } from 'react-router-dom';
// BOUNDARY: Reuse presentation through the frontend library's public API.
import { PageState } from '@nx-fullstack-learning/frontend-ui';

// WHY: Split feature routes into separate production chunks.
const TasksPage = lazy(() => import('../pages/tasks-page'));
const PerformancePage = lazy(() => import('../pages/performance-page'));
const ArchitecturePage = lazy(() => import('../pages/architecture-page'));

export function App() {
  return (
    <div className="shell">
      <header>
        <h1>Full-stack learning lab</h1>
        {/* WHAT: Give assistive technology a name for the primary navigation landmark. */}
        <nav aria-label="Primary navigation">
          <NavLink to="/">Tasks</NavLink>
          <NavLink to="/performance">Virtualization</NavLink>
          <NavLink to="/architecture">Architecture</NavLink>
        </nav>
      </header>

      <main>
        {/* WHAT: Render useful feedback while the selected route chunk loads. */}
        <Suspense fallback={<PageState>Loading route…</PageState>}>
          <Routes>
            <Route path="/" element={<TasksPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            {/* CHECK: Unknown browser locations have an intentional UI outcome. */}
            <Route path="*" element={<p>Page not found.</p>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
```

Replace `apps/web/src/main.tsx`:

```tsx
// WHAT: StrictMode exposes unsafe render-side behavior during development.
import { StrictMode } from 'react';
// BOUNDARY: One router owns browser history for the entire application.
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import './styles.css';

// CHECK: Fail visibly during development if the HTML shell loses its root node.
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

Replace `apps/web/src/app/app.spec.tsx` so the router has a test owner:

```tsx
// WHAT: Test the public route result with an in-memory history owner.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './app';

describe('App routing', () => {
  it('loads the task route at the root location', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    // CHECK: `findByRole` waits for the lazy route chunk to resolve.
    expect(await screen.findByRole('heading', { name: 'Tasks' })).toBeTruthy();
  });
});
```

Run `npx nx test frontend-ui`, `npx nx test @nx-fullstack-learning/web`, and `npx nx build @nx-fullstack-learning/web`. Inspect the production output and prove that the three pages are separate chunks. Break exercise: introduce a named-only export on one page, observe the lazy import failure, then restore its default export and explain the module contract.

Branch 03 exit check: direct navigation and refresh work for all three host-served routes, the fallback is intentional, the shared button interaction test passes, and no server-state library is used yet.

#### Branch 04 — Connect React with TanStack Query and Zustand

Create `lesson/04-query-and-state` from Branch 03. The division is deliberate: component-local form text stays in `useState`; remote task data belongs to TanStack Query; persistent cross-component display preferences belong to Zustand. Do not copy the API response into the Zustand store.

```bash
# WHAT: Declare remote-state and small client-state owners at the web project boundary.
npm pkg set 'dependencies.@tanstack/react-query=^5.101.4' --workspace @nx-fullstack-learning/web
npm pkg set 'dependencies.zustand=^5.0.15' --workspace @nx-fullstack-learning/web
```

Create `apps/web/src/app/task.types.ts`:

```ts
// BOUNDARY: Describe the public HTTP representation, not a Prisma or Mongoose record.
export type Task = {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  version: number;
  createdAt: string;
  updatedAt: string;
};

// WHAT: Preserve data and pagination metadata from the list endpoint.
export type TaskListResponse = {
  data: Task[];
  page: { limit: number; offset: number; total: number };
};

// WHAT: A create command contains caller-owned fields only.
export type CreateTask = Pick<Task, 'title' | 'priority'> & {
  description?: string;
};

// WHAT: Reuse one finite filter vocabulary in URL construction and UI state.
export type TaskFilter = 'all' | 'open' | 'done';
```

Create `apps/web/src/app/api.ts`:

```ts
// BOUNDARY: This module owns translation between fetch and typed application calls.
import type { CreateTask, Task, TaskFilter, TaskListResponse } from './task.types';

// WHAT: Normalize status checking, safe error messages, and JSON decoding once.
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  // BOUNDARY: The browser sends a real HTTP request to the same-origin Vite proxy.
  const response = await fetch(url, {
    ...init,
    headers: {
      // WHAT: Every current mutation sends JSON.
      'content-type': 'application/json',
      // WHY: Callers may still supply future authorization or request identifiers.
      ...init?.headers,
    },
  });

  if (!response.ok) {
    // SECURITY: Treat an error body as optional untrusted data.
    const problem = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    // WHAT: Reject so TanStack Query owns the operation's error state.
    throw new Error(problem?.message ?? `Request failed (${response.status})`);
  }

  // WHY: HTTP 204 intentionally has no JSON body to parse.
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

// BOUNDARY: Components call use-case-shaped functions, never assemble URLs themselves.
export const taskApi = {
  list: (filter: TaskFilter) => {
    // WHAT: Omit the filter for all tasks; serialize a real boolean otherwise.
    const done = filter === 'all' ? '' : `&done=${filter === 'done'}`;
    return request<TaskListResponse>(`/api/tasks?limit=200${done}`);
  },
  create: (input: CreateTask) =>
    request<{ data: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (task: Task, patch: Partial<Pick<Task, 'title' | 'done'>>) =>
    request<{ data: Task }>(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      // WHY: Carry the version observed by this client to reject stale writes.
      body: JSON.stringify({ ...patch, version: task.version }),
    }),
  remove: (id: string) => request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
};
```

Create `apps/web/src/app/task.queries.ts`. You are typing the baseline hooks so you can inspect them, then the lesson requires you to change their behavior; these hooks are not present in the starter.

```ts
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
    // WHAT: Keep the mutation command type visible at the hook boundary.
    mutationFn: (input: CreateTask) => taskApi.create(input),
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
```

Create `apps/web/src/app/task.store.ts`:

```ts
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
  persist(
    (set) => ({
      // WHAT: Define deterministic first-visit preferences.
      filter: 'all',
      compact: false,
      // WHAT: Replace one scalar preference without touching remote data.
      setFilter: (filter) => set({ filter }),
      // WHY: Functional updates are correct even when events are batched.
      toggleCompact: () => set((state) => ({ compact: !state.compact })),
    }),
    // BOUNDARY: Namespace this client-owned value in localStorage.
    { name: 'task-ui-preferences' },
  ),
);
```

Replace `apps/web/src/pages/tasks-page.tsx`. Start with a normal list; virtualization comes only after you measure a rendering bottleneck:

```tsx
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
```

Replace `apps/web/src/main.tsx` to add one remote-cache owner outside the router:

```tsx
// WHAT: Create one Query client for the lifetime of this browser application.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // WHY: Reuse recent task data briefly instead of refetching on every mount.
      staleTime: 15_000,
      // WHY: Retry one transient read failure without hiding a persistent outage.
      retry: 1,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    {/* BOUNDARY: Every query hook below this point shares one cache. */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
```

In `apps/web/vite.config.mts`, replace the existing lesson TODO inside `server` with this proxy property:

```ts
// BOUNDARY: Keep browser requests same-origin during host development.
proxy: {
  // WHAT: Forward only API paths to the separately running Node process.
  '/api': {
    target: 'http://localhost:3000',
    // WHY: Present the target host to the API instead of the Vite origin.
    changeOrigin: true,
  },
},
```

Append only enough layout CSS to `apps/web/src/styles.css`; do not turn this into a styling exercise:

```css
/* WHAT: Keep feature content readable without introducing a UI framework. */
.shell {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1rem;
}

/* WHAT: Make navigation and controls scannable with a small consistent gap. */
nav,
.toolbar,
.task-form,
.task-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* WHAT: Separate repeated rows while keeping the visual treatment minimal. */
.task-row {
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #d0d7de;
}

/* WHAT: Density is a client preference, not a different server query. */
.task-list--compact .task-row {
  padding: 0.25rem 0;
}

/* WHAT: Preserve the label while communicating completion visually. */
.task-row__done {
  text-decoration: line-through;
}
```

Replace the Branch 03 app test with this route-only proof so it does not mount a Query hook without a provider:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './app';

describe('App routing', () => {
  it('lazy-loads the architecture route', async () => {
    // WHAT: Begin at a non-default location without owning browser history.
    render(
      <MemoryRouter initialEntries={['/architecture']}>
        <App />
      </MemoryRouter>,
    );
    // CHECK: Wait for the dynamic route module to resolve.
    expect(await screen.findByRole('heading', { name: 'Architecture decisions' })).toBeTruthy();
  });
});
```

A later task-feature test should construct a fresh `QueryClient` with `retry: false` and mock the HTTP boundary deliberately.

Run both processes, keep the browser network panel open, and create/filter/update/delete tasks. Because the current repository is in memory, restarting the API must erase them; record that behavior rather than mistaking it for a bug.

Then perform the actual learning changes:

1. Add `refetchInterval: 30_000` to `useTasks`, calculate the request rate for 10,000 active users, and remove or keep it based on a written consistency budget.
2. Deliberately remove `filter` from the query key, switch filters, observe the cache bug, then restore it.
3. Add optimistic update for completion with a per-query-key snapshot and rollback; force an HTTP 409 and prove rollback plus invalidation.
4. Reload the browser and prove only filter/density persist. If tasks survive solely because of Zustand, you duplicated server state incorrectly.

Branch 04 exit check: a browser action crosses Vite → Express → Zod → service → in-memory repository and back; the network trace shows invalidation after mutations; the cache key includes the filter; no ORM exists yet.

#### Branch 05 — Replace memory with Prisma/PostgreSQL behind the same port

Create `lesson/05-postgres-prisma` from Branch 04. Complete Lesson 0.3A–0.3C first so your own `database` Compose service is healthy and persistent. The public routes, service, and React code do not change in this branch; only process composition and persistence do.

Declare the runtime packages imported by the backend library:

```bash
# WHAT: Declare the generated client, PostgreSQL driver adapter, and driver.
npm pkg set 'dependencies.@prisma/client=^7.9.1' --workspace @nx-fullstack-learning/backend-core
npm pkg set 'dependencies.@prisma/adapter-pg=^7.9.1' --workspace @nx-fullstack-learning/backend-core
npm pkg set 'dependencies.pg=^8.23.0' --workspace @nx-fullstack-learning/backend-core
# WHAT: Declare the environment loader imported by the API composition root.
npm pkg set 'dependencies.dotenv=^17.4.2' --workspace @nx-fullstack-learning/api
```

Expand `.env.example`, then copy it to the ignored `.env`:

```dotenv
# WHAT: Select normal local process behavior.
NODE_ENV=development
# BOUNDARY: Bind host processes locally; use 0.0.0.0 later inside a container.
HOST=localhost
# WHAT: Keep the documented host API port.
PORT=3000
# BOUNDARY: This switch is consumed only by the composition factory.
DATABASE_CLIENT=prisma
# SECRET: This is a disposable local credential, never a production value.
DATABASE_URL=postgresql://app:app@127.0.0.1:5432/learning
# WHY: Bound connections per process so horizontal scaling cannot exhaust PostgreSQL.
DATABASE_POOL_MAX=10
```

Create `prisma.config.ts`:

```ts
// WHAT: Load the ignored local environment for Prisma CLI commands.
import 'dotenv/config';
// BOUNDARY: Prisma's CLI owns schema, migration, and credential configuration here.
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // WHAT: Point every CLI operation at the learner-authored schema.
  schema: 'prisma/schema.prisma',
  // WHAT: Keep ordered, reviewable database history in source control.
  migrations: { path: 'prisma/migrations' },
  // SECRET: Read the URL from process configuration, never the Prisma schema.
  datasource: { url: env('DATABASE_URL') },
});
```

Create `prisma/schema.prisma` with only the capability this checkpoint needs:

```prisma
// WHAT: Generate visible ESM TypeScript inside the library that owns persistence.
generator client {
  provider            = "prisma-client"
  output              = "../libs/backend/core/src/generated/prisma"
  moduleFormat        = "esm"
  // WHY: Keep compiled Node ESM imports resolvable outside a bundler.
  importFileExtension = "js"
}

// BOUNDARY: Select PostgreSQL semantics while prisma.config.ts supplies credentials.
datasource db {
  provider = "postgresql"
}

// WHAT: Map a domain-friendly model to an explicit SQL table contract.
model Task {
  // WHY: Database-generated UUIDs give every writer the same identity policy.
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title       String   @db.VarChar(200)
  description String?
  done        Boolean  @default(false)
  priority    String   @default("medium") @db.VarChar(10)
  // WHY: Increment this token to reject a write based on a stale read.
  version     Int      @default(1)
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime @default(now()) @map("updated_at") @db.Timestamptz(6)

  // WHY: Match the deterministic newest-first API access path.
  @@index([createdAt(sort: Desc), id], map: "idx_tasks_created_at")
  @@map("tasks")
}
```

Generate a migration without applying it, inspect the SQL, and then add database-owned constraints before applying it:

```bash
# CHECK: Reject schema mistakes before generating either SQL or TypeScript.
npm run prisma:validate
# WHAT: Create a reviewable migration directory but do not apply it yet.
npx prisma migrate dev --name init --create-only
# CHECK: Open the new `prisma/migrations/*_init/migration.sql` and explain every statement.
```

Append these constraints to the generated `CREATE TABLE "tasks"` statement before its closing `);`—include the required preceding comma after the primary key constraint:

```sql
-- INVARIANT: Storage still rejects whitespace-only titles if another writer bypasses Zod.
CONSTRAINT "tasks_title_nonblank" CHECK (length(trim("title")) > 0),
-- INVARIANT: Storage and the API share the supported priority vocabulary.
CONSTRAINT "tasks_priority_supported" CHECK ("priority" IN ('low', 'medium', 'high')),
-- INVARIANT: Optimistic-concurrency tokens remain positive.
CONSTRAINT "tasks_version_positive" CHECK ("version" > 0)
```

Then add the partial index after the generated general index:

```sql
-- WHY: Keep the hot incomplete-task path small as completed history grows.
CREATE INDEX "idx_tasks_open_created_at"
  ON "tasks"("created_at" DESC, "id") WHERE "done" = false;
```

Apply and generate:

```bash
# BOUNDARY: Apply the reviewed history to your disposable local database.
npx prisma migrate dev
# WHAT: Generate the typed client imported by the backend adapter.
npm run prisma:generate
# CHECK: Prove Prisma and PostgreSQL agree about applied history.
npx prisma migrate status
```

Create `prisma/seed.sql` yourself; this is intentionally plain SQL so you also practise a database-native bulk operation:

```sql
-- WHAT: Add enough deterministic rows to make pagination and rendering measurable.
INSERT INTO tasks (title, description, priority, done)
SELECT
  'Learning task ' || number,
  'Generated seed row for pagination and virtualization practice.',
  (ARRAY['low', 'medium', 'high'])[1 + (number % 3)],
  number % 5 = 0
FROM generate_series(1, 1000) AS number
-- WHY: Repeated local setup must not duplicate the entire learning dataset.
WHERE NOT EXISTS (SELECT 1 FROM tasks);
```

```bash
# BOUNDARY: Execute the reviewed native seed against the configured local database.
npm run db:seed
# CHECK: Prove repeat execution leaves the task count unchanged.
npm run db:seed
docker compose exec database psql -U app -d learning -c 'select count(*) from tasks;'
```

Create `libs/backend/core/src/lib/config.ts`:

```ts
// BOUNDARY: Process environment is untrusted string input.
import { z } from 'zod';

const EnvironmentSchema = z.object({
  // WHAT: Make operational mode explicit and bounded.
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // WHAT: Supply safe host-process defaults while allowing container overrides.
  HOST: z.string().default('localhost'),
  // BOUNDARY: Coerce and bound the string port before socket construction.
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  // BOUNDARY: Start with the one implemented client; MongoDB extends this enum later.
  DATABASE_CLIENT: z.literal('prisma').default('prisma'),
  // SECRET: Require a real URL instead of hiding a production fallback.
  DATABASE_URL: z.string().url(),
  // WHY: Prevent one process from creating an unbounded database load.
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
});

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  host: string;
  port: number;
  databaseClient: 'prisma';
  databaseUrl: string;
  databasePoolMax: number;
};

// BOUNDARY: Parse once; pass typed configuration instead of reading process.env everywhere.
export function loadConfig(environment = process.env): AppConfig {
  const parsed = EnvironmentSchema.parse(environment);
  return {
    nodeEnv: parsed.NODE_ENV,
    host: parsed.HOST,
    port: parsed.PORT,
    databaseClient: parsed.DATABASE_CLIENT,
    databaseUrl: parsed.DATABASE_URL,
    databasePoolMax: parsed.DATABASE_POOL_MAX,
  };
}
```

Create `libs/backend/core/src/lib/db.ts`:

```ts
// WHAT: Prisma 7 uses an explicit PostgreSQL driver adapter.
import { PrismaPg } from '@prisma/adapter-pg';
// WHAT: Import the client generated from your schema, never hand-write it.
import { PrismaClient } from '../generated/prisma/client.js';
import type { AppConfig } from './config.js';

// WHAT: Construct one client and one bounded pool per API process.
export function createPrismaClient(config: AppConfig) {
  const adapter = new PrismaPg({
    // SECRET: Supply validated runtime credentials rather than embedding them in code.
    connectionString: config.databaseUrl,
    // WHY: Bound total connections as API instance count grows.
    max: config.databasePoolMax,
    // WHY: Fail instead of waiting forever when the pool cannot acquire a connection.
    connectionTimeoutMillis: 5_000,
    // WHY: Release long-idle connections while retaining a useful warm pool.
    idleTimeoutMillis: 30_000,
    // CHECK: Make this workload recognizable in `pg_stat_activity`.
    application_name: 'nx-learning-api',
  });

  // BOUNDARY: The generated query API runs over the configured driver adapter.
  return new PrismaClient({ adapter });
}
```

Create `libs/backend/core/src/lib/tasks/prisma-task.repository.ts`:

```ts
// WHAT: Import generated storage types from the persistence-owning library.
import type { Prisma, PrismaClient, Task as PrismaTask } from '../../generated/prisma/client.js';
import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from './task.schema.js';
import { PrioritySchema } from './task.schema.js';
import type { Task, TaskRepository, UpdateResult } from './task.repository.js';

// BOUNDARY: Map storage values into the stable domain/API representation.
function mapTask(row: PrismaTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    done: row.done,
    // CHECK: A failure here exposes drift between database constraints and domain policy.
    priority: PrioritySchema.parse(row.priority),
    version: row.version,
    // BOUNDARY: Public HTTP dates are ISO strings, not JavaScript Date instances.
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// WHAT: Implement the same port previously satisfied by the in-memory adapter.
export class PrismaTaskRepository implements TaskRepository {
  // BOUNDARY: Keep Prisma private to this infrastructure adapter.
  constructor(private readonly prisma: PrismaClient) {}

  async list(input: ListTasksInput) {
    // WHAT: Build a typed predicate; undefined fields are deliberately omitted.
    const where: Prisma.TaskWhereInput = {
      done: input.done,
      // WHY: Match the shared case-insensitive substring behavior.
      title: input.q ? { contains: input.q, mode: 'insensitive' } : undefined,
    };
    // WHY: Return page and count from one consistent database transaction.
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        // WHY: Identity breaks ties when timestamps are equal.
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        take: input.limit,
        skip: input.offset,
      }),
      this.prisma.task.count({ where }),
    ]);
    return { data: rows.map(mapTask), total };
  }

  async findById(id: string) {
    // WHAT: A unique lookup returns null as an ordinary absence outcome.
    const row = await this.prisma.task.findUnique({ where: { id } });
    return row ? mapTask(row) : null;
  }

  async create(input: CreateTaskInput) {
    // WHAT: Use generated query types for ordinary CRUD.
    const row = await this.prisma.task.create({
      data: {
        title: input.title,
        // WHY: Translate an omitted optional command to explicit SQL null.
        description: input.description ?? null,
        priority: input.priority,
      },
    });
    return mapTask(row);
  }

  async update(id: string, input: UpdateTaskInput): Promise<UpdateResult> {
    // WHAT: Separate the condition token from mutable fields.
    const { version, ...patch } = input;
    return this.prisma.$transaction(async (transaction) => {
      // WHY: `updateMany` reports zero instead of throwing when id/version misses.
      const updated = await transaction.task.updateMany({
        where: { id, version },
        data: {
          ...patch,
          // WHY: Advance the version in the same statement as the requested change.
          version: { increment: 1 },
          updatedAt: new Date(),
        },
      });
      if (updated.count === 0) return this.classifyMiss(transaction, id);
      // CHECK: The row must exist in this transaction after a successful update.
      const row = await transaction.task.findUniqueOrThrow({ where: { id } });
      return { kind: 'updated' as const, task: mapTask(row) };
    });
  }

  async complete(id: string, version: number) {
    // WHAT: Reuse version-aware update until Branch 06 adds an atomic event record.
    return this.update(id, { done: true, version });
  }

  async delete(id: string) {
    // WHY: `deleteMany` converts not-found to a useful count rather than an exception.
    const deleted = await this.prisma.task.deleteMany({ where: { id } });
    return deleted.count === 1;
  }

  private async classifyMiss(transaction: Prisma.TransactionClient, id: string): Promise<UpdateResult> {
    // WHAT: Distinguish a missing id from a real version conflict.
    const existing = await transaction.task.findUnique({
      where: { id },
      select: { id: true },
    });
    return existing ? { kind: 'conflict' } : { kind: 'missing' };
  }
}
```

Create the plain-SQL exception `libs/backend/core/src/lib/tasks/plain-sql.selectors.ts`:

```ts
// WHAT: Accept the same long-lived client owned by the persistence adapter.
import type { PrismaClient } from '../../generated/prisma/client.js';

// WHAT: Describe only columns selected by this engine-specific query.
export type OpenTaskRow = { id: string; title: string; created_at: Date };

// WHY: Keep a deliberate SQL escape hatch for plans and database-native syntax.
export function selectRecentOpenTasks(prisma: PrismaClient, limit: number) {
  // SECURITY: The tagged template sends `limit` as a parameter, not executable text.
  return prisma.$queryRaw<OpenTaskRow[]>`
    SELECT id, title, created_at
    FROM tasks
    WHERE done = false
    ORDER BY created_at DESC, id
    LIMIT ${limit}::int
  `;
}
```

Create `libs/backend/core/src/lib/persistence/persistence.ts`:

```ts
import type { TaskRepository } from '../tasks/task.repository.js';

// WHAT: Keep process diagnostics stable without exposing a client API.
export type PersistenceKind = 'postgresql-prisma' | 'mongodb-mongoose';

// BOUNDARY: Startup and health depend on lifecycle capabilities, not PrismaClient.
export interface PersistenceAdapter {
  readonly kind: PersistenceKind;
  // BOUNDARY: Business policy receives only the domain repository port.
  readonly tasks: TaskRepository;
  // CHECK: Establish connectivity before accepting traffic.
  connect(): Promise<void>;
  // WHAT: Release the selected driver's pool during shutdown.
  disconnect(): Promise<void>;
  // CHECK: Throw when the dependency cannot currently serve requests.
  checkReadiness(): Promise<void>;
}
```

Create `libs/backend/core/src/lib/persistence/prisma-persistence.adapter.ts`:

```ts
import type { AppConfig } from '../config.js';
import { createPrismaClient } from '../db.js';
import { PrismaTaskRepository } from '../tasks/prisma-task.repository.js';
import type { PersistenceAdapter } from './persistence.js';

// WHAT: Own the Prisma client, pool lifecycle, and repositories as one resource boundary.
export class PrismaPersistenceAdapter implements PersistenceAdapter {
  readonly kind = 'postgresql-prisma' as const;
  private readonly prisma;
  readonly tasks;

  constructor(config: AppConfig) {
    // WHY: Construct exactly one client/pool for this process.
    this.prisma = createPrismaClient(config);
    // BOUNDARY: Expose the domain port rather than the generated client.
    this.tasks = new PrismaTaskRepository(this.prisma);
  }

  async connect() {
    // CHECK: Invalid credentials or unavailable PostgreSQL fail startup.
    await this.prisma.$connect();
  }

  async disconnect() {
    // WHAT: Drain Prisma and its underlying PostgreSQL pool.
    await this.prisma.$disconnect();
  }

  async checkReadiness() {
    // CHECK: A tiny database-native query proves current connectivity.
    await this.prisma.$queryRaw`SELECT 1`;
  }
}
```

Create `libs/backend/core/src/lib/persistence/create-persistence.ts`:

```ts
import type { AppConfig } from '../config.js';
import type { PersistenceAdapter } from './persistence.js';
import { PrismaPersistenceAdapter } from './prisma-persistence.adapter.js';

// BOUNDARY: Keep infrastructure selection in one outer factory from the beginning.
export function createPersistence(config: AppConfig): PersistenceAdapter {
  // WHY: Branch 05 has one honest implementation; Branch 07 adds the second case here.
  return new PrismaPersistenceAdapter(config);
}
```

Replace `libs/backend/core/src/lib/http/create-app.ts` completely; do not guess which Branch 02 lines remain:

```ts
// WHAT: Keep application construction separate from opening a socket.
import express from 'express';
import type { PersistenceAdapter } from '../persistence/persistence.js';
import type { TaskService } from '../tasks/task.service.js';
import { errorHandler, notFound } from './middleware.js';
import { createTasksRouter } from './tasks.router.js';

// WHAT: Name every capability HTTP composition needs.
export type ApplicationDependencies = {
  taskService: TaskService;
  // BOUNDARY: Health sees only diagnostics, never ORM methods.
  persistence: Pick<PersistenceAdapter, 'kind' | 'checkReadiness'>;
};

export function createApp({ taskService, persistence }: ApplicationDependencies) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  // CHECK: Liveness never calls a dependency.
  app.get('/api/health/live', (_request, response) => {
    response.json({ status: 'ok' });
  });
  // CHECK: Readiness crosses the selected adapter's real connection.
  app.get('/api/health/ready', async (_request, response) => {
    await persistence.checkReadiness();
    response.json({ status: 'ready', persistence: persistence.kind });
  });

  app.use('/api/tasks', createTasksRouter(taskService));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
```

Update the `setup()` function in `create-app.spec.ts`; tests should inject a deterministic readiness capability rather than opening PostgreSQL:

```ts
function setup() {
  // WHAT: Use real domain/in-memory behavior for HTTP contract tests.
  const taskService = new TaskService(new InMemoryTaskRepository());
  // BOUNDARY: Stub only the external lifecycle capability this test does not own.
  const persistence = {
    kind: 'postgresql-prisma' as const,
    checkReadiness: async () => undefined,
  };
  return createApp({ taskService, persistence });
}
```

Update `libs/backend/core/src/index.ts` by keeping prior exports and adding:

```ts
export * from './lib/config.js';
export * from './lib/db.js';
export * from './lib/persistence/create-persistence.js';
export * from './lib/persistence/persistence.js';
export * from './lib/persistence/prisma-persistence.adapter.js';
export * from './lib/tasks/plain-sql.selectors.js';
export * from './lib/tasks/prisma-task.repository.js';
```

Replace `apps/api/src/main.ts` with controlled database startup and shutdown:

```ts
// WHAT: Load ignored local values before configuration is parsed.
import 'dotenv/config';
// WHAT: `once` converts server events into an awaitable startup boundary.
import { once } from 'node:events';
import { createApp, createPersistence, loadConfig, TaskService, type PersistenceAdapter } from '@nx-fullstack-learning/backend-core';

async function bootstrap() {
  // WHAT: Retain a reference so a partial startup can release its pool.
  let persistence: PersistenceAdapter | undefined;
  try {
    // BOUNDARY: Parse configuration before constructing any resource or accepting traffic.
    const config = loadConfig();
    // BOUNDARY: Select the concrete database implementation in exactly one place.
    persistence = createPersistence(config);
    // CHECK: Fail startup if the selected database cannot be reached.
    await persistence.connect();
    // BOUNDARY: Domain policy sees the repository port, never PrismaClient.
    const taskService = new TaskService(persistence.tasks);
    // WHAT: Compose the HTTP graph after its dependencies are ready.
    const app = createApp({ taskService, persistence });
    // WHAT: Begin opening the socket only after configuration and connectivity pass.
    const server = app.listen(config.port, config.host);
    // CHECK: Reject this await on asynchronous socket errors such as EADDRINUSE.
    await once(server, 'listening');
    console.log(`[ready] API listening on http://${config.host}:${config.port}`);

    // WHAT: Ensure only the first termination signal begins shutdown.
    let shuttingDown = false;
    const shutdown = async (signal: string) => {
      if (shuttingDown) return;
      shuttingDown = true;
      console.log(`[shutdown] ${signal}`);
      // WHY: Bound draining so an orchestrator is not left waiting forever.
      const forcedExit = setTimeout(() => {
        console.error('[shutdown-timeout] forcing exit');
        // CHECK: Exit only after the explicit graceful deadline is exhausted.
        process.exit(1);
      }, 10_000).unref();
      try {
        // BOUNDARY: Stop accepting traffic and await in-flight connection closure.
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
        // WHAT: Close the selected database pool after HTTP draining.
        await persistence?.disconnect();
      } catch (error) {
        console.error('[shutdown-error]', error);
        process.exitCode = 1;
      } finally {
        clearTimeout(forcedExit);
      }
    };
    // WHAT: Register lifecycle behavior once for orchestrator and terminal signals.
    process.once('SIGTERM', () => void shutdown('SIGTERM'));
    process.once('SIGINT', () => void shutdown('SIGINT'));
  } catch (error) {
    // CHECK: A failed config parse, connection, or socket produces a non-zero outcome.
    console.error('[startup-error]', error);
    // WHAT: Release a pool that may have been constructed or partially connected.
    await persistence?.disconnect().catch((disconnectError) => {
      console.error('[startup-cleanup-error]', disconnectError);
    });
    process.exitCode = 1;
  }
}

void bootstrap();
```

This is the full answer to “what happens without `try/catch` here?” The process probably still dies on an unhandled rejected startup promise, but it no longer owns the diagnostic, cleanup, and exit policy. The `catch` controls startup failures; Express middleware controls request failures; signal handlers control normal shutdown. They are three different lifecycles.

Prove the substitution:

```bash
# WHAT: Start only the learner-authored PostgreSQL service and wait for health.
docker compose up database -d --wait
# CHECK: Generate, type-check, test, and build the cumulative application.
npm run prisma:generate && npm run check
# WHAT: Start both host processes using the PostgreSQL adapter.
npm run dev
# CHECK: Readiness now crosses the real pool; liveness remains process-only.
curl -i http://localhost:3000/api/health/live
curl -i http://localhost:3000/api/health/ready
# WHAT: Stop only PostgreSQL to create a dependency failure.
docker compose stop database
# CHECK: Liveness stays 200 while readiness fails with the stable 500 envelope.
curl -i http://localhost:3000/api/health/live
curl -i http://localhost:3000/api/health/ready
```

Core exercise: create the same task before and after an API restart and prove PostgreSQL preserves it. Then execute the parameterized `selectRecentOpenTasks` selector, capture `EXPLAIN (ANALYZE, BUFFERS)`, and explain why ordinary CRUD stays in Prisma while measured PostgreSQL-specific work may use SQL.

Branch 05 exit check: browser and HTTP contracts are unchanged, Prisma CRUD passes the repository contract suite, generated types never cross the repository, data survives API replacement, invalid `DATABASE_URL` fails before `listen`, and shutdown releases the pool.

Mixed frontend continuation — finish the virtualization requirement before Branch 06. First render 10,000 ordinary rows in `performance-page.tsx`, record DOM node count and React Profiler commit time, and only then declare the virtualization package:

```bash
# WHAT: Add windowed rendering only after the unvirtualized evidence exists.
npm pkg set 'dependencies.@tanstack/react-virtual=^3.14.10' --workspace @nx-fullstack-learning/web
```

Replace `apps/web/src/pages/performance-page.tsx`:

```tsx
// WHAT: Memoize the demonstration dataset and keep a ref to the scroll owner.
import { useMemo, useRef } from 'react';
// WHAT: Calculate the small visible window from the large logical collection.
import { useVirtualizer } from '@tanstack/react-virtual';

export default function PerformancePage() {
  // WHY: Keep data construction out of unrelated rerenders in this measurement lab.
  const rows = useMemo(() => Array.from({ length: 10_000 }, (_, index) => `Measured row ${index + 1}`), []);
  // BOUNDARY: This element, not the browser window, owns scroll position.
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    // WHAT: Keep all logical rows reachable by scrolling.
    count: rows.length,
    // BOUNDARY: Attach calculations to the actual scroll owner.
    getScrollElement: () => parentRef.current,
    // WHY: Initial geometry exists before any row is measured.
    estimateSize: () => 36,
    // WHY: A small off-screen buffer hides work during quick scrolling.
    overscan: 8,
  });

  return (
    <section>
      <h2>Rendering performance</h2>
      <p>10,000 logical rows; inspect how few row elements exist in the DOM.</p>
      <div
        ref={parentRef}
        // WHAT: Establish the bounded scroll viewport required by the virtualizer.
        style={{ height: 400, overflow: 'auto', border: '1px solid #d0d7de' }}
      >
        <div
          // WHY: Preserve full scrollbar geometry without rendering every row.
          style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              // WHY: Logical index is stable because this fixed dataset never reorders.
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: virtualRow.size,
                // WHAT: Move this small physical row to its logical scroll position.
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rows[virtualRow.index]}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

This optimizes DOM/rendering work, not network transfer. Repeat the exercise with server pagination: downloading one million rows and rendering twenty is still a broken data boundary. For a mutable task list, use stable task IDs via `getItemKey`, and for variable-height rows attach `measureElement` rather than trusting a fixed estimate.

Virtualization exit check: preserve before/after DOM counts and Profiler timing, test keyboard/assistive behavior, and state the measured threshold at which the extra complexity earns its place.

#### Branch 06 — Make completion correct under concurrency

Create `lesson/06-concurrency-transactions` from Branch 05. This branch does not add another endpoint. It strengthens one existing use case so a task transition and its event either both commit or both roll back, and so two callers using the same observed version cannot both win.

Extend the `Task` model in `prisma/schema.prisma` with the relationship:

```prisma
// WHAT: Express ownership so Prisma can navigate the task's transition records.
events TaskEvent[]
```

Then add this model after `Task`:

```prisma
// WHAT: Preserve transition evidence separately from the current task projection.
model TaskEvent {
  // WHAT: Use an efficient database-native sequence for internal event identity.
  id        BigInt   @id @default(autoincrement())
  taskId    String   @map("task_id") @db.Uuid
  eventType String   @map("event_type") @db.VarChar(50)
  payload   Json     @default("{}")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  // INVARIANT: An event cannot outlive the task whose history it describes.
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)

  // WHY: Match newest-first event-history reads for one task.
  @@index([taskId, createdAt(sort: Desc)], map: "idx_task_events_task_created")
  @@map("task_events")
}
```

Create and review the new migration rather than editing the applied initial migration:

```bash
# WHAT: Generate the next reviewable change from the schema difference.
npx prisma migrate dev --name add-task-events --create-only
# CHECK: Verify the SQL creates one table, one foreign key, and one matching index.
# BOUNDARY: Apply only after reviewing destructive and locking implications.
npx prisma migrate dev
# WHAT: Regenerate types so the new relation and model become available.
npm run prisma:generate
```

Replace only `complete` in `PrismaTaskRepository`:

```ts
async complete(id: string, version: number): Promise<UpdateResult> {
  // BOUNDARY: Prisma keeps every callback operation on one transaction connection.
  return this.prisma.$transaction(async (transaction) => {
    // WHAT: Match identity and the exact version observed by the caller.
    const updated = await transaction.task.updateMany({
      where: { id, version },
      data: {
        done: true,
        // WHY: Advance the compare-and-swap token with the state transition.
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    // CHECK: Classify missing versus stale without inserting an event.
    if (updated.count === 0) return this.classifyMiss(transaction, id);

    // WHAT: Record the event only after this transaction owns the transition.
    await transaction.taskEvent.create({
      data: {
        taskId: id,
        eventType: 'completed',
        // WHY: Preserve the token that authorized this transition for later diagnosis.
        payload: { previousVersion: version },
      },
    });

    // CHECK: Read the representation that will be returned before committing.
    const row = await transaction.task.findUniqueOrThrow({ where: { id } });
    return { kind: 'updated' as const, task: mapTask(row) };
  });
}
```

Run the race through the public API. Create one task, copy its `id` and `version`, then send the same completion command twice in parallel:

```bash
# WHAT: Both clients claim to have observed version 1.
curl -sS -X POST "http://localhost:3000/api/tasks/$TASK_ID/complete" \
  -H 'content-type: application/json' -d '{"version":1}' &
curl -sS -X POST "http://localhost:3000/api/tasks/$TASK_ID/complete" \
  -H 'content-type: application/json' -d '{"version":1}' &
# CHECK: Wait for both clients; one must succeed and one must receive conflict policy.
wait
# CHECK: Exactly one durable event proves the transaction invariant.
docker compose exec database psql -U app -d learning -c \
  "select task_id, event_type, payload from task_events where task_id = '$TASK_ID';"
```

Do not confuse JavaScript concurrency with CPU parallelism. These two HTTP operations overlap because Node can wait on I/O without blocking the event loop; PostgreSQL serializes the competing conditional writes. CPU-heavy JavaScript still blocks the main thread until you move it to a worker thread in Lesson 2.7.

Add a failure experiment before calling the transaction complete: temporarily throw after `task.updateMany` but before `taskEvent.create`. The request must fail, the task version must remain unchanged, and no event may exist. Restore the code and prove the happy path again.

Senior exercise — idempotent create: add an `idempotency_records` table with a unique `(scope, key)`, request hash, status, and stored response. In one transaction, insert the key before the task; on a uniqueness conflict, return the stored response only when the request hash matches, otherwise return 409. A version token protects updates based on prior reads; an idempotency key deduplicates retried commands after an unknown outcome. They solve different problems and both branches are cumulative.

If this becomes its own summit checkpoint, create `lesson/06a-node-idempotency` **from the completed `lesson/06-concurrency-transactions` branch**. It must contain Branches 01–06 by ancestry; creating it from `workshop/start` would remove the HTTP command, transaction boundary, database constraint, and conflict behavior that the exercise depends on.

Expert exercise — isolation and retry: run the completion transaction at `Serializable`, deliberately create a serialization failure, and implement a bounded retry with jitter only for the driver's retryable transaction code. Never retry validation, authorization, uniqueness, or arbitrary unknown errors.

Branch 06 exit check: ten repeated two-client races always produce one success, one 409, one version increment, and one event; the injected failure rolls back both writes; you can explain event-loop concurrency, database atomicity, and worker-thread parallelism separately.

#### Branch 07 — Add Mongoose/MongoDB without changing the use case

Create `lesson/07-mongodb-mongoose` from Branch 06. Complete Lesson 3B.0 first, including the learner-authored MongoDB service and replica-set setup. Transactions require a replica set even when the lab has only one member.

Declare Mongoose at the backend project boundary and extend `.env.example`:

```bash
# WHAT: Declare the alternative document-database runtime adapter.
npm pkg set 'dependencies.mongoose=^9.9.1' --workspace @nx-fullstack-learning/backend-core
```

```dotenv
# BOUNDARY: Change this one value to select infrastructure at process composition.
DATABASE_CLIENT=mongoose
# WHAT: Direct connection makes the single published learning member addressable.
MONGODB_URL=mongodb://127.0.0.1:27017/learning?replicaSet=rs0&directConnection=true
```

Extend `config.ts` without duplicating the existing `databaseClient` property:

```ts
// BOUNDARY: Both implemented clients are valid startup choices now.
DATABASE_CLIENT: z.enum(['prisma', 'mongoose']).default('prisma'),
// SECRET: Require the selected MongoDB topology URI from configuration.
MONGODB_URL: z.string().min(1),

// Replace AppConfig's existing literal client type, then add the URI:
databaseClient: 'prisma' | 'mongoose';
mongodbUrl: string;

// Keep the existing databaseClient mapping and add:
mongodbUrl: parsed.MONGODB_URL,
```

Create `libs/backend/core/src/lib/tasks/mongoose.models.ts`:

```ts
// WHAT: Compile schemas against an owned connection, not Mongoose's global singleton.
import type { Connection, Model } from 'mongoose';
import { Schema } from 'mongoose';

// BOUNDARY: This storage record remains private to the MongoDB adapter.
export type MongoTaskRecord = {
  _id: string;
  title: string;
  description: string | null;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

// BOUNDARY: Services never import the event storage shape.
export type MongoTaskEventRecord = {
  taskId: string;
  eventType: 'completed';
  payload: { previousVersion: number };
  createdAt: Date;
};

export type MongoModels = {
  Task: Model<MongoTaskRecord>;
  TaskEvent: Model<MongoTaskEventRecord>;
};

const taskSchema = new Schema<MongoTaskRecord>(
  {
    // WHY: UUID strings preserve identity across PostgreSQL, MongoDB, URLs, and caches.
    _id: { type: String, required: true },
    // CHECK: Storage validation remains defense in depth behind Zod.
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, default: null, maxlength: 2_000 },
    done: { type: Boolean, required: true, default: false },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    // WHY: Use the same explicit domain token as PostgreSQL, not Mongoose `__v`.
    version: { type: Number, required: true, default: 1, min: 1 },
  },
  {
    // WHAT: Store both timestamps as native BSON dates.
    timestamps: true,
    // WHY: Prevent a second, Mongoose-specific version authority.
    versionKey: false,
    // SECURITY: Reject writes before connection instead of buffering them.
    bufferCommands: false,
    collection: 'tasks',
  },
);

// WHY: Match filtered and unfiltered deterministic list access paths.
taskSchema.index({ done: 1, createdAt: -1, _id: 1 });
taskSchema.index({ createdAt: -1, _id: 1 });

const taskEventSchema = new Schema<MongoTaskEventRecord>(
  {
    taskId: { type: String, required: true },
    eventType: { type: String, required: true, enum: ['completed'] },
    // BOUNDARY: The repository owns this event-specific runtime shape.
    payload: { type: Schema.Types.Mixed, required: true },
  },
  {
    // WHAT: Events need a creation time but no meaningless update time.
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    bufferCommands: false,
    collection: 'task_events',
  },
);

// WHY: Match newest-first history lookup for one task.
taskEventSchema.index({ taskId: 1, createdAt: -1 });

export function createMongoModels(connection: Connection): MongoModels {
  return {
    // WHAT: Bind both models to the lifecycle-owned connection.
    Task: connection.model<MongoTaskRecord>('Task', taskSchema),
    TaskEvent: connection.model<MongoTaskEventRecord>('TaskEvent', taskEventSchema),
  };
}
```

Create `libs/backend/core/src/lib/tasks/mongoose-task.repository.ts`:

```ts
import { randomUUID } from 'node:crypto';
import type { ClientSession, Connection, QueryFilter } from 'mongoose';
import type { CreateTaskInput, ListTasksInput, UpdateTaskInput } from './task.schema.js';
import { PrioritySchema } from './task.schema.js';
import type { Task, TaskRepository, UpdateResult } from './task.repository.js';
import type { MongoModels, MongoTaskRecord } from './mongoose.models.js';

// SECURITY: Make user text literal before placing it in a regular expression.
function escapeRegularExpression(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// BOUNDARY: Translate `_id` and BSON dates into the stable domain representation.
function mapTask(row: MongoTaskRecord): Task {
  return {
    id: row._id,
    title: row.title,
    description: row.description,
    done: row.done,
    priority: PrioritySchema.parse(row.priority),
    version: row.version,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// WHAT: Implement the same domain port with Mongoose and MongoDB.
export class MongooseTaskRepository implements TaskRepository {
  constructor(
    private readonly connection: Connection,
    private readonly models: MongoModels,
  ) {}

  async list(input: ListTasksInput) {
    // BOUNDARY: Translate shared semantics to a MongoDB predicate here.
    const filter: QueryFilter<MongoTaskRecord> = {
      ...(input.done === undefined ? {} : { done: input.done }),
      ...(input.q ? { title: { $regex: escapeRegularExpression(input.q), $options: 'i' } } : {}),
    };
    // WHY: Independent reads may overlap; `lean` skips unnecessary hydration.
    const [rows, total] = await Promise.all([this.models.Task.find(filter).sort({ createdAt: -1, _id: 1 }).skip(input.offset).limit(input.limit).lean().exec(), this.models.Task.countDocuments(filter).exec()]);
    return { data: rows.map(mapTask), total };
  }

  async findById(id: string) {
    // WHY: Read-only output needs no document methods or change tracking.
    const row = await this.models.Task.findById(id).lean().exec();
    return row ? mapTask(row) : null;
  }

  async create(input: CreateTaskInput) {
    // WHAT: Generate the portable UUID at the infrastructure boundary.
    const row = await this.models.Task.create({
      _id: randomUUID(),
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
    });
    return mapTask(row.toObject());
  }

  async update(id: string, input: UpdateTaskInput): Promise<UpdateResult> {
    // WHY: Never write undefined properties through `$set`.
    const changes: Record<string, unknown> = { updatedAt: new Date() };
    if (input.title !== undefined) changes.title = input.title;
    if (input.description !== undefined) changes.description = input.description;
    if (input.priority !== undefined) changes.priority = input.priority;
    if (input.done !== undefined) changes.done = input.done;

    // WHY: Identity plus version makes compare-and-swap one atomic document update.
    const row = await this.models.Task.findOneAndUpdate({ _id: id, version: input.version }, { $set: changes, $inc: { version: 1 } }, { new: true, runValidators: true })
      .lean()
      .exec();
    return row ? { kind: 'updated', task: mapTask(row) } : this.classifyMiss(id);
  }

  async complete(id: string, version: number): Promise<UpdateResult> {
    let result: UpdateResult = { kind: 'missing' };
    // BOUNDARY: The replica-set transaction keeps task and event atomic.
    await this.connection.transaction(async (session) => {
      // IMPORTANT: Do not run operations in parallel inside a MongoDB transaction.
      const row = await this.models.Task.findOneAndUpdate({ _id: id, version }, { $set: { done: true, updatedAt: new Date() }, $inc: { version: 1 } }, { new: true, runValidators: true, session })
        .lean()
        .exec();
      if (!row) {
        result = await this.classifyMiss(id, session);
        return;
      }
      // WHAT: Passing the same session includes the event in the transaction.
      await this.models.TaskEvent.create([{ taskId: id, eventType: 'completed', payload: { previousVersion: version } }], { session });
      result = { kind: 'updated', task: mapTask(row) };
    });
    return result;
  }

  async delete(id: string) {
    // WHAT: Map MongoDB's delete count to the port's boolean contract.
    const deleted = await this.models.Task.deleteOne({ _id: id }).exec();
    return deleted.deletedCount === 1;
  }

  private async classifyMiss(id: string, session?: ClientSession): Promise<UpdateResult> {
    // WHAT: Distinguish missing identity from a stale known identity.
    const query = this.models.Task.exists({ _id: id });
    if (session) query.session(session);
    return (await query.exec()) ? { kind: 'conflict' } : { kind: 'missing' };
  }
}
```

Create `libs/backend/core/src/lib/persistence/mongoose-persistence.adapter.ts`:

```ts
// WHAT: Own a connection explicitly instead of using Mongoose's global singleton.
import { createConnection } from 'mongoose';
import type { AppConfig } from '../config.js';
import { MongooseTaskRepository } from '../tasks/mongoose-task.repository.js';
import { createMongoModels } from '../tasks/mongoose.models.js';
import type { PersistenceAdapter } from './persistence.js';

export class MongoosePersistenceAdapter implements PersistenceAdapter {
  readonly kind = 'mongodb-mongoose' as const;
  // WHAT: One connection owns a bounded MongoDB pool for this process.
  private readonly connection = createConnection();
  // WHAT: Models compile against this owned connection.
  private readonly models = createMongoModels(this.connection);
  // BOUNDARY: Expose only the shared repository port.
  readonly tasks = new MongooseTaskRepository(this.connection, this.models);

  constructor(private readonly config: AppConfig) {}

  async connect() {
    await this.connection.openUri(this.config.mongodbUrl, {
      // WHY: Use the same per-process pool budget as the PostgreSQL adapter.
      maxPoolSize: this.config.databasePoolMax,
      // WHY: Fail startup promptly when topology selection cannot succeed.
      serverSelectionTimeoutMS: 5_000,
      // WHY: Development convenience must not build indexes implicitly in production.
      autoIndex: this.config.nodeEnv !== 'production',
    });
  }

  async disconnect() {
    // WHAT: Close driver sockets during the shared graceful lifecycle.
    await this.connection.close();
  }

  async checkReadiness() {
    // CHECK: Require an open database and a successful server ping.
    if (!this.connection.db) throw new Error('MongoDB connection is not open');
    await this.connection.db.command({ ping: 1 });
  }
}
```

Finally, change only the selection factory:

```ts
import { MongoosePersistenceAdapter } from './mongoose-persistence.adapter.js';

export function createPersistence(config: AppConfig): PersistenceAdapter {
  // BOUNDARY: This is the only database-client conditional in the application.
  if (config.databaseClient === 'mongoose') {
    return new MongoosePersistenceAdapter(config);
  }
  // WHY: Prisma/PostgreSQL remains the default documented path.
  return new PrismaPersistenceAdapter(config);
}
```

Export the three new Mongoose modules from the backend index:

```ts
export * from './lib/persistence/mongoose-persistence.adapter.js';
export * from './lib/tasks/mongoose-task.repository.js';
export * from './lib/tasks/mongoose.models.js';
```

Then run the same repository contract suite against both real adapters. Do not weaken a test because MongoDB behaves differently; either implement the shared semantic or document that it does not belong in the common port.

Create the native-driver exception `libs/backend/core/src/lib/tasks/plain-mongo.selectors.ts`:

```ts
import type { Connection } from 'mongoose';
import type { MongoTaskRecord } from './mongoose.models.js';

// WHAT: Describe only the projected fields returned by this native selector.
export type RecentOpenMongoTask = Pick<MongoTaskRecord, '_id' | 'title' | 'createdAt'>;

export async function selectRecentOpenTasksWithMongoDriver(connection: Connection, since: Date, limit: number) {
  // CHECK: Callers validate values before this deliberately low-level helper.
  if (!connection.db) throw new Error('MongoDB connection is not open');

  // BOUNDARY: `.collection()` deliberately bypasses Mongoose casting and middleware.
  return (
    connection.db
      .collection<MongoTaskRecord>('tasks')
      .find(
        // WHAT: Native selectors are data objects, not interpolated query strings.
        { done: false, createdAt: { $gte: since } },
        // WHY: Project only fields consumed by this reporting path.
        { projection: { _id: 1, title: 1, createdAt: 1 } },
      )
      // WHY: Match compound-index order and keep ties deterministic.
      .sort({ createdAt: -1, _id: 1 })
      // WHY: Bound database work, transfer size, and application memory.
      .limit(limit)
      .toArray() as Promise<RecentOpenMongoTask[]>
  );
}
```

Export it from the backend index, then compare `.explain('executionStats')` before and after the compound index. This is the MongoDB equivalent of a deliberate raw SQL escape hatch—not a reason to bypass Mongoose everywhere.

Branch 07 exit check: switching only `DATABASE_CLIENT` and its URL preserves HTTP contract, version conflict, task-plus-event rollback, list order, and tests; readiness names the selected adapter; Mongoose types never reach the service or React app; engine-specific query plans remain in adapter/native-selector lessons.

#### Branch 08 — Harden HTTP, isolate CPU work, and add S3 upload boundaries

Create `lesson/08-node-hardening-workers-s3` from Branch 07. Implement this branch as small commits in the order shown: configuration → middleware → CPU worker → proxy upload → presigned upload → direct-Node TLS example. Run `npm run check` after each increment so a security change never becomes an unreviewable pile.

Declare only packages imported by this backend library:

```bash
npm pkg set 'dependencies.cors=^2.8.6' --workspace @nx-fullstack-learning/backend-core
npm pkg set 'dependencies.express-rate-limit=^8.6.2' --workspace @nx-fullstack-learning/backend-core
npm pkg set 'dependencies.helmet=^8.3.0' --workspace @nx-fullstack-learning/backend-core
npm pkg set 'dependencies.pino-http=^11.0.0' --workspace @nx-fullstack-learning/backend-core
npm pkg set 'dependencies.multer=^2.2.0' --workspace @nx-fullstack-learning/backend-core
npm pkg set 'dependencies.@aws-sdk/client-s3=^3.1115.0' --workspace @nx-fullstack-learning/backend-core
npm pkg set 'dependencies.@aws-sdk/s3-request-presigner=^3.1115.0' --workspace @nx-fullstack-learning/backend-core
```

Add an empty-string normalizer near the top of `config.ts`:

```ts
// BOUNDARY: Treat an intentionally blank optional environment value as absent.
const optionalString = z.preprocess((value) => (value === '' ? undefined : value), z.string().optional());
```

Add these fields to `EnvironmentSchema`, then mirror them in `AppConfig` and `loadConfig`:

```ts
// WHAT: Parse a comma-separated browser-origin allowlist at startup.
CORS_ORIGINS: z.string().default('http://localhost:4200'),
// SECRET: Leave the teaching API key absent locally; require real identity in production.
API_KEY: optionalString,
// WHAT: Select the region used by the S3 client and presigner.
AWS_REGION: z.string().default('eu-central-1'),
// WHAT: Keep upload capability disabled until a private bucket is configured.
S3_UPLOAD_BUCKET: optionalString,

// Add to AppConfig:
corsOrigins: string[];
apiKey?: string;
awsRegion: string;
s3UploadBucket?: string;

// Add to loadConfig's return value:
corsOrigins: parsed.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
apiKey: parsed.API_KEY,
awsRegion: parsed.AWS_REGION,
s3UploadBucket: parsed.S3_UPLOAD_BUCKET,
```

Create the corresponding non-secret teaching entries in `.env.example`; leave `API_KEY` and `S3_UPLOAD_BUCKET` empty until their exercises.

Replace `libs/backend/core/src/lib/http/middleware.ts`:

```ts
// WHAT: Use constant-time comparison for equal-length secret byte sequences.
import { timingSafeEqual } from 'node:crypto';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { HttpError } from '../errors.js';

// BOUNDARY: Apply a small teaching authentication policy after public health routes.
export function requireApiKey(expected?: string): RequestHandler {
  return (request, _response, next) => {
    // WHY: Local development remains usable until the environment configures a key.
    if (!expected) return next();
    const actual = request.header('x-api-key') ?? '';
    const expectedBuffer = Buffer.from(expected);
    const actualBuffer = Buffer.from(actual);
    // SECURITY: Check length first because timingSafeEqual requires equal-sized buffers.
    if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
      return next(new HttpError(401, 'Invalid API key', 'UNAUTHORIZED'));
    }
    return next();
  };
}

// WHAT: Forward unmatched routes into the one error-translation boundary.
export const notFound: RequestHandler = (request, _response, next) => {
  next(new HttpError(404, `No route for ${request.method} ${request.path}`, 'ROUTE_NOT_FOUND'));
};

// BOUNDARY: Four arguments make this Express error-handling middleware.
export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  // WHY: Once bytes were sent, only Express's default handler can fail the stream safely.
  if (response.headersSent) return next(error);

  if (error instanceof ZodError) {
    response.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      requestId: request.id,
      details: error.issues,
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    // WHAT: Distinguish an oversized payload from another malformed multipart request.
    response.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
      code: error.code,
      message: error.message,
      requestId: request.id,
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({
      code: error.code,
      message: error.message,
      requestId: request.id,
      details: error.details,
    });
    return;
  }

  // SECURITY: Log the unknown error internally but return no stack or driver detail.
  request.log.error({ err: error }, 'Unhandled request error');
  response.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Unexpected server error',
    requestId: request.id,
  });
};
```

Create `libs/backend/core/src/lib/workers/fibonacci.ts`:

```ts
// WHAT: Worker threads execute CPU-bound JavaScript away from the HTTP event loop.
import { Worker } from 'node:worker_threads';

// SECURITY: This constant source contains no interpolated caller input.
const workerSource = `
  const { parentPort, workerData } = require('node:worker_threads');
  function fibonacci(n) {
    return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
  }
  parentPort.postMessage(fibonacci(workerData));
`;

// WHAT: Expose one bounded promise-based CPU capability to HTTP composition.
export function fibonacciInWorker(input: number, timeoutMs = 5_000) {
  return new Promise<number>((resolve, reject) => {
    // BOUNDARY: Copy the validated number into a new worker's isolated context.
    const worker = new Worker(workerSource, { eval: true, workerData: input });
    // WHY: Bound abandoned or pathological CPU work.
    const timeout = setTimeout(() => {
      void worker.terminate();
      reject(new Error('Worker timed out'));
    }, timeoutMs);

    worker.once('message', (result: number) => {
      // WHAT: Prevent the timeout from racing a successful result.
      clearTimeout(timeout);
      resolve(result);
    });
    worker.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}
```

This creates one worker per request for teaching clarity. Measure its startup overhead, then build a bounded reusable pool with queue length, task timeout, cancellation, worker replacement after failure, and overload rejection before calling it production-ready.

Create `libs/backend/core/src/lib/http/uploads.router.ts`:

```ts
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import type { AppConfig } from '../config.js';
import { HttpError } from '../errors.js';

// WHY: Bound memory and API bandwidth for the proxy-upload teaching path.
const maximumFileSize = 10 * 1024 * 1024;
// BOUNDARY: Client MIME is allowlisted but is not proof of file content.
const allowedTypes = new Set(['image/jpeg', 'image/png', 'application/pdf']);

const PresignSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().refine((value) => allowedTypes.has(value), {
    message: 'Only JPEG, PNG, and PDF files are allowed',
  }),
  // WHY: Signed metadata and product policy share the same size ceiling.
  size: z.number().int().positive().max(maximumFileSize),
});

function objectKey(fileName: string) {
  // SECURITY: Preserve only a small sanitized extension, never the caller's path/name.
  const extension = extname(fileName)
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '');
  // WHY: Random immutable keys avoid overwrite races and user-controlled object paths.
  return `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;
}

export function createUploadsRouter(config: AppConfig) {
  const router = Router();
  // WHAT: In ECS, the default credential chain uses the task role—no static key in code.
  const client = new S3Client({ region: config.awsRegion });
  const upload = multer({
    // WHY: Memory storage is acceptable only because size and file count are tightly bounded.
    storage: multer.memoryStorage(),
    limits: { files: 1, fileSize: maximumFileSize },
    // BOUNDARY: Reject MIME types outside the product allowlist.
    fileFilter: (_request, file, callback) => callback(null, allowedTypes.has(file.mimetype)),
  });

  function bucket() {
    // CHECK: Fail this capability explicitly rather than writing to an accidental bucket.
    if (!config.s3UploadBucket) {
      throw new HttpError(503, 'S3 upload is not configured', 'S3_NOT_CONFIGURED');
    }
    return config.s3UploadBucket;
  }

  router.post('/presign', async (request, response) => {
    // BOUNDARY: Validate the requested upload capability before signing it.
    const input = PresignSchema.parse(request.body);
    const key = objectKey(input.fileName);
    const command = new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: input.contentType,
      ContentLength: input.size,
    });
    // SECURITY: The five-minute URL is a narrowly scoped bearer capability.
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
    response.json({ data: { key, uploadUrl, expiresInSeconds: 300 } });
  });

  router.post('/', upload.single('file'), async (request, response) => {
    // CHECK: Multer may accept the request while its configured field is absent.
    if (!request.file) {
      throw new HttpError(400, 'Attach one allowed file as “file”', 'FILE_REQUIRED');
    }
    const key = objectKey(request.file.originalname);
    // BOUNDARY: Proxy bytes through Node only for the small-file exercise.
    await client.send(
      new PutObjectCommand({
        Bucket: bucket(),
        Key: key,
        Body: request.file.buffer,
        ContentType: request.file.mimetype,
      }),
    );
    response.status(201).json({ data: { key } });
  });

  return router;
}
```

Now replace `libs/backend/core/src/lib/http/create-app.ts` with the complete hardened order:

```ts
import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { z } from 'zod';
import type { AppConfig } from '../config.js';
import type { PersistenceAdapter } from '../persistence/persistence.js';
import type { TaskService } from '../tasks/task.service.js';
import { fibonacciInWorker } from '../workers/fibonacci.js';
import { errorHandler, notFound, requireApiKey } from './middleware.js';
import { createTasksRouter } from './tasks.router.js';
import { createUploadsRouter } from './uploads.router.js';

export type ApplicationDependencies = {
  config: AppConfig;
  persistence: Pick<PersistenceAdapter, 'kind' | 'checkReadiness'>;
  taskService: TaskService;
};

export function createApp({ config, persistence, taskService }: ApplicationDependencies) {
  const app = express();
  app.disable('x-powered-by');
  // BOUNDARY: Trust exactly the one AWS/local reverse-proxy hop used by this design.
  app.set('trust proxy', 1);
  // WHAT: Assign/carry a correlation id and emit structured request logs first.
  app.use(
    pinoHttp({
      genReqId: (request) => request.headers['x-request-id']?.toString() ?? randomUUID(),
      // SECURITY: Redact credentials before serialization, not after log ingestion.
      redact: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.x-api-key'],
    }),
  );
  // SECURITY: Add defensive browser response headers.
  app.use(helmet());
  // BOUNDARY: CORS controls which browsers may read responses; it is not authentication.
  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || config.corsOrigins.includes(origin));
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    }),
  );
  // WHY: Bound abusive traffic per process; distributed enforcement needs a shared store.
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  // BOUNDARY: Parse only bounded JSON before application routes.
  app.use(express.json({ limit: '100kb' }));

  // CHECK: Load balancers can inspect process and dependency health without an API key.
  app.get('/api/health/live', (_request, response) => response.json({ status: 'ok' }));
  app.get('/api/health/ready', async (_request, response) => {
    await persistence.checkReadiness();
    response.json({ status: 'ready', persistence: persistence.kind });
  });

  // SECURITY: Authentication precedes every application capability below it.
  app.use('/api', requireApiKey(config.apiKey));
  app.use('/api/tasks', createTasksRouter(taskService));
  app.use('/api/uploads', createUploadsRouter(config));
  app.post('/api/tools/fibonacci', async (request, response) => {
    // BOUNDARY: Bound CPU cost before creating a worker.
    const { n } = z.object({ n: z.number().int().min(0).max(42) }).parse(request.body);
    response.json({ data: { n, value: await fibonacciInWorker(n) } });
  });

  // WHAT: Terminal translation middleware remains last.
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
```

Pass `config` into `createApp` in `apps/api/src/main.ts`, keeping its startup `try/catch` and lifecycle unchanged. Export the worker and upload router from the backend index:

```ts
export * from './lib/http/uploads.router.js';
export * from './lib/workers/fibonacci.js';
```

Update `create-app.spec.ts` so the HTTP test still owns no real cloud or database resource:

```ts
// Add beside the existing imports.
import type { AppConfig } from '../config.js';

function setup() {
  const taskService = new TaskService(new InMemoryTaskRepository());
  // WHAT: Supply a complete, deterministic process configuration for composition tests.
  const config: AppConfig = {
    nodeEnv: 'test',
    host: 'localhost',
    port: 3000,
    databaseClient: 'prisma',
    databaseUrl: 'postgresql://unused:unused@localhost:5432/unused',
    mongodbUrl: 'mongodb://localhost:27017/unused',
    databasePoolMax: 1,
    corsOrigins: ['http://localhost:4200'],
    awsRegion: 'eu-central-1',
    // CHECK: Omitted API key and bucket keep auth disabled and uploads unconfigured.
  };
  const persistence = {
    kind: 'postgresql-prisma' as const,
    checkReadiness: async () => undefined,
  };
  return createApp({ config, persistence, taskService });
}
```

Create `apps/api/src/https-main.example.ts` as a learning-only transport composition:

```ts
import { readFileSync } from 'node:fs';
import { createServer } from 'node:https';
import type { Express } from 'express';

// WHAT: Demonstrate direct Node TLS without replacing the normal AWS entry point.
export function listenWithHttps(app: Express, port = 3443) {
  return createServer(
    {
      // SECRET: Load the private key at runtime; never commit or bake it into an image.
      key: readFileSync('./certs/localhost-key.pem'),
      // WHAT: Present the matching public certificate.
      cert: readFileSync('./certs/localhost-cert.pem'),
      // WHY: Refuse obsolete TLS protocol versions.
      minVersion: 'TLSv1.2',
    },
    // WHAT: Reuse the same Express application behind encrypted transport.
    app,
  ).listen(port);
}
```

Branch 08 exercises:

1. Send a known request id and prove the response error and redacted structured log correlate without exposing the API key.
2. Compare main-thread Fibonacci and worker Fibonacci while a liveness probe runs; record event-loop delay and worker overhead.
3. Upload an oversized file, a disallowed MIME, and no file; verify intentional 413/400 outcomes. Then use a presigned URL and prove bytes bypass Node.
4. Inspect magic bytes and design quarantine/scanning before a file becomes downloadable; MIME and extension alone are not trust.
5. Generate a local development certificate, inspect TLS, and draw where plaintext exists when ACM terminates TLS at CloudFront/ALB.

Branch 08 exit check: middleware order matches the documented threat model, errors never leak internals, request IDs correlate, CPU work does not block liveness, upload bounds are enforced, presigned URLs expire, private keys are absent from Git, and SIGTERM still drains HTTP before either database pool closes.

#### Branches 09–12 — Continue cumulatively through operations

The remaining branches use the exact incremental authoring blocks in Parts 4–6; none of their files exists on `workshop/start`.

| Branch                       | Create yourself                                                                | Follow in order | Required proof                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------ | --------------- | -------------------------------------------------------------------------------------- |
| `lesson/09-container-images` | `.dockerignore`, API Dockerfile, web Dockerfile, Nginx config                  | 4.2A → 4.2D     | context comparison, image layers, non-root runtime, SPA refresh                        |
| `lesson/10-compose-runtime`  | migration, API, web, and optional Mongo services in your existing Compose file | 4.3A → 4.4      | dependency health chain, DNS/port proof, one broken-service incident                   |
| `lesson/11-ci-cd`            | CI workflow, OIDC trust, deploy workflow                                       | 5.1 → 5.3       | deliberate failing check, immutable image digest, staging health and rollback          |
| `lesson/12-aws`              | budget and every named AWS resource/template                                   | 6.1 → 6.14      | cost alarm, least privilege, TLS/data path, observability, restore, teardown inventory |

Do not branch those four directly from the starter. `lesson/12-aws` contains the application, both database adapters, security, uploads, Docker images, completed Compose runtime, and CI history because it descends from Branch 11.

## Part 0 — Scaffold and run the Nx workspace

### Lesson 0.1 — Recreate the scaffold

The finished repository is already scaffolded. These are the commands used, retained so you can reproduce the setup in a clean directory.

```bash
# WHAT: Generate a React-aware integrated workspace with deterministic, non-interactive options.
npx create-nx-workspace@latest nx-fullstack-learning \
  --preset=react-monorepo \
  --appName=web \
  --style=css \
  --bundler=vite \
  --e2eTestRunner=none \
  --unitTestRunner=vitest \
  --routing=true \
  --packageManager=npm \
  --nxCloud=skip \
  --skipGit \
  --interactive=false

# WHAT: Make the generated workspace the working directory for every following command.
cd nx-fullstack-learning
# WHAT: Install the Nx plugin that knows how to generate and build Node applications.
npm install --save-dev @nx/node@23.1.1

# WHAT: Install Prisma's generated client, PostgreSQL adapter, and schema/migration CLI.
npm install @prisma/client@7.9.1 @prisma/adapter-pg@7.9.1 pg
npm install --save-dev prisma@7.9.1

# WHAT: Install the alternative document-database adapter used in comparative labs.
npm install mongoose@9.9.1

# WHAT: Generate the deployable Express API composition root under apps/api.
npx nx g @nx/node:application apps/api \
  --name=api \
  --framework=express \
  --bundler=esbuild \
  --e2eTestRunner=none \
  --unitTestRunner=none \
  --linter=eslint \
  --port=3000 \
  --interactive=false

# WHAT: Generate reusable presentation code; this library must not own application routes.
npx nx g @nx/react:library libs/frontend/ui \
  --name=frontend-ui \
  --importPath=@nx-fullstack-learning/frontend-ui \
  --bundler=vite \
  --unitTestRunner=vitest \
  --linter=eslint \
  --interactive=false

# WHAT: Generate backend domain policy and adapters separately from the API process entry.
npx nx g @nx/js:library libs/backend/core \
  --name=backend-core \
  --importPath=@nx-fullstack-learning/backend-core \
  --bundler=tsc \
  --unitTestRunner=vitest \
  --testEnvironment=node \
  --linter=eslint \
  --interactive=false
```

Read the generator flags as architecture decisions: `--importPath` creates a stable library boundary; `--bundler` selects how a project is emitted; the test and lint flags make verification explicit; `--interactive=false` makes the scaffold reproducible. Plain CSS and no generated E2E runner keep the first checkpoint focused. You will add tests at the boundary where each risk becomes visible.

Why Nx: it provides a project graph, task inference, dependency-aware builds, caching, generators, and one place for TypeScript and lint policy. A monorepo is not automatically a good architecture; the import graph still needs clear boundaries.

List the four projects and inspect their graph:

```bash
# CHECK: Nx should discover exactly the four generated projects.
npx nx show projects
# CHECK: Open the graph and verify that app imports point toward libraries.
npx nx graph
```

Expected projects:

```text
@nx-fullstack-learning/web
api
frontend-ui
backend-core
```

Additional exercises:

1. Add a temporary forbidden import from `frontend/ui` to `apps/api`, inspect the Nx project graph, then remove it and write the dependency rule that should prevent it permanently.
2. Change one source file, compare `npx nx show project <project>` before and after, and record which cached tasks invalidate and which remain reusable.

Exit check: explain the difference between a workspace, a project, a target, and a task. Then run one target twice and observe Nx’s cache.

### Lesson 0.2 — Start the host processes before infrastructure exists

Outcome: prove that the untouched React and Node project shells run before you add lesson behavior. Docker, database schema, Compose, routes, Query hooks, and repositories are intentionally absent.

Copy the documented development variables and inspect them before starting anything:

```bash
# WHAT: Create an ignored local configuration file from non-secret teaching defaults.
cp .env.example .env
# CHECK: Confirm Git will not include local values in a future commit.
git check-ignore -v .env
# CHECK: The starter contains only the host and port used by the generated-style API shell.
grep -E '^(HOST|PORT)=' .env
```

Start both application processes on the host:

```bash
# WHAT: Run the API and web development targets without creating any containers.
npm run dev
```

The web shell runs on `http://localhost:4200`; the minimal API runs on port 3000. The Vite proxy, health routes, task API, and database behavior do not exist yet because they are exercises.

In a second terminal:

```bash
# CHECK: Prove only the generated-style starter route promised by the current code.
curl -i http://localhost:3000/api
# CHECK: A task route is absent rather than secretly preimplemented.
curl -i http://localhost:3000/api/tasks
```

The expected 404 for `/api/tasks` is evidence that the learner branch contains no hidden solution. You will add liveness with the first HTTP slice and readiness only after a real persistence adapter exists.

Core lab (25 minutes): run all four Nx targets, draw the two current processes, and record the starter response plus expected task 404. Do not create a Compose file yet.

Senior challenge: stop only the API, observe the Vite proxy failure, restart it, and explain which evidence belongs to the browser, proxy, Node process, and database boundary.

Additional exercises:

1. Start the API with `PORT=3100`, prove the original port closes, and identify every later configuration point that must not hard-code port 3000.
2. Send `SIGTERM` to the starter API while issuing repeated requests, capture the abrupt behavior, and save it as the baseline for the graceful-shutdown lesson.

Exit check: provide the starter web screenshot, successful `GET /api`, expected task 404, and a clean `npm run check`.

### Lesson 0.3 — Build the PostgreSQL Compose service from an empty file

Outcome: create the first infrastructure dependency yourself and understand every line that changes its lifecycle, reachability, health, and persistence. Start with a genuinely new file and do not jump forward to the Part 4 service snippets until this lesson's exit check passes.

#### Exercise 0.3A — Create the smallest useful service

Create a new empty `compose.yaml`. Do not begin from a manifest in a blog post or another branch. Use this authoring brief to decide what you must express:

| Decision you must encode | Required result                                                                  | Why it exists                                                                  |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Top-level model          | A Compose `services` map; omit the obsolete version declaration                  | Compose needs a desired-process model, not a script                            |
| Service identity         | Name the PostgreSQL service `database`                                           | Later containers will use this name through Compose DNS                        |
| Image                    | PostgreSQL 18 on Alpine, with a pinned major rather than `latest`                | The exercise and volume layout must not change unexpectedly                    |
| Initialization           | Create local database `learning` and role `app` with a disposable local password | The official image initializes an empty data directory from environment values |
| Host boundary            | Publish container port 5432 on host port 5432                                    | The API still runs on the host at this checkpoint                              |

Write a `WHAT`, `WHY`, `BOUNDARY`, or `SECURITY` comment immediately above every setting. Before validation, predict the four indentation levels you need: top-level services, service name, service property, and nested property. If syntax blocks you, consult the linked official Compose reference and the first annotated increment below; do not skip ahead to later services.

Now type the first working version yourself:

```yaml
# WHAT: Declare the processes that form this local environment.
services:
  # WHAT: Give PostgreSQL the stable DNS and service identity `database`.
  database:
    # WHY: Pin the database major instead of accepting a moving `latest` tag.
    image: postgres:18-alpine
    # BOUNDARY: These are disposable local credentials, never production secrets.
    environment:
      # WHAT: Create this database when an empty data directory initializes.
      POSTGRES_DB: learning
      # WHAT: Create the local role that owns the learning database.
      POSTGRES_USER: app
      # SECURITY: Use this trivial password only for the local lab.
      POSTGRES_PASSWORD: app
    # BOUNDARY: Publish PostgreSQL because the API still runs on the host.
    ports:
      - '5432:5432'
```

Do not add health, persistence, migration, or application services yet. Save this file and prove this smallest version before continuing.

Before starting it, ask Compose to parse and normalize your work:

```bash
# CHECK: Fail fast on indentation, type, and interpolation mistakes.
docker compose config
# CHECK: Confirm that only the service you have actually written exists.
docker compose config --services
# WHAT: Create the default network and start PostgreSQL in the background.
docker compose up database -d
# CHECK: Observe state without assuming that “running” means “ready.”
docker compose ps
# CHECK: Read initialization and authentication evidence from the service.
docker compose logs database
# CHECK: Cross the published host port and run an authenticated query.
docker compose exec database psql -U app -d learning -c 'select current_database(), current_user;'
```

Why the name matters: later containers resolve `database` through Compose DNS. Host processes use `127.0.0.1:5432`; `localhost` inside an API container would mean that API container, not PostgreSQL.

#### Exercise 0.3B — Define readiness instead of guessing it

Add a health-check sibling to the port and environment properties. Author it from these constraints:

- Execute the `pg_isready` utility that already exists in the image.
- Probe the same role and database you initialized; a process-only check is insufficient.
- Use shell-form execution because the probe contains command arguments.
- Start with a 5-second interval, 3-second timeout, and 10 retries; annotate why each bound exists.
- Do not add a fixed sleep to later services. Health is the synchronization signal.

Before running it, write the exact success condition in plain language and predict the `starting`, `healthy`, and `unhealthy` transitions.

Add this block as a sibling of `image`, `environment`, and `ports` inside `database`:

```yaml
# CHECK: Ask PostgreSQL whether it accepts an authenticated connection.
healthcheck:
  # WHAT: Run the readiness utility already supplied by the image.
  test: ['CMD-SHELL', 'pg_isready -U app -d learning']
  # WHY: Check often enough for a responsive lab without a busy loop.
  interval: 5s
  # WHY: Bound one hung probe.
  timeout: 3s
  # WHY: Allow time for first-time cluster initialization.
  retries: 10
```

Recreate the service and watch the transition:

```bash
# WHAT: Reconcile the running container with the new health-check configuration.
docker compose up database -d
# CHECK: Watch `starting` become `healthy`; do not continue on a timer alone.
docker compose ps --format json
# CHECK: Inspect individual probe results if health does not converge.
docker inspect --format '{{json .State.Health}}' "$(docker compose ps -q database)"
```

Break it deliberately: change the health-check database to `missing`, recreate the service, observe `unhealthy`, then restore `learning`. The PostgreSQL process remains running while the health contract fails; explain why those states are independent.

#### Exercise 0.3C — Give data a different lifecycle from the container

Add persistence without copying a volume block. Your implementation must satisfy all four checks:

1. Declare one project-scoped named volume called `postgres-data` at the top level.
2. Mount that volume from the database service.
3. Use the PostgreSQL 18 image's volume root, `/var/lib/postgresql`, rather than the pre-18 path.
4. Comment the service mount and top-level declaration separately: one attaches storage; the other declares its lifecycle.

Sketch the resulting YAML tree on paper first. A top-level volume declaration and a service-level volume mount have different indentation and different responsibilities.

Add the service mount under `database`, then add the top-level declaration at the leftmost indentation level:

```yaml
services:
  database:
    # ...keep the image, environment, ports, and health check you wrote.
    # WHY: Attach persistent state to this service at PostgreSQL 18's volume root.
    volumes:
      - postgres-data:/var/lib/postgresql

# WHAT: Declare storage whose lifecycle is independent of a database container.
volumes:
  # WHAT: Let Compose create and consistently reuse this project-scoped volume.
  postgres-data:
```

The ellipsis is explanatory and must not be pasted into YAML. Keep your earlier properties in place.

Prove the lifecycle rather than merely defining it:

```bash
# WHAT: Recreate PostgreSQL with the new persistent mount.
docker compose up database -d
# WHAT: Insert a probe value whose survival you can verify after replacement.
docker compose exec database psql -U app -d learning -c \
  "create table if not exists compose_probe(value text); insert into compose_probe values ('survives');"
# WHAT: Remove containers and the project network while preserving named volumes.
docker compose down
# WHAT: Create a new database container attached to the existing volume.
docker compose up database -d
# CHECK: Prove state survived container replacement.
docker compose exec database psql -U app -d learning -c 'select * from compose_probe;'
```

Optional reset drill, only after recording the persistence proof:

```bash
# WARNING: Delete the learning volume and every row stored inside it.
docker compose down --volumes
# WHAT: Recreate a genuinely empty local database cluster.
docker compose up database -d
```

`--volumes` is a disposable-development reset, never a production migration or recovery strategy.

#### Exercise 0.3D — Apply schema from the host

This is a deferred checkpoint. On `workshop/start`, Prisma configuration, schema, migration history, and seed are intentionally absent. Complete Lesson 2.4 first, then return here and run:

```bash
# WHAT: Regenerate the typed client after checking out or changing the Prisma schema.
npm run prisma:generate
# BOUNDARY: Apply committed migrations to the learner-built PostgreSQL service.
npm run db:migrate:deploy
# WHAT: Insert the idempotent dataset used by pagination and virtualization labs.
npm run db:seed
# CHECK: Verify both migration history and application data in the real database.
docker compose exec database psql -U app -d learning -c \
  'select migration_name, finished_at from _prisma_migrations order by finished_at;'
docker compose exec database psql -U app -d learning -c 'select count(*) from tasks;'
```

Before Lesson 2.4, these commands should fail because the files do not exist; that is intentional. After creating them, if an earlier experiment created objects without migration history, do not mark migrations as applied merely to silence an error. Reset only disposable data. Otherwise back up, introspect and compare the schema, review the baseline, and use `prisma migrate resolve` only after proving the database already matches that migration.

#### Exercise 0.3E — Close the host-to-container loop

This is also deferred until Lesson 2.4 replaces the in-memory adapter with Prisma. Keep both apps on the host and point the API at the published PostgreSQL port:

```bash
# CHECK: Readiness should now cross the driver pool and PostgreSQL successfully.
curl -i http://localhost:3000/api/health/ready
# CHECK: This request crosses React/API contracts, service policy, Prisma, and PostgreSQL.
curl -i 'http://localhost:3000/api/tasks?limit=2'
# WHAT: Stop only the dependency to create a controlled failure.
docker compose stop database
# CHECK: Liveness stays green while readiness and task data fail intentionally.
curl -i http://localhost:3000/api/health/live
curl -i http://localhost:3000/api/health/ready
# WHAT: Restore the dependency and wait for its explicit health state.
docker compose up database -d --wait
```

Core lab evidence: keep the normalized Compose model, the health transition, the persistence probe before/after replacement, the migration list, and the liveness/readiness comparison.

Senior challenge: remove the published port and explain why `docker compose exec database psql ...` still works while the host Node process cannot connect. Restore the port; later the containerized API will use Compose DNS and no longer need PostgreSQL published to the host.

Additional exercises:

1. Create a second disposable Compose project name with `-p`, compare its network and volume names, and explain how project scoping prevents workshop pairs from colliding.
2. Add a CPU or memory limit, run a controlled PostgreSQL workload, and capture container statistics plus the failure/recovery behavior before deciding whether the limit is credible.

Exit check: recreate the PostgreSQL-only `compose.yaml` from memory and explain image, container, service, port publication, health check, default network, and named volume without reading the earlier snippet.

## Part 1 — React from intermediate to expert

### Lesson 1.1 — Routing as a loading boundary

Replace the starter `apps/web/src/app/app.tsx` and create the three page modules as you type this lesson. Do not copy them from `solution/reference`.

```tsx
// WHAT: Convert this static page import into a separately downloadable build chunk.
const TasksPage = lazy(() => import('../pages/tasks-page'));
// WHY: A route that users may never visit should not delay the initial route.
const PerformancePage = lazy(() => import('../pages/performance-page'));

// WHAT: Render useful feedback while either route module travels over the network.
<Suspense fallback={<PageState>Loading route…</PageState>}>
  {/* WHAT: Select the page element that corresponds to the current browser location. */}
  <Routes>
    {/* WHAT: Map the root URL to the lazily loaded task feature. */}
    <Route path="/" element={<TasksPage />} />
    {/* WHAT: Keep the performance lab independently addressable and loadable. */}
    <Route path="/performance" element={<PerformancePage />} />
  </Routes>
</Suspense>;
```

`lazy` changes a static import into a dynamic import, so Vite emits a separate chunk. `Suspense` defines what the user sees while that module arrives. Declare lazy components at module scope; declaring them inside `App` creates a new component identity and can reset state.

The current app uses React Router’s declarative `Routes` API because the project is small. For loaders, actions, route-level error elements, and pre-navigation data, graduate to a data router (`createBrowserRouter`). Choose it because its lifecycle helps your application, not merely because it is newer.

Lab:

```bash
# WHAT: Produce optimized assets and force Vite to reveal its chunk boundaries.
npx nx build @nx-fullstack-learning/web
# CHECK: Separate page filenames prove that lazy imports became separate output chunks.
find apps/web/dist/assets -maxdepth 1 -type f
```

Find separate `tasks-page`, `performance-page`, and `architecture-page` chunks. In browser DevTools, enable network throttling and navigate between routes.

Additional exercises:

1. Add a lazy route whose module intentionally rejects, provide a route-level recovery UI, and prove one failed chunk does not blank the whole application.
2. Measure initial JavaScript transfer and route-navigation transfer before and after making every page eager; retain the bundle report and justify the chosen boundary.

Exit check: identify the difference between route code loading, data loading, and image loading. They need different caching and fallback strategies.

### Lesson 1.2 — Choose the smallest correct state owner

Use this decision table before adding a store:

| State                                  | Owner                 | Example                |
| -------------------------------------- | --------------------- | ---------------------- |
| Temporary and used by one component    | `useState`            | New-task input         |
| Shared by a nearby subtree             | Lift state or context | Wizard step            |
| Client preference shared across routes | Zustand               | Filter and row density |
| Remote data with cache lifecycle       | TanStack Query        | Tasks from the API     |
| Shareable navigation state             | URL                   | Search, page, sort     |

Create `apps/web/src/pages/tasks-page.tsx`: keep `title` local because no distant component needs it. Do not store derived values such as “number of open tasks” if you can calculate them from current data. Duplicated state eventually disagrees.

Lab: move the selected task filter into `?status=open` with `useSearchParams`. Refresh and share the URL. Compare that behavior with Zustand persistence.

Additional exercises:

1. Move filter state from Zustand into the URL, open the same URL in a second tab, and compare shareability, persistence, and back-button behavior.
2. Introduce one duplicated derived count deliberately, make it stale, then replace it with a calculation and add a test that prevents the regression.

Exit check: for every state value in your feature, name its authoritative source and lifetime.

### Lesson 1.3 — Zustand for client state, with narrow selectors

Create `apps/web/src/app/task.store.ts`.

```ts
// BOUNDARY: Export one hook so components interact with policy, not storage details.
export const useTaskUiStore = create<TaskUiState>()(
  // WHAT: Persist selected preferences across browser reloads.
  persist(
    // WHAT: `set` is Zustand's controlled way to replace the relevant state slice.
    (set) => ({
      // WHAT: Give a first-time visitor the inclusive task view.
      filter: 'all',
      // WHAT: Default to the more readable row density.
      compact: false,
      // WHAT: Store an explicit caller-selected filter.
      setFilter: (filter) => set({ filter }),
      // WHY: A functional update reads the latest value during rapid calls.
      toggleCompact: () => set((state) => ({ compact: !state.compact })),
    }),
    // WHAT: A stable storage key allows the preference to be restored later.
    { name: 'task-ui-preferences' },
  ),
);
```

Zustand owns synchronous client preferences. TanStack Query owns server data. Putting fetched tasks in both would create two caches and unclear invalidation.

The page currently selects the whole store for readability:

```ts
// WHAT: This readable form subscribes the component to the entire store object.
const { filter, setFilter, compact, toggleCompact } = useTaskUiStore();
```

At scale, select only what a component uses:

```ts
// WHY: A narrow selector rerenders only when the selected filter changes.
const filter = useTaskUiStore((state) => state.filter);
// WHY: Select the action separately so unrelated preferences remain irrelevant.
const setFilter = useTaskUiStore((state) => state.setFilter);
```

A component subscribed to a smaller slice avoids renders caused by unrelated fields. If a selector returns an object, use stable references or Zustand’s shallow comparison deliberately.

Lab: add `sort: 'newest' | 'oldest'`, migrate any persisted store shape safely, and verify an old `localStorage` value does not crash the app.

Additional exercises:

1. Add a persisted store version and migration, seed `localStorage` with the previous shape, and prove upgrade plus malformed-state fallback.
2. Measure renders with a whole-store subscription and narrow selectors while toggling an unrelated preference; keep the profiler trace and explain the difference.

Exit check: explain why actions belong beside store data and why async server-cache orchestration usually does not.

### Lesson 1.4 — TanStack Query: query keys are cache addresses

Create `apps/web/src/app/task.queries.ts`, then add the Query provider to `apps/web/src/main.tsx`.

```ts
// WHAT: Centralize cache-address construction to prevent almost-identical ad hoc keys.
export const taskKeys = {
  // WHAT: This prefix represents every cached task query for broad invalidation.
  all: ['tasks'] as const,
  // WHY: Include `filter` because it changes the server result represented by the cache.
  list: (filter: string) => [...taskKeys.all, 'list', filter] as const,
};

// BOUNDARY: Translate a UI filter into managed remote server state.
export function useTasks(filter: 'all' | 'open' | 'done') {
  // WHAT: TanStack Query owns request status, deduplication, caching, and refetching.
  return useQuery({
    // WHAT: Address exactly the list variant requested by this component.
    queryKey: taskKeys.list(filter),
    // BOUNDARY: Invoke the HTTP adapter; it must throw for non-success responses.
    queryFn: () => taskApi.list(filter),
    // WHY: Accept roughly 30 seconds of staleness for this learning product.
    refetchInterval: 30_000,
  });
}
```

The key contains every variable that changes the result. `['tasks', 'list', 'open']` and `['tasks', 'list', 'done']` are distinct cache entries. A query function must reject or throw on a non-success HTTP response; `fetch` does not do that automatically.

The root `QueryClient` sets `staleTime: 15_000`. Stale means eligible for background refetch, not deleted. Avoid global settings copied from another system; choose them from the data’s volatility and the user’s consistency expectations.

Mutations invalidate the task prefix:

```ts
// WHAT: Manage a write as a mutation rather than cached read state.
return useMutation({
  // BOUNDARY: Send the validated create input through the HTTP adapter.
  mutationFn: (input: CreateTask) => taskApi.create(input),
  // WHY: Mark every task-list variant stale after the authoritative write succeeds.
  onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
});
```

Invalidation is simple and correct. An expert optimization is an optimistic update with rollback:

```ts
// WHAT: Define the mutation together with a reversible optimistic cache update.
const mutation = useMutation({
  // BOUNDARY: The server stays authoritative even though the UI changes immediately.
  mutationFn: taskApi.update,
  // WHAT: Run immediately before the network request begins.
  onMutate: async ({ task, patch }) => {
    // WHY: Prevent an in-flight refetch from overwriting the optimistic value.
    await queryClient.cancelQueries({ queryKey: taskKeys.all });
    // WHAT: Capture all affected entries so failure can restore their exact prior data.
    const snapshot = queryClient.getQueriesData({ queryKey: taskKeys.all });
    // WHAT: Apply the patch to each task-list variant that currently exists.
    queryClient.setQueriesData({ queryKey: taskKeys.all }, (old: unknown) => {
      // WHY: Return new objects so React and cache observers detect the change.
      return patchTaskList(old, task.id, patch);
    });
    // WHAT: Make the snapshot available to the later lifecycle callbacks.
    return { snapshot };
  },
  // WHAT: Roll the cache back if the network write or concurrency check fails.
  onError: (_error, _variables, context) => {
    // WHY: Restore each entry under its original key, including every filter variant.
    context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
  },
  // CHECK: Refetch authoritative state after either success or rollback.
  onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
});
```

Only implement that after defining conflict behavior. The API’s `version` field rejects a stale update with HTTP 409; the client should refetch and tell the user rather than silently overwrite.

Lab: use React Query Devtools temporarily, change window focus, disconnect the network, and record `status` versus `fetchStatus`.

Additional exercises:

1. Add pagination to the query key, deliberately omit `offset`, observe cache aliasing, and restore a key factory that includes every result-changing input.
2. Implement completion optimistically with snapshots for all filtered lists, force a 409, and prove rollback, user feedback, and authoritative refetch.

Exit check: explain fresh, stale, inactive, invalidated, and garbage-collected query states.

### Lesson 1.5 — Polling is a consistency budget

The task list polls every 30 seconds using `refetchInterval`. Polling is acceptable when updates may be delayed, the response is inexpensive, and a 30-second convergence window meets the product requirement.

TanStack Query's polling timer is independent of `staleTime`. It pauses when the browser tab loses focus by default; `refetchIntervalInBackground: true` deliberately opts into background polling. Multiple active observers can own timers for the same query key, although concurrent in-flight requests are deduplicated at the query level. Treat those defaults as capacity inputs, not implementation trivia.

Prefer event-driven invalidation for high-frequency or low-latency changes:

```text
PostgreSQL change -> outbox/event -> WebSocket or SSE -> queryClient.invalidateQueries()
```

Do not connect a browser directly to PostgreSQL `LISTEN/NOTIFY`. The API owns database credentials, reconnect policy, authorization, fan-out, and backpressure.

Lab: first use the network panel to verify that polling pauses when the tab loses focus. Then make the interval adaptive—30 seconds while tasks are open and `false` when every task is done. Finally, write down whether this product should keep the default or explicitly enable background polling; do not add a second `visibilitychange` mechanism unless the product needs behavior that the query library does not provide.

Additional exercises:

1. Make polling adaptive—active only while an open task exists—and use the network panel to prove the timer stops and restarts correctly.
2. Add randomized jitter around the interval in a small simulation, plot request distribution for 10,000 clients, and compare the peak with synchronized polling.

Exit check: calculate requests per minute and approximate requests per second for 10,000 continuously active users at 30-second polling, then state the caching, jitter, or event-driven change you would evaluate first.

### Lesson 1.6 — Shared components without a design-system detour

Create `libs/frontend/ui/src/lib/button.tsx`, export it from the library index, and replace the starter test with an interaction test.

```tsx
// WHAT: Preserve native button attributes while adding a small visual vocabulary.
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  // WHY: A finite union prevents callers from inventing unsupported variants.
  variant?: 'primary' | 'danger' | 'secondary';
};

// WHAT: Supply safe defaults while forwarding the caller's remaining native props.
export function Button({ variant = 'primary', type = 'button', ...props }: ButtonProps) {
  // WHY: `button` avoids accidental form submission; the modifier selects styling.
  return <button type={type} className={`button button--${variant}`} {...props} />;
}
```

The library shares behavior and a small semantic API while preserving native button attributes. `type="button"` prevents an easy-to-miss form submission bug. Keep feature-specific `TaskRow` in the feature until another real consumer appears; “shared” is an ownership decision, not a folder for miscellaneous files.

Lab: add a `ConfirmButton` without using `window.confirm`, write its interaction test, and decide whether it is generic enough for the library.

Additional exercises:

1. Build an accessible `ConfirmButton` with an in-page confirmation state, then test focus movement, Escape cancellation, and keyboard activation without `window.confirm`.
2. Add a loading contract that prevents duplicate submission while preserving an accessible name, and test both mouse and keyboard interaction.

Exit check: state the accessibility contract of each shared component, including focus, keyboard, disabled, and loading behavior.

### Lesson 1.7 — Virtualize only after rendering is the bottleneck

Create `apps/web/src/pages/performance-page.tsx` only after recording the unvirtualized baseline.

```tsx
// WHAT: Create a virtual window model from the full logical row collection.
const virtualizer = useVirtualizer({
  // WHAT: Tell the model how many logical items must remain reachable by scrolling.
  count: rows.length,
  // BOUNDARY: Attach calculations to the element that owns the scroll position.
  getScrollElement: () => parentRef.current,
  // WHY: A realistic estimate creates scrollbar geometry before measurement.
  estimateSize: () => 36,
  // WHY: Render a small off-screen buffer to hide work during quick scrolling.
  overscan: 8,
});
```

The scroll container represents 10,000 logical rows, but React renders only the visible range plus eight extra rows on either side. `getTotalSize()` preserves the scrollbar geometry; each visible row is absolutely positioned at `virtualRow.start`.

Virtualization addresses DOM and rendering cost. It does not replace API pagination: downloading one million records and rendering 20 of them is still wasteful. Prefer cursor pagination for frequently changing datasets where offset pages drift.

For variable-height rows, attach `ref={virtualizer.measureElement}` and use the largest reasonable initial estimate. Stable item keys are important when rows reorder.

Lab: compare DOM node count and React Profiler commit time before and after virtualization. Test keyboard navigation and screen-reader expectations; virtualization can hide off-screen semantic content.

Additional exercises:

1. Convert the fixed rows to variable heights, attach measurement, and verify scroll position remains stable when content expands.
2. Combine cursor pagination with virtualization, load three pages, and prove the DOM stays bounded while network transfer grows only per requested page.

Exit check: state the thresholds and measurements that would justify this added complexity in your product.

## Part 2 — Node.js API engineering

### Lesson 2.1 — The composition root and separation of concerns

Return to `apps/api/src/main.ts` after creating the contracts in Lessons 2.2–2.5, then replace the starter process shell with this composition root.

```ts
// BOUNDARY: Parse environment input once and fail before the process accepts traffic.
const config = loadConfig();
// BOUNDARY: Select Prisma/PostgreSQL or Mongoose/MongoDB in exactly one place.
const persistence = createPersistence(config);
// CHECK: Fail startup before listening if credentials or connectivity are wrong.
await persistence.connect();
// WHAT: Give use-case policy only the persistence capability it requires.
const taskService = new TaskService(persistence.tasks);
// WHAT: Compose infrastructure, policy, and HTTP concerns without starting a socket yet.
const app = createApp({ config, persistence, taskService });
```

This is manual dependency injection. Construction is explicit, tests can substitute a repository, and domain behavior does not know how the process starts.

The request path is:

```text
                                                   ┌-> Prisma adapter -> PostgreSQL
router -> Zod boundary -> service -> TaskRepository┤
                                                   └-> Mongoose adapter -> MongoDB
```

- Router: HTTP translation—params, body, status, representation.
- Schema: validates untrusted input and produces a typed value.
- Service: use-case policy and domain-aware errors.
- Repository interface: the persistence capability the service requires.
- Concrete repository: database-specific queries, transactions, and persistence-to-domain mapping.
- Native escape hatch: isolated SQL or MongoDB selectors for measured, engine-specific work.

Abstraction is useful when it hides a volatile or complicated boundary. A one-line wrapper around every function is ceremony. Begin with concrete code, notice the seam, then name the interface.

Lab: implement an in-memory `TaskRepository`, inject it directly into `TaskService` tests, and run them without either database. Keep production selection limited to the composition factory; do not turn `NODE_ENV=test` into hidden behavior inside the service.

Additional exercises:

1. Add a second composition root for a CLI task importer using the same service and repository port, then verify no HTTP type enters the domain layer.
2. Replace the in-memory repository with a fault-injecting decorator and prove composition can add diagnostics without changing service policy.

Exit check: draw the import arrows. No arrow should point from a lower policy layer back into an app.

### Lesson 2.2 — CRUD and HTTP semantics

Create `libs/backend/core/src/lib/http/tasks.router.ts` after the service contract exists.

| Operation | Route                   | Successful response               |
| --------- | ----------------------- | --------------------------------- |
| Create    | `POST /api/tasks`       | `201` plus representation         |
| Read list | `GET /api/tasks`        | `200` plus data and page metadata |
| Read one  | `GET /api/tasks/:id`    | `200` or `404`                    |
| Update    | `PATCH /api/tasks/:id`  | `200`, `404`, or `409`            |
| Delete    | `DELETE /api/tasks/:id` | `204` or `404`                    |

Copy-paste smoke test:

```bash
# WHAT: Create a task and retain the server-generated representation for inspection.
TASK_JSON=$(curl -sS -X POST http://localhost:3000/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Trace one request","priority":"high"}')

# CHECK: Inspect the generated id, defaults, version, and timestamps.
echo "$TASK_JSON"
# CHECK: Exercise validated filtering and bounded list pagination.
curl -sS 'http://localhost:3000/api/tasks?limit=10&done=false'
```

Use an idempotency key for create endpoints that clients may safely retry after timeouts. The server stores the key and original result under a uniqueness constraint. Do not pretend `POST` is automatically idempotent.

Lab: add `GET /api/tasks/:id`, an ETag derived from `version`, and conditional `PATCH` using `If-Match`. Compare it with the existing version-in-body approach.

Additional exercises:

1. Implement conditional `PATCH` with ETag/`If-Match`, exercise success and stale precondition paths, and compare the contract with version-in-body.
2. Design and test an idempotency-key create flow for a simulated response timeout, including same-key/same-payload replay and same-key/different-payload conflict.

Exit check: explain why a timeout does not prove the write failed.

### Lesson 2.3 — Zod validates at trust boundaries

Create `libs/backend/core/src/lib/tasks/task.schema.ts` first. Add `config.ts` only when the in-memory slice is ready to become a configurable process.

```ts
// BOUNDARY: Parse an untrusted request body into the only accepted create shape.
export const CreateTaskSchema = z.object({
  // WHY: Normalize whitespace and enforce the same useful length bound as storage.
  title: z.string().trim().min(1).max(200),
  // WHAT: Permit omitted descriptions but bound any value the caller supplies.
  description: z.string().trim().max(2_000).optional(),
  // WHY: Reject invented priorities and assign a server-owned default.
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});
```

TypeScript types disappear at runtime. HTTP bodies, query strings, environment variables, database JSON, queue messages, and third-party responses remain untrusted.

Important trap: `z.coerce.boolean()` uses JavaScript truthiness, so the string `"false"` can surprise you. This project parses query booleans with `z.enum(['true', 'false']).transform(...)`.

Validation answers “is this shaped correctly?” Authorization answers “may this actor do it?” Domain invariants answer “is this transition allowed now?” Keep all three.

Lab: send invalid bodies and inspect the stable error envelope:

```bash
# CHECK: An empty title and unknown enum value should produce a stable 400 response.
curl -i -X POST http://localhost:3000/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"","priority":"urgent"}'
```

Additional exercises:

1. Add a `dueAt` rule that rejects past high-priority deadlines but accepts omitted values, then prove the inferred TypeScript type and runtime parser remain aligned.
2. Fuzz the list-query parser with booleans, arrays, oversized numbers, empty strings, and unknown keys; record every accepted normalized output and rejection.

Exit check: add a cross-field rule and one test that proves it runs at runtime.

### Lesson 2.4 — Prisma ORM by default; raw SQL by exception

Create `prisma/schema.prisma`, `prisma.config.ts`, and `libs/backend/core/src/lib/tasks/prisma-task.repository.ts`; none exists on the starter branch.

Prisma 7 generates a typed client into the backend library. The database URL belongs in `prisma.config.ts` for CLI operations and is also passed to the PostgreSQL driver adapter at runtime. The schema contains no credentials.

```prisma
// WHAT: Generate visible TypeScript source inside the persistence-owning library.
generator client {
  provider            = "prisma-client"
  output              = "../libs/backend/core/src/generated/prisma"
  moduleFormat        = "esm"
  // WHY: Make compiled Node ESM imports resolvable outside the API bundler.
  importFileExtension = "js"
}

// BOUNDARY: Select PostgreSQL semantics without embedding a connection URL.
datasource db {
  provider = "postgresql"
}
```

Generate after every schema change:

```bash
# CHECK: Reject an invalid model or relation before generating application types.
npm run prisma:validate
# WHAT: Rebuild the client API consumed by the backend library.
npm run prisma:generate
```

Ordinary CRUD uses Prisma Client:

```ts
// WHAT: Create one row using the generated Task input contract.
const row = await prisma.task.create({
  data: {
    title: input.title,
    // WHY: Translate an absent optional API value to explicit database null.
    description: input.description ?? null,
    priority: input.priority,
  },
});

// WHAT: Query a bounded page without assembling SQL fragments by hand.
const rows = await prisma.task.findMany({
  where: {
    done: input.done,
    title: input.q ? { contains: input.q, mode: 'insensitive' } : undefined,
  },
  // WHY: Keep output deterministic when creation timestamps collide.
  orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
  take: input.limit,
  skip: input.offset,
});
```

Prisma-generated types are persistence types, not automatically your public API contract. The repository still maps dates to ISO strings and parses the database `priority` value through Zod. That mapping detects schema drift and prevents generated ORM types from spreading through services and routers.

Keep raw SQL small and deliberate. Reopen the `plain-sql.selectors.ts` you created in Branch 05:

```ts
// SECURITY: The tagged template sends `limit` as a value parameter, not SQL text.
return prisma.$queryRaw<OpenTaskRow[]>`
  SELECT id, title, created_at
  FROM tasks
  WHERE done = false
  ORDER BY created_at DESC, id
  LIMIT ${limit}::int
`;
```

Use Prisma query methods for ordinary CRUD. Reach for TypedSQL or `$queryRaw` when a measured query, PostgreSQL-specific operator, partial-index predicate, lock clause, or reporting shape is clearer in SQL. Do not use `$queryRawUnsafe` with user-controlled input. Values can be parameters; table or column identifiers cannot, so dynamic identifiers require a fixed application allowlist.

Lab: add `sort: 'createdAt' | 'priority'` to the Zod query schema, map it to a typed Prisma `orderBy`, and compare the generated SQL/query plan with the plain selector. Do not accept an arbitrary column string.

Additional exercises:

1. Add an allowlisted sort command, implement it with typed Prisma `orderBy`, and prove arbitrary column text never reaches either ORM or raw SQL.
2. Write the same bounded selector once with Prisma and once with parameterized SQL, capture emitted SQL/plans, and justify which version remains.

Exit check: explain which layer owns the Prisma schema, generated client, domain contract, and public HTTP representation. Then demonstrate why a malicious title remains a value rather than executable SQL.

### Lesson 2.5 — One domain port, two persistence adapters

Create `task.repository.ts` and an in-memory implementation for the first E2E slice. Create the persistence lifecycle port and concrete Prisma/Mongoose files only in their later database lessons.

The service needs task persistence behavior, not an ORM. Start with the narrow domain-owned port:

```ts
// WHAT: Describe the behavior business policy requires from any task store.
export interface TaskRepository {
  // WHAT: Return the stable domain shape plus a count for pagination.
  list(input: ListTasksInput): Promise<{ data: Task[]; total: number }>;
  // WHAT: Represent ordinary absence as null at the persistence boundary.
  findById(id: string): Promise<Task | null>;
  // WHAT: Persist a validated create command and return the created domain value.
  create(input: CreateTaskInput): Promise<Task>;
  // WHY: Preserve missing-versus-version-conflict semantics across adapters.
  update(id: string, input: UpdateTaskInput): Promise<UpdateResult>;
  // WHY: Require task transition plus completion event to be one atomic unit.
  complete(id: string, version: number): Promise<UpdateResult>;
  // WHAT: Map engine-specific delete results to a simple not-found boolean.
  delete(id: string): Promise<boolean>;
}
```

Lifecycle and HTTP diagnostics need a second process-level port. It prevents the readiness and statistics endpoints from leaking `PrismaClient`:

```ts
// BOUNDARY: Own connection lifecycle and expose domain repositories as capabilities.
export interface PersistenceAdapter {
  // WHAT: Make the chosen implementation observable without exposing client methods.
  readonly kind: 'postgresql-prisma' | 'mongodb-mongoose';
  // BOUNDARY: Services receive this narrow port rather than an ORM client.
  readonly tasks: TaskRepository;
  // CHECK: Establish connectivity before traffic begins.
  connect(): Promise<void>;
  // WHAT: Release the selected driver's pool during graceful shutdown.
  disconnect(): Promise<void>;
  // CHECK: Run the adapter's smallest meaningful availability probe.
  checkReadiness(): Promise<void>;
  // WHAT: Produce one database-neutral statistics response.
  readStats(): Promise<PersistenceStats>;
}
```

Select once, at the outside edge:

```ts
// BOUNDARY: Keep the only database-client conditional in infrastructure composition.
export function createPersistence(config: AppConfig): PersistenceAdapter {
  // WHAT: Build MongoDB infrastructure only when startup configuration requests it.
  if (config.databaseClient === 'mongoose') {
    return new MongoosePersistenceAdapter(config);
  }
  // WHY: Retain Prisma/PostgreSQL as the documented default path.
  return new PrismaPersistenceAdapter(config);
}
```

Do not add `if (databaseClient === ...)` to routers or services. That creates two applications hidden inside one code path. Adapter-specific behavior belongs behind a port or in a deliberately database-specific use case.

The Mongoose model stores a string UUID rather than exposing `ObjectId`, and uses an explicit domain `version` rather than Mongoose's internal `__v`:

```ts
// WHAT: Compile a storage schema whose record maps to the shared Task contract.
const taskSchema = new Schema<MongoTaskRecord>(
  {
    // WHY: Keep ids portable across PostgreSQL, MongoDB, URLs, and client caches.
    _id: { type: String, required: true },
    // CHECK: Persisted data still has defense-in-depth constraints behind Zod.
    title: { type: String, required: true, trim: true, maxlength: 200 },
    // WHY: One explicit token defines optimistic concurrency for both adapters.
    version: { type: Number, required: true, default: 1, min: 1 },
  },
  {
    // WHAT: Store createdAt and updatedAt as native BSON dates.
    timestamps: true,
    // WHY: Do not expose a second, Mongoose-specific version authority.
    versionKey: false,
    // SECURITY: Fail early instead of buffering writes before a connection exists.
    bufferCommands: false,
  },
);
```

An atomic conditional update gives the same compare-and-swap behavior as PostgreSQL's `WHERE id = ? AND version = ?`:

```ts
// WHAT: Match the identity and the exact version observed by the caller.
const row = await Task.findOneAndUpdate(
  { _id: id, version: input.version },
  {
    // WHAT: Change only fields accepted by the validated patch command.
    $set: changes,
    // WHY: Advance the token inside the same atomic document update.
    $inc: { version: 1 },
  },
  {
    // WHAT: Return the updated representation rather than the previous document.
    new: true,
    // CHECK: Query-update validators are not enabled unless requested.
    runValidators: true,
  },
)
  // WHY: Read-only API output does not need a hydrated Mongoose document.
  .lean()
  .exec();
```

`lean()` reduces work by skipping hydration, but the returned object has no change tracking, getters, virtuals, validation, or `.save()`. Use it for read-only mappings, not when document behavior is required.

The port defines the shared minimum semantics: UUID string identity, case-insensitive literal substring search, deterministic ordering, version conflict classification, and atomic task-plus-event completion. The adapters may implement those guarantees differently. PostgreSQL constraints, joins, isolation, and partial indexes do not magically exist in MongoDB; MongoDB's document atomicity, aggregation pipeline, and change streams do not magically exist in PostgreSQL.

Make the first pass with PostgreSQL only. MongoDB topology and the Mongoose adapter are deliberately deferred to Part 3B; defining a port does not require every future implementation to exist already.

```bash
# WHAT: Start only the PostgreSQL dependency created in Lesson 0.3.
docker compose up database -d --wait
# WHAT: Apply reviewed PostgreSQL history and the idempotent learning seed from the host.
npm run db:migrate:deploy && npm run db:seed

# BOUNDARY: In terminal one, select Prisma and the host-published PostgreSQL port.
DATABASE_CLIENT=prisma \
DATABASE_URL=postgresql://app:app@127.0.0.1:5432/learning \
PORT=3000 \
npm run dev:api

# CHECK: Create through the Prisma adapter and save the public representation.
curl -sS -X POST http://localhost:3000/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Compare adapters","priority":"high"}'
```

Core lab (45 minutes): write a reusable repository contract test factory for create defaults, not-found behavior, stable list ordering, and deletion. Run the same factory once with an in-memory adapter and once with PostgreSQL.

**Deferred comparison checkpoint:** return here after Lesson 3B.3. Keep application processes on the host; Part 4 will later replace them with `api` and `api-mongo` containers.

```bash
# WHAT: Wait for the optional MongoDB process created in Lesson 3B.0.
docker compose --profile mongodb up mongodb -d --wait
# WHAT: Run its finite, idempotent topology job without attaching to the database.
docker compose --profile mongodb up mongo-setup --no-deps

# BOUNDARY: In a second terminal, select Mongoose without changing routers or services.
DATABASE_CLIENT=mongoose \
MONGODB_URL='mongodb://127.0.0.1:27017/learning?replicaSet=rs0&directConnection=true' \
PORT=3001 \
npm run dev:api

# CHECK: Repeat the same input through the still-running Prisma API.
curl -sS -X POST http://localhost:3000/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Compare adapters","priority":"high"}'

# CHECK: Create it through the Mongoose API without changing the HTTP contract.
curl -sS -X POST http://localhost:3001/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Compare adapters","priority":"high"}'
```

Senior challenge (30 minutes): add MongoDB and prove literal search containing `.*`, stable pagination under tied timestamps, and stale-version classification. Run each database in a disposable, isolated schema/database so tests do not depend on order.

Expert extension (20 minutes): add the transaction rollback contract, then split a PostgreSQL-only reporting capability into a separate port instead of weakening it to fit MongoDB. A good abstraction preserves useful guarantees; it does not force every engine into the least expressive generic CRUD API.

The test suite—not the interface name—is evidence that adapters mean the same thing. If time expires, keep the core factory passing and move database-specific capabilities to the advanced lane; do not delete semantics from the port merely to make a fake green test.

Additional exercises:

1. Build a reusable repository contract suite for defaults, literal search, stable ordering, missing records, conflicts, completion atomicity, and deletion; run it against memory and PostgreSQL.
2. Propose a PostgreSQL-only reporting port, reject adding it to generic task CRUD, and write an architecture decision explaining where the abstraction intentionally ends.

Exit check: list the exact semantic promises in `TaskRepository`, then name three useful features that deliberately remain database-specific.

### Lesson 2.6 — Concurrency: I/O parallelism is not CPU parallelism

Create a database-neutral `readStats()` capability in the persistence port, implement it in both adapters, and then add `/api/stats` to `create-app.ts`.

```ts
// WHAT: Start independent I/O operations together and await all three results.
const [taskCount, eventCount, databaseClock] = await Promise.all([
  // WHAT: Use generated model operations for ordinary aggregate queries.
  prisma.task.count(),
  prisma.taskEvent.count(),
  // CHECK: Keep one raw database-native selector rather than modelling a fake entity.
  prisma.$queryRaw<Array<{ now: Date }>>`SELECT now() AS now`,
]);
```

Use the same public shape in `persistence.ts`:

```ts
// WHAT: Keep statistics transport identical whichever engine supplies the values.
export type PersistenceStats = {
  tasks: number;
  events: number;
  databaseTime: string;
};

// Add to PersistenceAdapter:
readStats(): Promise<PersistenceStats>;
```

Implement it in the Prisma adapter using the three operations above and return:

```ts
return {
  tasks: taskCount,
  events: eventCount,
  // BOUNDARY: Convert database time to the public ISO-string contract.
  databaseTime: databaseClock[0].now.toISOString(),
};
```

Implement the equivalent in the Mongoose adapter:

```ts
if (!this.connection.db) throw new Error('MongoDB connection is not open');
// WHY: Counts and server-time lookup are independent I/O waits.
const [tasks, events, hello] = await Promise.all([
  this.models.Task.countDocuments().exec(),
  this.models.TaskEvent.countDocuments().exec(),
  // CHECK: Ask the selected server for its clock rather than using API-process time.
  this.connection.db.command({ hello: 1 }),
]);
const databaseTime = hello.localTime;
// BOUNDARY: Refuse a driver response that does not meet the public contract.
if (!(databaseTime instanceof Date)) {
  throw new Error('MongoDB hello response did not include localTime');
}
return { tasks, events, databaseTime: databaseTime.toISOString() };
```

Expose only that port capability in `createApp`:

```ts
// Extend the existing Pick with `readStats`, then add this authenticated route.
app.get('/api/stats', async (_request, response) => {
  // BOUNDARY: HTTP sees stable statistics, not either database client.
  const stats = await persistence.readStats();
  response.json({ data: { ...stats, persistence: persistence.kind } });
});
```

These queries are independent, so their waits can overlap. Neither Prisma nor Mongoose makes an unbounded workload safe: each driver still has a finite pool. `Promise.all` is fail-fast; it does not make JavaScript CPU work run on multiple cores. Unbounded `Promise.all` over thousands of inputs can exhaust connections, memory, file descriptors, or a downstream rate limit. Bound concurrency with a queue, semaphore, or worker count derived from the constrained resource.

The Node event loop handles many concurrent I/O operations efficiently when each callback does little synchronous work. Large JSON parsing, unsafe regular expressions, sync filesystem calls, and CPU-heavy loops block every request handled by that process.

Lab: introduce 200 ms of synchronous busy work into a route, load-test both `/health/live` and that route, then remove it. Observe tail latency, not only average latency.

Additional exercises:

1. Run 100 independent database reads with unbounded `Promise.all` and with a semaphore below pool size; compare throughput, tail latency, and acquisition failures.
2. Add event-loop delay monitoring, block the loop with synchronous JSON/CPU work, and correlate the delay histogram with liveness latency.

Exit check: distinguish event-loop concurrency, libuv’s worker pool, `worker_threads`, multiple Node processes, and multiple ECS tasks.

### Lesson 2.7 — Worker threads for bounded CPU work

Create `libs/backend/core/src/lib/workers/fibonacci.ts` after measuring the blocking main-thread implementation.

```ts
// WHAT: Start a separate JavaScript thread with validated, cloneable input.
const worker = new Worker(workerSource, { eval: true, workerData: input });
// WHAT: Resolve the request-facing promise after the worker posts its single result.
worker.once('message', resolve);
// BOUNDARY: Reject on worker failure so centralized HTTP error policy can respond.
worker.once('error', reject);
```

Call it:

```bash
# CHECK: Exercise the CPU-bound implementation without blocking the API event loop.
curl -sS -X POST http://localhost:3000/api/tools/fibonacci \
  -H 'content-type: application/json' \
  -d '{"n":40}'
```

Workers are useful for CPU-intensive JavaScript. They rarely improve normal database or network I/O. Creating one worker per request has startup and memory cost; a production workload should use a bounded worker pool, queue length limit, timeout, cancellation policy, and metrics.

The inline worker keeps this lesson copy-pasteable. A larger implementation should use a separate worker entry built with the app, version its message protocol, and validate messages on both sides.

Lab: compare event-loop responsiveness for Fibonacci on the main thread versus the worker. Then cap concurrent workers at the number of CPU cores available to the container.

Additional exercises:

1. Implement a two-worker pool with a bounded queue and overload rejection, then prove the worker count never exceeds the configured capacity.
2. Terminate a worker mid-task, verify the caller receives an intentional error, replace the failed worker, and prove the next task succeeds.

Exit check: explain why eight workers in a 0.25-vCPU Fargate task can reduce performance.

### Lesson 2.8 — Transactions and optimistic concurrency

The `complete` repository method performs two writes through one interactive Prisma transaction:

```ts
// BOUNDARY: Prisma pins every callback query to one transaction connection.
return prisma.$transaction(async (transaction) => {
  // WHY: `updateMany` returns count zero for either missing id or stale version.
  const updated = await transaction.task.updateMany({
    where: { id, version },
    data: {
      done: true,
      // WHAT: Advance the optimistic-concurrency token in the same statement.
      version: { increment: 1 },
      updatedAt: new Date(),
    },
  });

  // CHECK: Classify zero as missing or conflict before recording an event.
  if (updated.count === 0) return classifyMiss(transaction, id);

  // WHAT: Record the event atomically with the task transition it describes.
  await transaction.taskEvent.create({
    data: {
      taskId: id,
      eventType: 'completed',
      payload: { previousVersion: version },
    },
  });

  return transaction.task.findUniqueOrThrow({ where: { id } });
});
```

Both writes commit, or both roll back. A common ORM bug is calling the root `prisma` client inside the transaction callback; use the provided `transaction` client for every statement that belongs to the unit. Keep interactive transactions short and never wait for user input or a remote HTTP call while holding the database connection.

`WHERE version = $2` is optimistic concurrency control. Two clients reading version 3 may both attempt an update; only one increments to 4. The other receives 409 and must refetch or ask the user to reconcile.

Lab:

1. Read a task and note its version.
2. Send two different PATCH requests with that same version concurrently.
3. Verify one succeeds and one returns `VERSION_CONFLICT`.

Additional exercises:

1. Inject a failure between task update and event insert, then prove both PostgreSQL and MongoDB adapters roll back state and history.
2. Run ten two-client completion races, record success/conflict counts and final events, and fail the test if any invariant differs across runs.

Exit check: explain when you would instead use `SELECT ... FOR UPDATE` and the cost of holding that lock.

### Lesson 2.9 — Middleware order is part of the security model

Create `libs/backend/core/src/lib/http/create-app.ts` one middleware at a time in the order below:

```text
request ID + structured logging
-> security headers
-> CORS policy
-> rate limiting
-> bounded JSON parsing
-> unauthenticated health endpoints
-> API-key authentication
-> application routes
-> 404
-> centralized error handler
```

Important details:

- `helmet` sets defensive response headers.
- CORS controls which browsers may read responses; it is not authentication and does not stop curl.
- `express.json({ limit: '100kb' })` bounds memory and parsing work.
- Rate limiting needs a shared store when multiple API tasks must enforce a global policy.
- `trust proxy` must match the real proxy chain or client IP and secure-cookie logic can be wrong.
- Logs redact authorization, cookies, and API keys.
- Health endpoints remain usable by the load balancer without application credentials.

The API key is a teaching baseline, not a user identity system. A production browser app normally uses an identity provider, short-lived tokens, authorization scopes/roles, and CSRF protection when cookies are involved.

Dependency auditing also needs engineering judgment:

```bash
# CHECK: Prioritize packages shipped in the application/runtime images.
npm audit --omit=dev
# CHECK: Inspect build/test/development tooling as a separate attack surface.
npm audit
```

As verified on 21 August 2026, the production audit is clear. The full audit retains one low-severity finding in esbuild's Windows-only `serve` implementation; this repository uses Vite's server rather than esbuild's `serve` API, so the finding is recorded and monitored until Vite/Nx accept a patched esbuild range. The lockfile also contains narrow overrides for patched `deepmerge-ts` under Prisma configuration and `brace-expansion` under Nx because their current parents pin newly vulnerable releases. Prisma generation, validation, and the complete Nx checks prove compatibility, but the overrides must be removed when upstream packages adopt the fixes.

Do not run `npm audit fix --force` as a reflex: it currently proposes incompatible major/downgrade changes. Read the advisory, determine whether the vulnerable path is shipped and reachable, prefer an upstream supported version, time-box any override, and capture an owner plus removal condition.

Lab: add a request ID to the response headers and verify the same ID appears in the JSON error and server log.

Senior challenge: inspect both audit reports, trace each remaining package to its parent with `npm ls`, and write a one-paragraph risk disposition that covers reachability, affected environment, compensating control, owner, expiry, and upgrade trigger.

Additional exercises:

1. Send forged proxy headers with `trust proxy` disabled, correctly configured, and overly broad; record how client IP and rate limiting change.
2. Build a middleware-order test that proves health remains public, API routes require authentication, JSON limits run before routes, and error handling remains last.

Exit check: write a threat model covering asset, actor, entry point, control, residual risk, and monitoring signal.

### Lesson 2.10 — HTTPS and where TLS terminates

Create `apps/api/src/https-main.example.ts` as a separate learning entry; do not change the normal local/AWS entry:

```ts
// WHAT: Create an HTTPS server only for the direct-Node TLS learning variant.
createServer(
  {
    // SECRET: Load the private key at runtime; never commit it or bake it into an image.
    key: readFileSync('./certs/localhost-key.pem'),
    // WHAT: Present the matching public certificate to connecting clients.
    cert: readFileSync('./certs/localhost-cert.pem'),
    // WHY: Refuse obsolete TLS protocol versions.
    minVersion: 'TLSv1.2',
  },
  // WHAT: Reuse the same Express application behind the encrypted transport.
  app,
  // WHAT: Bind the local teaching server to the dedicated HTTPS port.
).listen(3443);
```

In the AWS architecture, ACM certificates terminate public TLS at CloudFront and the ALB. The container receives HTTP inside controlled VPC networking. End-to-end TLS from ALB to targets is possible when your risk model requires it, but then you own backend certificates and rotation.

HTTPS provides transport confidentiality, integrity, and server authentication. It does not authorize a user, validate business input, or make an insecure dependency safe. Redirect HTTP to HTTPS, use modern protocols, automate certificate renewal, and add HSTS only after confirming every relevant subdomain supports HTTPS.

Lab: generate a local development certificate with a trusted local tool, run the example entry, and inspect the negotiated protocol. Do not commit private keys.

Additional exercises:

1. Generate a local trusted certificate, run the HTTPS teaching entry, and capture certificate chain, hostname verification, and negotiated protocol.
2. Compare TLS termination at ALB with re-encryption to targets, documenting certificate ownership, rotation, health checks, latency, and threat addressed.

Exit check: draw the plaintext and encrypted segments for browser → CloudFront → ALB → ECS.

### Lesson 2.11 — Error handling and graceful lifecycle

Create `errors.ts` and `middleware.ts`, then refactor `apps/api/src/main.ts` for controlled startup and shutdown.

Expected errors have stable status and code. Unexpected errors are logged with context but return a generic message so stack traces and internals are not exposed.

Express 5 forwards rejected async route promises to the error handler. A process-level `uncaughtException` is not a place to continue normal traffic after unknown corruption; log, drain, exit, and let the orchestrator replace the task.

If a streaming or partial response has already sent headers, the custom error handler must call `next(error)` so Express's default handler can close/fail the connection correctly. Attempting to write a second JSON response produces misleading logs and cannot replace bytes already sent.

On `SIGTERM`, the API:

1. Stops accepting new connections.
2. Gives in-flight requests time to finish.
3. Calls `persistence.disconnect()` to close the selected driver pool.
4. Exits, with a hard timeout as a final bound.

Readiness and liveness are different. Liveness asks “should this process be restarted?” Readiness asks “should it receive traffic now?” A transient database outage should normally fail readiness, not cause every container to restart in a loop.

Lab: start the API, begin a deliberately slow request, send SIGTERM, and verify whether it completes before exit. Then add a test middleware that writes one response chunk before failing; prove the custom handler delegates when `response.headersSent` is true.

Additional exercises:

1. Start a slow request, send SIGTERM, and prove it finishes before pool disconnect; repeat past the shutdown deadline and capture the forced outcome.
2. Stream one response chunk and then throw, verify `headersSent` delegation closes the response correctly, and ensure no second JSON envelope is attempted.

Exit check: define retry policy by error class. Never retry validation errors; retry only known transient operations and only when idempotency is safe.

### Lesson 2.12 — File uploads to S3

Create `libs/backend/core/src/lib/http/uploads.router.ts` in two increments: proxy upload first, then presigned direct upload.

**Proxy upload through Node:**

```bash
# BOUNDARY: Stream a small multipart file through the API for the proxy-upload lesson.
curl -X POST http://localhost:3000/api/uploads \
  -F 'file=@./small-example.png'
```

Multer bounds count, size, and allowed MIME types, then the API sends the buffer with `PutObjectCommand`. This is simple for small trusted workloads but consumes API bandwidth and memory. File extensions and client MIME declarations are not proof of content; high-risk systems inspect magic bytes and scan asynchronously before making objects available.

**Presigned direct upload:**

```bash
# BOUNDARY: Ask the API to authorize one short-lived direct-to-S3 upload capability.
curl -sS -X POST http://localhost:3000/api/uploads/presign \
  -H 'content-type: application/json' \
  -d '{"fileName":"report.pdf","contentType":"application/pdf","size":12345}'
```

The API authorizes the request and returns a five-minute URL scoped to one key. The browser then `PUT`s directly to S3:

```ts
// BOUNDARY: Ask the API for a short-lived URL scoped to this file's metadata.
const { data } = await createPresignedUpload(file);
// WHAT: Transfer bytes directly from the browser to S3 instead of proxying through Node.
await fetch(data.uploadUrl, {
  // WHAT: PUT exactly one object at the key embedded in the signed URL.
  method: 'PUT',
  // WHY: The header must match the value included when the URL was signed.
  headers: { 'content-type': file.type },
  // WHAT: Use the browser File object itself as the request body.
  body: file,
});
```

The bucket stays private. The ECS task role has only the required object actions and prefix. Use random keys to prevent overwrite, configure bucket CORS for the web origin, lifecycle incomplete multipart uploads, encryption, and event-driven scanning. For large files, use multipart upload rather than buffering.

Lab: store upload metadata only after S3 confirms the object, then design cleanup for objects whose database transaction fails.

Additional exercises:

1. Validate magic bytes for every allowed type, quarantine a mismatched upload, and prove neither extension nor client MIME alone can publish it.
2. Simulate database metadata failure after S3 success, then implement and test an orphan cleanup strategy with idempotent deletion.

Exit check: explain why a presigned URL is a bearer capability and must not appear in logs.

### Lesson 2.13 — Testing by boundary: suite synthesis

Testing begins in Lesson 2.1 and travels with every behavior; this lesson assembles the suites and looks for gaps. Deferring all tests until the end would make failures harder to localize and would undermine the lab evidence. Current tests demonstrate service and shared-component isolation:

```bash
# CHECK: Run all project tests through the workspace's dependency-aware task runner.
npm test
```

Build a balanced suite:

- Unit: service policy with an in-memory or mocked repository.
- HTTP integration: `createApp` with a fake service, Supertest, and no listening socket.
- Repository integration: Prisma Client against a disposable PostgreSQL database with actual migrations.
- Contract: stable error and response shapes consumed by React.
- End-to-end: a few critical user journeys against the composed system.

Do not mock Prisma Client and call that a repository integration test. The risks are schema/client drift, constraints, mappings, transaction boundaries, timestamp/JSON types, generated SQL, and real query plans.

Lab: add a test that proves stale updates return HTTP 409 and a repository test that proves task plus event roll back together.

Additional exercises:

1. Add an HTTP contract test for stale update 409 and assert only the stable public envelope—not an implementation-specific stack or driver message.
2. Add a disposable-database integration test that proves the task/event rollback invariant and demonstrate why a mocked Prisma client would miss it.

Exit check: for every mock, state which real failure it can no longer detect.

## Part 3 — PostgreSQL from CRUD to distributed data decisions

### Lesson 3.1 — Prisma schema, database constraints, and CRUD translation

Extend the `prisma/schema.prisma` you created and generate `prisma/migrations/.../migration.sql`. The Prisma model drives generated TypeScript, while the reviewed migration adds database constraints that remain authoritative if a buggy client bypasses Zod:

```prisma
// WHAT: Give application code domain-friendly names while preserving SQL table names.
model Task {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title       String   @db.VarChar(200)
  description String?
  done        Boolean  @default(false)
  priority    String   @default("medium") @db.VarChar(10)
  // WHY: Use this integer for optimistic concurrency, not as a business revision label.
  version     Int      @default(1)
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime @default(now()) @map("updated_at") @db.Timestamptz(6)

  @@index([createdAt(sort: Desc), id], map: "idx_tasks_created_at")
  @@map("tasks")
}
```

Prisma Schema cannot express every PostgreSQL feature used here. The migration SQL deliberately adds non-blank `CHECK` constraints and partial indexes. Review generated migrations before applying them; the migration is executable production code, not disposable generator output.

CRUD translation:

| Product operation | Default application code                  | PostgreSQL concept |
| ----------------- | ----------------------------------------- | ------------------ |
| Create            | `prisma.task.create({ data })`            | `INSERT`           |
| Read one          | `prisma.task.findUnique({ where })`       | `SELECT`           |
| Read page         | `prisma.task.findMany({ ... })`           | `SELECT`           |
| Update            | `prisma.task.updateMany({ where, data })` | `UPDATE`           |
| Delete            | `prisma.task.deleteMany({ where })`       | `DELETE`           |

Connect to local PostgreSQL:

```bash
# WHAT: Open an interactive SQL session inside the local database container.
docker compose exec database psql -U app -d learning
```

Keep one copy-paste plain selector so you can reason about the actual access path without replacing the application repository:

```sql
-- WHAT: Read an intentionally bounded page of incomplete work.
SELECT id, title, done, version, created_at
FROM tasks
-- WHAT: Exclude completed tasks before sorting or applying the limit.
WHERE done = false
-- WHY: `id` makes ordering deterministic when timestamps are equal.
ORDER BY created_at DESC, id
-- WHY: Bound memory, transfer, and render work for every caller.
LIMIT 50;
```

Always add a deterministic tie-breaker such as `id` after a timestamp. Rows with equal sort values otherwise have no promised order.

Core lab (60 minutes): implement all four CRUD operations with Prisma Client, inspect one generated statement, and use `EXPLAIN (ANALYZE, BUFFERS)` on the bounded plain selector. Predict scan, row-count, and sort behavior before reading the plan.

Senior challenge (45 minutes): add `tenant_id` to every business table through a reviewed migration, include it in every repository predicate, and write a negative test that proves one tenant cannot read or mutate another tenant's task. Treat this as authorization work, not merely a schema rename.

Additional exercises:

1. Bypass the API with `psql`, attempt blank title, unsupported priority, and non-positive version writes, and record which database constraint protects each invariant.
2. Add a nullable field through an expand/backfill/enforce sequence, run old and new application shapes concurrently, and prove rollback remains possible at every stage.

Exit check: identify invariants enforced by API validation, database constraints, and authorization. Important rules often belong in more than one layer.

### Lesson 3.2 — Transactions, isolation, locks, and retries

A transaction is an atomic unit and a visibility boundary:

```sql
-- BOUNDARY: Begin the all-or-nothing visibility and durability unit.
BEGIN;

-- WHAT: Claim the state transition only if the observed version is current.
UPDATE tasks
SET done = true, version = version + 1
WHERE id = '<TASK_UUID>' AND version = 1
-- CHECK: Application policy must stop if this returns no id.
RETURNING id;

-- WHAT: Record the event in the same transaction as the state it describes.
INSERT INTO task_events (task_id, event_type)
VALUES ('<TASK_UUID>', 'completed');

-- BOUNDARY: Make both successful writes visible together; otherwise use ROLLBACK.
COMMIT;
```

PostgreSQL’s default isolation is Read Committed. Each statement sees a snapshot at the start of that statement. Higher isolation is not “free correctness”:

- **Read Committed:** good default; reason about changes between statements.
- **Repeatable Read:** stable transaction snapshot; can abort conflicting writes.
- **Serializable:** PostgreSQL detects executions that cannot be serialized and aborts one. Your application must retry the entire transaction.

Set a stronger level only for the transaction that needs it:

```ts
// WHAT: Override PostgreSQL's default for this invariant-sensitive unit only.
await prisma.$transaction(
  async (transaction) => {
    // TODO: Perform every read and write through `transaction`, never root `prisma`.
  },
  {
    // WHY: Ask PostgreSQL to reject outcomes that cannot be ordered serially.
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    // WHY: Bound both pool acquisition and time spent holding the connection.
    maxWait: 2_000,
    timeout: 5_000,
  },
);
```

At the driver level, PostgreSQL reports serialization failure `40001` and deadlock `40P01`. Prisma normalizes transaction write conflicts and deadlocks to known request error `P2034`. Retry only that known class, and retry the entire transaction callback:

```ts
// WHAT: Retry a complete transaction unit, never an arbitrary final statement.
async function retryTransaction<T>(operation: () => Promise<T>) {
  // WHY: A strict attempt cap prevents an outage from becoming an infinite retry loop.
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      // BOUNDARY: The callback must open, run, and close one whole transaction attempt.
      return await operation();
    } catch (error) {
      // WHAT: Prisma exposes retryable transaction conflicts through error `code`.
      const code = (error as { code?: string }).code;
      // WHY: Retry only P2034 and never after the final bounded attempt.
      if (code !== 'P2034' || attempt === 3) throw error;
      // WHY: Exponential delay reduces immediate repeated contention between competitors.
      await new Promise((resolve) => setTimeout(resolve, 25 * 2 ** attempt));
    }
  }
  // CHECK: TypeScript needs a terminal path although the loop returns or throws.
  throw new Error('unreachable');
}
```

Keep transactions short. Do not wait for an HTTP call, user input, or a long CPU job while holding database locks. Access rows in a consistent order to reduce deadlocks.

Lab: open two `psql` sessions, lock the same rows in opposite orders, observe PostgreSQL abort one transaction, then fix the access order.

Additional exercises:

1. Create a deadlock with two sessions locking rows in opposite order, capture PostgreSQL diagnostics, then impose a consistent access order and prove the deadlock disappears.
2. Force a serializable conflict, implement a bounded whole-transaction retry with jitter, and show that non-retryable constraint errors are attempted once.

Exit check: explain why retrying only the last SQL statement can violate a multi-statement invariant.

### Lesson 3.3 — Database polling and competing workers

Do not query a table that a hidden solution created. First extend `prisma/schema.prisma` with the durable queue model:

```prisma
// WHAT: Store retryable background work independently of a Node process lifetime.
model JobQueue {
  id          BigInt    @id @default(autoincrement())
  payload     Json
  status      String    @default("pending") @db.VarChar(20)
  attempts    Int       @default(0)
  availableAt DateTime  @default(now()) @map("available_at") @db.Timestamptz(6)
  lockedAt    DateTime? @map("locked_at") @db.Timestamptz(6)
  lockedBy    String?   @map("locked_by")
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("job_queue")
}
```

Generate `add-job-queue` with `--create-only`, then add a status check constraint (including the required comma after the preceding table constraint) and a partial polling index to the generated migration before applying it:

```bash
# WHAT: Create the reviewable migration without applying an unfinished constraint.
npx prisma migrate dev --name add-job-queue --create-only
```

```sql
-- INVARIANT: Every writer uses one supported lifecycle state.
CONSTRAINT "job_queue_status_supported"
  CHECK ("status" IN ('pending', 'processing', 'done', 'failed'))

-- WHY: Match claim eligibility and deterministic order while excluding cold history.
CREATE INDEX "idx_job_queue_poll"
  ON "job_queue"("available_at", "id") WHERE "status" = 'pending';
```

```bash
# BOUNDARY: After editing/reviewing its SQL, apply it and regenerate the client.
npx prisma migrate dev && npm run prisma:generate
```

Create `infra/postgres/advanced-lab.sql` and type its first statement, an atomic queue claim:

```sql
-- WHAT: Select a small claimable batch while locking only the chosen rows.
WITH next_jobs AS (
  SELECT id
  FROM job_queue
  -- WHAT: Ignore delayed, completed, or already-claimed work.
  WHERE status = 'pending' AND available_at <= now()
  -- WHY: Stable ordering makes the queue policy predictable under equal times.
  ORDER BY available_at, id
  -- WHY: Skip rows another worker locked instead of waiting and duplicating its work.
  FOR UPDATE SKIP LOCKED
  -- WHY: Bound transaction duration and work held by any one worker.
  LIMIT 10
)
-- WHAT: Atomically turn the selected candidates into leases owned by this worker.
UPDATE job_queue AS jobs
SET status = 'processing', locked_at = now(), locked_by = 'worker-1'
FROM next_jobs
WHERE jobs.id = next_jobs.id
-- CHECK: Process only the exact rows this statement successfully claimed.
RETURNING jobs.*;
```

`SKIP LOCKED` lets several workers claim different rows without waiting for one another. It gives an intentionally inconsistent view, which is appropriate for queue-like work but not ordinary reports.

A robust poller needs:

- A batch limit and an index matching `status`, `available_at`, and order.
- Jittered idle delay so replicas do not thump the database in sync.
- Lease timeout/recovery for workers that crash after claiming.
- Attempt count, backoff, and a dead-letter state.
- Idempotent handlers because a lease can expire after an external side effect but before completion is recorded.
- Metrics for queue age, attempts, processing duration, and failures.

PostgreSQL `LISTEN/NOTIFY` can reduce idle polling. Notifications are small, transient hints—not a durable queue. A common hybrid is: notify workers that work may exist, then query the durable table with `SKIP LOCKED`.

Lab: run two Node worker processes with different `locked_by` values and prove no job is returned twice during the same lease.

Additional exercises:

1. Run three competing claimers with distinct worker IDs, prove no active lease is shared, then crash one and recover its expired work.
2. Add attempts, exponential availability delay, and a failed/dead-letter state; graph queue age and retry count for a deliberately failing handler.

Exit check: describe the crash window between an S3 side effect and marking the job complete.

### Lesson 3.4 — Indexing: optimize measured access paths

Append this measured selector to the `advanced-lab.sql` you created, then run it:

```sql
-- WHAT: Execute the query and report planner estimates plus real I/O/runtime evidence.
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, title, created_at
FROM tasks
-- WHAT: Match the partial-index predicate used by this access path.
WHERE done = false
-- WHY: Request deterministic newest-first output.
ORDER BY created_at DESC, id
-- WHY: Bound work to the product's first-page requirement.
LIMIT 50;
```

`ANALYZE` executes the query. Do not use it casually on destructive statements in production. Read actual versus estimated rows, scan type, loops, sort method, shared buffer hits/reads, and total time.

The migration includes:

```sql
-- WHAT: Index only incomplete rows in the exact order the list query consumes them.
CREATE INDEX idx_tasks_open_created_at
ON tasks (created_at DESC, id)
-- WHY: Exclude completed history to keep this hot access path smaller and cheaper.
WHERE done = false;
```

This partial index is small when most historical tasks are done. Column order matters: equality predicates commonly lead, then range/order columns. Every index consumes storage and makes inserts/updates/deletes more expensive.

Index families and common uses:

- B-tree: equality, range, ordered scans; the default.
- GIN: arrays, `jsonb`, full-text tokens.
- GiST: ranges, geometric and specialized operator classes.
- BRIN: huge physically correlated tables such as append-only time series.
- Hash: equality only; B-tree is usually more versatile.

Advanced patterns:

```sql
-- WHAT: Build an index without blocking ordinary writes for the whole operation.
CREATE INDEX CONCURRENTLY idx_tasks_open_cover
-- WHAT: Put predicate/order columns in the searchable B-tree key.
ON tasks (created_at DESC, id)
-- WHY: Carry projected values in leaf entries without changing search order.
INCLUDE (title, priority)
-- WHY: Spend index space only on the frequently read incomplete subset.
WHERE done = false;

-- WHAT: Accelerate measured JSON containment queries over event payloads.
CREATE INDEX idx_events_payload_gin
-- WHY: `jsonb_path_ops` optimizes containment at the cost of supporting fewer operators.
ON task_events USING gin (payload jsonb_path_ops);
```

`CREATE INDEX CONCURRENTLY` reduces write blocking but takes longer, does more work, and cannot run inside a transaction block. Migration tooling must support that distinction.

Lab: capture plan and timing before the index, add it, run `ANALYZE tasks`, capture again, then remove an unused index.

Additional exercises:

1. Generate realistic cardinality and skew, compare plans before/after `ANALYZE`, and explain any estimate error large enough to change the selected scan.
2. Add a candidate index, measure read improvement plus insert/update size cost, then remove it if the recorded product query does not justify ownership.

Exit check: explain why PostgreSQL may correctly prefer a sequential scan on a small table.

### Lesson 3.5 — MVCC, vacuum, statistics, and connection pools

PostgreSQL uses multiversion concurrency control. An update creates a new row version; old versions remain until they are no longer visible and vacuum can reclaim them. Consequences:

- Long transactions retain old versions and cause bloat.
- Autovacuum is essential infrastructure, not optional cleanup.
- Statistics guide the planner; stale statistics cause bad estimates.
- “Idle in transaction” sessions are dangerous even if they are not actively querying.

Useful inspection:

```sql
-- WHAT: Find tables accumulating the most obsolete row versions.
SELECT relname, n_live_tup, n_dead_tup, last_autovacuum, last_analyze
FROM pg_stat_user_tables
-- WHY: Put the largest cleanup/statistics risk at the top of the result.
ORDER BY n_dead_tup DESC;

-- WHAT: Find open transactions and the SQL associated with them.
SELECT pid, state, now() - xact_start AS transaction_age, query
FROM pg_stat_activity
-- WHAT: Exclude sessions that have no active transaction timestamp.
WHERE xact_start IS NOT NULL
-- WHY: Oldest transactions are the first candidates for blocking cleanup.
ORDER BY xact_start;
```

Prisma 7 uses the `pg` driver adapter, so pool behavior comes from node-postgres. `createPrismaClient` sets `max` from `DATABASE_POOL_MAX`; its default here is 10 connections per process. With 20 ECS tasks, the theoretical maximum is 200. Size globally against RDS capacity and reserve connections for migrations and operations. More connections can reduce performance through memory, contention, and context switching. RDS Proxy or PgBouncer can help connection-heavy or bursty architectures, but understand transaction versus session pooling constraints.

Create one long-lived Prisma Client per Node process. Constructing one per request creates pools until PostgreSQL refuses connections. Call `$disconnect()` during graceful process shutdown, not after every query.

Lab: set `DATABASE_POOL_MAX=1`, run several concurrent slow queries, and observe acquisition wait plus the configured five-second connection timeout. Restore the bound, then verify `application_name = 'nx-learning-api'` and connection count in `pg_stat_activity`.

Additional exercises:

1. Hold an old transaction open while updating many rows, observe dead tuples and vacuum limitations, then close it and record cleanup behavior.
2. Run concurrent slow queries with pool sizes 1, 5, and 20; compare throughput, wait time, database connections, and the point where more connections hurt.

Exit check: calculate the global connection maximum for your desired ECS autoscaling range.

### Lesson 3.6 — Partitioning is not sharding

Append a range-partitioned audit-table exercise to `advanced-lab.sql`:

```sql
-- WHAT: Define one logical audit table whose physical children are time ranges.
CREATE TABLE audit_log (
  -- WHAT: Generate a monotonic local identifier for each appended event.
  id bigint GENERATED ALWAYS AS IDENTITY,
  -- BOUNDARY: Make the partition-routing timestamp mandatory.
  happened_at timestamptz NOT NULL,
  -- WHAT: Preserve flexible event detail while core routing stays relational.
  payload jsonb NOT NULL,
  -- WHY: A partitioned-table uniqueness constraint must include the partition key.
  PRIMARY KEY (id, happened_at)
-- WHAT: Route each inserted row to a child partition based on event time.
) PARTITION BY RANGE (happened_at);
```

Partitioning splits one logical table into child tables inside one PostgreSQL cluster. It is useful for very large tables, pruning by a frequent partition key, and fast retention via detached/dropped partitions. Too many partitions increase planning and maintenance overhead. Create future partitions before data arrives and define a default or explicit failure policy.

Sharding splits data across independent database nodes. It changes routing, transactions, uniqueness, joins, migrations, balancing, backup/restore, and incident response. It should follow evidence that vertical scaling, query/index work, partitioning, caching, replicas, and archival no longer meet the requirement.

A tenant shard router might begin as:

```ts
// WHAT: Deterministically choose a shard from the tenant identity.
function shardForTenant(tenantId: string, shardCount: number) {
  // WARNING: Simple modulo remaps most tenants when `shardCount` changes.
  return stableHash(tenantId) % shardCount;
}
```

Modulo routing makes adding a shard move most keys. Production systems use a shard map or consistent/rendezvous hashing, store the mapping durably, and support online movement. Keep `tenant_id` in keys so uniqueness and queries remain shard-local. Cross-shard transactions often require redesign around sagas/outbox events rather than two-phase commit.

Managed/distributed options such as Citus or application-level sharding reduce some work but do not erase distributed-systems tradeoffs.

Lab: write a sharding decision record with current data size, growth, largest query, write throughput, RTO/RPO, candidate key, reshard plan, and rejected simpler alternatives.

Additional exercises:

1. Create monthly audit partitions plus a default/future partition, insert boundary timestamps, and prove pruning with `EXPLAIN`.
2. Compare modulo, range, and directory-based tenant routing while adding a shard; calculate data movement and identify which queries lose global guarantees.

Exit check: identify one query in this task system that becomes cross-shard and how you would redesign it.

### Lesson 3.7 — Primary and read replicas

PostgreSQL streaming replication is asynchronous by default. Reads can lag behind a committed primary write. A simplistic router is:

```ts
// BOUNDARY: Create distinct ORM clients because writer and replica are distinct endpoints.
const writer = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_WRITER_URL }),
});
const reader = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_READER_URL }),
});

// WHAT: Encode consistency choice in method names instead of hiding random routing.
export const taskStore = {
  // WHY: Creation must reach the writable primary.
  create: (input: CreateTask) => writer.task.create({ data: input }),
  // WARNING: This list may omit a write that has not replayed on the replica yet.
  listEventuallyConsistent: () => reader.task.findMany(),
  // WHY: Read from the primary when the caller must immediately observe its write.
  getAfterWrite: (id: string) => writer.task.findUnique({ where: { id } }),
};
```

Two Prisma Clients mean two independent pools. Include both in the global connection budget and disconnect both during shutdown. Do not randomly send reads to a replica; make the consistency promise visible in the method/use-case name.

Choose consistency per use case:

- Read-your-writes: route the user to the primary for a bounded period or until a replica reaches a recorded WAL location.
- Dashboards and analytics: replica lag may be acceptable.
- Authorization and uniqueness decisions: use the primary unless you have a proven safe model.

Replicas improve read capacity and availability options, not write capacity. Promotion creates a new primary; clients need endpoint/failover handling. Synchronous replication improves durability at latency and availability cost.

Monitor replica replay lag in both bytes and time, and alert based on product tolerance.

Lab: simulate a stale replica in a test repository and prove the UI still shows a just-created task using mutation data or a temporary primary read.

Additional exercises:

1. Simulate replica lag after a write, route list reads to the replica and read-after-write to primary, and document the user-visible inconsistency window.
2. Design a lag-aware routing rule with a measurable threshold and fallback, then state how it affects capacity during primary or replica failure.

Exit check: state the acceptable staleness for each API read, not one number for the entire database.

### Lesson 3.8 — Migrations, backups, restore, RPO and RTO

Prisma Migrate owns the ordered migration history in `prisma/migrations`. Use different commands for authoring and deploying:

```bash
# DEV ONLY: Compare schema to a disposable development database and author reviewed SQL.
npm run db:migrate:dev -- --name add_tenant_id
# CHECK: Regenerate TypeScript after the schema changes; Prisma 7 does not do this implicitly.
npm run prisma:generate
# DEPLOY: Apply already-reviewed pending migrations without creating or resetting history.
npm run db:migrate:deploy
```

`migrate dev` may need a shadow database and may ask to reset when it detects drift. Stop and investigate before accepting a reset; never run it against production or a shared database. `migrate deploy` does not generate the client and does not detect all drift, so CI validates/generates while deployment applies reviewed history.

Production still needs an expand/contract approach:

1. Expand: add nullable column/index/table compatible with old and new code.
2. Deploy code that writes both or backfills safely.
3. Observe and validate.
4. Contract: remove old reads/column in a later deployment.

Avoid one deployment that renames a hot column and requires every instance to switch simultaneously.

Some PostgreSQL capabilities—partial indexes, `CHECK` constraints with expressions, trigger functions, or concurrent index creation—need hand-edited migration SQL. Keep the Prisma model as close as it can be, annotate the database-specific SQL, and run drift checks in a disposable environment. `CREATE INDEX CONCURRENTLY` cannot run in a transaction, so isolate it in deployment tooling that supports a non-transactional migration.

Logical backup lab:

```bash
# WHAT: Create a compressed custom-format logical backup without local ownership metadata.
pg_dump --format=custom --no-owner \
  postgresql://app:app@localhost:5432/learning \
  --file=learning.dump

# WHAT: Create an independent target so the restore does not endanger the source database.
createdb learning_restore
# CHECK: Restore the backup into that target and surface any incompatible object errors.
pg_restore --clean --if-exists --no-owner \
  --dbname=learning_restore learning.dump
```

A backup is not proven until a restore is tested. RPO is acceptable data loss measured in time. RTO is acceptable time to restore service. RDS automated backups and point-in-time recovery still require restore drills, access checks, dependency recovery, and an application-level validation plan.

Additional exercises:

1. Restore a backup into an isolated database, apply the validation suite, record actual recovery time, and compare it with the declared RTO.
2. Rehearse a migration rollback decision after data has been written in the new shape; document when roll-forward is safer than schema reversal.

Exit check: write the exact restore owner, frequency, target account/region, validation query, RPO, and RTO.

## Part 3B — MongoDB and Mongoose comparative labs

Complete the PostgreSQL lessons first. These labs are comparative: implement the same product contract in a document database, identify where the guarantees align, and keep engine-specific capabilities explicit. Do not translate SQL syntax word-for-word or conclude that one database is universally better.

### Lesson 3B.0 — Extend your Compose file with a MongoDB replica-set profile

Outcome: add MongoDB to the `compose.yaml` you created in Lesson 0.3 without starting it for PostgreSQL-only work. Build topology setup explicitly rather than receiving a finished replica set.

#### Exercise 3B.0A — Add an optional MongoDB process

Extend the file you already wrote; do not replace it with a combined answer. The new service must meet this design brief:

| Decision you must encode | Required result                                                                    | Reason to annotate                                            |
| ------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Service identity         | `mongodb` beside `database`                                                        | It becomes the network DNS name used by other containers      |
| Optional lifecycle       | A profile named `mongodb`                                                          | PostgreSQL-only work should not consume MongoDB resources     |
| Image                    | MongoDB 8.0                                                                        | The adapter and server exercises use the same supported major |
| Process arguments        | Start `mongod` in replica-set mode as set `rs0`, reachable on container interfaces | Transactions and change streams need replica-set APIs         |
| Host boundary            | Publish 27017 only for the current host-run API and shell lessons                  | This mapping can disappear after application containerization |
| Persistence              | Mount a new named volume `mongo-data` at MongoDB's data directory                  | Data must outlive container replacement                       |

Add a comment before each property and update the existing top-level volume map without deleting `postgres-data`.

Type this new service beside `database`, then extend your existing top-level `volumes` map:

```yaml
services:
  # ...keep the PostgreSQL service you already built.
  # WHAT: Provide the optional document database used by the Mongoose lessons.
  mongodb:
    # WHY: Do not start MongoDB during PostgreSQL-only work.
    profiles: ['mongodb']
    # WHY: Pin the server major used by the compatibility exercises.
    image: mongo:8.0
    # WHAT: Enable the replica-set APIs required by transactions and change streams.
    command: ['mongod', '--replSet', 'rs0', '--bind_ip_all']
    # BOUNDARY: Publish only while the Mongoose API and shell run on the host.
    ports:
      - '27017:27017'
    # WHY: Preserve document data when the current container is replaced.
    volumes:
      - mongo-data:/data/db

volumes:
  # ...keep the `postgres-data` declaration you already wrote.
  # WHAT: Declare MongoDB state independently of the container lifecycle.
  mongo-data:
```

Do not paste either ellipsis. Merge the shown additions into the file you produced in Lesson 0.3.

Prove that the profile is optional:

```bash
# CHECK: Starting the default project should not create MongoDB.
docker compose up database -d
docker compose ps
# CHECK: Enabling the profile should add the MongoDB service to the resolved model.
docker compose --profile mongodb config --services
# WHAT: Start only the new database process before it has replica-set configuration.
docker compose --profile mongodb up mongodb -d
# CHECK: Confirm the server runs but has not necessarily elected a primary yet.
docker compose --profile mongodb exec mongodb \
  mongosh --quiet --eval 'db.adminCommand({ hello: 1 })'
```

The `--replSet` flag enables replica-set mode; it does not initiate members or wait for an election. Process configuration and topology configuration are separate responsibilities.

#### Exercise 3B.0B — Add a truthful process health check

Author a process health check without copying the final YAML. It must run `mongosh` directly, suppress ordinary shell noise, and evaluate a MongoDB `ping` command. Begin with a 5-second interval, 3-second timeout, and 20 retries. Comment why this probe proves command acceptance but does not yet prove that replica-set election completed.

Add this block inside `mongodb` as a sibling of `command`, `ports`, and `volumes`:

```yaml
# CHECK: Prove the server accepts commands before administrative setup runs.
healthcheck:
  # WHAT: Execute a cheap ping with the shell included in the image.
  test: ['CMD', 'mongosh', '--quiet', '--eval', "db.adminCommand('ping').ok"]
  # WHY: Give startup enough time without hiding a failure for minutes.
  interval: 5s
  # WHY: Bound each shell attempt.
  timeout: 3s
  # WHY: First initialization can be slower than a warm restart.
  retries: 20
```

This probe answers “can the server accept a command?” It does not promise that a writable primary exists. Replica readiness will be proven by the one-shot topology setup.

#### Exercise 3B.0C — Write idempotent replica initialization

Create `infra/mongodb/init-replica-and-indexes.js` yourself. Write its algorithm before its syntax:

1. Ask for replica-set status.
2. If and only if the set is not initialized, initiate `rs0` with one member whose advertised address is `mongodb:27017`.
3. Poll the `hello` command until the member reports that it is writable.
4. Bound the loop to roughly one minute and sleep between attempts.
5. Throw when the deadline expires so Compose receives a non-zero exit.
6. Run the script twice without reinitializing or destroying the existing set.

Comment every branch with its idempotency or failure purpose. First use the MongoDB shell documentation to identify `rs.status`, `rs.initiate`, `db.adminCommand`, and `sleep`; then type and compare your attempt with the annotated implementation below.

Implement the algorithm in `infra/mongodb/init-replica-and-indexes.js`:

```javascript
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
```

Type it rather than downloading it. Then explain why the catch handles only the expected uninitialized state in a hardened version instead of swallowing every administrative error.

Next, author a one-shot `mongo-setup` Compose service. It must:

- belong to the same optional profile as `mongodb`;
- use the matching MongoDB image so `mongosh` is available;
- invoke your script through a direct connection to the uninitialized member;
- mount only `infra/mongodb` into a read-only setup path;
- depend on MongoDB's healthy process state;
- remain successfully exited instead of restarting.

Before running it, predict the service's expected final state and exit code. Do not continue until `docker compose config` shows the dependency and read-only mount you intended.

Add this service beside `database` and `mongodb`:

```yaml
services:
  # ...keep the services you already built.
  # WHAT: Initialize replica topology as a finite, observable operation.
  mongo-setup:
    # WHY: Setup belongs to the same optional path as MongoDB.
    profiles: ['mongodb']
    # WHAT: Reuse the matching image so `mongosh` is available.
    image: mongo:8.0
    # WHAT: Run your script against the member before replica discovery is ready.
    command:
      - mongosh
      - mongodb://mongodb:27017/admin?directConnection=true
      - --quiet
      - --file
      - /setup/init-replica-and-indexes.js
    # BOUNDARY: Make administrative source readable but not writable.
    volumes:
      - ./infra/mongodb:/setup:ro
    # WHY: Do not run topology commands before MongoDB accepts commands.
    depends_on:
      mongodb:
        condition: service_healthy
    # WHY: Exit zero is successful finite work, not a process to restart.
    restart: 'no'
```

Again, merge the block into your cumulative file and omit the ellipsis line.

Run it twice to prove idempotency:

```bash
# WHAT: Start the member and wait for its process-health contract.
docker compose --profile mongodb up mongodb -d --wait
# WHAT: Run the finite topology job in the foreground without attaching to MongoDB.
docker compose --profile mongodb up mongo-setup --no-deps
# CHECK: The one-shot service should exit successfully after a primary is elected.
docker compose --profile mongodb ps -a
docker compose --profile mongodb logs mongo-setup
# WHAT: Recreate only setup; a second run must not destroy or reinitialize the set.
docker compose --profile mongodb up mongo-setup --no-deps --force-recreate
# CHECK: Prove the member is writable and named `rs0`.
docker compose --profile mongodb exec mongodb \
  mongosh --quiet --eval 'const h=db.adminCommand({hello:1}); printjson({setName:h.setName,isWritablePrimary:h.isWritablePrimary})'
```

#### Exercise 3B.0D — Connect the host API without containerizing it

Run the alternative composition on a different host port:

```bash
# BOUNDARY: Select Mongoose only at process composition; routes and services stay unchanged.
PORT=3001 \
DATABASE_CLIENT=mongoose \
MONGODB_URL='mongodb://127.0.0.1:27017/learning?replicaSet=rs0&directConnection=true' \
npm run dev:api

# CHECK: Readiness now proves Mongoose can reach a writable replica-set member.
curl -i http://localhost:3001/api/health/ready
# CHECK: Exercise the same public contract used by the PostgreSQL process.
curl -i 'http://localhost:3001/api/tasks?limit=2'
```

Do not add `api-mongo` yet. That service depends on the application image you will build in Part 4. The one-member set provides transaction/change-stream APIs for learning, not production redundancy.

Core lab evidence: keep the profile comparison, MongoDB health transition, first successful election, successful second setup run, and Mongoose readiness response.

Senior challenge: change the member host incorrectly to `localhost:27017`, capture the discovery failure from the host and container perspectives, then restore `mongodb:27017` and explain why replica-set member addresses must be reachable by clients.

Additional exercises:

1. Run the setup job before MongoDB is ready, capture its finite failure, then restore the health dependency and prove idempotent success twice.
2. Advertise an unreachable replica-set member hostname, compare host and container discovery failures, then restore Compose DNS and explain the topology contract.

Exit check: explain the difference between starting `mongod` with replica-set mode, initiating replica-set configuration, electing a writable primary, and providing multiple members for availability.

### Lesson 3B.1 — Document modelling and layered validation

Create `mongoose.models.ts` against the domain schema you already own; do not change the HTTP schema to accommodate Mongoose.

MongoDB stores BSON documents; Mongoose adds schemas, casting, middleware, validation, model methods, and query construction in Node. The task document is intentionally flat because the current API reads and writes a task as one aggregate. The completion event stays in a separate collection because it grows independently and is queried as history.

Three boundaries validate for different reasons:

| Boundary      | Tool                       | Purpose                                                        |
| ------------- | -------------------------- | -------------------------------------------------------------- |
| HTTP/config   | Zod                        | Reject untrusted input and produce a typed application command |
| Adapter/model | Mongoose schema            | Cast and validate writes made through Mongoose                 |
| Database      | MongoDB indexes/validators | Protect data from every writer, not only this Node process     |

Mongoose validation is middleware. It is useful defense in depth, but it does not replace Zod's public error contract or MongoDB-level enforcement. Query updates require `runValidators: true`, and update validation has different context and scope from validating a hydrated document before `.save()`.

Add a database collection validator as an advanced exercise:

```javascript
// BOUNDARY: Run this against the `learning` database as an administrative change.
db.runCommand({
  // WHAT: Modify the existing collection's database-owned validation rules.
  collMod: 'tasks',
  validator: {
    // CHECK: Reject documents that violate these required persisted fields.
    $jsonSchema: {
      bsonType: 'object',
      required: ['_id', 'title', 'done', 'priority', 'version'],
      properties: {
        // WHY: Keep identity compatible with the shared UUID-string contract.
        _id: { bsonType: 'string' },
        // WHY: The database protects the enum even if another writer bypasses Mongoose.
        priority: { enum: ['low', 'medium', 'high'] },
        // WHY: Optimistic concurrency tokens are positive integers.
        version: { bsonType: 'int', minimum: 1 },
      },
    },
  },
  // CHECK: Strict mode rejects invalid future writes rather than only logging them.
  validationAction: 'error',
  validationLevel: 'strict',
});
```

Be careful: Mongoose normally stores JavaScript integer numbers as BSON doubles unless you explicitly use an integer schema type or driver BSON value. Inspect the real stored type before pasting `bsonType: 'int'`; adapt the validator to the chosen representation. This is the lesson: TypeScript `number`, Mongoose `Number`, and BSON numeric types are not identical contracts.

Lab: type the schema yourself, add one invalid write through the Mongoose model and one through `mongosh`, then explain which boundary rejected each. Decide whether description belongs embedded on the task or in its own collection by analysing access and update patterns, not by applying a normalization slogan.

Additional exercises:

1. Write invalid data through Mongoose and the native driver, then add a collection validator and compare which boundary rejects each attempt.
2. Model task comments once embedded and once referenced; estimate document growth, atomic update scope, and query count before choosing with an ADR.

Exit check: explain why Mongoose schema validation cannot protect data written by a different client that connects directly to MongoDB.

### Lesson 3B.2 — CRUD, lean reads, and native selectors

Open a shell:

```bash
# WHAT: Start the optional services you built and rerun idempotent topology setup.
docker compose --profile mongodb up mongodb mongo-setup -d
# WHAT: Open `mongosh` directly against the learning database.
docker compose --profile mongodb exec mongodb mongosh learning
```

Use native CRUD before hiding it behind Mongoose:

```javascript
// WHAT: Insert one document with the same public identity and defaults as the API.
db.tasks.insertOne({
  _id: '11111111-1111-4111-8111-111111111111',
  title: 'Trace native Mongo CRUD',
  description: null,
  done: false,
  priority: 'medium',
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// WHAT: Read a projection rather than transferring every stored field.
db.tasks
  .find(
    // WHAT: Select incomplete tasks; selectors are structured data objects.
    { done: false },
    // WHY: Return only fields required by this inspection.
    { _id: 1, title: 1, version: 1, createdAt: 1 },
  )
  // WHY: Apply the same deterministic order promised by the repository.
  .sort({ createdAt: -1, _id: 1 })
  // WHY: Bound the work and response for this page.
  .limit(10);

// WHAT: Change the task only if version 1 is still current.
db.tasks.updateOne(
  { _id: '11111111-1111-4111-8111-111111111111', version: 1 },
  {
    $set: { done: true, updatedAt: new Date() },
    $inc: { version: 1 },
  },
);

// CHECK: A second version-1 attempt reports `matchedCount: 0`.
db.tasks.updateOne({ _id: '11111111-1111-4111-8111-111111111111', version: 1 }, { $set: { title: 'Stale change' }, $inc: { version: 1 } });

// WHAT: Delete by the same stable string id used in the route.
db.tasks.deleteOne({ _id: '11111111-1111-4111-8111-111111111111' });
```

The normal adapter uses Mongoose for casting, validation, schemas, and discoverability. `plain-mongo.selectors.ts` retains a small native-driver example:

```ts
// BOUNDARY: `.collection()` deliberately bypasses Mongoose casting and middleware.
return (
  connection.db
    .collection<MongoTaskRecord>('tasks')
    .find(
      // WHAT: BSON selectors remain data; no query string is concatenated.
      { done: false, createdAt: { $gte: since } },
      // WHY: Projection limits fields crossing the database boundary.
      { projection: { _id: 1, title: 1, createdAt: 1 } },
    )
    // WHY: Match the index order and make timestamp ties stable.
    .sort({ createdAt: -1, _id: 1 })
    // WHY: A validated cap prevents accidental unbounded scans/transfers.
    .limit(limit)
    .toArray()
);
```

Native selectors are not automatically safe merely because they are objects. Never merge an untrusted request object directly into a MongoDB filter; allowlist fields/operators and build the filter from a parsed command. For text substring search, escape regular-expression metacharacters before creating `$regex`, and enforce a length limit to reduce regex denial-of-service risk.

`lean()` returns plain objects and avoids Mongoose document hydration. Measure before applying it everywhere, and do not call `.save()` or expect getters, virtuals, defaults-on-read, or document middleware on lean results.

Core lab (35 minutes): implement the bounded `list()` with `.lean()`, add a literal search for `.*`, and prove the input does not become an attacker-controlled regular-expression operator or unbounded selector.

Senior challenge (30 minutes): implement the read once with hydrated documents and once with `.lean()`, then benchmark heap allocation and latency on 10,000 documents. Warm both paths, repeat the samples, and record environment and variance; a single timing is not a benchmark.

Additional exercises:

1. Benchmark hydrated and lean list reads over 10,000 documents with warm-up and repeated samples; compare latency, heap allocation, and lost document behavior.
2. Attempt literal searches containing `.*`, brackets, anchors, and backslashes, then prove the repository escapes metacharacters and enforces a bounded input length.

Exit check: name what Mongoose casting/middleware you lose when using `connection.db.collection()` and why that escape hatch belongs inside an adapter.

### Lesson 3B.3 — Atomic documents, optimistic concurrency, and transactions

MongoDB writes to one document atomically. The version-filtered update therefore needs no multi-document transaction. Completing a task also inserts a separate event, so that use case does need a transaction to preserve the repository contract.

Implement `MongooseTaskRepository.complete()` only after ordinary MongoDB CRUD passes the shared contract:

```ts
// BOUNDARY: Let Mongoose begin, commit/abort, and retry supported transient failures.
await connection.transaction(async (session) => {
  // WHAT: Claim the state transition with one id-and-version conditional update.
  const task = await Task.findOneAndUpdate(
    { _id: id, version },
    {
      $set: { done: true, updatedAt: new Date() },
      $inc: { version: 1 },
    },
    // WHY: Every operation in the unit must receive the same session.
    { new: true, runValidators: true, session },
  ).lean();

  // CHECK: Stop before the event write when the id/version did not match.
  if (!task) return;

  // WHAT: Array form plus the session inserts the event in this transaction.
  await TaskEvent.create([{ taskId: id, eventType: 'completed', payload: { previousVersion: version } }], { session });
});
```

Multi-document transactions require a replica set or sharded cluster; that is why Compose initializes `rs0`. Reads in a transaction route to the primary, and uncommitted writes remain invisible outside the transaction. Do not use `Promise.all` inside a MongoDB transaction; operations on one transaction session must be sequenced. Keep the callback short and never wait for a remote API or user interaction.

Transactions are not a substitute for document design. If two fields always change together and share a lifecycle, embedding them in one aggregate may preserve the invariant with a cheaper single-document update. Do not embed unbounded event history into a task document: the aggregate would grow forever and create write contention.

Core lab (30 minutes): temporarily throw after the task update and before event insertion, then verify both changes roll back. Also run two version-filtered completions and prove only one succeeds.

Instructor demonstration or senior challenge (20 minutes): use a separate disposable standalone `mongod` to observe that the multi-document transaction is rejected. Do not reconfigure the shared summit database or ask another pair to repair its topology.

Additional exercises:

1. Run two same-version document updates concurrently, prove one match and one conflict without a transaction, and inspect the final version.
2. Throw after the task update inside the completion transaction, prove no event or update commits, and repeat the same contract against PostgreSQL.

Exit check: distinguish MongoDB single-document atomicity, optimistic concurrency, and a multi-document transaction.

### Lesson 3B.4 — Indexes and query-plan evidence

The setup script creates two task indexes:

```javascript
// WHY: Equality on `done` comes first, followed by the requested sort keys.
db.tasks.createIndex({ done: 1, createdAt: -1, _id: 1 }, { name: 'tasks_done_created_at_id' });

// WHY: A second access path supports pages that omit the optional done predicate.
db.tasks.createIndex({ createdAt: -1, _id: 1 }, { name: 'tasks_created_at_id' });
```

Index field order matters. Compound indexes support queries using their prefixes; equality fields commonly precede sort and range fields. One broad index does not serve every filter/sort permutation.

Inspect evidence:

```javascript
// CHECK: Ask MongoDB for actual execution statistics, not only a winning-plan guess.
db.tasks.find({ done: false }).sort({ createdAt: -1, _id: 1 }).limit(50).explain('executionStats');
```

Read `winningPlan`, `totalKeysExamined`, `totalDocsExamined`, `nReturned`, and whether a blocking `SORT` appears. A highly selective covered query can examine few documents; a low-selectivity boolean still may benefit because the index supplies order and avoids scanning completed rows. Measure with realistic cardinality.

The case-insensitive unanchored `$regex` used for human substring search will not be efficiently served by the listed B-tree indexes. At scale, use a product-appropriate search design such as a normalized prefix field, MongoDB text index with its limitations, or managed search. Do not add random indexes until writes and cache pressure degrade.

Mongoose can auto-create declared indexes at application startup. That is convenient locally but risky in production because builds can add significant load. This project disables `autoIndex` in production and creates indexes through explicit deployment setup.

Lab: drop `tasks_done_created_at_id`, capture execution statistics, recreate it, and compare. Then add a sort on `priority`; predict whether the current index can provide it before reading the plan.

Additional exercises:

1. Compare `executionStats` with no index, a wrong-order index, and the final compound index using realistic selectivity and stable sort.
2. Add a redundant index deliberately, measure storage and write amplification, then remove it and document the detection/removal signal.

Exit check: justify each index with a query, measured plan, write/storage cost, owner, and removal signal.

### Lesson 3B.5 — Polling, change streams, and durable processing

Polling MongoDB follows the same product questions as polling PostgreSQL: acceptable staleness, cursor correctness, backoff, jitter, idempotency, and load. A timestamp alone is not a safe cursor when values can tie; use `(updatedAt, _id)` and make the predicate match the order.

Change streams are available on replica sets and sharded clusters and expose real-time changes without tailing the oplog directly:

```ts
// BOUNDARY: Subscribe only to task changes this worker understands.
const stream = Task.watch(
  [
    {
      // WHAT: Ignore deletes and unrelated operation types for this exercise.
      $match: { operationType: { $in: ['insert', 'update', 'replace'] } },
    },
  ],
  {
    // WHY: Ask MongoDB for the current document after update events.
    fullDocument: 'updateLookup',
  },
);

// WHAT: Consume changes sequentially so one process does not create unbounded work.
for await (const change of stream) {
  // TODO: Validate the change shape and submit idempotent work to a bounded handler.
  await handleTaskChange(change);
  // TODO: Persist a resume token only after the side effect reaches its safe checkpoint.
}
```

A change stream is not automatically your durable business queue. You still need resume-token storage, restart behavior, retention-window planning, idempotency, backpressure, poison-event policy, monitoring, and a decision about what happens when the consumer falls behind the oplog history.

Lab: watch tasks in one terminal, update through the API in another, then restart the watcher using a retained resume token. Compare this with polling `updatedAt/_id` and list the failure windows of each.

Additional exercises:

1. Resume a change stream from a persisted token after process restart, then invalidate the token and document recovery without silent event loss.
2. Build a polling worker with durable checkpoints and compare duplicate handling, latency, and operational ownership with the change-stream version.

Exit check: explain when an outbox plus broker is more appropriate than processing a change stream directly.

### Lesson 3B.6 — Replication, read preference, and consistency

The Compose topology has one member, so it teaches replica-set APIs but provides no redundancy. A production replica set normally has multiple voting members placed to tolerate the failures in your availability target.

Key controls:

- Write concern describes the acknowledgement/durability level required before a write succeeds.
- Read concern describes the consistency/isolation properties of a read.
- Read preference selects which replica-set members may serve reads.
- Retryable writes and transaction retries help only for supported transient failures and still require idempotent product behavior around ambiguous outcomes.

Reading from secondaries can return stale data. Do not route authorization, uniqueness, or read-after-write decisions to a secondary just because the method is a read. Name eventual-consistency methods explicitly and measure replication lag against the product's tolerance.

Core design exercise (20 minutes): classify task creation, list pages, authorization checks, and post-write reads by acceptable staleness. Encode that choice in repository/use-case names or a short decision record rather than silently routing every read to a secondary.

Advanced topology lab (60–90 minutes, separate environment): expand the local topology to three members, pause a secondary, and observe lag and election behavior. Run a just-created-task read with primary versus secondary preference. This is an instructor-prepared breakout or take-home exercise because it changes shared infrastructure. Do not call it complete until the application reports what consistency it promises.

Additional exercises:

1. Step down the primary during writes, capture driver selection/retry behavior, and distinguish an acknowledged failure from an unknown outcome.
2. Route an analytics read to a secondary, measure lag, and prove authorization or read-after-write paths remain on consistency-appropriate settings.

Exit check: state the write concern, read concern, and read preference for task creation, list pages, and authorization checks.

### Lesson 3B.7 — Sharding is a data-distribution design

MongoDB sharding distributes a collection across shards through a shard key. It is not the same as replica sets: replica sets provide copies and failover; sharding partitions data and write/read load. Each shard is normally a replica set.

A shard key affects routing, balance, write distribution, query fan-out, uniqueness options, and future resharding cost. Evaluate:

- Cardinality: too few values prevent useful distribution.
- Frequency: a dominant value creates an oversized/hot chunk.
- Monotonicity: a steadily increasing key can focus inserts on one range.
- Query targeting: requests without shard-key predicates may scatter to every shard.
- Tenant isolation: a tenant-prefixed compound key can target tenants but may create hot large tenants.
- Zone requirements: geography or compliance constraints need deliberate placement.

Do not shard this tiny learning application. First exhaust query design, indexes, document shape, hardware, archiving, and read scaling. Sharding adds routers, config servers, balancing, operational failure modes, and cross-shard transaction cost.

Lab: propose two shard keys for a multi-tenant version of tasks—`{ tenantId: 1, _id: 1 }` and a hashed alternative. For five query patterns, mark targeted versus scatter/gather and predict the hottest tenant behavior. Compare the result with PostgreSQL application-level sharding from Lesson 3.6.

Additional exercises:

1. Evaluate tenant ID, task ID, and creation time as shard keys using cardinality, frequency, monotonicity, targeting, and hottest-chunk evidence.
2. Simulate adding a shard to a simple router, calculate remapping, and design a resharding/dual-read migration with rollback.

Exit check: explain why a replica set does not increase write capacity and why a random hashed key can harm range queries.

### Lesson 3B.8 — Schema evolution, backup, and adapter choice

MongoDB's flexible schema moves migration work; it does not remove it. Old and new document shapes can coexist, so readers must be backward compatible during an expand/migrate/contract rollout:

1. Expand readers to accept old and new shapes.
2. Deploy writers that emit the new shape.
3. Backfill in bounded, resumable batches with metrics.
4. Tighten database validators only after old shapes are gone.
5. Remove compatibility code in a later deployment.

Never run an unbounded backfill inside API startup. Version documents when transformations are ambiguous, and make every batch idempotent.

Backup exercise with MongoDB Database Tools installed:

```bash
# WHAT: Export a compressed archive from the local replica-set member.
mongodump \
  --uri='mongodb://127.0.0.1:27017/learning?replicaSet=rs0&directConnection=true' \
  --archive=learning-mongo.archive \
  --gzip

# WHAT: Restore into a separate database name so the source remains untouched.
mongorestore \
  --uri='mongodb://127.0.0.1:27017/learning_restore?replicaSet=rs0&directConnection=true' \
  --archive=learning-mongo.archive \
  --gzip \
  --nsFrom='learning.*' \
  --nsTo='learning_restore.*'
```

Restore verification must check collection counts, representative documents, indexes, validators, application reads, permissions, RPO, and RTO. An archive file that has never restored successfully is only a backup claim.

Choose the adapter from product evidence:

| Concern                     | PostgreSQL/Prisma tendency                           | MongoDB/Mongoose tendency                              |
| --------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| Highly relational rules     | Strong joins, constraints, relational transactions   | Model aggregates carefully; cross-collection costs     |
| Flexible aggregate shape    | JSON is available but relational model stays central | Native documents and nested aggregate updates          |
| Ad hoc relational reporting | SQL ecosystem and joins are a natural fit            | Aggregation pipelines; denormalization may be required |
| Single-aggregate atomicity  | Transaction or one relational statement              | Atomic document updates are a core modelling primitive |
| Horizontal distribution     | Often extension/service/application-level design     | Built-in sharded-cluster architecture                  |

This table is a starting hypothesis, not a benchmark. Team expertise, managed-service constraints, data volume, access patterns, failure tolerance, compliance, migration cost, and operational ownership decide the result.

Final lab: run the same repository contract suite against both databases, then write a one-page architecture decision record selecting one for this task product. Include rejected alternatives and the evidence that would cause you to revisit the choice.

Additional exercises:

1. Add a new optional field with mixed old/new documents, write a tolerant read plus backfill, and prove both application revisions operate during rollout.
2. Restore MongoDB data into an isolated database, run the shared contract and count checks, and compare achieved recovery time with PostgreSQL.

Exit check: explain why having two adapters is valuable for learning but often unnecessary operational complexity in one production service.

## Part 4 — Docker and container configuration

### Lesson 4.1 — Audit the container primitives you already built

Outcome: connect Docker's vocabulary to evidence from the PostgreSQL and MongoDB services you created, before building either application image.

- **Image:** immutable filesystem/configuration layers, such as `postgres:18-alpine`, used to create containers.
- **Container:** one running isolated process created from an image; replacing it does not mutate the image.
- **Service:** Compose's desired configuration for one kind of process; a service can be recreated as different containers.
- **Volume:** state whose lifecycle is independent of a particular container.
- **Network:** connectivity and DNS boundary created by Compose for the project.
- **Port publication:** an explicit host-to-container mapping; it is not required for service-to-service traffic.

At this point, your learner-built file should contain only `database`, `mongodb`, and `mongo-setup`. It must not contain `migrate`, `api`, `api-mongo`, or `web`, because their images do not exist yet.

#### Exercise 4.1A — Map desired state to runtime objects

```bash
# CHECK: Render the desired configuration independently of runtime state.
docker compose --profile mongodb config
# CHECK: List actual containers created for this Compose project.
docker compose --profile mongodb ps -a
# CHECK: List images and distinguish a reusable image id from a container id.
docker compose --profile mongodb images
# CHECK: Resolve the project-scoped network created automatically by Compose.
docker network ls --filter label=com.docker.compose.project
# CHECK: Resolve the named volumes created for each database lifecycle.
docker volume ls --filter label=com.docker.compose.project
```

Create a small evidence table with desired service, image, current container, network, published port, volume, health contract, and owner.

#### Exercise 4.1B — Prove DNS and port-boundary behavior

Inside the PostgreSQL container, `localhost:5432` reaches its own PostgreSQL process. Later, the API container must use `database:5432`, because `localhost` inside the API means the API container itself. The host API still uses `127.0.0.1:5432` through the published port.

```bash
# CHECK: Inspect the Compose network aliases assigned to the PostgreSQL container.
docker inspect --format '{{json .NetworkSettings.Networks}}' \
  "$(docker compose ps -q database)"
# WHAT: Temporarily remove `ports` from the database service and reconcile it.
docker compose up database -d
# CHECK: An in-container query still works without a host-published port.
docker compose exec database psql -U app -d learning -c 'select 1;'
# CHECK: The host API readiness should now fail because its host route was removed.
curl -i http://localhost:3000/api/health/ready
```

Restore the database port until the API itself becomes a Compose service in Lesson 4.3.

Core lab: draw host, project network, three current services, published ports, and volumes. Annotate which names are meaningful from the host and which are meaningful only inside the Compose network.

Additional exercises:

1. Inspect the same service with `docker compose config`, `docker inspect`, and a process listing; map desired configuration to the resulting runtime object and process.
2. Remove a published database port, prove container-to-container DNS still works, and capture why the host API/client loses reachability.

Exit check: explain image versus container, service versus container, volume versus bind mount, internal port versus published port, and why container DNS removes a need for database port publication later.

### Lesson 4.2 — Multi-stage images and build context

Outcome: create both Dockerfiles yourself, measure the first result, then separate build and runtime concerns. On the workshop branch, `apps/api/Dockerfile`, `apps/web/Dockerfile`, `apps/web/nginx.conf`, and `.dockerignore` begin absent.

#### Exercise 4.2A — Bound the build context first

Create `.dockerignore` before the first build. Derive its entries rather than copying a finished list. It must exclude at least these categories:

- version-control metadata;
- Nx's machine-local cache;
- host-installed dependencies;
- ignored environment configuration;
- previously compiled `dist` directories;
- local test-output directories.

For each pattern, write a comment that states whether the goal is secrecy, reproducibility, context size, or cache correctness. Use `du` and Docker's transferred-context output to prove the file changed the build input.

Type this initial `.dockerignore`:

```dockerignore
# SECURITY: Git history and metadata are not application build inputs.
.git
# WHY: Local Nx caches are machine-specific and can be large.
.nx
# WHY: Reinstall dependencies from the lockfile inside the build environment.
node_modules
# SECURITY: Never allow ignored local configuration into image layers.
.env
# WHY: Reproduce compiled output rather than copying stale host artifacts.
**/dist
# WHY: Test evidence belongs in CI artifacts, not application images.
**/test-output
```

```bash
# CHECK: Measure the repository before ignore rules so the reduction is explicit.
du -sh .
# CHECK: Ask Docker to show transferred context size during a plain-progress build later.
docker build --progress=plain -f apps/api/Dockerfile -t nx-learning-api:first .
```

Do not add `*.md` blindly if the build or release process consumes documentation. Ignore rules are an input contract, not a generic cleanup list.

#### Exercise 4.2B — Build a deliberately simple API image

Create `apps/api/Dockerfile` with one deliberately naive stage. Work from this ordered behavior list, not from completed Dockerfile syntax:

1. Select the Node 24 Alpine base used by the workspace.
2. Choose one deterministic workspace directory.
3. Copy the bounded context into it.
4. Reproduce dependencies from the lockfile with `npm ci`.
5. Generate Prisma Client using a syntactically valid placeholder URL that is not a real secret.
6. Run the API's production Nx build target.
7. Start the compiled `apps/api/dist/main.js` entry directly with Node.

Add a teaching comment before every instruction. Use the Dockerfile reference to choose the instruction for each behavior, and predict which unnecessary files the image will contain before building it.

Now implement that baseline in `apps/api/Dockerfile`:

```dockerfile
# WHAT: Begin with the same Node major used by the workspace and CI.
FROM node:24-alpine
# WHAT: Make every following relative path deterministic.
WORKDIR /workspace
# WHAT: Copy the bounded repository context for the first measurable attempt.
COPY . .
# WHY: Reproduce the exact dependency graph recorded in package-lock.json.
RUN npm ci
# WHAT: Generate Prisma Client without embedding a deploy-time credential.
RUN DATABASE_URL=postgresql://unused:unused@localhost:5432/unused npx prisma generate
# WHAT: Produce the API's optimized output through its Nx target.
RUN npx nx build api --configuration=production
# BOUNDARY: Start the compiled process directly, not through a dev wrapper.
CMD ["node", "apps/api/dist/main.js"]
```

This is intentionally inefficient. Do not optimize it before recording its context, layers, and size; you need a baseline to make the next lesson measurable.

Build it, record size and history, and predict why it contains source, tests, compilers, Prisma CLI, and development packages:

```bash
# WHAT: Build the intentionally unoptimized baseline.
docker build -f apps/api/Dockerfile -t nx-learning-api:first .
# CHECK: Record the baseline size before claiming a multi-stage improvement.
docker image inspect nx-learning-api:first --format '{{.Size}}'
# CHECK: Attribute bytes to the Dockerfile instruction that created them.
docker history nx-learning-api:first
```

Run it once with the learner-built database service. On macOS/Windows Docker Desktop, `host.docker.internal` reaches the host-published database; this is only an intermediate experiment. The final Compose service uses `database` DNS.

```bash
# WHAT: Run the first image with explicit disposable development configuration.
docker run --rm -p 3002:3000 \
  -e HOST=0.0.0.0 \
  -e PORT=3000 \
  -e DATABASE_CLIENT=prisma \
  -e DATABASE_URL=postgresql://app:app@host.docker.internal:5432/learning \
  -e CORS_ORIGINS=http://localhost:4200 \
  -e AWS_REGION=eu-central-1 \
  nx-learning-api:first
```

On Linux, do not assume that special hostname exists; use `--add-host=host.docker.internal:host-gateway` for this intermediate drill or continue directly to Compose networking.

#### Exercise 4.2C — Split dependency, migration, build, and runtime concerns

Refactor the same file rather than copying the reference wholesale. The intended stages are:

```text
dependencies ─┬─> migration
              └─> build ─> runtime
```

Author the stages from this contract. Complete and inspect one row before implementing the next:

| Stage          | Inputs it may contain                                                              | Work it performs                                        | Output/command you must prove                                          |
| -------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `dependencies` | Root npm/Nx/TypeScript manifests plus all four project `package.json` files        | Run deterministic dependency installation               | A reusable layer invalidated by lockfile changes, not source edits     |
| `migration`    | Dependency stage, Prisma configuration, schema, and migration history              | No application compilation                              | Default command applies reviewed migrations without demo seed data     |
| `build`        | Dependency stage plus the bounded repository source                                | Generate Prisma Client and run the production API build | Compiled API output exists at the path Nx actually emits               |
| `runtime`      | Fresh Node 24 Alpine base, production manifests/dependencies, compiled output only | Set production mode and discard build tooling/source    | Unprivileged `node` user, documented port 3000, exec-form Node command |

Before typing each stage, write its allowed-files list. Use `COPY --from` only after you can explain which earlier filesystem it reads. Then replace the baseline with the following stages, typing and building one named target at a time:

```dockerfile
# WHAT: Install the exact workspace dependency graph in a reusable stage.
FROM node:24-alpine AS dependencies
# WHAT: Give every later relative path a predictable workspace root.
WORKDIR /workspace
# WHY: Copy dependency metadata before source so source edits reuse this layer.
COPY package.json package-lock.json nx.json tsconfig.json tsconfig.base.json ./
# WHAT: Preserve project-level metadata required by npm workspaces.
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY libs/backend/core/package.json libs/backend/core/package.json
COPY libs/frontend/ui/package.json libs/frontend/ui/package.json
# WHY: Reproduce the lockfile exactly and fail when it has drifted.
RUN npm ci

# WHAT: Create a finite image that owns migration execution.
FROM dependencies AS migration
# WHAT: Copy Prisma CLI configuration without unrelated source.
COPY prisma.config.ts ./
# WHAT: Include schema, reviewed history, and the learning seed file.
COPY prisma ./prisma
# BOUNDARY: Apply reviewed history by default; local Compose may append its seed.
CMD ["npx", "prisma", "migrate", "deploy"]

# WHAT: Compile the backend with build tools confined to this stage.
FROM dependencies AS build
# WHAT: Add source only after the dependency layer can be reused.
COPY . .
# WHY: Regenerate from checked-in schema so a stale client cannot compile.
RUN DATABASE_URL=postgresql://unused:unused@localhost:5432/unused npx prisma generate
# WHAT: Produce the API's optimized Nx output.
RUN npx nx build api --configuration=production

# BOUNDARY: Start fresh so source and compilers do not enter runtime.
FROM node:24-alpine AS runtime
# WHAT: Disable development-only runtime behavior.
ENV NODE_ENV=production
# WHAT: Use an application-owned runtime working directory.
WORKDIR /app
# WHY: Reproduce only the runtime dependency graph from manifests.
COPY package.json package-lock.json ./
# WHAT: Preserve workspace metadata required by the production install.
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY libs/backend/core/package.json libs/backend/core/package.json
COPY libs/frontend/ui/package.json libs/frontend/ui/package.json
# WHY: Omit development and optional packages, then remove npm's cache.
RUN npm ci --omit=dev --omit=optional && npm cache clean --force
# WHAT: Copy only compiled output from the build stage.
COPY --from=build /workspace/apps/api/dist ./dist
# SECURITY: Drop root privileges before accepting network requests.
USER node
# WHAT: Document the listener; Compose or ECS publishes it.
EXPOSE 3000
# WHAT: Use exec form so Node receives termination signals directly.
CMD ["node", "dist/main.js"]
```

After each stage works, explain its inputs, cache invalidation trigger, output, and what must not cross into the next stage.

Verify every stage instead of waiting for the final build:

```bash
# CHECK: Prove the dependency stage can reproduce the workspace independently.
docker build --target dependencies -f apps/api/Dockerfile -t nx-learning-api:dependencies .
# CHECK: Prove the one-shot migration target contains schema history and the Prisma CLI.
docker build --target migration -f apps/api/Dockerfile -t nx-learning-api:migration .
# CHECK: Build the final runtime only after both prerequisite stages work.
docker build -f apps/api/Dockerfile -t nx-learning-api:local .
# CHECK: Confirm the runtime metadata declares the unprivileged Node user.
docker image inspect nx-learning-api:local --format '{{json .Config.User}}'
# CHECK: Compare size and history against `nx-learning-api:first`.
docker image inspect nx-learning-api:first nx-learning-api:local \
  --format '{{.RepoTags}} {{.Size}}'
docker history nx-learning-api:local
```

Nx workspaces can declare project-level package metadata, so the checkpoint copies all four project manifests before `npm ci`; omitting them can produce an incomplete dependency graph. The placeholder URL is used only because Prisma CLI configuration validates URL shape during client generation; `prisma generate` does not connect, and no real credential enters an image layer. Compose will override the migration command to run the idempotent learning seed after migration; the AWS one-shot task keeps the production command and never seeds demo rows.

`npm ci` is deterministic against the lockfile. The build toolchain stays out of the final application filesystem except for runtime production dependencies. The API runs as a non-root user. `.dockerignore` prevents `.git`, secrets, local dependencies, and build artifacts from bloating or leaking into the build context.

#### Exercise 4.2D — Build the web artifact and runtime separately

Create `apps/web/Dockerfile` without adapting the API file line for line. It must have:

1. A Node 24 dependency stage whose cache boundary is the same set of root and project manifests used by the API.
2. A build stage that adds source and runs the production Nx target for `@nx-fullstack-learning/web`.
3. A fresh Nginx 1.29 Alpine runtime with no Node toolchain or source.
4. A cross-stage copy from the actual web build output into Nginx's document root.
5. A copy of the configuration you will author next into the default virtual-host location.
6. Port 8080 documented as image metadata rather than published inside the Dockerfile.

Comment each instruction and verify the emitted Nx path on the host before deciding the cross-stage source path.

Then type `apps/web/Dockerfile`:

```dockerfile
# WHAT: Install the workspace graph used to compile browser assets.
FROM node:24-alpine AS dependencies
# WHAT: Use the same deterministic monorepo working directory as the API build.
WORKDIR /workspace
# WHY: Copy dependency metadata before source to preserve the install cache.
COPY package.json package-lock.json nx.json tsconfig.json tsconfig.base.json ./
# WHAT: Preserve project-level metadata required by npm workspaces.
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY libs/backend/core/package.json libs/backend/core/package.json
COPY libs/frontend/ui/package.json libs/frontend/ui/package.json
# WHY: Reproduce the lockfile exactly inside the build environment.
RUN npm ci

# WHAT: Compile browser assets with build tools confined to this stage.
FROM dependencies AS build
# WHAT: Add source only after the dependency layer can be reused.
COPY . .
# WHAT: Emit fingerprinted static files through the Nx production target.
RUN npx nx build @nx-fullstack-learning/web --configuration=production

# BOUNDARY: Serve static output without Node, npm, Nx, or source code.
FROM nginx:1.29-alpine AS runtime
# WHAT: Replace the default virtual host with the configuration you will write.
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
# WHAT: Copy only compiled output from the build stage.
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html
# WHAT: Document the internal listener; Compose publishes it later.
EXPOSE 8080
```

Create `apps/web/nginx.conf` incrementally rather than writing its final form:

1. Define one server listening on 8080, rooted at Nginx's static document directory, with `index.html` as its index.
2. Build and prove `/` works while `/architecture` initially fails. Keep that failure transcript.
3. Add SPA fallback only to the general location, then prove `/architecture` resolves to the entry document.
4. Add a more specific `/assets/` location that returns a real 404 for missing files and gives fingerprinted files a one-year immutable cache policy.
5. Give the entry document a revalidation policy so it can discover new asset filenames.
6. Defer `/api/` proxying until the API service exists in Lesson 4.3.

Implement steps 1–2 with only the outer server directives first. After recording the expected direct-route failure, add the two location blocks shown below:

```nginx
# WHAT: Define the one local virtual server used by the web container.
server {
  # WHAT: Listen on the internal port published later by Compose.
  listen 8080;
  # WHAT: Accept any local Host value in this learning environment.
  server_name _;
  # WHAT: Serve the compiled files copied by the Docker build.
  root /usr/share/nginx/html;
  # WHAT: Resolve directory requests to the SPA entry document.
  index index.html;

  # WHY: Fingerprinted assets may be cached because content changes rename them.
  location /assets/ {
    # CHECK: Missing assets remain real 404 responses, never the SPA shell.
    try_files $uri =404;
    # WHAT: Allow browsers and CDNs to retain immutable content for one year.
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # BOUNDARY: Let React Router handle paths that are not physical files.
  location / {
    # WHAT: Serve a real file first, otherwise return the SPA entry document.
    try_files $uri /index.html;
    # WHY: Revalidate the entry document so it points at current asset names.
    add_header Cache-Control "no-cache";
  }
}
```

Type the block and explain each directive. Add `/api/` only in Lesson 4.3 so this file grows in the same order as the running system.

The web runtime is Nginx, not a Node development server. Fingerprinted assets receive long immutable caching; `index.html` does not, so it can point at the latest filenames.

```bash
# WHAT: Build the static-site runtime after both files have been written.
docker build -f apps/web/Dockerfile -t nx-learning-web:local .
# WHAT: Run the isolated web image before Compose owns it.
docker run --rm -p 8080:8080 nx-learning-web:local
# CHECK: The root and a direct client route should both return the entry document.
curl -I http://localhost:8080/
curl -I http://localhost:8080/architecture
# CHECK: A nonexistent fingerprinted asset must remain a 404.
curl -I http://localhost:8080/assets/missing.js
```

For higher supply-chain assurance:

- Pin base images by digest and update them with automation.
- Generate and retain an SBOM/provenance attestation.
- Scan OS and language packages.
- Sign images and enforce trusted registries.
- Rebuild frequently; a clean scan today is not permanent.

Core lab (45 minutes): build both final images and retain a table containing initial context size, final context size, baseline API image size, final API image size, largest layer, runtime user, command, and listening port. Prove the web image serves `/` and a direct React route while returning 404 for a missing fingerprinted asset.

Senior challenge (20 minutes): build twice after changing only one TypeScript source file, then after changing `package-lock.json`. Use the plain build output to explain exactly when the dependency layer is reused and invalidated. Generate an SBOM and identify one component that exists in the build stage but not the runtime filesystem.

Additional exercises:

1. Build with and without `.dockerignore`, record context bytes, build duration, layer cache reuse, and any sensitive/unnecessary file that entered the larger context.
2. Scan the runtime image, run it as the declared non-root user with a read-only filesystem, and resolve one finding without adding a package manager to runtime.

Exit check: explain why stage separation, a bounded context, deterministic dependency installation, an unprivileged user, and exec-form `CMD` solve different problems. Find the largest runtime layer and decide whether reducing it materially improves pull time or attack surface.

### Lesson 4.3 — Add migration, API, web, and hardening one service at a time

Outcome: finish `compose.yaml` by adding one responsibility at a time. After every addition, render the model, run only the new dependency chain, introduce one failure, and save evidence. Do not paste the final file as one block: its ordering guarantees are the lesson.

#### Exercise 4.3A — Add a one-shot migration service

An API replica must not race other replicas to alter production schema during startup. Author a separate `migrate` service using the Dockerfile target you proved in Lesson 4.2. It must satisfy this contract:

- Build from the repository root, the API Dockerfile, and specifically its `migration` stage.
- Receive a PostgreSQL URL whose host is the Compose service name, never host loopback.
- Apply reviewed migrations first and run the idempotent learning seed only if migration succeeds.
- Wait for the database's healthy condition, not merely container creation.
- Exit zero after finite work and never enter an automatic restart loop.

Write the service without looking ahead. Comment the build context, target, URL boundary, chained command, dependency condition, and restart policy. Then use the commands below as the grader.

Add this service beside the database services already in your file:

```yaml
services:
  # ...keep the database services you already built.
  # WHAT: Apply reviewed schema history before any API replica starts.
  migrate:
    # WHAT: Build the purpose-specific stage from the shared API Dockerfile.
    build:
      # WHY: Nx needs the repository root as its dependency-aware context.
      context: .
      # WHAT: Select the Dockerfile you created in Lesson 4.2.
      dockerfile: apps/api/Dockerfile
      # WHY: Keep Prisma CLI and migration files out of the API runtime stage.
      target: migration
    # BOUNDARY: Reach PostgreSQL through Compose DNS, not host loopback.
    environment:
      DATABASE_URL: postgresql://app:app@database:5432/learning
    # WHAT: Seed only after migration succeeds; `&&` preserves that ordering.
    command: ['sh', '-c', 'npx prisma migrate deploy && npx prisma db execute --file prisma/seed.sql']
    # WHY: Process existence is insufficient; wait for authenticated readiness.
    depends_on:
      database:
        condition: service_healthy
    # WHY: Exit zero is successful finite work, not a process to restart.
    restart: 'no'
```

Merge the service into your cumulative file and omit the ellipsis line.

Run the service in the foreground first so its finite lifecycle is visible:

```bash
# CHECK: Validate keys, interpolation, dependency names, and the merged model first.
docker compose config --quiet
# WHAT: Build and run only the migration dependency chain.
docker compose up migrate --build --abort-on-container-exit --exit-code-from migrate
# CHECK: A stopped migration container with exit code zero is the expected outcome.
docker compose ps -a
docker compose logs migrate
# CHECK: Prove migration history, not only the command's exit code.
docker compose up database -d --wait
docker compose exec database psql -U app -d learning \
  -c 'select migration_name, finished_at from _prisma_migrations order by finished_at;'
```

Failure drill: misspell the database service name in `DATABASE_URL`, predict the error and exit code, capture it, then restore the DNS name. A retry is safe only because migration history and the learning seed are idempotent.

#### Exercise 4.3B — Add the Prisma API and its health contract

Add the application only after migration completion can be expressed in Compose. Author the `api` service from this acceptance matrix:

| Concern          | Required behavior                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Build            | Use the repository root and your API Dockerfile's final runtime stage                            |
| Process          | Production mode, listen on all container interfaces, internal port 3000                          |
| Composition      | Select Prisma only through `DATABASE_CLIENT`; routers and services do not change                 |
| Database         | Use `database:5432`, not `localhost`, in the PostgreSQL URL                                      |
| Browser boundary | Permit the local web origin on port 8080; configure an AWS region without access keys            |
| Host boundary    | Publish port 3000 for local contract and direct health checks                                    |
| Ordering         | Depend on successful completion of `migrate`, not just its start                                 |
| Health           | Invoke `/api/health/ready` using Node already in the image; bound interval, timeout, and retries |
| Process hygiene  | Enable a minimal init process                                                                    |
| Filesystem       | Make the root filesystem read-only and provide only an in-memory `/tmp` write location           |

Write one explanatory comment for every property. Choose the exact Compose syntax from the official build, environment, health-check, dependency, and filesystem references. Do not proceed until `docker compose config` proves the resolved build path, dependency condition, port, and tmpfs.

Now add the service:

```yaml
services:
  # ...keep every service already built.
  # WHAT: Run the production API artifact with the Prisma adapter selected.
  api:
    # WHAT: Build the Dockerfile's final runtime stage.
    build:
      # WHY: The API consumes libraries elsewhere in the Nx workspace.
      context: .
      # WHAT: Select the API-specific multi-stage build.
      dockerfile: apps/api/Dockerfile
    # BOUNDARY: Supply environment-specific configuration at container creation.
    environment:
      # WHAT: Disable development-only library behavior.
      NODE_ENV: production
      # WHY: Listen beyond container loopback so the project network can connect.
      HOST: 0.0.0.0
      # WHAT: Keep the internal listener explicit.
      PORT: 3000
      # WHAT: Select Prisma only at the process composition root.
      DATABASE_CLIENT: prisma
      # BOUNDARY: Reach PostgreSQL by service DNS rather than localhost.
      DATABASE_URL: postgresql://app:app@database:5432/learning
      # SECURITY: Allow only the local web origin to read browser responses.
      CORS_ORIGINS: http://localhost:8080
      # WHAT: Configure AWS clients without embedding access-key credentials.
      AWS_REGION: eu-central-1
    # BOUNDARY: Publish direct access for local health and contract tests.
    ports:
      - '3000:3000'
    # WHY: Never serve against unapplied schema history.
    depends_on:
      migrate:
        condition: service_completed_successfully
    # CHECK: Test database-aware readiness using Node already in the image.
    healthcheck:
      test: ['CMD', 'node', '-e', "fetch('http://127.0.0.1:3000/api/health/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
      # WHAT: Probe frequently enough for a responsive local lab.
      interval: 5s
      # WHY: Bound one hung HTTP attempt.
      timeout: 3s
      # WHY: Allow driver startup before declaring failure.
      retries: 10
    # WHY: Forward signals and reap orphaned child processes.
    init: true
    # SECURITY: Reject undeclared writes to the runtime filesystem.
    read_only: true
    # WHAT: Restore only the intentional scratch path in memory.
    tmpfs:
      - /tmp
```

Merge it into the existing `services` map and omit the ellipsis line.

```bash
# WHAT: Reconcile the API and every dependency it declares.
docker compose up api --build -d --wait
# CHECK: Prove process liveness, dependency readiness, and real CRUD separately.
curl -i http://localhost:3000/api/health/live
curl -i http://localhost:3000/api/health/ready
curl -sS http://localhost:3000/api/tasks
# CHECK: Confirm Node runs as the image's unprivileged user.
docker compose exec api id
# CHECK: Prove an undeclared filesystem write is blocked.
docker compose exec api sh -c 'touch /app/should-fail'
```

The last command should fail. That failure is evidence of the boundary, not a broken lab. Then change only `DATABASE_URL` to point at `localhost`: readiness should become unhealthy because `localhost` inside `api` means the API container, not PostgreSQL. Restore `database` and save the health transition.

#### Exercise 4.3C — Add the reverse proxy and web service

First extend `apps/web/nginx.conf` with an API location you author yourself. It must:

- match `/api/` before the general SPA location;
- proxy to the `api` service on its internal port;
- preserve the complete original `/api/...` URI;
- use HTTP/1.1 upstream connections;
- forward the original host, append the forwarding-address chain, and report the observed scheme.

Research how a trailing URI on `proxy_pass` changes path rewriting, predict both forms, and choose the form that preserves the API prefix. Comment every directive with the proxy-boundary information it carries.

Add this location before the general `/` location in `apps/web/nginx.conf`:

```nginx
  # BOUNDARY: Keep browser API calls same-origin and forward them internally.
  location /api/ {
    # WHAT: Resolve the API by Compose service DNS and preserve the request URI.
    proxy_pass http://api:3000;
    # WHAT: Use persistent HTTP/1.1 upstream connections.
    proxy_http_version 1.1;
    # WHAT: Preserve the browser-visible authority for policy and logs.
    proxy_set_header Host $host;
    # WHAT: Append the client and proxy chain rather than replacing it.
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # WHAT: Forward the scheme observed at this proxy boundary.
    proxy_set_header X-Forwarded-Proto $scheme;
  }
```

The indentation assumes the block is inside the `server` you wrote in Lesson 4.2.

Then author the `web` Compose service from these requirements:

1. Build the web Dockerfile from the root Nx context.
2. Publish the Nginx listener as the single browser-facing host port 8080.
3. Wait for the API's healthy condition during initial creation.
4. Use a read-only root filesystem.
5. Provide in-memory writable paths only for the Nginx cache and runtime-state directories.

Render the resolved model and draw the browser → Nginx → API network path before starting the service.

Then add the web service to your cumulative Compose file:

```yaml
services:
  # ...keep every service already built.
  # WHAT: Serve the React artifact and proxy same-origin API requests.
  web:
    # WHAT: Build the Nginx runtime created in Lesson 4.2.
    build:
      # WHY: Nx needs frontend source and its shared library in the root context.
      context: .
      # WHAT: Select the web-specific multi-stage build.
      dockerfile: apps/web/Dockerfile
    # BOUNDARY: Expose the single browser-facing local entry point.
    ports:
      - '8080:8080'
    # WHY: Wait for initial API readiness before creating the web container.
    depends_on:
      api:
        condition: service_healthy
    # SECURITY: Static assets and configuration must not mutate at runtime.
    read_only: true
    # WHAT: Give Nginx only its required ephemeral writable paths.
    tmpfs:
      - /var/cache/nginx
      - /var/run
```

Omit the ellipsis line and preserve your earlier services.

```bash
# WHAT: Build and start the complete default dependency graph.
docker compose up web --build -d --wait
# CHECK: Verify the browser entry, direct SPA routing, and API proxy boundary.
curl -I http://localhost:8080/
curl -I http://localhost:8080/architecture
curl -i http://localhost:8080/api/health/ready
curl -sS http://localhost:8080/api/tasks
# CHECK: Prove a missing asset remains a real 404 rather than returning index.html.
curl -I http://localhost:8080/assets/missing.js
```

Compose uses API health to order initial creation. It does not restart the web container or provide runtime failover if the API later becomes unhealthy; orchestration, load-balancer health, retry, and user-error policy remain separate concerns.

#### Exercise 4.3D — Add the optional Mongoose API

Only after the default stack works, author `api-mongo` behind the MongoDB profile. Begin by comparing it to `api` and write down what is allowed to change.

Only these persistence and host-boundary decisions should differ:

- profile membership becomes `mongodb`;
- `DATABASE_CLIENT` selects Mongoose;
- the database URL uses `mongodb:27017`, database `learning`, replica set `rs0`, and the direct-connection option required by this one-member Docker topology;
- host port 3001 maps to the same internal API port so both adapters can run together;
- startup depends on successful completion of `mongo-setup`.

Build definition, production/listener configuration, CORS, AWS region, readiness probe, init behavior, read-only root, and `/tmp` policy must remain equivalent to `api`. Do not duplicate by blind copy/paste: compare the rendered services and explain every intentional difference.

After making that comparison, add the alternate service:

```yaml
services:
  # ...keep every service already built.
  # WHAT: Run the same API artifact with the Mongoose composition selected.
  api-mongo:
    # WHY: Keep this comparative path outside normal PostgreSQL startup.
    profiles: ['mongodb']
    # WHAT: Reuse the exact production API build.
    build:
      # WHY: The Mongoose adapter lives in the shared backend library graph.
      context: .
      # WHAT: Select the already-proved API Dockerfile.
      dockerfile: apps/api/Dockerfile
    # BOUNDARY: Change persistence only at the process composition root.
    environment:
      # WHAT: Disable development-only library behavior.
      NODE_ENV: production
      # WHY: Listen beyond container loopback so the project network can connect.
      HOST: 0.0.0.0
      # WHAT: Keep the internal listener identical to the Prisma API.
      PORT: 3000
      # WHAT: Select Mongoose without changing routers or services.
      DATABASE_CLIENT: mongoose
      # BOUNDARY: Reach the named replica-set member through service DNS.
      MONGODB_URL: mongodb://mongodb:27017/learning?replicaSet=rs0&directConnection=true
      # SECURITY: Keep browser-origin policy identical across adapters.
      CORS_ORIGINS: http://localhost:8080
      # WHAT: Configure AWS clients without embedding access-key credentials.
      AWS_REGION: eu-central-1
    # BOUNDARY: Keep both adapters available on different host ports.
    ports:
      - '3001:3000'
    # WHY: Wait for topology initialization, not only the MongoDB process.
    depends_on:
      mongo-setup:
        condition: service_completed_successfully
    # CHECK: Apply the same readiness contract to the alternate adapter.
    healthcheck:
      test: ['CMD', 'node', '-e', "fetch('http://127.0.0.1:3000/api/health/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
      # WHAT: Probe frequently enough for a responsive local lab.
      interval: 5s
      # WHY: Bound one hung HTTP attempt.
      timeout: 3s
      # WHY: Allow replica discovery before declaring failure.
      retries: 10
    # WHY: Keep process and filesystem policy identical across adapters.
    init: true
    # SECURITY: Reject undeclared runtime filesystem writes.
    read_only: true
    # WHAT: Restore only the intentional scratch path in memory.
    tmpfs:
      - /tmp
```

Omit the ellipsis line. Run `docker compose --profile mongodb config` and compare the resolved `api` and `api-mongo` properties before starting either one.

```bash
# CHECK: The default model still excludes every profiled MongoDB service.
docker compose config --services
# CHECK: The selected profile now includes MongoDB, setup, and the alternate API.
docker compose --profile mongodb config --services
# WHAT: Reconcile only the optional adapter and its declared dependencies.
docker compose --profile mongodb up api-mongo --build -d --wait
# CHECK: Compare the public readiness and CRUD contracts side by side.
curl -i http://localhost:3000/api/health/ready
curl -i http://localhost:3001/api/health/ready
curl -sS http://localhost:3000/api/tasks
curl -sS http://localhost:3001/api/tasks
```

Do not make `web` depend on both APIs. The default product route still targets `api`; `api-mongo` is an explicitly selected comparative implementation.

#### Exercise 4.3E — Classify configuration and prove startup failure

Configuration enters through environment variables and is validated once at startup. `.env.example` documents names without real secrets; ignored `.env` files are local conveniences, not deployment mechanisms.

Create an evidence table for every variable used above with these columns: name, purpose, public configuration, sensitive configuration, workload identity, owner, source in local Compose, source in ECS, and rotation/restart behavior.

Rules:

- Never bake credentials into an image or pass secrets as Docker build arguments.
- Prefer workload identity—IAM task roles on ECS—over access keys.
- Fetch or attach sensitive values from Secrets Manager or Parameter Store.
- Give each selected adapter only its own database URL; unused secrets expand blast radius.
- Rotate secrets and document whether the process must restart to observe the new value.
- Keep environment-specific configuration outside the immutable image.

```bash
# WHAT: Resolve the final model and inspect it before distributing the file.
docker compose config
# WHAT: Temporarily remove a required variable and recreate the dependency chain.
docker compose up api --force-recreate --abort-on-container-exit --exit-code-from api
# CHECK: Startup validation must fail before the process accepts traffic.
docker compose ps -a api
docker compose logs api
```

For the failure drill, remove `DATABASE_URL` from the service or make a new lab-only variable required in the startup Zod schema. Do not type a production secret into `docker compose config`: rendered configuration can expose values to terminals, logs, and captured evidence. Restore the variable and prove `docker compose up web -d --wait` becomes healthy again.

Core lab (90 minutes): build all four new responsibilities in order—migration, Prisma API, Nginx/web, optional Mongoose API. For each, keep its rendered configuration, expected lifecycle, success probe, deliberate failure, diagnostic evidence, and recovery proof.

Senior challenge (30 minutes): after the complete system works, remove both database `ports` mappings. Prove containerized APIs still work through Compose DNS while host-run APIs and host database clients no longer have a route. Add explicit CPU and memory limits, justify the values with a load test, then verify graceful termination under those limits.

Additional exercises:

1. Make the migration job fail, prove the API and web do not become ready, capture logs/state, then fix the migration and recover without recreating database data.
2. Remove host database ports after containerization, run both Prisma and optional Mongoose profiles, and prove only intended web/API ports remain published.

Exit check: recreate the dependency graph from memory and explain why database health, migration completion, API readiness, and web creation are four different states. Then classify every environment variable as public configuration, sensitive configuration, or identity supplied by the platform.

### Lesson 4.4 — Container debugging without destroying evidence

Useful commands:

```bash
# CHECK: List service state and health without mutating a container.
docker compose ps
# CHECK: Read only the most recent API evidence to keep triage focused.
docker compose logs --tail=100 api
# CHECK: Confirm the runtime version actually present in the built API image.
docker compose exec api node --version
# CHECK: Ask PostgreSQL whether it is accepting authenticated connections.
docker compose exec database pg_isready -U app -d learning
# CHECK: Ask the optional MongoDB member for topology and writable-primary state.
docker compose --profile mongodb exec mongodb \
  mongosh --quiet --eval 'db.adminCommand({ hello: 1 })'
# CHECK: Render the fully merged Compose model, including substituted environment values.
docker compose config
# CHECK: Observe live CPU, memory, network, and block-I/O pressure by container.
docker stats
```

Prefer logs, metrics, health, and an ephemeral debug container over installing tools into a running production container. A container mutation disappears on replacement and makes the incident impossible to reproduce.

Lab: break the database hostname, predict which health check fails, inspect the evidence, then restore it.

Additional exercises:

1. Break internal DNS, port mapping, and readiness one at a time; diagnose each using only non-mutating evidence before applying the fix.
2. Launch an ephemeral debug container on the project network, prove connectivity without modifying production images, and save a reusable incident command set.

Exit check: produce a five-minute triage checklist that starts with impact and recent changes.

## Part 5 — GitHub Actions CI/CD for the monorepo

### Lesson 5.1 — Continuous integration

Create `.github/workflows/ci.yml`; the starter intentionally has no workflow answer.

```yaml
# WHAT: Give this workflow a stable name in checks and concurrency groups.
name: CI

# BOUNDARY: Verify every pull request and every commit entering the protected branch.
on:
  pull_request:
  push:
    branches: [main]

# SECURITY: Give the workflow token only read access unless a job proves it needs more.
permissions:
  contents: read

# WHY: Cancel obsolete verification after a newer commit arrives on the same ref.
concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# WHAT: Group related work under one independently schedulable job.
jobs:
  verify:
    # WHY: Use an ephemeral, known GitHub-hosted Linux environment.
    runs-on: ubuntu-latest
    env:
      # WHY: Prisma validates URL shape during generation but does not connect here.
      DATABASE_URL: postgresql://ci:ci@localhost:5432/ci
    steps:
      # WHAT: Materialize this commit so later tools can read and build it.
      - uses: actions/checkout@v6
      # WHAT: Install the Node version declared by the repository.
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          # WHY: Reuse downloaded npm artifacts; this does not replace `npm ci`.
          cache: npm
      # WHY: Reproduce the lockfile exactly and reject dependency drift.
      - run: npm ci
      # CHECK: Validate models/relations and rebuild the client used by compilation.
      - run: npm run prisma:validate && npm run prisma:generate
      # CHECK: Use the repository's ordered check so type emission and builds do not race.
      - run: npm run check
      # SECURITY: Fail only on high production advisories; triage full audit separately.
      - run: npm audit --omit=dev --omit=optional --audit-level=high

  # WHAT: Build images only after the application contract is green.
  container-builds:
    runs-on: ubuntu-latest
    needs: verify
    steps:
      - uses: actions/checkout@v6
      # CHECK: Build the exact learner-authored API Dockerfile with an immutable commit tag.
      - run: docker build -f apps/api/Dockerfile -t learning-api:${{ github.sha }} .
      # CHECK: Build the independently served frontend artifact/image.
      - run: docker build -f apps/web/Dockerfile -t learning-web:${{ github.sha }} .
```

The small learning workspace verifies all projects. Larger repositories should use `nx affected` with correct base/head commits, retain a periodic full build, and consider remote caching only after understanding trust boundaries for cached artifacts.

CI principles:

- Minimal `GITHUB_TOKEN` permissions.
- Immutable dependency lockfile.
- Concurrency cancellation for superseded PR runs.
- Separate deterministic verification from deployment.
- Production dependency audit plus image scanning.
- Pin third-party actions to full commit SHAs in high-assurance environments; major tags are readable but mutable.

Nx target output must be deterministic for caching. A target that reads undeclared environment state or current time can return a false cache hit.

Lab: change only `frontend/ui`, run `npx nx affected -t test --base=HEAD~1 --head=HEAD`, and inspect the selected graph.

When you implement the reusable repository contract suite from Lesson 2.5, add a separate integration job with real disposable services. Keep this slower boundary distinct from the fast unit/static job:

```yaml
# WHAT: Add this as a sibling job under the existing top-level `jobs` map.
repository-contract:
  # WHY: Use an isolated runner because these tests own real database state.
  runs-on: ubuntu-latest
  services:
    postgres:
      # WHAT: Match the major used by local Compose.
      image: postgres:18-alpine
      env:
        POSTGRES_DB: learning_test
        POSTGRES_USER: app
        POSTGRES_PASSWORD: app
      ports:
        - 5432:5432
      # CHECK: Do not start tests until PostgreSQL accepts connections.
      options: >-
        --health-cmd "pg_isready -U app -d learning_test"
        --health-interval 5s --health-timeout 3s --health-retries 20
  steps:
    # WHAT: Materialize the exact commit being verified.
    - uses: actions/checkout@v6
    # WHAT: Install the repository's declared Node runtime.
    - uses: actions/setup-node@v6
      with:
        node-version-file: .nvmrc
        cache: npm
    # WHY: Reproduce the lockfile before starting test infrastructure.
    - run: npm ci
    # WHY: A custom command is used because a transaction-capable Mongo service needs rs0.
    - run: docker run -d --name mongo-ci -p 27017:27017 mongo:8.0 --replSet rs0 --bind_ip_all
    # CHECK: Initiate the test replica set before running transactional contracts.
    - run: |
        for attempt in $(seq 1 30); do
          docker exec mongo-ci mongosh --quiet --eval \
            "try { rs.status() } catch (error) { rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]}) }" \
            && break
          sleep 2
        done
    # WHAT: Apply the reviewed relational schema to the disposable test database.
    - run: npm run db:migrate:deploy
      env:
        DATABASE_URL: postgresql://app:app@127.0.0.1:5432/learning_test
    # CHECK: Run the same contract once per adapter using isolated databases.
    - run: npm run test:repository-contract
      env:
        TEST_DATABASE_URL: postgresql://app:app@127.0.0.1:5432/learning_test
        TEST_MONGODB_URL: mongodb://127.0.0.1:27017/learning_test?replicaSet=rs0&directConnection=true
```

`test:repository-contract` is intentionally a TODO until you write the suite. Pin container images by digest in a hardened pipeline and add teardown/diagnostic log collection on failure.

Additional exercises:

1. Change only `frontend/ui`, run `nx affected`, and compare selected tasks with a full run; explain every included and excluded project from the graph.
2. Deliberately fail formatting, a repository contract, image build, and dependency audit in separate commits; prove each failure blocks the correct downstream job.

Exit check: identify which input changes invalidate each build output.

### Lesson 5.2 — Deployment with GitHub OIDC, not stored AWS keys

Create `.github/workflows/deploy.yml` and `infra/aws/github-oidc-trust-policy.json` after CI is green.

The workflow requests an OIDC token and exchanges it for short-lived AWS credentials:

```yaml
# SECURITY: Read source and request an identity token; do not grant repository writes.
permissions:
  contents: read
  id-token: write

# BOUNDARY: Exchange GitHub's signed job identity for short-lived AWS role credentials.
- uses: aws-actions/configure-aws-credentials@v6.2.3
  with:
    # WHAT: Select the tightly scoped deployment role trusted by this environment subject.
    role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
    # WHAT: Scope AWS API calls to the application's chosen Region.
    aws-region: eu-central-1
    # SECURITY: Fail if credentials unexpectedly belong to a different AWS account.
    allowed-account-ids: ${{ vars.AWS_ACCOUNT_ID }}
```

The IAM trust policy must restrict audience and exact subject. Since 15 July 2026, newly created GitHub repositories use immutable owner/repository IDs in the default subject:

```text
repo:ORG@ORG_ID/REPO@REPO_ID:environment:production
```

Older repositories may use `repo:ORG/REPO:environment:production`. Inspect the repository’s actual OIDC format and make the IAM policy match; do not replace the subject with a broad wildcard. Add required reviewers and branch restrictions to the GitHub `production` environment.

The deployment then:

1. Builds and pushes API runtime and migration-stage images tagged with the immutable commit SHA.
2. Registers and runs a one-shot migration task in the private application subnets, waits for it to stop, and fails unless its exit code is zero.
3. Inserts the runtime image into a versioned ECS service task definition.
4. Deploys the ECS service and waits for stability.
5. Syncs the frontend build to private S3.
6. Invalidates only CloudFront HTML paths.

The migration step needs repository variables `ECS_PRIVATE_SUBNET_IDS` (comma-separated subnet ids) and `ECS_SECURITY_GROUP_ID`, plus least-privilege `ecs:RegisterTaskDefinition`, `ecs:RunTask`, `ecs:DescribeTasks`, and `iam:PassRole` for only the migration execution role. It uses `infra/aws/ecs-migration-task-definition.json`, reads `DATABASE_URL` from Secrets Manager, and runs before new application tasks receive traffic.

After creating the IAM/environment prerequisites, type the complete `.github/workflows/deploy.yml` rather than trying to infer the missing workflow structure from the excerpt above:

```yaml
# WHAT: Give the protected deployment workflow a stable identity.
name: Deploy production

# BOUNDARY: Permit manual recovery and deployment only from the protected main branch.
on:
  workflow_dispatch:
  push:
    branches: [main]

# SECURITY: Read source and request an OIDC identity; grant no repository writes.
permissions:
  contents: read
  id-token: write

# WHY: Never cancel an in-progress production mutation for a newer commit.
concurrency:
  group: production
  cancel-in-progress: false

# WHAT: Centralize non-secret deployment identifiers.
env:
  AWS_REGION: eu-central-1
  ECR_REPOSITORY: nx-learning-api
  ECS_CLUSTER: nx-learning
  ECS_SERVICE: nx-learning-api
  ECS_CONTAINER: api

jobs:
  deploy:
    # BOUNDARY: GitHub environment approval and subject policy apply to this job.
    environment: production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: npm
      # WHY: Reproduce the lockfile before verifying or packaging anything.
      - run: npm ci
      - name: Generate the Prisma client used by verification and the API build
        env:
          # WHY: Generation needs valid URL syntax but does not connect.
          DATABASE_URL: postgresql://ci:ci@localhost:5432/ci
        run: npm run prisma:generate
      # CHECK: Deployment cannot compensate for a broken application contract.
      - run: npm run check

      - name: Exchange GitHub OIDC identity for short-lived AWS credentials
        uses: aws-actions/configure-aws-credentials@v6.2.3
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}
          allowed-account-ids: ${{ vars.AWS_ACCOUNT_ID }}

      - id: ecr
        # WHAT: Authenticate Docker to the account/Region registry without a stored password.
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push immutable runtime and migration images
        id: api-image
        env:
          IMAGE: ${{ steps.ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}
          MIGRATION_IMAGE: ${{ steps.ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}-migration
        run: |
          docker build -f apps/api/Dockerfile -t "$IMAGE" .
          docker push "$IMAGE"
          docker build --target migration -f apps/api/Dockerfile -t "$MIGRATION_IMAGE" .
          docker push "$MIGRATION_IMAGE"
          echo "image=$IMAGE" >> "$GITHUB_OUTPUT"
          echo "migration-image=$MIGRATION_IMAGE" >> "$GITHUB_OUTPUT"

      - name: Insert migration image into the one-shot task definition
        id: migration-task-definition
        uses: aws-actions/amazon-ecs-render-task-definition@v1.9.0
        with:
          task-definition: infra/aws/ecs-migration-task-definition.json
          container-name: migrate
          image: ${{ steps.api-image.outputs.migration-image }}

      - name: Apply reviewed migrations inside the application VPC
        env:
          MIGRATION_TASK_DEFINITION: ${{ steps.migration-task-definition.outputs.task-definition }}
          ECS_PRIVATE_SUBNET_IDS: ${{ vars.ECS_PRIVATE_SUBNET_IDS }}
          ECS_SECURITY_GROUP_ID: ${{ vars.ECS_SECURITY_GROUP_ID }}
        run: |
          TASK_DEFINITION_ARN=$(aws ecs register-task-definition \
            --cli-input-json "file://$MIGRATION_TASK_DEFINITION" \
            --query 'taskDefinition.taskDefinitionArn' \
            --output text)

          TASK_ARN=$(aws ecs run-task \
            --cluster "$ECS_CLUSTER" \
            --task-definition "$TASK_DEFINITION_ARN" \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[$ECS_PRIVATE_SUBNET_IDS],securityGroups=[$ECS_SECURITY_GROUP_ID],assignPublicIp=DISABLED}" \
            --query 'tasks[0].taskArn' \
            --output text)

          test "$TASK_ARN" != "None"
          aws ecs wait tasks-stopped --cluster "$ECS_CLUSTER" --tasks "$TASK_ARN"
          EXIT_CODE=$(aws ecs describe-tasks \
            --cluster "$ECS_CLUSTER" \
            --tasks "$TASK_ARN" \
            --query 'tasks[0].containers[?name==`migrate`].exitCode | [0]' \
            --output text)
          test "$EXIT_CODE" -eq 0

      - name: Insert the runtime image into the service task definition
        id: task-definition
        uses: aws-actions/amazon-ecs-render-task-definition@v1.9.0
        with:
          task-definition: infra/aws/ecs-task-definition.json
          container-name: ${{ env.ECS_CONTAINER }}
          image: ${{ steps.api-image.outputs.image }}

      - name: Deploy the API and wait for healthy ECS tasks
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.task-definition.outputs.task-definition }}
          cluster: ${{ env.ECS_CLUSTER }}
          service: ${{ env.ECS_SERVICE }}
          wait-for-service-stability: true
          wait-max-delay-seconds: 15

      - name: Publish the frontend build to its private S3 origin
        run: aws s3 sync apps/web/dist "s3://${{ vars.WEB_BUCKET }}" --delete

      - name: Invalidate only CloudFront HTML entry points
        run: >-
          aws cloudfront create-invalidation
          --distribution-id "${{ vars.CLOUDFRONT_DISTRIBUTION_ID }}"
          --paths "/" "/index.html"
```

Lab: add a staging environment with a separate role, ECS service, buckets, variables, and approval policy. Never make staging and production share a deploy role “for convenience.”

Additional exercises:

1. Decode a GitHub OIDC token in a safe test job, compare its audience/subject with IAM conditions, and prove a different branch/environment cannot assume the role.
2. Deploy to a separate staging environment with independent role, ECS service, buckets, and approvals; demonstrate that production identifiers are inaccessible.

Exit check: list exactly which AWS actions the deploy role needs and remove wildcard permissions where resource-level scoping exists.

### Lesson 5.3 — Deployment safety and rollback

A pipeline completing does not prove the application works. Add:

- Pre-deployment migration compatibility check.
- ECS deployment circuit breaker and healthy target requirement.
- Post-deploy smoke test through the public URL.
- CloudWatch alarm rollback signal.
- A tested previous-task-definition rollback procedure.
- Deployment metadata tying image digest, commit, migration version, and actor together.

Do not use the mutable `latest` tag as deployment identity. A commit tag is better; an image digest is strongest.

For database changes, deploy backward-compatible expansion before new code. Rolling ECS tasks means old and new application versions overlap.

Lab: intentionally fail readiness in a staging task, observe deployment behavior, then roll back to the last task definition revision.

Additional exercises:

1. Deploy a revision with failing readiness in staging, capture circuit-breaker events, and verify the previous task definition continues serving.
2. Design and rehearse an expand/contract migration across overlapping old/new tasks, including the exact rollback point before destructive contraction.

Exit check: state what “successful rollback” means when a non-backward-compatible migration has already committed.

## Part 6 — AWS: build the cloud side deliberately

### Lesson 6.1 — Architecture and service decisions

Use one AWS Region close to your users and approved for your data, such as `eu-central-1`. The primary path for this project is:

```text
Route 53
   |
CloudFront + ACM certificate + optional WAF
   | default behavior                 | /api/* behavior
private S3 web bucket                 public ALB :443
                                      |
                              target group health checks
                                      |
                       ECS service on Fargate, private subnets
                            |                         |
             chosen managed database          private S3 uploads
             RDS PostgreSQL by default
             Atlas on AWS as MongoDB option
```

Supporting services:

- ECR stores immutable API images.
- IAM task roles give the container S3 access without access keys.
- Secrets Manager supplies database URL/API secret.
- CloudWatch receives logs, metrics, alarms, and dashboards.
- AWS Budgets and Cost Anomaly Detection warn about spend.

Do not add every AWS service to one request path. API Gateway and ALB overlap for some HTTP use cases. EC2 and ECS are alternative compute operating models. The lessons below explain when to create each.

Deploy one database path per environment while learning. Running RDS and a managed MongoDB cluster at the same time doubles cost and operational surface without improving this product. The checked-in ECS task definition remains the Prisma/RDS default; switching it is a deliberate later lab.

Lab: redraw the architecture from memory, trace browser navigation, API CRUD, direct upload, and deployment as four separate flows, then remove any service whose purpose you cannot explain with a requirement.

Additional exercises:

1. Trace navigation, API CRUD, presigned upload, and deployment as four separate flows, naming protocol, identity, encryption, caching, and failure owner at every hop.
2. Remove one proposed AWS service at a time, document the lost requirement, and permanently reject any service whose removal changes no stated requirement.

Exit check: identify every public trust boundary, credential exchange, persistent data store, scaling unit, health decision, and paid baseline resource in the diagram.

### Lesson 6.2 — Create the budget first

Console:

1. Open **Billing and Cost Management → Budgets → Create budget**.
2. Choose **Customize (advanced) → Cost budget**.
3. Name it `nx-learning-monthly-cost`, monthly recurring, and set a limit you are willing to pay, for example USD 25.
4. Add actual-cost alerts at 50%, 80%, and 100%, plus a forecasted-cost alert at 100%.
5. Send alerts to an email you actively monitor. Confirm any required subscription.
6. Open **Cost Anomaly Detection** and create a monitor/subscription for unexpected daily spend.

CLI alternative for the budget object:

Create `infra/aws/budget.json`. JSON has no comments, so read the fields first: `BudgetLimit` is the monthly USD threshold you personally accept; the type/time unit choose actual monthly cost; the `CostTypes` flags say which charge classes participate. Change `25` before creation if that is not your limit.

```json
{
  "BudgetName": "nx-learning-monthly-cost",
  "BudgetLimit": { "Amount": "25", "Unit": "USD" },
  "BudgetType": "COST",
  "TimeUnit": "MONTHLY",
  "CostFilters": {},
  "CostTypes": {
    "IncludeTax": true,
    "IncludeSubscription": true,
    "UseBlended": false,
    "IncludeRefund": false,
    "IncludeCredit": false,
    "IncludeUpfront": true,
    "IncludeRecurring": true,
    "IncludeOtherSubscription": true,
    "IncludeSupport": true,
    "IncludeDiscount": true,
    "UseAmortized": false
  }
}
```

```bash
# WHAT: Resolve the authenticated account dynamically instead of hard-coding its id.
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
# WHAT: Create the version-controlled cost limit object in that exact account.
aws budgets create-budget \
  --account-id "$AWS_ACCOUNT_ID" \
  --budget file://infra/aws/budget.json
```

Add notifications in the console or with `--notifications-with-subscribers`. AWS Budget Actions can, after a threshold and either automatically or with approval, apply selected IAM/SCP controls or target supported EC2/RDS resources. They are still not a universal real-time spending cap: budget data is delayed, coverage is selective, and an Auto Scaling Group can replace a stopped instance. Use least privilege, teardown automation, service quotas, and an expiration tag such as `delete-after=2026-08-28` as additional controls.

Additional exercises:

1. Estimate one-day and one-month cost for minimum and availability configurations, including NAT, ALB, public IPv4, database, storage, logs, and transfer assumptions.
2. Trigger a very small test threshold or notification path, verify receipt and delay, then document why the budget is not an immediate kill switch.

Exit check: identify every hourly baseline charge in the proposed architecture before creating it.

### Lesson 6.3 — IAM foundation and GitHub identity

Account foundation:

1. Enable root-user MFA, store recovery securely, and never use root for daily work.
2. Use IAM Identity Center for human access. Create an administrator permission set for initial setup and a narrower developer set later.
3. Turn on CloudTrail and review the account’s default encryption/block-public-access settings.

GitHub OIDC provider:

1. Open **IAM → Identity providers → Add provider**.
2. Choose **OpenID Connect**.
3. Provider URL: `https://token.actions.githubusercontent.com`.
4. Audience: `sts.amazonaws.com`.
5. Create role `nx-learning-github-deploy` with **Web identity** trust.
6. Replace placeholders in `infra/aws/github-oidc-trust-policy.json` with account, owner, owner ID, repository, and repository ID. Use the environment subject that matches your repository.
7. Attach a custom least-privilege deployment policy for only this ECR repository, ECS service/task family, web bucket, CloudFront distribution, required `iam:PassRole` roles, and log/task-definition actions.
8. In GitHub, create environment `production`, add required reviewers, add secret `AWS_DEPLOY_ROLE_ARN`, and variables `AWS_ACCOUNT_ID`, `WEB_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `ECS_PRIVATE_SUBNET_IDS`, and `ECS_SECURITY_GROUP_ID`.

Create `infra/aws/github-oidc-trust-policy.json`. Replace every angle-bracket placeholder with the immutable account/owner/repository values you verified. `Principal` names the one GitHub OIDC provider in your account; `Action` permits only web-identity assumption; `aud` restricts the AWS STS audience; `sub` restricts the exact repository and protected environment. This is strict JSON and must not contain comments.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:<ORG>@<ORG_ID>/<REPO>@<REPO_ID>:environment:production"
        }
      }
    }
  ]
}
```

```bash
# CHECK: Reject malformed JSON before sending a trust policy to IAM.
python3 -m json.tool infra/aws/github-oidc-trust-policy.json
# BOUNDARY: Create the role only after checking its exact subject against GitHub's token.
aws iam create-role \
  --role-name nx-learning-github-deploy \
  --assume-role-policy-document file://infra/aws/github-oidc-trust-policy.json
```

Separate roles:

- **ECS execution role:** ECR pull, CloudWatch log delivery, Secrets Manager retrieval referenced by the task definition.
- **ECS task role:** permissions application code needs, for example `s3:PutObject` only on `arn:aws:s3:::nx-learning-uploads/uploads/*`.
- **GitHub deploy role:** changes deployment resources; the application can never assume it.

Additional exercises:

1. Remove S3 permission from the task role while retaining the execution role, prove the image/logs still work but uploads fail, then restore least privilege.
2. Use IAM policy simulation for every deploy action and resource, remove one wildcard, and retain evidence for allowed plus intentionally denied operations.

Exit check: explain why execution role and task role are not interchangeable.

### Lesson 6.4 — Networking and security groups

For the full availability lesson, create a VPC across two Availability Zones:

1. Open **VPC → Create VPC → VPC and more**.
2. Name `nx-learning`, IPv4 CIDR `10.20.0.0/16`.
3. Select two AZs, two public subnets, and two private subnets.
4. Public subnets route to an Internet Gateway and hold the ALB.
5. Private subnets hold ECS tasks and RDS.

Outbound design is a cost/security decision:

- A NAT Gateway per AZ is resilient but has hourly and per-GB cost.
- One NAT Gateway is cheaper but creates cross-AZ dependency/cost and reduced resilience.
- VPC endpoints for ECR API/DKR, S3, CloudWatch Logs, Secrets Manager, and STS can reduce or remove NAT needs but endpoints also have cost.
- A temporary learning deployment can use public ECS task IPs with strict inbound rules, but do not mistake that cost shortcut for the preferred production boundary.

Create security groups by relationship, not broad CIDRs:

| Group    | Inbound                                | Outbound                                |
| -------- | -------------------------------------- | --------------------------------------- |
| `alb-sg` | 443 from internet; 80 only to redirect | 3000 to `api-sg`                        |
| `api-sg` | 3000 only from `alb-sg`                | 5432 to `db-sg`, HTTPS to AWS endpoints |
| `db-sg`  | 5432 only from `api-sg`                | Default/stateful response only          |

Additional exercises:

1. Verify security-group references with reachability evidence from ALB, ECS, RDS, and an unauthorized source; remove any broad CIDR that is unnecessary.
2. Compare NAT Gateway with required VPC endpoints for ECR, logs, secrets, and S3; estimate cost and list every dependency that would lose egress.

Exit check: show that the RDS and API ports are not reachable directly from the public internet.

### Lesson 6.5 — RDS PostgreSQL

Console path **RDS → Databases → Create database**:

1. Standard create, PostgreSQL, a supported PostgreSQL major compatible with your migration tests.
2. Template **Dev/Test** for the lab. For production, use Multi-AZ based on availability requirements.
3. Identifier `nx-learning-db`; use managed master credentials or store a generated value in Secrets Manager.
4. Choose the `nx-learning` VPC, a DB subnet group using both private subnets, **Public access: No**, and `db-sg`.
5. Start with a small instance class and storage, disable costly extras you are not studying, and inspect the estimate before creating.
6. Enable automated backups and deletion protection when treating it as durable. Choose a retention period that meets RPO.
7. Enable Performance Insights/Enhanced Monitoring only after checking price and learning objective.
8. Set sensible parameter-group values such as `log_min_duration_statement`, `idle_in_transaction_session_timeout`, and TLS policy; test before production.

Run Prisma migrations as a one-off ECS task using the Dockerfile's `migration` stage and the same private networking as the API, not from every API replica at startup. The workflow waits for a zero exit code before deploying new application tasks. The migration image contains Prisma CLI and reviewed migration history; the lean API runtime image does not. Production never runs the learning seed.

For replicas, create **RDS → Databases → Actions → Create read replica**, route only explicitly stale-tolerant reads to its endpoint, and alarm on replica lag. For failover availability, understand the difference between Multi-AZ standby and read replicas.

Additional exercises:

1. Simulate connection pressure from the maximum ECS task count, verify reserved operational capacity, and choose pool/autoscaling bounds from evidence.
2. Enable and inspect slow-query/performance diagnostics for a measured task query, then map the finding back to the local `EXPLAIN` lesson.

Exit check: perform a point-in-time restore into a new database, run a validation query, and record elapsed time.

### Lesson 6.5B — Managed MongoDB on AWS: choose compatibility deliberately

Do not run the one-node Compose MongoDB container as production data infrastructure on ECS or a lone EC2 instance. It has no redundancy, automated failover, managed backup contract, or safe maintenance story.

For MongoDB behavior, use a MongoDB Atlas dedicated cluster deployed on AWS:

1. In Atlas, create a project and a dedicated cluster on AWS in the same Region as ECS. Review the hourly estimate before creation; private endpoints are not available on free/flex tiers.
2. Create a least-privilege database user for the API. Atlas users and database users are different identities.
3. For the production networking exercise, choose **Network Access → Private Endpoint → AWS** and create the matching AWS PrivateLink interface endpoint in at least two application subnets/AZs.
4. Use Atlas's private-endpoint-aware `mongodb+srv` connection string. Do not copy the local `directConnection=true` URI into production.
5. Store the URI in Secrets Manager as `nx-learning/mongodb-url`; inject it only into the Mongoose task definition as `MONGODB_URL`.
6. Set `DATABASE_CLIENT=mongoose`; remove `DATABASE_URL` from that task definition so the unused PostgreSQL credential is not exposed.
7. Run a one-off setup/migration task that applies reviewed indexes and validators. Do not rely on Mongoose `autoIndex` in production.
8. Configure backups, restore policy, maintenance, alerts, audit/access controls, and a tested restore that meets the written RPO/RTO.

Security-group egress must allow the PrivateLink endpoint, and the endpoint policy/network configuration must allow the ECS subnets. Atlas recommends its DNS seedlist private-endpoint URI because endpoint ports can change. Private endpoints and AWS interface endpoints both have costs; include them in the budget.

AWS-native Amazon DocumentDB is MongoDB-compatible, not MongoDB. If you evaluate it, create a separate compatibility branch and test every operator, index, transaction, change-stream behavior, result-order assumption, and failure mode used by this adapter against the exact engine version. DocumentDB requires TLS and its connection guidance includes `replicaSet=rs0`; it does not support retryable writes, so its URI commonly requires `retryWrites=false`. Do not point the production Mongoose adapter at DocumentDB merely because the wire protocol connects.

Lab: deploy the Mongoose API to staging against Atlas, run the same repository contract suite plus failover/readiness tests, build indexes explicitly, and perform a restore to a separate cluster. Then record cost and operational ownership beside the RDS path.

Additional exercises:

1. Build a compatibility matrix for every feature this adapter uses—transactions, change streams, indexes, drivers, backup, and sharding—against Atlas and DocumentDB.
2. Price a time-boxed Atlas learning deployment, configure network/identity boundaries, and write a teardown/backup plan before creating the cluster.

Exit check: explain the difference between MongoDB, MongoDB Atlas running on AWS, and Amazon DocumentDB with MongoDB compatibility.

### Lesson 6.6 — S3 upload and web-origin buckets

Create two private buckets with globally unique names:

1. **S3 → Create bucket** in the application Region.
2. `nx-learning-web-<account>-<region>` for built frontend assets.
3. `nx-learning-uploads-<account>-<region>` for user files.
4. Keep **Block all public access** enabled on both.
5. Enable default server-side encryption. Use SSE-KMS only when key-control/audit requirements justify its cost and policy complexity.
6. Enable versioning on the web bucket if you want quick object rollback; add lifecycle policy for old noncurrent versions.
7. On the upload bucket, add lifecycle cleanup for incomplete multipart uploads and retention/archival rules.
8. Do not enable ACL-based public access. CloudFront uses Origin Access Control for the web bucket.

Upload bucket CORS for local and production browser PUTs:

Field guide for this strict JSON: `AllowedOrigins` is the exact browser-origin allowlist; `AllowedMethods` permits only direct object replacement; `AllowedHeaders` must include every signed/requested browser header; `ExposeHeaders` makes S3's ETag readable to browser JavaScript; `MaxAgeSeconds` controls how long the browser may cache the CORS preflight result. CORS does not make the bucket public.

```json
[
  {
    "AllowedOrigins": ["https://app.example.com", "http://localhost:4200"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type"],
    "ExposeHeaders": ["etag"],
    "MaxAgeSeconds": 300
  }
]
```

Bucket CORS does not grant S3 permission. The presigned signature does. Keep the upload bucket out of the web bucket so user content cannot inherit executable site behavior.

Additional exercises:

1. Configure and test bucket CORS for the exact web origin and upload method, then prove an unapproved origin cannot use browser access.
2. Add lifecycle rules for incomplete multipart uploads and quarantined objects, simulate eligible objects, and verify retained production data is unaffected.

Exit check: prove an anonymous S3 GET is denied while CloudFront can retrieve the web object.

### Lesson 6.7 — ECR and image lifecycle

Console **ECR → Private registry → Repositories → Create repository**:

1. Name `nx-learning-api`.
2. Enable tag immutability so a commit tag cannot be replaced.
3. Enable enhanced or basic scanning according to account capability/cost.
4. Add a lifecycle rule that retains the last deployment set and expires old untagged images.

Bootstrap manually once if needed:

```bash
# WHAT: Resolve the authenticated account and choose one explicit deployment Region.
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=eu-central-1

# BOUNDARY: Exchange AWS identity for a short-lived registry password and avoid storing it.
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin \
  "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# WHAT: Build one local bootstrap image from the API Dockerfile.
docker build -f apps/api/Dockerfile -t nx-learning-api:bootstrap .
# WHAT: Add the fully qualified private-registry destination tag.
docker tag nx-learning-api:bootstrap \
  "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/nx-learning-api:bootstrap"
# WHAT: Upload its content-addressed layers and manifest to the private repository.
docker push \
  "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/nx-learning-api:bootstrap"
```

CI should deploy the digest or commit SHA, not `latest`.

Additional exercises:

1. Push two commit-tagged images, deploy by digest, and prove retagging cannot change the running task's artifact identity.
2. Add lifecycle policy preview for untagged/old images, protect the rollback window, and document how many revisions operations must retain.

Exit check: find the pushed image digest and locate its scan results/SBOM.

### Lesson 6.8 — Application Load Balancer

Create a target group first:

1. **EC2 → Target Groups → Create target group**.
2. Target type **IP** for Fargate, protocol HTTP, port 3000, VPC `nx-learning`.
3. Health path `/api/health/ready`; success code 200.
4. Choose intervals and healthy/unhealthy thresholds that balance detection speed against flapping.

Create ALB:

1. **EC2 → Load Balancers → Create → Application Load Balancer**.
2. Name `nx-learning-alb`, internet-facing, IPv4, both public subnets, `alb-sg`.
3. Request/validate an ACM certificate in the ALB’s Region for `api.example.com` or the CloudFront origin hostname.
4. Listener 443 uses the certificate and forwards to the target group.
5. Listener 80 redirects to HTTPS 443.
6. Enable deletion protection and access logs to a dedicated S3 log bucket when this is no longer disposable.

The ALB distributes layer-7 traffic and removes unhealthy targets. It does not make an application stateless; sessions, uploads, and locks still need shared/external state or sticky-session tradeoffs.

Additional exercises:

1. Tune health interval and thresholds in staging, inject intermittent readiness failures, and measure detection versus flapping before choosing values.
2. Attempt direct ALB-origin access when CloudFront is the intended edge, then implement and verify the chosen origin-protection control.

Exit check: stop one task during a two-task deployment and observe target deregistration plus uninterrupted requests.

### Lesson 6.9 — ECS on Fargate

Before creating the service:

1. Create CloudWatch log group `/ecs/nx-learning-api` with a finite retention period.
2. Replace placeholders in `infra/aws/ecs-task-definition.json`.
3. Create the execution role and task role described earlier.
4. Put `DATABASE_URL` and any temporary teaching API key in Secrets Manager. Prefer separate username/password fields or managed RDS secrets in a mature design.

Create `infra/aws/ecs-task-definition.json`. Replace account, domain, bucket, image, and secret placeholders. At task level, `awsvpc` and `FARGATE` select the networking/compute contract; CPU/memory are the smallest teaching size and must be measured; execution role pulls/logs/secrets while task role authorizes application S3 calls. Inside the container, public configuration stays in `environment`, sensitive values use `secrets`, health is process-local liveness, logs go to the finite-retention group, and the root filesystem is read-only. JSON cannot contain comments.

```json
{
  "family": "nx-learning-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/nx-learning-ecs-execution",
  "taskRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/nx-learning-api-task",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "<ACCOUNT_ID>.dkr.ecr.eu-central-1.amazonaws.com/nx-learning-api:bootstrap",
      "essential": true,
      "portMappings": [{ "containerPort": 3000, "hostPort": 3000, "protocol": "tcp" }],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "HOST", "value": "0.0.0.0" },
        { "name": "PORT", "value": "3000" },
        { "name": "DATABASE_CLIENT", "value": "prisma" },
        { "name": "AWS_REGION", "value": "eu-central-1" },
        { "name": "CORS_ORIGINS", "value": "https://app.example.com" },
        { "name": "S3_UPLOAD_BUCKET", "value": "nx-learning-uploads" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:eu-central-1:<ACCOUNT_ID>:secret:nx-learning/database-url"
        },
        {
          "name": "API_KEY",
          "valueFrom": "arn:aws:secretsmanager:eu-central-1:<ACCOUNT_ID>:secret:nx-learning/api-key"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "node -e \"fetch('http://localhost:3000/api/health/live').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))\""],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 20
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/nx-learning-api",
          "awslogs-region": "eu-central-1",
          "awslogs-stream-prefix": "api"
        }
      },
      "readonlyRootFilesystem": true
    }
  ]
}
```

Create `infra/aws/ecs-migration-task-definition.json` separately. It has no application task role or port because it performs finite schema work, but it still needs the execution role, private network access supplied by `run-task`, the database secret, and logs:

```json
{
  "family": "nx-learning-migration",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/nx-learning-ecs-execution",
  "containerDefinitions": [
    {
      "name": "migrate",
      "image": "<ACCOUNT_ID>.dkr.ecr.eu-central-1.amazonaws.com/nx-learning-api:bootstrap-migration",
      "essential": true,
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:eu-central-1:<ACCOUNT_ID>:secret:nx-learning/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/nx-learning-api",
          "awslogs-region": "eu-central-1",
          "awslogs-stream-prefix": "migration"
        }
      }
    }
  ]
}
```

```bash
# CHECK: Validate both strict JSON documents locally before AWS calls.
python3 -m json.tool infra/aws/ecs-task-definition.json
python3 -m json.tool infra/aws/ecs-migration-task-definition.json
```

Register the task definition:

```bash
# WHAT: Register an immutable revision from the reviewed task-definition document.
aws ecs register-task-definition \
  --cli-input-json file://infra/aws/ecs-task-definition.json
```

Console:

1. **ECS → Clusters → Create cluster**, name `nx-learning`, Fargate infrastructure.
2. **Create service**, launch type Fargate, task family `nx-learning-api`, desired count 2 for an availability exercise (1 for the cheapest short lab).
3. Choose both private subnets, no public IP if NAT/endpoints exist, and `api-sg`.
4. Attach the existing ALB, container `api:3000`, and target group.
5. Enable deployment circuit breaker with rollback.
6. Set health-check grace period long enough for startup but not to hide real failures.
7. Add target-tracking autoscaling on CPU and/or ALB request count after load testing. Bound minimum and maximum tasks against database connection capacity.

The task definition uses a read-only root filesystem, structured CloudWatch logs, health check, secrets, and a task role. Size CPU/memory from observed utilization and throttling. Node sees the container’s CPU/memory limits; measure event-loop delay, heap, and OOM exits.

Additional exercises:

1. Load-test one and two Fargate tasks, record CPU, memory, event-loop delay, target latency, and database connections before setting autoscaling bounds.
2. Send SIGTERM during a slow request, observe target deregistration and application draining, and reconcile ECS stop timeout with the Node shutdown deadline.

Exit check: force a bad image deployment in staging and verify the circuit breaker returns to a healthy revision.

### Lesson 6.10 — CloudFront CDN and DNS

ACM certificates for CloudFront must be requested in `us-east-1`, regardless of the application Region.

Create a distribution:

1. **CloudFront → Create distribution**.
2. Origin 1: private S3 web bucket, use **Origin Access Control**, update the bucket policy when prompted.
3. Default behavior: redirect HTTP to HTTPS, compress, allow GET/HEAD, use an appropriate managed cache policy.
4. Origin 2: ALB DNS name, origin protocol HTTPS only, add an unguessable origin custom header or AWS WAF/control so clients cannot bypass CloudFront if that matters to your design.
5. Behavior `/api/*`: route to ALB, caching disabled initially, allow required methods, forward required query strings/headers/cookies only.
6. Add alternate domain `app.example.com` and the `us-east-1` certificate.
7. Configure custom error responses carefully for an SPA. Do not rewrite genuine API 404 responses to `index.html`; behavior separation prevents that.
8. **Route 53 → Hosted zones**: create an alias A/AAAA record from `app.example.com` to the distribution.

Cache immutable hashed assets for a year. Keep `index.html` short-lived or uncached. Invalidate HTML after deploy; invalidating `/*` every time is slower and can cost more.

Additional exercises:

1. Configure short HTML and immutable hashed-asset caching, deploy a new build, and prove users receive new HTML without redownloading unchanged assets.
2. Attempt to cache an authenticated API response, demonstrate the risk, then configure behavior/cache-key policy that prevents cross-user leakage.

Exit check: inspect `Age`, `Via`, and `X-Cache` headers for HTML, an asset, and an API response.

### Lesson 6.11 — API Gateway: use it when its features earn the hop

For this app, CloudFront → ALB → ECS is the simplest main architecture. Add API Gateway when you need capabilities such as managed JWT authorizers, per-client throttling/quotas, API keys and usage plans, request transformation, managed WebSocket APIs, or a uniform edge for Lambda and private HTTP integrations.

Do not put API Gateway in front of an ALB solely because both names appeared in a requirements list. You add latency, cost, limits, another policy surface, and another failure mode.

Optional alternative lab:

```text
CloudFront /api/*
  -> API Gateway HTTP API
  -> VPC Link (private subnets)
  -> internal ALB listener
  -> ECS target group
```

Console outline:

1. **VPC → VPC links** or **API Gateway → VPC links**: create a VPC link in private subnets with a dedicated security group; wait until available.
2. **API Gateway → Create API → HTTP API**.
3. Create a private integration targeting the internal ALB listener through the VPC link.
4. Add route `ANY /api/{proxy+}` and a `$default` stage with auto-deploy disabled for controlled releases.
5. Add a JWT authorizer if an OIDC provider is part of the learning goal.
6. Configure access logs, throttling, CORS only if browsers call API Gateway directly, and CloudWatch alarms for 4xx/5xx and latency.
7. Point CloudFront `/api/*` at the API Gateway execute-api/custom domain origin.

Choose REST API rather than HTTP API only for REST-specific features you require. Check current feature and pricing comparisons before choosing.

Additional exercises:

1. Model monthly cost and latency for the expected request volume through ALB-only versus API Gateway, including idle baseline and per-request charges.
2. Prototype one Gateway-specific requirement such as usage plans or request validation, measure the added hop, and remove Gateway if the feature does not earn it.

Exit check: write a decision record comparing ALB-only and API Gateway + private ALB for latency, price, auth, throttling, observability, limits, and team ownership.

### Lesson 6.12 — EC2: learn the primitive, then compare ECS

EC2 gives you a virtual machine. You own OS patching, Docker/runtime installation, process supervision, log shipping, capacity, replacement, and deployment coordination. ECS manages task placement and desired count; Fargate also removes host management.

Time-boxed EC2 lab:

1. **EC2 → Launch instance**, Amazon Linux 2023, smallest appropriate instance shown in your account, encrypted gp3 root volume.
2. Use a private subnet plus Systems Manager Session Manager if your IAM/network setup supports it. Otherwise restrict SSH to your current IP; never open port 22 to the world.
3. Attach an instance role that can pull only the learning ECR repository and write logs.
4. Install Docker from the supported Amazon Linux repositories, authenticate to ECR through the role, and run the API image with environment/secrets supplied at runtime.
5. Put the process under `systemd` or another supervisor, configure CloudWatch agent/logging, and register the instance or its container with a target group.
6. Reboot it and prove the service returns.
7. Patch/rebuild it, then terminate the instance and delete unused volumes/IPs when the lesson ends.

Do not run the production database in the same EC2 instance as the API for this architecture. It couples failure, scaling, backup, and maintenance lifecycles.

Additional exercises:

1. Bootstrap a disposable EC2 instance with Session Manager rather than SSH, run the API container, and list every patching/scaling/recovery responsibility you acquired.
2. Terminate the instance unexpectedly, measure recovery with and without an Auto Scaling Group, and compare the result with ECS service replacement.

Exit check: make a responsibility matrix for EC2 + Docker, ECS on EC2, and ECS on Fargate.

### Lesson 6.13 — Observability and operational readiness

Collect signals across the request path:

- CloudFront: cache hit rate, 4xx/5xx, origin latency.
- ALB: request count, target response time, unhealthy hosts, target 5xx.
- ECS: desired/running tasks, CPU, memory, restarts, deployment state.
- Node: request rate/errors/duration, event-loop delay, heap/RSS, worker queue, pool wait.
- PostgreSQL/RDS: CPU, storage, connections, locks, slow queries, replica lag, vacuum health.
- Business: tasks created/completed, upload failures, queue age.

Use structured logs with request ID and propagate a trace/correlation identifier through CloudFront/ALB/API. Metrics answer “is the system unhealthy?” Logs help explain one event. Traces show cross-service critical paths. An alarm needs an owner, threshold rationale, runbook, and test.

Starter alarms:

- ALB target 5xx rate above an error-budget threshold.
- No healthy targets.
- ECS running task count below desired.
- RDS storage or connection headroom low.
- API p95 latency and error rate burn alerts.
- Budget and cost anomaly notifications.

Lab: create one CloudWatch dashboard and induce a safe staging failure. Follow the runbook using only telemetry.

Additional exercises:

1. Correlate one browser request ID through CloudFront/ALB/application logs and a database observation, then identify the first boundary where correlation is lost.
2. Trigger high 5xx, readiness failure, queue age, and database connection alarms in staging; execute each runbook and revise any alert without a clear owner/action.

Exit check: remove any alarm that has no actionable response.

### Lesson 6.14 — Teardown in dependency order

For a disposable lab, delete resources when finished. Verify names and retained data before deleting:

1. Disable the GitHub deployment workflow/environment.
2. Scale ECS service to zero, then delete service and cluster.
3. Delete ALB/listeners and target group.
4. Delete API Gateway/VPC link if you created the optional path.
5. Delete CloudFront distribution after disabling it, then Route 53 records you no longer need.
6. Empty versioned S3 buckets, including noncurrent versions/delete markers, then delete buckets.
7. Delete ECR images/repository after retaining any evidence you need.
8. Take a final RDS snapshot if required, then delete RDS/replicas and Secrets Manager secrets according to recovery policy.
9. Delete NAT Gateways and release Elastic IPs, then VPC endpoints and the VPC.
10. Delete project IAM roles/provider only if nothing else uses them.
11. Recheck Cost Explorer over the next day for lingering charges.

ACM certificates, CloudWatch log groups, snapshots, Route 53 hosted zones, Elastic IPs, and Secrets Manager scheduled deletions are frequently forgotten.

Additional exercises:

1. Perform a dry-run inventory grouped by dependency and cost before deletion, then have a second person review data-bearing resources and backups.
2. Wait for billing/resource views to converge after teardown, investigate every remaining chargeable/tagged item, and record final cost plus deletion evidence.

Exit check: after teardown, list every remaining project-tagged resource with AWS Resource Explorer or Tag Editor.

## Part 7 — Progression projects

### Middle-level completion

Implement and explain:

- One lazy React route with loading and error states.
- Correct state ownership across local state, URL, Zustand, and TanStack Query.
- CRUD with Zod validation, Prisma Client, reviewed migrations, and one parameterized raw selector.
- The same repository contract through Mongoose/MongoDB with one native selector lab.
- A transaction with a tested rollback.
- Docker Compose startup and deterministic Nx checks.
- CI on every pull request.

Evidence: demo the system, show passing tests, and trace one request from browser through Prisma-generated SQL to PostgreSQL.

### Senior-level completion

Add:

- Cursor pagination and virtualization working together.
- Optimistic UI with rollback plus HTTP 409 conflict UX.
- One repository contract suite on disposable migrated PostgreSQL and replica-set MongoDB.
- Bounded concurrency and worker-pool metrics.
- Outbox table for durable event publication.
- Index plan before/after evidence.
- Backward-compatible migration and rolling-deploy plan.
- Staging AWS environment with OIDC, ECS rollback, dashboards, and a restore drill.

Evidence: architecture decision records, load-test results including p95/p99, threat model, cost estimate, and runbooks.

### Expert-level completion

Design and validate:

- Multi-tenant isolation including database policy or rigorously tested tenant predicates.
- Read-replica consistency routing with measured lag.
- MongoDB change-stream recovery, replica-set consistency, and a documented shard-key decision.
- Queue worker leases, idempotency, poison-message policy, and disaster recovery.
- Partition lifecycle automation and a documented “do not shard yet” or sharding decision.
- SLO/error budget, burn-rate alerts, capacity model, and chaos experiments.
- Supply-chain controls: pinned actions/images, SBOM, signing, provenance, vulnerability SLA.
- Multi-account AWS separation, centralized audit, backup copy, and tested regional recovery if the business requires it.

Evidence: another engineer can operate and recover the service from your documentation without tribal knowledge.

## Final verification checklist

### Dependency advisory snapshot

The 21 August 2026 verification found zero findings in `npm audit --omit=dev`. The full audit retained one low-severity development-tool finding in esbuild's standalone Windows `serve` path; this workspace uses Vite's development server rather than that API, so it is documented and monitored rather than “fixed” with an incompatible dependency change.

React Router is pinned at 7.18.2. Narrow lockfile overrides currently select patched `deepmerge-ts` under Prisma configuration and `brace-expansion` under Nx. Prisma generation, validation, and the full Nx check prove current compatibility, but overrides are temporary risk controls: record an owner and removal trigger, then remove each one when its parent package adopts a supported patched range.

Advisories are time-sensitive. Rerun both `npm audit --omit=dev` and the full audit, inspect actual paths and exploitability, and record any accepted risk with an owner and expiry.

Run locally:

```bash
npm ci
npm run prisma:validate
npm run prisma:generate
npx nx sync:check
npm run lint
npm run test
npm run typecheck
npm run build
npm run format:check
npm audit --omit=dev --omit=optional --audit-level=high
docker compose config
docker compose --profile mongodb config
# CHECKPOINT: Run these full-stack commands only after completing Part 4.
docker compose up --build
# OPTIONAL: Start the second adapter and transaction-capable local MongoDB topology.
docker compose --profile mongodb up mongodb mongo-setup api-mongo --build
```

Then verify:

- `GET /api/health/live` remains fast during worker-thread CPU work.
- `GET /api/health/ready` identifies the selected adapter and fails when its database is unavailable.
- Invalid input returns 400 with no stack trace.
- Concurrent stale updates produce one 200 and one 409.
- A failed completion transaction writes neither task update nor event.
- Uploads reject wrong types and oversized files.
- Route chunks are lazy and the 10,000-row page has a small DOM.
- Containers run without baked secrets and the API is non-root/read-only.
- CI uses least permissions; deploy uses OIDC, not AWS access-key secrets.
- AWS public access, security groups, budgets, backup, alarms, and teardown are reviewed.

## Common traps to revisit

- Copying server data into Zustand and creating two authorities.
- A query key that omits a filter or tenant.
- Calling `fetch` without throwing on non-2xx.
- Using `z.coerce.boolean()` for the string `"false"`.
- Starting `prisma.$transaction(...)` but querying through root `prisma` instead of its callback transaction client.
- Starting a Mongoose transaction but forgetting to pass its session to one operation.
- Using `Promise.all` inside one MongoDB transaction session.
- Constructing Prisma Client per request and silently multiplying PostgreSQL pools.
- Constructing Mongoose connections per request or relying on buffered writes during startup.
- Editing generated Prisma Client files instead of changing `schema.prisma` and regenerating.
- Unbounded `Promise.all` or one worker per request.
- Trusting file extensions/MIME strings or logging presigned URLs.
- Treating CORS as authentication.
- Adding indexes without `EXPLAIN (ANALYZE, BUFFERS)` evidence.
- Letting Mongoose auto-build production indexes or accepting a MongoDB plan without `executionStats` evidence.
- Merging an untrusted object into a MongoDB filter or using unescaped `$regex` input.
- Assuming replicas are current or that replicas scale writes.
- Calling partitioning “sharding.”
- Mounting PostgreSQL 18 data at the pre-18 volume path.
- Using `latest`, long-lived AWS keys, broad OIDC subjects, or wildcard deploy permissions.
- Deploying API Gateway, ALB, EC2, and ECS simultaneously without a reason.
- Having backups, budgets, or alarms that have never been tested.

## Primary references

Use primary documentation as the authority, and re-check it before upgrades or cloud creation because versions, defaults, features, and prices change.

### Nx and React

- [Nx: Start a new project](https://nx.dev/docs/getting-started/start-new-project)
- [Nx: Run tasks and task pipelines](https://nx.dev/docs/features/run-tasks)
- [Nx: Explore the project graph](https://nx.dev/docs/features/explore-graph)
- [Nx: React Router guide](https://nx.dev/docs/technologies/react/guides/react-router)
- [React: Managing state](https://react.dev/learn/managing-state)
- [React: `lazy`](https://react.dev/reference/react/lazy)
- [React: `Suspense`](https://react.dev/reference/react/Suspense)
- [React Router documentation](https://reactrouter.com/)
- [Zustand documentation](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [TanStack Query: Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries)
- [TanStack Query: Polling](https://tanstack.com/query/latest/docs/framework/react/guides/polling)
- [TanStack Virtual: React API](https://tanstack.com/virtual/latest/docs/framework/react/react-virtual)

### Node.js, databases, and Docker

- [Node.js: Do not block the event loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop)
- [Node.js: Worker threads](https://nodejs.org/api/worker_threads.html)
- [Node.js: HTTPS](https://nodejs.org/api/https.html)
- [Express 5: Error handling](https://expressjs.com/en/5x/guide/error-handling/)
- [GitHub advisory: `deepmerge-ts` circular-object denial of service](https://github.com/advisories/GHSA-ggr8-5vv4-36mx)
- [GitHub advisory: `brace-expansion` resource-exhaustion bypass](https://github.com/advisories/GHSA-rgw5-rvv9-x895)
- [GitHub advisory: esbuild Windows development-server path traversal](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr)
- [Prisma ORM 7 overview](https://www.prisma.io/docs/orm)
- [Prisma Client generation](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client)
- [Prisma transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [Prisma raw queries and injection safety](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries)
- [Prisma PostgreSQL connection pools](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool)
- [Prisma: Baselining an existing database](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining)
- [PostgreSQL: Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL: `EXPLAIN`](https://www.postgresql.org/docs/current/sql-explain.html)
- [PostgreSQL: Locking clause and `SKIP LOCKED`](https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE)
- [PostgreSQL: Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL: Table partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)
- [PostgreSQL: Warm standby and streaming replication](https://www.postgresql.org/docs/current/warm-standby.html)
- [Mongoose: TypeScript schemas](https://mongoosejs.com/docs/typescript/schemas.html)
- [Mongoose: Validation](https://mongoosejs.com/docs/validation.html)
- [Mongoose: Lean queries](https://mongoosejs.com/docs/tutorials/lean.html)
- [Mongoose: Transactions](https://mongoosejs.com/docs/transactions.html)
- [Mongoose: Schema indexes and `autoIndex`](https://mongoosejs.com/docs/guide.html#indexes)
- [MongoDB: CRUD operations](https://www.mongodb.com/docs/manual/crud/)
- [MongoDB: Transactions](https://www.mongodb.com/docs/manual/core/transactions/)
- [MongoDB: Replication and change streams](https://www.mongodb.com/docs/manual/replication/)
- [MongoDB: Index types](https://www.mongodb.com/docs/manual/core/indexes/index-types/)
- [MongoDB: Sharding](https://www.mongodb.com/docs/manual/sharding/)
- [MongoDB: Docker replica-set connection option](https://www.mongodb.com/docs/manual/reference/connection-string-options/#mongodb-urioption-urioption.directConnection)
- [Docker: Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Docker Compose: Control startup order with health conditions](https://docs.docker.com/compose/how-tos/startup-order/)
- [Docker Compose: Profiles](https://docs.docker.com/compose/how-tos/profiles/)
- [Docker Official PostgreSQL image: PGDATA paths](https://hub.docker.com/_/postgres)

### GitHub and AWS

- [GitHub: Building and testing Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- [GitHub: OpenID Connect reference](https://docs.github.com/en/actions/reference/security/oidc)
- [GitHub: Configuring OIDC in AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
- [AWS IAM: GitHub OIDC role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html)
- [AWS: Create an Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-application-load-balancer.html)
- [AWS ECS: Application Load Balancer](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/alb.html)
- [AWS SDK v3: S3 examples](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html)
- [Amazon S3: Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [AWS CloudFront: Getting started](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.html)
- [AWS CloudFront: Restrict an S3 origin with OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [AWS ECS: Deployment circuit breaker](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_DeploymentCircuitBreaker.html)
- [AWS API Gateway HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)
- [AWS Budgets: Creating a budget](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-create.html)
- [AWS Budgets: Configuring budget actions](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-controls.html)
- [MongoDB Atlas: AWS private endpoints](https://www.mongodb.com/docs/atlas/security-private-endpoint/)
- [Amazon DocumentDB: MongoDB compatibility](https://docs.aws.amazon.com/documentdb/latest/devguide/compatibility.html)
- [Amazon DocumentDB: Functional differences from MongoDB](https://docs.aws.amazon.com/documentdb/latest/devguide/functional-differences.html)
- [AWS GitHub action: ECS deployment](https://github.com/aws-actions/amazon-ecs-deploy-task-definition)

## Closing principle

Expert engineering is not the maximum number of technologies. It is the smallest system that meets explicit correctness, security, performance, availability, operability, and cost requirements—with evidence, reversible decisions, and clear ownership.
