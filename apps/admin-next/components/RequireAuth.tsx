'use client';

import { getSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getSession()?.token) router.push('/login');
  }, [router]);

  if (!mounted || !getSession()?.token) return null;
  return <>{children}</>;
}
