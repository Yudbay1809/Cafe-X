'use client';

import React, { useState } from 'react';

export default function AuditPage() {
  const [logs] = useState([
    { id: 1, user: 'Admin HQ', action: 'Update Menu Price', details: 'Espresso: 15k -> 18k', time: '10 mins ago', severity: 'Medium' },
    { id: 2, user: 'Kasir Andi', action: 'Delete Transaction', details: 'Order #OFF-123 deleted', time: '1 hour ago', severity: 'High' },
    { id: 3, user: 'System', action: 'Database Backup', details: 'Full backup completed', time: '3 hours ago', severity: 'Low' },
    { id: 4, user: 'Admin HQ', action: 'Change Permission', details: 'User Siti set to Manager', time: '5 hours ago', severity: 'Medium' },
  ]);

  return (
    <div className="p-8 space-y-8 bg-[#FEF3C7]/20 min-h-screen font-karla">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-[#451A03] font-playfair-display-sc uppercase tracking-tight">Audit & Security</h1>
          <p className="text-[#92400E] mt-1 font-medium">Immutable transaction and activity logs for Enterprise integrity.</p>
        </div>
        <button className="px-6 py-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#B91C1C] rounded-2xl font-black text-sm hover:bg-[#EF4444] hover:text-white transition-all">
          ⚠️ Secure Archival
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#FDE68A] overflow-hidden">
        <div className="p-8 border-b border-[#FDE68A] flex justify-between items-center">
           <h2 className="font-black text-xl text-[#451A03] font-playfair-display-sc uppercase">System Activity Ledger</h2>
           <div className="flex gap-4">
              <select className="px-4 py-2 bg-[#FEF3C7]/30 border border-[#FDE68A] rounded-xl font-bold text-[#451A03] focus:outline-none">
                 <option>All Severity Levels</option>
                 <option>High Priority Only</option>
                 <option>Medium Priority</option>
              </select>
           </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#FEF3C7]/20 border-b border-[#FDE68A]">
            <tr>
              <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Timestamp</th>
              <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Initiator</th>
              <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Action Type</th>
              <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase text-center">Threat Level</th>
              <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FDE68A]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-[#FEF3C7]/10 transition-colors">
                <td className="px-8 py-6 text-sm text-[#8B7355] font-mono font-bold tracking-tight">{log.time}</td>
                <td className="px-8 py-6">
                  <div className="font-black text-[#451A03]">{log.user}</div>
                  <div className="text-[10px] text-[#92400E] font-bold uppercase">Authorized Entity</div>
                </td>
                <td className="px-8 py-6">
                  <div className="font-bold text-[#78350F] bg-[#FEF3C7] px-3 py-1 rounded-lg border border-[#FDE68A] inline-block text-sm">
                    {log.action}
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    log.severity === 'Low' ? 'bg-[#DCFCE7] text-[#166534]' :
                    log.severity === 'Medium' ? 'bg-[#FEF9C3] text-[#854D0E]' :
                    'bg-[#FEE2E2] text-[#991B1B]'
                  }`}>
                    {log.severity}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-[#451A03] font-medium leading-relaxed italic border-l border-[#FDE68A]/50 bg-[#FEF3C7]/5">
                  "{log.details}"
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#451A03] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-[#FBBF24] font-black uppercase tracking-widest text-xs mb-2">Enterprise Security Health</h3>
            <p className="text-4xl font-black font-playfair-display-sc">99.98% Secure</p>
            <p className="text-[#E8D5B0] mt-4 font-medium italic">No unauthorized access attempts detected in last 30 days.</p>
          </div>
          <div className="absolute top-0 right-0 p-10 text-9xl opacity-5 pointer-events-none transform translate-x-1/4">🛡️</div>
        </div>
        
        <div className="bg-white p-10 rounded-[2.5rem] border border-[#FDE68A] shadow-sm flex items-center justify-between">
           <div>
             <h3 className="text-[#92400E] font-black uppercase tracking-widest text-xs mb-2">Automated Backups</h3>
             <p className="text-2xl font-black text-[#451A03]">Daily Cloud Sync</p>
             <p className="text-[#8B7355] mt-1 text-sm">Last backup: Today, 03:00 AM</p>
           </div>
           <button className="px-6 py-3 bg-[#78350F] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#78350F]/20">
             Restore Point
           </button>
        </div>
      </div>
    </div>
  );
}
