-- WHAT: Add enough deterministic demo rows to make pagination and virtualization measurable.
INSERT INTO tasks (title, description, priority, done)
SELECT
  'Learning task ' || number,
  'Generated seed row for pagination and virtualization practice.',
  (ARRAY['low', 'medium', 'high'])[1 + (number % 3)],
  number % 5 = 0
FROM generate_series(1, 1000) AS number
-- WHY: Make repeated local Compose starts idempotent instead of duplicating the dataset.
WHERE NOT EXISTS (SELECT 1 FROM tasks);
