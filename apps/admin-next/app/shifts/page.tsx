'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';
import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function ShiftsPage() {
  const [opening, setOpening] = useState(100000);
  const [closing, setClosing] = useState(100000);
  const [msg, setMsg] = useState('');
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');
  const { t } = useI18n();

  return (
    <RequireAuth>
      <AdminShell title={t('shifts')} subtitle={t('shiftsSubtitle')}>
        <div className="grid2">
          <div className="card">
            <h3>{t('openShift')}</h3>
            <div className="grid2">
              <input type="number" value={opening} onChange={(e) => setOpening(Number(e.target.value))} />
              <button
                className="btn"
                onClick={async () => {
                  setError('');
                  const r: any = await adminApi.shiftOpen(opening);
                  setMsg(`Shift open #${r.shift_id}`);
                }}
              >
                {t('openShift')}
              </button>
            </div>
          </div>
          <div className="card">
            <h3>{t('closeShift')}</h3>
            <div className="grid2">
              <input type="number" value={closing} onChange={(e) => setClosing(Number(e.target.value))} />
              <button
                className="btn secondary"
                onClick={async () => {
                  setError('');
                  const r: any = await adminApi.shiftClose(closing);
                  setMsg(`Shift close #${r.shift_id} variance ${r.variance_cash ?? 0}`);
                }}
              >
                {t('closeShift')}
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="toolbar">
            <button
              className="btn outline"
              onClick={async () => {
                setError('');
                try {
                  setReport(await adminApi.reportShift());
                } catch (e: any) {
                  setError(e.message || 'Gagal load shift report');
                }
              }}
            >
              {t('loadLatestShift')}
            </button>
          </div>
          {msg ? <p className="small">{msg}</p> : null}
          {error ? <p className="small">{error}</p> : null}
        </div>
        {report ? (
          <div className="grid2">
            <div className="card">
              <h3>{t('shifts')} #{report.shift?.id}</h3>
              <div className="small">{t('openedAt')}: {report.shift?.opened_at || '-'}</div>
              <div className="small">{t('closedAt')}: {report.shift?.closed_at || '-'}</div>
              <div style={{ height: 10 }} />
              <div className="grid2">
                <div>
                  <div className="small">{t('openingCash')}</div>
                  <b>{formatRupiah(report.cash?.opening_cash || 0)}</b>
                </div>
                <div>
                  <div className="small">{t('closingCash')}</div>
                  <b>{formatRupiah(report.cash?.closing_cash || 0)}</b>
                </div>
                <div>
                  <div className="small">{t('expectedCash')}</div>
                  <b>{formatRupiah(report.cash?.expected_cash || 0)}</b>
                </div>
                <div>
                  <div className="small">{t('variance')}</div>
                  <b>{formatRupiah(report.cash?.variance_cash || 0)}</b>
                </div>
              </div>
            </div>
            <div className="card">
              <h3>{t('orders')}</h3>
              <div className="grid2">
                <div>
                  <div className="small">{t('ordersTotal')}</div>
                  <b>{report.orders_total}</b>
                </div>
                <div>
                  <div className="small">{t('voidCanceled')}</div>
                  <b>{report.void_count}</b>
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
                  {(report.payments_by_method || []).map((p: any) => (
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
