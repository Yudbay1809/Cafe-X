import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'danger';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 ease-out';
    
    const variantStyles = {
      neutral: 'bg-[var(--cx-bg-alt)] text-[var(--cx-ink)]',
      success: 'bg-[var(--cx-success)]/10 text-[var(--cx-success)] border border-[var(--cx-success)]/20',
      warning: 'bg-[var(--cx-warning)]/10 text-[var(--cx-warning)] border border-[var(--cx-warning)]/20',
      danger: 'bg-[var(--cx-danger)]/10 text-[var(--cx-danger)] border border-[var(--cx-danger)]/20',
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className || ''}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';