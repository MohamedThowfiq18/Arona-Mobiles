'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/customer/ProductCard/ProductCard';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

import styles from './RealtimeProductGrid.module.css';

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
    // Listen for tab focus and online reconnect to refresh stock immediately
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProducts();
      }
    };
    const handleOnline = () => {
      refreshProducts();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refreshProducts);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshProducts);
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshProducts]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    function normalizeRealtimeProduct(p: any): Product {
      const primaryImg = p.image_url || (Array.isArray(p.images) && p.images[0]) || '';
      const imgList = Array.isArray(p.images) && p.images.length > 0 ? p.images : (primaryImg ? [primaryImg] : []);
      return {
        ...p,
        id: String(p.id),
        brand: p.brand || 'Other',
        model: p.model || 'New Phone',
        price: Number(p.price) || 0,
        original_price: p.original_price ? Number(p.original_price) : undefined,
        discount_price: p.discount_price ? Number(p.discount_price) : undefined,
        stock: Number(p.stock) || 0,
        is_active: p.is_active ?? p.published ?? true,
        published: p.published ?? p.is_active ?? true,
        is_featured: Boolean(p.is_featured ?? p.featured),
        featured: Boolean(p.featured ?? p.is_featured),
        image_url: primaryImg,
        images: imgList,
      };
    }

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
              const newP = normalizeRealtimeProduct(payload.new);
              const isVisible = newP.is_active !== false && newP.published !== false;
              if (isVisible) {
                setProducts(prev => {
                  if (prev.some(p => String(p.id) === String(newP.id))) {
                    return prev.map(p => String(p.id) === String(newP.id) ? newP : p);
                  }
                  return [newP, ...prev];
                });
              }
            } else if (eventType === 'UPDATE') {
              const updatedP = normalizeRealtimeProduct(payload.new);
              const isVisible = updatedP.is_active !== false && updatedP.published !== false;
              setProducts(prev => {
                if (!isVisible) {
                  return prev.filter(p => String(p.id) !== String(updatedP.id));
                }
                const index = prev.findIndex(p => String(p.id) === String(updatedP.id));
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
                setProducts(prev => prev.filter(p => String(p.id) !== String(deletedId)));
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

  const combinedClass = className ? `${styles.grid} ${className}` : styles.grid;

  return (
    <div className={combinedClass}>
      {displayed.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
