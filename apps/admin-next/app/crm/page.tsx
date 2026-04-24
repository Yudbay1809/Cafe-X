'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <RequireAuth>
      <AdminShell 
        title="CRM & Loyalty Sultan" 
        subtitle="Manage your relationship with 4,500+ members via Gamification."
        actions={
          <div className="flex gap-4">
             <div className="bg-white p-1 rounded-2xl flex shadow-sm border border-[#FDE68A] h-fit">
              <button 
                onClick={() => setView('members')}
                className={`px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${view === 'members' ? 'bg-[#78350F] text-white shadow-md' : 'text-[#78350F]'}`}
              >
                Members
              </button>
              <button 
                onClick={() => setView('gamification')}
                className={`px-6 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${view === 'gamification' ? 'bg-[#78350F] text-white shadow-md' : 'text-[#78350F]'}`}
              >
                Gamify
              </button>
            </div>
            <button 
              onClick={handleBroadcast}
              disabled={broadcasting}
              className={`hidden sm:block px-8 py-3 rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest text-white transition-all ${
                broadcasting ? 'bg-gray-400' : 'bg-[#92400E] hover:bg-[#78350F] hover:scale-105 active:scale-95'
              }`}
            >
              {broadcasting ? 'Sending...' : '🚀 Broadcast'}
            </button>
          </div>
        }
      >
        <AnimatePresence mode="wait">
          {view === 'members' ? (
            <motion.div 
              key="members" 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Members', value: '4,520', sub: '↑ 12% from last month', active: false },
                  { label: 'Stamp Cards Active', value: '1,250', sub: 'High Engagement', active: true },
                  { label: 'Free Coffee Claims', value: '245', sub: 'Success Rate: 82%', active: false },
                  { label: 'Churn Risk (30d)', value: '12%', sub: 'Target for broadcast', active: false, warning: true },
                ].map((stat, i) => (
                  <div key={i} className={`p-8 rounded-[32px] border transition-all ${
                    stat.active ? 'bg-[#632C0D] text-white shadow-xl' : 'bg-white border-[#FDE68A] shadow-soft'
                  }`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${stat.active ? 'text-[#FBBF24]' : 'text-[#92400E]'}`}>{stat.label}</p>
                    <p className={`text-4xl font-black font-playfair-display-sc ${stat.warning ? 'text-[#EF4444]' : ''}`}>{stat.value}</p>
                    <p className={`text-[10px] font-bold mt-4 ${stat.active ? 'text-white/50' : 'text-sultan-text-muted'}`}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[40px] shadow-soft border border-[#FDE68A] overflow-hidden">
                <div className="p-8 border-b border-[#FDE68A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                   <h2 className="font-black text-xl text-[#451A03] font-playfair-display-sc uppercase tracking-tight">Member Engagement Feed</h2>
                   <div className="w-full sm:w-auto">
                     <input type="text" placeholder="Search member..." className="w-full sm:w-64 px-6 py-3 bg-[#FEF3C7]/30 border border-[#FDE68A] rounded-2xl text-sm font-bold text-[#451A03] focus:outline-none" />
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-[#FEF3C7]/20 border-b border-[#FDE68A]">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Member Profile</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest text-center">Digital Stamps</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Spending History</th>
                        <th className="px-8 py-6 text-[10px] font-black text-[#92400E] uppercase tracking-widest text-right">Loyalty Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FDE68A]">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-[#FEF3C7]/10 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-black text-[#451A03] text-base">{c.name}</div>
                            <div className="text-[10px] text-[#92400E] font-bold uppercase mt-1">{c.phone} • Last: {c.lastVisit}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center gap-1.5">
                              {[...Array(9)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] ${i < c.stamps ? 'bg-[#FBBF24] border-[#92400E] text-[#451A03] shadow-inner' : 'bg-gray-50 border-gray-100'}`}
                                >
                                  {i < c.stamps ? '☕' : ''}
                                </div>
                              ))}
                            </div>
                            <p className="text-center text-[9px] font-black uppercase tracking-widest mt-3 text-[#92400E]">{c.stamps}/9 Stamps Collected</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-black text-[#451A03] text-base">Rp {c.totalSpend.toLocaleString()}</div>
                            <div className="text-[9px] font-black text-[#92400E] uppercase mt-1">High Value Tier</div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="px-8 py-3 bg-[#78350F] text-white rounded-[14px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#78350F]/20 hover:bg-[#451A03] transition-all">
                              Give Stamp
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="gamification" 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white p-10 lg:p-12 rounded-[40px] shadow-soft border border-[#FDE68A] space-y-12"
            >
              <div className="max-w-2xl space-y-4">
                <h2 className="text-3xl font-black text-[#451A03] font-playfair-display-sc uppercase tracking-tight">Stamp Card Gamification</h2>
                <p className="text-[#8B7355] text-base leading-relaxed">Configure your "Buy 9 Get 1 Free" rules. Automated engine proven to increase customer retention by 40%.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6 border p-8 rounded-[32px] border-[#FDE68A] bg-[#FEF3C7]/10">
                  <h3 className="font-black text-[10px] text-[#451A03] uppercase tracking-widest">Reward Threshold</h3>
                  <div className="flex items-center gap-6">
                    <input type="number" defaultValue={9} className="w-24 p-5 rounded-2xl border border-[#FDE68A] font-black text-2xl text-[#451A03] focus:border-[#FBBF24] outline-none" />
                    <span className="font-bold text-sm text-[#92400E] leading-tight">Stamps required to claim 1 Free item.</span>
                  </div>
                </div>
                
                <div className="space-y-6 border p-8 rounded-[32px] border-[#FDE68A] bg-[#FEF3C7]/10">
                  <h3 className="font-black text-[10px] text-[#451A03] uppercase tracking-widest">Redemption Item</h3>
                  <select className="w-full p-5 rounded-2xl border border-[#FDE68A] font-black text-sm text-[#451A03] focus:border-[#FBBF24] outline-none appearance-none">
                    <option>All Menu (Max Rp 35k)</option>
                    <option>Es Kopi Susu Sultan only</option>
                    <option>Selected Bakery items</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#451A03] text-white p-10 lg:p-12 rounded-[40px] relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#FBBF24]/20 border border-[#FBBF24]/30 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-[#FBBF24]">
                    ✨ AI Predictive Insight
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black font-playfair-display-sc leading-none">Smart Retention Driver</h3>
                  <p className="text-[#E8D5B0] max-w-lg text-sm lg:text-base leading-relaxed opacity-80">
                    Customers with 6+ stamps are 3x more likely to return within 48 hours. Consider a targeted 5% discount broadcast to those with 8 stamps.
                  </p>
                  <button className="px-10 py-5 bg-[#FBBF24] text-[#451A03] font-black rounded-[20px] uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">
                    Apply Strategic Push
                  </button>
                </div>
                <div className="absolute -top-10 -right-10 p-12 text-[12rem] opacity-5 pointer-events-none grayscale transform rotate-12">☕</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AdminShell>
    </RequireAuth>
  );
}
