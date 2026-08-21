-- 1. Verify whether a query uses the partial index. Measure; do not guess.
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, title, created_at
FROM tasks
WHERE done = false
ORDER BY created_at DESC, id
LIMIT 50;

-- 2. Atomically claim queue work from competing Node processes.
WITH next_jobs AS (
  SELECT id
  FROM job_queue
  WHERE status = 'pending' AND available_at <= now()
  ORDER BY available_at, id
  FOR UPDATE SKIP LOCKED
  LIMIT 10
)
UPDATE job_queue AS jobs
SET status = 'processing', locked_at = now(), locked_by = 'worker-1'
FROM next_jobs
WHERE jobs.id = next_jobs.id
RETURNING jobs.*;

-- 3. Inspect slow or blocked work during the concurrency lesson.
SELECT pid, state, wait_event_type, wait_event, now() - query_start AS age, query
FROM pg_stat_activity
WHERE datname = current_database() AND pid <> pg_backend_pid()
ORDER BY query_start;

-- 4. A range-partitioned audit table for the partitioning lesson.
CREATE TABLE IF NOT EXISTS audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY,
  happened_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY (id, happened_at)
) PARTITION BY RANGE (happened_at);

CREATE TABLE IF NOT EXISTS audit_log_2026_08
PARTITION OF audit_log
FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
