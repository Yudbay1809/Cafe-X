'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function BrandsPage() {
  const [brands] = useState([
    { id: 1, name: 'Cafe-X', outlets: 8, status: 'Active', color: '#78350F', logo: '☕' },
    { id: 2, name: 'Resto-X (Bakery)', outlets: 3, status: 'Trial', color: '#B45309', logo: '🥐' },
    { id: 3, name: 'X-Juice Bar', outlets: 2, status: 'Active', color: '#D97706', logo: '🍹' },
  ]);

  return (
    <RequireAuth>
      <AdminShell 
        title="Multi-Brand HQ" 
        subtitle="Unified management for your entire Enterprise portfolio."
        actions={
          <button className="hidden sm:block px-8 py-3 bg-[#78350F] text-white rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#451A03] transition-all hover:scale-105 active:scale-95">
            + Launch New Brand
          </button>
        }
      >
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {brands.map((brand, idx) => (
              <motion.div 
                key={brand.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[40px] shadow-soft border border-[#FDE68A] space-y-8 relative overflow-hidden group"
              >
                 <div className="flex justify-between items-start relative z-10">
                    <div className="w-20 h-20 rounded-[24px] flex items-center justify-center text-4xl shadow-inner bg-[#FEF3C7]/50 border border-[#FDE68A]">
                       {brand.logo}
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${brand.status === 'Active' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF9C3] text-[#854D0E]'}`}>
                       {brand.status}
                    </span>
                 </div>
                 <div className="relative z-10">
                    <h2 className="text-3xl font-black text-[#451A03] font-playfair-display-sc tracking-tight uppercase leading-none">{brand.name}</h2>
                    <p className="text-[#92400E] font-bold text-[10px] mt-2 uppercase tracking-widest opacity-60">{brand.outlets} Outlets Synchronized</p>
                 </div>
                 <div className="pt-8 border-t border-[#FDE68A] flex gap-4 relative z-10">
                    <button className="flex-1 py-4 bg-[#78350F] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#78350F]/20 hover:bg-[#451A03] transition-all">Command</button>
                    <button className="flex-1 py-4 bg-[#FEF3C7] text-[#78350F] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FDE68A] transition-all">Config</button>
                 </div>
                 {/* Decorative Background Icon */}
                 <div className="absolute -bottom-8 -right-8 text-9xl opacity-5 grayscale pointer-events-none transform group-hover:rotate-12 transition-transform duration-700">
                    {brand.logo}
                 </div>
              </motion.div>
            ))}

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#FEF3C7]/30 border-4 border-dashed border-[#FDE68A] rounded-[40px] flex flex-col items-center justify-center p-10 space-y-6 hover:bg-[#FEF3C7]/50 transition-all cursor-pointer group"
            >
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md text-[#78350F] font-black group-hover:scale-110 transition-transform">+</div>
               <div className="text-center">
                 <p className="font-black text-[#78350F] text-xl uppercase tracking-tighter font-playfair-display-sc">Scale Empire</p>
                 <p className="text-[#92400E] font-medium text-[10px] uppercase tracking-widest mt-1">Acquire or launch new brand</p>
               </div>
            </motion.div>
          </div>

          {/* Consolidated Enterprise View */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#451A03] p-10 lg:p-12 rounded-[40px] shadow-2xl relative overflow-hidden"
          >
             <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
                <div className="space-y-4">
                  <h3 className="text-[#FBBF24] font-black uppercase tracking-[0.3em] text-[10px]">Global Enterprise Stats</h3>
                  <p className="text-white text-3xl lg:text-4xl font-black font-playfair-display-sc leading-none">Consolidated Performance</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full xl:w-auto">
                    {[
                      { label: 'Global Revenue', value: 'Rp 482.5M', color: 'text-[#FBBF24]' },
                      { label: 'Total Orders', value: '12,450', color: 'text-white' },
                      { label: 'Live Branches', value: '13', color: 'text-white' },
                      { label: 'Global Force', value: '68', color: 'text-white' }
                    ].map((stat, i) => (
                      <div key={i} className="space-y-2">
                        <p className="text-[#E8D5B0] text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</p>
                        <p className={`text-2xl font-black font-playfair-display-sc ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                </div>
             </div>
             {/* Background Glow */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#78350F] to-transparent opacity-50"></div>
          </motion.div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
