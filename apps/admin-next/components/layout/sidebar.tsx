import { ReactNode } from 'react';

export function Sidebar({ children }: { children: ReactNode }) {
  return <aside className="w-60 bg-slate-900 text-white h-full">{children}</aside>;
}
