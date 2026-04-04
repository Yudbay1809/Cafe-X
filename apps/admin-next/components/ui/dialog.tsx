import { ReactNode } from 'react';

export function Dialog({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-lg bg-white p-4 shadow-xl">{children}</div>
    </div>
  );
}
