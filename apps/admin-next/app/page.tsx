'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { useI18n } from '@/components/I18nProvider';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';
import { useEffect, useState } from 'react';

export default function Page() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ orders: 0, sales: 0, tables: 0, date: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [tables, summary] = await Promise.all([
          adminApi.tables(),
          adminApi.reportSummary().catch(() => null),
        ]);
        setStats({
          orders: summary?.orders_count ?? 0,
          sales: summary?.sales_total ?? 0,
          tables: tables.items?.length ?? 0,
          date: summary?.date ?? '',
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
          {stats.date ? <p className="small">Tanggal: {stats.date}</p> : null}
        </div>
        <div className="grid3">
          <div className="card">
            <div className="small">{t('orders')}</div>
            <h2>{stats.orders}</h2>
          </div>
          <div className="card">
            <div className="small">Sales</div>
            <h2>{formatRupiah(stats.sales)}</h2>
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
