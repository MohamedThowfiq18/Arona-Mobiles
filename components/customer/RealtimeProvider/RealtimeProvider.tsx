'use client';

import { useEffect } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import type { Product } from '@/lib/types';

/**
 * RealtimeProvider
 * Subscribes to Supabase Realtime changes on the `products` table.
 * Shows a toast when the owner adds/edits/removes a product while
 * a customer is browsing. Renders nothing to the DOM.
 */
export default function RealtimeProvider() {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = getSupabaseClient();

    const channel = supabase
      .channel('products-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload: any) => {
          switch (payload.eventType) {
            case 'INSERT': {
              const p = payload.new as Product;
              showToast({
                type: 'info',
                title: `New phone added: ${p.brand} ${p.model}`,
                message: 'Just arrived in stock — check it out!',
              });
              break;
            }
            case 'UPDATE': {
              const p = payload.new as Product;
              const old = payload.old as Partial<Product>;
              if (old.price !== p.price || old.discount_price !== p.discount_price) {
                showToast({
                  type: 'success',
                  title: `Price updated: ${p.brand} ${p.model}`,
                  message: `Now from ₹${(p.discount_price ?? p.price).toLocaleString('en-IN')}`,
                });
              } else if (!p.is_active) {
                showToast({
                  type: 'default',
                  title: `${p.brand} ${p.model} is temporarily unavailable`,
                });
              }
              break;
            }
            case 'DELETE': {
              // product removed — no noisy toast
              break;
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
