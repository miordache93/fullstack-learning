// WHAT: Memoize the demonstration dataset and keep a ref to the scroll owner.
import { useMemo, useRef } from 'react';
// WHAT: Calculate the small visible window from the large logical collection.
import { useVirtualizer } from '@tanstack/react-virtual';

// WHAT: Reserve a lazy boundary for the later measurement and virtualization lab.
export default function PerformancePage() {
  // WHY: Keep data construction out of unrelated rerenders in this measurement lab.
  const rows = useMemo(() => Array.from({ length: 10_000 }, (_, index) => `Measured row ${index + 1}`), []);
  // BOUNDARY: This element, not the browser window, owns scroll position.
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    // WHAT: Keep all logical rows reachable by scrolling.
    count: rows.length,
    // BOUNDARY: Attach calculations to the actual scroll owner.
    getScrollElement: () => parentRef.current,
    // WHY: Initial geometry exists before any row is measured.
    estimateSize: () => 36,
    // WHY: A small off-screen buffer hides work during quick scrolling.
    overscan: 8,
  });

  return (
    <section>
      <h2>Rendering performance</h2>
      <p>10,000 logical rows; inspect how few row elements exist in the DOM.</p>
      <div
        ref={parentRef}
        // WHAT: Establish the bounded scroll viewport required by the virtualizer.
        style={{ height: 400, overflow: 'auto', border: '1px solid #d0d7de' }}
      >
        <div
          // WHY: Preserve full scrollbar geometry without rendering every row.
          style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              // WHY: Logical index is stable because this fixed dataset never reorders.
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: virtualRow.size,
                // WHAT: Move this small physical row to its logical scroll position.
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rows[virtualRow.index]}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}