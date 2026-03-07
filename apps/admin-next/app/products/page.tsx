'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { formatRupiah } from '@/lib/money';
import { useI18n } from '@/components/I18nProvider';

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
      setItems(r.items);
    } catch (e: any) {
      setError(e.message || 'Gagal load products');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categories = Array.from(new Set(items.map((i) => i.jenis_menu).filter(Boolean)));
  const filtered = items.filter((i) => {
    const inCategory = category === 'all' || i.jenis_menu === category;
    const inQuery = !query || String(i.nama_menu || '').toLowerCase().includes(query.toLowerCase());
    return inCategory && inQuery;
  });

  return (
    <RequireAuth>
      <AdminShell
        title={t('products')}
        subtitle={t('productsSubtitle')}
        actions={<button className="btn" onClick={() => { setEditingId(null); setForm({ nama_menu: '', jenis_menu: '', stok: 0, harga: 0, gambar: '', is_active: true }); }}>{t('newProduct')}</button>}
      >
        <div className="card">
          <div className="toolbar">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchProduct')}
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">{t('allCategories')}</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button className="btn outline" onClick={() => { setQuery(''); setCategory('all'); }}>{t('reset')}</button>
            <button className="btn" onClick={load}>{t('search')}</button>
          </div>
        </div>
        <div className="card">
          <h3>{editingId ? `${t('editProduct')} #${editingId}` : t('addProduct')}</h3>
          <div className="grid3">
            <input
              value={form.nama_menu}
              onChange={(e) => setForm({ ...form, nama_menu: e.target.value })}
              placeholder={t('name')}
            />
            <input
              value={form.jenis_menu}
              onChange={(e) => setForm({ ...form, jenis_menu: e.target.value })}
              placeholder={t('category')}
            />
            <input
              type="number"
              value={form.harga}
              onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })}
              placeholder={t('price')}
            />
            <input
              type="number"
              value={form.stok}
              onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })}
              placeholder={t('stock')}
            />
            <input
              value={form.gambar}
              onChange={(e) => setForm({ ...form, gambar: e.target.value })}
              placeholder={t('imageUrlOptional')}
            />
            <label className="small">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                style={{ width: 16, height: 16, marginRight: 8 }}
              />
              {t('active')}
            </label>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              className="btn"
              onClick={async () => {
                setError('');
                if (!form.nama_menu || !form.harga) {
                  setError('Nama menu dan harga wajib diisi');
                  return;
                }
                if (editingId) {
                  await adminApi.productUpdate(editingId, form);
                } else {
                  await adminApi.productCreate(form);
                }
                setEditingId(null);
                setForm({ nama_menu: '', jenis_menu: '', stok: 0, harga: 0, gambar: '', is_active: true });
                await load();
              }}
            >
              {editingId ? t('update') : t('create')}
            </button>
            {editingId ? (
              <button className="btn outline" onClick={() => { setEditingId(null); setForm({ nama_menu: '', jenis_menu: '', stok: 0, harga: 0, gambar: '', is_active: true }); }}>
                {t('cancel')}
              </button>
            ) : null}
          </div>
          {error ? <div className="small" style={{ marginTop: 8 }}>{error}</div> : null}
        </div>
        {error ? <div className="card">{error}</div> : null}
        <div className="list-cards">
          {filtered.map((i) => (
            <div className="card product-card" key={i.id_menu}>
              <h3>{i.nama_menu}</h3>
              <div className="product-meta">
                <span className="pill">{i.jenis_menu || 'Uncategorized'}</span>
                <span className={i.stok <= 5 ? 'pill warning' : 'pill success'}>
                  Stok {i.stok}
                </span>
              </div>
              <div style={{ marginTop: 10, fontSize: 18, fontWeight: 600 }}>
                {formatRupiah(i.harga || 0)}
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn ghost"
                    onClick={() => {
                      setEditingId(i.id_menu);
                      setForm({
                        nama_menu: i.nama_menu || '',
                        jenis_menu: i.jenis_menu || '',
                        stok: Number(i.stok || 0),
                        harga: Number(i.harga || 0),
                        gambar: i.gambar || '',
                        is_active: Boolean(i.is_active),
                      });
                    }}
                  >
                    {t('editProduct')}
                  </button>
                  <button
                    className="btn outline"
                    onClick={async () => {
                      await adminApi.productDelete(i.id_menu);
                      await load();
                    }}
                  >
                    {t('deactivate')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
