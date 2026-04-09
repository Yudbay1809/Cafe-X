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

const NAV_ITEMS = [
  { id: 'menu',   icon: '🍽️', label: 'Menu' },
  { id: 'search', icon: '🔍', label: 'Cari' },
  { id: 'order',  icon: '🧾', label: 'Pesanan' },
  { id: 'profile',icon: '👤', label: 'Profil' },
];

export default function MenuPage() {
  const search       = useSearchParams();
  const tableToken   = search.get('tableToken') || '';
  const errorParam   = search.get('error') || '';
  const cartKey      = tableToken || 'public';
  const router       = useRouter();
  const session      = getSession();

  const [products,         setProducts]        = useState<Product[]>([]);
  const [table,            setTable]           = useState<TableInfo | null>(null);
  const [tableCode,        setTableCode]       = useState('');
  const [tableLookupError, setTableLookupError]= useState('');
  const [tableLoading,     setTableLoading]    = useState(false);
  const [loading,          setLoading]         = useState(true);
  const [error,            setError]           = useState('');
  const [offlineNotice,    setOfflineNotice]   = useState('');
  const [q,                setQ]               = useState('');
  const [category,         setCategory]        = useState('All');
  const [cartCount,        setCartCount]       = useState(0);
  const [cartTotal,        setCartTotal]       = useState(0);
  const [animateCount,     setAnimateCount]    = useState(false);
  const [favoriteIds,      setFavoriteIds]     = useState<number[]>([]);
  const [voucher,          setVoucher]         = useState('');
  const [voucherMsg,       setVoucherMsg]      = useState('');
  const [activeNav,        setActiveNav]       = useState('menu');
  const [showTableInput,   setShowTableInput]  = useState(false);

  /* ── Load products ─────────────────────── */
  useEffect(() => {
    const load = () => {
      const req = tableToken ? customerApi.menu(tableToken) : customerApi.publicMenu();
      req.then((r: any) => {
        setProducts(r.data.products || []);
        if (tableToken) {
          setTable(r.data.table);
          setTableCode(r.data.table?.table_code || '');
          const cur = getSession();
          setSession({ ...(cur || { tableToken: '' }), tableToken, table: r.data.table });
          if (r.data.table?.is_active === false) setError('Meja tidak aktif');
        } else {
          setTable(null); setTableCode('');
        }
        setMenuCache({ tableToken: cartKey, table: tableToken ? r.data.table : null, products: r.data.products || [], cachedAt: new Date().toISOString() });
      }).catch((e) => {
        if (tableToken && e instanceof ApiError && (e.status === 404 || e.status === 410)) {
          clearSession(); router.replace('/menu?error=token'); return;
        }
        const cache = getMenuCache(cartKey);
        if (cache) {
          setProducts(cache.products); setTable(cache.table || null);
          setOfflineNotice(`Cache data (${cache.cachedAt})`); return;
        }
        setError(e.message || 'Gagal memuat menu');
        if (tableToken) clearSession();
      }).finally(() => setLoading(false));
    };
    load();
    const onOnline = () => { setOfflineNotice(''); setLoading(true); load(); };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [tableToken]);

  /* ── Sync cart ─────────────────────────── */
  useEffect(() => {
    const cart = getCart(cartKey);
    setCartCount(cart.reduce((a, b) => a + b.qty, 0));
    setCartTotal(cart.reduce((a, b) => a + b.qty * b.price, 0));
  }, [cartKey, products]);

  useEffect(() => { setFavoriteIds(getFavorites()); }, []);

  /* ── Derived data ─────────────────────── */
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
      const isFav  = favoriteIds.includes(p.id_menu);
      const matchCat = category === 'All' || (category === 'Favorites' ? isFav : p.jenis_menu === category);
      return matchQ && matchCat;
    });
  }, [products, q, category, favoriteIds]);

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    filtered.forEach((p) => { const k = p.jenis_menu || 'Lainnya'; if (!map.has(k)) map.set(k, []); map.get(k)!.push(p); });
    return Array.from(map.entries());
  }, [filtered]);

  const featured = useMemo(() => products.slice(0, 8), [products]);

  /* ── Helpers ──────────────────────────── */
  function imageUrl(path?: string) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return `${API_ORIGIN}${path}`;
    return `${API_ORIGIN}/${path}`;
  }

  function fmt(label: string) {
    return label.split(' ').map((p) => p ? p[0].toUpperCase() + p.slice(1) : p).join(' ');
  }

  function handleAddToCart(p: Product) {
    addToCart(cartKey, { product_id: p.id_menu, name: p.nama_menu, price: Number(p.harga), qty: 1 });
    const cart = getCart(cartKey);
    setCartCount(cart.reduce((a, b) => a + b.qty, 0));
    setCartTotal(cart.reduce((a, b) => a + b.qty * b.price, 0));
    setAnimateCount(true);
    setTimeout(() => setAnimateCount(false), 350);
  }

  function handleReorder() {
    if (!session?.lastOrderItems?.length) return;
    session.lastOrderItems.forEach((item) => addToCart(cartKey, item));
    router.push(`/cart?tableToken=${encodeURIComponent(tableToken)}`);
  }

  async function handleSetTable() {
    const code = tableCode.trim().toUpperCase();
    setTableLookupError('');
    if (!code) { setTableLookupError('Masukkan nomor meja'); return; }
    try {
      setTableLoading(true);
      const r = await customerApi.tableTokenByCode(code);
      router.replace(`/menu?tableToken=${encodeURIComponent(r.data.table_token)}`);
      setShowTableInput(false);
    } catch (e: any) {
      setTableLookupError(e?.message || 'Nomor meja tidak ditemukan');
    } finally { setTableLoading(false); }
  }

  function handleClearTable() {
    clearSession(); setTable(null); setTableCode(''); router.replace('/menu');
  }

  const lastOrderToken = session?.tableToken || tableToken;

  /* ── RENDER ───────────────────────────── */
  return (
    <main>
      {/* ── APP HEADER ───────────────────── */}
      <header className="app-header">
        <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="Cafe-X Logo" width={28} height={28} style={{ borderRadius: '6px' }} />
          Cafe<span>-X</span>
        </div>
        <div className="header-actions">
          <button
            id="cart-icon-btn"
            className="icon-btn"
            onClick={() => router.push(`/cart?tableToken=${encodeURIComponent(tableToken)}`)}
            aria-label={`Lihat cart (${cartCount} item)`}
          >
            🛒
            {cartCount > 0 && (
              <span className={`cart-badge ${animateCount ? 'pulse' : ''}`}>{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── SEARCH BAR ───────────────────── */}
      <div className="search-bar">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          id="menu-search-input"
          className="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari kopi, makanan..."
          aria-label="Cari menu"
        />
      </div>

      {/* ── PROMO BANNER ─────────────────── */}
      <div className="promo-banner-wrap">
        <div className="promo-banner" role="img" aria-label="Promo banner">
          <div className="promo-banner-img">
            <img src="/banner.png" alt="" aria-hidden="true" />
          </div>
          <div className="promo-content">
            <span className="promo-tag">Promo hari ini</span>
            <h1 className="promo-title">Diskon 10%<br />untuk kopi ☕</h1>
            <p className="promo-sub">Gunakan kode voucher di bawah</p>
            <button className="promo-btn" onClick={() => document.getElementById('voucher-input')?.focus()}>
              Klaim Sekarang →
            </button>
          </div>
        </div>
      </div>

      {/* ── TABLE PICKER ─────────────────── */}
      <button
        id="table-picker-btn"
        className="table-picker"
        onClick={() => setShowTableInput(!showTableInput)}
        aria-expanded={showTableInput}
        style={{ width: 'calc(100% - 40px)', textAlign: 'left', cursor: 'pointer', background: 'var(--c-surface)' }}
      >
        <div className="table-picker-icon" aria-hidden="true">🪑</div>
        <div>
          <div className="table-picker-label">Meja anda</div>
          <div className={`table-picker-value ${!table ? 'unset' : ''}`}>
            {table ? `${table.table_name} (${table.table_code})` : 'Pilih nomor meja'}
          </div>
        </div>
        <span style={{ marginLeft: 'auto', color: 'var(--c-subtle)' }}>{showTableInput ? '▲' : '▼'}</span>
      </button>

      {showTableInput && (
        <div className="card" style={{ margin: '0 20px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            id="table-code-input"
            value={tableCode}
            onChange={(e) => setTableCode(e.target.value.toUpperCase())}
            placeholder="No meja (contoh: A1)"
            style={{ flex: 1, minWidth: 140, border: '1.5px solid rgba(200,133,60,0.25)', borderRadius: 'var(--c-radius-md)', padding: '10px 14px', fontFamily: 'inherit', fontSize: 14 }}
            aria-label="Masukkan nomor meja"
          />
          <button
            id="set-table-btn"
            onClick={handleSetTable}
            disabled={tableLoading}
            style={{ background: 'var(--c-brand)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
          >
            {tableLoading ? '...' : 'Set Meja'}
          </button>
          {table && (
            <button
              id="clear-table-btn"
              onClick={handleClearTable}
              style={{ background: 'none', color: 'var(--c-danger)', border: '1.5px solid var(--c-danger)', borderRadius: 999, padding: '10px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
            >
              Hapus
            </button>
          )}
          {tableLookupError && (
            <div className="notice error" style={{ margin: 0, width: '100%' }}>
              {tableLookupError}
            </div>
          )}
        </div>
      )}

      {/* ── ERROR / OFFLINE ───────────────── */}
      {errorParam === 'token' && (
        <div className="notice error">Token meja tidak valid. Silakan pilih meja kembali.</div>
      )}
      {error && <div className="notice error">{error}</div>}
      {offlineNotice && <div className="notice offline">⚠️ {offlineNotice}</div>}

      {/* ── LAST ORDER BAR ───────────────── */}
      {session?.lastOrderId && lastOrderToken && (
        <div className="last-order-bar">
          <div className="last-order-icon" aria-hidden="true">🧾</div>
          <div className="last-order-text">
            <div className="last-order-label">Pesanan terakhir</div>
            <div className="last-order-id">#{session.lastOrderId}</div>
          </div>
          <div className="last-order-actions">
            <button
              id="view-last-order-btn"
              className="reorder-btn"
              onClick={() => router.push(`/order-status?tableToken=${encodeURIComponent(lastOrderToken)}&orderId=${session.lastOrderId}`)}
              style={{ background: 'rgba(15,107,99,0.15)', color: 'var(--c-teal)' }}
            >
              Lihat
            </button>
            {session?.lastOrderItems?.length ? (
              <button id="reorder-btn" className="reorder-btn" onClick={handleReorder}>
                Pesan Ulang
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* ── VOUCHER ───────────────────────── */}
      <div className="voucher-row">
        <span aria-hidden="true">🎟️</span>
        <input
          id="voucher-input"
          value={voucher}
          onChange={(e) => setVoucher(e.target.value)}
          placeholder="Masukkan kode voucher..."
          aria-label="Kode voucher"
        />
        <button
          id="apply-voucher-btn"
          className="voucher-btn"
          onClick={() => setVoucherMsg(voucher ? `Voucher ${voucher} berhasil! (demo)` : 'Masukkan kode voucher')}
        >
          Gunakan
        </button>
      </div>
      {voucherMsg && <div className="notice" style={{ background: 'var(--c-brand-xl)', color: 'var(--c-brand-deep)', margin: '-8px 20px 16px', border: '1px solid rgba(200,133,60,0.25)' }}>{voucherMsg}</div>}

      {/* ── CATEGORY CHIPS ───────────────── */}
      <div className="section-head" style={{ marginTop: 8 }}>
        <h2>Kategori</h2>
      </div>
      <div className="category-scroll" role="list" aria-label="Filter kategori">
        {categories.map((c) => (
          <button
            key={c}
            id={`cat-${c.toLowerCase().replace(/\s/g, '-')}`}
            role="listitem"
            className={`cat-chip ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
          >
            {fmt(c)}
          </button>
        ))}
      </div>

      {/* ── FEATURED (horizontal scroll) ─── */}
      {!loading && featured.length > 0 && category === 'All' && !q && (
        <>
          <div className="section-head">
            <h2>Menu Unggulan</h2>
          </div>
          <div className="featured-scroll" role="list" aria-label="Menu unggulan">
            {featured.map((p) => (
              <article key={p.id_menu} className="featured-card" role="listitem">
                <div className="featured-img">
                  {p.gambar
                    ? <img src={imageUrl(p.gambar)} alt={p.nama_menu} loading="lazy" />
                    : <span aria-hidden="true">☕</span>}
                  <button
                    className={`featured-fav ${favoriteIds.includes(p.id_menu) ? 'active' : ''}`}
                    onClick={() => setFavoriteIds(toggleFavorite(p.id_menu))}
                    aria-label={`${favoriteIds.includes(p.id_menu) ? 'Hapus dari' : 'Tambah ke'} favorit: ${p.nama_menu}`}
                  >
                    {favoriteIds.includes(p.id_menu) ? '❤️' : '🤍'}
                  </button>
                </div>
                <div className="featured-body">
                  <div className="featured-tag">{fmt(p.jenis_menu)}</div>
                  <div className="featured-name">{p.nama_menu}</div>
                  <div className="featured-row">
                    <div className="featured-price">{formatRupiah(Number(p.harga))}</div>
                    <button
                      className="featured-add"
                      onClick={() => handleAddToCart(p)}
                      disabled={p.stok < 1}
                      aria-label={`Tambah ${p.nama_menu} ke cart`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* ── SKELETON ─────────────────────── */}
      {loading && (
        <>
          <div className="section-head"><h2>Semua Menu</h2></div>
          <div className="menu-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="menu-card">
                <div className="menu-img skeleton" style={{ height: 130, fontSize: 0 }} />
                <div className="menu-body">
                  <div className="skeleton" style={{ height: 10, width: '60%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── MENU GRID ─────────────────────── */}
      {!loading && grouped.map(([cat, items]) => (
        <section key={cat} className="category-section">
          <div className="category-title">{fmt(cat)}</div>
          <div className="menu-grid" role="list" aria-label={`Daftar ${fmt(cat)}`}>
            {items.map((p) => (
              <article key={p.id_menu} className="menu-card" role="listitem">
                <div className="menu-img">
                  {p.gambar
                    ? <img src={imageUrl(p.gambar)} alt={p.nama_menu} loading="lazy" />
                    : <span aria-hidden="true">☕</span>}
                  <button
                    className={`menu-fav ${favoriteIds.includes(p.id_menu) ? 'active' : ''}`}
                    onClick={() => setFavoriteIds(toggleFavorite(p.id_menu))}
                    aria-label={`Favorit: ${p.nama_menu}`}
                  >
                    {favoriteIds.includes(p.id_menu) ? '❤️' : '🤍'}
                  </button>
                  {p.stok < 1 && <span className="out-of-stock-badge">Habis</span>}
                </div>
                <div className="menu-body">
                  <div className="menu-tag">{fmt(p.jenis_menu)}</div>
                  <div className="menu-name">{p.nama_menu}</div>
                  <div className="menu-price">{formatRupiah(Number(p.harga))}</div>
                </div>
                <button
                  className="menu-add-btn"
                  onClick={() => handleAddToCart(p)}
                  disabled={p.stok < 1}
                  aria-label={`Tambah ${p.nama_menu} ke cart`}
                >
                  +
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* ── FLOATING CART BAR ────────────── */}
      {cartCount > 0 && (
        <div className="cart-float" role="complementary" aria-label="Ringkasan cart">
          <div className="cart-float-count" aria-hidden="true">{cartCount}</div>
          <div className="cart-float-info">
            <div className="cart-float-label">{cartCount} item dipilih</div>
            <div className="cart-float-total">{formatRupiah(cartTotal)}</div>
          </div>
          <button
            id="float-checkout-btn"
            className="cart-float-btn"
            onClick={() => router.push(`/cart?tableToken=${encodeURIComponent(tableToken)}`)}
          >
            Checkout →
          </button>
        </div>
      )}

      {/* ── BOTTOM NAVIGATION ────────────── */}
      <nav className="bottom-nav" aria-label="Navigasi utama">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveNav(item.id);
              if (item.id === 'order' && session?.lastOrderId && lastOrderToken) {
                router.push(`/order-status?tableToken=${encodeURIComponent(lastOrderToken)}&orderId=${session.lastOrderId}`);
              }
            }}
            aria-current={activeNav === item.id ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </main>
  );
}
