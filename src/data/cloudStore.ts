import { Product, BusinessConfigData, PromoOffer, AccessoryItem, ServiceItem } from '../types';

const PRIMARY_CLOUD_URL = 'https://api.restful-api.dev/objects/ff808181a061cdc401a0635da4b7062d';

function getCloudEndpoints(): string[] {
  const customUrl = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_CLOUD_DB_URL : '';
  const list: string[] = [];
  if (customUrl) list.push(customUrl);
  list.push(
    PRIMARY_CLOUD_URL,
    'https://api.restful-api.dev/objects/ff808181a061cdc401a065db724b7063e',
    'https://api.restful-api.dev/objects/ff808181a061cdc401a067ef894b7065f'
  );
  return list;
}

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
  const endpoints = getCloudEndpoints();
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data && typeof json.data === 'object' && Array.isArray(json.data.products)) {
          return json.data as MasterDataPayload;
        }
      }
    } catch (error) {
      console.warn(`Master cloud fetch attempt failed for ${url}:`, error);
    }
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

  const endpoints = getCloudEndpoints();
  for (const url of endpoints) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'arona_mobiles_master_database',
            data: fullPayload
          })
        });
        if (res.ok) return true;
      } catch (error) {
        console.warn(`Master cloud push attempt ${attempt} failed for ${url}:`, error);
      }
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

