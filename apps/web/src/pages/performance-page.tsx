import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export default function PerformancePage() {
  const rows = useMemo(
    () =>
      Array.from(
        { length: 10_000 },
        (_, index) => `Synthetic row ${index + 1}`,
      ),
    [],
  );
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 8,
  });

  return (
    <section>
      <h2>Virtualization laboratory</h2>
      <p>
        There are 10,000 logical rows, but only the visible window plus an
        overscan buffer exists in the DOM.
      </p>
      <div ref={parentRef} className="virtual-list">
        <div
          className="virtual-list__inner"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((row) => (
            <div
              className="synthetic-row"
              key={row.key}
              style={{
                height: row.size,
                transform: `translateY(${row.start}px)`,
              }}
            >
              {rows[row.index]}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
