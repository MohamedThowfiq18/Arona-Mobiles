'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Accessory, Product } from '@/lib/types';
import AccessoryCard from '@/components/customer/AccessoryCard/AccessoryCard';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { normalizeAccessory } from '@/lib/accessory-constants';
import styles from './RealtimeAccessoryGrid.module.css';

interface Props {
  initialAccessories: Accessory[];
  filterCategory?: string;
  filterBrand?: string;
  filterSearch?: string;
  filterInStockOnly?: boolean;
  filterMinPrice?: number;
  filterMaxPrice?: number;
  sortBy?: string;
  limit?: number;
  className?: string;
  emptyMessage?: string;
  onAddToCart?: (product: Product) => void;
}

export default function RealtimeAccessoryGrid({
  initialAccessories,
  filterCategory,
  filterBrand,
  filterSearch,
  filterInStockOnly,
  filterMinPrice,
  filterMaxPrice,
  sortBy = 'featured',
  limit,
  className,
  emptyMessage = 'No accessories found matching your criteria.',
  onAddToCart,
}: Props) {
  const [accessories, setAccessories] = useState<Accessory[]>(initialAccessories);

  useEffect(() => {
    setAccessories(initialAccessories);
  }, [initialAccessories]);

  const refreshAccessories = useCallback(async () => {
    try {
      const res = await fetch('/api/accessories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.accessories)) {
          setAccessories(data.accessories);
        }
      }
    } catch {
      // ignore network errors
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAccessories();
      }
    };
    const handleOnline = () => {
      refreshAccessories();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refreshAccessories);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshAccessories);
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshAccessories]);

  // Realtime subscription to public.accessories
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    try {
      const supabase = getSupabaseClient();
      const channel = supabase
        .channel(`realtime-accessories-grid-${Math.random().toString(36).slice(2, 7)}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'accessories' },
          (payload: any) => {
            const eventType = payload.eventType;

            if (eventType === 'INSERT') {
              const newA = normalizeAccessory(payload.new);
              const isVisible = newA.is_active !== false && newA.published !== false;
              if (isVisible) {
                setAccessories(prev => {
                  if (prev.some(a => String(a.id) === String(newA.id))) {
                    return prev.map(a => String(a.id) === String(newA.id) ? newA : a);
                  }
                  return [newA, ...prev];
                });
              }
            } else if (eventType === 'UPDATE') {
              const updatedA = normalizeAccessory(payload.new);
              const isVisible = updatedA.is_active !== false && updatedA.published !== false;
              setAccessories(prev => {
                if (!isVisible) {
                  return prev.filter(a => String(a.id) !== String(updatedA.id));
                }
                const index = prev.findIndex(a => String(a.id) === String(updatedA.id));
                if (index !== -1) {
                  const copy = [...prev];
                  copy[index] = { ...copy[index], ...updatedA };
                  return copy;
                }
                return [updatedA, ...prev];
              });
            } else if (eventType === 'DELETE') {
              const deletedId = payload.old?.id;
              if (deletedId) {
                setAccessories(prev => prev.filter(a => String(a.id) !== String(deletedId)));
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime accessories grid subscription failed:', err);
    }
  }, []);

  // Filtering
  let displayed = accessories;

  if (filterCategory) {
    const catLower = filterCategory.toLowerCase();
    displayed = displayed.filter(a =>
      a.category.toLowerCase() === catLower ||
      (a.subcategory && a.subcategory.toLowerCase() === catLower)
    );
  }

  if (filterBrand) {
    displayed = displayed.filter(a => a.brand.toLowerCase() === filterBrand.toLowerCase());
  }

  if (filterSearch && filterSearch.trim().length > 0) {
    const q = filterSearch.toLowerCase().trim();
    displayed = displayed.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.brand.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      (a.compatibility && a.compatibility.toLowerCase().includes(q)) ||
      (a.description && a.description.toLowerCase().includes(q))
    );
  }

  if (filterInStockOnly) {
    displayed = displayed.filter(a => a.stock > 0);
  }

  if (filterMinPrice !== undefined) {
    displayed = displayed.filter(a => (a.discount_price ?? a.price) >= filterMinPrice);
  }

  if (filterMaxPrice !== undefined) {
    displayed = displayed.filter(a => (a.discount_price ?? a.price) <= filterMaxPrice);
  }

  // Sorting
  switch (sortBy) {
    case 'price_asc':
      displayed.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
      break;
    case 'price_desc':
      displayed.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
      break;
    case 'newest':
      displayed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case 'name_asc':
      displayed.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'featured':
    default:
      displayed.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      break;
  }

  if (limit && limit > 0) {
    displayed = displayed.slice(0, limit);
  }

  if (displayed.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <span className={styles.emptyIcon}>🔍</span>
        <h3 className={styles.emptyTitle}>No accessories found</h3>
        <p className={styles.emptyText}>{emptyMessage}</p>
      </div>
    );
  }

  const combinedClass = className ? `${styles.grid} ${className}` : styles.grid;

  return (
    <div className={combinedClass}>
      {displayed.map(a => (
        <AccessoryCard key={a.id} accessory={a} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
