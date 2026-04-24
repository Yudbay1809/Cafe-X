'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StaffPage() {
  const [view, setView] = useState<'attendance' | 'payroll'>('attendance');
  const [staff] = useState([
    { id: 1, name: 'Andi Pratama', role: 'Outlet Manager', branch: 'Pusat', status: 'Present', checkIn: '08:00 AM', hours: 160, basePay: 5000000, commission: 450000 },
    { id: 2, name: 'Siti Aminah', role: 'Senior Barista', branch: 'Sudirman', status: 'Present', checkIn: '08:15 AM', hours: 155, basePay: 4000000, commission: 850000 },
    { id: 3, name: 'Budi Santoso', role: 'Cashier', branch: 'Thamrin', status: 'Late', checkIn: '09:30 AM', hours: 140, basePay: 3500000, commission: 200000 },
    { id: 4, name: 'Rina Wijaya', role: 'Barista', branch: 'Pusat', status: 'Absent', checkIn: '-', hours: 120, basePay: 3800000, commission: 300000 },
  ]);

  return (
    <RequireAuth>
      <AdminShell 
        title="Staff & Payroll HQ" 
        subtitle="Automated salary, commissions, and multi-branch attendance."
        actions={
          <div className="bg-white p-1 rounded-2xl flex shadow-sm border border-[#FDE68A]">
            <button 
              onClick={() => setView('attendance')}
              className={`px-6 py-2 rounded-xl font-bold text-xs transition-all ${view === 'attendance' ? 'bg-[#78350F] text-white shadow-md' : 'text-[#78350F]'}`}
            >
              Attendance
            </button>
            <button 
              onClick={() => setView('payroll')}
              className={`px-6 py-2 rounded-xl font-bold text-xs transition-all ${view === 'payroll' ? 'bg-[#78350F] text-white shadow-md' : 'text-[#78350F]'}`}
            >
              Payroll
            </button>
          </div>
        }
      >
        <AnimatePresence mode="wait">
          {view === 'attendance' ? (
            <motion.div 
              key="attendance" 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Force', value: '42 Staff', sub: 'Across 8 Outlets', active: true },
                  { label: 'On-Duty Now', value: '35', sub: '83.3% Presence', active: false },
                  { label: 'Late Arrivals', value: '3', sub: 'Needs Review', active: false, warning: true },
                  { label: 'Unaccounted', value: '4', sub: 'Action Required', active: false, critical: true },
                ].map((stat, i) => (
                  <div key={i} className={`p-8 rounded-[32px] border transition-all ${
                    stat.active ? 'bg-[#632C0D] text-white shadow-xl' : 'bg-white border-[#FDE68A] shadow-soft'
                  }`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${stat.active ? 'text-[#FBBF24]' : 'text-[#92400E]'}`}>{stat.label}</p>
                    <p className={`text-3xl font-black font-playfair-display-sc ${stat.critical ? 'text-[#EF4444]' : stat.warning ? 'text-[#D97706]' : ''}`}>{stat.value}</p>
                    <p className={`text-[10px] font-bold mt-4 ${stat.active ? 'text-white/50' : 'text-sultan-text-muted'}`}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[40px] shadow-soft border border-[#FDE68A] overflow-hidden">
                <div className="p-8 border-b border-[#FDE68A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <h2 className="font-black text-xl text-[#451A03] font-playfair-display-sc uppercase">Live Attendance Tracker</h2>
                  <input type="date" className="w-full sm:w-auto px-6 py-3 bg-[#FEF3C7]/30 border border-[#FDE68A] rounded-2xl font-bold text-[#451A03] text-sm focus:outline-none" defaultValue="2026-04-22" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-[#FEF3C7]/20 border-b border-[#FDE68A]">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Staff Identity</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Placement</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest text-center">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase text-center">Check-In</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FDE68A]">
                      {staff.map((s) => (
                        <tr key={s.id} className="hover:bg-[#FEF3C7]/10 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-black text-[#451A03] text-base">{s.name}</div>
                            <div className="text-[10px] text-[#92400E] font-bold uppercase mt-1">EMP-{1000 + s.id} • {s.role}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#78350F]"></span>
                              <span className="text-sm font-bold text-[#451A03]">{s.branch} Outlet</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              s.status === 'Present' ? 'bg-[#DCFCE7] text-[#166534]' :
                              s.status === 'Late' ? 'bg-[#FEF9C3] text-[#854D0E]' :
                              'bg-[#FEE2E2] text-[#991B1B]'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-black text-[#451A03] text-center">{s.checkIn}</td>
                          <td className="px-8 py-6 text-right">
                            <button className="px-6 py-2.5 bg-[#FEF3C7] text-[#78350F] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#632C0D] hover:text-white transition-all">Profile</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="payroll" 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="bg-[#632C0D] p-10 lg:p-12 rounded-[40px] text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 shadow-2xl relative overflow-hidden">
                 <div className="relative z-10 space-y-4">
                    <p className="text-[#FBBF24] font-black uppercase tracking-[0.3em] text-[10px]">Monthly Expenditure Forecast</p>
                    <h2 className="text-4xl lg:text-6xl font-black font-playfair-display-sc leading-none">Rp 162.5M</h2>
                    <p className="text-[#E8D5B0] text-sm font-medium italic opacity-80">Automated calculation for 42 active entities.</p>
                 </div>
                 <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <button className="flex-1 lg:flex-none px-12 py-5 bg-[#FBBF24] text-[#451A03] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Finalize Payout</button>
                    <button className="flex-1 lg:flex-none px-12 py-5 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all">Payslips</button>
                 </div>
                 <div className="absolute top-0 right-0 p-12 text-9xl opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4 rotate-12">💸</div>
              </div>

              <div className="bg-white rounded-[40px] shadow-soft border border-[#FDE68A] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-[#FEF3C7]/20 border-b border-[#FDE68A]">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Staff Member</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Base Package</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Incentives</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase text-center">Penalties</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase text-right">Take Home Pay</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FDE68A]">
                      {staff.map((s) => {
                        const thp = s.basePay + s.commission - (s.status === 'Late' ? 50000 : 0);
                        return (
                          <tr key={s.id} className="hover:bg-[#FEF3C7]/10 transition-colors">
                            <td className="px-8 py-6 font-black text-[#451A03] text-base">{s.name}</td>
                            <td className="px-8 py-6 text-sm font-bold text-[#451A03]">Rp {s.basePay.toLocaleString()}</td>
                            <td className="px-8 py-6">
                               <div className="text-sm font-black text-[#10B981]">+ Rp {s.commission.toLocaleString()}</div>
                               <p className="text-[9px] text-[#92400E] font-bold uppercase mt-1">Upsell Reward</p>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="text-sm font-bold text-[#EF4444]">
                                {s.status === 'Late' ? '- Rp 50.000' : '0'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right font-black text-[#632C0D] text-lg">Rp {thp.toLocaleString()}</td>
                            <td className="px-8 py-6 text-right">
                              <button className="px-6 py-2.5 bg-[#FEF3C7] text-[#78350F] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FBBF24] transition-all">Process</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AdminShell>
    </RequireAuth>
  );
}
