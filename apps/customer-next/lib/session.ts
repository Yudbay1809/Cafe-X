import type { TableInfo } from './types';

const KEY = 'cafex_customer_session';

export type CustomerSession = {
  tableToken: string;
  table?: TableInfo;
  lastOrderId?: number;
  lastOrderNo?: string;
  lastOrderItems?: Array<{ product_id: number; name: string; price: number; qty: number; notes?: string }>;
};

export function getSession(): CustomerSession | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null') as CustomerSession | null;
  } catch {
    return null;
  }
}

export function setSession(session: CustomerSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

