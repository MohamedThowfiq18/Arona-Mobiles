import { Product, BusinessConfigData, PromoOffer, AccessoryItem, ServiceItem } from '../types';

// Global Cloud Object Endpoint for ARONA MOBILES Master Database
const CLOUD_OBJECT_ID = 'ff808181a061cdc401a0635da4b7062d';
const CLOUD_URL = `https://api.restful-api.dev/objects/${CLOUD_OBJECT_ID}`;

export interface MasterDataPayload {
  products: Product[];
  businessConfig?: BusinessConfigData;
  offers?: PromoOffer[];
  accessories?: AccessoryItem[];
  services?: ServiceItem[];
  ownerPassword?: string;
  activeOtp?: {
    code: string;
    phone: string;
    timestamp: number;
  };
  lastUpdated?: number;
}

/**
 * Fetch the full master payload from global cloud database
 */
export async function fetchCloudMasterData(): Promise<MasterDataPayload | null> {
  try {
    const res = await fetch(CLOUD_URL, { 
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.data && typeof json.data === 'object') {
      return json.data as MasterDataPayload;
    }
  } catch (error) {
    console.warn('Master cloud store fetch warning:', error);
  }
  return null;
}

/**
 * Push full master payload to global cloud database so all users worldwide update instantly
 */
export async function pushCloudMasterData(payload: MasterDataPayload): Promise<boolean> {
  const fullPayload = {
    ...payload,
    lastUpdated: Date.now()
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(CLOUD_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'arona_mobiles_master_database',
          data: fullPayload
        })
      });
      if (res.ok) return true;
    } catch (error) {
      console.warn(`Master cloud store update attempt ${attempt} failed:`, error);
    }
  }
  return false;
}

/**
 * Backward compatibility helpers for products
 */
export async function fetchCloudProducts(): Promise<Product[] | null> {
  const master = await fetchCloudMasterData();
  return master?.products && Array.isArray(master.products) ? master.products : null;
}

export async function pushCloudProducts(products: Product[]): Promise<boolean> {
  const master = await fetchCloudMasterData();
  const updatedPayload: MasterDataPayload = {
    ...(master || {}),
    products
  };
  return pushCloudMasterData(updatedPayload);
}

