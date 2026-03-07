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
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CX</div>
          <div>
            <div className="brand-title">{t('appName')}</div>
            <div className="brand-sub">{t('opsConsole')}</div>
          </div>
        </div>
        <AdminNav />
        <div className="sidebar-meta">
          <div className="meta-row">
            <span className="meta-label">{t('user')}</span>
            <span className="meta-value">{session?.username || '-'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">{t('role')}</span>
            <span className="meta-value">{session?.role || '-'}</span>
          </div>
          <button
            className="btn outline full"
            onClick={() => {
              clearSession();
              router.push('/login');
            }}
          >
            {t('logout')}
          </button>
        </div>
      </aside>
      <section className="content">
        <header className="appbar">
          <div>
            <div className="title">{title}</div>
            {subtitle ? <div className="subtitle">{subtitle}</div> : null}
          </div>
          <div className="appbar-actions">
            {actions}
            <button
              className="btn outline"
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            >
              {lang === 'id' ? 'EN' : 'ID'}
            </button>
            <div className="pill success">{t('api')}: 9000</div>
          </div>
        </header>
        <div className="content-inner">{children}</div>
      </section>
    </div>
  );
}
