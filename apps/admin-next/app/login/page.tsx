'use client';

import { adminApi } from '@/lib/api';
import { saveSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const router = useRouter();
  const { t, lang, setLang } = useI18n();

  async function submit() {
    setError('');
    const r = await adminApi.login({ username, password, device_name: 'admin-web' });
    if (!r.ok) {
      setError(r.message || 'Login gagal');
      return;
    }
    saveSession({ token: r.data.token, username: r.data.user.username, role: r.data.user.role });
    router.push('/');
  }

  return (
    <main className="login-shell">
      <div className="card login-card">
        <div className="brand">
          <div className="brand-mark">CX</div>
          <div>
            <div className="brand-title">{t('appName')}</div>
            <div className="brand-sub">{t('opsConsole')}</div>
          </div>
        </div>
        <h1>{t('loginAdmin')}</h1>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('username')} />
        <div style={{ height: 8 }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} type="password" />
        <div style={{ height: 12 }} />
        <button className="btn full" onClick={submit}>{t('login')}</button>
        <button className="btn outline" onClick={() => setLang(lang === 'id' ? 'en' : 'id')}>
          {lang === 'id' ? 'EN' : 'ID'}
        </button>
        {error ? <p className="small">{error}</p> : null}
      </div>
    </main>
  );
}
