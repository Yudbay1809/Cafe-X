'use client';

import { AdminShell } from '@/components/AdminShell';
import { RequireAuth } from '@/components/RequireAuth';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { t } = useI18n();

  useEffect(() => { fetchRecentOrders(); fetchSummary(); }, []);

  const fetchSummary = async () => {
    try { const res = await adminApi.reportSummary(); setSummary(res); } catch (e) {}
  };

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

  return (
    <RequireAuth>
      <AdminShell title="Intelligence & Reports" subtitle="Deep insights into your enterprise sales and operational performance.">
        <div className="space-y-10">
          {/* Top KPI Section */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="sultan-kpi-card-active">
                  <p className="text-[10px] font-black text-[#FBBF24] uppercase tracking-[0.2em] mb-2">Total Sales Today</p>
                  <h2 className="text-4xl font-black font-playfair-display-sc">{formatRupiah(summary.sales_total || 0)}</h2>
                  <p className="text-[#E8D5B0] text-xs mt-4 font-bold">↑ 12% from yesterday</p>
               </div>
               <div className="sultan-kpi-card">
                  <p className="text-[10px] font-black text-[#92400E] uppercase tracking-[0.2em] mb-2">Total Orders</p>
                  <h2 className="text-4xl font-black font-playfair-display-sc text-[#451A03]">{summary.orders_count}</h2>
                  <p className="text-[#92400E] text-xs mt-4 font-bold">Across 8 Active Outlets</p>
               </div>
               <div className="sultan-kpi-card">
                  <p className="text-[10px] font-black text-[#92400E] uppercase tracking-[0.2em] mb-2">Current Active Shift</p>
                  <h2 className="text-4xl font-black font-playfair-display-sc text-[#451A03]">#1240</h2>
                  <button className="text-[#78350F] text-[10px] font-black uppercase tracking-widest mt-4 underline">View Shift Analytics</button>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             {/* Sales Export */}
             <div className="bg-white p-10 rounded-[40px] border border-[#FDE68A] shadow-soft space-y-8">
                <div className="flex justify-between items-center">
                   <h3 className="text-2xl font-black font-playfair-display-sc text-[#451A03] uppercase tracking-tight">Export Sales Data</h3>
                   <div className="w-12 h-12 bg-[#FEF3C7] rounded-2xl flex items-center justify-center text-xl">📊</div>
                </div>
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest px-2">From</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="sultan-input" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#8B7355] uppercase tracking-widest px-2">To</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="sultan-input" />
                      </div>
                   </div>
                   <button 
                    onClick={() => window.open(adminApi.exportSalesUrl(dateFrom, dateTo), '_blank')}
                    className="w-full bg-[#632C0D] text-white py-5 rounded-[20px] font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all"
                   >
                     Download CSV Report
                   </button>
                </div>
             </div>

             {/* Recent Transactions Table */}
             <div className="bg-white p-10 rounded-[40px] border border-[#FDE68A] shadow-soft space-y-8">
                <div className="flex justify-between items-center">
                   <h3 className="text-2xl font-black font-playfair-display-sc text-[#451A03] uppercase tracking-tight">Recent Orders</h3>
                   <button onClick={fetchRecentOrders} className="text-[#78350F] font-black text-[10px] uppercase tracking-widest hover:underline">Refresh</button>
                </div>
                <div className="overflow-hidden rounded-2xl border border-[#FDE68A]">
                   <table className="w-full text-left">
                      <thead className="bg-[#FEF3C7]/50">
                         <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Order #</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[#92400E] uppercase tracking-widest">Method</th>
                            <th className="px-6 py-4 text-[10px] font-black text-[#92400E] uppercase tracking-widest text-right">Total</th>
                            <th className="px-6 py-4"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FDE68A]">
                         {recentOrders.map(o => (
                            <tr key={o.id} className="hover:bg-[#FEF3C7]/20 transition-colors">
                               <td className="px-6 py-4 text-sm font-bold text-[#451A03]">{o.order_no}</td>
                               <td className="px-6 py-4">
                                  <span className="bg-[#632C0D] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                                     {o.payment_method || 'CASH'}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-sm font-black text-[#632C0D] text-right">{formatRupiah(o.total_amount)}</td>
                               <td className="px-6 py-4 text-right">
                                  <button onClick={() => viewOrderDetail(o)} className="text-[#78350F] text-[10px] font-black uppercase tracking-widest hover:underline">Details</button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>

        {/* Receipt Modal Redesign */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#451A03]/80 backdrop-blur-sm flex items-center justify-center z-[1000] p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-10 relative"
              >
                <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-[#451A03] font-black">✕</button>
                <div className="text-center space-y-2 mb-10">
                   <h2 className="text-3xl font-black font-playfair-display-sc text-[#451A03]">CAFE-X</h2>
                   <p className="text-[10px] font-black text-[#8B7355] uppercase tracking-[0.3em]">Imperial Receipt</p>
                </div>
                
                <div className="space-y-4 border-y border-dashed border-[#FDE68A] py-8 mb-8">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#8B7355]">
                      <span>Order Reference</span>
                      <span className="text-[#451A03]">{selectedOrder.order_no}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#8B7355]">
                      <span>Payment Method</span>
                      <span className="text-[#451A03]">{selectedOrder.payment_method?.toUpperCase() || 'CASH'}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#8B7355]">
                      <span>Date</span>
                      <span className="text-[#451A03]">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                   </div>
                </div>

                {loadingOrder ? (
                  <div className="py-20 text-center font-black text-[#78350F] animate-pulse">Retreiving Secure Records...</div>
                ) : orderDetail ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                       {orderDetail.items?.map((it: any) => (
                         <div key={it.id} className="flex justify-between items-start">
                            <div className="space-y-1">
                               <p className="text-sm font-black text-[#451A03]">{it.product_name}</p>
                               <p className="text-[10px] font-bold text-[#8B7355]">{it.qty} x {formatRupiah(it.price)}</p>
                            </div>
                            <span className="text-sm font-black text-[#451A03]">{formatRupiah(it.qty * it.price)}</span>
                         </div>
                       ))}
                    </div>
                    <div className="pt-6 border-t border-[#FDE68A] space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-[#451A03]">Total Amount</span>
                          <span className="text-2xl font-black font-playfair-display-sc text-[#632C0D]">{formatRupiah(selectedOrder.total_amount)}</span>
                       </div>
                    </div>
                  </div>
                ) : null}

                <button onClick={() => setSelectedOrder(null)} className="w-full mt-10 bg-[#FEF3C7] text-[#632C0D] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#632C0D] hover:text-white transition-all">Close Records</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AdminShell>
    </RequireAuth>
  );
}
