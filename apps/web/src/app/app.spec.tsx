// WHAT: Test the public route result with an in-memory history owner.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './app';

describe('App routing', () => {
  it('loads the task route at the root location', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    // CHECK: `findByRole` waits for the lazy route chunk to resolve.
    expect(await screen.findByRole('heading', { name: 'Tasks' })).toBeTruthy();
  });
});