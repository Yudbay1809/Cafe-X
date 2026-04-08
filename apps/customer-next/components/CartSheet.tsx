'use client';

import { ApiError, customerApi } from '@/lib/api';
import { clearCart, getCart, moveCart, setCart, type CartItem } from '@/lib/cart';
import { formatRupiah } from '@/lib/money';
import { getSession, setSession } from '@/lib/session';
import type { TableInfo } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';

type Props = Readonly<{
  open: boolean;
  onClose: () => void;
  tableToken: string;
  tableInfo: TableInfo | null;
  cartKey: string;
  onPlaced: (args: { tableToken: string; orderId: number }) => void;
}>;

export function CartSheet({ open, onClose, tableToken, tableInfo, cartKey, onPlaced }: Props) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [tableCode, setTableCode] = useState('');

  const tableCodePattern = /^[A-Z]{1,2}\d{1,3}$/;

  useEffect(() => {
    if (!open) return;
    setItems(getCart(cartKey));
    setError('');
  }, [open, cartKey]);

  const subtotal = useMemo(() => items.reduce((a, b) => a + b.price * b.qty, 0), [items]);
  const discountAmount = Math.round(subtotal * (discountPct / 100));
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const itemCount = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);

  function syncCart(next: CartItem[]) {
    setItems(next);
    setCart(cartKey, next);
  }

  function updateQty(productId: number, qty: number) {
    const next = items.map((x) => (x.product_id === productId ? { ...x, qty: Math.max(1, qty) } : x));
    syncCart(next);
  }

  function updateItemNotes(productId: number, notes: string) {
    const next = items.map((x) => (x.product_id === productId ? { ...x, notes } : x));
    syncCart(next);
  }

  function removeItem(productId: number) {
    const next = items.filter((x) => x.product_id !== productId);
    syncCart(next);
  }

  async function resolveTableToken(): Promise<string> {
    if (tableToken) return tableToken;
    const code = tableCode.trim().toUpperCase();
    if (!code) throw new Error('Masukkan nomor meja terlebih dahulu');
    if (!tableCodePattern.test(code)) throw new Error('Format nomor meja harus seperti A1 atau B12');
    const lookup = await customerApi.tableTokenByCode(code);
    const token = lookup.data.table_token;
    moveCart(cartKey, token);
    const currentSession = getSession();
    setSession({ ...(currentSession || { tableToken: '' }), tableToken: token, table: lookup.data.table });
    return token;
  }

  async function placeOrder() {
    setPlacing(true);
    setError('');
    try {
      const token = await resolveTableToken();

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

      onPlaced({ tableToken: token, orderId: r.data.order_id });
      onClose();
    } catch (e: any) {
      if (e instanceof Error && !(e instanceof ApiError)) {
        setError(e.message);
        return;
      }
      if (e instanceof ApiError && [400, 404, 410].includes(e.status)) {
        setError('Token meja tidak valid atau sudah expired. Silakan masukkan nomor meja lagi.');
        const currentSession = getSession();
        if (currentSession) setSession({ ...currentSession, tableToken: '', table: undefined });
        else setSession({ tableToken: '' });
      } else {
        setError(e?.message || 'Gagal place order');
      }
    } finally {
      setPlacing(false);
    }
  }

  if (!open) return null;

  let tableLabel = 'Belum dipilih';
  if (tableInfo) tableLabel = `${tableInfo.table_name} (${tableInfo.table_code})`;
  else if (tableToken) tableLabel = tableToken;

  return (
    <div className="cx-sheet-overlay" role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="cx-sheet" data-open={open ? '1' : '0'}>
        <div className="cx-sheet-header">
          <div>
            <div className="cx-sheet-title">Checkout</div>
            <div className="small">Meja: {tableLabel}</div>
          </div>
          <button className="ghost" onClick={onClose} aria-label="Tutup">
            Tutup
          </button>
        </div>

        {items.length === 0 ? (
          <div className="card" style={{ marginBottom: 0 }}>
            Cart kamu masih kosong.
          </div>
        ) : (
          <div className="cx-sheet-body">
            {items.map((i) => (
              <div key={i.product_id} className="cx-line">
                <div className="cx-line-main">
                  <div className="cx-line-title">{i.name}</div>
                  <div className="small">
                    {formatRupiah(i.price)} • qty {i.qty}
                  </div>
                </div>
                <div className="cx-line-actions">
                  <button className="ghost" onClick={() => updateQty(i.product_id, i.qty - 1)} aria-label="Kurangi">
                    −
                  </button>
                  <button className="ghost" onClick={() => updateQty(i.product_id, i.qty + 1)} aria-label="Tambah">
                    +
                  </button>
                  <button className="ghost" onClick={() => removeItem(i.product_id)} aria-label="Hapus">
                    Hapus
                  </button>
                </div>
                <textarea
                  value={i.notes || ''}
                  onChange={(e) => updateItemNotes(i.product_id, e.target.value)}
                  placeholder="Catatan item (opsional)"
                />
              </div>
            ))}

            <div className="divider" />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan untuk barista/kitchen (opsional)" />

            {!tableToken ? (
              <div>
                <div className="small" style={{ marginTop: 8 }}>
                  Nomor meja
                </div>
                <input value={tableCode} onChange={(e) => setTableCode(e.target.value.toUpperCase())} placeholder="Contoh: A1" />
              </div>
            ) : null}

            <div>
              <div className="small" style={{ marginTop: 10 }}>
                Voucher
              </div>
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
              {discountPct > 0 ? <div className="small">Diskon {discountPct}% diterapkan (demo)</div> : null}
            </div>

            {error ? (
              <div className="card" style={{ marginBottom: 0 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Gagal</div>
                <div className="small">{error}</div>
              </div>
            ) : null}
          </div>
        )}

        <div className="cx-sheet-footer">
          <div className="cx-totals">
            <div className="cart-item">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            {discountPct > 0 ? (
              <div className="cart-item">
                <span>Diskon</span>
                <span>-{formatRupiah(discountAmount)}</span>
              </div>
            ) : null}
            <div className="cart-item">
              <span>Total</span>
              <span style={{ fontWeight: 800 }}>{formatRupiah(totalAfterDiscount)}</span>
            </div>
          </div>
          <div className="toolbar" style={{ marginTop: 8, justifyContent: 'space-between' }}>
            <div className="small">{itemCount} item</div>
            <button disabled={placing || items.length === 0} onClick={placeOrder}>
              {placing ? 'Memproses...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
      <button className="cx-sheet-backdrop" onClick={onClose} aria-label="Tutup checkout" />
    </div>
  );
}

