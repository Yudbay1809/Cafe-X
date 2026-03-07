'use client';

import { ApiError, customerApi } from '@/lib/api';
import { clearCart, getCart, setCart, moveCart } from '@/lib/cart';
import { getSession, setSession } from '@/lib/session';
import { formatRupiah } from '@/lib/money';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function CartPage() {
  const search = useSearchParams();
  const session = getSession();
  const tableToken = search.get('tableToken') || session?.tableToken || '';
  const cartKey = tableToken || 'public';
  const [items, setItems] = useState(getCart(cartKey));
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [tableCode, setTableCode] = useState('');
  const router = useRouter();
  const tableCodePattern = /^[A-Z]{1,2}\d{1,3}$/;

  useEffect(() => {
    setItems(getCart(cartKey));
  }, [cartKey]);

  const total = useMemo(() => items.reduce((a, b) => a + b.price * b.qty, 0), [items]);

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
      let token = tableToken;
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
        setSession({ tableToken: token, table: lookup.data.table });
      }

      const payload = {
        table_token: token,
        notes,
        items: items.map((x) => ({ product_id: x.product_id, qty: x.qty, notes: x.notes })),
      };
      const r = await customerApi.placeOrder(payload);
      clearCart(token);
      const session = getSession();
      if (session) {
        setSession({ ...session, lastOrderId: r.data.order_id, lastOrderNo: r.data.order_no });
      }
      router.push(`/order-status?tableToken=${encodeURIComponent(token)}&orderId=${r.data.order_id}`);
    } catch (e: any) {
      if (e instanceof ApiError) {
        setError(e.message || 'Gagal place order');
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
        <p className="small">Token: {tableToken || '-'}</p>
        {!tableToken ? <p className="small">Masukkan nomor meja sebelum place order.</p> : null}
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
        {!tableToken ? (
          <div style={{ marginTop: 12 }}>
            <input
              value={tableCode}
              onChange={(e) => setTableCode(e.target.value.toUpperCase())}
              placeholder="No meja (contoh: A1)"
            />
          </div>
        ) : null}
        {error ? <p className="small">{error}</p> : null}
      </div>
      <div className="sticky-footer">
        <div className="cart-item">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
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
