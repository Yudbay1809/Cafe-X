'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function BackupSchedulerPage() {
  const { t } = useI18n();
  const [cron, setCron] = useState('0 2 * * *');
  const [retentionDays, setRetentionDays] = useState(14);
  const [status, setStatus] = useState('Idle');

  return (
    <RequireAuth>
      <AdminShell title={t('backupScheduler')} subtitle={t('backupSchedulerSubtitle')}>
        <div className="card">
          <div className="grid2">
            <div>
              <div className="small">Cron</div>
              <input value={cron} onChange={(e) => setCron(e.target.value)} placeholder="0 2 * * *" />
            </div>
            <div>
              <div className="small">Retention (days)</div>
              <input type="number" value={retentionDays} onChange={(e) => setRetentionDays(Number(e.target.value))} />
            </div>
          </div>
          <div style={{ height: 12 }} />
          <div className="toolbar">
            <button className="btn" onClick={() => setStatus('Saved')}>{t('save')}</button>
            <button className="btn outline" onClick={() => setStatus('Trigger backup')}>{t('runBackupNow')}</button>
          </div>
          <div className="small" style={{ marginTop: 8 }}>Status: {status}</div>
        </div>
        <div className="card">
          <h3>{t('backupNotes')}</h3>
          <div className="small">Runbook: docs/ops/backup-restore-runbook.md</div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
