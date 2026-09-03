import { supabase } from '../config/supabase';
import { Product, BusinessConfigData, PromoOffer, AccessoryItem, ServiceItem } from '../types';
import { OwnerSession, getCurrentSession, logoutCurrentDevice } from '../utils/ownerAuth';
import { RealtimeChannel } from '@supabase/supabase-js';

const PRIMARY_REST_URL = 'https://api.restful-api.dev/objects/ff808181a061cdc401a0635da4b7062d';

export interface MasterDataPayload {
  products: Product[];
  businessConfig?: BusinessConfigData;
  offers?: PromoOffer[];
  accessories?: AccessoryItem[];
  services?: ServiceItem[];
  ownerPassword?: string;
  sessions?: OwnerSession[];
  activeOtp?: {
    code: string;
    phone: string;
    timestamp: number;
  };
  lastUpdated?: number;
}

let realtimeChannel: RealtimeChannel | null = null;
let activeMasterDataCache: MasterDataPayload | null = null;
let isConnectedToRealtime = false;

export function isRealtimeConnected(): boolean {
  return isConnectedToRealtime;
}

/**
 * Initialize Realtime Global Data Synchronization
 * Connects via Supabase Realtime WebSockets to broadcast changes live to all devices worldwide.
 */
export function initRealtimeGlobalSync(onDataReceived?: (data: MasterDataPayload) => void): void {
  if (realtimeChannel) return;

  try {
    realtimeChannel = supabase.channel('arona_global_realtime_v2', {
      config: {
        broadcast: { self: true },
      },
    });

    realtimeChannel
      .on('broadcast', { event: 'master_data_update' }, (payload) => {
        if (payload?.data && typeof payload.data === 'object') {
          console.log('⚡ REALTIME EVENT RECEIVED FROM CLOUD:', payload.event);
          const newData = payload.data as MasterDataPayload;
          activeMasterDataCache = newData;

          // Notify React components live without page reload
          notifyLocalDataUpdated();
          if (onDataReceived) onDataReceived(newData);

          // Check if current device's session was revoked
          const current = getCurrentSession();
          if (current && newData.sessions) {
            const match = newData.sessions.find(s => s.sessionId === current.sessionId);
            if (match && !match.active) {
              logoutCurrentDevice();
            }
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🟢 Connected to ARONA Realtime Global Data Stream');
          isConnectedToRealtime = true;
          dispatchConnectionState(true);
        } else {
          console.warn('Realtime status change:', status);
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            isConnectedToRealtime = false;
            dispatchConnectionState(false);
          }
        }
      });
  } catch (err) {
    console.warn('Realtime initialization warning:', err);
  }

  // Network Offline / Reconnect Handling & Periodic Sync Safety Net
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('🌐 Network reconnected! Re-syncing live database state...');
      dispatchConnectionState(true);
      fetchCloudMasterData().then(data => {
        if (data) {
          activeMasterDataCache = data;
          notifyLocalDataUpdated();
        }
      });
    });

    window.addEventListener('offline', () => {
      console.warn('⚠️ Network offline connection paused');
      dispatchConnectionState(false);
    });

    // Periodic silent sync safety net (every 10s)
    setInterval(() => {
      if (navigator.onLine) {
        fetchCloudMasterData().then(data => {
          if (data && JSON.stringify(data) !== JSON.stringify(activeMasterDataCache)) {
            console.log('🔄 Periodic Cloud Sync Re-alignment');
            activeMasterDataCache = data;
            notifyLocalDataUpdated();
          }
        }).catch(e => console.warn('Periodic sync check:', e));
      }
    }, 10000);
  }
}

function dispatchConnectionState(online: boolean) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('arona_connection_state', { detail: { online } }));
  }
}

function notifyLocalDataUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('arona_master_data_updated'));
    window.dispatchEvent(new Event('arona_products_updated'));
    window.dispatchEvent(new Event('arona_business_updated'));
    window.dispatchEvent(new Event('arona_offers_updated'));
    window.dispatchEvent(new Event('arona_accessories_updated'));
    window.dispatchEvent(new Event('arona_services_updated'));
  }
}

/**
 * Fetch the master payload directly from the Cloud Database (Single Source of Truth)
 */
export async function fetchCloudMasterData(): Promise<MasterDataPayload | null> {
  // 1. Attempt REST Cloud DB fetch
  try {
    const res = await fetch(PRIMARY_REST_URL, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data && typeof json.data === 'object' && Array.isArray(json.data.products)) {
        activeMasterDataCache = json.data as MasterDataPayload;
        return activeMasterDataCache;
      }
    }
  } catch (err) {
    console.warn('Cloud DB fetch notice:', err);
  }

  return activeMasterDataCache;
}

/**
 * Push updated master payload to Cloud DB & Broadcast Realtime Event to ALL connected devices globally
 */
export async function pushCloudMasterData(payload: MasterDataPayload): Promise<boolean> {
  const fullPayload: MasterDataPayload = {
    ...payload,
    lastUpdated: Date.now()
  };

  activeMasterDataCache = fullPayload;

  // 1. Broadcast REAL-TIME EVENT to all connected clients worldwide instantly
  if (realtimeChannel) {
    try {
      await realtimeChannel.send({
        type: 'broadcast',
        event: 'master_data_update',
        payload: { data: fullPayload, timestamp: Date.now() }
      });
      console.log('🚀 REALTIME BROADCAST SENT TO ALL CONNECTED CLIENTS');
    } catch (err) {
      console.warn('Realtime broadcast notice:', err);
    }
  }

  // 2. Persist to Cloud Database
  try {
    const res = await fetch(PRIMARY_REST_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'arona_mobiles_master_database',
        data: fullPayload
      })
    });
    if (res.ok) {
      notifyLocalDataUpdated();
      return true;
    }
  } catch (err) {
    console.warn('Cloud DB push notice:', err);
  }

  notifyLocalDataUpdated();
  return true;
}

/**
 * Backward compatibility helpers
 */
export async function fetchCloudProducts(): Promise<Product[] | null> {
  const master = await fetchCloudMasterData();
  return master?.products && Array.isArray(master.products) ? master.products : null;
}

export async function pushCloudProducts(products: Product[]): Promise<boolean> {
  const master = await fetchCloudMasterData();
  const updatedPayload: MasterDataPayload = {
    ...(master || { products: [] }),
    products
  };
  return pushCloudMasterData(updatedPayload);
}

// Auto-initialize real-time stream upon module load
if (typeof window !== 'undefined') {
  initRealtimeGlobalSync();
  fetchCloudMasterData().catch(e => console.warn('Initial cloud fetch notice:', e));
}
