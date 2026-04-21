'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { useI18n } from '@/components/I18nProvider';
import { useEffect, useState } from 'react';

export default function AuditLogsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [event, setEvent] = useState('');
  const [actor, setActor] = useState('');
  const [entity, setEntity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const { t } = useI18n();

  const [selectedLog, setSelectedLog] = useState<any>(null);

  async function load(p = page) {
    setError('');
    try {
      const r = await adminApi.auditLogs({ event, actor, entity, from, to, page: p, limit });
      setItems(r.items || []);
      setTotal(r.total || 0);
      setPage(r.page || p);
    } catch (e: any) {
      setError(e.message || 'Gagal load audit logs');
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  return (
    <RequireAuth>
      <AdminShell title={t('auditLogs')} subtitle={t('auditLogsSubtitle')}>
        <div className="card">
          <div className="toolbar">
            <input value={event} onChange={(e) => setEvent(e.target.value)} placeholder="Event (order.pay)" />
            <input value={actor} onChange={(e) => setActor(e.target.value)} placeholder="Actor" />
            <input value={entity} onChange={(e) => setEntity(e.target.value)} placeholder="Entity (order)" />
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <button className="btn" onClick={() => load(1)}>{t('search')}</button>
            <button className="btn outline" onClick={() => { setEvent(''); setActor(''); setEntity(''); setFrom(''); setTo(''); load(1); }}>{t('reset')}</button>
          </div>
        </div>
        {error ? <div className="card">{error}</div> : null}
        
        {selectedLog && (
          <div className="cx-sheet-overlay" onClick={() => setSelectedLog(null)}>
            <div className="cx-sheet" onClick={e => e.stopPropagation()} style={{ width: '40%' }}>
              <div className="cx-sheet-header">
                <div className="cx-sheet-title">Audit Detail #{selectedLog.id}</div>
                <button className="ghost" onClick={() => setSelectedLog(null)}>Tutup</button>
              </div>
              <div className="cx-sheet-body">
                <pre style={{ 
                  background: '#f1f5f9', 
                  padding: 16, 
                  borderRadius: 8, 
                  fontSize: 12, 
                  overflow: 'auto',
                  maxHeight: 400 
                }}>
                  {JSON.stringify(JSON.parse(selectedLog.payload_json || '{}'), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('created')}</th>
                <th>{t('action')}</th>
                <th>Actor</th>
                <th>Entity</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td className="small">{log.created_at}</td>
                  <td><b>{log.event_type}</b></td>
                  <td>{log.actor}</td>
                  <td>{log.entity_type} <span className="small">({log.entity_id})</span></td>
                  <td>
                    <button className="btn outline sm" onClick={() => setSelectedLog(log)}>Lihat</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn outline" disabled={page <= 1} onClick={() => load(page - 1)}>Prev</button>
          <div className="small">Page {page} / {Math.max(1, Math.ceil(total / limit))}</div>
          <button className="btn outline" disabled={page >= Math.ceil(total / limit)} onClick={() => load(page + 1)}>Next</button>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
