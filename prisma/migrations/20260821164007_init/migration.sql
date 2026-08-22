-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "priority" VARCHAR(10) NOT NULL DEFAULT 'medium',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id"),
    -- INVARIANT: Storage still rejects whitespace-only titles if another writer bypasses Zod.
    CONSTRAINT "tasks_title_nonblank" CHECK (length(trim("title")) > 0),
    -- INVARIANT: Storage and the API share the supported priority vocabulary.
    CONSTRAINT "tasks_priority_supported" CHECK ("priority" IN ('low', 'medium', 'high')),
    -- INVARIANT: Optimistic-concurrency tokens remain positive.
    CONSTRAINT "tasks_version_positive" CHECK ("version" > 0)
);

-- CreateIndex
CREATE INDEX "idx_tasks_created_at" ON "tasks"("created_at" DESC, "id");
-- WHY: Keep the hot incomplete-task path small as completed history grows.
CREATE INDEX "idx_tasks_open_created_at"
  ON "tasks"("created_at" DESC, "id") WHERE "done" = false;