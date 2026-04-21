'use client';

import { cartApi } from '@/features/cart/api/cartApi';
import { getSession } from '@/lib/session';
import { formatRupiah } from '@/lib/money';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { getEcho } from '@/services/echo';

export default function OrderStatusPage() {
  const search = useSearchParams();
  const tableToken = search.get('tableToken') || '';
  const orderId = Number(search.get('orderId') || 0);
  const [status, setStatus] = useState('loading');
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [lastOkAt, setLastOkAt] = useState<string>('');
  const session = getSession();
  const router = useRouter();
  const retryDelay = useRef(5000);

  const refresh = useCallback(async () => {
    if (!tableToken || !orderId) return;
    try {
      const response = await cartApi.getOrderStatus(tableToken, orderId);
      const r = response.data;
      setStatus(r.data.status);
      setTotal(r.data.total_amount);
      setDiscount(r.data.discount_amount || 0);
      setLastOkAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Failed to refresh order status', e);
      setStatus('error');
    }
  }, [tableToken, orderId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!orderId) return;

    const echo = getEcho();
    if (!echo) return;

    console.log(`Listening to order.${orderId} channel...`);
    const channel = echo.channel(`order.${orderId}`)
      .listen('.order.updated', (e: any) => {
        console.log('Order Status Update Received:', e);
        refresh();
      })
      .listen('.order.paid', (e: any) => {
        console.log('Order Payment Update Received:', e);
        refresh();
      })
      .listen('.order.cancelled', (e: any) => {
        console.log('Order Cancellation Received:', e);
        refresh();
      });

    return () => {
      channel.stopListening('.order.updated');
      channel.stopListening('.order.paid');
      channel.stopListening('.order.cancelled');
    };
  }, [orderId, refresh]);

  const steps = ['new', 'preparing', 'ready', 'served'];
  const statusIndex = steps.indexOf(status);
  const isPaid = status === 'paid';
  const isCanceled = status === 'canceled';
  const etaMap: Record<string, string> = {
    loading: 'Mengambil status…',
    new: 'Pesanan diterima. Estimasi 10–15 menit.',
    preparing: 'Sedang dibuat. Estimasi 5–10 menit.',
    ready: 'Sudah siap. Bisa diambil atau tunggu diantar.',
    served: 'Sudah diantar ke meja.',
    paid: 'Transaksi selesai.',
    canceled: 'Pesanan dibatalkan.',
    error: 'Koneksi tidak stabil. Mencoba lagi otomatis…',
  };
  const etaText = etaMap[status] || '-';
  const labelMap: Record<string, string> = {
    new: 'Diterima',
    preparing: 'Diproses',
    ready: 'Siap',
    served: 'Diantar',
    paid: 'Selesai',
    canceled: 'Batal',
  };
  const statusLabel = labelMap[status] || status;
  let footerMeta: React.ReactNode = null;
  if (status === 'error') {
    footerMeta = (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="small">Retry: {Math.round(retryDelay.current / 1000)}s</span>
        {lastOkAt ? <span className="small">Terakhir update: {lastOkAt}</span> : null}
      </div>
    );
  } else if (lastOkAt) {
    footerMeta = <p className="small">Terakhir update: {lastOkAt}</p>;
  }

  return (
    <main>
      <div className="hero">
        <div className="hero-top">
          <div>
            <div className="small">Cafe-X</div>
            <h1 className="hero-title">Status Order</h1>
            <div className="hero-sub">Order #{orderId}</div>
          </div>
          <button className="ghost" onClick={() => router.push(`/menu?tableToken=${encodeURIComponent(tableToken || session?.tableToken || '')}`)}>Pesan Lagi</button>
        </div>
        <div className="panel">
          <div className="status-steps" style={{ marginTop: 12 }}>
            {steps.map((s, idx) => {
              const isDone = isPaid ? true : statusIndex > -1 && idx < statusIndex;
              const isActive = status === s;
              return (
                <div key={s} className={`status-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                  {labelMap[s] || s}
                </div>
              );
            })}
            {isPaid ? <div className="status-step paid">{labelMap.paid}</div> : null}
            {isCanceled ? <div className="status-step canceled">{labelMap.canceled}</div> : null}
          </div>
        </div>
        <div className="panel">
          <p>
            Status: <b>{statusLabel}</b>
          </p>
          <p>{etaText}</p>
          <div className="divider" style={{ margin: '10px 0' }} />
          {order && (
            <>
              {order.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                  <span>Diskon</span>
                  <span>-{formatRupiah(order.discount_amount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, marginTop: 4, borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                <span>Total</span>
                <span>{formatRupiah(order.total_amount)}</span>
              </div>
              
              {order.status === 'paid' && order.member_name && (
                  <div className="card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', marginTop: 16 }}>
                      <div className="small" style={{ color: '#166534', fontWeight: 700 }}>Loyalty Points</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="small">{order.member_name}</span>
                          <b style={{ color: '#16a34a' }}>+{Math.floor(order.total_amount / 1000)} Pts</b>
                      </div>
                  </div>
              )}
            </>
          )}
          {session?.tableToken ? (
            <p className="small">Meja: {session.table?.table_name || session.tableToken}</p>
          ) : null}
          {footerMeta}
        </div>
      </div>
    </main>
  );
}
