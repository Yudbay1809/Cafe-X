'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import React from 'react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const financialData = {
    revenue: 125000000,
    cogs: 45000000,
    opex: 30000000,
    grossProfit: 80000000,
    netProfit: 50000000,
    margin: '40%',
  };

  return (
    <RequireAuth>
      <AdminShell 
        title="Imperial Analytics" 
        subtitle="High-precision financial forecasting and P&L intelligence."
        actions={
          <div className="flex gap-4">
             <button className="hidden sm:block px-6 py-2.5 bg-white border border-[#FDE68A] text-[#78350F] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-[#FEF3C7] transition-all">Export Ledger</button>
             <button className="hidden sm:block px-8 py-2.5 bg-[#632C0D] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#632C0D]/20 hover:scale-105 active:scale-95 transition-all">Monthly Strategy</button>
          </div>
        }
      >
        <div className="space-y-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            {[
              { label: 'Gross Revenue', value: `Rp ${financialData.revenue.toLocaleString()}`, sub: '↑ 12% vs last month', color: 'text-[#451A03]', active: true },
              { label: 'COGS (Inventory)', value: `Rp ${financialData.cogs.toLocaleString()}`, sub: 'Efficient Sourcing', color: 'text-[#991B1B]', active: false },
              { label: 'Net Profit', value: `Rp ${financialData.netProfit.toLocaleString()}`, sub: `Margin: ${financialData.margin}`, color: 'text-[#065F46]', active: false },
              { label: 'Total Outlets', value: '8 Branches', sub: 'Active & Synchronized', color: 'text-[#451A03]', active: false }
            ].map((card, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-[32px] border transition-all ${
                  card.active ? 'bg-[#632C0D] text-white border-none shadow-2xl shadow-[#632C0D]/30' : 'bg-white border-[#FDE68A] shadow-soft'
                }`}
              >
                <p className={`text-[10px] font-black uppercase tracking-widest ${card.active ? 'text-[#FBBF24]' : 'text-[#8B7355]'} mb-2`}>{card.label}</p>
                <p className={`text-2xl font-black font-playfair-display-sc ${card.active ? 'text-white' : card.color}`}>{card.value}</p>
                <p className={`text-[10px] mt-4 font-bold ${card.active ? 'text-[#E8D5B0]' : 'text-[#92400E]'}`}>{card.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Performance Chart Simulation */}
            <div className="bg-white p-10 rounded-[40px] border border-[#FDE68A] shadow-soft space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black font-playfair-display-sc text-[#451A03] uppercase tracking-tight leading-none">Revenue Velocity</h2>
                <div className="flex items-center gap-3">
                   <span className="w-3 h-3 rounded-full bg-[#FBBF24] shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span>
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B7355]">Last 7 Days</span>
                </div>
              </div>
              <div className="h-64 flex items-end gap-5">
                 {[40, 60, 45, 80, 90, 75, 100].map((h, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ height: 0 }}
                     animate={{ height: `${h}%` }}
                     transition={{ delay: i * 0.1, duration: 1 }}
                     className="flex-1 bg-gradient-to-t from-[#632C0D] to-[#FBBF24] rounded-t-[14px] relative group shadow-sm hover:shadow-lg transition-all"
                   >
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#451A03] text-white text-[9px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                       {h}M
                     </div>
                   </motion.div>
                 ))}
              </div>
              <div className="flex justify-between text-[10px] font-black text-[#8B7355] uppercase tracking-widest pt-4 border-t border-[#FDE68A]/50">
                 <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="bg-[#451A03] p-10 lg:p-12 rounded-[40px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <h2 className="text-xl font-black font-playfair-display-sc mb-12 text-[#FBBF24] uppercase tracking-tight">Strategic Expenditure</h2>
                <div className="space-y-10">
                  {[
                    { label: 'Raw Materials (Coffee, Milk)', value: '55%', color: 'bg-[#FBBF24]' },
                    { label: 'Operational (Energy, Logistics)', value: '25%', color: 'bg-[#E8D5B0]' },
                    { label: 'Staff Capital (Payroll)', value: '20%', color: 'bg-white' }
                  ].map((ex, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-[#E8D5B0]">
                        <span>{ex.label}</span>
                        <span className="text-white">{ex.value}</span>
                      </div>
                      <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden shadow-inner border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: ex.value }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`${ex.color} h-full rounded-full shadow-lg`}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-10 -right-10 text-[18rem] opacity-5 grayscale pointer-events-none transform translate-x-1/4 translate-y-1/4 -rotate-12">💎</div>
            </div>
          </div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
