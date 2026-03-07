'use client';

export function OfflineBanner() {
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (online) return null;
  return <div style={{ background: '#fef3c7', padding: 10 }}>Koneksi internet terputus. Coba lagi saat online.</div>;
}
