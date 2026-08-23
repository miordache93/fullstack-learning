# Nx full-stack learning lab

This branch is a deliberately small, buildable Nx starter. It contains one React app, one Node/Express app, one frontend library, and one backend library—but none of the lesson solutions.

Start with [FULLSTACK_TUTORIAL.md](./FULLSTACK_TUTORIAL.md). It gives you the dependency order, exact commented increments to type, failure experiments, and exit checks for React, Node.js, Prisma/PostgreSQL, Mongoose/MongoDB, Docker, GitHub Actions, and AWS.

## Prove the starter

```bash
# WHAT: Install exactly the dependency versions recorded for the workshop.
npm ci
# CHECK: Prove the four empty project shells still lint, test, type-check, and build.
npm run check
# WHAT: Run the minimal React and API processes before adding lesson behavior.
npm run dev
```

Open `http://localhost:4200`. In another terminal, prove the only initial API route:

```bash
# CHECK: This succeeds because it is the generated-style starter route.
curl -i http://localhost:3000/api
# CHECK: This returns 404 because you have not written task routing yet.
curl -i http://localhost:3000/api/tasks
```

There is intentionally no database configuration, Prisma schema, application route, Query hook, Zustand store, shared component, repository, Dockerfile, Compose file, workflow, or AWS template on this branch. You create each artifact when its lesson introduces the need and explains every meaningful line.

## Use cumulative learning branches

Start each lesson branch from the previous completed lesson, not from `workshop/start` again:

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

For example, `lesson/06-concurrency-transactions` includes the complete implementation from lessons 01–05 and adds only its own increment. The preserved local `solution/reference` branch keeps the facilitator implementation for recovery; avoid reading it until you have attempted the relevant exit check.

Database infrastructure is written by you in two deliberate interludes rather than appearing as a finished answer:

1. After Branch 04, complete Tutorial exercises 0.3A–0.3C to create the PostgreSQL-only `compose.yaml`.
2. Complete Branch 05, then return to 0.3D–0.3E to migrate, seed, and test PostgreSQL.
3. After Branch 06, complete 3B.0A–3B.0C to add `mongodb` and the idempotent `mongo-setup` job.
4. Complete Branch 07, then return to 3B.0D to run the host Mongoose API. Add application containers only after writing their Dockerfiles in Part 4.

The tutorial's “Mandatory navigation map” contains direct links for every jump and return.

## Files you will create

```text
apps/web              React composition, routes, pages, Query and Zustand
apps/api              process composition and lifecycle
libs/frontend/ui      shared accessible presentation components
libs/backend/core     domain, HTTP, persistence adapters, S3 and workers
prisma                schema, migrations, and learning seed
infra                 database, AWS, and operational exercises
.github/workflows     CI and deployment workflows
```

The Prisma, database, Docker, and deployment scripts in `package.json` are future lesson entry points. They are expected to fail until you create the files they require. `npm run check` is the starter proof that must remain green at every checkpoint.
