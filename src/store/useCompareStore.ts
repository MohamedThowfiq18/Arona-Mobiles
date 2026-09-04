import { create } from 'zustand';
import { Product } from '@/types';

interface CompareStore {
  items: Product[];
  isOpen: boolean;
  
  toggleCompare: (product: Product) => void;
  removeCompare: (productId: string) => void;
  clearCompare: () => void;
  openCompareModal: () => void;
  closeCompareModal: () => void;
  isInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  items: [],
  isOpen: false,

  toggleCompare: (product) => {
    set((state) => {
      const exists = state.items.some((item) => item.id === product.id);
      if (exists) {
        return { items: state.items.filter((item) => item.id !== product.id) };
      }
      if (state.items.length >= 3) {
        // Keep max 3 products
        return { items: [...state.items.slice(1), product] };
      }
      return { items: [...state.items, product] };
    });
  },

  removeCompare: (productId) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
  },

  clearCompare: () => set({ items: [], isOpen: false }),
  openCompareModal: () => set({ isOpen: true }),
  closeCompareModal: () => set({ isOpen: false }),

  isInCompare: (productId) => get().items.some((item) => item.id === productId)
}));
