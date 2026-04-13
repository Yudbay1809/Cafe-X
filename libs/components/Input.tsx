import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    
    const baseStyles = 'w-full px-4 py-3 bg-[var(--cx-bg)] border border-[var(--cx-border)] rounded-[var(--cx-radius-md)] text-[var(--cx-ink)] font-[var(--cx-font-body)] transition-all duration-150 ease-out';
    const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-[var(--cx-ring)] focus:border-[var(--cx-brand)]';
    const errorStyles = error ? 'border-[var(--cx-danger)] focus:ring-[rgba(220,38,38,0.25)]' : '';

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--cx-ink)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseStyles} ${focusStyles} ${errorStyles} ${className || ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="text-sm text-[var(--cx-danger)]">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={`${inputId}-helper`} className="text-sm text-[var(--cx-muted)]">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';