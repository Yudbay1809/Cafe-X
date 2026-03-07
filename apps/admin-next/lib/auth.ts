export type AuthSession = {
  token: string;
  username: string;
  role: string;
};

const KEY = 'cafex_admin_session';

export function saveSession(v: AuthSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(v));
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
