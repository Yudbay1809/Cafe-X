'use client';

import { cartApi } from '@/features/cart/api/cartApi';
import { getSession } from '@/lib/session';
import { formatRupiah } from '@/lib/money';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { getEcho } from '@/services/echo';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderStatusPage() {
  const search = useSearchParams();
  const tableToken = search.get('tableToken') || '';
  const orderId = Number(search.get('orderId') || 0);
  const [status, setStatus] = useState('loading');
  const [order, setOrder] = useState<any>(null);
  const [lastOkAt, setLastOkAt] = useState<string>('');
  const session = getSession();
  const router = useRouter();

  const refresh = useCallback(async () => {
    if (!tableToken || !orderId) return;
    try {
      const response = await cartApi.getOrderStatus(tableToken, orderId);
      const r = response.data;
      setStatus(r.data.status);
      setOrder(r.data);
      setLastOkAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Failed to refresh order status', e);
      setStatus('error');
    }
  }, [tableToken, orderId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!orderId) return;
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel(`order.${orderId}`)
      .listen('.order.updated', refresh)
      .listen('.order.paid', refresh)
      .listen('.order.cancelled', refresh);

    return () => {
      channel.stopListening('.order.updated');
      channel.stopListening('.order.paid');
      channel.stopListening('.order.cancelled');
    };
  }, [orderId, refresh]);

  const steps = ['new', 'preparing', 'ready', 'served'];
  const statusIndex = steps.indexOf(status);
  
  const statusConfig: Record<string, { label: string, icon: string, desc: string }> = {
    loading: { label: 'Memuat', icon: '⏳', desc: 'Sabar ya Sultan...' },
    new: { label: 'DITERIMA', icon: '✅', desc: 'Pesanan Sultan sedang dikonfirmasi.' },
    preparing: { label: 'DIPROSES', icon: '☕', desc: 'Barista sedang meracik mahakarya Sultan.' },
    ready: { label: 'SIAP', icon: '✨', desc: 'Pesanan siap! Silakan ambil di bar.' },
    served: { label: 'DIANTAR', icon: '🛵', desc: 'Pesanan Sultan telah sampai di meja.' },
    paid: { label: 'SELESAI', icon: '💎', desc: 'Terima kasih atas kunjungannya, Sultan.' },
    canceled: { label: 'BATAL', icon: '❌', desc: 'Maaf, pesanan telah dibatalkan.' },
    error: { label: 'GANGGUAN', icon: '⚠️', desc: 'Koneksi terputus, mencoba lagi...' },
  };

  const current = statusConfig[status] || statusConfig.loading;

  return (
    <div className="min-h-screen bg-[#070710] text-white p-6 font-karla">
      {/* --- SULTAN HEADER --- */}
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-2xl font-black font-playfair-display-sc text-[#FBBF24] tracking-widest">CAFE·X</h1>
        <button 
          onClick={() => router.push(`/menu?tableToken=${encodeURIComponent(tableToken)}`)}
          className="w-10 h-10 rounded-full bg-[#1A160F] border border-[#3D3320] flex items-center justify-center text-[#FBBF24]"
        >
          ✕
        </button>
      </header>

      {/* --- STATUS HERO --- */}
      <div className="flex flex-col items-center text-center gap-6 mb-12">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-8xl"
        >
          {current.icon}
        </motion.div>
        
        <div className="space-y-2">
          <motion.h2 
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black font-playfair-display-sc text-[#FBBF24] tracking-tight"
          >
            {current.label}
          </motion.h2>
          <p className="text-[#8B7355] font-medium">{current.desc}</p>
        </div>
        
        <div className="text-[10px] font-black text-[#FBBF24]/40 uppercase tracking-[0.4em] bg-[#1A160F] px-4 py-1 rounded-full border border-[#3D3320]">
           ORDER #{orderId}
        </div>
      </div>

      {/* --- PROGRESS SULTAN --- */}
      <div className="flex gap-2 mb-12">
         {steps.map((s, idx) => (
           <div 
             key={s}
             className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
               idx <= statusIndex ? 'bg-[#FBBF24] shadow-glow-gold' : 'bg-[#1A160F]'
             }`}
           />
         ))}
      </div>

      {/* --- ORDER SUMMARY PANEL --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A160F] rounded-[40px] p-8 border border-[#3D3320] shadow-xl"
      >
         <h3 className="text-xs font-black text-[#8B7355] uppercase tracking-widest mb-6">Order Summary</h3>
         
         {order?.items?.map((item: any) => (
           <div key={item.id} className="flex justify-between items-center mb-4">
              <span className="font-bold text-white">{item.qty}x {item.nama_menu}</span>
              <span className="font-bold text-[#8B7355]">{formatRupiah(item.harga * item.qty)}</span>
           </div>
         ))}

         <div className="mt-8 pt-8 border-t border-[#3D3320] flex justify-between items-center">
            <span className="text-sm font-black text-[#FBBF24] uppercase tracking-widest">Total Paid</span>
            <span className="text-2xl font-black text-[#FBBF24] font-playfair-display-sc">
              {order ? formatRupiah(order.total_amount) : '-'}
            </span>
         </div>
      </motion.div>

      {/* --- LOYALTY INSIGHT --- */}
      {status === 'paid' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 bg-gradient-to-br from-[#632C0D] to-[#451A03] p-8 rounded-[40px] border border-[#FBBF24]/20 relative overflow-hidden"
        >
           <div className="relative z-10">
              <h4 className="text-[#FBBF24] font-black uppercase tracking-widest text-[10px] mb-2">Loyalty Reward</h4>
              <p className="text-2xl font-black text-white font-playfair-display-sc">
                +{Math.floor((order?.total_amount || 0) / 1000)} Points
              </p>
              <p className="text-[#8B7355] text-xs mt-2">Points added to your Sultan account.</p>
           </div>
           <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 grayscale">💎</div>
        </motion.div>
      )}

      {/* --- FOOTER --- */}
      <div className="mt-12 text-center text-[10px] font-black text-[#3D3320] uppercase tracking-widest">
         Update Terakhir: {lastOkAt || '---'}
      </div>
    </div>
  );
}
