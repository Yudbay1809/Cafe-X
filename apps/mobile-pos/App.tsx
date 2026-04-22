import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { initDatabase, getDb } from './lib/db';
import { usePosStore } from './store/posStore';
import axios from 'axios';

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'register' | 'online' | 'expenses' | 'dashboard' | 'history' | 'kds'>('register');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedItemForNote, setSelectedItemForNote] = useState<any>(null);
  const [tempNote, setTempNote] = useState('');
  const [shiftSummary, setShiftSummary] = useState<any>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const { 
    cart, addToCart, removeFromCart, checkout, 
    isShiftOpen, openShift, closeShift,
    paymentMethod, setPaymentMethod,
    onlineOrders, fetchOnlineOrders,
    transactions, fetchTransactions,
    addExpense, searchQuery, setSearchQuery,
    activeCategoryId, setActiveCategory,
    discount, setDiscount,
    taxPct, memberId, setMemberId,
    updateItemNote, getShiftSummary, settlement,
    reprintReceipt, updateOrderStatus
  } = usePosStore();

  useEffect(() => {
    async function start() {
      try {
        await initDatabase();
        try {
          const res = await axios.get('http://localhost:9000/api/v1/sync/master');
          if (res.data.success) {
            setProducts(res.data.data.products);
            setCategories([{ id: null, name: 'All' }, ...res.data.data.categories]);
          }
        } catch (e) {
          const db = await getDb();
          setProducts(await db.getAllAsync('SELECT * FROM products'));
        }
        fetchTransactions();
      } catch (e: any) { setErrorMsg(e.message); }
    }
    start();

    const interval = setInterval(() => { if (isShiftOpen) fetchOnlineOrders(); }, 30000);
    return () => clearInterval(interval);
  }, [isShiftOpen]);

  useEffect(() => {
    if (activeTab === 'dashboard') { getShiftSummary().then(setShiftSummary); }
    if (activeTab === 'history') { fetchTransactions(); }
    if (activeTab === 'kds' || activeTab === 'online') { fetchOnlineOrders(); }
  }, [activeTab]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxAmount = (subtotal - discount) * (taxPct / 100);
  const total = subtotal - discount + taxAmount;
  
  // Stamp Card logic: 1 stamp per 50k spent
  const earnedStamps = Math.floor(total / 50000);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryId === null || p.category_id === activeCategoryId;
    return matchesSearch && matchesCategory;
  });

  if (!isShiftOpen) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }]}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1e293b' }}>Cafe-X</Text>
        <Text style={{ color: '#64748b', marginVertical: 20 }}>Selamat Datang. Silakan buka kasir untuk memulai.</Text>
        <TouchableOpacity style={styles.payButton} onPress={openShift}>
          <Text style={styles.payText}>BUKA KASIR (START SHIFT)</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <Text style={styles.brand}>Cafe-X</Text>
        {[
          { id: 'register', label: 'Kasir', icon: '🛒' },
          { id: 'kds', label: 'Dapur (KDS)', icon: '👨‍🍳' },
          { id: 'online', label: 'Online', icon: '📱' },
          { id: 'history', label: 'Riwayat', icon: '📜' },
          { id: 'expenses', label: 'Pengeluaran', icon: '💸' },
          { id: 'dashboard', label: 'Dashboard', icon: '📊' }
        ].map(t => (
          <TouchableOpacity key={t.id} onPress={() => setActiveTab(t.id as any)} style={[styles.tab, activeTab === t.id && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === t.id && styles.activeTabText]}>{t.icon} {t.label}</Text>
          </TouchableOpacity>
        ))}
        
        <View style={{marginTop: 'auto'}}>
          <TouchableOpacity onPress={() => setActiveTab('dashboard')} style={styles.settleButton}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>SETTLEMENT</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{flex: 1, flexDirection: 'row'}}>
        {activeTab === 'register' && (
          <>
            <View style={styles.menuSection}>
              <View style={styles.searchBar}>
                <TextInput placeholder="Cari menu..." style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
              </View>
              <View style={{ marginBottom: 15 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map(c => (
                    <TouchableOpacity key={c.id} onPress={() => setActiveCategory(c.id)} style={[styles.catChip, activeCategoryId === c.id && styles.activeCatChip]}>
                      <Text style={[styles.catText, activeCategoryId === c.id && {color: '#fff'}]}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.productCard} onPress={() => addToCart({ ...item, product_id: item.id, qty: 1 })}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>Rp {item.price.toLocaleString()}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={styles.cartSection}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15}}>
                <Text style={styles.cartTitle}>Pesanan Baru</Text>
                <TouchableOpacity onPress={() => {const m = prompt('ID Member:'); setMemberId(m)}}>
                  <Text style={{color: '#2563eb', fontWeight: 'bold'}}>{memberId ? `ID: ${memberId}` : '+ Member'}</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={cart}
                keyExtractor={(item) => item.product_id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <View style={{flex: 1}}>
                      <Text style={{fontWeight: '500'}}>{item.name} x{item.qty}</Text>
                      {item.notes ? <Text style={{fontSize: 10, color: '#f59e0b'}}>* {item.notes}</Text> : null}
                      <TouchableOpacity onPress={() => {setSelectedItemForNote(item); setTempNote(item.notes || '')}}>
                        <Text style={{fontSize: 10, color: '#94a3b8'}}>Edit Catatan</Text>
                      </TouchableOpacity>
                    </View>
                    <Text>Rp {(item.price * item.qty).toLocaleString()}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.product_id)} style={{marginLeft: 10}}>
                      <Text style={{color: '#ef4444'}}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              {memberId && earnedStamps > 0 && (
                <View style={{backgroundColor: '#fff7ed', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ffedd5'}}>
                   <Text style={{fontSize: 12, color: '#9a3412', fontWeight: 'bold'}}>🎁 Loyalty Reward</Text>
                   <Text style={{fontSize: 11, color: '#c2410c'}}>Member akan mendapatkan {earnedStamps} Stamp!</Text>
                </View>
              )}
              <View style={styles.cartSummary}>
                <View style={styles.summaryRow}><Text>Subtotal</Text><Text>Rp {subtotal.toLocaleString()}</Text></View>
                <TouchableOpacity style={styles.summaryRow} onPress={() => {const d = prompt('Diskon (Rp):'); if(d) setDiscount(parseFloat(d))}}>
                  <Text style={{color: '#2563eb'}}>Diskon</Text>
                  <Text style={{color: '#ef4444'}}>- Rp {discount.toLocaleString()}</Text>
                </TouchableOpacity>
                <View style={styles.summaryRow}><Text>Pajak ({taxPct}%)</Text><Text>Rp {taxAmount.toLocaleString()}</Text></View>
                <View style={[styles.summaryRow, {marginTop: 10}]}><Text style={{fontWeight: 'bold', fontSize: 18}}>Total</Text><Text style={{fontWeight: 'bold', fontSize: 18}}>Rp {total.toLocaleString()}</Text></View>
              </View>
              <View style={styles.paymentPicker}>
                <Text style={{fontWeight: 'bold', marginBottom: 10, fontSize: 12}}>Metode Bayar:</Text>
                <View style={{flexDirection: 'row', gap: 5}}>
                  {['cash', 'qris', 'card'].map((m: any) => (
                    <TouchableOpacity key={m} onPress={() => setPaymentMethod(m)} style={[styles.payMethod, paymentMethod === m && styles.activePayMethod]}>
                      <Text style={[styles.payMethodText, paymentMethod === m && {color: '#fff'}]}>{m.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={styles.payButton} onPress={async () => {
                await checkout();
                if(memberId && earnedStamps > 0) alert(`Berhasil! Member ${memberId} mendapatkan ${earnedStamps} Stamp baru.`);
              }}>
                <Text style={styles.payText}>BAYAR & CETAK</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab === 'kds' && (
          <View style={{flex: 1, padding: 20}}>
            <Text style={styles.title}>Kitchen Display System (Antrean Dapur)</Text>
            <FlatList
              data={onlineOrders.filter(o => o.status !== 'served')}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              renderItem={({item}) => (
                <View style={[styles.kdsCard, item.status === 'ready' && {borderTopColor: '#10b981'}]}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#f1f5f9', paddingBottom: 10, marginBottom: 10}}>
                    <Text style={{fontWeight: 'bold', fontSize: 18}}>#{item.order_no || item.id}</Text>
                    <Text style={{color: '#64748b', fontWeight: 'bold'}}>{item.table_number || 'Takeaway'}</Text>
                  </View>
                  <ScrollView style={{height: 120}}>
                    {item.items.map((it: any, idx: number) => (
                      <View key={idx} style={{marginBottom: 8}}>
                         <Text style={{fontWeight: 'bold'}}>{it.qty}x {it.product_name || `Product ${it.product_id}`}</Text>
                         {it.notes ? <Text style={{fontSize: 11, color: '#f59e0b'}}>* {it.notes}</Text> : null}
                      </View>
                    ))}
                  </ScrollView>
                  <View style={{flexDirection: 'row', gap: 10, marginTop: 15}}>
                     {item.status === 'new' && (
                       <TouchableOpacity style={[styles.kdsBtn, {backgroundColor: '#3b82f6'}]} onPress={() => updateOrderStatus(item.id, 'preparing')}>
                         <Text style={{color: '#fff', fontWeight: 'bold'}}>MULAI MASAK</Text>
                       </TouchableOpacity>
                     )}
                     {item.status === 'preparing' && (
                       <TouchableOpacity style={[styles.kdsBtn, {backgroundColor: '#10b981'}]} onPress={() => updateOrderStatus(item.id, 'ready')}>
                         <Text style={{color: '#fff', fontWeight: 'bold'}}>SIAP SAJI</Text>
                       </TouchableOpacity>
                     )}
                     {item.status === 'ready' && (
                       <TouchableOpacity style={[styles.kdsBtn, {backgroundColor: '#1e293b'}]} onPress={() => updateOrderStatus(item.id, 'served')}>
                         <Text style={{color: '#fff', fontWeight: 'bold'}}>TELAH DIANTAR</Text>
                       </TouchableOpacity>
                     )}
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {activeTab === 'history' && (
          <View style={{flex: 1, padding: 20}}>
            <Text style={styles.title}>Riwayat Transaksi (Nota)</Text>
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity style={styles.historyCard} onPress={() => setSelectedTx(item)}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{fontWeight: 'bold'}}>{item.id}</Text>
                    <Text style={{color: '#64748b'}}>{new Date(item.created_at).toLocaleString()}</Text>
                  </View>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                    <Text style={{color: '#3b82f6', fontWeight: 'bold'}}>{item.payment_method.toUpperCase()}</Text>
                    <Text style={{fontWeight: 'bold'}}>Rp {item.total.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {activeTab === 'online' && (
          <View style={{flex: 1, padding: 20}}>
            <Text style={styles.title}>Monitor Pesanan Online</Text>
            <FlatList
              data={onlineOrders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({item}) => (
                <View style={styles.onlineCard}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.table_number}</Text>
                    <Text style={{color: '#64748b'}}>{item.status.toUpperCase()}</Text>
                  </View>
                  <View style={{marginVertical: 10}}>
                    {item.items.map((it: any, idx: number) => <Text key={idx}>• {it.qty}x Product ID {it.product_id}</Text>)}
                  </View>
                  <TouchableOpacity style={styles.acceptButton} onPress={() => updateOrderStatus(item.id, 'preparing')}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>Proses Ke Dapur</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {activeTab === 'dashboard' && shiftSummary && (
          <View style={{flex: 1, padding: 20}}>
            <Text style={styles.title}>Ringkasan Penjualan (X-Report)</Text>
            <View style={{flexDirection: 'row', gap: 15, marginTop: 20}}>
              <View style={[styles.statCard, {backgroundColor: '#3b82f6'}]}><Text style={styles.statLabel}>Total Sales</Text><Text style={styles.statVal}>Rp {shiftSummary.totalSales.toLocaleString()}</Text></View>
              <View style={[styles.statCard, {backgroundColor: '#10b981'}]}><Text style={styles.statLabel}>Tunai</Text><Text style={styles.statVal}>Rp {shiftSummary.cashSales.toLocaleString()}</Text></View>
              <View style={[styles.statCard, {backgroundColor: '#f59e0b'}]}><Text style={styles.statLabel}>Non-Tunai</Text><Text style={styles.statVal}>Rp {(shiftSummary.qrisSales + shiftSummary.cardSales).toLocaleString()}</Text></View>
              <View style={[styles.statCard, {backgroundColor: '#ef4444'}]}><Text style={styles.statLabel}>Expenses</Text><Text style={styles.statVal}>Rp {shiftSummary.totalExpenses.toLocaleString()}</Text></View>
            </View>
            <View style={[styles.whiteCard, {marginTop: 30, padding: 30, alignItems: 'center'}]}>
              <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>Tutup Buku / Settlement</Text>
              <TouchableOpacity style={styles.settleBig} onPress={settlement}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 18}}>LAKUKAN SETTLEMENT & TUTUP SHIFT</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'expenses' && (
          <View style={{flex: 1, padding: 20}}>
            <Text style={styles.title}>Catat Pengeluaran</Text>
            <View style={[styles.whiteCard, {marginTop: 10, padding: 20}]}>
              <Text style={{marginBottom: 8}}>Keterangan</Text>
              <TouchableOpacity onPress={() => {const d = prompt('Deskripsi:'); if(d) setExpenseDesc(d)}} style={styles.inputSim}><Text>{expenseDesc || 'Contoh: Es Batu, Parkir'}</Text></TouchableOpacity>
              <Text style={{marginBottom: 8, marginTop: 20}}>Nominal (Rp)</Text>
              <TouchableOpacity onPress={() => {const a = prompt('Nominal:'); if(a) setExpenseAmount(a)}} style={styles.inputSim}><Text>{expenseAmount || '0'}</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.payButton, {marginTop: 30, backgroundColor: '#475569'}]} onPress={async () => {
                if(!expenseDesc || !expenseAmount) return;
                await addExpense(expenseDesc, parseFloat(expenseAmount));
                setExpenseDesc(''); setExpenseAmount('');
                alert('Pengeluaran berhasil dicatat!');
              }}>
                <Text style={styles.payText}>SIMPAN PENGELUARAN</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Detail Modals ... (keeping existing modals but omitting for brevity if possible, or rewrite full) */}
      {/* (Rewriting full for consistency) */}
      <Modal visible={!!selectedItemForNote} transparent animationType="fade">
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
            <Text style={{fontWeight: 'bold', fontSize: 18, marginBottom: 15}}>Catatan: {selectedItemForNote?.name}</Text>
            <TextInput style={styles.modalInput} multiline value={tempNote} onChangeText={setTempNote} />
            <View style={{flexDirection: 'row', gap: 10, marginTop: 20}}>
              <TouchableOpacity style={{flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#e2e8f0', alignItems: 'center'}} onPress={() => setSelectedItemForNote(null)}><Text>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={{flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#2563eb', alignItems: 'center'}} onPress={() => {updateItemNote(selectedItemForNote.product_id, tempNote); setSelectedItemForNote(null)}}><Text style={{color: '#fff', fontWeight: 'bold'}}>Simpan</Text></TouchableOpacity>
            </View>
        </View></View>
      </Modal>

      <Modal visible={!!selectedTx} transparent animationType="slide">
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
            <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20}}>Nota: {selectedTx?.id}</Text>
            <View style={{borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#ccc', paddingBottom: 10, marginBottom: 10}}>
              <Text>Waktu: {new Date(selectedTx?.created_at).toLocaleString()}</Text>
              <Text>Bayar: {selectedTx?.payment_method.toUpperCase()}</Text>
            </View>
            <ScrollView style={{maxHeight: 200}}>{selectedTx?.items.map((it: any, idx: number) => (
              <View key={idx} style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5}}><Text>{it.product_id} x{it.qty}</Text><Text>Rp {(it.price * it.qty).toLocaleString()}</Text></View>
            ))}</ScrollView>
            <View style={{borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#ccc', paddingTop: 10, marginTop: 10}}>
              <View style={styles.summaryRow}><Text style={{fontWeight: 'bold'}}>TOTAL</Text><Text style={{fontWeight: 'bold'}}>Rp {selectedTx?.total.toLocaleString()}</Text></View>
            </View>
            <View style={{flexDirection: 'row', gap: 10, marginTop: 20}}>
              <TouchableOpacity style={{flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#e2e8f0', alignItems: 'center'}} onPress={() => setSelectedTx(null)}><Text>TUTUP</Text></TouchableOpacity>
              <TouchableOpacity style={{flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#10b981', alignItems: 'center'}} onPress={() => reprintReceipt(selectedTx.id, selectedTx.items, selectedTx.total)}><Text style={{color: '#fff', fontWeight: 'bold'}}>REPRINT</Text></TouchableOpacity>
            </View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', flexDirection: 'row' },
  sidebar: { width: 180, backgroundColor: '#1e293b', padding: 20 },
  brand: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  tab: { padding: 15, borderRadius: 12, marginBottom: 10 },
  activeTab: { backgroundColor: '#334155' },
  tabText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 14 },
  activeTabText: { color: '#fff' },
  settleButton: { backgroundColor: '#ef4444', padding: 12, borderRadius: 8, alignItems: 'center' },

  menuSection: { flex: 2, padding: 20 },
  searchBar: { marginBottom: 15 },
  searchInput: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  catChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  activeCatChip: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  catText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  
  productCard: { flex: 1, backgroundColor: '#fff', padding: 20, margin: 5, borderRadius: 12, alignItems: 'center', elevation: 2 },
  productName: { fontWeight: 'bold', fontSize: 14 },
  productPrice: { color: '#3b82f6', fontSize: 12, marginTop: 5, fontWeight: 'bold' },

  cartSection: { width: 320, backgroundColor: '#fff', borderLeftWidth: 1, borderColor: '#e2e8f0', padding: 20 },
  cartTitle: { fontSize: 20, fontWeight: 'bold' },
  cartItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center' },
  cartSummary: { marginTop: 20, borderTopWidth: 2, borderColor: '#f1f5f9', paddingTop: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  
  paymentPicker: { marginVertical: 15 },
  payMethod: { flex: 1, padding: 8, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, alignItems: 'center' },
  activePayMethod: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  payMethodText: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
  payButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center' },
  payText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 20 },
  kdsCard: { flex: 1, backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 15, borderTopWidth: 5, borderTopColor: '#3b82f6', elevation: 3 },
  kdsBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  historyCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 12, elevation: 2 },
  onlineCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 15, borderLeftWidth: 5, borderLeftColor: '#f59e0b', elevation: 2 },
  acceptButton: { backgroundColor: '#10b981', padding: 10, borderRadius: 8, marginTop: 10, alignItems: 'center' },

  statCard: { flex: 1, padding: 20, borderRadius: 15 },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  statVal: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  whiteCard: { backgroundColor: '#fff', borderRadius: 15, elevation: 3 },
  settleBig: { backgroundColor: '#ef4444', padding: 20, borderRadius: 15, width: '100%', alignItems: 'center' },

  inputSim: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 400, backgroundColor: '#fff', padding: 30, borderRadius: 20 },
  modalInput: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, height: 100, textAlignVertical: 'top' }
});
