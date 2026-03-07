'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { useI18n } from '@/components/I18nProvider';
import { adminApi } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Page() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ orders: 0, reports: 0, tables: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [orders, tables, summary] = await Promise.all([
          adminApi.ordersList({ limit: 1 }),
          adminApi.tables(),
          adminApi.reportSummary().catch(() => null),
        ]);
        setStats({
          orders: orders.items?.length ?? 0,
          tables: tables.items?.length ?? 0,
          reports: summary?.total_orders ?? summary?.total_transactions ?? 0,
        });
      } catch (e: any) {
        setError(e.message || 'Gagal memuat dashboard');
      }
    }
    load();
  }, []);

  return (
    <RequireAuth>
      <AdminShell title={t('dashboard')} subtitle={t('dashboardSubtitle')}>
        <div className="card">
          <h1>{t('dashboard')}</h1>
          <p className="small">{t('dashboardSubtitle')}</p>
        </div>
        <div className="grid3">
          <div className="card">
            <div className="small">{t('orders')}</div>
            <h2>{stats.orders}</h2>
          </div>
          <div className="card">
            <div className="small">{t('reports')}</div>
            <h2>{stats.reports}</h2>
          </div>
          <div className="card">
            <div className="small">{t('tables')}</div>
            <h2>{stats.tables}</h2>
          </div>
        </div>
        {error ? <div className="card">{error}</div> : null}
      </AdminShell>
    </RequireAuth>
  );
}
