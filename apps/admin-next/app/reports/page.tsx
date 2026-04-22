'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [shift, setShift] = useState<any>(null);
  const [shiftId, setShiftId] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const { t } = useI18n();

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const res = await adminApi.ordersList({ limit: 10 });
      setRecentOrders(res.items || []);
    } catch (e) {}
  };

  const viewOrderDetail = async (order: any) => {
    setSelectedOrder(order);
    setLoadingOrder(true);
    try {
      const res = await adminApi.orderDetail(order.id);
      setOrderDetail(res);
    } catch (e) {
      alert('Gagal mengambil detail pesanan');
    } finally {
      setLoadingOrder(false);
    }
  };

  const exportShiftCsv = () => {
    if (!shift) return;
    const lines: string[] = [];
    lines.push('Shift ID,Opened At,Closed At,Opening Cash,Closing Cash,Expected Cash,Variance,Orders Total,Void Count');
    lines.push([
      shift.shift?.id ?? '',
      shift.shift?.opened_at ?? '',
      shift.shift?.closed_at ?? '',
      shift.cash?.opening_cash ?? 0,
      shift.cash?.closing_cash ?? 0,
      shift.cash?.expected_cash ?? 0,
      shift.cash?.variance_cash ?? 0,
      shift.orders_total ?? 0,
      shift.void_count ?? 0,
    ].join(','));
    lines.push('');
    lines.push('Payments By Method');
    lines.push('Method,Count,Total');
    (shift.payments_by_method || []).forEach((p: any) => {
      lines.push([p.method, p.trx_count, p.total ?? 0].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-${shift.shift?.id || 'unknown'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RequireAuth>
      <AdminShell title={t('reports')} subtitle="Manajemen Laporan & Nota Transaksi">
        <div className="grid2">
          <div className="space-y-6">
            <div className="card">
              <h3 className="mb-4">Kontrol Laporan</h3>
              <div className="grid2">
                <button className="btn" onClick={async () => {
                  setError('');
                  try { setSummary(await adminApi.reportSummary()); } catch (e: any) { setError(e.message || 'Gagal load summary'); }
                }}>{t('loadSummary')}</button>
                <div className="toolbar">
                  <input type="number" value={shiftId} onChange={(e) => setShiftId(Number(e.target.value))} placeholder="Shift ID" style={{width: 80}} />
                  <button className="btn outline" onClick={async () => {
                    setError('');
                    try { setShift(await adminApi.reportShift(shiftId || undefined)); } catch (e: any) { setError(e.message || 'Gagal load shift report'); }
                  }}>{t('loadShift')}</button>
                </div>
              </div>
              <div className="divider" style={{ margin: '16px 0' }} />
              <div className="cx-line-title" style={{ marginBottom: 12 }}>Export Transaksi Detail</div>
              <div className="grid2">
                <div className="toolbar">
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  <span>s/d</span>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <button className="btn success" onClick={() => window.open(adminApi.exportSalesUrl(dateFrom, dateTo), '_blank')}>Export ke CSV</button>
              </div>
            </div>

            {summary && (
              <div className="grid3">
                <div className="card"><div className="small">Hari Ini</div><h2>{summary.date}</h2></div>
                <div className="card"><div className="small">Orders</div><h2>{summary.orders_count}</h2></div>
                <div className="card"><div className="small">Total Sales</div><h2>{formatRupiah(summary.sales_total || 0)}</h2></div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3>Transaksi Terbaru (Synced)</h3>
              <button className="btn ghost" onClick={fetchRecentOrders}>🔄</button>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Metode</th>
                    <th>Total</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td>{o.order_no}</td>
                      <td><span className="badge">{o.payment_method?.toUpperCase() || 'CASH'}</span></td>
                      <td>{formatRupiah(o.total_amount)}</td>
                      <td>
                        <button className="btn link" onClick={() => viewOrderDetail(o)}>Nota</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {shift && (
          <div className="grid2 mt-8">
            <div className="card">
              <h3>{t('shifts')} #{shift.shift?.id}</h3>
              <button className="btn outline" onClick={exportShiftCsv} style={{ marginTop: 8 }}>{t('exportCsv') || 'Export CSV'}</button>
              <div className="grid2 mt-4">
                <div><div className="small">{t('openingCash')}</div><b>{formatRupiah(shift.cash?.opening_cash || 0)}</b></div>
                <div><div className="small">{t('closingCash')}</div><b>{formatRupiah(shift.cash?.closing_cash || 0)}</b></div>
              </div>
            </div>
            <div className="card">
              <h4>{t('paymentsByMethod')}</h4>
              <table className="table">
                <thead><tr><th>{t('method')}</th><th>{t('count')}</th><th>{t('total')}</th></tr></thead>
                <tbody>
                  {(shift.payments_by_method || []).map((p: any) => (
                    <tr key={p.method}><td>{p.method}</td><td>{p.trx_count}</td><td>{formatRupiah(p.total || 0)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {selectedOrder && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: 400, maxHeight: '90vh', overflow: 'auto' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="m-0">Detail Nota</h3>
                <button className="btn ghost" onClick={() => setSelectedOrder(null)}>✕</button>
              </div>
              
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Cafe-X</h2>
                <div className="small">HQ - Central Cloud</div>
                <div style={{ borderBottom: '1px dashed #ccc', margin: '15px 0' }} />
              </div>

              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-sm"><span>Order ID:</span><span>#{selectedOrder.id}</span></div>
                <div className="flex justify-between text-sm"><span>Order No:</span><span>{selectedOrder.order_no}</span></div>
                <div className="flex justify-between text-sm"><span>Waktu:</span><span>{new Date(selectedOrder.created_at).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Metode:</span><span>{selectedOrder.payment_method?.toUpperCase() || 'CASH'}</span></div>
              </div>

              {loadingOrder ? (
                <div style={{ textAlign: 'center', padding: 20 }}>Memuat detail...</div>
              ) : orderDetail ? (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <th style={{ textAlign: 'left', paddingBottom: 8 }}>Item</th>
                        <th style={{ textAlign: 'right', paddingBottom: 8 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetail.items?.map((it: any) => (
                        <tr key={it.id}>
                          <td style={{ padding: '8px 0' }}>
                            <div className="font-bold">{it.product_name}</div>
                            <div className="text-xs text-gray-500">{it.qty} x {formatRupiah(it.price)}</div>
                            {it.notes && <div className="text-xs text-amber-600 font-italic">* {it.notes}</div>}
                          </td>
                          <td style={{ textAlign: 'right' }}>{formatRupiah(it.qty * it.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ borderTop: '1px dashed #ccc', marginTop: 15, paddingTop: 15 }} className="space-y-1">
                    <div className="flex justify-between text-sm"><span>Subtotal:</span><span>{formatRupiah(orderDetail.order.subtotal || selectedOrder.total_amount)}</span></div>
                    {orderDetail.order.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-red-600"><span>Diskon:</span><span>-{formatRupiah(orderDetail.order.discount_amount)}</span></div>
                    )}
                    <div className="flex justify-between text-sm"><span>Pajak:</span><span>{formatRupiah(orderDetail.order.tax_amount || 0)}</span></div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatRupiah(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </>
              ) : null}

              <button className="btn block mt-8" onClick={() => setSelectedOrder(null)}>Tutup Nota</button>
            </div>
          </div>
        )}
      </AdminShell>
    </RequireAuth>
  );
}
