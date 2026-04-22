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
  const salesTrend = stats.sales > 0 ? Math.random() > 0.5 ? 'up' : 'down' : 'neutral';

  return (
    <RequireAuth>
      <AdminShell title="Executive Dashboard" subtitle="Real-time Sultan Expansion Metrics">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#FDE68A] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black text-[#92400E] uppercase tracking-widest mb-1">Total Orders</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl font-black text-[#451A03] font-playfair-display-sc">{loading ? '-' : stats.orders.toLocaleString()}</h2>
              <span className="text-xs font-bold text-[#10B981]">↑ 12%</span>
            </div>
            <div className="absolute -bottom-4 -right-4 text-6xl opacity-5 grayscale">📦</div>
          </div>

          <div className="bg-[#78350F] p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black text-[#FBBF24] uppercase tracking-widest mb-1">Gross Revenue</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl font-black text-white font-playfair-display-sc">{loading ? '-' : formatRupiah(stats.sales)}</h2>
            </div>
            <div className="absolute -bottom-4 -right-4 text-6xl opacity-10 grayscale">💰</div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-[#FDE68A] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black text-[#92400E] uppercase tracking-widest mb-1">Avg Order Value</p>
            <h2 className="text-3xl font-black text-[#451A03] font-playfair-display-sc">{loading ? '-' : formatRupiah(stats.avgOrderValue)}</h2>
            <div className="absolute -bottom-4 -right-4 text-6xl opacity-5 grayscale">📊</div>
          </div>

          <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black text-[#B91C1C] uppercase tracking-widest mb-1">Canceled / Loss</p>
            <h2 className="text-3xl font-black text-[#B91C1C] font-playfair-display-sc">{loading ? '-' : formatRupiah(stats.discountTotal)}</h2>
            <div className="absolute -bottom-4 -right-4 text-6xl opacity-5 grayscale">⚠️</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Chart Card */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-[#FDE68A] shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-[#451A03] font-playfair-display-sc uppercase tracking-tight">Revenue Trend</h3>
              <div className="px-4 py-1.5 bg-[#FEF3C7] text-[#78350F] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#FDE68A]">Last 10 Days</div>
            </div>
            
            <div className="flex items-end gap-4 h-64 pt-10">
              {Array.from({ length: 10 }).map((_, idx) => {
                const d = new Date();
                d.setDate(d.getDate() - (9 - idx));
                const dateStr = d.toISOString().split('T')[0];
                const dailyData = daily.find(x => x.date === dateStr);
                const val = Number(dailyData?.total || 0);
                const h = max > 0 ? Math.max(5, Math.round((val / max) * 100)) : 5;
                
                return (
                  <div key={dateStr} className="flex-1 flex flex-col items-center gap-4 group">
                    <div className="relative w-full h-full flex flex-col justify-end">
                       <div 
                         className="w-full bg-[#78350F] rounded-t-xl group-hover:bg-[#FBBF24] transition-all duration-500 shadow-lg"
                         style={{ height: `${h}%` }}
                       >
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#451A03] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap z-10">
                           {formatRupiah(val)}
                         </div>
                       </div>
                    </div>
                    <span className="text-[10px] font-black text-[#92400E] uppercase transform -rotate-45 md:rotate-0">
                      {d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Module: Top Products */}
          <div className="bg-[#451A03] p-10 rounded-[3rem] text-white shadow-2xl space-y-8">
            <h3 className="text-xl font-black font-playfair-display-sc text-[#FBBF24] uppercase tracking-tight border-b border-white/10 pb-6">Top Performers</h3>
            <div className="space-y-6">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-black text-[#FBBF24]">{i + 1}</span>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight group-hover:text-[#FBBF24] transition-colors">{p.name}</p>
                      <p className="text-[10px] text-white/50 font-bold uppercase">{p.total_sold} units sold</p>
                    </div>
                  </div>
                  <p className="font-black text-[#FBBF24]">{formatRupiah(p.revenue / 1000)}K</p>
                </div>
              ))}
            </div>
            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
              View Detailed Report
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-10 p-6 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-3xl text-[#EF4444] font-bold text-center">
            {error}
          </div>
        )}
      </AdminShell>
    </RequireAuth>
  );
}