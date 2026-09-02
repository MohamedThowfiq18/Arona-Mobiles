import { Product } from '../types';

// Global Cloud Object Endpoint for ARONA MOBILES Catalog
const CLOUD_OBJECT_ID = 'ff808181a061cdc401a0635da4b7062d';
const CLOUD_URL = `https://api.restful-api.dev/objects/${CLOUD_OBJECT_ID}`;

/**
 * Fetch the latest catalog from global cloud storage
 */
export async function fetchCloudProducts(): Promise<Product[] | null> {
  try {
    const res = await fetch(CLOUD_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.data?.products && Array.isArray(json.data.products) && json.data.products.length > 0) {
      return json.data.products as Product[];
    }
  } catch (error) {
    console.warn('Cloud store fetch warning:', error);
  }
  return null;
}

/**
 * Push the updated catalog array to global cloud storage so all users across the world see it instantly
 */
export async function pushCloudProducts(products: Product[]): Promise<boolean> {
  try {
    const res = await fetch(CLOUD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'arona_mobiles_master_catalog',
        data: { products, lastUpdated: Date.now() }
      })
    });
    return res.ok;
  } catch (error) {
    console.warn('Cloud store update warning:', error);
    return false;
  }
}
