'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function KitchenPage() {
  const [orderId, setOrderId] = useState(0);
  const [msg, setMsg] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const { t } = useI18n();
  const retryDelay = useRef(5000);
  const timerRef = useRef<any>(null);

  async function update(status: string) {
    await adminApi.orderStatus(orderId, status);
    setMsg(`Order ${orderId} -> ${status}`);
    await load();
  }

  async function load() {
    try {
      setError('');
      const [r1, r2, r3] = await Promise.all([
        adminApi.ordersList({ status: 'new', limit: 100 }),
        adminApi.ordersList({ status: 'preparing', limit: 100 }),
        adminApi.ordersList({ status: 'ready', limit: 100 }),
      ]);
      setItems([...(r1.items || []), ...(r2.items || []), ...(r3.items || [])]);
    } catch (e: any) {
      setError(e.message || 'Gagal load kitchen board');
      throw e;
    }
  }

  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        await load();
        retryDelay.current = 5000;
      } catch {
        retryDelay.current = Math.min(retryDelay.current * 2, 30000);
      }
      if (!active) return;
      timerRef.current = setTimeout(tick, retryDelay.current);
    };
    tick();
    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <RequireAuth>
      <AdminShell title={t('kitchen')} subtitle={t('kitchenSubtitle')}>
        {error ? <div className="card">{error}</div> : null}
        <div className="card">
          <h3>{t('kitchenBoard')}</h3>
          <input type="number" value={orderId} onChange={(e) => setOrderId(Number(e.target.value))} placeholder="Order ID" />
          <div className="grid3" style={{ marginTop: 8 }}>
            <button className="btn ghost" onClick={() => update('preparing')}>new -&gt; preparing</button>
            <button className="btn ghost" onClick={() => update('ready')}>preparing -&gt; ready</button>
            <button className="btn ghost" onClick={() => update('served')}>ready -&gt; served</button>
          </div>
          <p className="small">{msg}</p>
        </div>
        <div className="grid3 kitchen-board">
          <div className="card kitchen-column">
            <h3>{t('new')}</h3>
            {(items || []).filter((o) => o.status === 'new').map((o) => (
              <div className="card kitchen-item" key={`new-${o.id}`}>
                <b>#{o.id}</b> <span className="small">{o.table_code || '-'}</span>
                <div className="small">{o.order_no}</div>
                <div style={{ marginTop: 8 }}>
                  <button className="btn ghost" onClick={async () => { await adminApi.orderStatus(o.id, 'preparing'); await load(); }}>{t('start')}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="card kitchen-column">
            <h3>{t('preparing')}</h3>
            {(items || []).filter((o) => o.status === 'preparing').map((o) => (
              <div className="card kitchen-item" key={`prep-${o.id}`}>
                <b>#{o.id}</b> <span className="small">{o.table_code || '-'}</span>
                <div className="small">{o.order_no}</div>
                <div style={{ marginTop: 8 }}>
                  <button className="btn ghost" onClick={async () => { await adminApi.orderStatus(o.id, 'ready'); await load(); }}>{t('ready')}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="card kitchen-column">
            <h3>{t('ready')}</h3>
            {(items || []).filter((o) => o.status === 'ready').map((o) => (
              <div className="card kitchen-item" key={`ready-${o.id}`}>
                <b>#{o.id}</b> <span className="small">{o.table_code || '-'}</span>
                <div className="small">{o.order_no}</div>
                <div style={{ marginTop: 8 }}>
                  <button className="btn ghost" onClick={async () => { await adminApi.orderStatus(o.id, 'served'); await load(); }}>served</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}



