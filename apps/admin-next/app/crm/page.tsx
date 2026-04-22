'use client';

import React, { useState } from 'react';

export default function CRMPage() {
  const [view, setView] = useState<'members' | 'gamification'>('members');
  const [customers] = useState([
    { id: 1, name: 'Bambang Sukirman', phone: '+62812345678', stamps: 8, totalSpend: 3450000, lastVisit: '2 days ago' },
    { id: 2, name: 'Dewi Lestari', phone: '+62819876543', stamps: 3, totalSpend: 2100000, lastVisit: '1 week ago' },
    { id: 3, name: 'Farhan Azis', phone: '+62811223344', stamps: 9, totalSpend: 5800000, lastVisit: 'Today' },
  ]);

  const [broadcasting, setBroadcasting] = useState(false);

  const handleBroadcast = () => {
    setBroadcasting(true);
    setTimeout(() => {
      alert('Simulasi: Pesan Promo WhatsApp telah dikirim ke 1.250 Member Loyal!');
      setBroadcasting(false);
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-[#FEF3C7]/20 min-h-screen font-karla">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-[#451A03] font-playfair-display-sc uppercase tracking-tight">CRM & Loyalty Sultan</h1>
          <p className="text-[#92400E] mt-1 font-medium">Manage your relationship with 4,500+ members via Gamification.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-1 rounded-2xl flex shadow-sm border border-[#FDE68A]">
            <button 
              onClick={() => setView('members')}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${view === 'members' ? 'bg-[#78350F] text-white shadow-md' : 'text-[#78350F]'}`}
            >
              Members
            </button>
            <button 
              onClick={() => setView('gamification')}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${view === 'gamification' ? 'bg-[#78350F] text-white shadow-md' : 'text-[#78350F]'}`}
            >
              Gamification
            </button>
          </div>
          <button 
            onClick={handleBroadcast}
            disabled={broadcasting}
            className={`px-6 py-3 rounded-2xl shadow-xl font-bold text-white transition-all ${
              broadcasting ? 'bg-gray-400' : 'bg-[#92400E] hover:bg-[#78350F]'
            }`}
          >
            {broadcasting ? 'Sending...' : '🚀 Broadcast Promo'}
          </button>
        </div>
      </div>

      {view === 'members' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#FDE68A] flex flex-col gap-2">
              <span className="text-sm text-[#92400E] font-bold uppercase tracking-wider">Total Members</span>
              <span className="text-4xl font-black text-[#451A03]">4,520</span>
            </div>
            <div className="bg-[#78350F] p-6 rounded-3xl shadow-xl flex flex-col gap-2">
              <span className="text-sm text-[#FBBF24] font-bold uppercase tracking-wider">Stamp Cards Active</span>
              <span className="text-4xl font-black text-white">1,250</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#FDE68A] flex flex-col gap-2">
              <span className="text-sm text-[#92400E] font-bold uppercase tracking-wider">Free Coffee Claims</span>
              <span className="text-4xl font-black text-[#10B981]">245</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#FDE68A] flex flex-col gap-2">
              <span className="text-sm text-[#92400E] font-bold uppercase tracking-wider">Churn Risk (30d)</span>
              <span className="text-4xl font-black text-[#EF4444]">12%</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-[#FDE68A] overflow-hidden">
            <div className="p-8 border-b border-[#FDE68A] flex justify-between items-center">
               <h2 className="font-black text-xl text-[#451A03] font-playfair-display-sc">Member Engagement Feed</h2>
               <div className="flex gap-2">
                 <input type="text" placeholder="Search member..." className="px-4 py-2 bg-[#FEF3C7]/30 border border-[#FDE68A] rounded-xl focus:outline-none" />
               </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#FEF3C7]/20 border-b border-[#FDE68A]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Member Profile</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase text-center">Digital Stamps</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase">Spending History</th>
                  <th className="px-8 py-4 text-xs font-black text-[#92400E] uppercase text-right">Loyalty Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FDE68A]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FEF3C7]/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-black text-[#451A03] text-lg">{c.name}</div>
                      <div className="text-sm text-[#92400E] font-medium">{c.phone} • Last: {c.lastVisit}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-1">
                        {[...Array(9)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${i < c.stamps ? 'bg-[#FBBF24] border-[#92400E] text-[#451A03]' : 'bg-gray-50 border-gray-200'}`}
                          >
                            {i < c.stamps ? '☕' : ''}
                          </div>
                        ))}
                      </div>
                      <p className="text-center text-xs font-bold mt-2 text-[#92400E]">{c.stamps}/9 Stamps Collected</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-[#451A03]">Rp {c.totalSpend.toLocaleString()}</div>
                      <div className="text-xs text-[#92400E]">High Value Tier</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="px-4 py-2 bg-[#78350F] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#451A03] transition-all">
                        Give Stamp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#FDE68A] space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black text-[#451A03] font-playfair-display-sc mb-4">Stamp Card Gamification Settings</h2>
            <p className="text-[#92400E]">Configure your "Buy 9 Get 1 Free" rules. This is proven to increase customer retention by 40%.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 border p-6 rounded-2xl border-[#FDE68A] bg-[#FEF3C7]/10">
              <h3 className="font-bold text-lg text-[#451A03]">Reward Threshold</h3>
              <div className="flex items-center gap-4">
                <input type="number" defaultValue={9} className="w-20 p-3 rounded-xl border border-[#FDE68A] font-bold" />
                <span className="font-medium text-[#92400E]">Stamps to get 1 Free Item</span>
              </div>
            </div>
            
            <div className="space-y-4 border p-6 rounded-2xl border-[#FDE68A] bg-[#FEF3C7]/10">
              <h3 className="font-bold text-lg text-[#451A03]">Redemption Item</h3>
              <select className="w-full p-3 rounded-xl border border-[#FDE68A] font-bold">
                <option>All Menu (Max Rp 35k)</option>
                <option>Es Kopi Susu Sultan only</option>
                <option>Selected Bakery items</option>
              </select>
            </div>
          </div>

          <div className="bg-[#451A03] text-white p-10 rounded-3xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2 text-[#FBBF24]">AI Loyalty Insight</h3>
              <p className="text-[#E8D5B0] max-w-lg">Based on recent data, customers who have 6+ stamps are 3x more likely to return within 48 hours. Consider sending a 5% discount push notification to those with 8 stamps to "finish the card".</p>
              <button className="mt-6 px-8 py-3 bg-[#FBBF24] text-[#451A03] font-black rounded-2xl hover:scale-105 transition-transform">
                Apply AI Recommendation
              </button>
            </div>
            <div className="absolute top-0 right-0 p-12 text-9xl opacity-10 pointer-events-none">☕</div>
          </div>
        </div>
      )}
    </div>
  );
}
