'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { useEffect, useState, useCallback } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function TablesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [tableCode, setTableCode] = useState('A2');
  const [tableName, setTableName] = useState('Table A2');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [density, setDensity] = useState<'compact' | 'normal' | 'large'>('normal');
  const { t } = useI18n();
  const customerBase = process.env.NEXT_PUBLIC_CUSTOMER_BASE || 'http://127.0.0.1:3001';
  const logoUrl = process.env.NEXT_PUBLIC_QR_LOGO_URL || '/logo-cafex.png';

  const LAYOUT = {
    A6: { cols: 1, rows: 1, qrMm: 24 },
    A5: { cols: 1, rows: 1, qrMm: 24 },
    A4: { cols: 3, rows: 4, qrMm: 24 },
  } as const;

  const densityScale = { compact: 0.8, normal: 1, large: 1.2 } as const;

  const buildPrintHtml = (cards: string, size: 'A6' | 'A5' | 'A4', cols: number, rows: number, qrMm: number, gapMm: number) => {
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
              gap: ${gapMm}mm;
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
  };

  const load = useCallback(async () => {
    try {
      const r = await adminApi.tables();
      setItems(r.items || []);
    } catch (e: any) {
      setError(e.message || 'Gagal load tables');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const printQr = async (row: any, size: 'A6' | 'A5') => {
    try {
      const { toDataURL } = await import('qrcode');
      const scale = densityScale[density];
      const qrMm = Math.round(LAYOUT[size].qrMm * scale);
      const gapMm = Math.max(2, Math.round(3 * scale));
      const qrSize = Math.round((size === 'A5' ? 320 : 240) * scale);
      const url = `${customerBase}/menu?tableToken=${encodeURIComponent(row.qr_token)}`;
      const dataUrl = await toDataURL(url, { margin: 1, width: qrSize });
      const w = window.open('', '_blank', `width=520,height=720`);
      if (!w) return;
      const brand = row.brand_color || process.env.NEXT_PUBLIC_BRAND_COLOR || '#632C0D';
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
      w.document.write(buildPrintHtml(card, size, 1, 1, qrMm, gapMm));
      w.document.close();
    } catch (e: any) {
      setError(e.message || 'Gagal generate QR');
    }
  };

  const filtered = items.filter((t) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return String(t.table_code || '').toLowerCase().includes(q) || String(t.table_name || '').toLowerCase().includes(q);
  });

  return (
    <RequireAuth>
      <AdminShell 
        title="QR Menu Terminal" 
        subtitle="Manage tables and generate premium QR table cards."
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Left: Management Panel */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[40px] p-8 border border-[#FDE68A] shadow-soft">
               <h3 className="text-xl font-black font-playfair-display-sc text-[#451A03] mb-6 uppercase tracking-tight">Register Table</h3>
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest block mb-2">Code</label>
                    <input 
                      value={tableCode} 
                      onChange={(e) => setTableCode(e.target.value)} 
                      className="w-full bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl py-4 px-6 text-sm font-bold text-[#451A03] outline-none focus:border-[#632C0D]" 
                      placeholder="e.g. A1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest block mb-2">Display Name</label>
                    <input 
                      value={tableName} 
                      onChange={(e) => setTableName(e.target.value)} 
                      className="w-full bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl py-4 px-6 text-sm font-bold text-[#451A03] outline-none focus:border-[#632C0D]" 
                      placeholder="e.g. Terrace A1"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                     <button 
                       onClick={() => setIsActive(!isActive)}
                       className={`w-12 h-6 rounded-full transition-all relative ${isActive ? 'bg-[#632C0D]' : 'bg-[#E5E7EB]'}`}
                     >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isActive ? 'right-1' : 'left-1'}`} />
                     </button>
                     <span className="text-xs font-bold text-[#451A03]">Table is Active</span>
                  </div>
                  <button 
                    onClick={async () => {
                      await adminApi.upsertTable({ table_code: tableCode, table_name: tableName, is_active: isActive, rotate_qr: true });
                      await load();
                    }}
                    className="w-full bg-[#632C0D] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg mt-6 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Generate Table
                  </button>
               </div>
            </div>

            <div className="bg-[#632C0D] rounded-[40px] p-8 text-white shadow-xl">
               <h3 className="text-xl font-black font-playfair-display-sc mb-4 uppercase tracking-tight">Bulk Actions</h3>
               <p className="text-xs text-white/60 mb-8 leading-relaxed">Select multiple tables to generate QR sheets in batch mode.</p>
               <div className="space-y-3">
                  <button onClick={() => setDensity('normal')} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${density === 'normal' ? 'bg-white text-[#632C0D] border-white' : 'border-white/20 text-white hover:border-white'}`}>Normal Density</button>
                  <button onClick={() => setDensity('compact')} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${density === 'compact' ? 'bg-white text-[#632C0D] border-white' : 'border-white/20 text-white hover:border-white'}`}>Compact QR</button>
               </div>
            </div>
          </div>

          {/* Right: Table Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[48px] p-10 border border-[#FDE68A] shadow-soft">
               <div className="flex justify-between items-center mb-10">
                  <div className="relative w-96">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
                    <input 
                      value={query} 
                      onChange={(e) => setQuery(e.target.value)} 
                      placeholder="Search tables..." 
                      className="w-full bg-[#FEF3C7] border border-[#FDE68A] rounded-full py-4 pl-14 pr-6 text-sm font-bold text-[#451A03] outline-none"
                    />
                  </div>
                  <div className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">
                     {filtered.length} Tables Registered
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-[#FDE68A]">
                           <th className="pb-6 text-[10px] font-black text-[#8B7355] uppercase tracking-widest">Status</th>
                           <th className="pb-6 text-[10px] font-black text-[#8B7355] uppercase tracking-widest">Table</th>
                           <th className="pb-6 text-[10px] font-black text-[#8B7355] uppercase tracking-widest">QR Token</th>
                           <th className="pb-6 text-[10px] font-black text-[#8B7355] uppercase tracking-widest text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#FDE68A]/50">
                        {filtered.map((row) => (
                           <tr key={row.id} className="group hover:bg-[#FEF3C7]/30 transition-colors">
                              <td className="py-6">
                                 <div className={`w-2 h-2 rounded-full ${row.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-400'}`} />
                              </td>
                              <td className="py-6">
                                 <p className="font-black text-[#451A03] font-playfair-display-sc text-lg leading-none">{row.table_code}</p>
                                 <p className="text-[10px] font-bold text-[#8B7355] mt-1">{row.table_name}</p>
                              </td>
                              <td className="py-6">
                                 <code className="text-[10px] font-bold text-[#92400E] bg-[#FEF3C7] px-3 py-1 rounded-lg border border-[#FDE68A]">
                                    {row.qr_token.slice(0, 8)}...
                                 </code>
                              </td>
                              <td className="py-6 text-right space-x-2">
                                 <button 
                                   onClick={() => printQr(row, 'A6')}
                                   className="px-6 py-2 bg-[#632C0D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
                                 >
                                    Print A6
                                 </button>
                                 <button 
                                   onClick={async () => {
                                      if (navigator?.clipboard) await navigator.clipboard.writeText(String(row.qr_token || ''));
                                   }}
                                   className="p-2 border border-[#FDE68A] text-[#8B7355] rounded-xl hover:bg-[#632C0D] hover:text-white transition-all"
                                 >
                                    📋
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>
      </AdminShell>
    </RequireAuth>
  );
}
