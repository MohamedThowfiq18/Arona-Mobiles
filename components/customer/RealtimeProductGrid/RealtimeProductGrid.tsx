'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/customer/ProductCard/ProductCard';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface Props {
  initialProducts: Product[];
  filterCondition?: 'new' | 'pre-owned';
  filterFeaturedOnly?: boolean;
  limit?: number;
  className?: string;
  emptyMessage?: string;
}

export default function RealtimeProductGrid({
  initialProducts,
  filterCondition,
  filterFeaturedOnly,
  limit,
  className,
  emptyMessage = 'No phones available at the moment.',
}: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      }
    } catch {
      // ignore network errors
    }
  }, []);

  useEffect(() => {
    // Listen for tab focus to refresh stock immediately
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProducts();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refreshProducts);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshProducts);
    };
  }, [refreshProducts]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    try {
      const supabase = getSupabaseClient();
      const channel = supabase
        .channel(`realtime-products-grid-${Math.random().toString(36).slice(2, 7)}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload: any) => {
            const eventType = payload.eventType;

            if (eventType === 'INSERT') {
              const newP = payload.new as Product;
              if (newP.is_active !== false) {
                setProducts(prev => {
                  if (prev.some(p => p.id === newP.id)) return prev;
                  return [newP, ...prev];
                });
              }
            } else if (eventType === 'UPDATE') {
              const updatedP = payload.new as Product;
              setProducts(prev => {
                if (updatedP.is_active === false) {
                  return prev.filter(p => p.id !== updatedP.id);
                }
                const index = prev.findIndex(p => p.id === updatedP.id);
                if (index !== -1) {
                  const copy = [...prev];
                  copy[index] = { ...copy[index], ...updatedP };
                  return copy;
                }
                return [updatedP, ...prev];
              });
            } else if (eventType === 'DELETE') {
              const deletedId = payload.old?.id;
              if (deletedId) {
                setProducts(prev => prev.filter(p => p.id !== deletedId));
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime product grid subscription failed:', err);
    }
  }, []);

  // Filter products by condition / featured if specified
  let displayed = products;
  if (filterCondition) {
    displayed = displayed.filter(p => p.condition === filterCondition);
  }
  if (filterFeaturedOnly) {
    displayed = displayed.filter(p => p.is_featured);
  }
  if (limit && limit > 0) {
    displayed = displayed.slice(0, limit);
  }

  if (displayed.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-muted)' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      {displayed.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
