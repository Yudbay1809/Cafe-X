import { ReactNode } from 'react';

export function Header({ children }: { children: ReactNode }) {
  return <header className="flex items-center justify-between p-4 border-b border-slate-100">{children}</header>;
}
