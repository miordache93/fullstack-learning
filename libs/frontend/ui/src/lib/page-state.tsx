import type { ReactNode } from 'react';

export function PageState({ children }: { children: ReactNode }) {
  return <p role="status">{children}</p>;
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return <p role="alert">Could not load this page: {message}</p>;
}
