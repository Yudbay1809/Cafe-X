'use client';

import { ApiError, customerApi } from '@/lib/api';
import { clearCart, getCart, setCart, moveCart } from '@/lib/cart';
import { getSession, setSession } from '@/lib/session';
import type { TableInfo } from '@/lib/types';
import { formatRupiah } from '@/lib/money';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function CartPage() {
  const search = useSearchParams();
  const searchToken = search.get('tableToken') || '';
  const [activeToken, setActiveToken] = useState(() => searchToken || getSession()?.tableToken || '');
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(getSession()?.table ?? null);
  const cartKey = activeToken || 'public';
  const [items, setItems] = useState(getCart(cartKey));
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

  useEffect(() => {
    setItems(getCart(cartKey));
  }, [cartKey]);

  const total = useMemo(() => items.reduce((a, b) => a + b.price * b.qty, 0), [items]);
  const discountAmount = Math.round(total * (discountPct / 100));
  const totalAfterDiscount = Math.max(0, total - discountAmount);

  function updateQty(productId: number, qty: number) {
    const next = items.map((x) => (x.product_id === productId ? { ...x, qty: Math.max(1, qty) } : x));
    setItems(next);
    setCart(cartKey, next);
  }

  function updateItemNotes(productId: number, notes: string) {
    const next = items.map((x) => (x.product_id === productId ? { ...x, notes } : x));
    setItems(next);
    setCart(cartKey, next);
  }

  async function placeOrder() {
    setPlacing(true);
    setError('');
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
        const lookup = await customerApi.tableTokenByCode(code);
        token = lookup.data.table_token;
        moveCart(cartKey, token);
        const currentSession = getSession();
        setSession({ ...(currentSession || { tableToken: '' }), tableToken: token, table: lookup.data.table });
        setActiveToken(token);
        setTableInfo(lookup.data.table);
      }

      const payload = {
        table_token: token,
        notes,
        items: items.map((x) => ({ product_id: x.product_id, qty: x.qty, notes: x.notes })),
      };
      const r = await customerApi.placeOrder(payload);
      clearCart(token);
      const session = getSession();
      const lastOrderItems = items.map((x) => ({
        product_id: x.product_id,
        name: x.name,
        price: x.price,
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
      if (e instanceof ApiError) {
        if ([400, 404, 410].includes(e.status)) {
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
          setError(e.message || 'Gagal place order');
        }
      } else {
        setError('Gagal place order');
      }
    } finally {
      setPlacing(false);
    }
  }

  return (
    <main>
      <div className="card">
        <h1>Cart</h1>
        <p className="small">Meja: {tableInfo ? `${tableInfo.table_name} (${tableInfo.table_code})` : '-'}</p>
        {!activeToken ? <p className="small">Masukkan nomor meja sebelum place order.</p> : null}
      </div>
      {items.map((i) => (
        <div className="card" key={i.product_id}>
          <div>{i.name}</div>
          <div className="small">{formatRupiah(i.price)} x {i.qty}</div>
          <textarea value={i.notes || ''} onChange={(e) => updateItemNotes(i.product_id, e.target.value)} placeholder="Catatan item" />
          <div className="row" style={{ marginTop: 8 }}>
            <button onClick={() => updateQty(i.product_id, i.qty - 1)}>-</button>
            <button onClick={() => updateQty(i.product_id, i.qty + 1)}>+</button>
          </div>
        </div>
      ))}
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
        <div style={{ marginTop: 12 }}>
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
        {error ? <p className="small">{error}</p> : null}
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