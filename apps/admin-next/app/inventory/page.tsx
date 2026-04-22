'use client';

import React, { useState } from 'react';

export default function InventoryPage() {
  const [view, setView] = useState<'stock' | 'ai-forecast'>('stock');
  const [items] = useState([
    { id: 1, name: 'Espresso Roast (Beans)', category: 'Coffee', stock: 45, unit: 'kg', status: 'Healthy', predictedUsage: 12 },
    { id: 2, name: 'Fresh Milk (Greenfield)', category: 'Dairy', stock: 12, unit: 'L', status: 'Low Stock', predictedUsage: 15 },
    { id: 3, name: 'Palm Sugar Syrup', category: 'Syrup', stock: 8, unit: 'L', status: 'Healthy', predictedUsage: 3 },
    { id: 4, name: 'Paper Cup 8oz', category: 'Packaging', stock: 120, unit: 'pcs', status: 'Critical', predictedUsage: 450 },
  ]);

  return (
    <div className="p-8 space-y-8 bg-[#FEF3C7]/20 min-h-screen font-karla">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-[#451A03] font-playfair-display-sc uppercase tracking-tight">Stock & AI Forecast</h1>
          <p className="text-[#92400E] mt-1 font-medium">Real-time inventory optimization for the Sultan ecosystem.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-1 rounded-2xl flex shadow-sm border border-[#FDE68A]">
            <button 
              onClick={() => setView('stock')}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${view === 'stock' ? 'bg-[#78350F] text-white shadow-md' : 'text-[#78350F]'}`}
            >
              Current Stock
            </button>
            <button 
              onClick={() => setView('ai-forecast')}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${view === 'ai-forecast' ? 'bg-[#78350F] text-white shadow-md' : 'text-[#78350F]'}`}
            >
              🪄 AI Forecasting
            </button>
          </div>
        </div>
      </div>

      {view === 'stock' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FEF3C7] border border-[#FDE68A] p-8 rounded-3xl shadow-sm">
                <p className="text-xs font-black text-[#92400E] uppercase tracking-widest">Low Stock Alerts</p>
                <p className="text-4xl font-black text-[#451A03] mt-2">5 Items</p>
                <p className="text-sm text-[#92400E] font-medium mt-1">Immediate action required for 2 outlets.</p>
            </div>
            <div className="bg-white border border-[#FDE68A] p-8 rounded-3xl shadow-sm">
                <p className="text-xs font-black text-[#92400E] uppercase tracking-widest">Open Purchase Orders</p>
                <p className="text-4xl font-black text-[#451A03] mt-2">3 POs</p>
                <p className="text-sm text-[#92400E] font-medium mt-1">Waiting for delivery from 2 suppliers.</p>
            </div>
            <div className="bg-[#78350F] p-8 rounded-3xl shadow-xl">
                <p className="text-xs font-black text-[#FBBF24] uppercase tracking-widest">Inv. Valuation</p>
                <p className="text-4xl font-black text-white mt-2">Rp 42.5M</p>
                <p className="text-sm text-[#E8D5B0] font-medium mt-1">Total value across all Cafe-X brands.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-[#FDE68A] overflow-hidden">
            <div className="p-8 border-b border-[#FDE68A] flex justify-between items-center">
              <h2 className="font-black text-xl text-[#451A03] font-playfair-display-sc uppercase">Central Inventory Feed</h2>
              <button className="px-6 py-2 bg-[#78350F] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#451A03]">
                + Add Item
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#FEF3C7]/20 border-b border-[#FDE68A]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Item Details</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Category</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase text-center">Total Stock</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase text-center">Stock Health</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FDE68A]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FEF3C7]/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-black text-[#451A03] text-lg">{item.name}</div>
                      <div className="text-xs text-[#92400E] font-medium">SKU-CX-{2000 + item.id}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-[#451A03] bg-[#FEF3C7] px-3 py-1 rounded-lg border border-[#FDE68A]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center font-black text-lg text-[#451A03]">
                      {item.stock} <span className="text-xs font-bold text-[#92400E]">{item.unit}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        item.status === 'Healthy' ? 'bg-[#DCFCE7] text-[#166534]' :
                        item.status === 'Low Stock' ? 'bg-[#FEF9C3] text-[#854D0E]' :
                        'bg-[#FEE2E2] text-[#991B1B]'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-[#78350F] font-black hover:underline text-sm uppercase tracking-wider">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="space-y-8">
           <div className="bg-[#451A03] p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="p-2 bg-[#FBBF24] rounded-xl text-[#451A03]">✨</span>
                  <h2 className="text-2xl font-black font-playfair-display-sc text-[#FBBF24] uppercase tracking-widest">AI Demand Prediction (Next 7 Days)</h2>
                </div>
                <p className="text-[#E8D5B0] max-w-xl font-medium text-lg leading-relaxed">
                  Our model analyzed 12 months of sales data, current weather (Rainy Season JKT), and the upcoming Ramadan surge to predict your stock needs.
                </p>
                <div className="mt-8 flex gap-4">
                  <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-sm">
                    <p className="text-xs font-bold text-[#FBBF24] uppercase">Model Accuracy</p>
                    <p className="text-xl font-black">94.8%</p>
                  </div>
                  <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-sm">
                    <p className="text-xs font-bold text-[#FBBF24] uppercase">Last Trained</p>
                    <p className="text-xl font-black">Today, 04:00 AM</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-12 text-[15rem] opacity-5 pointer-events-none transform translate-x-1/4">🪄</div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {items.map(item => {
                const isShortage = item.stock < item.predictedUsage;
                return (
                  <div key={item.id} className={`bg-white p-8 rounded-[2rem] border shadow-sm flex justify-between items-center transition-all hover:scale-[1.02] ${isShortage ? 'border-[#EF4444]/30 bg-[#FEE2E2]/5' : 'border-[#FDE68A]'}`}>
                    <div className="space-y-3">
                       <p className="font-black text-2xl text-[#451A03] font-playfair-display-sc">{item.name}</p>
                       <div className="flex gap-4">
                         <div>
                           <p className="text-[10px] font-black text-[#92400E] uppercase tracking-widest mb-1">Forecast Need</p>
                           <p className="text-xl font-black text-[#451A03]">{item.predictedUsage} {item.unit}</p>
                         </div>
                         <div className="w-px h-10 bg-[#FDE68A]"></div>
                         <div>
                           <p className="text-[10px] font-black text-[#92400E] uppercase tracking-widest mb-1">On Hand</p>
                           <p className={`text-xl font-black ${isShortage ? 'text-[#EF4444]' : 'text-[#451A03]'}`}>{item.stock} {item.unit}</p>
                         </div>
                       </div>
                    </div>
                    <div className="text-right">
                       {isShortage ? (
                         <div className="space-y-3">
                           <span className="bg-[#EF4444] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">Shortage!</span>
                           <button className="block w-full px-6 py-3 bg-[#78350F] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#78350F]/30 hover:bg-[#451A03] transition-all">
                             Auto-Reorder
                           </button>
                         </div>
                       ) : (
                         <span className="bg-[#DCFCE7] text-[#166534] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Safe Stock</span>
                       )}
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}
    </div>
  );
}
