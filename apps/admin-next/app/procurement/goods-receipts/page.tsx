'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';

export default function GoodsReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedPO, setSelectedPO] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [grRes, poRes] = await Promise.all([
        adminApi.goodsReceipts(),
        adminApi.purchaseOrders('sent') // Only show sent POs to receive
      ]);
      setReceipts(grRes.items);
      setPos(poRes.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handlePOChange(poId: string) {
    setSelectedPO(poId);
    if (!poId) {
        setItems([]);
        return;
    }
    try {
        const detail = await adminApi.poDetail(parseInt(poId));
        setItems(detail.items.map(it => ({
            ingredient_id: it.ingredient_id,
            ingredient_name: it.ingredient_name_snapshot,
            qty_ordered: it.qty,
            qty_received: it.qty, // Default to full receive
            unit: it.unit,
            unit_price: it.unit_price
        })));
    } catch (e) {
        console.error(e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return alert('Tidak ada item untuk diterima');

    try {
        await adminApi.grCreate({
            purchase_order_id: selectedPO ? parseInt(selectedPO) : null,
            received_date: new Date().toISOString().split('T')[0],
            notes,
            items: items.map(it => ({
                ingredient_id: it.ingredient_id,
                qty_received: parseFloat(it.qty_received),
                qty_ordered: parseFloat(it.qty_ordered),
                unit: it.unit,
                unit_price: it.unit_price
            }))
        });
        setShowModal(false);
        setSelectedPO('');
        setItems([]);
        loadData();
        alert('Barang berhasil diterima & Stok diperbarui!');
    } catch (e) {
        alert(e instanceof Error ? e.message : 'Gagal memproses penerimaan');
    }
  }

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Penerimaan Barang (GR)</h1>
          <p className="text-muted-foreground">Catat kiriman barang masuk dan update stok otomatis.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
        >
          + Terima Barang
        </button>
      </header>

      {loading ? (
        <div className="bg-white p-8 border rounded-xl text-center">Loading receipts...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b text-xs uppercase font-semibold text-slate-500">
                <th className="px-6 py-4">GR No.</th>
                <th className="px-6 py-4">Ref. PO</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Diterima Oleh</th>
                <th className="px-6 py-4 text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {receipts.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono font-bold">{r.gr_no}</td>
                  <td className="px-6 py-4 text-blue-600">{r.po_no || '-'}</td>
                  <td className="px-6 py-4">{r.supplier_name || '-'}</td>
                  <td className="px-6 py-4 text-sm">{r.received_by}</td>
                  <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                    {new Date(r.received_date).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <header className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold">Penerimaan Barang Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </header>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-sm font-semibold">Referensi PO (Opsional)</label>
                    <select 
                        value={selectedPO}
                        onChange={(e) => handlePOChange(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 bg-white"
                    >
                        <option value="">-- Penerimaan Tanpa PO --</option>
                        {pos.map(p => <option key={p.id} value={p.id}>{p.po_no} ({p.supplier_name})</option>)}
                    </select>
                    <p className="text-[10px] text-muted-foreground italic">*Pilih PO untuk mengisi item otomatis</p>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold">Catatan</label>
                    <input 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Barang sesuai pesanan"
                        className="w-full border rounded-lg px-3 py-2"
                    />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold flex justify-between">
                    <span>Item yang Diterima</span>
                    <span className="text-xs text-muted-foreground font-normal">Stok akan bertambah otomatis setelah disimpan</span>
                </h3>
                <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500">
                            <tr>
                                <th className="px-4 py-2">Ingredient</th>
                                <th className="px-4 py-2">Pesan (PO)</th>
                                <th className="px-4 py-2">Diterima Sekarang</th>
                                <th className="px-4 py-2">Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {items.map((it, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3 font-medium">{it.ingredient_name}</td>
                                    <td className="px-4 py-3 text-slate-400">{it.qty_ordered}</td>
                                    <td className="px-4 py-3">
                                        <input 
                                            type="number" step="0.01" required
                                            value={it.qty_received}
                                            onChange={(e) => {
                                                const newItems = [...items];
                                                newItems[idx].qty_received = e.target.value;
                                                setItems(newItems);
                                            }}
                                            className="w-24 border rounded px-2 py-1 bg-yellow-50 focus:bg-white transition"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-xs font-semibold">{it.unit}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic text-xs">Pilih PO atau tambahkan item manual...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t font-semibold">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="bg-green-600 text-white px-10 py-2 rounded-lg shadow-lg hover:shadow-green-200 transition">
                    Simpan Penerimaan & Tambah Stok
                </button>
              </div>
            </form>
           </div>
        </div>
      )}
    </div>
  );
}
