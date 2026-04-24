'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [outlet, setOutlet] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      const res = await adminApi.outlets();
      if (res.items.length > 0) setOutlet(res.items[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData);
    try {
      await fetch(`http://127.0.0.1:9000/api/v1/outlets/${outlet.id}`, {
          method: 'PUT',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${JSON.parse(localStorage.getItem('cafe_admin_session')!).token}`
          },
          body: JSON.stringify(body)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert('Gagal menyimpan pengaturan');
    }
  }

  return (
    <RequireAuth>
      <AdminShell 
        title="Imperial Core Settings" 
        subtitle="Configure the underlying foundations of your global coffee empire."
      >
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
          <aside className="xl:col-span-1 space-y-4">
             {[
               { id: 'profile', label: 'Empire Profile', icon: '🏰', active: true },
               { id: 'notif', label: 'Directives & Alerts', icon: '🔔', active: false },
               { id: 'pay', label: 'Treasury Integrations', icon: '💳', active: false },
               { id: 'sec', label: 'Imperial Security', icon: '🛡️', active: false },
             ].map(item => (
               <button 
                key={item.id}
                className={`w-full flex items-center gap-5 px-8 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all ${
                  item.active ? 'bg-[#632C0D] text-white shadow-xl' : 'text-[#8B7355] hover:bg-[#FEF3C7]/50 border border-transparent hover:border-[#FDE68A]'
                }`}
               >
                 <span className="text-xl">{item.icon}</span>
                 {item.label}
               </button>
             ))}
          </aside>

          <main className="xl:col-span-3 space-y-10">
            {loading ? (
              <div className="bg-white p-20 rounded-[40px] border border-[#FDE68A] flex items-center justify-center">
                 <div className="text-[#632C0D] font-black font-playfair-display-sc animate-pulse uppercase tracking-[0.2em] text-xs">Imperial Configurator Loading...</div>
              </div>
            ) : (
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit} 
                className="bg-white p-10 lg:p-12 rounded-[40px] border border-[#FDE68A] shadow-soft space-y-12"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black font-playfair-display-sc text-[#451A03] uppercase tracking-tight">Business Profile</h2>
                  <div className="w-12 h-12 bg-[#FEF3C7] rounded-2xl flex items-center justify-center text-xl">🏰</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-[0.2em] px-2">Empire Unit Name</label>
                        <input name="name" defaultValue={outlet?.name} className="sultan-input" placeholder="e.g. Cafe-X HQ" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-[0.2em] px-2">Strategic Unit Code</label>
                        <input name="code" defaultValue={outlet?.code} readOnly className="sultan-input bg-[#FEF3C7]/10 text-[#92400E] cursor-not-allowed border-dashed" />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-[0.2em] px-2">Operational HQ Address</label>
                    <textarea name="address" defaultValue={outlet?.address} className="sultan-input !rounded-[32px] !p-6" rows={4} placeholder="Enter full address..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-[0.2em] px-2">Imperial Contact (WA)</label>
                        <input name="phone" defaultValue={outlet?.phone} placeholder="62812..." className="sultan-input" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-[0.2em] px-2">Dynasty Brand Name</label>
                        <input name="brand_name" defaultValue={outlet?.brand_name} className="sultan-input" placeholder="e.g. SULTAN SELECTIONS" />
                    </div>
                </div>

                <div className="pt-10 border-t border-[#FDE68A] flex flex-col sm:flex-row items-center justify-between gap-6">
                    <AnimatePresence>
                      {success && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0 }}
                          className="text-[#10B981] text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                          ✨ Imperial Decrees Updated Successfully!
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <button type="submit" className="w-full sm:w-auto bg-[#632C0D] text-white px-12 py-5 rounded-[20px] font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all ml-auto">
                        Save New Decrees
                    </button>
                </div>
              </motion.form>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#451A03] p-10 lg:p-12 rounded-[40px] text-white flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden shadow-2xl"
            >
               <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-1 bg-white/10 border border-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-[#FBBF24]">
                    Verified System
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-black font-playfair-display-sc leading-none">Cafe-X Enterprise Edition</h3>
                  <p className="text-[#E8D5B0] text-xs font-medium italic opacity-70">Software Sovereignty Verified v1.0.0 — Licensed for Global Scale.</p>
               </div>
               <div className="relative z-10 flex flex-wrap justify-center gap-6">
                  <button className="text-[10px] font-black uppercase tracking-widest text-[#FBBF24] hover:underline transition-all">Scan for Updates</button>
                  <button className="text-[10px] font-black uppercase tracking-widest text-white hover:underline border-l border-white/20 pl-6 transition-all">Export Ledger Backup</button>
               </div>
               <div className="absolute top-0 right-0 p-12 text-[15rem] opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4 -rotate-12">📜</div>
            </motion.div>
          </main>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
