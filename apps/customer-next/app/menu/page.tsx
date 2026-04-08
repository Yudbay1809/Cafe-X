'use client';

import { ApiError, API_ORIGIN, customerApi } from '@/lib/api';
import { addToCart, getCart } from '@/lib/cart';
import { getFavorites, toggleFavorite } from '@/lib/favorites';
import type { Product } from '@/lib/types';
import type { TableInfo } from '@/lib/types';
import { getSession, setSession, clearSession } from '@/lib/session';
import { getMenuCache, setMenuCache } from '@/lib/menu_cache';
import { formatRupiah } from '@/lib/money';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function MenuPage() {
  const search = useSearchParams();
  const tableToken = search.get('tableToken') || '';
  const errorParam = search.get('error') || '';
  const cartKey = tableToken || 'public';
  const [products, setProducts] = useState<Product[]>([]);
  const [table, setTable] = useState<TableInfo | null>(null);
  const [tableCode, setTableCode] = useState('');
  const [tableLookupError, setTableLookupError] = useState('');
  const [tableLoading, setTableLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offlineNotice, setOfflineNotice] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartPreview, setCartPreview] = useState<Array<{ name: string; qty: number }>>([]);
  const [animateCount, setAnimateCount] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [voucher, setVoucher] = useState('');
  const [voucherMsg, setVoucherMsg] = useState('');
  const router = useRouter();
  const session = getSession();

  useEffect(() => {
    const load = () => {
      const request = tableToken ? customerApi.menu(tableToken) : customerApi.publicMenu();
      request
        .then((r: any) => {
          setProducts(r.data.products || []);
          if (tableToken) {
            setTable(r.data.table);
            setTableCode(r.data.table?.table_code || '');
            const currentSession = getSession();
            setSession({ ...(currentSession || { tableToken: '' }), tableToken, table: r.data.table });
            if (r.data.table?.is_active === false) {
              setError('Meja tidak aktif');
            }
          } else {
            setTable(null);
            setTableCode('');
          }
          setMenuCache({
            tableToken: cartKey,
            table: tableToken ? r.data.table : null,
            products: r.data.products || [],
            cachedAt: new Date().toISOString(),
          });
        })
        .catch((e) => {
          if (tableToken && e instanceof ApiError && (e.status === 404 || e.status === 410)) {
            clearSession();
            router.replace('/menu?error=token');
            return;
          }
          const cache = getMenuCache(cartKey);
          if (cache) {
            setProducts(cache.products);
            setTable(cache.table || null);
            setOfflineNotice(`Menampilkan menu cache (${cache.cachedAt}).`);
            return;
          }
          setError(e.message || 'Gagal memuat menu');
          if (tableToken) clearSession();
        })
        .finally(() => setLoading(false));
    };
    load();
    const onOnline = () => {
      setOfflineNotice('');
      setLoading(true);
      load();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [tableToken]);

  useEffect(() => {
    const cart = getCart(cartKey);
    setCartCount(cart.reduce((a, b) => a + b.qty, 0));
    setCartTotal(cart.reduce((a, b) => a + b.qty * b.price, 0));
    setCartPreview(cart.slice(0, 3).map((x) => ({ name: x.name, qty: x.qty })));
  }, [cartKey, products]);

  useEffect(() => {
    setFavoriteIds(getFavorites());
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    if (favoriteIds.length > 0) set.add('Favorites');
    products.forEach((p) => set.add(p.jenis_menu));
    return Array.from(set);
  }, [products, favoriteIds]);

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return products.filter((p) => {
      const matchQ = p.nama_menu.toLowerCase().includes(k);
      const isFav = favoriteIds.includes(p.id_menu);
      const matchCat = category === 'All'
        || (category === 'Favorites' ? isFav : p.jenis_menu === category);
      return matchQ && matchCat;
    });
  }, [products, q, category, favoriteIds]);

  const quickAdd = useMemo(() => products.slice(0, 6), [products]);

  function formatCategory(label: string) {
    return label
      .split(' ')
      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
      .join(' ');
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    filtered.forEach((p) => {
      const key = p.jenis_menu || 'Lainnya';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries());
  }, [filtered]);

  function imageUrl(path?: string) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${API_ORIGIN}${path}`;
    return `${API_ORIGIN}/${path}`;
  }

  function handleAddToCart(p: Product) {
    addToCart(cartKey, { product_id: p.id_menu, name: p.nama_menu, price: Number(p.harga), qty: 1 });
    const cart = getCart(cartKey);
    setCartCount(cart.reduce((a, b) => a + b.qty, 0));
    setCartTotal(cart.reduce((a, b) => a + b.qty * b.price, 0));
    setCartPreview(cart.slice(0, 3).map((x) => ({ name: x.name, qty: x.qty })));
    setAnimateCount(true);
    setTimeout(() => setAnimateCount(false), 350);
  }

  function handleReorder() {
    if (!session?.lastOrderItems || session.lastOrderItems.length === 0) return;
    session.lastOrderItems.forEach((item) => addToCart(cartKey, item));
    const cart = getCart(cartKey);
    setCartCount(cart.reduce((a, b) => a + b.qty, 0));
    setCartTotal(cart.reduce((a, b) => a + b.qty * b.price, 0));
    setCartPreview(cart.slice(0, 3).map((x) => ({ name: x.name, qty: x.qty })));
    router.push(`/cart?tableToken=${encodeURIComponent(tableToken)}`);
  }

  const tableCodePattern = /^[A-Z]{1,2}\\d{1,3}$/;

  async function handleSetTable() {
    const code = tableCode.trim().toUpperCase();
    setTableLookupError('');
    if (!code) {
      setTableLookupError('Masukkan nomor meja terlebih dahulu');
      return;
    }
    if (!tableCodePattern.test(code)) {
      setTableLookupError('Format nomor meja harus seperti A1 atau B12');
      return;
    }
    try {
      setTableLoading(true);
      const r = await customerApi.tableTokenByCode(code);
      router.replace(`/menu?tableToken=${encodeURIComponent(r.data.table_token)}`);
    } catch (e: any) {
      setTableLookupError(e?.message || 'Nomor meja tidak ditemukan');
    } finally {
      setTableLoading(false);
    }
  }

  function handleClearTable() {
    clearSession();
    setTable(null);
    setTableCode('');
    router.replace('/menu');
  }

  const lastOrderToken = session?.tableToken || tableToken;

  return (
    <main>
      <div className="hero">
        <div className="hero-top">
          <div>
            <div className="small">Cafe-X</div>
            <h1 className="hero-title">Menu & Order</h1>
            <div className="hero-sub">
              {table ? `Meja: ${table.table_name} (${table.table_code})` : 'Belum pilih meja'}
            </div>
          </div>
          <div className="toolbar">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari menu" />
            <button className="secondary" onClick={() => router.push(`/cart?tableToken=${encodeURIComponent(tableToken)}`)}>
              Lihat Cart
              {cartCount > 0 ? <span className={`cart-badge ${animateCount ? 'pulse' : ''}`}>{cartCount}</span> : null}
            </button>
          </div>
        </div>
        <div className="panel">
          <div className="toolbar" style={{ width: '100%' }}>
            <input
              value={tableCode}
              onChange={(e) => setTableCode(e.target.value.toUpperCase())}
              placeholder="No meja (contoh: A1)"
              style={{ maxWidth: 220 }}
            />
            <button onClick={handleSetTable} disabled={tableLoading}>
              {tableLoading ? 'Memproses...' : 'Set Meja'}
            </button>
            {table ? (
              <button className="ghost" onClick={handleClearTable}>
                Hapus Meja
              </button>
            ) : null}
            {tableLookupError ? <span className="small">{tableLookupError}</span> : null}
          </div>
        </div>
        <div className="promo-banner">
          <div>Promo Hari Ini: Diskon 10% untuk minuman kopi</div>
          <div className="promo-input">
            <input value={voucher} onChange={(e) => setVoucher(e.target.value)} placeholder="Kode voucher" />
            <button onClick={() => setVoucherMsg(voucher ? `Voucher ${voucher} diterapkan (demo)` : 'Masukkan kode voucher')}>
              Gunakan
            </button>
          </div>
          {voucherMsg ? <div className="small">{voucherMsg}</div> : null}
        </div>
        {session?.lastOrderId && lastOrderToken ? (
          <div style={{ width: '100%', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="ghost"
              onClick={() =>
                router.push(`/order-status?tableToken=${encodeURIComponent(lastOrderToken)}&orderId=${session.lastOrderId}`)
              }
            >
              Lihat Order Terakhir #{session.lastOrderId}
            </button>
            {session?.lastOrderItems?.length ? (
              <button className="secondary" onClick={handleReorder}>Pesan Ulang</button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="sticky-cats">
        <div className="panel">
          <div className="category-chips">
            {categories.map((c) => (
              <button
                key={c}
                className={`chip ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {formatCategory(c)}
              </button>
            ))}
          </div>
          {quickAdd.length > 0 ? (
            <div className="quick-add">
              {quickAdd.map((p) => (
                <button key={p.id_menu} className="quick-item" onClick={() => handleAddToCart(p)}>
                  {p.nama_menu}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {errorParam === 'token' ? <div className="card">Token meja tidak valid atau sudah expired. Silakan masukkan nomor meja.</div> : null}
      {loading ? (
        <div className="grid">
          {[...Array(6)].map((_, i) => (
            <div className="card" key={`sk-${i}`}>
              <div className="loading-bar" />
              <div className="loading-bar short" />
              <div className="loading-bar" />
            </div>
          ))}
        </div>
      ) : null}
      {offlineNotice ? <div className="card">{offlineNotice}</div> : null}
      {error ? <div className="card">{error}</div> : null}
      {!loading && grouped.map(([cat, items]) => (
        <section key={cat} className="category-section">
          <div className="category-title">{formatCategory(cat)}</div>
          <div className="grid">
            {items.map((p) => (
              <div className="card menu-card" key={p.id_menu}>
                <div className="menu-image">
                  {p.gambar ? <img src={imageUrl(p.gambar)} alt={p.nama_menu} loading="lazy" /> : null}
                </div>
                <div className="menu-meta">
                  <h3 className="menu-title">{p.nama_menu}</h3>
                  <div className="menu-price">{formatRupiah(Number(p.harga))}</div>
                  <div className="menu-actions">
                    <span className="pill">{p.jenis_menu}</span>
                    <button
                      className={`fav-btn ${favoriteIds.includes(p.id_menu) ? 'active' : ''}`}
                      onClick={() => setFavoriteIds(toggleFavorite(p.id_menu))}
                      aria-label="favorite"
                    >❤</button>
                    <button disabled={p.stok < 1} onClick={() => handleAddToCart(p)}>
                      Tambah
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      {cartCount > 0 ? (
        <div className="cart-drawer">
          <h4>Cart</h4>
          <div className="cart-item">
            <span>Items</span>
            <span>{cartCount}</span>
          </div>
          <div className="cart-item">
            <span>Total</span>
            <span>{formatRupiah(cartTotal)}</span>
          </div>
          <div className="cart-preview">
            {cartPreview.map((p, i) => (
              <div key={`${p.name}-${i}`} className="cart-preview-item">
                <span>{p.name}</span>
                <span>x{p.qty}</span>
              </div>
            ))}
          </div>
          <div className="toolbar" style={{ marginTop: 8 }}>
            <button onClick={() => router.push(`/cart?tableToken=${encodeURIComponent(tableToken)}`)}>
              Checkout
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
