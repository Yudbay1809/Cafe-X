export type CartItem = {
  product_id: number;
  name: string;
  price: number;
  qty: number;
  notes?: string;
};

const KEY_PREFIX = 'cafex_customer_cart';

function normalizeToken(tableToken: string) {
  const v = (tableToken || '').trim();
  return v.length > 0 ? v : 'public';
}

function keyFor(tableToken: string) {
  return `${KEY_PREFIX}:${normalizeToken(tableToken)}`;
}

export function getCart(tableToken: string): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(keyFor(tableToken)) || '[]') as CartItem[];
  } catch {
    return [];
  }
}

export function setCart(tableToken: string, items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(keyFor(tableToken), JSON.stringify(items));
}

export function clearCart(tableToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(keyFor(tableToken));
}

export function addToCart(tableToken: string, item: CartItem) {
  const cart = getCart(tableToken);
  const i = cart.findIndex((x) => x.product_id === item.product_id);
  if (i >= 0) {
    cart[i].qty += item.qty;
    if (item.notes) cart[i].notes = item.notes;
  } else {
    cart.push(item);
  }
  setCart(tableToken, cart);
}

export function moveCart(fromToken: string, toToken: string): CartItem[] {
  const items = getCart(fromToken);
  if (items.length === 0) return [];
  setCart(toToken, items);
  clearCart(fromToken);
  return items;
}
