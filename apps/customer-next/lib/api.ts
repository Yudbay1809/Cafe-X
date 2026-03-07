import type { ApiResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:9000/api/v1';

function toOrigin(base: string) {
  try {
    const url = new URL(base);
    url.pathname = '';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return 'http://127.0.0.1:9000';
  }
}

export const API_ORIGIN = toOrigin(API_BASE);

function requestId() {
  return crypto.randomUUID();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId(),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok || json.ok === false) {
    throw new ApiError(res.status, json.message || 'Request gagal');
  }
  return json;
}

export const customerApi = {
  menu: (tableToken: string) =>
    request<{ table: { table_code: string; table_name: string; is_active?: boolean }; products: any[] }>(`/qr/menu/${tableToken}`),
  publicMenu: () =>
    request<{ tenant_id: number; products: any[] }>(`/public/menu`),
  tableTokenByCode: (tableCode: string) =>
    request<{ table_token: string; table: { table_code: string; table_name: string } }>(`/qr/table-token/${encodeURIComponent(tableCode)}`),
  placeOrder: (payload: { table_token: string; notes?: string; items: Array<{ product_id: number; qty: number; notes?: string }> }) =>
    request<{ order_id: number; order_no: string; status: string; total_amount: number }>('/qr/place-order', {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify(payload),
    }),
  orderStatus: (tableToken: string, orderId: number) => request<{ order_id: number; order_no: string; status: string; total_amount: number }>(`/qr/order-status/${tableToken}/${orderId}`),
};
