'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';

export default function HQDashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sumRes, perfRes] = await Promise.all([
          adminApi.analyticsSummary(),
          adminApi.analyticsOutletPerformance()
        ]);
        setSummary(sumRes);
        setPerformance(perfRes as any[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8">Loading HQ Insights...</div>;

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">HQ Insights</h1>
        <p className="text-muted-foreground">Pusat kendali performa seluruh outlet Cafe-X.</p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-sm font-medium text-muted-foreground">Total Revenue (All Outlets)</div>
          <div className="text-2xl font-bold mt-2">{formatRupiah(summary?.total_revenue || 0)}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
          <div className="text-2xl font-bold mt-2">{summary?.total_orders || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="text-sm font-medium text-muted-foreground">Active Outlets</div>
          <div className="text-2xl font-bold mt-2">{performance.length}</div>
        </div>
      </div>

      {/* Outlet Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Outlet Performance</h2>
          <p className="text-sm text-muted-foreground">Perbandingan performa antar cabang.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-xs">
                <th className="px-6 py-4">Outlet Name</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Avg. Ticket</th>
                <th className="px-6 py-4">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {performance.map((p) => {
                const contribution = summary?.total_revenue ? (p.total_revenue / summary.total_revenue) * 100 : 0;
                return (
                  <tr key={p.outlet_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{p.outlet_name}</td>
                    <td className="px-6 py-4">{formatRupiah(p.total_revenue)}</td>
                    <td className="px-6 py-4">{p.order_count}</td>
                    <td className="px-6 py-4">{formatRupiah(p.total_revenue / (p.order_count || 1))}</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                             <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500" 
                                    style={{ width: `${contribution}%` }}
                                />
                             </div>
                             <span className="text-xs font-semibold">{contribution.toFixed(1)}%</span>
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note for future */}
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-800 text-sm">
         💡 <b>Tips Dashboard HQ:</b> Gunakan data ini untuk membandingkan performa promosi antar outlet atau memutuskan penambahan stok bahan baku di lokasi tertentu.
      </div>
    </div>
  );
}
