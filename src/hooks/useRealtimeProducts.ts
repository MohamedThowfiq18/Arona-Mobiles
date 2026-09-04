import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useProductStore } from '@/store/useProductStore';
import { Product } from '@/types';

export function useRealtimeProducts() {
  const { fetchProducts, addToast, setProducts } = useProductStore();

  useEffect(() => {
    // Initial fetch
    fetchProducts();

    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    // Subscribe to Postgres changes on 'products' table
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('⚡ Supabase Realtime Event Received:', payload);

          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT' && newRecord) {
            const addedProduct: Product = {
              id: newRecord.id,
              brand: newRecord.brand,
              model: newRecord.model,
              condition: newRecord.condition,
              gradeIfPreowned: newRecord.grade_if_preowned,
              price: Number(newRecord.price),
              originalPrice: newRecord.original_price ? Number(newRecord.original_price) : undefined,
              stock: Number(newRecord.stock),
              badge: newRecord.badge || 'Live Addition',
              rating: newRecord.rating ? Number(newRecord.rating) : 5.0,
              reviewsCount: newRecord.reviews_count || 1,
              images: newRecord.images || [],
              variants: newRecord.variants || [],
              specs: newRecord.specs || {}
            };

            const current = useProductStore.getState().products;
            if (!current.some((p) => p.id === addedProduct.id)) {
              setProducts([addedProduct, ...current]);
              addToast({
                type: 'live',
                title: '⚡ Live Store Addition',
                description: `New Arrival: ${addedProduct.brand} ${addedProduct.model} for $${addedProduct.price}!`
              });
            }
          } else if (eventType === 'UPDATE' && newRecord) {
            const current = useProductStore.getState().products;
            const existing = current.find((p) => p.id === newRecord.id);

            const updatedProducts = current.map((p) => {
              if (p.id === newRecord.id) {
                return {
                  ...p,
                  price: Number(newRecord.price),
                  stock: Number(newRecord.stock),
                  model: newRecord.model,
                  badge: newRecord.badge || p.badge
                };
              }
              return p;
            });

            setProducts(updatedProducts);

            if (existing && existing.price !== Number(newRecord.price)) {
              addToast({
                type: 'live',
                title: '⚡ Live Price Adjustment',
                description: `${newRecord.brand} ${newRecord.model} price updated to $${newRecord.price}!`
              });
            } else if (existing && existing.stock !== Number(newRecord.stock)) {
              addToast({
                type: 'live',
                title: '📦 Live Stock Alert',
                description: `${newRecord.brand} ${newRecord.model} stock is now ${newRecord.stock} units.`
              });
            }
          } else if (eventType === 'DELETE' && oldRecord) {
            const current = useProductStore.getState().products;
            const removed = current.find((p) => p.id === oldRecord.id);
            setProducts(current.filter((p) => p.id !== oldRecord.id));

            if (removed) {
              addToast({
                type: 'warning',
                title: '🗑️ Inventory Alert',
                description: `${removed.brand} ${removed.model} was sold out/removed.`
              });
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to Supabase Realtime channel for live product sync.');
        }
      });

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchProducts, addToast, setProducts]);
}
