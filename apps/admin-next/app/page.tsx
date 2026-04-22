'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';
import { useEffect, useState } from 'react';

export default function Page() {
  const [stats, setStats] = useState({ orders: 12450, sales: 482500000, avgOrderValue: 38700, discountTotal: 12500000 });
  const [loading, setLoading] = useState(false);

  return (
    <RequireAuth>
      <AdminShell title="Executive Dashboard" subtitle="Enterprise Overview & Real-time Metrics">
        
        {/* KPI Row - Exact 20px Gap, 20px Radius */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-sultan-border shadow-sultan-soft space-y-4">
            <div className="text-[11px] font-black text-sultan-text-muted uppercase tracking-widest">Global Orders</div>
            <div className="text-3xl font-black text-sultan-text font-playfair-display-sc">12,450</div>
            <div className="text-[10px] font-bold text-sultan-success uppercase">↑ 12.4% vs Last Month</div>
          </div>

          <div className="bg-sultan-primary p-6 rounded-2xl shadow-sultan-active space-y-4 relative overflow-hidden">
            <div className="text-[11px] font-black text-sultan-cta uppercase tracking-widest">Gross Sales</div>
            <div className="text-3xl font-black text-white font-playfair-display-sc">{formatRupiah(stats.sales)}</div>
            <div className="text-[10px] font-bold text-white/50 uppercase">Consolidated Enterprise</div>
            <div className="absolute -bottom-4 -right-4 text-7xl opacity-5 grayscale">💰</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-sultan-border shadow-sultan-soft space-y-4">
            <div className="text-[11px] font-black text-sultan-text-muted uppercase tracking-widest">Avg Order Value</div>
            <div className="text-3xl font-black text-sultan-text font-playfair-display-sc">{formatRupiah(stats.avgOrderValue)}</div>
            <div className="text-[10px] font-bold text-sultan-text-muted uppercase tracking-widest">Sultan Tier Target</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-sultan-border shadow-sultan-soft space-y-4">
            <div className="text-[11px] font-black text-sultan-text-muted uppercase tracking-widest">System Health</div>
            <div className="text-3xl font-black text-sultan-text font-playfair-display-sc">99.9%</div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-sultan-success rounded-full animate-pulse"></div>
               <span className="text-[10px] font-bold text-sultan-success uppercase">All Outlets Syncing</span>
            </div>
          </div>
        </div>

        {/* Charts & Top Orders - Exact 24px Radius */}
        <div className="flex flex-col lg:flex-row gap-5 h-[460px]">
           <div className="flex-[2] bg-white p-7 rounded-3xl border border-sultan-border shadow-sultan-soft space-y-8 flex flex-col">
              <div className="flex justify-between items-center">
                 <h3 className="text-lg font-black font-playfair-display-sc text-sultan-text uppercase">Revenue Trajectory</h3>
                 <div className="px-4 py-1.5 bg-sultan-bg-warm text-sultan-primary rounded-full text-[10px] font-black uppercase tracking-widest">Last 14 Days</div>
              </div>
              <div className="flex-1 flex items-end gap-3 pb-4">
                 {[40, 60, 45, 90, 100, 80, 50, 70, 85, 110, 95, 120, 105, 130].map((h, i) => (
                   <div key={i} className="flex-1 bg-sultan-primary/10 rounded-t-lg relative group transition-all hover:bg-sultan-cta">
                     <div className="absolute bottom-0 w-full bg-sultan-primary rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-sultan-primary-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                       {h}k
                     </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="flex-1 bg-white p-7 rounded-3xl border border-sultan-border shadow-sultan-soft flex flex-col space-y-8 overflow-hidden">
              <h3 className="text-lg font-black font-playfair-display-sc text-sultan-text uppercase">Top Outlets</h3>
              <div className="flex-1 space-y-6">
                 {[
                   { name: 'Senopati Sultan', sales: 'Rp 142M', grow: '+18%' },
                   { name: 'Kemang Elite', sales: 'Rp 98M', grow: '+12%' },
                   { name: 'Menteng Reserve', sales: 'Rp 85M', grow: '+5%' },
                   { name: 'PIK Signature', sales: 'Rp 72M', grow: '+22%' },
                 ].map((outlet, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-pointer">
                     <div>
                       <p className="font-bold text-sm text-sultan-text group-hover:text-sultan-primary transition-colors">{outlet.name}</p>
                       <p className="text-[10px] font-bold text-sultan-text-muted uppercase">{outlet.sales}</p>
                     </div>
                     <span className="text-[11px] font-black text-sultan-success">{outlet.grow}</span>
                   </div>
                 ))}
              </div>
              <button className="w-full py-4 bg-sultan-bg-warm text-sultan-primary rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-sultan-border transition-all">
                Full Rankings
              </button>
           </div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}