'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { formatRupiah } from '@/lib/money';
import { useI18n } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nama_menu: '',
    jenis_menu: '',
    stok: 0,
    harga: 0,
    gambar: '',
    is_active: true,
  });
  const { t } = useI18n();

  async function load() {
    try {
      const r = await adminApi.productsList({
        q: query || undefined,
        category: category === 'all' ? undefined : category,
      });
      setItems(r.items || []);
    } catch (e: any) {
      setError(e.message || 'Gagal load products');
    }
  }

  useEffect(() => { load(); }, []);

  const categories = Array.from(new Set(items.map((i) => i.jenis_menu).filter(Boolean)));
  const filtered = items.filter((i) => {
    const inCategory = category === 'all' || i.jenis_menu === category;
    const inQuery = !query || String(i.nama_menu || '').toLowerCase().includes(query.toLowerCase());
    return inCategory && inQuery;
  });

  return (
    <RequireAuth>
      <AdminShell title="Master Menu" subtitle="Manage your premium catalog and inventory levels.">
        <div className="space-y-10">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative w-full md:w-96">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#8B7355]">🔍</span>
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search products..." 
                className="w-full bg-white border border-[#FDE68A] rounded-full py-4 pl-14 pr-6 text-sm font-bold text-[#451A03] focus:border-[#632C0D] outline-none"
              />
            </div>
            <button 
              onClick={() => { setEditingId(null); setForm({ nama_menu: '', jenis_menu: '', stok: 0, harga: 0, gambar: '', is_active: true }); }}
              className="bg-[#632C0D] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
            >
              + New Product
            </button>
          </div>

          {/* Form Section */}
          <AnimatePresence>
            {(editingId !== null || form.nama_menu === '') && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[40px] border border-[#FDE68A] shadow-soft space-y-8"
              >
                <h3 className="text-2xl font-black font-playfair-display-sc text-[#451A03] tracking-tight uppercase">
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input value={form.nama_menu} onChange={(e) => setForm({ ...form, nama_menu: e.target.value })} placeholder="Product Name" className="sultan-input" />
                  <input value={form.jenis_menu} onChange={(e) => setForm({ ...form, jenis_menu: e.target.value })} placeholder="Category" className="sultan-input" />
                  <input type="number" value={form.harga} onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })} placeholder="Price (Rp)" className="sultan-input" />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={async () => {
                      if (editingId) await adminApi.productUpdate(editingId, form);
                      else await adminApi.productCreate(form);
                      setEditingId(null);
                      await load();
                    }}
                    className="bg-[#632C0D] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]"
                  >
                    Save Changes
                  </button>
                  <button onClick={() => setEditingId(null)} className="bg-[#FEF3C7] text-[#632C0D] px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((i) => (
              <motion.div 
                key={i.id_menu}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[40px] overflow-hidden border border-[#FDE68A] shadow-soft group"
              >
                <div className="h-48 bg-[#FEF3C7] relative overflow-hidden">
                  <img src={i.gambar || 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f'} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#451A03]">
                    Stok: {i.stok}
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <span className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">{i.jenis_menu}</span>
                  <h4 className="text-xl font-black font-playfair-display-sc text-[#451A03] leading-tight">{i.nama_menu}</h4>
                  <div className="flex justify-between items-center pt-4 border-t border-[#FDE68A]">
                    <span className="text-lg font-black text-[#632C0D]">{formatRupiah(i.harga)}</span>
                    <button 
                      onClick={() => { setEditingId(i.id_menu); setForm(i); }}
                      className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center text-[#632C0D] hover:bg-[#632C0D] hover:text-white transition-all"
                    >
                      ✎
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
