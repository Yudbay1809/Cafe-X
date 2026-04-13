import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out cursor-pointer';
    
    const variantStyles = {
      primary: 'bg-gradient-to-r from-[var(--cx-brand)] to-[var(--cx-teal)] text-white hover:translate-y-[-1px] hover:shadow-lg',
      secondary: 'bg-gradient-to-r from-[var(--cx-brand-deep)] to-[#b86a2e] text-white hover:translate-y-[-1px] hover:shadow-lg',
      ghost: 'bg-[var(--cx-surface)] border border-[var(--cx-border)] text-[var(--cx-ink)] hover:bg-[var(--cx-surface-2)]',
      destructive: 'bg-[var(--cx-danger)] text-white hover:opacity-90',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm rounded-[var(--cx-radius-sm)]',
      md: 'px-4 py-2 text-base rounded-[var(--cx-radius-md)]',
      lg: 'px-6 py-3 text-lg rounded-[var(--cx-radius-lg)]',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${isLoading ? 'opacity-70 cursor-wait' : ''} ${className || ''}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';