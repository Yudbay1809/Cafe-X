import { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('inline-flex items-center rounded-md px-3 py-2 text-sm font-medium bg-[#6B4F3A] text-white hover:opacity-90', className)}
      {...props}
    />
  );
}
