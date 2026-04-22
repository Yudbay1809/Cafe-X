'use client';

import { menuApi } from '@/features/menu/api/menuApi';
import { cartApi } from '@/features/cart/api/cartApi';
import { useCartStore } from '@/store/useCartStore';
import { getSession, setSession } from '@/lib/session';
import type { TableInfo } from '@/lib/types';
import { formatRupiah } from '@/lib/money';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function CartPage() {
  const search = useSearchParams();
  const searchToken = search.get('tableToken') || '';
  const { items, updateQty, updateItemNotes, clearCart } = useCartStore();
  const [activeToken, setActiveToken] = useState(() => searchToken || getSession()?.tableToken || '');
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(getSession()?.table ?? null);
  const cartKey = activeToken || 'public';
  const [notes, setNotes] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [tableCode, setTableCode] = useState('');
  const router = useRouter();
  const tableCodePattern = /^[A-Z]{1,2}\d{1,3}$/;

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

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'wallet'>('cash');
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (items.length > 0) {
      // Simulation AI Recommendation (e.g. coffee always suggests pastries)
      const hasCoffee = items.some(i => i.nama_menu.toLowerCase().includes('coffee') || i.nama_menu.toLowerCase().includes('latte'));
      if (hasCoffee) {
        setRecommendations([{ id_menu: 99, nama_menu: 'Butter Croissant', harga: 22000, gambar: '/products/croissant.png' }]);
      } else {
        setRecommendations([{ id_menu: 98, nama_menu: 'Iced Americano', harga: 18000, gambar: '/products/americano.png' }]);
      }
    }
  }, [items]);

  async function placeOrder() {
    setPlacing(true);
    setError('');
    
    // Dummy Digital Payment Flow
    if (paymentMethod !== 'cash') {
      alert('Simulasi Pembayaran Digital: Silakan scan QRIS atau konfirmasi di aplikasi E-Wallet Anda.');
      await new Promise(r => setTimeout(r, 1500));
      console.log('Payment Successful');
    }

    try {
      let token = activeToken;
      if (!token) {
        const code = tableCode.trim().toUpperCase();
        if (!code) {
          setError('Masukkan nomor meja terlebih dahulu');
          setPlacing(false);
          return;
        }
        if (!tableCodePattern.test(code)) {
          setError('Format nomor meja harus seperti A1 atau B12');
          setPlacing(false);
          return;
        }
        const response = await menuApi.getTableTokenByCode(code);
        const lookup = response.data;
        token = lookup.data.table_token;
        const currentSession = getSession();
        setSession({ ...(currentSession || { tableToken: '' }), tableToken: token, table: lookup.data.table });
        setActiveToken(token);
        setTableInfo(lookup.data.table);
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
      const lastOrderItems = items.map((x) => ({
        product_id: x.product_id,
        nama_menu: x.nama_menu,
        harga: x.harga,
        qty: x.qty,
        notes: x.notes,
      }));
      if (session) {
        setSession({ ...session, lastOrderId: r.data.order_id, lastOrderNo: r.data.order_no, lastOrderItems });
      } else {
        setSession({ tableToken: token, lastOrderId: r.data.order_id, lastOrderNo: r.data.order_no, lastOrderItems });
      }
      router.push(`/order-status?tableToken=${encodeURIComponent(token)}&orderId=${r.data.order_id}`);
    } catch (e: any) {
        if (e.response?.status && [400, 404, 410].includes(e.response.status)) {
          setError('Token meja tidak valid atau sudah expired. Silakan masukkan nomor meja lagi.');
          const currentSession = getSession();
          if (currentSession) {
            setSession({ ...currentSession, tableToken: '', table: undefined });
          } else {
            setSession({ tableToken: '' });
          }
          setActiveToken('');
          setTableInfo(null);
          if (searchToken) {
            router.replace('/cart');
          }
        } else {
          setError(e.response?.data?.message || e.message || 'Gagal place order');
        }
    } finally {
      setPlacing(false);
    }
  }

  return (
    <main>
      <div className="hero">
        <div className="hero-top">
          <div>
            <div className="small">Cafe-X</div>
            <h1 className="hero-title">Checkout</h1>
            <div className="hero-sub">Meja: {tableInfo ? `${tableInfo.table_name} (${tableInfo.table_code})` : '-'}</div>
          </div>
          <button className="ghost" onClick={() => router.push(`/menu?tableToken=${encodeURIComponent(activeToken)}`)}>Kembali ke Menu</button>
        </div>
        {!activeToken ? <div className="small">Masukkan nomor meja sebelum place order.</div> : null}
      </div>

      {items.map((i) => (
        <div className="card" key={i.product_id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{i.nama_menu}</div>
              <div className="small">{formatRupiah(i.harga)} x {i.qty}</div>
            </div>
            <div className="toolbar">
              <button className="ghost" onClick={() => updateQty(i.product_id, i.qty - 1)}>-</button>
              <button className="ghost" onClick={() => updateQty(i.product_id, i.qty + 1)}>+</button>
            </div>
          </div>
          <textarea value={i.notes || ''} onChange={(e) => updateItemNotes(i.product_id, e.target.value)} placeholder="Catatan item" />
        </div>
      ))}

      {recommendations.length > 0 && (
        <div className="card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
          <div className="small" style={{ color: '#2563eb', fontWeight: 'bold', marginBottom: 8 }}>AI Suggestion: Pas untuk kamu!</div>
          {recommendations.map(r => (
            <div key={r.id_menu} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span>{r.nama_menu}</span>
               <button className="ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => addItem({ product_id: r.id_menu, nama_menu: r.nama_menu, harga: r.harga, qty: 1, gambar: r.gambar })}>+ Tambah</button>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan order" />
        {!activeToken ? (
          <div style={{ marginTop: 12 }}>
            <input
              value={tableCode}
              onChange={(e) => setTableCode(e.target.value.toUpperCase())}
              placeholder="No meja (contoh: A1)"
            />
          </div>
        ) : null}
        
        <div style={{ marginTop: 16 }}>
          <div className="small" style={{ fontWeight: 'bold', marginBottom: 8 }}>Metode Pembayaran</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`ghost ${paymentMethod === 'cash' ? 'active' : ''}`} style={{ flex: 1, fontSize: 12 }} onClick={() => setPaymentMethod('cash')}>💵 Tunai</button>
            <button className={`ghost ${paymentMethod === 'qris' ? 'active' : ''}`} style={{ flex: 1, fontSize: 12 }} onClick={() => setPaymentMethod('qris')}>🔳 QRIS</button>
            <button className={`ghost ${paymentMethod === 'wallet' ? 'active' : ''}`} style={{ flex: 1, fontSize: 12 }} onClick={() => setPaymentMethod('wallet')}>📱 E-Wallet</button>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="small">Voucher</div>
          <div className="toolbar">
            <input value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} placeholder="Kode voucher" />
            <button
              onClick={() => {
                const code = voucherCode.trim().toUpperCase();
                if (code === 'CAFEX10') setDiscountPct(10);
                else if (code === 'CAFEX20') setDiscountPct(20);
                else setDiscountPct(0);
              }}
            >
              Terapkan
            </button>
          </div>
          {discountPct > 0 ? <div className="small">Diskon {discountPct}% diterapkan</div> : null}
        </div>
        {error ? <p className="small" style={{ color: 'red' }}>{error}</p> : null}
      </div>

      <div className="sticky-footer">
        <div className="cart-item">
          <span>Subtotal</span>
          <span>{formatRupiah(total)}</span>
        </div>
        {discountPct > 0 ? (
          <div className="cart-item">
            <span>Diskon</span>
            <span>-{formatRupiah(discountAmount)}</span>
          </div>
        ) : null}
        <div className="cart-item">
          <span>Total</span>
          <span>{formatRupiah(totalAfterDiscount)}</span>
        </div>
        <div className="toolbar" style={{ marginTop: 8 }}>
          <button disabled={placing || items.length === 0} onClick={placeOrder}>
            {placing ? 'Memproses...' : 'Place Order'}
          </button>
        </div>
      </div>
    </main>
  );
}
