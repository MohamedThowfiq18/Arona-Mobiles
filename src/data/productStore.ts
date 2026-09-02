import { Product } from '../types';
import { SAMPLE_PRODUCTS } from './products';
import { fetchCloudProducts, pushCloudProducts } from './cloudStore';
import { safeLocalStorage } from '../utils/safeStorage';

const STORAGE_KEY = 'arona_mobiles_products_v1';

/**
 * Load products from localStorage or initialize with sample default catalog
 */
export function getStoredProducts(): Product[] {
  try {
    const saved = safeLocalStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read products from storage:', error);
  }
  
  // Fallback to sample products & save initial set
  saveProducts(SAMPLE_PRODUCTS, false);
  return SAMPLE_PRODUCTS;
}

/**
 * Save products array to localStorage, trigger local event, and push to cloud
 */
export function saveProducts(products: Product[], syncToCloud = true): void {
  try {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('arona_products_updated'));
    }
    
    if (syncToCloud) {
      pushCloudProducts(products).catch(err => console.warn('Cloud sync error:', err));
    }
  } catch (error) {
    console.error('Failed to save products:', error);
  }
}

/**
 * Add a new product uploaded by the owner
 */
export function addProduct(product: Product): Product[] {
  const current = getStoredProducts();
  const updated = [product, ...current];
  saveProducts(updated);
  return updated;
}

/**
 * Update an existing product
 */
export function updateProduct(id: string, updatedFields: Partial<Product>): Product[] {
  const current = getStoredProducts();
  const updated = current.map(item => item.id === id ? { ...item, ...updatedFields } : item);
  saveProducts(updated);
  return updated;
}

/**
 * Delete a product by ID
 */
export function deleteProduct(id: string): Product[] {
  const current = getStoredProducts();
  const updated = current.filter(item => item.id !== id);
  saveProducts(updated);
  return updated;
}

/**
 * Reset catalog back to original defaults
 */
export function resetProductsToDefault(): Product[] {
  saveProducts(SAMPLE_PRODUCTS);
  return SAMPLE_PRODUCTS;
}

/**
 * Synchronize local products with global cloud store so all devices worldwide show identical data
 */
export async function syncProductsWithCloud(): Promise<Product[]> {
  try {
    const cloudProducts = await fetchCloudProducts();
    if (cloudProducts && cloudProducts.length > 0) {
      const localRaw = safeLocalStorage.getItem(STORAGE_KEY);
      const cloudRaw = JSON.stringify(cloudProducts);
      
      if (localRaw !== cloudRaw) {
        safeLocalStorage.setItem(STORAGE_KEY, cloudRaw);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('arona_products_updated'));
        }
      }
      return cloudProducts;
    }
  } catch (error) {
    console.warn('Cloud store sync error:', error);
  }
  
  const currentLocal = getStoredProducts();
  pushCloudProducts(currentLocal).catch(() => {});
  return currentLocal;
}

// Auto-sync on window load and periodically
if (typeof window !== 'undefined') {
  // Sync on startup
  setTimeout(() => syncProductsWithCloud(), 100);

  // Sync on tab focus
  window.addEventListener('focus', () => {
    syncProductsWithCloud();
  });

  // Sync every 10 seconds
  setInterval(() => {
    syncProductsWithCloud();
  }, 10000);
}
