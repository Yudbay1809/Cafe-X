const KEY = 'cafex_customer_favorites';

export function getFavorites(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]') as number[];
  } catch {
    return [];
  }
}

export function setFavorites(ids: number[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids))));
}

export function toggleFavorite(productId: number): number[] {
  const current = getFavorites();
  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId];
  setFavorites(next);
  return next;
}
