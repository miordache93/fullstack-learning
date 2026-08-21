-- WHAT: Ensure the default application schema exists on a fresh PostgreSQL database.
CREATE SCHEMA IF NOT EXISTS "public";

-- WHAT: Create the authoritative task table from the Prisma migration history.
CREATE TABLE "tasks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" varchar(200) NOT NULL,
  "description" text,
  "done" boolean NOT NULL DEFAULT false,
  "priority" varchar(10) NOT NULL DEFAULT 'medium',
  "version" integer NOT NULL DEFAULT 1,
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id"),
  -- INVARIANT: Database constraints remain authoritative if an API bug bypasses Zod.
  CONSTRAINT "tasks_title_nonblank" CHECK (length(trim("title")) > 0),
  CONSTRAINT "tasks_priority_supported" CHECK ("priority" IN ('low', 'medium', 'high')),
  CONSTRAINT "tasks_version_positive" CHECK ("version" > 0)
);

-- WHAT: Record task transitions for audit and future outbox-style lessons.
CREATE TABLE "task_events" (
  "id" BIGSERIAL NOT NULL,
  "task_id" uuid NOT NULL,
  "event_type" varchar(50) NOT NULL,
  "payload" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "task_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "task_events_task_id_fkey"
    FOREIGN KEY ("task_id") REFERENCES "tasks"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- WHAT: Store durable jobs used by the competing-poller SQL lab.
CREATE TABLE "job_queue" (
  "id" BIGSERIAL NOT NULL,
  "payload" jsonb NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "attempts" integer NOT NULL DEFAULT 0,
  "available_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "locked_at" timestamptz(6),
  "locked_by" text,
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "job_queue_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "job_queue_status_supported"
    CHECK ("status" IN ('pending', 'processing', 'done', 'failed'))
);

-- WHY: Support deterministic newest-first task reads.
CREATE INDEX "idx_tasks_created_at" ON "tasks"("created_at" DESC, "id");
-- WHY: Keep the hot incomplete-task access path small as completed history grows.
CREATE INDEX "idx_tasks_open_created_at"
  ON "tasks"("created_at" DESC, "id") WHERE "done" = false;
-- WHY: Make an individual task's event timeline inexpensive to retrieve.
CREATE INDEX "idx_task_events_task_created"
  ON "task_events"("task_id", "created_at" DESC);
-- WHY: Match the predicate and order used when workers claim available jobs.
CREATE INDEX "idx_job_queue_poll"
  ON "job_queue"("available_at", "id") WHERE "status" = 'pending';

-- WHAT: Emit a transient hint after a committed task change; the table remains durable truth.
CREATE FUNCTION "notify_task_change"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_notify(
    'task_changes',
    json_build_object('operation', TG_OP, 'id', COALESCE(NEW.id, OLD.id))::text
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER "task_change_notification"
AFTER INSERT OR UPDATE OR DELETE ON "tasks"
FOR EACH ROW EXECUTE FUNCTION "notify_task_change"();
