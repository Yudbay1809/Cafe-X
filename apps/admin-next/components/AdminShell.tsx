'use client';

import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/AdminNav';
import { clearSession, getSession } from '@/lib/auth';
import { useI18n } from '@/components/I18nProvider';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = getSession();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    clearSession();
    router.push('/login');
  };

  const UserProfile = () => (
    <div className="mt-auto pt-10 border-t border-white/10 space-y-6">
      <div className="flex justify-between items-center px-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-sultan-cta uppercase tracking-[0.2em]">{session?.role || 'ADMIN'}</p>
          <p className="text-xs font-black text-white uppercase tracking-widest">{session?.username || 'ADMIN'}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/5">
          👤
        </div>
      </div>
      <button
        className="w-full py-4 bg-[#451A03] text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#2D1102] transition-all border border-[#78350F] shadow-xl"
        onClick={logout}
      >
        {t('logout')}
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-sultan-bg-warm font-karla">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-sultan-primary text-white flex-col p-10 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col gap-1 mb-8 pb-8 border-b border-white/5">
          <div className="text-[26px] font-black font-playfair-display-sc text-sultan-cta leading-none uppercase tracking-tighter">CAFE·X</div>
          <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Enterprise HQ</div>
        </div>

        <AdminNav />
        <UserProfile />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-sultan-primary text-white z-[101] p-10 flex flex-col lg:hidden shadow-2xl"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="flex flex-col gap-1">
                  <div className="text-2xl font-black font-playfair-display-sc text-sultan-cta leading-none uppercase tracking-tighter">CAFE·X</div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Enterprise HQ</div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white text-xl border border-white/10 shadow-inner">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto -mx-4 px-4 py-2">
                <AdminNav />
              </div>

              <UserProfile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <section className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-sultan-bg-warm/80 backdrop-blur-md px-6 py-5 lg:px-12 lg:py-10 flex justify-between items-center border-b border-sultan-border">
          <div className="flex items-center gap-6">
             <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-12 h-12 flex items-center justify-center bg-white border border-sultan-border rounded-2xl text-sultan-text shadow-sultan-soft hover:scale-105 active:scale-95 transition-all"
             >
                <span className="text-2xl">☰</span>
             </button>
             <div>
               <h1 className="text-xl lg:text-3xl font-black text-sultan-text font-playfair-display-sc tracking-tight leading-none uppercase">{title}</h1>
               {subtitle ? <p className="hidden md:block text-sultan-text-muted text-[11px] lg:text-[13px] mt-2 font-bold uppercase tracking-widest opacity-60">{subtitle}</p> : null}
             </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden sm:flex">{actions}</div>
            <div className="w-12 h-12 rounded-[18px] bg-white border border-sultan-border flex items-center justify-center text-sultan-text shadow-sultan-soft font-black cursor-pointer hover:bg-sultan-bg-accent transition-all hover:scale-110 active:scale-90">
               {session?.username?.[0] || 'A'}
            </div>
          </div>
        </header>
        
        <main id="main-content" className="p-6 lg:p-12 space-y-8 lg:space-y-12 overflow-x-hidden">
           {children}
        </main>
      </section>
    </div>
  );
}
