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
  const [lastOkAt, setLastOkAt] = useState<string>('');
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
        setLastOkAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
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
          <p>Total: {formatRupiah(total)}</p>
          {session?.tableToken ? (
            <p className="small">Meja: {session.table?.table_name || session.tableToken}</p>
          ) : null}
          {footerMeta}
        </div>
      </div>
    </main>
  );
}
