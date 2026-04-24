'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { formatRupiah } from '@/lib/money';
import { useState } from 'react';

export default function Page() {
  const [stats] = useState({ 
    revenue: 24800000, 
    orders: 1284, 
    members: 3421, 
    rating: 4.87 
  });

  return (
    <RequireAuth>
      <AdminShell title="Executive Dashboard" subtitle="Tuesday, 22 April 2026 • 3 outlets online">
        
        {/* KPI Row - Matching hFCEz screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {/* Revenue Card */}
          <div className="sultan-kpi-card space-y-8">
            <div className="flex justify-between items-center">
              <div className="sultan-icon-box">💵</div>
              <span className="text-[11px] font-black text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full">+18.4%</span>
            </div>
            <div>
              <h2 className="text-4xl font-black font-playfair-display-sc text-sultan-text tracking-tighter uppercase">Rp 24.8M</h2>
              <p className="text-[10px] font-bold text-sultan-text-muted uppercase tracking-widest mt-2">Revenue Today</p>
            </div>
          </div>

          {/* Active Card - Total Orders */}
          <div className="sultan-kpi-card-active sm:scale-105 space-y-8 z-10">
            <div className="flex justify-between items-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 text-white">🗓️</div>
              <span className="text-[10px] font-black text-sultan-cta bg-sultan-cta/10 px-3 py-1 rounded-full">↑ 245 vs yesterday</span>
            </div>
            <div>
              <h2 className="text-5xl font-black font-playfair-display-sc text-white tracking-tighter">1,284</h2>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-2">Total Orders</p>
            </div>
          </div>

          {/* Members Card */}
          <div className="sultan-kpi-card space-y-8">
            <div className="flex justify-between items-center">
              <div className="sultan-icon-box">👥</div>
              <span className="text-[11px] font-black text-[#632C0D] bg-[#632C0D]/10 px-3 py-1 rounded-full">1.5k new</span>
            </div>
            <div>
              <h2 className="text-4xl font-black font-playfair-display-sc text-sultan-text tracking-tighter uppercase">3,421</h2>
              <p className="text-[10px] font-bold text-sultan-text-muted uppercase tracking-widest mt-2">Active Members</p>
            </div>
          </div>

          {/* Rating Card */}
          <div className="sultan-kpi-card space-y-8">
            <div className="flex justify-between items-center">
              <div className="sultan-icon-box">⭐</div>
            </div>
            <div>
              <h2 className="text-4xl font-black font-playfair-display-sc text-sultan-text tracking-tighter uppercase">4.87</h2>
              <p className="text-[10px] font-bold text-sultan-text-muted uppercase tracking-widest mt-2">Avg. Rating</p>
            </div>
          </div>
        </div>

        {/* Chart & Top Menu Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-white p-12 rounded-[40px] border border-sultan-border shadow-soft flex flex-col space-y-10">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black font-playfair-display-sc text-sultan-text tracking-tight uppercase">Revenue Trend</h3>
               <div className="flex gap-2 bg-[#FEF3C7] p-1.5 rounded-full border border-sultan-border">
                  <button className="px-4 py-1 text-[10px] font-bold rounded-full">7D</button>
                  <button className="px-4 py-1 text-[10px] font-black bg-[#632C0D] text-white rounded-full">30D</button>
                  <button className="px-4 py-1 text-[10px] font-bold rounded-full">90D</button>
               </div>
            </div>
            
            <div className="flex-1 flex items-end gap-6 h-[280px]">
               {[120, 180, 150, 220, 260, 210, 160, 190, 240, 280].map((val, i) => (
                 <div key={i} className="flex-1 group relative">
                    <div 
                      className="w-full bg-sultan-gradient rounded-t-2xl transition-all duration-700 opacity-80 group-hover:opacity-100"
                      style={{ height: `${(val / 300) * 100}%` }}
                    ></div>
                 </div>
               ))}
            </div>
          </div>

          {/* Top Menu Today */}
          <div className="bg-white p-12 rounded-[40px] border border-sultan-border shadow-soft flex flex-col space-y-10">
             <h3 className="text-2xl font-black font-playfair-display-sc text-sultan-text tracking-tight uppercase">Top Menu Today</h3>
             <div className="space-y-8">
                {[
                  { name: 'Es Kopi Susu Sultan', sales: '312 pcs', color: '#632C0D' },
                  { name: 'Avocado Coffee', sales: '218 pcs', color: '#D97706' },
                  { name: 'Croissant Almond', sales: '187 pcs', color: '#FBBF24' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                       <span className="font-bold text-sultan-text tracking-tight group-hover:text-sultan-primary transition-colors">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-sultan-text-muted">{item.sales}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}