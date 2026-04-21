'use client';

import { menuApi } from '@/features/menu/api/menuApi';
import { cartApi } from '@/features/cart/api/cartApi';
import { useCartStore } from '@/store/useCartStore';
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
  const { items, updateQty, updateItemNotes, removeItem, clearCart } = useCartStore();
  const [notes, setNotes] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherMsg, setVoucherMsg] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [tableCode, setTableCode] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);

  const tableCodePattern = /^[A-Z]{1,2}\d{1,3}$/;

  useEffect(() => {
    if (!open) return;
    setError('');
  }, [open]);

  const subtotal = useMemo(() => items.reduce((a, b) => a + b.harga * b.qty, 0), [items]);
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount - pointsDiscount);
  const itemCount = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);

  // Removed syncCart, updateQty, updateItemNotes, removeItem as they are now handled by useCartStore

  async function resolveTableToken(): Promise<string> {
    if (tableToken) return tableToken;
    const code = tableCode.trim().toUpperCase();
    if (!code) throw new Error('Masukkan nomor meja terlebih dahulu');
    if (!tableCodePattern.test(code)) throw new Error('Format nomor meja harus seperti A1 atau B12');
    const response = await menuApi.getTableTokenByCode(code);
    const lookup = response.data;
    const token = lookup.data.table_token;
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
        voucher_code: discountAmount > 0 ? voucherCode : undefined,
        member_phone: memberInfo?.phone || undefined,
        redeem_points: pointsDiscount > 0 ? redeemPoints : undefined,
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

      onPlaced({ tableToken: token, orderId: r.data.order_id });
      onClose();
    } catch (e: any) {
      if (e.response?.status && [400, 404, 410].includes(e.response.status)) {
        setError('Token meja tidak valid atau sudah expired. Silakan masukkan nomor meja lagi.');
        const currentSession = getSession();
        if (currentSession) setSession({ ...currentSession, tableToken: '', table: undefined });
        else setSession({ tableToken: '' });
      } else {
        setError(e.response?.data?.message || e.message || 'Gagal place order');
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
                  <div className="cx-line-title">{i.nama_menu}</div>
                  <div className="small">
                    {formatRupiah(i.harga)} • qty {i.qty}
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
                <input 
                  value={voucherCode} 
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    if (discountAmount > 0) {
                        setDiscountAmount(0);
                        setVoucherMsg('');
                    }
                  }} 
                  placeholder="Kode voucher" 
                />
                <button
                  type="button"
                  onClick={async () => {
                    const code = voucherCode.trim().toUpperCase();
                    if (!code) return;
                    try {
                        setError('');
                        const res = await cartApi.validateVoucher({ code, subtotal });
                        setDiscountAmount(res.data.discount_amount);
                        setVoucherMsg(`Voucher '${res.data.name}' diterapkan!`);
                    } catch (e: any) {
                        setDiscountAmount(0);
                        setVoucherMsg('');
                        setError(e.response?.data?.message || 'Voucher tidak valid');
                    }
                  }}
                >
                  Terapkan
                </button>
              </div>
              {voucherMsg ? <div className="small" style={{ color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>{voucherMsg}</div> : null}
            </div>

            <div className="divider" style={{ marginTop: 10 }} />
            <div>
              <div className="small">Loyalty Member (Nomor HP)</div>
              <div className="toolbar">
                <input 
                  value={memberPhone} 
                  onChange={(e) => setMemberPhone(e.target.value)} 
                  placeholder="08123xxxx" 
                />
                <button
                  type="button"
                  onClick={async () => {
                    const phone = memberPhone.trim();
                    if (!phone) return;
                    try {
                        setError('');
                        const res = await cartApi.lookupMember(phone);
                        setMemberInfo(res.data);
                    } catch (e: any) {
                        setMemberInfo(null);
                        setError(e.response?.data?.message || 'Member tidak ditemukan');
                    }
                  }}
                >
                  Cek
                </button>
              </div>
              {memberInfo && (
                <div className="card" style={{ padding: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', marginTop: 8 }}>
                   <div className="small" style={{ fontWeight: 700, color: '#166534' }}>
                        Halo, {memberInfo.name}!
                   </div>
                   <div className="small">
                        Poin kamu: {memberInfo.points} Pts. 
                        Potensi poin baru: <b style={{ color: 'var(--primary)' }}>+{Math.floor(totalAfterDiscount / 1000)} Pts</b>
                   </div>
                   
                   <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input 
                            type="number"
                            min={0}
                            max={memberInfo.points}
                            value={redeemPoints}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setRedeemPoints(Math.min(val, memberInfo.points, subtotal));
                            }}
                            style={{ flex: 1, padding: '4px 8px', fontSize: '12px' }}
                            placeholder="Jmh poin"
                        />
                        <button 
                            className="primary small" 
                            style={{ padding: '6px 10px', fontSize: '10px' }}
                            onClick={() => {
                                setPointsDiscount(redeemPoints);
                            }}
                        >
                            Pakai Poin
                        </button>
                        {pointsDiscount > 0 && (
                             <button className="ghost small" style={{ color: 'red' }} onClick={() => { setPointsDiscount(0); setRedeemPoints(0); }}>Batal</button>
                        )}
                   </div>
                   {pointsDiscount > 0 && (
                        <div className="small" style={{ color: 'var(--success)', marginTop: 4, fontWeight: 700 }}>
                            Diskon poin berhasil: -{formatRupiah(pointsDiscount)}
                        </div>
                   )}
                </div>
              )}
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

