import { Product } from '../types';
import { SAMPLE_PRODUCTS } from './products';
import { 
  getStoredProducts as getMasterProducts, 
  saveProducts as saveMasterProducts,
  syncMasterDataWithCloud 
} from './masterStore';

/**
 * Load products from master store
 */
export function getStoredProducts(): Product[] {
  return getMasterProducts();
}

/**
 * Save products to master store & trigger cloud sync
 */
export function saveProducts(products: Product[], syncToCloud = true): void {
  saveMasterProducts(products, syncToCloud);
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
 * Synchronize local products with master cloud store
 */
export async function syncProductsWithCloud(): Promise<Product[]> {
  await syncMasterDataWithCloud();
  return getStoredProducts();
}
