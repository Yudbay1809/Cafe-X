import { getSession } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:9000/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function requestId() {
  return crypto.randomUUID();
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const s = getSession();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId(),
      ...(s?.token ? { Authorization: `Bearer ${s.token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  const json = await res.json();
  const successFlag = typeof json.success === 'boolean' ? json.success : (typeof json.ok === 'boolean' ? json.ok : undefined);
  if (!res.ok || successFlag === false) throw new ApiError(res.status, json.message || 'Request gagal');
  let payload: any = json.data ?? json;
  if (payload && typeof payload === 'object' && typeof payload.ok === 'boolean' && payload.data !== undefined) {
    payload = payload.data;
  }
  return payload as T;
}

export const adminApi = {
  login: (payload: { username: string; password: string; device_name: string }) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId() },
      body: JSON.stringify(payload),
    }).then((r) => r.json()),
  products: () => api<{ items: any[] }>('/master/products'),
  productsList: (params?: { q?: string; category?: string; active?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.category) qs.set('category', params.category);
    if (typeof params?.active === 'boolean') qs.set('active', params.active ? '1' : '0');
    const query = qs.toString();
    return api<{ items: any[] }>(`/products${query ? `?${query}` : ''}`);
  },
  productCreate: (body: any) => api('/products', { method: 'POST', body: JSON.stringify(body) }),
  productUpdate: (id: number, body: any) => api(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  productDelete: (id: number) => api(`/products/${id}`, { method: 'DELETE' }),
  tables: () => api<{ items: any[] }>('/master/tables'),
  upsertTable: (body: any) => api('/tables/upsert', { method: 'POST', body: JSON.stringify(body) }),
  shiftOpen: (opening_cash: number, notes = '') => api('/shift/open', { method: 'POST', body: JSON.stringify({ opening_cash, notes }) }),
  shiftClose: (closing_cash: number, notes = '') => api('/shift/close', { method: 'POST', body: JSON.stringify({ closing_cash, notes }) }),
  ordersCreate: (source = 'POS') => api<{ order_id: number }>('/orders/create', { method: 'POST', body: JSON.stringify({ source }) }),
    ordersList: (params?: { status?: string; q?: string; limit?: number; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.q) qs.set('q', params.q);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.toString();
    return api<{ items: any[]; page: number; limit: number; total: number }>(`/orders${query ? `?${query}` : ''}`);
  },  outlets: () => api<{ items: any[] }>('/outlets'),
  outletUpdateBrand: (id: number, body: any) => api(`/outlets/${id}/brand`, { method: 'PUT', body: JSON.stringify(body) }),
  orderDetail: (id: number) => api<{ order: any; items: any[] }>(`/orders/${id}`),
  orderStatus: (order_id: number, status: string) => api('/orders/status', { method: 'POST', body: JSON.stringify({ order_id, status }) }),
  reportSummary: () => api('/reports/summary'),
  reportSales: (params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const query = qs.toString();
    return api(`/reports/sales${query ? `?${query}` : ''}`);
  },
  reportProducts: (params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const query = qs.toString();
    return api(`/reports/products${query ? `?${query}` : ''}`);
  },
  reportDaily: (params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const query = qs.toString();
    return api(`/reports/daily${query ? `?${query}` : ''}`);
  },
  reportShift: (shiftId?: number) => api(`/reports/shift${shiftId ? `?shift_id=${shiftId}` : ''}`),
  auditLogs: (params?: { event?: string; actor?: string; entity?: string; from?: string; to?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.event) qs.set('event', params.event);
    if (params?.actor) qs.set('actor', params.actor);
    if (params?.entity) qs.set('entity', params.entity);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return api<{ items: any[]; page: number; limit: number; total: number }>(`/audit-logs${query ? `?${query}` : ''}`);
  },
};






