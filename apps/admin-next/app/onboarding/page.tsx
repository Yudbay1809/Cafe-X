'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';

const STEPS = ['Profil bisnis', 'Setup meja', 'Produk awal', 'Plan langganan', 'Selesai'] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [outletId, setOutletId] = useState(0);
  const [outletCode, setOutletCode] = useState('MAIN');
  const [outletName, setOutletName] = useState('Cafe-X Main Outlet');
  const [brandName, setBrandName] = useState('Cafe-X');
  const [brandColor, setBrandColor] = useState('#0f6b63');
  const [contactPhone, setContactPhone] = useState('0812-0000-0000');

  const [tableCode, setTableCode] = useState('A1');
  const [tableName, setTableName] = useState('Table A1');

  const [productName, setProductName] = useState('Signature Latte');
  const [productCategory, setProductCategory] = useState('coffee');
  const [productPrice, setProductPrice] = useState(32000);
  const [productStock, setProductStock] = useState(99);

  const [planCode, setPlanCode] = useState<'basic' | 'pro' | 'premium'>('pro');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const outlets = await adminApi.outlets();
        const first = outlets.items?.[0];
        if (first) {
          setOutletId(Number(first.id || 0));
          setOutletCode(String(first.kode || 'MAIN'));
          setOutletName(String(first.nama || 'Cafe-X Main Outlet'));
          setBrandName(String(first.brand_name || 'Cafe-X'));
          setBrandColor(String(first.brand_color || '#0f6b63'));
          setContactPhone(String(first.contact_phone || '0812-0000-0000'));
        }
      } catch (e: any) {
        setError(e.message || 'Gagal memuat data onboarding');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  async function runStepAction() {
    try {
      setSaving(true);
      setError('');
      setMessage('');

      if (step === 0) {
        if (!outletId) throw new Error('Outlet belum tersedia');
        await adminApi.outletUpdateBrand(outletId, {
          nama: outletName,
          kode: outletCode,
          brand_name: brandName,
          brand_color: brandColor,
          contact_phone: contactPhone,
        });
        setMessage('Profil bisnis tersimpan.');
      }

      if (step === 1) {
        await adminApi.upsertTable({ code: tableCode.toUpperCase(), name: tableName, is_active: true });
        setMessage('Meja tersimpan.');
      }

      if (step === 2) {
        await adminApi.productCreate({
          nama: productName,
          kategori: productCategory,
          harga: Number(productPrice),
          stok: Number(productStock),
          aktif: true,
        });
        setMessage('Produk awal tersimpan.');
      }

      if (step === 3) {
        await adminApi.billingUpsertSubscription({ plan_code: planCode, status: 'active' });
        setMessage('Plan langganan aktif.');
      }

      if (step < STEPS.length - 1) {
        setStep((prev) => prev + 1);
      }
    } catch (e: any) {
      setError(e.message || 'Aksi gagal diproses');
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
      <AdminShell title="Onboarding" subtitle="Wizard outlet pertama untuk go-live cepat">
        <div className="card">
          <div className="small">Progress onboarding</div>
          <h2 style={{ marginTop: 6 }}>{progress}%</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 10 }}>
            {STEPS.map((label, i) => (
              <div key={label} className="pill" style={{ background: i <= step ? 'rgba(15,107,99,0.15)' : '#e2e8f0', color: i <= step ? '#0f6b63' : '#334155' }}>
                {i + 1}. {label}
              </div>
            ))}
          </div>
        </div>

        {loading ? <div className="card">Memuat wizard...</div> : null}

        {!loading && step === 0 ? (
          <div className="card grid2">
            <div>
              <div className="small">Nama outlet</div>
              <input value={outletName} onChange={(e) => setOutletName(e.target.value)} />
            </div>
            <div>
              <div className="small">Kode outlet</div>
              <input value={outletCode} onChange={(e) => setOutletCode(e.target.value.toUpperCase())} />
            </div>
            <div>
              <div className="small">Nama brand</div>
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
            </div>
            <div>
              <div className="small">Warna brand</div>
              <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
            </div>
            <div>
              <div className="small">Kontak outlet</div>
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>
        ) : null}

        {!loading && step === 1 ? (
          <div className="card grid2">
            <div>
              <div className="small">Kode meja</div>
              <input value={tableCode} onChange={(e) => setTableCode(e.target.value)} />
            </div>
            <div>
              <div className="small">Nama meja</div>
              <input value={tableName} onChange={(e) => setTableName(e.target.value)} />
            </div>
          </div>
        ) : null}

        {!loading && step === 2 ? (
          <div className="card grid2">
            <div>
              <div className="small">Nama produk</div>
              <input value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div>
              <div className="small">Kategori</div>
              <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                <option value="coffee">Coffee</option>
                <option value="non coffee">Non Coffee</option>
                <option value="main course">Main Course</option>
                <option value="appetizer">Appetizer</option>
              </select>
            </div>
            <div>
              <div className="small">Harga</div>
              <input type="number" value={productPrice} onChange={(e) => setProductPrice(Number(e.target.value))} />
            </div>
            <div>
              <div className="small">Stok</div>
              <input type="number" value={productStock} onChange={(e) => setProductStock(Number(e.target.value))} />
            </div>
          </div>
        ) : null}

        {!loading && step === 3 ? (
          <div className="card">
            <div className="small">Pilih plan untuk aktivasi tenant</div>
            <div className="toolbar" style={{ marginTop: 10 }}>
              {['basic', 'pro', 'premium'].map((code) => (
                <button
                  key={code}
                  className={planCode === code ? 'btn' : 'btn outline'}
                  onClick={() => setPlanCode(code as 'basic' | 'pro' | 'premium')}
                  type="button"
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!loading && step === 4 ? (
          <div className="card">
            <h3>Onboarding selesai</h3>
            <p className="small">Outlet siap dipakai untuk demo dan pilot. Lanjutkan ke halaman Subscription untuk kelola invoice.</p>
          </div>
        ) : null}

        {message ? <div className="card" style={{ borderColor: 'rgba(16,185,129,0.45)' }}>{message}</div> : null}
        {error ? <div className="card" style={{ borderColor: 'rgba(239,68,68,0.45)' }}>{error}</div> : null}

        <div className="toolbar">
          <button className="btn outline" disabled={step === 0 || saving} onClick={() => setStep((prev) => Math.max(0, prev - 1))}>
            Sebelumnya
          </button>
          <button className="btn" disabled={saving || loading} onClick={runStepAction}>
            {saving ? 'Menyimpan...' : step === STEPS.length - 1 ? 'Selesai' : 'Simpan & lanjut'}
          </button>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
