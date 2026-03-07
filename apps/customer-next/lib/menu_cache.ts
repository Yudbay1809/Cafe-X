import type { Product, TableInfo } from './types';

const KEY = 'cafex_customer_menu_cache';

export type MenuCache = {
  tableToken: string;
  table?: TableInfo | null;
  products: Product[];
  cachedAt: string;
};

export function setMenuCache(cache: MenuCache) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(cache));
}

export function getMenuCache(tableToken: string): MenuCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as MenuCache;
    if (data.tableToken !== tableToken) return null;
    return data;
  } catch {
    return null;
  }
}
