import { cn } from '../../lib/cn';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neu-bg disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' &&
          'bg-brand-600 text-white shadow-neu-sm hover:bg-brand-500 active:shadow-neu-inset-sm active:bg-brand-700',
        variant === 'secondary' &&
          'bg-neu-raised text-neu-text shadow-neu-sm hover:bg-white active:shadow-neu-inset-sm active:bg-neu-sunken/70',
        variant === 'ghost' && 'text-neu-muted hover:text-neu-text hover:bg-neu-sunken/60',
        variant === 'danger' &&
          'bg-risk-red text-white shadow-neu-sm hover:bg-red-600 active:shadow-neu-inset-sm',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
