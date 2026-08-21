import { render, screen } from '@testing-library/react';
import { App } from './app';

// CHECK: Preserve one scaffold smoke test while lesson-specific tests are still absent.
it('renders the workshop starter', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: /workshop starter/i }),
  ).toBeTruthy();
});
