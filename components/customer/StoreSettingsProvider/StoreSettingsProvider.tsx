'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { StoreSettings } from '@/lib/types';
import { DEFAULT_STORE_SETTINGS } from '@/lib/constants';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';


interface StoreSettingsContextType {
  settings: StoreSettings;
  primaryPhone: string;
  primaryPhoneRaw: string;
  secondaryPhone: string;
  secondaryPhoneRaw: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  googleMapsUrl: string;
  getWhatsAppInquiryUrl: (productName?: string, price?: number, variant?: string) => string;
  getWhatsAppSupportUrl: (queryText?: string) => string;
  refreshSettings: () => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  settings: DEFAULT_STORE_SETTINGS,
  primaryPhone: DEFAULT_STORE_SETTINGS.phone_primary,
  primaryPhoneRaw: DEFAULT_STORE_SETTINGS.phone_primary_raw,
  secondaryPhone: DEFAULT_STORE_SETTINGS.phone_secondary,
  secondaryPhoneRaw: DEFAULT_STORE_SETTINGS.phone_secondary_raw,
  whatsappNumber: DEFAULT_STORE_SETTINGS.whatsapp_number,
  whatsappDisplay: DEFAULT_STORE_SETTINGS.whatsapp_display,
  googleMapsUrl: DEFAULT_STORE_SETTINGS.google_maps_url || 'https://maps.app.goo.gl/BREhQPtfQ333NG248?g_st=ac',
  getWhatsAppInquiryUrl: () => '',
  getWhatsAppSupportUrl: () => '',
  refreshSettings: async () => {},
});

export function StoreSettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: StoreSettings;
}) {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings || DEFAULT_STORE_SETTINGS);

  const fetchLatestSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchLatestSettings();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLatestSettings();
      }
    };
    const handleOnline = () => {
      fetchLatestSettings();
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', fetchLatestSettings);
    window.addEventListener('online', handleOnline);

    // Setup Supabase Realtime listener for live database updates
    let channel: ReturnType<ReturnType<typeof getSupabaseClient>['channel']> | null = null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        channel = supabase
          .channel('store-settings-live')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'store_settings' },
            (payload: any) => {
              if (payload.new) {
                setSettings(prev => ({
                  ...prev,
                  ...payload.new,
                }));
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime store settings subscription failed:', err);
      }
    }

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', fetchLatestSettings);
      window.removeEventListener('online', handleOnline);
      if (channel) {
        const supabase = getSupabaseClient();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const getWhatsAppInquiryUrl = (productName?: string, price?: number, variant?: string): string => {
    const wa = settings.whatsapp_number || DEFAULT_STORE_SETTINGS.whatsapp_number;
    let message = `Hi ${settings.store_name || 'ARONA MOBILES'}! I'm interested in buying a phone from your store.`;
    if (productName) {
      const formattedPrice = price
        ? ` (₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price)})`
        : '';
      const variantInfo = variant ? ` [${variant}]` : '';
      message = `Hi ${settings.store_name || 'ARONA MOBILES'}! I'm interested in ${productName}${variantInfo}${formattedPrice}. Is it currently available for store pickup?`;
    }
    return `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
  };

  const getWhatsAppSupportUrl = (queryText?: string): string => {
    const wa = settings.whatsapp_number || DEFAULT_STORE_SETTINGS.whatsapp_number;
    const message = queryText || `Hi ${settings.store_name || 'ARONA MOBILES'}! I have a query regarding store inventory / in-store pickup / repair.`;
    return `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
  };

  const value: StoreSettingsContextType = {
    settings,
    primaryPhone: settings.phone_primary || DEFAULT_STORE_SETTINGS.phone_primary,
    primaryPhoneRaw: settings.phone_primary_raw || DEFAULT_STORE_SETTINGS.phone_primary_raw,
    secondaryPhone: settings.phone_secondary || DEFAULT_STORE_SETTINGS.phone_secondary,
    secondaryPhoneRaw: settings.phone_secondary_raw || DEFAULT_STORE_SETTINGS.phone_secondary_raw,
    whatsappNumber: settings.whatsapp_number || DEFAULT_STORE_SETTINGS.whatsapp_number,
    whatsappDisplay: settings.whatsapp_display || DEFAULT_STORE_SETTINGS.whatsapp_display,
    googleMapsUrl: settings.google_maps_url || DEFAULT_STORE_SETTINGS.google_maps_url || 'https://maps.app.goo.gl/BREhQPtfQ333NG248?g_st=ac',
    getWhatsAppInquiryUrl,
    getWhatsAppSupportUrl,
    refreshSettings: fetchLatestSettings,
  };

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
