'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const tableToken = search.get('tableToken');
    const error = search.get('error');
    const params = new URLSearchParams();
    if (tableToken) params.set('tableToken', tableToken);
    if (error) params.set('error', error);
    const qs = params.toString();
    router.replace(`/menu${qs ? `?${qs}` : ''}`);
  }, [router, search]);

  return null;
}