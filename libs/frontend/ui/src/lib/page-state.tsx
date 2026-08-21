// WHAT: Accept any renderable React content without owning feature policy.
import type { ReactNode } from 'react';

// WHAT: Announce loading and empty states politely to assistive technology.
export function PageState({ children }: { children: ReactNode }) {
  return <p role="status">{children}</p>;
}

// BOUNDARY: Convert an unknown client failure into a safe user-facing message.
export function ErrorState({ error }: { error: unknown }) {
  // SECURITY: Show only the normalized Error message, never an arbitrary object dump.
  const message = error instanceof Error ? error.message : 'Unexpected error';
  // WHAT: Use an alert role because the operation has failed.
  return <p role="alert">Could not load this page: {message}</p>;
}