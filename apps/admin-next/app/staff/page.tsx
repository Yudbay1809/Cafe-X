'use client';

import React, { useState } from 'react';

export default function StaffPage() {
  const [view, setView] = useState<'attendance' | 'payroll'>('attendance');
  const [staff] = useState([
    { id: 1, name: 'Andi Pratama', role: 'Outlet Manager', branch: 'Pusat', status: 'Present', checkIn: '08:00 AM', hours: 160, basePay: 5000000, commission: 450000 },
    { id: 2, name: 'Siti Aminah', role: 'Senior Barista', branch: 'Sudirman', status: 'Present', checkIn: '08:15 AM', hours: 155, basePay: 4000000, commission: 850000 },
    { id: 3, name: 'Budi Santoso', role: 'Cashier', branch: 'Thamrin', status: 'Late', checkIn: '09:30 AM', hours: 140, basePay: 3500000, commission: 200000 },
    { id: 4, name: 'Rina Wijaya', role: 'Barista', branch: 'Pusat', status: 'Absent', checkIn: '-', hours: 120, basePay: 3800000, commission: 300000 },
  ]);

  return (
    <div className="p-8 space-y-8 bg-[#FEF3C7]/20 min-h-screen font-karla">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-[#451A03] font-playfair-display-sc uppercase tracking-tight">Staff & Payroll HQ</h1>
          <p className="text-[#92400E] mt-1 font-medium">Automated salary, commissions, and multi-branch attendance.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-1 rounded-2xl flex shadow-sm border border-[#FDE68A]">
            <button 
              onClick={() => setView('attendance')}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${view === 'attendance' ? 'bg-[#78350F] text-white shadow-md' : 'text-[#78350F]'}`}
            >
              Attendance
            </button>
            <button 
              onClick={() => setView('payroll')}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${view === 'payroll' ? 'bg-[#78350F] text-white shadow-md' : 'text-[#78350F]'}`}
            >
              Automated Payroll
            </button>
          </div>
        </div>
      </div>

      {view === 'attendance' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#FDE68A] shadow-sm">
              <p className="text-xs font-black text-[#92400E] uppercase tracking-wider">Total Force</p>
              <p className="text-3xl font-black text-[#451A03] mt-1">42 Staff</p>
            </div>
            <div className="bg-[#10B981]/10 p-6 rounded-3xl border border-[#10B981]/20">
              <p className="text-xs font-black text-[#065F46] uppercase tracking-wider">On-Duty Now</p>
              <p className="text-3xl font-black text-[#047857] mt-1">35</p>
            </div>
            <div className="bg-[#FBBF24]/10 p-6 rounded-3xl border border-[#FBBF24]/20">
              <p className="text-xs font-black text-[#92400E] uppercase tracking-wider">Late arrivals</p>
              <p className="text-3xl font-black text-[#B45309] mt-1">3</p>
            </div>
            <div className="bg-[#EF4444]/10 p-6 rounded-3xl border border-[#EF4444]/20">
              <p className="text-xs font-black text-[#991B1B] uppercase tracking-wider">Unaccounted</p>
              <p className="text-3xl font-black text-[#B91C1C] mt-1">4</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-[#FDE68A] overflow-hidden">
            <div className="p-8 border-b border-[#FDE68A] flex justify-between items-center">
              <h2 className="font-black text-xl text-[#451A03] font-playfair-display-sc">Live Attendance Tracker</h2>
              <div className="flex gap-2">
                 <input type="date" className="px-4 py-2 bg-[#FEF3C7]/30 border border-[#FDE68A] rounded-xl font-bold text-[#451A03]" defaultValue="2026-04-22" />
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#FEF3C7]/20 border-b border-[#FDE68A]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Staff Identity</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Placement</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase text-center">Status</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Log-In Time</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase text-right">Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FDE68A]">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FEF3C7]/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-black text-[#451A03] text-lg">{s.name}</div>
                      <div className="text-xs text-[#92400E] font-medium">EMP-{1000 + s.id} • {s.role}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#78350F]"></span>
                        <span className="text-sm font-bold text-[#451A03]">{s.branch} Outlet</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        s.status === 'Present' ? 'bg-[#DCFCE7] text-[#166534]' :
                        s.status === 'Late' ? 'bg-[#FEF9C3] text-[#854D0E]' :
                        'bg-[#FEE2E2] text-[#991B1B]'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-[#451A03]">{s.checkIn}</td>
                    <td className="px-8 py-6 text-right">
                      <button className="px-4 py-2 bg-[#78350F] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#451A03] transition-all">
                        Full Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <div className="bg-[#78350F] p-10 rounded-[3rem] text-white flex justify-between items-center shadow-2xl shadow-[#78350F]/20 relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[#FBBF24] font-black uppercase tracking-widest text-sm mb-2">Monthly Expenditure Forecast</p>
                <p className="text-5xl font-black font-playfair-display-sc">Rp 162,500,000</p>
                <p className="text-[#E8D5B0] mt-4 font-medium italic">Base Salary + Commissions + 3 Bonus Tiers</p>
             </div>
             <div className="relative z-10 flex flex-col gap-3">
                <button className="px-10 py-4 bg-[#FBBF24] text-[#451A03] rounded-2xl font-black shadow-xl hover:scale-105 transition-transform">
                   Finalize & Payout All
                </button>
                <button className="px-10 py-4 bg-white/10 text-white rounded-2xl font-black backdrop-blur-md hover:bg-white/20 transition-all">
                   Preview Payslips
                </button>
             </div>
             <div className="absolute top-0 right-0 p-12 text-9xl opacity-10 pointer-events-none transform translate-x-1/4">💸</div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-[#FDE68A] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#FEF3C7]/20 border-b border-[#FDE68A]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Staff Member</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Base Package</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Incentives</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Penalty</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Take Home Pay</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FDE68A]">
                {staff.map((s) => {
                  const deductions = s.status === 'Late' ? 50000 : 0;
                  const thp = s.basePay + s.commission - deductions;
                  return (
                    <tr key={s.id} className="hover:bg-[#FEF3C7]/10 transition-colors">
                      <td className="px-8 py-6 font-black text-[#451A03] text-lg">{s.name}</td>
                      <td className="px-8 py-6 text-sm font-bold text-[#451A03]">Rp {s.basePay.toLocaleString()}</td>
                      <td className="px-8 py-6">
                         <div className="text-sm font-black text-[#10B981]">+ Rp {s.commission.toLocaleString()}</div>
                         <p className="text-[10px] text-[#92400E] font-bold uppercase">Upsell Commission</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`text-sm font-bold ${deductions > 0 ? 'text-[#EF4444]' : 'text-[#9CA3AF]'}`}>
                          - Rp {deductions.toLocaleString()}
                        </div>
                        <p className="text-[10px] text-[#92400E] font-bold uppercase">{deductions > 0 ? 'Late Penalty' : 'No Penalties'}</p>
                      </td>
                      <td className="px-8 py-6 font-black text-[#78350F] text-xl">Rp {thp.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right">
                        <button className="px-5 py-2 bg-[#FEF3C7] text-[#78350F] rounded-xl text-xs font-black hover:bg-[#FBBF24] transition-all uppercase tracking-wider">
                          Process
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
