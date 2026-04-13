import { HTMLAttributes, forwardRef } from 'react';
import './skeleton.css';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'avatar' | 'button' | 'input' | 'card' | 'badge' | 'title' | 'paragraph';
  width?: string;
  height?: string;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, ...props }, ref) => {
    const variantClass = `skeleton-${variant}`;
    
    return (
      <div
        ref={ref}
        className={`skeleton ${variantClass} ${className || ''}`}
        style={{ width, height }}
        aria-label="Loading content"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export interface SkeletonButtonProps extends HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
}

export const SkeletonButton = forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ className, isLoading, ...props }, ref) => {
    if (!isLoading) return null;
    
    return (
      <div ref={ref} className={`skeleton skeleton-button ${className || ''}`} {...props} />
    );
  }
);

SkeletonButton.displayName = 'SkeletonButton';

export const SkeletonInput = forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ className, isLoading, ...props }, ref) => {
    if (!isLoading) return null;
    
    return (
      <div ref={ref} className={`skeleton skeleton-input ${className || ''}`} {...props} />
    );
  }
);

SkeletonInput.displayName = 'SkeletonInput';

export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ className, isLoading, ...props }, ref) => {
    if (!isLoading) return null;
    
    return (
      <div ref={ref} className={`skeleton skeleton-card ${className || ''}`} {...props} />
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonBadge = forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ className, isLoading, ...props }, ref) => {
    if (!isLoading) return null;
    
    return (
      <div ref={ref} className={`skeleton skeleton-badge ${className || ''}`} {...props} />
    );
  }
);

SkeletonBadge.displayName = 'SkeletonBadge';

export const SkeletonList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`skeleton-list ${className || ''}`} {...props}>
      {children}
    </div>
  )
);

SkeletonList.displayName = 'SkeletonList';

export const SkeletonParagraph = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`skeleton-paragraph ${className || ''}`} {...props}>
      {children}
    </div>
  )
);

SkeletonParagraph.displayName = 'SkeletonParagraph';