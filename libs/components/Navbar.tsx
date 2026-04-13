import { HTMLAttributes, forwardRef, ReactNode } from 'react';

export interface NavbarProps extends HTMLAttributes<HTMLDivElement> {
  brand?: string;
  logo?: ReactNode;
  actions?: ReactNode;
}

export const Navbar = forwardRef<HTMLDivElement, NavbarProps>(
  ({ className, brand = 'Cafe-X', logo, actions, children, ...props }, ref) => {
    const baseStyles = 'sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[var(--cx-card)] border-b border-[var(--cx-border)] shadow-[var(--cx-shadow-sm)] transition-all duration-150 ease-out';
    
    return (
      <nav
        ref={ref}
        className={`${baseStyles} ${className || ''}`}
        role="navigation"
        aria-label="Main navigation"
        {...props}
      >
        <div className="flex items-center gap-3">
          {logo || (
            <div className="w-10 h-10 rounded-[var(--cx-radius-md)] bg-gradient-to-br from-[var(--cx-brand)] to-[#0a5c55] flex items-center justify-center text-white font-bold text-lg">
              {brand.charAt(0)}
            </div>
          )}
          <span className="text-xl font-bold text-[var(--cx-ink)] font-[var(--cx-font-display)]">
            {brand}
          </span>
        </div>
        
        {children && (
          <div className="flex items-center gap-4">
            {children}
          </div>
        )}
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </nav>
    );
  }
);

Navbar.displayName = 'Navbar';

export const NavbarLink = forwardRef<HTMLAnchorElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { href: string }>(
  ({ className, children, href, ...props }, ref) => (
    <a
      ref={ref}
      href={href}
      className={`px-4 py-2 text-sm font-medium text-[var(--cx-muted)] hover:text-[var(--cx-brand)] transition-colors duration-150 ${className || ''}`}
      {...props}
    >
      {children}
    </a>
  )
);
NavbarLink.displayName = 'NavbarLink';