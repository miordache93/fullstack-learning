import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './app';

describe('App', () => {
  it('renders navigation', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        {/* WHAT: Start the declarative test router at a non-default route without browser history. */}
        <MemoryRouter initialEntries={['/architecture']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByRole('navigation')).toBeTruthy();
    expect(screen.getByText('Full-stack learning lab')).toBeTruthy();
  });
});
