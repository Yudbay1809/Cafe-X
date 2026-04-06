'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function OrdersPage() {
  const [orderId, setOrderId] = useState(0);
  const [detail, setDetail] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const { t } = useI18n();

  async function load(nextPage = page) {
    try {
      setError('');
      const r = await adminApi.ordersList({
        status: status === 'all' ? undefined : status,
        q: query || undefined,
        limit,
        page: nextPage,
      });
      setItems(r.items || []);
      setTotal(r.total ?? r.items?.length ?? 0);
      setMsg(`Menampilkan ${r.items?.length ?? 0} dari ${r.total ?? 0}`);
    } catch (e: any) {
      setError(e.message || 'Gagal load orders');
    }
  }

  useEffect(() => {
    load(page);
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <RequireAuth>
      <AdminShell title={t('orders')} subtitle={t('ordersSubtitle')}>
        <div className="card">
          <div className="toolbar">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">{t('allStatus')}</option>
              <option value="new">New</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="served">Served</option>
              <option value="paid">Paid</option>
              <option value="canceled">Canceled</option>
            </select>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchOrder')} />
            <button
              className="btn"
              onClick={() => {
                setPage(1);
                load(1);
              }}
            >
              {t('search')}
            </button>
            <button
              className="btn outline"
              onClick={() => {
                setStatus('all');
                setQuery('');
                setPage(1);
                load(1);
              }}
            >
              {t('reset')}
            </button>
          </div>
          <p className="small">{msg}</p>
        </div>
        {error ? <div className="card">{error}</div> : null}
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>{t('orders')}</th>
                <th>{t('status')}</th>
                <th>{t('table')}</th>
                <th>{t('total')}</th>
                <th>{t('created')}</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id}>
                  <td><b>#{o.id}</b><div className="small">{o.order_no}</div></td>
                  <td><span className="pill">{o.status}</span></td>
                  <td>{o.table_code || '-'}</td>
                  <td>{formatRupiah(o.total_amount || 0)}</td>
                  <td className="small">{o.created_at}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn outline" onClick={async () => { setOrderId(o.id); setDetail(await adminApi.orderDetail(o.id)); setDetailOpen(true); }}>{t('detail')}</button>
                      <button className="btn ghost" onClick={async () => { await adminApi.orderStatus(o.id, 'preparing'); setMsg(`Order ${o.id} -> preparing`); await load(); }}>{t('preparing')}</button>
                      <button className="btn ghost" onClick={async () => { await adminApi.orderStatus(o.id, 'ready'); setMsg(`Order ${o.id} -> ready`); await load(); }}>{t('ready')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="toolbar" style={{ marginTop: 12, justifyContent: 'space-between' }}>
            <button className="btn outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <div className="small">Page {page} / {totalPages}</div>
            <button className="btn outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('detail')} #{detail?.order?.id || orderId}</DialogTitle>
            </DialogHeader>
            {detail ? (
              <div>
                <div className="small">{t('status')}: {detail.order?.status}</div>
                <div className="small">{t('total')}: {formatRupiah(detail.order?.total_amount || 0)}</div>
                <div style={{ height: 8 }} />
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail.items || []).map((it: any) => (
                      <tr key={it.id}>
                        <td>{it.product_name_snapshot}</td>
                        <td>{it.qty}</td>
                        <td>{formatRupiah(it.unit_price || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </AdminShell>
    </RequireAuth>
  );
}
