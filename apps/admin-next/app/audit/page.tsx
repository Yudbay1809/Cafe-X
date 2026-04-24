'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function AuditPage() {
  const [logs] = useState([
    { id: 1, user: 'Admin HQ', action: 'Update Menu Price', details: 'Espresso: 15k -> 18k', time: '10 mins ago', severity: 'Medium' },
    { id: 2, user: 'Kasir Andi', action: 'Delete Transaction', details: 'Order #OFF-123 deleted', time: '1 hour ago', severity: 'High' },
    { id: 3, user: 'System', action: 'Database Backup', details: 'Full backup completed', time: '3 hours ago', severity: 'Low' },
    { id: 4, user: 'Admin HQ', action: 'Change Permission', details: 'User Siti set to Manager', time: '5 hours ago', severity: 'Medium' },
  ]);

  return (
    <RequireAuth>
      <AdminShell 
        title="Audit & Security" 
        subtitle="Immutable transaction and activity logs for Enterprise integrity."
        actions={
          <button className="hidden sm:block px-6 py-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#B91C1C] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#EF4444] hover:text-white transition-all">
            ⚠️ Secure Archival
          </button>
        }
      >
        <div className="space-y-10">
          <div className="bg-white rounded-[40px] shadow-soft border border-[#FDE68A] overflow-hidden">
            <div className="p-8 lg:p-10 border-b border-[#FDE68A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
               <h2 className="font-black text-xl text-[#451A03] font-playfair-display-sc uppercase tracking-tight">System Activity Ledger</h2>
               <div className="flex gap-4 w-full sm:w-auto">
                  <select className="flex-1 sm:flex-none px-6 py-3 bg-[#FEF3C7]/30 border border-[#FDE68A] rounded-2xl font-bold text-[#451A03] text-sm focus:outline-none">
                     <option>All Severity Levels</option>
                     <option>High Priority Only</option>
                  </select>
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-[#FEF3C7]/20 border-b border-[#FDE68A]">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Timestamp</th>
                    <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Initiator</th>
                    <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Action Type</th>
                    <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest text-center">Threat Level</th>
                    <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FDE68A]">
                  {logs.map((log, idx) => (
                    <motion.tr 
                      key={log.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="hover:bg-[#FEF3C7]/10 transition-colors"
                    >
                      <td className="px-8 py-6 text-sm text-[#8B7355] font-mono font-bold tracking-tight">{log.time}</td>
                      <td className="px-8 py-6">
                        <div className="font-black text-[#451A03] text-sm">{log.user}</div>
                        <div className="text-[9px] text-[#92400E] font-bold uppercase mt-1">Authorized Entity</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-[#78350F] bg-[#FEF3C7] px-4 py-1.5 rounded-xl border border-[#FDE68A] inline-block text-[11px] uppercase tracking-tight">
                          {log.action}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-[#451A03] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-[#FBBF24] font-black uppercase tracking-widest text-[10px] mb-2">Security Integrity</h3>
                <p className="text-4xl font-black font-playfair-display-sc">99.9% SECURE</p>
                <p className="text-[#E8D5B0] mt-4 text-xs font-medium italic">No unauthorized access attempts detected in last 30 days.</p>
              </div>
              <div className="absolute top-0 right-0 p-10 text-9xl opacity-5 pointer-events-none transform translate-x-1/4">🛡️</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-10 rounded-[40px] border border-[#FDE68A] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6"
            >
               <div className="text-center sm:text-left">
                 <h3 className="text-[#92400E] font-black uppercase tracking-widest text-[10px] mb-2">Automated Backups</h3>
                 <p className="text-2xl font-black text-[#451A03] font-playfair-display-sc">Cloud Ledger Sync</p>
                 <p className="text-[#8B7355] mt-1 text-xs">Last backup: Today, 03:00 AM</p>
               </div>
               <button className="w-full sm:w-auto px-10 py-5 bg-[#78350F] text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#78350F]/20 active:scale-95 transition-all">
                 Restore Point
               </button>
            </motion.div>
          </div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
