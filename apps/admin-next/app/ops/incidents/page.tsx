'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function IncidentReportPage() {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('low');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState('');

  return (
    <RequireAuth>
      <AdminShell title={t('incidentReport')} subtitle={t('incidentReportSubtitle')}>
        <div className="card">
          <div className="grid2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul incident" />
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div style={{ height: 10 }} />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Deskripsi singkat" rows={5} />
          <div style={{ height: 10 }} />
          <button className="btn" onClick={() => setStatus('Reported')}>{t('submitIncident')}</button>
          {status ? <div className="small" style={{ marginTop: 8 }}>Status: {status}</div> : null}
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
