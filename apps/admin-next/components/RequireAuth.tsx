'use client';

import { getSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (!getSession()?.token) router.push('/login');
  }, [router]);
  if (!getSession()?.token) return null;
  return <>{children}</>;
}
