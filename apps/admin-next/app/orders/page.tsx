'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';
import { useEffect, useState, useCallback } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { getEcho } from '@/services/echo';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersPage() {
  const [orderId, setOrderId] = useState(0);
  const [detail, setDetail] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const { t } = useI18n();

  const load = useCallback(async (nextPage = page) => {
    try {
      setError('');
      const r = await adminApi.ordersList({
        status: status === 'all' ? undefined : status,
        q: query || undefined,
        limit,
        page: nextPage,
      });
      setItems(r.items || []);
      setTotal(r.total ?? r.items?.length ?? 0);
    } catch (e: any) {
      setError(e.message || 'Gagal load orders');
    }
  }, [page, status, query, limit]);

  useEffect(() => { load(page); }, [page, load]);

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;
    const channel = echo.channel('orders')
      .listen('.order.placed', (e: any) => { if (page === 1) load(1); })
      .listen('.order.updated', (e: any) => { load(page); })
      .listen('.order.paid', (e: any) => { load(page); });
    return () => {
      channel.stopListening('.order.placed');
      channel.stopListening('.order.updated');
      channel.stopListening('.order.paid');
    };
  }, [page, load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await adminApi.orderStatus(id, newStatus);
      await load();
    } catch (e) {}
  };

  return (
    <RequireAuth>
      <AdminShell title="Command & Control" subtitle="Live stream of premium orders across all global outlets.">
        <div className="space-y-10">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'new', 'preparing', 'ready', 'served', 'paid'].map(s => (
                  <button 
                    key={s}
                    onClick={() => { setStatus(s); setPage(1); }}
                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      status === s ? 'bg-[#632C0D] text-white shadow-xl' : 'bg-white text-[#8B7355] border border-[#FDE68A]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
             </div>
             <div className="relative w-full md:w-80">
                <input 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Order ID or Table..." 
                  className="sultan-input !rounded-full pl-12"
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2">🔍</span>
             </div>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {items.map((o) => (
                <motion.div 
                  key={o.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[40px] border border-[#FDE68A] shadow-soft overflow-hidden flex flex-col"
                >
                  <div className="p-8 border-b border-[#FDE68A] flex justify-between items-start">
                     <div>
                        <p className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest mb-1">Order Ref</p>
                        <h4 className="text-xl font-black font-playfair-display-sc text-[#451A03]">#{o.id} <span className="text-xs text-[#92400E]">({o.order_no})</span></h4>
                     </div>
                     <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        o.status === 'new' ? 'bg-[#FBBF24] text-[#451A03]' :
                        o.status === 'preparing' ? 'bg-[#78350F] text-white' :
                        o.status === 'ready' ? 'bg-[#10B981] text-white' :
                        'bg-[#FEF3C7] text-[#78350F]'
                     }`}>
                        {o.status}
                     </span>
                  </div>
                  <div className="p-8 flex-1 space-y-4">
                     <div className="flex justify-between items-center">
                        <div>
                           <p className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">Table</p>
                           <p className="font-black text-[#451A03]">{o.table_code || 'Takeaway'}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest">Amount</p>
                           <p className="font-black text-[#632C0D] text-lg">{formatRupiah(o.total_amount)}</p>
                        </div>
                     </div>
                  </div>
                  <div className="p-4 bg-[#FEF3C7]/20 flex gap-2">
                     <button 
                      onClick={async () => { setOrderId(o.id); setDetail(await adminApi.orderDetail(o.id)); setDetailOpen(true); }}
                      className="flex-1 py-3 bg-white border border-[#FDE68A] text-[#78350F] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FEF3C7] transition-all"
                     >
                       Details
                     </button>
                     {o.status === 'new' && (
                       <button 
                        onClick={() => updateStatus(o.id, 'preparing')}
                        className="flex-1 py-3 bg-[#78350F] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#632C0D] transition-all"
                       >
                         Start Prep
                       </button>
                     )}
                     {o.status === 'preparing' && (
                       <button 
                        onClick={() => updateStatus(o.id, 'ready')}
                        className="flex-1 py-3 bg-[#10B981] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#059669] transition-all"
                       >
                         Ready
                       </button>
                     )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-6 pt-10">
             <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="w-12 h-12 bg-white border border-[#FDE68A] rounded-2xl flex items-center justify-center text-[#78350F] disabled:opacity-30">←</button>
             <span className="font-black text-[#451A03] text-sm uppercase tracking-widest">Page {page} / {totalPages}</span>
             <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="w-12 h-12 bg-white border border-[#FDE68A] rounded-2xl flex items-center justify-center text-[#78350F] disabled:opacity-30">→</button>
          </div>
        </div>

        {/* Order Detail Modal */}
        <AnimatePresence>
          {detailOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#451A03]/80 backdrop-blur-md flex items-center justify-center z-[1000] p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-10 relative overflow-hidden"
              >
                <button onClick={() => setDetailOpen(false)} className="absolute top-8 right-8 text-[#451A03] font-black">✕</button>
                <h3 className="text-3xl font-black font-playfair-display-sc text-[#451A03] mb-8 uppercase tracking-tight">Order Details #{detail?.order?.id || orderId}</h3>
                
                {detail && (
                  <div className="space-y-8">
                     <div className="grid grid-cols-2 gap-8 py-6 border-y border-dashed border-[#FDE68A]">
                        <div>
                           <p className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest mb-1">Customer Info</p>
                           <p className="font-black text-[#451A03]">{detail.order?.order_no}</p>
                           <p className="text-xs text-[#92400E]">{detail.order?.table_code ? `Table ${detail.order.table_code}` : 'Takeaway'}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest mb-1">Order Status</p>
                           <p className="font-black text-[#632C0D] uppercase">{detail.order?.status}</p>
                        </div>
                     </div>
                     <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                        {detail.items?.map((it: any) => (
                          <div key={it.id} className="flex justify-between items-center py-4 border-b border-[#FEF3C7]">
                             <div className="space-y-1">
                                <p className="font-black text-[#451A03]">{it.product_name_snapshot}</p>
                                <p className="text-[10px] font-bold text-[#8B7355]">{it.qty} x {formatRupiah(it.unit_price || 0)}</p>
                             </div>
                             <span className="font-black text-[#451A03]">{formatRupiah(it.qty * it.unit_price)}</span>
                          </div>
                        ))}
                     </div>
                     <div className="flex justify-between items-center pt-4">
                        <span className="text-sm font-black text-[#8B7355] uppercase tracking-widest">Total Transaction</span>
                        <span className="text-3xl font-black font-playfair-display-sc text-[#632C0D]">{formatRupiah(detail.order?.total_amount || 0)}</span>
                     </div>
                  </div>
                )}
                <button onClick={() => setDetailOpen(false)} className="w-full mt-10 bg-[#FEF3C7] text-[#632C0D] py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#632C0D] hover:text-white transition-all">Close</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AdminShell>
    </RequireAuth>
  );
}
