import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Product, ShopFilters } from '@/lib/types';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');

function readLocalProducts(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local products.json:', err);
  }
  return [];
}

function writeLocalProducts(products: Product[]) {
  try {
    const dir = path.dirname(PRODUCTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    // On Vercel / serverless runtime, filesystem may be read-only; silently ignore or warn
    console.warn('Local products.json write skipped (read-only environment):', err);
  }
}

/**
 * Check if Supabase credentials are valid (not default placeholder)
 */
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('placeholder.supabase.co') && !url.includes('your-project-id'));
}

function normalizeProduct(p: any): Product {
  const primaryImg = p.image_url || (Array.isArray(p.images) && p.images[0]) || 'https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=600';
  const imgList = Array.isArray(p.images) && p.images.length > 0 ? p.images : [primaryImg];
  return {
    ...p,
    image_url: primaryImg,
    images: imgList,
    price: Number(p.price) || 0,
    discount_price: p.discount_price ? Number(p.discount_price) : undefined,
    stock: Number(p.stock) || 0,
    is_active: p.is_active ?? true,
    is_featured: Boolean(p.is_featured),
    specs: p.specs || {},
    variants: Array.isArray(p.variants) ? p.variants : [],
    tags: Array.isArray(p.tags) ? p.tags : [],
  };
}

export async function getAllProducts(includeInactive = false): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && data) {
        return (data as any[]).map(normalizeProduct);
      }
      if (error) {
        console.warn('Supabase products fetch error:', error);
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local file:', err);
    }
  }

  // Fallback to local store
  const local = readLocalProducts().map(normalizeProduct);
  if (includeInactive) return local;
  return local.filter(p => p.is_active !== false);
}

export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      // Try ID first if it looks like a valid UUID, then slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      
      if (isUUID) {
        const { data } = await supabase.from('products').select('*').eq('id', idOrSlug).single();
        if (data) return normalizeProduct(data);
      }
      
      const res = await supabase.from('products').select('*').eq('slug', idOrSlug).single();
      if (res.data) return normalizeProduct(res.data);
    } catch {
      // Fallback
    }
  }

  const local = readLocalProducts().map(normalizeProduct);
  return local.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(p => p.is_featured);
}

export async function getBestSellers(): Promise<Product[]> {
  const all = await getAllProducts();
  return all
    .filter(p => p.condition === 'new')
    .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
    .slice(0, 8);
}

export async function getPreOwnedProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(p => p.condition === 'pre-owned');
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const id = productData.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productData.id)
    ? productData.id
    : randomUUID();

  const slug = productData.slug || productData.model?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `phone-${Date.now()}`;
  const now = new Date().toISOString();

  const newProduct: Product = {
    id,
    brand_id: productData.brand_id || 'b1000000-0000-0000-0000-000000000001',
    category_id: productData.category_id || (productData.condition === 'pre-owned' ? 'c1000000-0000-0000-0000-000000000002' : 'c1000000-0000-0000-0000-000000000001'),
    brand: productData.brand || 'Other',
    model: productData.model || 'New Phone',
    slug,
    condition: productData.condition || 'new',
    grade: productData.grade || undefined,
    short_description: productData.short_description || `${productData.brand} ${productData.model}`,
    description: productData.description || productData.short_description,
    specs: productData.specs || {},
    variants: productData.variants || [],
    images: productData.images && productData.images.length > 0 ? productData.images : (productData.image_url ? [productData.image_url] : ['https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=600']),
    image_url: productData.image_url || (productData.images && productData.images[0]) || 'https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=600',
    price: Number(productData.price) || 0,
    discount_price: productData.discount_price ? Number(productData.discount_price) : undefined,
    stock: Number(productData.stock) || 1,
    sku: productData.sku || `${(productData.brand || 'PHONE').slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    is_featured: Boolean(productData.is_featured),
    is_active: productData.is_active ?? true,
    flash_sale_ends_at: productData.flash_sale_ends_at,
    inspection_report: productData.inspection_report,
    tags: productData.tags || ['smartphone', productData.brand?.toLowerCase() || 'mobile'],
    average_rating: productData.average_rating || 5.0,
    review_count: productData.review_count || 1,
    sold_count: productData.sold_count || 0,
    created_at: now,
    updated_at: now,
  };

  // 1. Primary persistence to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase.from('products').insert(newProduct);
      if (error) {
        console.error('Supabase product insert error:', error);
      }
    } catch (err) {
      console.warn('Supabase product insert failed:', err);
    }
  }

  // 2. Safe local store fallback
  try {
    const localProducts = readLocalProducts();
    localProducts.unshift(newProduct);
    writeLocalProducts(localProducts);
  } catch (err) {
    console.warn('Local product write skipped:', err);
  }

  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const normalizedUpdates: Record<string, any> = {
    ...updates,
    ...(updates.image_url && !updates.images ? { images: [updates.image_url] } : {}),
    ...(updates.images && updates.images.length > 0 && !updates.image_url ? { image_url: updates.images[0] } : {}),
    ...(updates.price !== undefined ? { price: Number(updates.price) } : {}),
    ...(updates.discount_price !== undefined ? { discount_price: updates.discount_price ? Number(updates.discount_price) : null } : {}),
    ...(updates.stock !== undefined ? { stock: Number(updates.stock) } : {}),
    updated_at: new Date().toISOString(),
  };

  let updatedProduct: Product | null = null;

  // 1. Primary update to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('products')
        .update(normalizedUpdates)
        .eq('id', id)
        .select('*')
        .single();

      if (!error && data) {
        updatedProduct = normalizeProduct(data);
      } else if (error) {
        console.warn('Supabase product update error:', error);
      }
    } catch (err) {
      console.warn('Supabase product update failed:', err);
    }
  }

  // 2. Also update local cache
  try {
    const localProducts = readLocalProducts();
    const index = localProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      const merged = normalizeProduct({
        ...localProducts[index],
        ...normalizedUpdates,
      });
      localProducts[index] = merged;
      writeLocalProducts(localProducts);
      if (!updatedProduct) updatedProduct = merged;
    }
  } catch (err) {
    console.warn('Local product update skipped:', err);
  }

  if (updatedProduct) return updatedProduct;

  // If local had it even without Supabase
  const fallback = await getProductByIdOrSlug(id);
  if (fallback) {
    return normalizeProduct({
      ...fallback,
      ...normalizedUpdates,
    });
  }

  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  let deletedFromSupabase = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        deletedFromSupabase = true;
      } else {
        console.warn('Supabase product delete error:', error);
      }
    } catch (err) {
      console.warn('Supabase product delete failed:', err);
    }
  }

  try {
    const localProducts = readLocalProducts();
    const filtered = localProducts.filter(p => p.id !== id);
    writeLocalProducts(filtered);
  } catch (err) {
    console.warn('Local product delete skipped:', err);
  }

  return true;
}
