'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';
import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [shift, setShift] = useState<any>(null);
  const [shiftId, setShiftId] = useState(0);
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const { t } = useI18n();

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
      <AdminShell title={t('reports')} subtitle={t('reportsSubtitle')}>
        <div className="card">
          <div className="grid2">
            <button
              className="btn"
              onClick={async () => {
                setError('');
                try {
                  setSummary(await adminApi.reportSummary());
                } catch (e: any) {
                  setError(e.message || 'Gagal load summary');
                }
              }}
            >
              {t('loadSummary')}
            </button>
            <div className="grid2">
              <input
                type="number"
                value={shiftId}
                onChange={(e) => setShiftId(Number(e.target.value))}
                placeholder="Shift ID (optional)"
              />
              <button
                className="btn outline"
                onClick={async () => {
                  setError('');
                  try {
                    setShift(await adminApi.reportShift(shiftId || undefined));
                  } catch (e: any) {
                    setError(e.message || 'Gagal load shift report');
                  }
                }}
              >
                {t('loadShift')}
              </button>
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
            <button 
              className="btn success" 
              onClick={() => {
                window.open(adminApi.exportSalesUrl(dateFrom, dateTo), '_blank');
              }}
            >
              Export ke CSV
            </button>
          </div>
        </div>
        {error ? <div className="card">{error}</div> : null}
        {summary ? (
          <div className="grid3">
            <div className="card">
              <div className="small">{t('date')}</div>
              <h2>{summary.date}</h2>
            </div>
            <div className="card">
              <div className="small">{t('orders')}</div>
              <h2>{summary.orders_count}</h2>
            </div>
            <div className="card">
              <div className="small">{t('sales')}</div>
              <h2>{formatRupiah(summary.sales_total || 0)}</h2>
            </div>
          </div>
        ) : null}
        {shift ? (
          <div className="grid2">
            <div className="card">
              <h3>{t('shifts')} #{shift.shift?.id}</h3>
              <button className="btn outline" onClick={exportShiftCsv} style={{ marginTop: 8 }}>{t('exportCsv') || 'Export CSV'}</button>
              <div className="small">{t('openedAt')}: {shift.shift?.opened_at || '-'}</div>
              <div className="small">{t('closedAt')}: {shift.shift?.closed_at || '-'}</div>
              <div style={{ height: 10 }} />
              <div className="grid2">
                <div>
                  <div className="small">{t('openingCash')}</div>
                  <b>{formatRupiah(shift.cash?.opening_cash || 0)}</b>
                </div>
                <div>
                  <div className="small">{t('closingCash')}</div>
                  <b>{formatRupiah(shift.cash?.closing_cash || 0)}</b>
                </div>
                <div>
                  <div className="small">{t('expectedCash')}</div>
                  <b>{formatRupiah(shift.cash?.expected_cash || 0)}</b>
                </div>
                <div>
                  <div className="small">{t('variance')}</div>
                  <b>{formatRupiah(shift.cash?.variance_cash || 0)}</b>
                </div>
              </div>
            </div>
            <div className="card">
              <h3>{t('orderSummary')}</h3>
              <div className="grid2">
                <div>
                  <div className="small">{t('ordersTotal')}</div>
                  <b>{shift.orders_total}</b>
                </div>
                <div>
                  <div className="small">{t('voidCanceled')}</div>
                  <b>{shift.void_count}</b>
                </div>
              </div>
              <div style={{ height: 10 }} />
              <h4>{t('paymentsByMethod')}</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('method')}</th>
                    <th>{t('count')}</th>
                    <th>{t('total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(shift.payments_by_method || []).map((p: any) => (
                    <tr key={p.method}>
                      <td>{p.method}</td>
                      <td>{p.trx_count}</td>
                      <td>{formatRupiah(p.total || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </AdminShell>
    </RequireAuth>
  );
}


