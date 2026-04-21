'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { formatRupiah } from '@/lib/money';

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State for New PO
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [posRes, supRes, ingRes] = await Promise.all([
        adminApi.purchaseOrders(),
        adminApi.suppliers(),
        adminApi.productsList({ category: 'ingredient' }) // Assuming ingredients are filtered this way or use a specific endpoint
      ]);
      
      // If productsList doesn't return specifically ingredients, we might need to use the ingredient endpoint
      // Let's assume we have an endpoint for ingredients or productsList works. 
      // Actually, looking at routes, we have /inventory/ingredients
      const rawIngredients = await fetch('http://127.0.0.1:9000/api/v1/inventory/ingredients', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('cafe_admin_session') ? JSON.parse(localStorage.getItem('cafe_admin_session')!).token : ''}` }
      }).then(r => r.json()).then(j => j.data || []);

      setPos(posRes.items);
      setSuppliers(supRes.items);
      setIngredients(rawIngredients);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setItems([...items, { ingredient_id: '', qty: 1, unit_price: 0 }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSupplier || items.length === 0) return alert('Pilih supplier dan minimal 1 item');

    try {
      await adminApi.poCreate({
        supplier_id: parseInt(selectedSupplier),
        items: items.map(it => ({
            ...it,
            ingredient_id: parseInt(it.ingredient_id),
            qty: parseFloat(it.qty),
            unit_price: parseFloat(it.unit_price)
        }))
      });
      setShowModal(false);
      setItems([]);
      loadData();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal membuat PO');
    }
  }

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Kelola pemesanan bahan baku ke supplier.</p>
        </div>
        <button 
          onClick={() => { setShowModal(true); setItems([{ ingredient_id: '', qty: 1, unit_price: 0 }]); }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90"
        >
          + PO Baru
        </button>
      </header>

      {loading ? (
        <div className="bg-white p-8 border rounded-xl text-center">Loading POs...</div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b text-xs uppercase font-semibold text-slate-500">
                <th className="px-6 py-4">PO No.</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pos.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => {/* navigate to detail */}}>
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">{p.po_no}</td>
                  <td className="px-6 py-4">{p.supplier_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'received' ? 'bg-green-100 text-green-700' : 
                      p.status === 'draft' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{formatRupiah(p.total_amount)}</td>
                  <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
              {pos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Belum ada Purchase Order.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <header className="p-6 border-b">
              <h2 className="text-xl font-bold">Buat Purchase Order Baru</h2>
            </header>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Pilih Supplier*</label>
                <select 
                   required
                   value={selectedSupplier}
                   onChange={(e) => setSelectedSupplier(e.target.value)}
                   className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">Item Pesanan</h3>
                  <button type="button" onClick={addItem} className="text-primary text-sm font-bold">+ Tambah Item</button>
                </div>
                
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-3 rounded-lg border">
                    <div className="col-span-5 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Ingredient</label>
                      <select 
                        required
                        value={item.ingredient_id}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].ingredient_id = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full border rounded px-2 py-1 text-sm text-slate-700 bg-white"
                      >
                        <option value="">Pilih...</option>
                        {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                      </select>
                    </div>
                    <div className="col-span-3 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Qty</label>
                      <input 
                        type="number" step="0.01" required
                        value={item.qty}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].qty = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full border rounded px-2 py-1 text-sm text-slate-700 bg-white"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Harga Satuan</label>
                      <input 
                        type="number" required
                        value={item.unit_price}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].unit_price = e.target.value;
                          setItems(newItems);
                        }}
                        className="w-full border rounded px-2 py-1 text-sm text-slate-700 bg-white"
                      />
                    </div>
                    <div className="col-span-1">
                       <button type="button" onClick={() => removeItem(index)} className="text-red-500 mb-1">×</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium">Batal</button>
                <button type="submit" className="bg-primary text-primary-foreground px-8 py-2 rounded-lg font-bold">Simpan PO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
