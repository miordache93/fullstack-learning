// WHAT: Preserve the browser's complete native button contract.
import type { ButtonHTMLAttributes } from 'react';

// WHAT: Add only the small semantic vocabulary shared by real consumers.
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  // WHY: A finite union prevents unsupported visual meanings.
  variant?: 'primary' | 'danger' | 'secondary';
};

// WHAT: Supply safe defaults while forwarding every other native attribute.
export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    // WHY: `button` avoids accidental form submission unless a caller opts into `submit`.
    <button type={type} className={`button button--${variant} ${className}`.trim()} {...props} />
  );
}