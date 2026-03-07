'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

export default function TablesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [tableCode, setTableCode] = useState('A2');
  const [tableName, setTableName] = useState('Table A2');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { t } = useI18n();
  const customerBase = process.env.NEXT_PUBLIC_CUSTOMER_BASE || 'http://127.0.0.1:3001';
  const logoUrl = process.env.NEXT_PUBLIC_QR_LOGO_URL || '/logo-cafex.png';

  const LAYOUT = {
    A6: { cols: 2, rows: 2, qrMm: 24 },
    A5: { cols: 2, rows: 3, qrMm: 24 },
    A4: { cols: 3, rows: 4, qrMm: 24 },
  } as const;

  function buildPrintHtml(cards: string, size: 'A6' | 'A5' | 'A4', cols: number, rows: number, qrMm: number) {
    return `
      <html>
        <head>
          <title>QR Print</title>
          <style>
            @page { size: ${size}; margin: 6mm; }
            body { font-family: Arial, sans-serif; text-align: center; padding: 0; margin: 0; }
            .sheet { width: 100%; min-height: 100%; }
            .grid {
              display: grid;
              grid-template-columns: repeat(${cols}, min-content);
              grid-auto-rows: min-content;
              gap: 3mm;
              justify-content: center;
              align-content: start;
            }
            .box { border: 1.6px solid var(--brand); padding: 3mm; border-radius: 6mm; width: fit-content; height: fit-content; position: relative; box-sizing: border-box; margin: 0 auto; }
            .banner { position: absolute; top: -4mm; left: 50%; transform: translateX(-50%); background: var(--brand); color: #fff; padding: 1.6mm 4mm; border-radius: 999px; font-weight: 700; font-size: 2.2mm; letter-spacing: 0.12em; }
            .qr-wrap { position: relative; display: inline-block; margin-top: 2mm; }
            .qr { width: ${qrMm}mm; height: ${qrMm}mm; }
            .logo {
              position: absolute;
              width: ${Math.round(qrMm * 0.3)}mm;
              height: ${Math.round(qrMm * 0.3)}mm;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              border-radius: 12px;
              background: #fff;
              padding: 1.2mm;
              box-shadow: 0 6px 16px rgba(0,0,0,0.12);
            }
            .meta { margin-top: 1.5mm; font-size: 2mm; color: #555; word-break: break-all; }
            .title { font-size: 3mm; margin: 0 0 0.8mm; }
            .instruction { margin-top: 0.6mm; font-size: 2mm; color: #444; }
            .page-break { page-break-after: always; }
          </style>
        </head>
        <body>
          ${cards}
          <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };</script>
        </body>
      </html>
    `;
  }

  async function printQr(row: any, size: 'A6' | 'A5') {
    try {
      const { toDataURL } = await import('qrcode');
      const qrSize = size === 'A5' ? 320 : 240;
      const url = `${customerBase}/menu?tableToken=${encodeURIComponent(row.qr_token)}`;
      const dataUrl = await toDataURL(url, { margin: 1, width: qrSize });
      const w = window.open('', '_blank', `width=520,height=720`);
      if (!w) return;
      const brand = row.brand_color || process.env.NEXT_PUBLIC_BRAND_COLOR || '#0f766e';
      const footer = `${row.brand_name || 'Cafe-X'} - ${row.contact_phone || '-'}`;
      const card = `
        <div class="sheet">
          <div class="box" style="--brand: ${brand}">
            <div class="banner">${t('scanMe')}</div>
            <div class="title">${row.table_name} (${row.table_code})</div>
            <div class="qr-wrap">
              <img class="qr" src="${dataUrl}" />
              <img class="logo" src="${logoUrl}" />
            </div>
            <div class="instruction">${t('scanInstruction')}</div>
            <div class="meta">${url}</div>
            <div class="meta">${t('footerLabel')}: ${footer}</div>
          </div>
        </div>
      `;
      w.document.write(buildPrintHtml(card, size, 1, 1, LAYOUT[size].qrMm));
      w.document.close();
    } catch (e: any) {
      setError(e.message || 'Gagal generate QR');
    }
  }

  async function bulkPrint(size: 'A6' | 'A5') {
    try {
      const { toDataURL } = await import('qrcode');
      const cards: string[] = [];
      for (const row of items) {
        const url = `${customerBase}/menu?tableToken=${encodeURIComponent(row.qr_token)}`;
        const dataUrl = await toDataURL(url, { margin: 1, width: 240 });
        const brand = row.brand_color || process.env.NEXT_PUBLIC_BRAND_COLOR || '#0f766e';
        const footer = `${row.brand_name || 'Cafe-X'} - ${row.contact_phone || '-'}`;
        cards.push(`
          <div class="sheet page-break">
            <div class="box" style="--brand: ${brand}">
              <div class="banner">${t('scanMe')}</div>
              <div class="title">${row.table_name} (${row.table_code})</div>
              <div class="qr-wrap">
                <img class="qr" src="${dataUrl}" />
                <img class="logo" src="${logoUrl}" />
              </div>
              <div class="instruction">${t('scanInstruction')}</div>
              <div class="meta">${url}</div>
              <div class="meta">${t('footerLabel')}: ${footer}</div>
            </div>
          </div>
        `);
      }
      const w = window.open('', '_blank', `width=520,height=720`);
      if (!w) return;
      w.document.write(buildPrintHtml(cards.join(''), size, 1, 1, LAYOUT[size].qrMm));
      w.document.close();
    } catch (e: any) {
      setError(e.message || 'Gagal bulk print');
    }
  }

  async function batchPrint(size: 'A6' | 'A5' | 'A4') {
    try {
      const { toDataURL } = await import('qrcode');
      const cards: string[] = [];
      const selected = items.filter((row) => selectedIds.includes(row.id));
      if (selected.length === 0) {
        setError('Pilih meja untuk batch terlebih dahulu');
        return;
      }
      for (const row of selected) {
        const url = `${customerBase}/menu?tableToken=${encodeURIComponent(row.qr_token)}`;
        const dataUrl = await toDataURL(url, { margin: 1, width: 240 });
        const brand = row.brand_color || process.env.NEXT_PUBLIC_BRAND_COLOR || '#0f766e';
        const footer = `${row.brand_name || 'Cafe-X'} - ${row.contact_phone || '-'}`;
        cards.push(`
          <div class="box" style="--brand: ${brand}">
            <div class="banner">${t('scanMe')}</div>
            <div class="title">${row.table_name} (${row.table_code})</div>
            <div class="qr-wrap">
              <img class="qr" src="${dataUrl}" />
              <img class="logo" src="${logoUrl}" />
            </div>
            <div class="instruction">${t('scanInstruction')}</div>
            <div class="meta">${url}</div>
            <div class="meta">${t('footerLabel')}: ${footer}</div>
          </div>
        `);
      }
      const { cols, rows, qrMm } = LAYOUT[size];
      const perPage = cols * rows;
      const pages: string[] = [];
      for (let i = 0; i < cards.length; i += perPage) {
        const chunk = cards.slice(i, i + perPage);
        pages.push(`
          <div class="sheet page-break">
            <div class="grid">
              ${chunk.join('')}
            </div>
          </div>
        `);
      }
      const w = window.open('', '_blank', `width=720,height=960`);
      if (!w) return;
      w.document.write(buildPrintHtml(pages.join(''), size, cols, rows, qrMm));
      w.document.close();
    } catch (e: any) {
      setError(e.message || 'Gagal batch print A4');
    }
  }

  async function load() {
    try {
      const r = await adminApi.tables();
      setItems(r.items);
    } catch (e: any) {
      setError(e.message || 'Gagal load tables');
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = items.filter((t) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return String(t.table_code || '').toLowerCase().includes(q) || String(t.table_name || '').toLowerCase().includes(q);
  });

  return (
    <RequireAuth>
      <AdminShell
        title={t('tables')}
        subtitle={t('tablesSubtitle')}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn outline" onClick={() => bulkPrint('A6')}>{t('bulkPrintA6')}</button>
            <button className="btn outline" onClick={() => bulkPrint('A5')}>{t('bulkPrintA5')}</button>
            <button className="btn outline" onClick={() => batchPrint('A6')}>{t('batchPrintA6')}</button>
            <button className="btn outline" onClick={() => batchPrint('A5')}>{t('batchPrintA5')}</button>
            <button className="btn outline" onClick={() => batchPrint('A4')}>{t('batchPrintA4')}</button>
            <button className="btn outline" onClick={() => setSelectedIds([])}>{t('clearSelection')}</button>
            <button className="btn" onClick={load}>{t('refresh')}</button>
          </div>
        }
      >
        <div className="grid2">
          <div className="card">
            <h3>{t('tables')}</h3>
            <div className="grid2">
              <input value={tableCode} onChange={(e) => setTableCode(e.target.value)} placeholder={t('code')} />
              <input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder={t('name')} />
            </div>
            <div style={{ marginTop: 10 }} className="grid2">
              <label className="small">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: 16, height: 16, marginRight: 8 }}
                />
                {t('active')}
              </label>
              <button
                className="btn"
                onClick={async () => {
                  await adminApi.upsertTable({ table_code: tableCode, table_name: tableName, is_active: isActive, rotate_qr: true });
                  await load();
                }}
              >
                {t('rotateQr')}
              </button>
            </div>
            <p className="small">{t('noteRotate')}</p>
            {error ? <div className="small">{error}</div> : null}
          </div>
          <div className="card">
            <h3>{t('searchTable')}</h3>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchTable')} />
            <div style={{ height: 10 }} />
            <div className="small">{t('totalTables')}: {filtered.length}</div>
          </div>
        </div>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>{t('selectBatch')}</th>
                <th>{t('code')}</th>
                <th>{t('name')}</th>
                <th>{t('status')}</th>
                <th>QR Token</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selectedIds, row.id]
                          : selectedIds.filter((id) => id !== row.id);
                        setSelectedIds(next);
                      }}
                    />
                  </td>
                  <td><b>{row.table_code}</b></td>
                  <td>{row.table_name}</td>
                  <td>
                    <span className={row.is_active ? 'pill success' : 'pill danger'}>
                      {row.is_active ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="small">{row.qr_token}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        className="btn outline"
                        onClick={async () => {
                          await adminApi.upsertTable({ table_code: row.table_code, table_name: row.table_name, is_active: row.is_active, rotate_qr: true });
                          await load();
                        }}
                      >
                        {t('rotateQr')}
                      </button>
                      <button
                        className="btn ghost"
                        onClick={async () => {
                          await adminApi.upsertTable({ table_code: row.table_code, table_name: row.table_name, is_active: !row.is_active });
                          await load();
                        }}
                      >
                        {row.is_active ? t('inactive') : t('active')}
                      </button>
                      <button
                        className="btn outline"
                        onClick={async () => {
                          if (navigator?.clipboard) await navigator.clipboard.writeText(String(row.qr_token || ''));
                        }}
                      >
                        {t('copyToken')}
                      </button>
                      <button
                        className="btn"
                        onClick={() => printQr(row, 'A6')}
                      >
                        {t('printQrA6')}
                      </button>
                      <button
                        className="btn outline"
                        onClick={() => printQr(row, 'A5')}
                      >
                        {t('printQrA5')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
