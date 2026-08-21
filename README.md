# Nx full-stack learning lab

A minimal UI and production-minded curriculum covering React, Node.js, Prisma/PostgreSQL, Mongoose/MongoDB, Docker, GitHub Actions, and AWS.

Start with [FULLSTACK_TUTORIAL.md](./FULLSTACK_TUTORIAL.md). It contains the lesson order, heavily annotated copy-paste examples, exercises, AWS console walkthroughs, verification checks, and primary sources. The `WHAT`, `WHY`, `BOUNDARY`, `CHECK`, and `TODO` comments are teaching aids: type the implementation yourself, use the finished repository only as a reference, and keep only non-obvious decision comments in production-style code.

## Quick start

```bash
cp .env.example .env
npm ci
docker compose up --build
```

Open `http://localhost:8080`.

For local app processes with only PostgreSQL in Docker:

```bash
docker compose up database -d
npm run db:migrate:deploy
npm run db:seed
npm run prisma:generate
npm run dev
```

The web app is at `http://localhost:4200` and the API at `http://localhost:3000`.

For the optional MongoDB/Mongoose path, run the one-node replica-set lab and the
same API on port 3001:

```bash
# WHAT: Initialize MongoDB, its replica set, indexes, and the Mongoose-backed API.
npm run docker:mongo
# CHECK: The response identifies the adapter selected only at process composition.
curl http://localhost:3001/api/health/ready
```

To run the API on the host instead, start `mongodb` and `mongo-setup`, then set
`DATABASE_CLIENT=mongoose` using the documented `MONGODB_URL` from `.env.example`.

Before any deployment, read the dependency-advisory snapshot in the tutorial. The
generated React Router 6.30.3 dependency should be upgraded to the patched 6.30.6
release and the suite rerun.

## Verify

```bash
npm run prisma:validate
npm run prisma:generate
npm run lint
npm run test
npm run typecheck
npm run build
npm run format:check
```

## Projects

```text
apps/web              React app
apps/api              Express API
libs/frontend/ui      shared React components
libs/backend/core     domain, HTTP, persistence ports/adapters, S3, workers
prisma                schema, migration history, learning seed
infra/mongodb         replica-set and index setup for MongoDB labs
```
