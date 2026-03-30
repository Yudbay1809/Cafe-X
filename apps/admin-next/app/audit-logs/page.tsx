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
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('created')}</th>
                <th>{t('action')}</th>
                <th>Actor</th>
                <th>Entity</th>
                <th>Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td className="small">{log.created_at}</td>
                  <td>{log.event_type}</td>
                  <td>{log.actor}</td>
                  <td>{log.entity_type || '-'}</td>
                  <td>{log.entity_id || '-'}</td>
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
