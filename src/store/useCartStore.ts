import { create } from 'zustand';
import { Product, ProductVariant, CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantColor?: string, variantStorage?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantColor?: string, variantStorage?: string) => void;
  clearCart: () => void;
  
  getSubtotal: () => number;
  getTax: () => number;
  getShipping: () => number;
  getGrandTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  addItem: (product, variant, quantity = 1) => {
    const selectedVariant = variant || product.variants[0] || {
      storage: 'Standard',
      color: 'Default',
      priceModifier: 0,
      stock: product.stock
    };

    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedVariant.storage === selectedVariant.storage &&
          item.selectedVariant.color === selectedVariant.color
      );

      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex].quantity += quantity;
        return { items: updated, isOpen: true };
      } else {
        return {
          items: [...state.items, { product, selectedVariant, quantity }],
          isOpen: true
        };
      }
    });
  },

  removeItem: (productId, variantColor, variantStorage) => {
    set((state) => ({
      items: state.items.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (!variantColor || item.selectedVariant.color === variantColor) &&
            (!variantStorage || item.selectedVariant.storage === variantStorage)
          )
      )
    }));
  },

  updateQuantity: (productId, quantity, variantColor, variantStorage) => {
    if (quantity <= 0) {
      get().removeItem(productId, variantColor, variantStorage);
      return;
    }

    set((state) => ({
      items: state.items.map((item) => {
        if (
          item.product.id === productId &&
          (!variantColor || item.selectedVariant.color === variantColor) &&
          (!variantStorage || item.selectedVariant.storage === variantStorage)
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    }));
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce((total, item) => {
      const basePrice = item.product.price;
      const mod = item.selectedVariant.priceModifier || 0;
      return total + (basePrice + mod) * item.quantity;
    }, 0);
  },

  getTax: () => {
    return Math.round(get().getSubtotal() * 0.08 * 100) / 100;
  },

  getShipping: () => {
    const subtotal = get().getSubtotal();
    return subtotal > 299 || subtotal === 0 ? 0 : 19.99;
  },

  getGrandTotal: () => {
    return get().getSubtotal() + get().getTax() + get().getShipping();
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  }
}));
