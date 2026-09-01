import { Product } from '../types';
import { SAMPLE_PRODUCTS } from './products';

const STORAGE_KEY = 'arona_mobiles_products_v1';

/**
 * Load products from localStorage or initialize with sample default catalog
 */
export function getStoredProducts(): Product[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read products from localStorage:', error);
  }
  
  // Fallback to sample products & save initial set
  saveProducts(SAMPLE_PRODUCTS);
  return SAMPLE_PRODUCTS;
}

/**
 * Save products array to localStorage and notify listeners
 */
export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('arona_products_updated'));
  } catch (error) {
    console.error('Failed to save products to localStorage:', error);
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
