'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function KitchenPage() {
  const [orderId, setOrderId] = useState(0);
  const [msg, setMsg] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const { t } = useI18n();

  async function update(status: string) {
    await adminApi.orderStatus(orderId, status);
    setMsg(`Order ${orderId} -> ${status}`);
  }

  async function load() {
    try {
      setError('');
      const r = await adminApi.ordersList({ status: 'new', limit: 100 });
      const r2 = await adminApi.ordersList({ status: 'preparing', limit: 100 });
      setItems([...(r.items || []), ...(r2.items || [])]);
    } catch (e: any) {
      setError(e.message || 'Gagal load kitchen board');
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <RequireAuth>
      <AdminShell title={t('kitchen')} subtitle={t('kitchenSubtitle')}>
        {error ? <div className="card">{error}</div> : null}
        <div className="card">
          <h3>{t('kitchenBoard')}</h3>
          <input type="number" value={orderId} onChange={(e) => setOrderId(Number(e.target.value))} placeholder="Order ID" />
          <div className="grid2" style={{ marginTop: 8 }}>
            <button className="btn ghost" onClick={() => update('preparing')}>new -&gt; preparing</button>
            <button className="btn ghost" onClick={() => update('ready')}>preparing -&gt; ready</button>
          </div>
          <p className="small">{msg}</p>
        </div>
        <div className="grid2">
          <div className="card">
            <h3>{t('new')}</h3>
            {(items || []).filter((o) => o.status === 'new').map((o) => (
              <div className="card" key={`new-${o.id}`}>
                <b>#{o.id}</b> <span className="small">{o.table_code || '-'}</span>
                <div className="small">{o.order_no}</div>
                <div style={{ marginTop: 8 }}>
                  <button className="btn ghost" onClick={async () => { await adminApi.orderStatus(o.id, 'preparing'); await load(); }}>{t('start')}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>{t('preparing')}</h3>
            {(items || []).filter((o) => o.status === 'preparing').map((o) => (
              <div className="card" key={`prep-${o.id}`}>
                <b>#{o.id}</b> <span className="small">{o.table_code || '-'}</span>
                <div className="small">{o.order_no}</div>
                <div style={{ marginTop: 8 }}>
                  <button className="btn ghost" onClick={async () => { await adminApi.orderStatus(o.id, 'ready'); await load(); }}>{t('ready')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}

