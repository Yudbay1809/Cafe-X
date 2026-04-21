'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      const res = await adminApi.suppliers();
      setSuppliers(res.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData);
    
    try {
      if (editingSupplier) {
        await adminApi.supplierUpdate(editingSupplier.id, body);
      } else {
        await adminApi.supplierCreate(body);
      }
      setShowModal(false);
      setEditingSupplier(null);
      loadSuppliers();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal menyimpan');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus supplier ini?')) return;
    try {
      await adminApi.supplierDelete(id);
      loadSuppliers();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal menghapus');
    }
  }

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Direktori Supplier</h1>
          <p className="text-muted-foreground">Kelola daftar vendor dan pemasok bahan baku.</p>
        </div>
        <button 
          onClick={() => { setEditingSupplier(null); setShowModal(true); }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90"
        >
          + Tambah Supplier
        </button>
      </header>

      {loading ? (
        <div className="bg-white p-8 border rounded-xl text-center">Loading suppliers...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b text-xs uppercase font-semibold text-slate-500">
                <th className="px-6 py-4">Nama Supplier</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Term Pembayaran</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-bold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.address || 'Tanpa alamat'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{s.contact_person || '-'}</div>
                    <div className="text-xs text-muted-foreground">{s.phone}</div>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-mono">{s.payment_term}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.is_active ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => { setEditingSupplier(s); setShowModal(true); }}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:underline text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Belum ada data supplier.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <header className="p-6 border-b">
              <h2 className="text-xl font-bold">{editingSupplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}</h2>
            </header>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Nama Perusahaan*</label>
                <input name="name" defaultValue={editingSupplier?.name} required className="w-full border rounded-lg px-3 py-2" placeholder="PT. Bahan Baku" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold">HP/WA</label>
                  <input name="phone" defaultValue={editingSupplier?.phone} className="w-full border rounded-lg px-3 py-2" placeholder="0812..." />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Payment Term</label>
                  <select name="payment_term" defaultValue={editingSupplier?.payment_term || 'cash'} className="w-full border rounded-lg px-3 py-2">
                    <option value="cash">CASH</option>
                    <option value="net7">NET 7</option>
                    <option value="net14">NET 14</option>
                    <option value="net30">NET 30</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Alamat</label>
                <textarea name="address" defaultValue={editingSupplier?.address} className="w-full border rounded-lg px-3 py-2" rows={2}></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium">Batal</button>
                <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
