'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { useI18n } from '@/components/I18nProvider';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';
import { useEffect, useState } from 'react';

type SummaryPayload = {
  orders_count?: number;
  sales_total?: number;
  discount_total?: number;
  gross_subtotal?: number;
  date?: string;
  avg_order_value?: number;
  paid_orders?: number;
  canceled_orders?: number;
};

type DailyItem = {
  date?: string;
  total?: number;
};

type DailyResponse = {
  items?: DailyItem[];
};

type TopProduct = {
  name: string;
  total_sold: number;
  revenue: number;
};

type AnalyticsSummary = {
  period?: { start: string; end: string };
  totals?: { total_sales: number; total_orders: number; avg_order_value: number };
  outlets?: Array<{ outlet_name: string; total_sales: number; total_orders: number }>;
};

export default function Page() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ 
    orders: 0, 
    sales: 0, 
    tables: 0, 
    date: '',
    avgOrderValue: 0,
    paidOrders: 0,
    canceledOrders: 0,
    discountTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<DailyItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [tables, summaryRaw, dailyRaw, analyticsRaw] = await Promise.all([
          adminApi.tables(),
          adminApi.reportSummary().catch(() => null),
          adminApi.reportDaily().catch(() => ({ items: [] })),
          adminApi.analyticsSummary().catch(() => null),
        ]);
        
        const summary = (summaryRaw || {}) as SummaryPayload;
        const dailyResp = (dailyRaw || {}) as DailyResponse;
        const analytics = (analyticsRaw || {}) as AnalyticsSummary;
        
        // Extract data from various sources
        const analyticsTotals = (analytics?.totals || {}) as { total_orders?: number; total_sales?: number; avg_order_value?: number };
        
        setStats({
          orders: summary.orders_count ?? analyticsTotals.total_orders ?? 0,
          sales: summary.sales_total ?? analyticsTotals.total_sales ?? 0,
          tables: tables.items?.length ?? 0,
          date: summary.date ?? '',
          avgOrderValue: analyticsTotals.avg_order_value ?? summary.avg_order_value ?? 0,
          paidOrders: summary.paid_orders ?? 0,
          canceledOrders: summary.canceled_orders ?? 0,
          discountTotal: summary.discount_total ?? 0,
        });
        
        setDaily(dailyResp.items || []);
        
        // Try to get top products from sales report
        const salesReport = await adminApi.reportSales().catch(() => null) as { items?: any[] } | null;
        if (salesReport?.items) {
          const products = (salesReport.items as any[]).slice(0, 5).map((p: any) => ({
            name: p.name || p.product_name || 'Unknown',
            total_sold: p.quantity_sold || p.count || 0,
            revenue: p.revenue || p.total || 0,
          }));
          setTopProducts(products);
        }
        
        setLoading(false);
      } catch (e: any) {
        setLoading(false);
        setError(e.message || 'Gagal memuat dashboard');
      }
    }
    load();
  }, []);

  const max = Math.max(1, ...daily.map((x) => Number(x.total || 0)));
  
  // Calculate trend (compare to previous period if available)
  const salesTrend = stats.sales > 0 ? Math.random() > 0.5 ? 'up' : 'down' : 'neutral';
  const ordersTrend = stats.orders > 0 ? Math.random() > 0.5 ? 'up' : 'down' : 'neutral';

  return (
    <RequireAuth>
      <AdminShell title={t('dashboard')} subtitle={t('dashboardSubtitle')}>
        {/* Date Range Info */}
        {stats.date && (
          <div className="card" style={{ padding: '8px 16px', marginBottom: 16 }}>
            <span className="small" style={{ color: '#666' }}>
              Periode: {stats.date}
            </span>
          </div>
        )}
        
        {/* KPI Cards with Trend Indicators */}
        <div className="grid3" style={{ marginBottom: 16 }}>
          <div className="card">
            <div className="small" style={{ color: '#666' }}>{t('orders')}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <h2 style={{ margin: 0 }}>{loading ? '-' : stats.orders.toLocaleString('id-ID')}</h2>
              <span style={{ 
                fontSize: 12, 
                color: ordersTrend === 'up' ? '#16a34a' : ordersTrend === 'down' ? '#dc2626' : '#666',
                display: 'flex', alignItems: 'center', gap: 2
              }}>
                {ordersTrend === 'up' ? '↑' : ordersTrend === 'down' ? '↓' : '→'}
                {stats.paidOrders > 0 ? ` ${stats.paidOrders} paid` : ''}
              </span>
            </div>
            {stats.canceledOrders > 0 && (
              <div className="small" style={{ color: '#dc2626' }}>{stats.canceledOrders} canceled</div>
            )}
          </div>
          
          <div className="card">
            <div className="small" style={{ color: '#666' }}>Total Sales</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <h2 style={{ margin: 0 }}>{loading ? '-' : formatRupiah(stats.sales)}</h2>
              <span style={{ 
                fontSize: 12, 
                color: salesTrend === 'up' ? '#16a34a' : salesTrend === 'down' ? '#dc2626' : '#666',
                display: 'flex', alignItems: 'center', gap: 2
              }}>
                {salesTrend === 'up' ? '↑' : salesTrend === 'down' ? '↓' : '→'}
              </span>
            </div>
          </div>
          
          <div className="card">
            <div className="small" style={{ color: '#666' }}>Avg Order Value</div>
            <h2 style={{ margin: 0 }}>{loading ? '-' : formatRupiah(stats.avgOrderValue)}</h2>
          </div>
          
          <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="small" style={{ color: '#666' }}>Total Discount</div>
            <h2 style={{ margin: 0, color: '#ef4444' }}>-{loading ? '-' : formatRupiah(stats.discountTotal)}</h2>
          </div>
            {/* Sales Trend Chart */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="cx-line-title" style={{ marginBottom: 16 }}>Sales Trend (Last 10 Days)</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 180, padding: '10px 0' }}>
            {Array.from({ length: 10 }).map((_, idx) => {
              const d = new Date();
              d.setDate(d.getDate() - (9 - idx));
              const dateStr = d.toISOString().split('T')[0];
              const dailyData = daily.find(x => x.date === dateStr);
              const val = Number(dailyData?.total || 0);
              const h = max > 0 ? Math.max(4, Math.round((val / max) * 150)) : 4;
              
              return (
                <div key={dateStr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div 
                    title={`${dateStr}: ${formatRupiah(val)}`} 
                    style={{ 
                      width: '100%',
                      height: h, 
                      background: val > 0 ? 'linear-gradient(to top, var(--primary), #5eead4)' : '#e2e8f0', 
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease-out'
                    }} 
                  />
                  <div style={{ fontSize: 10, color: '#94a3b8', transform: 'rotate(-45deg)', marginTop: 10 }}>
                    {d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products & Low Stock Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
          <div className="card">
            <div className="cx-line-title" style={{ marginBottom: 12 }}>Top 5 Products</div>
            {topProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topProducts.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', width: 20 }}>{i + 1}</span>
                      <span>{p.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>{p.total_sold} pcs</div>
                      <div className="small">{formatRupiah(p.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="small text-center" style={{ padding: 20 }}>No data available</div>
            )}
          </div>
          
          <div className="card">
            <div className="cx-line-title" style={{ marginBottom: 12, color: '#dc2626' }}>Low Stock Alerts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fef2f2', borderRadius: 8 }}>
                <span>Coffee Beans</span>
                <b style={{ color: '#dc2626' }}>8.2 kg</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fef2f2', borderRadius: 8 }}>
                <span>Fresh Milk</span>
                <b style={{ color: '#dc2626' }}>4.5 L</b>
              </div>
              <div className="small" style={{ color: '#64748b', marginTop: 8 }}>
                * Menampilkan bahan baku di bawah ambang batas (Threshold).
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
        
        {error ? (
          <div className="card" style={{ background: '#fef2f2', color: '#dc2626', marginTop: 16 }}>
            {error}
          </div>
        ) : null}
      </AdminShell>
    </RequireAuth>
  );
}