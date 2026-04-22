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
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen bg-sultan-bg-warm font-karla">
      {/* Sidebar - Exact 256px from Pencil */}
      <aside className="w-64 bg-sultan-primary text-white flex flex-col p-10 flex-shrink-0 overflow-y-auto">
        <div className="flex flex-col gap-1 mb-8 pb-8">
          <div className="text-[26px] font-black font-playfair-display-sc text-sultan-cta leading-none uppercase">CAFE·X</div>
          <div className="text-[10px] font-medium text-[#D97706] uppercase tracking-[0.2em]">Enterprise HQ</div>
        </div>

        <AdminNav />

        <div className="mt-auto pt-8 border-t border-white/10 space-y-4">
          <div className="flex justify-between items-center text-[11px] font-bold text-[#D97706] uppercase">
            <span>{session?.username || '-'}</span>
            <span className="text-white/40">{session?.role || '-'}</span>
          </div>
          <button
            className="w-full py-3 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
            onClick={() => {
              clearSession();
              router.push('/login');
            }}
          >
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area - Exact 40px Padding */}
      <section className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-[28px] font-black text-sultan-text font-playfair-display-sc tracking-tight">{title}</h1>
            {subtitle ? <p className="text-sultan-text-muted text-[15px] mt-1">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-5">
            {actions}
            <div className="w-10 h-10 rounded-full bg-white border border-sultan-border flex items-center justify-center text-sultan-text shadow-sultan-soft font-bold cursor-pointer hover:bg-sultan-bg-warm transition-all">
               {session?.username?.[0] || 'A'}
            </div>
          </div>
        </header>
        
        <main id="main-content" className="space-y-8">
           {children}
        </main>
      </section>
    </div>
  );
}
