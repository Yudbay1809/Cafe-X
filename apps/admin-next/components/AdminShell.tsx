'use client';

import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/AdminNav';
import { clearSession, getSession } from '@/lib/auth';
import { useI18n } from '@/components/I18nProvider';

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
  const { t, lang, setLang } = useI18n();

  return (
    <div className="flex min-h-screen bg-[#FEF3C7]/20 font-karla">
      {/* Sultan Sidebar */}
      <aside className="w-80 bg-white border-r border-[#FDE68A] p-8 flex flex-col gap-10 shadow-sultan overflow-y-auto">
        <div className="flex items-center gap-4 p-2">
          <div className="w-14 h-14 bg-[#78350F] rounded-2xl flex items-center justify-center text-2xl shadow-xl">
             <span className="text-[#FBBF24] font-black font-playfair-display-sc">CX</span>
          </div>
          <div>
            <div className="text-xl font-black text-[#451A03] font-playfair-display-sc uppercase tracking-tight">{t('appName')}</div>
            <div className="text-[10px] font-black text-[#92400E] uppercase tracking-[0.2em]">{t('opsConsole')}</div>
          </div>
        </div>

        <AdminNav />

        <div className="mt-auto bg-[#FEF3C7]/30 p-6 rounded-3xl border border-[#FDE68A] space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-[#92400E] uppercase">{t('user')}</span>
            <span className="text-xs font-bold text-[#451A03]">{session?.username || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-[#92400E] uppercase">{t('role')}</span>
            <span className="text-xs font-bold text-[#451A03]">{session?.role || '-'}</span>
          </div>
          <button
            className="w-full py-3 bg-[#78350F] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#451A03] transition-all"
            onClick={() => {
              clearSession();
              router.push('/login');
            }}
          >
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 p-10 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-[#FDE68A] shadow-sm flex justify-between items-center sticky top-0 z-20 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#451A03] font-playfair-display-sc uppercase tracking-tight">{title}</h1>
            {subtitle ? <p className="text-[#92400E] font-medium mt-1">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-6">
            {actions}
            <button
              className="px-4 py-2 bg-[#FEF3C7] text-[#78350F] rounded-xl font-black text-xs border border-[#FDE68A] hover:bg-[#FDE68A] transition-all"
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            >
              {lang === 'id' ? 'EN' : 'ID'}
            </button>
            <div className="px-4 py-1.5 bg-[#DCFCE7] text-[#166534] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#166534]/20">
               {t('api')}: Online
            </div>
          </div>
        </header>
        
        <main id="main-content" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           {children}
        </main>
      </section>
    </div>
  );
}
