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
├── infra/
│   ├── postgres/                    # Advanced plain-SQL labs
│   ├── mongodb/                     # Replica-set and index setup for MongoDB labs
│   └── aws/                         # Task definition, OIDC and budget templates
├── prisma/                          # ORM schema, generated migration history and seed SQL
├── prisma.config.ts                 # Prisma CLI paths and database URL boundary
├── .github/workflows/               # CI and deployment
├── compose.yaml
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

The numbered parts are the complete reference path. For self-study, complete them in order the first time. For a summit, use the curated path below; attempting all 60 lessons in two days would turn the event into a typing race.

Read each lesson through five lenses. Some are expressed inline rather than repeated as headings:

1. **Outcome** — what capability you add.
2. **Read** — the working files to inspect.
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

The order is intentional: establish a runnable system, separate state and boundaries, implement one vertical slice, prove database semantics, compare the second adapter, measure failure/performance, then package, automate, and deploy. A participant may inspect later reference files, but should not copy them before attempting the lab.

### Curriculum triage

| Area             | Required core                     | Senior / expert extension                                    | Dependency                              |
| ---------------- | --------------------------------- | ------------------------------------------------------------ | --------------------------------------- |
| Nx and local run | 0.1–0.2                           | Project-boundary rules and custom generators                 | None                                    |
| React            | 1.1–1.4, 1.6                      | 1.5 polling; 1.7 virtualization                              | Runnable reference API from Part 0      |
| Node.js          | 2.1–2.5, 2.8–2.9, 2.11, 2.13      | 2.6 concurrency, 2.10 TLS, 2.12 S3; 2.7 worker pool          | TypeScript and HTTP basics              |
| PostgreSQL       | 3.1–3.4, 3.8                      | 3.5 pooling/maintenance, 3.7 replicas; 3.6 sharding decision | Repository port from 2.5                |
| MongoDB          | 3B.1–3B.4, 3B.8                   | 3B.5–3B.6; 3B.7 shard-key decision                           | Repository contract and transaction lab |
| Docker           | 4.1–4.3                           | 4.4 incident triage                                          | Both local application processes work   |
| GitHub Actions   | 5.1–5.2                           | 5.3 deployment rollback                                      | Deterministic checks and images         |
| AWS              | Guided 6.1–6.10 and teardown 6.14 | 6.11–6.13; 6.5B managed MongoDB evaluation                   | Budget, reviewed IAM, passing CI        |

“Guided” AWS means the instructor demonstrates a pre-provisioned staging environment while attendees complete the architecture, IAM, cost, and verification tasks. Creating every network, RDS, ALB, ECS, CloudFront, and DNS resource from scratch needs a separate cloud lab. It should not consume the database and application learning time.

### Recommended formats

| Format                         | What fits honestly                                                                                   | Result                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 90-minute summit session       | Architecture walkthrough, one vertical-slice demo, transaction failure demo, and AWS decision review | Shared mental model; no claim of implementation mastery              |
| One-day workshop               | Prework plus Labs 1–6 and a guided Docker/CI demonstration                                           | Working local vertical slice with two persistence choices introduced |
| Two-day workshop (recommended) | Prework plus Labs 1–12 below; AWS uses prepared staging                                              | Tested application, containers, CI, and deployment/rollback evidence |
| Three-day workshop             | Two-day track plus attendee-owned AWS build and advanced breakouts                                   | Full cloud creation, observability drill, restore, and teardown      |
| Self-study                     | Every numbered lesson and progression project, roughly 35–50 focused hours                           | Complete middle-to-expert reference path                             |

For the recommended two-day format, keep lectures to 10–15 minutes, labs to 30–75 minutes, and debriefs to 5–10 minutes. Stop a lab at its core exit check; move unfinished senior challenges to the parking lot instead of delaying every dependent exercise.

### Dependency-ordered exercise ladder

These are the summit's integrated exercises. The smaller labs inside each lesson remain useful practice, but this ladder gives facilitators a finishable narrative and gives attendees one evidence folder to present at the end.

|   # | Integrated lab                        |                       Time | Required lessons                      | Evidence to keep                                                   |
| --: | ------------------------------------- | -------------------------: | ------------------------------------- | ------------------------------------------------------------------ |
|   0 | Preflight and local data              | 30–45 min before the event | 0.2                                   | Tool versions, healthy Compose services, one API response          |
|   1 | Recreate the Nx boundaries            |                     35 min | 0.1                                   | Project graph and a second cached task run                         |
|   2 | Build the React read path             |                     60 min | 1.1–1.4, 1.6                          | Lazy chunk, query-key trace, accessible component test             |
|   3 | Define the HTTP/domain contract       |                     60 min | 2.1–2.3                               | In-memory service test plus valid/invalid request transcript       |
|   4 | Add PostgreSQL persistence            |                     75 min | 2.4–2.5, 3.1                          | Prisma CRUD test, parameterized raw query, query plan              |
|   5 | Defend concurrent completion          |                     60 min | 2.8, 3.2, 2.13                        | One winner, one HTTP 409, and rollback evidence                    |
|   6 | Prove the MongoDB adapter contract    |                     75 min | 3B.1–3B.4                             | Same contract suite against both engines and two explain plans     |
|   7 | Measure one bottleneck                |                     45 min | Choose 1.7, 2.6–2.7, 3.3–3.5, or 3B.5 | Before/after latency, plan, DOM count, or worker result            |
|   8 | Harden a boundary and lifecycle       |                     60 min | 2.9, 2.11; optionally 2.12            | Stable redacted error, request ID, graceful-shutdown trace         |
|   9 | Package and break the stack           |                     60 min | 4.1–4.4                               | Image/layer evidence and five-minute failure timeline              |
|  10 | Make CI enforce the contract          |                     60 min | 5.1–5.3                               | Passing workflow, affected graph, deliberate failing check         |
|  11 | Review the AWS production design      |                     60 min | 6.1–6.10, 6.13                        | Diagram, threat/cost notes, health and rollback observations       |
|  12 | Capstone incident and decision review |                     75 min | Parts 0–6                             | Runbook timeline, recovery proof, one architecture decision record |

Day 1 should finish Labs 1–5. Day 2 should finish Labs 6–12 using the prepared images and staging environment. Lab 0 is mandatory prework; if it fails, attendees join a setup lane instead of blocking the main room.

### Repeatable lab protocol

Use the same loop for every integrated lab:

1. **Predict:** write what should happen, including the status code, state transition, or query plan shape.
2. **Implement:** type the smallest change yourself; use the reference only after an honest attempt.
3. **Prove:** run a focused test or command before the broad suite.
4. **Break:** introduce the named stale write, bad input, missing dependency, or deployment failure.
5. **Observe:** capture logs, metrics, traces, database state, and user-visible behavior.
6. **Recover:** remove the fault and prove the invariant still holds.
7. **Explain:** write a three-sentence tradeoff or teach it to a partner without reading the tutorial.

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

- Verify the pinned versions, `npm ci`, `npm run check`, both database profiles, migration history, and seed idempotency on a clean machine.
- Pre-pull the large Docker images on venue machines and provide a known-good archive or mirror for restricted networks.
- Keep a clean starter copy and a read-only solution copy. Reveal only the files required by the current lab.
- Prepare reset scripts or disposable databases per pair; never ask attendees to repair a shared schema after another pair's experiment.
- Prepare one healthy and one intentionally broken staging revision. Confirm GitHub OIDC, ECS rollback, CloudWatch logs, and teardown permissions before the room arrives.
- Give each AWS participant an isolated sandbox/role with a region, service quota, budget, tags, and an end time. Never distribute a shared administrator credential.
- Print the core exit checks and timeboxes. Assign a setup helper so the instructor can continue when an individual laptop fails.
- End with teardown and a cost-resource inventory. AWS Budgets are delayed monitoring and optional actions, not a universal real-time kill switch.

### Capstone scenario

At the end of the two-day path, deploy a revision that makes readiness fail after a database configuration mistake while a second client submits a stale task completion. The team must keep the old ECS revision serving, identify the configuration error from correlated telemetry, show that only one completion commits, restore service, and write a short decision record covering prevention and rollback.

Core evidence:

- The load balancer never routes to the unready revision.
- The stale writer receives the documented 409 response and no duplicate event is stored.
- Logs include the request ID but exclude secrets and internal stack details.
- The rollback returns health to target before the declared recovery objective.
- The decision record names owner, alert, prevention, rollback, and one rejected alternative.

Senior challenge: repeat with the MongoDB adapter and explain which observations remain identical because of the repository contract and which are engine-specific. Expert extension: introduce a backward-incompatible migration proposal and design an expand/contract deployment that makes rollback safe before running any migration.

### Comment-first learning contract

You—not the tutorial—should write most of the implementation. The finished files in this repository are a reference to compare against after an honest attempt, not a substitute for doing the lab.

Code samples are intentionally more heavily commented than ordinary production code. Most meaningful lines carry one of these teaching signals:

- `WHAT:` describes the immediate effect of a statement.
- `WHY:` explains the design reason or tradeoff behind it.
- `BOUNDARY:` identifies where untrusted data or an architectural layer changes.
- `CHECK:` tells you what evidence should prove the line worked.
- `TODO:` marks code that you should write or adapt yourself.

Comments are attached to meaningful statements, not closing braces or self-explanatory punctuation. After completing a lesson, rewrite the behavior without copying, then remove comments that merely restate syntax. Keep comments that preserve a non-obvious decision, invariant, security rule, or operational warning.

Shell, TypeScript, SQL, Dockerfile, and YAML examples use their native comment syntax and remain copy-pasteable. Strict JSON cannot contain comments; each JSON example therefore has a field-by-field explanation immediately before it. Never paste pseudo-comments into a production JSON document.

Suggested checkpoints:

```text
checkpoint/01-workspace
checkpoint/02-react-data
checkpoint/03-api-crud
checkpoint/04-postgres-concurrency
checkpoint/04b-mongodb-adapter
checkpoint/05-containers
checkpoint/06-ci
checkpoint/07-aws
```

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

Exit check: explain the difference between a workspace, a project, a target, and a task. Then run one target twice and observe Nx’s cache.

### Lesson 0.2 — Start locally

The fastest complete path is Docker:

```bash
# WHAT: Copy documented local defaults without committing real secrets.
cp .env.example .env
# WHAT: Build images, create the network/volume, and start the complete stack.
docker compose up --build
```

Open `http://localhost:8080`. The database initialization scripts create 1,000 tasks so the virtualization lesson has meaningful data.

For a faster code/edit loop, run only PostgreSQL in Docker and both apps on the host:

```bash
# WHAT: Start only the stateful dependency while application code runs on the host.
docker compose up database -d
# WHAT: Apply versioned Prisma migrations to the empty learning database.
npm run db:migrate:deploy
# WHAT: Add the idempotent dataset used by pagination and virtualization labs.
npm run db:seed
# WHAT: Regenerate the typed client whenever the Prisma schema changes.
npm run prisma:generate
# WHAT: Start both Nx development targets with their fast edit/reload loops.
npm run dev
```

The web app runs on `http://localhost:4200`; Vite proxies `/api` to port 3000. Test the API:

```bash
# CHECK: Liveness proves that the Node process can answer without PostgreSQL.
curl http://localhost:3000/api/health/live
# CHECK: This crosses HTTP, validation, service, repository, and database boundaries.
curl 'http://localhost:3000/api/tasks?limit=2'
```

The MongoDB path is optional and intentionally runs the same API on port 3001 so you can compare both adapters:

```bash
# WHAT: Start a one-node replica set, apply indexes, and build the Mongoose-backed API.
npm run docker:mongo
# CHECK: Readiness reports `mongodb-mongoose` without changing the HTTP route.
curl http://localhost:3001/api/health/ready
# CHECK: Exercise the same public query contract through the second database.
curl 'http://localhost:3001/api/tasks?limit=2'
```

The single member is for transactions and change-stream exercises, not a production high-availability topology. To run the API development process on the host instead, start `mongodb` and `mongo-setup`, copy `.env.example`, set `DATABASE_CLIENT=mongoose`, and use the documented `127.0.0.1` URI with `directConnection=true`.

The Compose `migrate` service runs `prisma migrate deploy` once before the API starts. If a disposable learning database has drifted beyond a useful repair exercise, reset it with:

```bash
# WARNING: Remove Compose volumes and all local learning data they contain.
docker compose down --volumes
# WHAT: Recreate the database so initialization migrations run against a clean volume.
docker compose up --build
```

`--volumes` deletes the local learning database. Never treat that as a production migration strategy.

If you ran an earlier version of this lab that created tables through PostgreSQL init scripts, that volume has schema objects but no Prisma `_prisma_migrations` history. Reset only if the data is disposable. To preserve important data, back it up, compare/introspect the real schema, review the baseline migration, and only then mark `20260821000000_init` as applied with `prisma migrate resolve --applied 20260821000000_init`. Never mark a migration applied merely to silence an error; that command records history without executing its SQL.

Exit check: restart the PostgreSQL profile and the optional MongoDB profile, prove liveness and readiness for each selected adapter, and explain which checks should fail when its database is unavailable.

## Part 1 — React from intermediate to expert

### Lesson 1.1 — Routing as a loading boundary

Read `apps/web/src/app/app.tsx`.

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

Read `apps/web/src/pages/tasks-page.tsx`: `title` is local because no distant component needs it. Do not store derived values such as “number of open tasks” if you can calculate them from current data. Duplicated state eventually disagrees.

Lab: move the selected task filter into `?status=open` with `useSearchParams`. Refresh and share the URL. Compare that behavior with Zustand persistence.

Exit check: for every state value in your feature, name its authoritative source and lifetime.

### Lesson 1.3 — Zustand for client state, with narrow selectors

Read `apps/web/src/app/task.store.ts`.

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

Exit check: explain why actions belong beside store data and why async server-cache orchestration usually does not.

### Lesson 1.4 — TanStack Query: query keys are cache addresses

Read `apps/web/src/app/task.queries.ts` and `apps/web/src/main.tsx`.

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

Exit check: calculate requests per minute and approximate requests per second for 10,000 continuously active users at 30-second polling, then state the caching, jitter, or event-driven change you would evaluate first.

### Lesson 1.6 — Shared components without a design-system detour

Read `libs/frontend/ui/src/lib/button.tsx`.

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

Exit check: state the accessibility contract of each shared component, including focus, keyboard, disabled, and loading behavior.

### Lesson 1.7 — Virtualize only after rendering is the bottleneck

Read `apps/web/src/pages/performance-page.tsx`.

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

Exit check: state the thresholds and measurements that would justify this added complexity in your product.

## Part 2 — Node.js API engineering

### Lesson 2.1 — The composition root and separation of concerns

Read `apps/api/src/main.ts`.

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

Exit check: draw the import arrows. No arrow should point from a lower policy layer back into an app.

### Lesson 2.2 — CRUD and HTTP semantics

Read `libs/backend/core/src/lib/http/tasks.router.ts`.

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

Exit check: explain why a timeout does not prove the write failed.

### Lesson 2.3 — Zod validates at trust boundaries

Read `libs/backend/core/src/lib/tasks/task.schema.ts` and `libs/backend/core/src/lib/config.ts`.

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

Exit check: add a cross-field rule and one test that proves it runs at runtime.

### Lesson 2.4 — Prisma ORM by default; raw SQL by exception

Read `prisma/schema.prisma`, `prisma.config.ts`, and `libs/backend/core/src/lib/tasks/prisma-task.repository.ts`.

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

Keep raw SQL small and deliberate. Read `plain-sql.selectors.ts`:

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

Exit check: explain which layer owns the Prisma schema, generated client, domain contract, and public HTTP representation. Then demonstrate why a malicious title remains a value rather than executable SQL.

### Lesson 2.5 — One domain port, two persistence adapters

Read `task.repository.ts`, `persistence/persistence.ts`, `create-persistence.ts`, `mongoose.models.ts`, and `mongoose-task.repository.ts`.

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

Run a contract comparison:

```bash
# WHAT: Start both concrete APIs against independent databases.
docker compose up database migrate api -d
docker compose --profile mongodb up mongodb mongo-setup api-mongo -d

# CHECK: Create the same logical input through the Prisma API.
curl -sS -X POST http://localhost:3000/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Compare adapters","priority":"high"}'

# CHECK: Create it through the Mongoose API without changing the HTTP contract.
curl -sS -X POST http://localhost:3001/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Compare adapters","priority":"high"}'
```

Core lab (45 minutes): write a reusable repository contract test factory for create defaults, not-found behavior, stable list ordering, and deletion. Run the same factory once with an in-memory adapter and once with PostgreSQL.

Senior challenge (30 minutes): add MongoDB and prove literal search containing `.*`, stable pagination under tied timestamps, and stale-version classification. Run each database in a disposable, isolated schema/database so tests do not depend on order.

Expert extension (20 minutes): add the transaction rollback contract, then split a PostgreSQL-only reporting capability into a separate port instead of weakening it to fit MongoDB. A good abstraction preserves useful guarantees; it does not force every engine into the least expressive generic CRUD API.

The test suite—not the interface name—is evidence that adapters mean the same thing. If time expires, keep the core factory passing and move database-specific capabilities to the advanced lane; do not delete semantics from the port merely to make a fake green test.

Exit check: list the exact semantic promises in `TaskRepository`, then name three useful features that deliberately remain database-specific.

### Lesson 2.6 — Concurrency: I/O parallelism is not CPU parallelism

Read `readStats()` in both persistence adapters and the `/api/stats` endpoint in `create-app.ts`.

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

These queries are independent, so their waits can overlap. Neither Prisma nor Mongoose makes an unbounded workload safe: each driver still has a finite pool. `Promise.all` is fail-fast; it does not make JavaScript CPU work run on multiple cores. Unbounded `Promise.all` over thousands of inputs can exhaust connections, memory, file descriptors, or a downstream rate limit. Bound concurrency with a queue, semaphore, or worker count derived from the constrained resource.

The Node event loop handles many concurrent I/O operations efficiently when each callback does little synchronous work. Large JSON parsing, unsafe regular expressions, sync filesystem calls, and CPU-heavy loops block every request handled by that process.

Lab: introduce 200 ms of synchronous busy work into a route, load-test both `/health/live` and that route, then remove it. Observe tail latency, not only average latency.

Exit check: distinguish event-loop concurrency, libuv’s worker pool, `worker_threads`, multiple Node processes, and multiple ECS tasks.

### Lesson 2.7 — Worker threads for bounded CPU work

Read `libs/backend/core/src/lib/workers/fibonacci.ts`.

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

Exit check: explain when you would instead use `SELECT ... FOR UPDATE` and the cost of holding that lock.

### Lesson 2.9 — Middleware order is part of the security model

Read `libs/backend/core/src/lib/http/create-app.ts` from top to bottom:

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

Exit check: write a threat model covering asset, actor, entry point, control, residual risk, and monitoring signal.

### Lesson 2.10 — HTTPS and where TLS terminates

Read `apps/api/src/https-main.example.ts` for direct Node HTTPS:

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

Exit check: draw the plaintext and encrypted segments for browser → CloudFront → ALB → ECS.

### Lesson 2.11 — Error handling and graceful lifecycle

Read `errors.ts`, `middleware.ts`, and `apps/api/src/main.ts`.

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

Exit check: define retry policy by error class. Never retry validation errors; retry only known transient operations and only when idempotency is safe.

### Lesson 2.12 — File uploads to S3

Read `libs/backend/core/src/lib/http/uploads.router.ts`. It contains two patterns.

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

Exit check: for every mock, state which real failure it can no longer detect.

## Part 3 — PostgreSQL from CRUD to distributed data decisions

### Lesson 3.1 — Prisma schema, database constraints, and CRUD translation

Read `prisma/schema.prisma` and `prisma/migrations/20260821000000_init/migration.sql`. The Prisma model drives generated TypeScript, while the reviewed migration adds database constraints that remain authoritative if a buggy client bypasses Zod:

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

Exit check: explain why retrying only the last SQL statement can violate a multi-statement invariant.

### Lesson 3.3 — Database polling and competing workers

`infra/postgres/advanced-lab.sql` contains an atomic queue claim:

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

Exit check: describe the crash window between an S3 side effect and marking the job complete.

### Lesson 3.4 — Indexing: optimize measured access paths

Run the first query in `advanced-lab.sql`:

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

Exit check: calculate the global connection maximum for your desired ECS autoscaling range.

### Lesson 3.6 — Partitioning is not sharding

`advanced-lab.sql` creates a range-partitioned audit table:

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

Exit check: write the exact restore owner, frequency, target account/region, validation query, RPO, and RTO.

## Part 3B — MongoDB and Mongoose comparative labs

Complete the PostgreSQL lessons first. These labs are comparative: implement the same product contract in a document database, identify where the guarantees align, and keep engine-specific capabilities explicit. Do not translate SQL syntax word-for-word or conclude that one database is universally better.

### Lesson 3B.1 — Document modelling and layered validation

Read `mongoose.models.ts` and `task.schema.ts`.

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

Exit check: explain why Mongoose schema validation cannot protect data written by a different client that connects directly to MongoDB.

### Lesson 3B.2 — CRUD, lean reads, and native selectors

Open a shell:

```bash
# WHAT: Start and initialize the optional replica-set profile.
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

Exit check: name what Mongoose casting/middleware you lose when using `connection.db.collection()` and why that escape hatch belongs inside an adapter.

### Lesson 3B.3 — Atomic documents, optimistic concurrency, and transactions

MongoDB writes to one document atomically. The version-filtered update therefore needs no multi-document transaction. Completing a task also inserts a separate event, so that use case does need a transaction to preserve the repository contract.

Read `MongooseTaskRepository.complete()`:

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

Exit check: explain why having two adapters is valuable for learning but often unnecessary operational complexity in one production service.

## Part 4 — Docker and container configuration

### Lesson 4.1 — Image, container, volume, and network

- Image: immutable filesystem/configuration layers used to create containers.
- Container: a running isolated process created from an image.
- Volume: data whose lifecycle is independent of a container.
- Network: service discovery and connectivity boundary.

`compose.yaml` gives services DNS names. The Prisma API uses `database:5432` and the Mongoose API uses `mongodb:27017`, not `localhost`, because localhost inside either API container means that API container itself.

The PostgreSQL 18 official image changed its volume root to `/var/lib/postgresql`; this Compose file uses that path. PostgreSQL 17 and older images use `/var/lib/postgresql/data`. Pinning a major version is necessary but not sufficient—read upgrade notes before changing it.

Lab:

```bash
# WHAT: Start PostgreSQL and the one-shot Prisma migration/seed service.
docker compose up database migrate -d
# CHECK: Show declared services and their current health/runtime state.
docker compose ps
# CHECK: Confirm reviewed migrations and the idempotent seed completed successfully.
docker compose logs migrate
# CHECK: Resolve the service, authenticate, and query the durable learning volume.
docker compose exec database psql -U app -d learning -c 'select count(*) from tasks'

# WHAT: Start the optional replica set, idempotent setup, and second API profile.
docker compose --profile mongodb up mongodb mongo-setup api-mongo -d
# CHECK: Confirm the one-shot setup completed before the API accepted traffic.
docker compose --profile mongodb logs mongo-setup
# CHECK: Ask MongoDB for replica-set health and the primary member.
docker compose --profile mongodb exec mongodb mongosh --quiet --eval 'rs.status()'
```

Exit check: explain why database data survives `docker compose down` but not `docker compose down --volumes`.

### Lesson 4.2 — Multi-stage images and build context

Read both Dockerfiles. The API build stages are:

```dockerfile
# WHAT: Use the pinned Node major as the dependency-install foundation.
FROM node:24-alpine AS dependencies
# WHAT: Give every later relative path a predictable workspace root.
WORKDIR /workspace
# WHY: Copy manifests first so application source edits can reuse the dependency layer.
COPY package.json package-lock.json ./
# WHY: Install the lockfile's exact dependency graph; fail if it is out of sync.
RUN npm ci

# WHAT: Keep Prisma CLI/migrations in a one-shot image rather than every API replica.
FROM dependencies AS migration
COPY prisma.config.ts ./
COPY prisma ./prisma
# BOUNDARY: Production applies reviewed history without inserting learning seed data.
CMD ["npx", "prisma", "migrate", "deploy"]

# WHAT: Reuse installed build tooling in an intermediate compilation stage.
FROM dependencies AS build
# WHAT: Add source/configuration only after the cached dependency layer.
COPY . .
# WHAT: Regenerate the typed client without supplying deploy-time credentials.
RUN DATABASE_URL=postgresql://unused:unused@localhost:5432/unused npx prisma generate
# WHAT: Produce the optimized API bundle and its runtime metadata.
RUN npx nx build api --configuration=production

# BOUNDARY: Start a fresh stage so compilers and source do not enter the runtime image.
FROM node:24-alpine AS runtime
# WHAT: Tell libraries to disable development-only behavior.
ENV NODE_ENV=production
# WHAT: Use an application-owned working directory inside the runtime filesystem.
WORKDIR /app
# WHAT: Copy manifests so npm can reproduce only runtime dependencies.
COPY package.json package-lock.json ./
# WHY: Omit dev tooling and optional CLI peers, then remove npm's cache.
RUN npm ci --omit=dev --omit=optional && npm cache clean --force
# WHAT: Copy only the compiled API output from the build stage.
COPY --from=build /workspace/apps/api/dist ./dist
# SECURITY: Drop root privileges before accepting untrusted network requests.
USER node
# WHAT: Document the port expected by Compose/ECS; publishing is configured elsewhere.
EXPOSE 3000
# WHAT: Use exec-form startup so Node receives termination signals directly.
CMD ["node", "dist/main.js"]
```

The real workspace Dockerfile also copies each Nx project manifest before `npm ci`; inspect it while typing your version. Nx workspaces can declare project-level package metadata, so omitting those files can produce an incomplete dependency graph. Do not treat the shortened manifest section above as permission to skip files required by your chosen Nx layout. The placeholder URL is used only because Prisma CLI configuration validates URL shape during client generation; `prisma generate` does not connect, and no real credential enters an image layer. Compose overrides the migration command to run the idempotent learning seed after migration; the AWS one-shot task keeps the production command and never seeds demo rows.

`npm ci` is deterministic against the lockfile. The build toolchain stays out of the final application filesystem except for runtime production dependencies. The API runs as a non-root user. `.dockerignore` prevents `.git`, secrets, local dependencies, and build artifacts from bloating or leaking into the build context.

The web runtime is Nginx, not a Node development server. Fingerprinted assets receive long immutable caching; `index.html` does not, so it can point at the latest filenames. `try_files $uri /index.html` supports client-side routing.

For higher supply-chain assurance:

- Pin base images by digest and update them with automation.
- Generate and retain an SBOM/provenance attestation.
- Scan OS and language packages.
- Sign images and enforce trusted registries.
- Rebuild frequently; a clean scan today is not permanent.

Lab:

```bash
# WHAT: Build the API image from the repository root so Nx dependencies enter context.
docker build -f apps/api/Dockerfile -t nx-learning-api:local .
# CHECK: Inspect immutable configuration, layers, entrypoint, and runtime user metadata.
docker image inspect nx-learning-api:local
# CHECK: Attribute image size to the exact Dockerfile instruction that created each layer.
docker history nx-learning-api:local
```

Exit check: find the largest layer and decide whether reducing it materially improves pull time or attack surface.

### Lesson 4.3 — Runtime configuration and secrets

Configuration enters through environment variables and is validated once at startup. `.env.example` documents names without secrets. `.env` is ignored and is for local development only.

Rules:

- Never bake credentials into an image or pass secrets as Docker build arguments.
- Prefer workload identity—IAM task roles on ECS—over access keys.
- Fetch/attach sensitive values from Secrets Manager or Parameter Store.
- Rotate secrets and understand whether the application must restart to observe a new value.
- Separate environment-specific configuration from the immutable image.

Compose hardening in this project includes a read-only filesystem, `/tmp` tmpfs, `init: true`, health-based database dependencies, and an unprivileged API process. `DATABASE_CLIENT` changes only the composition factory. Each real deployment should provide only the credential URL for its selected adapter; do not distribute unused database secrets to the container. In production also define CPU/memory limits, log rotation, seccomp/capability policy, and graceful stop time.

Lab: remove a required environment variable, make it required in Zod, and verify the process fails before accepting traffic with a useful error.

Exit check: classify every environment variable as public config, sensitive config, or identity supplied by the platform.

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

Exit check: produce a five-minute triage checklist that starts with impact and recent changes.

## Part 5 — GitHub Actions CI/CD for the monorepo

### Lesson 5.1 — Continuous integration

Read `.github/workflows/ci.yml`.

```yaml
# SECURITY: Give the workflow token only read access unless a job proves it needs more.
permissions:
  contents: read

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
      # CHECK: Prove static policy, behavior, types, and production output together.
      - run: npx nx run-many -t lint,test,typecheck,build
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
# WHAT: Prove both concrete adapters satisfy the same product-level repository contract.
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

Exit check: identify which input changes invalidate each build output.

### Lesson 5.2 — Deployment with GitHub OIDC, not stored AWS keys

Read `.github/workflows/deploy.yml` and `infra/aws/github-oidc-trust-policy.json`.

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

Lab: add a staging environment with a separate role, ECS service, buckets, variables, and approval policy. Never make staging and production share a deploy role “for convenience.”

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

```bash
# WHAT: Resolve the authenticated account dynamically instead of hard-coding its id.
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
# WHAT: Create the version-controlled cost limit object in that exact account.
aws budgets create-budget \
  --account-id "$AWS_ACCOUNT_ID" \
  --budget file://infra/aws/budget.json
```

Add notifications in the console or with `--notifications-with-subscribers`. AWS Budget Actions can, after a threshold and either automatically or with approval, apply selected IAM/SCP controls or target supported EC2/RDS resources. They are still not a universal real-time spending cap: budget data is delayed, coverage is selective, and an Auto Scaling Group can replace a stopped instance. Use least privilege, teardown automation, service quotas, and an expiration tag such as `delete-after=2026-08-28` as additional controls.

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

Separate roles:

- **ECS execution role:** ECR pull, CloudWatch log delivery, Secrets Manager retrieval referenced by the task definition.
- **ECS task role:** permissions application code needs, for example `s3:PutObject` only on `arn:aws:s3:::nx-learning-uploads/uploads/*`.
- **GitHub deploy role:** changes deployment resources; the application can never assume it.

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

Exit check: stop one task during a two-task deployment and observe target deregistration plus uninterrupted requests.

### Lesson 6.9 — ECS on Fargate

Before creating the service:

1. Create CloudWatch log group `/ecs/nx-learning-api` with a finite retention period.
2. Replace placeholders in `infra/aws/ecs-task-definition.json`.
3. Create the execution role and task role described earlier.
4. Put `DATABASE_URL` and any temporary teaching API key in Secrets Manager. Prefer separate username/password fields or managed RDS secrets in a mature design.

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

The 21 August 2026 verification found no high-severity advisory in the lean API/web runtime tree when optional CLI peers are omitted, but it did find:

- Three moderate production findings from the Nx-generated React Router 6.30.3 chain. The audit recommends React Router DOM 6.30.6. Upgrade and rerun the full suite before deployment: `npm install react-router-dom@6.30.6`.
- Prisma CLI 7.9.1 currently pulls `@prisma/config` → `deepmerge-ts` 7.1.5, for which npm reports a high-severity recursive-merge stack-exhaustion advisory. Prisma's dependency is exact, and npm's forced suggestion is a breaking downgrade to Prisma 6, so do not force it. The lean runtime uses `npm ci --omit=dev --omit=optional`; the isolated migration image still contains the CLI, accepts only reviewed repository configuration/migrations, and should be rebuilt when Prisma publishes a compatible fix.
- High-severity development-tool findings in the current Nx 23.1.1 `brace-expansion` dependency and esbuild 0.27.7. The suggested forced Nx “fix” is a breaking downgrade, so do not apply it blindly. Keep Vite bound to localhost, do not feed untrusted glob input to tooling, watch the upstream Nx/Vite releases, and upgrade after compatibility tests.

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
