import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('forwards native button behavior', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
