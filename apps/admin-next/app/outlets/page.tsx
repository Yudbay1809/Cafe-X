'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function OutletsPage() {
  const [outlets] = useState([
    { id: 1, name: 'Cafe-X Senopati (Pusat)', address: 'Jl. Senopati No. 12, Jaksel', status: 'Active', revenue: 'Rp 42.5M' },
    { id: 2, name: 'Cafe-X Kemang', address: 'Jl. Kemang Raya No. 45, Jaksel', status: 'Active', revenue: 'Rp 28.2M' },
    { id: 3, name: 'Cafe-X PIK', address: 'Pantai Indah Kapuk, Jakut', status: 'Preparing', revenue: 'Rp 0' },
  ]);

  return (
    <RequireAuth>
      <AdminShell 
        title="Multi-Outlet Management" 
        subtitle="Unified management for your entire Enterprise portfolio."
      >
        <div className="flex justify-end mb-12">
           <button className="bg-[#632C0D] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
             + Launch New Outlet
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {outlets.map((o, idx) => (
            <motion.div 
              key={o.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[48px] p-10 border border-[#FDE68A] shadow-soft hover:shadow-xl transition-all group"
            >
               <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-[#FEF3C7] rounded-[24px] flex items-center justify-center text-3xl">
                    📍
                  </div>
                  <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${
                    o.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {o.status}
                  </span>
               </div>

               <div className="space-y-3 mb-10">
                  <h3 className="text-2xl font-black font-playfair-display-sc text-[#451A03] tracking-tight group-hover:text-[#D97706] transition-colors">{o.name}</h3>
                  <p className="text-sm font-medium text-[#92400E] opacity-70">{o.address}</p>
               </div>

               <div className="pt-8 border-t border-[#FDE68A] flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-[#92400E] uppercase tracking-widest mb-1">Revenue Today</p>
                    <p className="text-2xl font-black text-[#451A03] font-playfair-display-sc">{o.revenue}</p>
                  </div>
                  <button className="w-12 h-12 bg-[#FEF3C7] rounded-2xl flex items-center justify-center text-[#451A03] hover:bg-[#632C0D] hover:text-white transition-all">
                    →
                  </button>
               </div>
            </motion.div>
          ))}
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
