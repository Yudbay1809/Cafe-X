import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Modal, Image, StatusBar } from 'react-native';
import { initDatabase, getDb } from './lib/db';
import { usePosStore } from './store/posStore';
import axios from 'axios';

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'register' | 'history' | 'kds' | 'dashboard'>('register');

  const { 
    cart, addToCart, removeFromCart, checkout, 
    isShiftOpen, openShift,
    searchQuery, setSearchQuery,
    activeCategoryId, setActiveCategory,
    discount, taxPct,
    onlineOrders, updateOrderStatus, fetchOnlineOrders
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
      } catch (e: any) { console.error(e); }
    }
    start();
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxAmount = (subtotal - discount) * (taxPct / 100);
  const total = subtotal - discount + taxAmount;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryId === null || p.category_id === activeCategoryId;
    return matchesSearch && matchesCategory;
  });

  // Simulation Logic: Add a mock order to KDS
  const simulateIncomingOrder = () => {
    const mockOrder = {
      id: `SIM-${Date.now()}`,
      status: 'new',
      table_number: 'Table ' + (Math.floor(Math.random() * 10) + 1),
      items: [
        { product_id: 1, product_name: 'Es Kopi Susu Sultan', qty: 2, notes: 'Less sugar' },
        { product_id: 2, product_name: 'Croissant Almond', qty: 1, notes: 'Extra butter' }
      ],
      created_at: new Date().toISOString()
    };
    
    // In a real scenario, this would come from the server via fetchOnlineOrders
    // For simulation, we manually update the state via the store (if we had a setter) 
    // or just trigger an alert that a sync is simulated.
    alert('Simulating Incoming Order from Customer App...');
    // We'll actually post to the backend to make it "real" for the sync
    axios.post('http://localhost:9000/api/v1/sync/online-orders/mock', mockOrder)
      .then(() => fetchOnlineOrders());
  };

  if (!isShiftOpen) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" />
        <Text style={{ fontSize: 48, fontWeight: '900', color: '#FBBF24', fontFamily: 'serif' }}>CAFE·X</Text>
        <Text style={{ color: '#8B7355', marginVertical: 20, fontSize: 16 }}>Enterprise POS Terminal • OLED Edition</Text>
        <TouchableOpacity style={styles.payButton} onPress={openShift}>
          <Text style={styles.payText}>START SHIFT</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Sidebar - OLED Dark */}
      <View style={styles.sidebar}>
        <View style={{ marginBottom: 40 }}>
           <Text style={styles.brand}>CAFE·X</Text>
           <Text style={styles.brandSub}>POS Terminal</Text>
        </View>

        {[
          { id: 'register', label: 'Kasir', icon: '🛒' },
          { id: 'kds', label: 'Dapur (KDS)', icon: '🍳' },
          { id: 'history', label: 'Riwayat', icon: '📜' },
          { id: 'dashboard', label: 'X-Report', icon: '📊' }
        ].map(t => (
          <TouchableOpacity 
            key={t.id} 
            onPress={() => setActiveTab(t.id as any)} 
            style={[styles.tab, activeTab === t.id && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === t.id && styles.activeTabText]}>
              {t.icon}   {t.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.syncBadge}>
           <View style={styles.syncDot} />
           <Text style={styles.syncText}>Live Sync</Text>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={{ flex: 1 }}>
        {activeTab === 'register' && (
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={styles.menuSection}>
              <View style={styles.topBar}>
                <View style={styles.searchContainer}>
                  <Text style={{ marginRight: 10 }}>🔍</Text>
                  <TextInput 
                    placeholder="Search menu..." 
                    placeholderTextColor="#3D3320"
                    style={styles.searchInput} 
                    value={searchQuery} 
                    onChangeText={setSearchQuery} 
                  />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 20 }}>
                  {categories.map(c => (
                    <TouchableOpacity 
                      key={c.id} 
                      onPress={() => setActiveCategory(c.id)} 
                      style={[styles.catChip, activeCategoryId === c.id && styles.activeCatChip]}
                    >
                      <Text style={[styles.catText, activeCategoryId === c.id && { color: '#000' }]}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <View style={styles.productCard}>
                    <Image source={{ uri: item.image || 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=200' }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <View style={styles.productBottom}>
                        <Text style={styles.productPrice}>Rp {item.price.toLocaleString()}</Text>
                        <TouchableOpacity style={styles.addButton} onPress={() => addToCart({ ...item, product_id: item.id, qty: 1 })}>
                          <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />
            </View>

            <View style={styles.cartSection}>
              <View style={styles.cartHeader}>
                <Text style={styles.cartTitle}>CURRENT ORDER</Text>
                <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cart.length}</Text></View>
              </View>
              <FlatList
                data={cart}
                keyExtractor={(item) => item.product_id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemNote}>{item.notes || 'No notes'}</Text>
                    </View>
                    <View style={styles.qtyContainer}>
                       <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(item.product_id)}><Text style={styles.qtyBtnText}>-</Text></TouchableOpacity>
                       <Text style={styles.qtyVal}>{item.qty}</Text>
                       <TouchableOpacity style={styles.qtyBtnActive} onPress={() => addToCart(item)}><Text style={styles.qtyBtnTextActive}>+</Text></TouchableOpacity>
                    </View>
                  </View>
                )}
              />
              <View style={styles.cartFooter}>
                <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Discount (10%)</Text><Text style={styles.summaryValueRed}>- Rp {discount.toLocaleString()}</Text></View>
                <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tax (11%)</Text><Text style={styles.summaryValue}>+ Rp {taxAmount.toLocaleString()}</Text></View>
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 16 }} />
                <View style={[styles.summaryRow, { marginBottom: 20 }]}><Text style={styles.totalLabel}>TOTAL</Text><Text style={styles.totalValue}>RP {total.toLocaleString()}</Text></View>
                <TouchableOpacity style={styles.payButton} onPress={checkout}>
                  <Text style={styles.payText}>Process Payment</Text>
                  <Text style={styles.paySubtext}>Cash / QRIS / Card</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'kds' && (
          <View style={{ flex: 1, padding: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <View>
                <Text style={styles.kdsTitle}>KITCHEN QUEUE</Text>
                <Text style={{ color: '#8B7355', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>Live Order Monitor — Terminal-01</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={simulateIncomingOrder} style={[styles.kdsBadge, { backgroundColor: '#78350F' }]}>
                   <Text style={{ color: '#FBBF24', fontSize: 11, fontWeight: 'black' }}>➕ Simulate New Order</Text>
                </TouchableOpacity>
                <View style={styles.kdsBadge}><Text style={styles.kdsBadgeText}>{onlineOrders.length} Active Orders</Text></View>
              </View>
            </View>
            <FlatList
              data={onlineOrders.filter(o => o.status !== 'served')}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              renderItem={({ item }) => (
                <View style={styles.kdsCard}>
                  <View style={styles.kdsCardHeader}>
                    <Text style={styles.kdsOrderId}>#CX-{String(item.id).slice(-4)}</Text>
                    <Text style={[styles.kdsTime, item.status === 'preparing' && { color: '#10B981' }]}>
                      {item.status === 'preparing' ? '🔥 Processing' : '⏳ 4m ago'}
                    </Text>
                  </View>
                  <ScrollView style={{ height: 180 }}>
                    {item.items.map((it: any, idx: number) => (
                      <View key={idx} style={{ marginBottom: 12 }}>
                         <Text style={styles.kdsItemText}>{it.qty}x {it.product_name || `Product ${it.product_id}`}</Text>
                         {it.notes ? <Text style={styles.kdsItemNote}>* {it.notes}</Text> : null}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity 
                    style={[styles.kdsBtn, item.status === 'preparing' ? { backgroundColor: '#10B98120', borderColor: '#10B981', borderWidth: 1 } : { backgroundColor: '#632C0D' }]} 
                    onPress={() => updateOrderStatus(item.id, item.status === 'new' ? 'preparing' : 'ready')}
                  >
                    <Text style={[styles.kdsBtnText, item.status === 'preparing' && { color: '#10B981' }]}>
                      {item.status === 'new' ? 'Mulai Masak' : 'Siap Saji!'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070710' },
  sidebar: { width: 220, backgroundColor: '#070710', padding: 24, borderRightWidth: 1, borderRightColor: '#1A160F' },
  brand: { color: '#FBBF24', fontSize: 24, fontWeight: '900', letterSpacing: 1, fontFamily: 'serif' },
  brandSub: { color: '#8B7355', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  tab: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  activeTab: { backgroundColor: '#FBBF24' },
  tabText: { color: '#8B7355', fontWeight: 'bold', fontSize: 13 },
  activeTabText: { color: '#000' },
  syncBadge: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D2D1A', padding: 12, borderRadius: 10 },
  syncDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  syncText: { color: '#10B981', fontSize: 11, fontWeight: 'bold' },

  menuSection: { flex: 1, padding: 24 },
  topBar: { marginBottom: 24 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A160F', paddingHorizontal: 16, borderRadius: 14, height: 50 },
  searchInput: { flex: 1, color: '#FFFBF5', fontWeight: 'bold' },
  catChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1A160F', marginRight: 10 },
  activeCatChip: { backgroundColor: '#FBBF24' },
  catText: { color: '#8B7355', fontWeight: 'bold', fontSize: 12 },

  productCard: { flex: 1, backgroundColor: '#1A160F', margin: 8, borderRadius: 24, overflow: 'hidden' },
  productImage: { width: '100%', height: 140 },
  productInfo: { padding: 16 },
  productName: { color: '#FFFBF5', fontWeight: 'bold', fontSize: 14, marginBottom: 12 },
  productBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { color: '#FBBF24', fontWeight: 'bold', fontSize: 14 },
  addButton: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FBBF24', alignItems: 'center', justifyContent: 'center' },

  cartSection: { width: 340, backgroundColor: '#070710', borderLeftWidth: 1, borderLeftColor: '#1A160F', padding: 24 },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  cartTitle: { color: '#FFFBF5', fontSize: 18, fontWeight: '900', fontFamily: 'serif' },
  cartBadge: { backgroundColor: '#FBBF24', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  cartItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1A160F' },
  cartItemName: { color: '#FFFBF5', fontWeight: 'bold', fontSize: 14 },
  cartItemNote: { color: '#8B7355', fontSize: 10, marginTop: 4 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 24, height: 24, borderRadius: 4, backgroundColor: '#1A160F', alignItems: 'center', justifyContent: 'center' },
  qtyBtnActive: { width: 24, height: 24, borderRadius: 4, backgroundColor: '#FBBF24', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#8B7355', fontWeight: 'bold' },
  qtyBtnTextActive: { color: '#000', fontWeight: 'bold' },
  qtyVal: { color: '#FFFBF5', fontWeight: 'bold', fontSize: 14 },

  cartFooter: { marginTop: 'auto' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#8B7355', fontSize: 13, fontWeight: 'bold' },
  summaryValue: { color: '#FFFBF5', fontSize: 13, fontWeight: 'bold' },
  summaryValueRed: { color: '#EF4444', fontSize: 13, fontWeight: 'bold' },
  totalLabel: { color: '#8B7355', fontSize: 14, fontWeight: 'bold' },
  totalValue: { color: '#FBBF24', fontSize: 24, fontWeight: '900', fontFamily: 'serif' },
  payButton: { backgroundColor: '#FBBF24', paddingVertical: 20, borderRadius: 20, alignItems: 'center', marginTop: 24 },
  payText: { color: '#000', fontSize: 18, fontWeight: '900' },
  paySubtext: { color: 'rgba(0,0,0,0.5)', fontSize: 10, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' },

  kdsTitle: { color: '#FFFBF5', fontSize: 34, fontWeight: '900', fontFamily: 'serif', letterSpacing: 1 },
  kdsBadge: { backgroundColor: '#FBBF2415', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: '#FBBF2430', alignItems: 'center', justifyContent: 'center' },
  kdsBadgeText: { color: '#FBBF24', fontSize: 12, fontWeight: 'bold' },
  kdsCard: { flex: 1, backgroundColor: '#1A160F', margin: 12, padding: 24, borderRadius: 32, borderTopWidth: 1, borderTopColor: '#FBBF2410' },
  kdsCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#FFFBF510', paddingBottom: 15 },
  kdsOrderId: { color: '#FFFBF5', fontSize: 18, fontWeight: '900', fontFamily: 'serif' },
  kdsTime: { color: '#8B7355', fontSize: 12, fontWeight: 'bold' },
  kdsItemText: { color: '#FFFBF5', fontWeight: 'bold', fontSize: 16 },
  kdsItemNote: { color: '#8B7355', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  kdsBtn: { marginTop: 20, padding: 18, borderRadius: 16, alignItems: 'center' },
  kdsBtnText: { color: '#FBBF24', fontWeight: '900', fontSize: 14, textTransform: 'uppercase' }
});
