'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [outlet, setOutlet] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      // For now, settings are tied to the main outlet
      const res = await adminApi.outlets();
      if (res.items.length > 0) {
        setOutlet(res.items[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData);

    try {
      // In a real app, we'd have a specific settings API
      // Here we update the outlet info which acts as main settings
      await fetch(`http://127.0.0.1:9000/api/v1/outlets/${outlet.id}`, {
          method: 'PUT',
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${JSON.parse(localStorage.getItem('cafe_admin_session')!).token}`
          },
          body: JSON.stringify(body)
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert('Gagal menyimpan pengaturan');
    }
  }

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Pengaturan Sistem</h1>
        <p className="text-muted-foreground">Konfigurasi outlet, identitas bisnis, dan preferensi operasional.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-1">
           <button className="w-full text-left px-4 py-2 bg-slate-100 rounded-lg font-semibold text-primary">Informasi Outlet</button>
           <button className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-500">Notifikasi & Laporan</button>
           <button className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-500">Integrasi Pembayaran</button>
           <button className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg text-slate-500">Keamanan & Akses</button>
        </aside>

        <main className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
            <h2 className="text-xl font-bold border-b pb-4">Profil Bisnis</h2>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-semibold">Nama Outlet</label>
                    <input name="name" defaultValue={outlet?.name} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold">Kode Outlet</label>
                    <input name="code" defaultValue={outlet?.code} readOnly className="w-full border rounded-lg px-3 py-2 bg-slate-50 text-slate-400 cursor-not-allowed" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-semibold">Alamat Lengkap</label>
                <textarea name="address" defaultValue={outlet?.address} className="w-full border rounded-lg px-3 py-2" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-semibold">Owner WhatsApp (Untuk Laporan)</label>
                    <input name="phone" defaultValue={outlet?.phone} placeholder="62812..." className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold">Brand Name</label>
                    <input name="brand_name" defaultValue={outlet?.brand_name} className="w-full border rounded-lg px-3 py-2" />
                </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
                {success && <span className="text-green-600 text-sm font-bold flex items-center gap-1">✅ Pengaturan berhasil disimpan!</span>}
                <button type="submit" className="bg-primary text-primary-foreground px-8 py-2 rounded-lg font-bold hover:opacity-90 ml-auto">
                    Simpan Perubahan
                </button>
            </div>
          </form>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
             <h3 className="font-bold text-slate-700 mb-2">Informasi Lisensi</h3>
             <p className="text-sm text-slate-500">Cafe-X Enterprise Edition v1.0.0 (Status: Aktif)</p>
             <div className="mt-4 flex gap-2">
                <button className="text-xs font-bold text-blue-600 hover:underline">Check for Updates</button>
                <span className="text-slate-300">|</span>
                <button className="text-xs font-bold text-blue-600 hover:underline">Download Database Backup</button>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
