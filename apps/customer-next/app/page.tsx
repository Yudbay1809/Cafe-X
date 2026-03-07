'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { OfflineBanner } from '@/components/OfflineBanner';
import { getSession, setSession } from '@/lib/session';
import { ApiError, customerApi } from '@/lib/api';

export default function Page() {
  const [tableToken, setTableToken] = useState('');
  const [tableCode, setTableCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const router = useRouter();
  const search = useSearchParams();
  const error = search.get('error');
  const existing = getSession();

  const scannedToken = search.get('tableToken') || '';

  const tableCodePattern = /^[A-Z]{1,2}\d{1,3}$/;

  async function handleByCode() {
    const code = tableCode.trim().toUpperCase();
    if (!code) return;
    if (!tableCodePattern.test(code)) {
      setLookupError('Format nomor meja harus seperti A1 atau B12');
      return;
    }
    setLoading(true);
    setLookupError('');
    try {
      const res = await customerApi.tableTokenByCode(code);
      setSession({ tableToken: res.data.table_token, table: res.data.table });
      router.push(`/menu?tableToken=${encodeURIComponent(res.data.table_token)}`);
    } catch (e) {
      if (e instanceof ApiError) {
        setLookupError(e.message);
      } else {
        setLookupError('Gagal cari meja');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <OfflineBanner />
      <div className="card">
        <div className="hero">
          <h1>Pesan dari Meja</h1>
          <p className="small">Masukkan nomor meja untuk lihat menu.</p>
        </div>
        {error === 'token' ? (
          <p className="small" style={{ marginTop: 12 }}>
            Token meja tidak valid atau sudah berubah. Silakan scan ulang QR di meja.
          </p>
        ) : null}
        <input
          value={tableCode}
          onChange={(e) => setTableCode(e.target.value.toUpperCase())}
          placeholder="No meja (contoh: A1)"
        />
        {lookupError ? (
          <p className="small" style={{ marginTop: 8 }}>
            {lookupError}
          </p>
        ) : null}
        <div style={{ marginTop: 12 }}>
          <button className="secondary" disabled={loading} onClick={handleByCode}>
            {loading ? 'Mencari...' : 'Cari Meja'}
          </button>
        </div>
        {scannedToken ? (
          <div style={{ marginTop: 12 }}>
            <button
              className="ghost"
              onClick={() => router.push(`/menu?tableToken=${encodeURIComponent(scannedToken)}`)}
            >
              Lanjutkan dari QR
            </button>
          </div>
        ) : null}
        {existing?.tableToken ? (
          <div style={{ marginTop: 12 }}>
            <button
              className="secondary"
              onClick={() => {
                setSession(existing);
                router.push(`/menu?tableToken=${encodeURIComponent(existing.tableToken)}`);
              }}
            >
              Lanjutkan Meja Sebelumnya
            </button>
            {existing.lastOrderId ? (
              <div style={{ marginTop: 8 }}>
                <button
                  className="ghost"
                  onClick={() =>
                    router.push(
                      `/order-status?tableToken=${encodeURIComponent(existing.tableToken)}&orderId=${existing.lastOrderId}`,
                    )
                  }
                >
                  Lihat Order Terakhir #{existing.lastOrderId}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
