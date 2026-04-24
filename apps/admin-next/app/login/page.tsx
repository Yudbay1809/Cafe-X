'use client';

import { adminApi } from '@/lib/api';
import { saveSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, lang, setLang } = useI18n();

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const r = await adminApi.login({ username, password, device_name: 'admin-web' });
      if (!r.success) {
        setError(r.message || 'Access Denied');
        return;
      }
      saveSession({ token: r.data.token, username: r.data.user.username, role: r.data.user.role });
      router.push('/');
    } catch (e: any) {
      setError(e.message || 'System error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-6 font-karla relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FEF3C7] rounded-full filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#632C0D] rounded-full filter blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-12 rounded-[56px] border border-[#FDE68A] shadow-2xl relative z-10 space-y-10"
      >
        <div className="flex flex-col items-center text-center space-y-4">
           <div className="w-20 h-20 bg-[#632C0D] rounded-3xl flex items-center justify-center text-white font-black text-2xl font-playfair-display-sc shadow-xl">CX</div>
           <div>
              <h1 className="text-3xl font-black font-playfair-display-sc text-[#451A03] uppercase tracking-tight">Imperial Ops</h1>
              <p className="text-[10px] font-black text-[#8B7355] uppercase tracking-[0.3em] mt-1">Sovereign Management Console</p>
           </div>
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest px-2">Commander ID</label>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="sultan-input text-center" 
                placeholder="Enter Identity..."
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest px-2">Access Key</label>
              <input 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="sultan-input text-center" 
                placeholder="••••••••"
              />
           </div>
        </div>

        <div className="space-y-4">
           <button 
            disabled={loading}
            onClick={submit}
            className="w-full bg-[#632C0D] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#632C0D]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
           >
             {loading ? 'Authenticating...' : 'Enter Sanctuary'}
           </button>
           <button 
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            className="w-full py-3 bg-white border border-[#FDE68A] text-[#8B7355] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FEF3C7] transition-all"
           >
             Protocol: {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
           </button>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center text-[#991B1B] text-[10px] font-black uppercase tracking-widest"
          >
            ⚠️ {error}
          </motion.p>
        )}
      </motion.div>

      {/* Decorative footer */}
      <div className="absolute bottom-10 text-center w-full space-y-1 opacity-40">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#451A03]">Cafe-X Enterprise</p>
         <p className="text-[8px] font-bold text-[#8B7355]">SECURE CLOUD ACCESS • v1.0.0</p>
      </div>
    </main>
  );
}
