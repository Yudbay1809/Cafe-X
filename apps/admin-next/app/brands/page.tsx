'use client';

import React, { useState } from 'react';

export default function BrandsPage() {
  const [brands] = useState([
    { id: 1, name: 'Cafe-X', outlets: 8, status: 'Active', color: '#78350F', logo: '☕' },
    { id: 2, name: 'Resto-X (Bakery)', outlets: 3, status: 'Trial', color: '#B45309', logo: '🥐' },
    { id: 3, name: 'X-Juice Bar', outlets: 2, status: 'Active', color: '#D97706', logo: '🍹' },
  ]);

  return (
    <div className="p-8 space-y-8 bg-[#FEF3C7]/20 min-h-screen font-karla">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-[#451A03] font-playfair-display-sc uppercase tracking-tight">Multi-Brand HQ</h1>
          <p className="text-[#92400E] mt-1 font-medium">Unified management for your entire Enterprise portfolio.</p>
        </div>
        <button className="px-8 py-4 bg-[#78350F] text-white rounded-2xl shadow-xl font-black hover:bg-[#451A03] transition-all hover:scale-105 active:scale-95">
          + Launch New Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {brands.map(brand => (
          <div key={brand.id} className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-[#78350F]/5 border border-[#FDE68A] space-y-8 relative overflow-hidden group">
             <div className="flex justify-between items-start relative z-10">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner bg-[#FEF3C7]/50 border border-[#FDE68A]">
                   {brand.logo}
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${brand.status === 'Active' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF9C3] text-[#854D0E]'}`}>
                   {brand.status}
                </span>
             </div>
             <div className="relative z-10">
                <h2 className="text-3xl font-black text-[#451A03] font-playfair-display-sc">{brand.name}</h2>
                <p className="text-[#92400E] font-bold text-sm mt-1 uppercase tracking-wider">{brand.outlets} Outlets Synchronized</p>
             </div>
             <div className="pt-8 border-t border-[#FDE68A] flex gap-4 relative z-10">
                <button className="flex-1 py-4 bg-[#78350F] text-white rounded-2xl font-black text-sm shadow-lg shadow-[#78350F]/20 hover:bg-[#451A03] transition-all">Command</button>
                <button className="flex-1 py-4 bg-[#FEF3C7] text-[#78350F] rounded-2xl font-black text-sm hover:bg-[#FDE68A] transition-all">Configure</button>
             </div>
             {/* Decorative Background Icon */}
             <div className="absolute -bottom-8 -right-8 text-9xl opacity-5 grayscale pointer-events-none transform group-hover:rotate-12 transition-transform">
                {brand.logo}
             </div>
          </div>
        ))}

        <div className="bg-[#FEF3C7]/30 border-4 border-dashed border-[#FDE68A] rounded-[2.5rem] flex flex-col items-center justify-center p-10 space-y-6 hover:bg-[#FEF3C7]/50 transition-all cursor-pointer group">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md text-[#78350F] font-black group-hover:scale-110 transition-transform">+</div>
           <div className="text-center">
             <p className="font-black text-[#78350F] text-xl uppercase tracking-tighter">Scale Empire</p>
             <p className="text-[#92400E] font-medium text-sm mt-1">Acquire or launch a new brand</p>
           </div>
        </div>
      </div>

      {/* Consolidated Enterprise View */}
      <div className="bg-[#451A03] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-2">
              <h3 className="text-[#FBBF24] font-black uppercase tracking-widest text-xs">Global Enterprise Stats</h3>
              <p className="text-white text-3xl font-black font-playfair-display-sc">Consolidated Performance</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 w-full lg:w-auto">
                <div className="space-y-1">
                  <p className="text-[#E8D5B0] text-[10px] font-black uppercase tracking-widest">Global Revenue</p>
                  <p className="text-2xl font-black text-[#FBBF24]">Rp 482.5M</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[#E8D5B0] text-[10px] font-black uppercase tracking-widest">Total Orders</p>
                  <p className="text-2xl font-black text-white">12,450</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[#E8D5B0] text-[10px] font-black uppercase tracking-widest">Live Branches</p>
                  <p className="text-2xl font-black text-white">13</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[#E8D5B0] text-[10px] font-black uppercase tracking-widest">Global Force</p>
                  <p className="text-2xl font-black text-white">68</p>
                </div>
            </div>
         </div>
         {/* Background Glow */}
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#78350F] to-transparent opacity-50"></div>
      </div>
    </div>
  );
}
