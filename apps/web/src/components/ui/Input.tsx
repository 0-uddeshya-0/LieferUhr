import { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// forwardRef is required so react-hook-form's register() can attach to the
// underlying input element.
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neu-text">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-xl text-sm bg-neu-bg shadow-neu-inset text-neu-text placeholder:text-neu-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 transition-shadow',
          error && 'ring-2 ring-risk-red',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-risk-red">{error}</p>}
    </div>
  );
});
