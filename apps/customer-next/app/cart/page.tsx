'use client';

import { menuApi } from '@/features/menu/api/menuApi';
import { cartApi } from '@/features/cart/api/cartApi';
import { useCartStore } from '@/store/useCartStore';
import { getSession, setSession } from '@/lib/session';
import type { TableInfo } from '@/lib/types';
import { formatRupiah } from '@/lib/money';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const search = useSearchParams();
  const searchToken = search.get('tableToken') || '';
  const { items, updateQty, updateItemNotes, clearCart, addItem } = useCartStore();
  const [activeToken, setActiveToken] = useState(() => searchToken || getSession()?.tableToken || '');
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(getSession()?.table ?? null);
  const [notes, setNotes] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [tableCode, setTableCode] = useState('');
  const router = useRouter();
  const tableCodePattern = /^[A-Z]{1,2}\d{1,3}$/;

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'wallet'>('cash');
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (searchToken) {
      setActiveToken(searchToken);
      return;
    }
    const session = getSession();
    if (session?.tableToken) {
      setActiveToken(session.tableToken);
      setTableInfo(session.table ?? null);
    }
  }, [searchToken]);

  const total = useMemo(() => items.reduce((a, b) => a + b.harga * b.qty, 0), [items]);
  const discountAmount = Math.round(total * (discountPct / 100));
  const totalAfterDiscount = Math.max(0, total - discountAmount);

  useEffect(() => {
    if (items.length > 0) {
      const hasCoffee = items.some(i => i.nama_menu.toLowerCase().includes('coffee') || i.nama_menu.toLowerCase().includes('latte'));
      if (hasCoffee) {
        setRecommendations([{ id_menu: 99, nama_menu: 'Butter Croissant', harga: 22000, gambar: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=150' }]);
      } else {
        setRecommendations([{ id_menu: 98, nama_menu: 'Iced Americano', harga: 18000, gambar: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=150' }]);
      }
    }
  }, [items]);

  async function placeOrder() {
    setPlacing(true);
    setError('');
    
    if (paymentMethod !== 'cash') {
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      let token = activeToken;
      if (!token) {
         const code = tableCode.trim().toUpperCase();
         if (!code || !tableCodePattern.test(code)) {
            setError('Nomor meja tidak valid');
            setPlacing(false);
            return;
         }
         const res = await menuApi.getTableTokenByCode(code);
         token = res.data.data.table_token;
      }

      const payload = {
        table_token: token,
        notes,
        payment_method: paymentMethod,
        items: items.map((x) => ({ product_id: x.product_id, qty: x.qty, notes: x.notes })),
      };
      const response = await cartApi.placeOrder(payload);
      const r = response.data;
      
      clearCart();
      const session = getSession();
      setSession({ ...session, lastOrderId: r.data.order_id, tableToken: token });
      
      router.push(`/order-status?tableToken=${encodeURIComponent(token)}&orderId=${r.data.order_id}`);
    } catch (e: any) {
      setError(e.message || 'Gagal mengirim pesanan');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070710] text-white pb-40 font-karla">
      <header className="px-6 py-8 flex justify-between items-center border-b border-[#3D3320] bg-[#070710]/50 backdrop-blur-lg sticky top-0 z-50">
        <div>
          <p className="text-[10px] font-black text-[#FBBF24] uppercase tracking-[0.3em] mb-1">Your Selection</p>
          <h1 className="text-3xl font-black font-playfair-display-sc">CART</h1>
        </div>
        <button 
          onClick={() => router.back()}
          className="w-12 h-12 rounded-2xl bg-[#1A160F] border border-[#3D3320] flex items-center justify-center text-[#FBBF24]"
        >
          ✕
        </button>
      </header>

      <div className="p-6 space-y-8">
        <div className="bg-gradient-to-r from-[#1A160F] to-[#2D2418] p-6 rounded-[32px] border border-[#3D3320] flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest mb-1">Seating</p>
              <h2 className="text-xl font-black font-playfair-display-sc text-white">
                {tableInfo ? `${tableInfo.table_name} (${tableInfo.table_code})` : 'Guest Order'}
              </h2>
           </div>
           <div className="text-3xl">🪑</div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((i) => (
              <motion.div 
                key={i.product_id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#1A160F] rounded-[32px] p-5 border border-[#3D3320] space-y-4"
              >
                <div className="flex justify-between items-center">
                   <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#070710] border border-[#3D3320] overflow-hidden">
                        <img src={i.gambar} className="w-full h-full object-cover opacity-80" alt="" />
                      </div>
                      <div>
                        <h4 className="font-black text-white">{i.nama_menu}</h4>
                        <p className="text-xs font-bold text-[#FBBF24]">{formatRupiah(i.harga)}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 bg-[#070710] p-1 rounded-xl border border-[#3D3320]">
                      <button onClick={() => updateQty(i.product_id, i.qty - 1)} className="w-8 h-8 flex items-center justify-center font-black text-[#8B7355] hover:text-white">-</button>
                      <span className="w-6 text-center text-sm font-black text-[#FBBF24]">{i.qty}</span>
                      <button onClick={() => updateQty(i.product_id, i.qty + 1)} className="w-8 h-8 flex items-center justify-center font-black text-[#8B7355] hover:text-white">+</button>
                   </div>
                </div>
                <input 
                  type="text"
                  value={i.notes || ''}
                  onChange={(e) => updateItemNotes(i.product_id, e.target.value)}
                  placeholder="Special instructions..."
                  className="w-full bg-[#070710] border border-[#3D3320] rounded-xl py-3 px-4 text-xs font-medium text-[#8B7355] outline-none focus:border-[#FBBF24]/50"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {recommendations.length > 0 && (
          <div className="bg-[#632C0D]/20 border border-dashed border-[#FBBF24]/30 rounded-[32px] p-6 space-y-4">
            <p className="text-[10px] font-black text-[#FBBF24] uppercase tracking-widest">Sultan's Choice</p>
            {recommendations.map(r => (
              <div key={r.id_menu} className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <span className="text-xl">✨</span>
                    <span className="text-sm font-bold">{r.nama_menu}</span>
                 </div>
                 <button 
                  onClick={() => addItem({ ...r, product_id: r.id_menu, qty: 1 })}
                  className="bg-[#FBBF24] text-[#451A03] px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest"
                 >
                   + Add
                 </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-6">
           <div className="space-y-4">
              <p className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">Payment Method</p>
              <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: 'cash', label: 'Cash', icon: '💵' },
                   { id: 'qris', label: 'QRIS', icon: '🔳' },
                   { id: 'wallet', label: 'E-Wallet', icon: '📱' }
                 ].map(m => (
                   <button
                     key={m.id}
                     onClick={() => setPaymentMethod(m.id as any)}
                     className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${
                       paymentMethod === m.id ? 'bg-[#FBBF24] border-[#FBBF24] text-[#451A03]' : 'bg-[#1A160F] border-[#3D3320] text-[#8B7355]'
                     }`}
                   >
                     <span className="text-xl">{m.icon}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <p className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">Voucher Code</p>
              <div className="flex gap-2">
                 <input 
                  type="text" 
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Enter code..."
                  className="flex-1 bg-[#1A160F] border border-[#3D3320] rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#FBBF24]"
                 />
                 <button 
                  onClick={() => {
                    if (['CAFEX10', 'SULTAN10'].includes(voucherCode)) setDiscountPct(10);
                    else if (['CAFEX20', 'SULTAN20'].includes(voucherCode)) setDiscountPct(20);
                    else alert('Invalid Voucher');
                  }}
                  className="bg-[#1A160F] border border-[#3D3320] text-[#FBBF24] px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                 >
                   Apply
                 </button>
              </div>
           </div>
        </div>

        {error && <p className="text-red-400 text-center text-xs font-bold">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#070710]/90 backdrop-blur-2xl border-t border-[#3D3320] p-6 z-[100] space-y-6">
         <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-[#8B7355]">
               <span>Subtotal</span>
               <span>{formatRupiah(total)}</span>
            </div>
            {discountPct > 0 && (
              <div className="flex justify-between text-xs font-bold text-[#10B981]">
                 <span>Sultan Discount ({discountPct}%)</span>
                 <span>-{formatRupiah(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-end">
               <span className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">Grand Total</span>
               <span className="text-3xl font-black font-playfair-display-sc text-[#FBBF24]">{formatRupiah(totalAfterDiscount)}</span>
            </div>
         </div>
         <button 
          disabled={placing || items.length === 0}
          onClick={placeOrder}
          className="w-full bg-[#FBBF24] text-[#451A03] py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-glow-gold active:scale-95 transition-all disabled:opacity-50"
         >
           {placing ? 'Processing Order...' : 'Confirm & Place Order'}
         </button>
      </div>
    </div>
  );
}
