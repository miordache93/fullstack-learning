// WHAT: Page through the real dataset instead of holding it all in memory.
import { useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
// WHAT: Calculate the small visible window from the large logical collection.
import { useVirtualizer } from '@tanstack/react-virtual';
import { taskApi } from '../app/api';

const PAGE_SIZE = 200;

// WHAT: Prove the DOM stays bounded while network transfer grows only per requested page.
export default function PerformancePage() {
  // BOUNDARY: This element, not the browser window, owns scroll position.
  const parentRef = useRef<HTMLDivElement>(null);

  const query = useInfiniteQuery({
    queryKey: ['performance-tasks'],
    queryFn: ({ pageParam }) => taskApi.page({ offset: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 0,
    // WHAT: Stop once every server-reported row has been paged through.
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.length * PAGE_SIZE;
      return loaded < lastPage.page.total ? loaded : undefined;
    },
  });

  const rows = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages.at(-1)?.page.total;

  const virtualizer = useVirtualizer({
    // WHAT: Only rows fetched so far are reachable by scrolling.
    count: rows.length,
    // BOUNDARY: Attach calculations to the actual scroll owner.
    getScrollElement: () => parentRef.current,
    // WHY: Task titles/descriptions vary in length; this is a starting guess, not the truth.
    estimateSize: () => 56,
    // WHY: Task identity, not array position, so a mutable list keeps stable rows.
    getItemKey: (index) => rows[index].id,
    // WHY: A small off-screen buffer hides work during quick scrolling.
    overscan: 8,
  });

  return (
    <section>
      <h2>Rendering performance</h2>
      <p>
        {rows.length} of {total ?? '…'} tasks loaded from the server; inspect how few row elements
        exist in the DOM regardless of how many pages are loaded.
      </p>
      <div
        ref={parentRef}
        // WHAT: Establish the bounded scroll viewport required by the virtualizer.
        style={{ height: 400, overflow: 'auto', border: '1px solid #d0d7de' }}
      >
        <div
          // WHY: Preserve full scrollbar geometry without rendering every row.
          style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const task = rows[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                // WHY: Report each row's real rendered height instead of trusting the estimate.
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  // WHAT: Move this physical row to its logical scroll position.
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {task.title} — {task.description}
              </div>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={() => query.fetchNextPage()}
        disabled={!query.hasNextPage || query.isFetchingNextPage}
      >
        {query.isFetchingNextPage ? 'Loading…' : query.hasNextPage ? 'Load next page' : 'All tasks loaded'}
      </button>
    </section>
  );
}
