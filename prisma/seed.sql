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