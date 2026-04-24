'use client';

import { API_ORIGIN } from '@/services/api';
import { menuApi } from '@/features/menu/api/menuApi';
import { useCartStore } from '@/store/useCartStore';
import { getFavorites, toggleFavorite } from '@/lib/favorites';
import type { Product, TableInfo } from '@/lib/types';
import { getSession, setSession, clearSession } from '@/lib/session';
import { getMenuCache, setMenuCache } from '@/lib/menu_cache';
import { formatRupiah } from '@/lib/money';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'menu',   icon: '🍽️', label: 'Menu' },
  { id: 'search', icon: '🔍', label: 'Cari' },
  { id: 'order',  icon: '🧾', label: 'Pesanan' },
  { id: 'profile',icon: '👤', label: 'Profil' },
];

export default function MenuPage() {
  const search       = useSearchParams();
  const tableToken   = search.get('tableToken') || '';
  const cartKey      = tableToken || 'public';
  const router       = useRouter();
  const session      = getSession();

  const { items, addItem } = useCartStore();
  const cartCount = items.reduce((a, b) => a + b.qty, 0);
  const cartTotal = items.reduce((a, b) => a + b.qty * b.harga, 0);

  const [products,         setProducts]        = useState<Product[]>([]);
  const [table,            setTable]           = useState<TableInfo | null>(null);
  const [tableCode,        setTableCode]       = useState('');
  const [loading,          setLoading]         = useState(true);
  const [error,            setError]           = useState('');
  const [q,                setQ]               = useState('');
  const [category,         setCategory]        = useState('All');
  const [favoriteIds,      setFavoriteIds]     = useState<number[]>([]);
  const [activeNav,        setActiveNav]       = useState('menu');

  useEffect(() => {
    const load = () => {
      const req = tableToken ? menuApi.getMenu(tableToken) : menuApi.getPublicMenu();
      req.then((response: any) => {
        const r = response.data;
        setProducts(r.data.products || []);
        if (tableToken) {
          setTable(r.data.table);
          setTableCode(r.data.table?.table_code || '');
          const cur = getSession();
          setSession({ ...(cur || { tableToken: '' }), tableToken, table: r.data.table });
        }
        setMenuCache({ tableToken: cartKey, table: tableToken ? r.data.table : null, products: r.data.products || [], cachedAt: new Date().toISOString() });
      }).catch((e: any) => {
        const cache = getMenuCache(cartKey);
        if (cache) {
          setProducts(cache.products); setTable(cache.table || null);
          return;
        }
        setError(e.message || 'Gagal memuat menu');
      }).finally(() => setLoading(false));
    };
    load();
  }, [tableToken, cartKey]);

  useEffect(() => { setFavoriteIds(getFavorites()); }, []);

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

  function imageUrl(path?: string) {
    if (!path) return 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=150';
    if (path.startsWith('http')) return path;
    return `${API_ORIGIN}/${path}`;
  }

  function handleAddToCart(p: Product) {
    addItem({ 
        product_id: p.id_menu, 
        nama_menu: p.nama_menu, 
        harga: Number(p.harga), 
        qty: 1,
        gambar: p.gambar 
    });
  }

  return (
    <div className="min-h-screen bg-[#070710] text-white pb-32 font-karla">
      {/* --- PREMIUM HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#070710]/80 backdrop-blur-xl border-b border-[#3D3320] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#632C0D] rounded-xl flex items-center justify-center border border-[#FBBF24]/20">
             <span className="text-xl">☕</span>
          </div>
          <div>
            <h1 className="text-xl font-black font-playfair-display-sc text-[#FBBF24] tracking-wider leading-none">CAFE·X</h1>
            <p className="text-[10px] font-bold text-[#8B7355] uppercase tracking-[0.2em] mt-1">Sultan Terminal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => router.push(`/cart?tableToken=${encodeURIComponent(tableToken)}`)}
             className="relative w-12 h-12 rounded-2xl bg-[#1A160F] border border-[#3D3320] flex items-center justify-center hover:border-[#FBBF24] transition-all"
           >
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-[#FBBF24] text-[#451A03] text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#070710]"
                >
                  {cartCount}
                </motion.span>
              )}
           </button>
        </div>
      </header>

      <div className="pt-24 px-6 space-y-8">
        {/* --- SEARCH --- */}
        <div className="relative group">
           <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8B7355]">🔍</span>
           <input 
             type="text" 
             value={q}
             onChange={(e) => setQ(e.target.value)}
             placeholder="Cari kopi atau hidangan..."
             className="w-full bg-[#1A160F] border border-[#3D3320] rounded-[24px] py-5 pl-14 pr-6 text-sm font-bold text-white focus:border-[#FBBF24] transition-all outline-none placeholder:text-[#3D3320]"
           />
        </div>

        {/* --- HERO SULTAN --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[220px] rounded-[40px] overflow-hidden bg-gradient-to-br from-[#632C0D] to-[#451A03] border border-[#FBBF24]/10 shadow-glow-gold"
        >
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600')] bg-cover opacity-20 mix-blend-overlay" />
           <div className="relative z-10 p-8 flex flex-col justify-end h-full">
              <span className="bg-[#FBBF24] text-[#451A03] text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1 rounded-full w-fit mb-4">
                Signature Edition
              </span>
              <h2 className="text-4xl font-black font-playfair-display-sc text-[#FBBF24] leading-tight">
                SULTAN<br/>SELECTIONS
              </h2>
           </div>
           <div className="absolute top-8 right-8 text-6xl animate-pulse-slow">✨</div>
        </motion.div>

        {/* --- CATEGORIES --- */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
           {categories.map(c => (
             <button 
               key={c}
               onClick={() => setCategory(c)}
               className={`whitespace-nowrap px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                 category === c 
                  ? 'bg-[#FBBF24] text-[#451A03] border-[#FBBF24] shadow-glow-gold' 
                  : 'bg-[#1A160F] text-[#8B7355] border-[#3D3320] hover:border-[#FBBF24]'
               }`}
             >
               {c}
             </button>
           ))}
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
           <AnimatePresence mode="popLayout">
             {filtered.map((p, idx) => (
               <motion.div 
                 key={p.id_menu}
                 layout
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 className="bg-[#1A160F] rounded-[32px] p-5 flex gap-6 items-center border border-[#3D3320] hover:border-[#FBBF24]/30 transition-all active:scale-[0.98]"
               >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#070710] border border-[#3D3320] flex-shrink-0">
                     <img 
                       src={imageUrl(p.gambar)} 
                       alt={p.nama_menu} 
                       className="w-full h-full object-cover"
                       onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=150')}
                     />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                     <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">{p.jenis_menu}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setFavoriteIds(toggleFavorite(p.id_menu)); }}
                          className="text-lg"
                        >
                          {favoriteIds.includes(p.id_menu) ? '❤️' : '🤍'}
                        </button>
                     </div>
                     <h3 className="text-lg font-black font-playfair-display-sc text-white">{p.nama_menu}</h3>
                     <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-black text-[#FBBF24]">Rp {Number(p.harga).toLocaleString()}</span>
                        <button 
                          onClick={() => handleAddToCart(p)}
                          className="w-10 h-10 bg-[#FBBF24] rounded-xl flex items-center justify-center text-[#451A03] font-black text-xl shadow-glow-gold hover:scale-110 active:scale-90 transition-all"
                        >
                          +
                        </button>
                     </div>
                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      </div>

      {/* --- FLOATING SULTAN CART --- */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-24 left-6 right-6 z-50 bg-[#FBBF24] rounded-[32px] p-6 shadow-glow-gold-lg flex justify-between items-center"
          >
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#451A03] rounded-2xl flex items-center justify-center text-white font-black">
                   {cartCount}
                </div>
                <div>
                   <p className="text-[10px] font-black text-[#451A03] uppercase tracking-widest opacity-60">Total Order</p>
                   <p className="text-xl font-black text-[#451A03] font-playfair-display-sc">{formatRupiah(cartTotal)}</p>
                </div>
             </div>
             <button 
               onClick={() => router.push(`/cart?tableToken=${encodeURIComponent(tableToken)}`)}
               className="bg-[#451A03] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
             >
               Checkout →
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SULTAN BOTTOM NAV --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#070710]/90 backdrop-blur-2xl border-t border-[#3D3320] px-6 py-4 flex justify-between items-center z-[100]">
         {NAV_ITEMS.map(item => (
           <button 
             key={item.id}
             onClick={() => {
               setActiveNav(item.id);
               if (item.id === 'order' && session?.lastOrderId) {
                 router.push(`/order-status?tableToken=${encodeURIComponent(tableToken)}&orderId=${session.lastOrderId}`);
               }
             }}
             className={`flex flex-col items-center gap-1 transition-all ${activeNav === item.id ? 'text-[#FBBF24]' : 'text-[#8B7355]'}`}
           >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              {activeNav === item.id && (
                <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#FBBF24] rounded-full mt-1" />
              )}
           </button>
         ))}
      </nav>
    </div>
  );
}
