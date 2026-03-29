'use client';

import { ApiError, API_ORIGIN, customerApi } from '@/lib/api';
import { addToCart, getCart } from '@/lib/cart';
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
  const cartKey = tableToken || 'public';
  const [products, setProducts] = useState<Product[]>([]);
  const [table, setTable] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offlineNotice, setOfflineNotice] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartPreview, setCartPreview] = useState<Array<{ name: string; qty: number }>>([]);
  const [animateCount, setAnimateCount] = useState(false);
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
            const currentSession = getSession();
            setSession({ ...(currentSession || { tableToken: '' }), tableToken, table: r.data.table });
            if (r.data.table?.is_active === false) {
              setError('Meja tidak aktif');
            }
          } else {
            setTable(null);
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
            router.replace('/?error=token');
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

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    products.forEach((p) => set.add(p.jenis_menu));
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return products.filter((p) => {
      const matchQ = p.nama_menu.toLowerCase().includes(k);
      const matchCat = category === 'All' || p.jenis_menu === category;
      return matchQ && matchCat;
    });
  }, [products, q, category]);

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

  const lastOrderToken = session?.tableToken || tableToken;

  return (
    <main>
      <div className="sticky-header">
        <div className="header-card">
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Menu Meja</div>
            <div className="small">
              {table ? `Meja: ${table.table_name} (${table.table_code})` : 'Mode: tanpa meja'}
            </div>
          </div>
          <div className="toolbar">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari menu" />
            <button className="secondary" onClick={() => router.push(`/cart?tableToken=${encodeURIComponent(tableToken)}`)}>
              Lihat Cart
              {cartCount > 0 ? <span className={`cart-badge ${animateCount ? 'pulse' : ''}`}>{cartCount}</span> : null}
            </button>
          </div>
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
          {session?.lastOrderId && lastOrderToken ? (
            <div style={{ width: '100%' }}>
              <button
                className="ghost"
                onClick={() =>
                  router.push(`/order-status?tableToken=${encodeURIComponent(lastOrderToken)}&orderId=${session.lastOrderId}`)
                }
              >
                Lihat Order Terakhir #{session.lastOrderId}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {loading ? <div className="card">Loading menu...</div> : null}
      {offlineNotice ? <div className="card">{offlineNotice}</div> : null}
      {error ? <div className="card">{error}</div> : null}
      {grouped.map(([cat, items]) => (
        <section key={cat} className="category-section">
          <div className="category-title">{formatCategory(cat)}</div>
          <div className="grid">
            {items.map((p) => (
              <div className="card menu-card" key={p.id_menu}>
                <div className="menu-image">
                  {p.gambar ? <img src={imageUrl(p.gambar)} alt={p.nama_menu} loading="lazy" /> : null}
                </div>
                <div className="menu-meta">
                  <h3>{p.nama_menu}</h3>
                  <p className="small">{formatRupiah(Number(p.harga))}</p>
                  <div className="toolbar">
                    <span className="pill">{p.jenis_menu}</span>
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
