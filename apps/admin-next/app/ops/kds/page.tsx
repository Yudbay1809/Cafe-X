'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { getEcho } from '@/services/echo';
import { useEffect, useState, useCallback } from 'react';

type Order = {
  id: number;
  order_no: string;
  status: string;
  table_code: string;
  created_at: string;
};

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.ordersList({ limit: 100 });
      // Filter only active for KDS
      const active = (res.items || []).filter((o: any) => 
        ['new', 'preparing', 'ready'].includes(o.status)
      );
      setOrders(active);
    } catch (e) {
      console.error('KDS load failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel('orders')
      .listen('.order.placed', () => load())
      .listen('.order.updated', () => load());

    return () => {
      channel.stopListening('.order.placed');
      channel.stopListening('.order.updated');
    };
  }, [load]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await adminApi.orderStatus(id, status);
      // Echo will trigger refresh
    } catch (e) {
      alert('Gagal update status');
    }
  };

  const columns = [
    { id: 'new', label: 'DITERIMA (NEW)', color: '#3b82f6' },
    { id: 'preparing', label: 'DIPROSES (PREPARING)', color: '#f59e0b' },
    { id: 'ready', label: 'SIAP (READY)', color: '#10b981' },
  ];

  return (
    <RequireAuth>
      <AdminShell title="Kitchen Display System" subtitle="Manajemen Pesanan Real-time">
        <div className="kds-grid">
          {columns.map(col => (
            <div key={col.id} className="kds-column">
              <div className="kds-column-header" style={{ borderTop: `4px solid ${col.color}` }}>
                {col.label}
              </div>
              <div className="kds-column-body">
                {orders.filter(o => o.status === col.id).map(order => (
                  <div key={order.id} className="kds-card">
                    <div className="kds-card-header">
                      <span className="kds-card-no">#{order.id}</span>
                      <span className="kds-card-table">{order.table_code || 'TA'}</span>
                    </div>
                    <div className="kds-card-time">{order.created_at}</div>
                    <div className="kds-card-actions">
                      {col.id === 'new' && (
                        <button className="btn sm" onClick={() => updateStatus(order.id, 'preparing')}>Mulai Masak</button>
                      )}
                      {col.id === 'preparing' && (
                        <button className="btn sm success" onClick={() => updateStatus(order.id, 'ready')}>Selesaikan</button>
                      )}
                      {col.id === 'ready' && (
                        <button className="btn sm ghost" onClick={() => updateStatus(order.id, 'served')}>Sajikan</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <style jsx>{`
          .kds-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            height: calc(100vh - 200px);
            align-items: start;
          }
          .kds-column {
            background: #f8fafc;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            max-height: 100%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .kds-column-header {
            padding: 16px;
            font-weight: 700;
            background: #fff;
            border-radius: 12px 12px 0 0;
            font-size: 0.875rem;
            letter-spacing: 0.05em;
          }
          .kds-column-body {
            padding: 12px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .kds-card {
            background: #fff;
            border-radius: 8px;
            padding: 16px;
            border: 1px solid #e2e8f0;
            transition: transform 0.2s;
          }
          .kds-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          .kds-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .kds-card-no {
            font-weight: 800;
            font-size: 1.1rem;
          }
          .kds-card-table {
            background: #1e293b;
            color: #fff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
          }
          .kds-card-time {
            font-size: 0.75rem;
            color: #64748b;
            margin-bottom: 12px;
          }
          .kds-card-actions {
            display: flex;
            gap: 8px;
          }
          .btn.sm {
            padding: 6px 12px;
            font-size: 0.75rem;
            width: 100%;
          }
        `}</style>
      </AdminShell>
    </RequireAuth>
  );
}
