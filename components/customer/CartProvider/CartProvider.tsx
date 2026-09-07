'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { CartItem, Product, ProductVariant } from '@/lib/types';
import { showToast } from '@/components/customer/Toast/Toast';

const CART_KEY = 'arona_cart';

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantKey?: string) => void;
  updateQty: (productId: string, qty: number, variantKey?: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

function getItemKey(productId: string, variant?: ProductVariant) {
  return variant ? `${productId}::${variant.color}::${variant.storage}` : productId;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      setItems(stored);
    } catch { setItems([]); }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('arona-cart-update'));
  }, [items]);

  const addToCart = useCallback((product: Product, variant?: ProductVariant) => {
    setItems(prev => {
      const key = getItemKey(product.id, variant);
      const existing = prev.find(i => getItemKey(i.product.id, i.selectedVariant) === key);
      if (existing) {
        return prev.map(i =>
          getItemKey(i.product.id, i.selectedVariant) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, selectedVariant: variant }];
    });
    showToast({ type: 'success', title: 'Added to cart!', message: `${product.brand} ${product.model}` });
  }, []);

  const removeFromCart = useCallback((productId: string, variantKey?: string) => {
    setItems(prev => prev.filter(i =>
      !(i.product.id === productId &&
        (!variantKey || getItemKey(i.product.id, i.selectedVariant) === variantKey))
    ));
  }, []);

  const updateQty = useCallback((productId: string, qty: number, variantKey?: string) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i =>
      (i.product.id === productId &&
        (!variantKey || getItemKey(i.product.id, i.selectedVariant) === variantKey))
        ? { ...i, quantity: qty }
        : i
    ));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => {
    const price = i.selectedVariant?.discount_price ?? i.selectedVariant?.price ?? i.product.discount_price ?? i.product.price;
    return sum + price * i.quantity;
  }, 0);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}
