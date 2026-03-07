'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function OutletsSettingsPage() {
  const { t } = useI18n();
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | null>(null);
  const [brandName, setBrandName] = useState('');
  const [brandColor, setBrandColor] = useState('#0f766e');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const o = await adminApi.outlets();
      setOutlets(o.items || []);
      if (!selectedOutletId && o.items?.length) {
        const first = o.items[0];
        setSelectedOutletId(first.id);
        setBrandName(first.brand_name || '');
        setBrandColor(first.brand_color || '#0f766e');
        setContactPhone(first.contact_phone || '');
      }
    } catch (e: any) {
      setError(e.message || 'Gagal load outlets');
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <RequireAuth>
      <AdminShell title={t('outlets')} subtitle={t('outletBrand')}>
        <div className="card">
          <div className="grid2">
            <select
              value={selectedOutletId ?? ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedOutletId(id);
                const outlet = outlets.find((o) => o.id === id);
                if (outlet) {
                  setBrandName(outlet.brand_name || '');
                  setBrandColor(outlet.brand_color || '#0f766e');
                  setContactPhone(outlet.contact_phone || '');
                }
              }}
            >
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
              ))}
            </select>
            <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder={t('brandName')} />
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder={t('contactPhone')} />
            <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button
              className="btn"
              onClick={async () => {
                if (!selectedOutletId) return;
                await adminApi.outletUpdateBrand(selectedOutletId, {
                  brand_name: brandName,
                  brand_color: brandColor,
                  contact_phone: contactPhone,
                });
                await load();
              }}
            >
              {t('save')}
            </button>
            <button className="btn outline" onClick={load}>{t('refresh')}</button>
          </div>
          {error ? <div className="small" style={{ marginTop: 8 }}>{error}</div> : null}
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
