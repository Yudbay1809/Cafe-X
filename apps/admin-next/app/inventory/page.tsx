'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { useState } from 'react';

export default function InventoryPage() {
  const [items] = useState([
    { id: 1, name: 'Espresso Roast (Beans)', stock: 45, unit: 'kg', predicted: 12, status: 'Safe' },
    { id: 2, name: 'Fresh Milk (Greenfield)', stock: 12, unit: 'L', predicted: 15, status: 'Shortage' },
    { id: 3, name: 'Palm Sugar Syrup', stock: 8, unit: 'L', predicted: 3, status: 'Safe' },
    { id: 4, name: 'Paper Cup 8oz', stock: 120, unit: 'pcs', predicted: 450, status: 'Critical' },
  ]);

  return (
    <RequireAuth>
      <AdminShell title="AI Inventory Forecast" subtitle="Demand prediction for next 7 days based on 12 months of historical sales data and seasonal trends.">
        
        {/* Exact 20px Gap from Pencil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
           {items.map(item => {
             const isShortage = item.stock < item.predicted;
             return (
               <div 
                 key={item.id} 
                 className={`p-7 rounded-3xl border transition-all flex flex-col gap-5 ${
                   isShortage 
                     ? 'bg-white border-[#EF444430] border-2 shadow-[0_2px_16px_rgba(239,68,68,0.1)]' 
                     : 'bg-white border-sultan-border shadow-sultan-soft'
                 }`}
               >
                 <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black font-playfair-display-sc text-sultan-text tracking-tight">{item.name}</h3>
                      <p className="text-[10px] font-bold text-sultan-text-muted uppercase tracking-[0.2em] mt-1">SKU: CX-{100 + item.id}</p>
                    </div>
                    {isShortage && (
                      <span className="px-4 py-1.5 bg-[#EF4444] text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
                        Shortage!
                      </span>
                    )}
                 </div>

                 <div className="flex gap-10 items-center">
                    <div>
                      <p className="text-[10px] font-black text-sultan-text-muted uppercase tracking-widest mb-1">Forecast Need</p>
                      <p className="text-2xl font-black text-sultan-text font-playfair-display-sc">{item.predicted} {item.unit}</p>
                    </div>
                    <div className="w-px h-10 bg-sultan-border"></div>
                    <div>
                      <p className="text-[10px] font-black text-sultan-text-muted uppercase tracking-widest mb-1">On Hand</p>
                      <p className={`text-2xl font-black font-playfair-display-sc ${isShortage ? 'text-[#EF4444]' : 'text-sultan-text'}`}>
                        {item.stock} {item.unit}
                      </p>
                    </div>
                 </div>

                 <div className="pt-5 border-t border-sultan-border flex justify-between items-center">
                    <p className="text-xs text-sultan-text-muted font-medium italic">
                      {isShortage ? 'Auto-reorder triggered for tonight at 04:00 AM' : 'Stock levels sufficient for predicted demand.'}
                    </p>
                    <button className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isShortage ? 'bg-sultan-primary text-white shadow-sultan-soft' : 'bg-sultan-bg-warm text-sultan-primary'
                    }`}>
                      {isShortage ? 'Manage PO' : 'View History'}
                    </button>
                 </div>
               </div>
             );
           })}
        </div>

        {/* Global Summary from Pencil Logic */}
        <div className="bg-[#451A03] p-10 rounded-[2.5rem] shadow-sultan-active text-white relative overflow-hidden mt-10">
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-3xl">✨</span>
                <h2 className="text-2xl font-black font-playfair-display-sc text-sultan-cta tracking-tight">Enterprise Forecasting Engine</h2>
              </div>
              <p className="text-white/60 font-medium max-w-2xl leading-relaxed">
                 Our model analyzed historical trends and seasonal demand to optimize your supply chain. 
                 Global stock health is currently <span className="text-[#10B981] font-bold">Optimal</span>.
              </p>
              <div className="flex gap-8">
                 <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[10px] font-black text-sultan-cta uppercase mb-1">Model Accuracy</p>
                    <p className="text-xl font-black">94.8%</p>
                 </div>
                 <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[10px] font-black text-sultan-cta uppercase mb-1">Confidence Score</p>
                    <p className="text-xl font-black">High</p>
                 </div>
              </div>
           </div>
           <div className="absolute top-0 right-0 p-12 text-[15rem] opacity-5 pointer-events-none transform translate-x-1/4">🪄</div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
