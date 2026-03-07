'use client';

import { customerApi } from '@/lib/api';
import { getSession } from '@/lib/session';
import { formatRupiah } from '@/lib/money';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function OrderStatusPage() {
  const search = useSearchParams();
  const tableToken = search.get('tableToken') || '';
  const orderId = Number(search.get('orderId') || 0);
  const [status, setStatus] = useState('loading');
  const [total, setTotal] = useState(0);
  const session = getSession();
  const router = useRouter();
  const retryDelay = useRef(5000);

  useEffect(() => {
    if (!tableToken || !orderId) return;
    let active = true;
    const tick = async () => {
      try {
        const r = await customerApi.orderStatus(tableToken, orderId);
        if (!active) return;
        setStatus(r.data.status);
        setTotal(r.data.total_amount);
        retryDelay.current = 5000;
      } catch {
        if (!active) return;
        setStatus('error');
        retryDelay.current = Math.min(retryDelay.current * 2, 30000);
      }
      if (!active) return;
      setTimeout(tick, retryDelay.current);
    };
    tick();
    return () => {
      active = false;
    };
  }, [tableToken, orderId]);

  return (
    <main>
      <div className="card">
        <h1>Status Order</h1>
        <p>Order #{orderId}</p>
        <div className="status-steps" style={{ marginTop: 12 }}>
          {['new', 'preparing', 'ready', 'served'].map((s) => {
            const isDone = ['new', 'preparing', 'ready', 'served'].indexOf(s) < ['new', 'preparing', 'ready', 'served'].indexOf(status);
            const isActive = status === s;
            return (
              <div key={s} className={`status-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                {s}
              </div>
            );
          })}
        </div>
        <p>Status: <b>{status}</b></p>
        <p>Total: {formatRupiah(total)}</p>
        {session?.tableToken ? (
          <p className="small">Meja: {session.table?.table_name || session.tableToken}</p>
        ) : null}
        <div style={{ marginTop: 12 }}>
          <button onClick={() => router.push(`/menu?tableToken=${encodeURIComponent(tableToken || session?.tableToken || '')}`)}>
            Pesan Lagi
          </button>
        </div>
      </div>
    </main>
  );
}
