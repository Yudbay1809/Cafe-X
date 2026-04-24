'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import React from 'react';
import { motion } from 'framer-motion';

export default function DevicesPage() {
  const devices = [
    { id: 'POS-SENOPATI-01', branch: 'Cafe-X Senopati', status: 'Online', battery: '85%', lastSync: 'Just now' },
    { id: 'POS-KEMANG-01', branch: 'Cafe-X Kemang', status: 'Offline', battery: '12%', lastSync: '2 hours ago' },
    { id: 'POS-KEMANG-02', branch: 'Cafe-X Kemang', status: 'Online', battery: '100%', lastSync: '10 mins ago' },
  ];

  return (
    <RequireAuth>
      <AdminShell 
        title="Terminal Monitoring" 
        subtitle="Real-time telemetry and synchronization status for all POS hardware."
        actions={
          <button className="hidden sm:block px-8 py-3 bg-[#632C0D] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#632C0D]/20 hover:scale-105 active:scale-95 transition-all">
            Sync Global Matrix
          </button>
        }
      >
        <div className="space-y-10">
          <div className="bg-white rounded-[40px] border border-[#FDE68A] shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-[#FEF3C7]/50 border-b border-[#FDE68A]">
                  <tr>
                    <th className="p-8 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Device Identity</th>
                    <th className="p-8 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Operating Branch</th>
                    <th className="p-8 text-[10px] font-black text-[#92400E] uppercase tracking-widest text-center">Status</th>
                    <th className="p-8 text-[10px] font-black text-[#92400E] uppercase tracking-widest text-center">Battery</th>
                    <th className="p-8 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Telemetry</th>
                    <th className="p-8 text-[10px] font-black text-[#92400E] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FDE68A]">
                  {devices.map((device, idx) => (
                    <motion.tr 
                      key={device.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="hover:bg-[#FEF3C7]/10 transition-colors"
                    >
                      <td className="p-8">
                        <div className="font-black text-[#451A03] text-sm font-mono tracking-tight">{device.id}</div>
                        <div className="text-[10px] text-[#92400E] font-bold uppercase mt-1">Industrial Tablet v3</div>
                      </td>
                      <td className="p-8">
                        <div className="font-black text-[#451A03] text-sm">{device.branch}</div>
                        <div className="text-[10px] text-[#92400E] font-bold uppercase mt-1">Authorized Node</div>
                      </td>
                      <td className="p-8 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          device.status === 'Online' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
                        }`}>
                          {device.status}
                        </span>
                      </td>
                      <td className="p-8 text-center">
                        <div className="flex items-center justify-center gap-3">
                           <div className="w-12 h-5 bg-gray-100 rounded-md border border-gray-200 relative overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${parseInt(device.battery) > 20 ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} 
                                style={{ width: device.battery }}
                              ></div>
                           </div>
                           <span className="text-[10px] font-black text-[#451A03]">{device.battery}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="text-sm font-bold text-[#451A03]">{device.lastSync}</div>
                        <div className="text-[10px] text-[#8B7355] font-medium italic">Last heartbeat received</div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-3">
                           <button className="px-5 py-2.5 bg-[#FEF3C7] text-[#78350F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FBBF24] transition-all">Force Sync</button>
                           <button className="px-5 py-2.5 bg-white border border-[#FDE68A] text-[#8B7355] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#78350F] hover:text-[#78350F] transition-all">Ping</button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#451A03] p-10 lg:p-12 rounded-[40px] text-white flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden shadow-2xl"
          >
             <div className="relative z-10 space-y-4">
                <h3 className="text-[#FBBF24] font-black uppercase tracking-[0.3em] text-[10px]">Hardware Integrity Matrix</h3>
                <p className="text-3xl lg:text-4xl font-black font-playfair-display-sc leading-none">98% Global Uptime</p>
                <p className="text-[#E8D5B0] text-sm font-medium italic opacity-70 max-w-lg">Critical maintenance recommended for POS-KEMANG-01 (Low Battery Health).</p>
             </div>
             <div className="relative z-10">
                <button className="w-full sm:w-auto px-12 py-5 bg-[#FBBF24] text-[#451A03] rounded-[20px] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all">Download Telemetry Report</button>
             </div>
             <div className="absolute top-0 right-0 p-12 text-[15rem] opacity-5 pointer-events-none grayscale transform translate-x-1/4 translate-y-1/4 rotate-45">📡</div>
          </motion.div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
