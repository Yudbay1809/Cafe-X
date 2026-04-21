import { create } from 'zustand';

export type CartItem = {
  product_id: number;
  nama_menu: string;
  harga: number;
  qty: number;
  gambar?: string;
  notes?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (product_id: number) => void;
  updateQty: (product_id: number, qty: number) => void;
  updateItemNotes: (product_id: number, notes: string) => void;
  clearCart: () => void;
  totalAmount: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => {
    const items = get().items;
    const existing = items.find((i) => i.product_id === product.product_id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.product_id === product.product_id ? { ...i, qty: i.qty + product.qty } : i
        ),
      });
    } else {
      set({ items: [...items, product] });
    }
  },
  removeItem: (product_id) => {
    set({ items: get().items.filter((i) => i.product_id !== product_id) });
  },
  updateQty: (product_id, qty) => {
    set({
      items: get().items.map((i) => (i.product_id === product_id ? { ...i, qty: Math.max(1, qty) } : i)),
    });
  },
  updateItemNotes: (product_id, notes) => {
    set({
      items: get().items.map((i) => (i.product_id === product_id ? { ...i, notes } : i)),
    });
  },
  clearCart: () => set({ items: [] }),
  totalAmount: () => {
    return get().items.reduce((acc, i) => acc + i.harga * i.qty, 0);
  },
}));
