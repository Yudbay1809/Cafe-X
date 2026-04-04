import { useMemo } from 'react';

export function usePagination(total: number, page: number, pageSize: number) {
  return useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return { totalPages, page, pageSize };
  }, [total, page, pageSize]);
}
