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
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [tables, summary, dailyResp] = await Promise.all([
          adminApi.tables(),
          adminApi.reportSummary().catch(() => null),
          adminApi.reportDaily().catch(() => ({ items: [] })),
        ]);
        setStats({
          orders: summary?.orders_count ?? 0,
          sales: summary?.sales_total ?? 0,
          tables: tables.items?.length ?? 0,
          date: summary?.date ?? '',
        });
        setDaily(dailyResp.items || []);
        setLoading(false);
      } catch (e: any) {
        setLoading(false);
        setError(e.message || 'Gagal memuat dashboard');
      }
    }
    load();
  }, []);

  const max = Math.max(1, ...daily.map((x: any) => Number(x.total || 0)));

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
            <h2>{loading ? '-' : stats.orders}</h2>
          </div>
          <div className="card">
            <div className="small">Sales</div>
            <h2>{loading ? '-' : formatRupiah(stats.sales)}</h2>
          </div>
          <div className="card">
            <div className="small">{t('tables')}</div>
            <h2>{loading ? '-' : stats.tables}</h2>
          </div>
        </div>
        <div className="card">
          <div className="small">Sales Chart</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120, marginTop: 12 }}>
            {(daily || []).slice(-10).map((d: any, i: number) => {
              const val = Number(d.total || 0);
              const h = Math.max(4, Math.round((val / max) * 100));
              return (
                <div key={`${d.date}-${i}`} title={`${d.date} - ${val}`} style={{ width: 14, height: h, background: '#0f766e', borderRadius: 6 }} />
              );
            })}
          </div>
        </div>
        {error ? <div className="card">{error}</div> : null}
      </AdminShell>
    </RequireAuth>
  );
}
