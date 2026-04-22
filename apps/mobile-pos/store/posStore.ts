import { create } from 'zustand';
import { getDb } from '../lib/db';
import axios from 'axios';

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  qty: number;
  notes?: string;
}

interface PosState {
  cart: CartItem[];
  isShiftOpen: boolean;
  paymentMethod: 'cash' | 'qris' | 'card';
  onlineOrders: any[];
  expenses: any[];
  transactions: any[];
  categories: any[];
  activeCategoryId: number | null;
  searchQuery: string;
  discount: number;
  taxPct: number;
  memberId: string | null;
  
  setPaymentMethod: (method: 'cash' | 'qris' | 'card') => void;
  setSearchQuery: (q: string) => void;
  setActiveCategory: (id: number | null) => void;
  setDiscount: (amt: number) => void;
  setMemberId: (id: string | null) => void;
  updateItemNote: (product_id: number, notes: string) => void;
  
  openShift: () => void;
  closeShift: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (product_id: number) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  syncOrders: () => Promise<void>;
  addExpense: (description: string, amount: number) => Promise<void>;
  fetchOnlineOrders: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: 'preparing' | 'ready' | 'served') => Promise<void>;
  getShiftSummary: () => Promise<any>;
  reprintReceipt: (orderId: string, items: any[], total: number) => Promise<void>;
  settlement: () => Promise<void>;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  isShiftOpen: false,
  paymentMethod: 'cash',
  onlineOrders: [],
  expenses: [],
  transactions: [],
  categories: [],
  activeCategoryId: null,
  searchQuery: '',
  discount: 0,
  taxPct: 11,
  memberId: null,

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveCategory: (id) => set({ activeCategoryId: id }),
  setDiscount: (amt) => set({ discount: amt }),
  setMemberId: (id) => set({ memberId: id }),
  updateItemNote: (pid, notes) => set(state => ({
    cart: state.cart.map(item => item.product_id === pid ? { ...item, notes } : item)
  })),

  openShift: () => set({ isShiftOpen: true, discount: 0, memberId: null }),
  closeShift: () => set({ isShiftOpen: false, cart: [], discount: 0 }),
  
  addToCart: (item) => {
    set((state) => {
      const existing = state.cart.find((x) => x.product_id === item.product_id);
      if (existing) {
        return {
          cart: state.cart.map((x) =>
            x.product_id === item.product_id ? { ...x, qty: x.qty + item.qty } : x
          ),
        };
      }
      return { cart: [...state.cart, item] };
    });
  },
  removeFromCart: (product_id) => {
    set((state) => ({ cart: state.cart.filter((x) => x.product_id !== product_id) }));
  },
  clearCart: () => set({ cart: [] }),
  
  checkout: async () => {
    const { cart, clearCart, paymentMethod, discount, taxPct, memberId } = get();
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxAmount = (subtotal - discount) * (taxPct / 100);
    const total = subtotal - discount + taxAmount;
    
    const orderId = `OFF-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const db = await getDb();

    await db.runAsync(
      `INSERT INTO offline_orders (id, total, subtotal, discount, tax, status, payment_method, member_id, created_at, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, total, subtotal, discount, taxAmount, 'paid', paymentMethod, memberId, createdAt, 0]
    );

    for (const item of cart) {
      await db.runAsync(
        `INSERT INTO offline_order_items (order_id, product_id, qty, price, notes) VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.qty, item.price, item.notes || '']
      );
    }

    clearCart();
    get().syncOrders();
    get().fetchTransactions();

    try {
      const { ThermalPrinter } = require('../lib/printer');
      await ThermalPrinter.connect('BT:00:11:22:33:FF');
      await ThermalPrinter.printReceipt(orderId, cart, total);
    } catch (e) {}
  },

  syncOrders: async () => {
    try {
      const db = await getDb();
      const unsyncedOrders = await db.getAllAsync('SELECT * FROM offline_orders WHERE synced = 0');
      if (unsyncedOrders.length === 0) return;

      const payload = [];
      for (const o of unsyncedOrders as any[]) {
        const items = await db.getAllAsync(`SELECT * FROM offline_order_items WHERE order_id = ?`, [o.id]);
        payload.push({ ...o, items });
      }

      await axios.post('http://localhost:9000/api/v1/sync/pos/bulk', { orders: payload });

      for (const o of unsyncedOrders as any[]) {
        await db.runAsync(`UPDATE offline_orders SET synced = 1 WHERE id = ?`, [o.id]);
      }
    } catch (error) {
      console.log('Sync failed:', error);
    }
  },

  addExpense: async (description, amount) => {
    const db = await getDb();
    const createdAt = new Date().toISOString();
    await db.runAsync(`INSERT INTO petty_cash (description, amount, created_at) VALUES (?, ?, ?)`, [description, amount, createdAt]);
    try {
      await axios.post('http://localhost:9000/api/v1/sync/expenses', { expenses: [{ description, amount, created_at: createdAt }] });
    } catch (e) {}
  },

  fetchOnlineOrders: async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/v1/sync/online-orders');
      if (response.data.success) set({ onlineOrders: response.data.data });
    } catch (e) {}
  },

  fetchTransactions: async () => {
    const db = await getDb();
    const orders = await db.getAllAsync('SELECT * FROM offline_orders ORDER BY created_at DESC LIMIT 50');
    const enriched = [];
    for (const o of orders as any[]) {
      const items = await db.getAllAsync('SELECT * FROM offline_order_items WHERE order_id = ?', [o.id]);
      enriched.push({ ...o, items });
    }
    set({ transactions: enriched });
  },

  getShiftSummary: async () => {
    const db = await getDb();
    const orders = await db.getAllAsync('SELECT * FROM offline_orders');
    const expenses = await db.getAllAsync('SELECT * FROM petty_cash');
    
    const summary = {
      totalSales: orders.reduce((sum: number, o: any) => sum + o.total, 0),
      cashSales: orders.filter((o: any) => o.payment_method === 'cash').reduce((sum: number, o: any) => sum + o.total, 0),
      qrisSales: orders.filter((o: any) => o.payment_method === 'qris').reduce((sum: number, o: any) => sum + o.total, 0),
      cardSales: orders.filter((o: any) => o.payment_method === 'card').reduce((sum: number, o: any) => sum + o.total, 0),
      totalExpenses: expenses.reduce((sum: number, e: any) => sum + e.amount, 0),
    };
    return summary;
  },

  reprintReceipt: async (orderId, items, total) => {
    console.log(`[PRINTER] Reprinting receipt for ${orderId}...`);
    try {
      const { ThermalPrinter } = require('../lib/printer');
      await ThermalPrinter.connect('BT:00:11:22:33:FF');
      await ThermalPrinter.printReceipt(orderId, items, total);
      alert(`Berhasil mencetak ulang nota ${orderId}`);
    } catch (e) {
      console.log('Printer reprint failed:', e);
      alert('Gagal terhubung ke printer Bluetooth.');
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await axios.post(`http://localhost:9000/api/v1/orders/status`, { 
        order_id: orderId.includes('-') ? orderId : parseInt(orderId), 
        status 
      });
      // Refresh online orders after status change
      get().fetchOnlineOrders();
    } catch (e) {
      console.log('Failed to update order status:', e);
    }
  },

  settlement: async () => {
    await get().syncOrders();
    get().closeShift();
  }
}));
