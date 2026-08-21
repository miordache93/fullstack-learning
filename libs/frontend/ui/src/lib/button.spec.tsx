// WHAT: Test behavior visible to a consumer rather than implementation details.
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('keeps native semantics and forwards interaction', () => {
    const onClick = vi.fn();
    // WHAT: Render the component through its public props.
    render(<Button onClick={onClick}>Save</Button>);
    // CHECK: A real accessible role and name locate the control.
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.getAttribute('type')).toBe('button');
    // WHAT: Exercise the browser-level interaction the caller depends on.
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});