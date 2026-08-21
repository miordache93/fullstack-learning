# Nx full-stack learning lab

A minimal UI and production-minded curriculum covering React, Node.js, Prisma/PostgreSQL, Mongoose/MongoDB, Docker, GitHub Actions, and AWS.

Start with [FULLSTACK_TUTORIAL.md](./FULLSTACK_TUTORIAL.md). It contains the lesson order, annotated application examples, learner-authored infrastructure exercises, AWS console walkthroughs, verification checks, and primary sources. The `WHAT`, `WHY`, `BOUNDARY`, `CHECK`, and `TODO` comments are teaching aids: type the implementation yourself and keep only non-obvious decision comments in production-style code.

## Start the learning path

```bash
cp .env.example .env
npm ci
npm run dev
```

Open `http://localhost:4200`. API liveness should work while database readiness initially fails; Lesson 0.3 then asks you to create `compose.yaml` yourself and add PostgreSQL one concern at a time.

`compose.yaml`, `.dockerignore`, both application Dockerfiles, the Nginx configuration, and the MongoDB topology script are intentionally absent. Lessons 0.3, 3B.0, 4.2, and 4.3 provide exact, commented increments for you to type and verify—without placing the completed files in the starter.

After building the PostgreSQL service in Lesson 0.3, run local application processes against it:

```bash
docker compose up database -d
npm run db:migrate:deploy
npm run db:seed
npm run prisma:generate
npm run dev
```

The host web app is at `http://localhost:4200` and the host API at `http://localhost:3000`.

After writing the migration, image, and service files in Part 4, smoke-test the stack you assembled:

```bash
# CHECK: Build the images and reconcile the final dependency graph you created.
docker compose up --build -d --wait
# CHECK: Cross Nginx, the API readiness boundary, and PostgreSQL through one URL.
curl http://localhost:8080/api/health/ready
```

For the optional MongoDB/Mongoose path, run the one-node replica-set lab and the
same API on port 3001:

```bash
# CHECKPOINT: Use this convenience script only after building `api-mongo` in Lesson 4.3.
# WHAT: Initialize MongoDB, its replica set, indexes, and the Mongoose-backed API.
npm run docker:mongo
# CHECK: The response identifies the adapter selected only at process composition.
curl http://localhost:3001/api/health/ready
```

To run the API on the host instead, start `mongodb` and `mongo-setup`, then set
`DATABASE_CLIENT=mongoose` using the documented `MONGODB_URL` from `.env.example`.

Before any deployment, rerun both production and full dependency audits and read the time-stamped risk disposition in the tutorial; advisory state changes over time.

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
