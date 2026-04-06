import { ReactNode } from 'react';

export function Dialog({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-lg bg-white p-4 shadow-xl">{children}</div>
    </div>
  );
}

export function DialogContent({ children }: { children: ReactNode }) {
  return <div className="min-w-[320px] max-w-[680px]">{children}</div>;
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-3">{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}