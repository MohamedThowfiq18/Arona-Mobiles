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
  const ram = p.ram ? String(p.ram) : (p.specs?.ram ? String(p.specs.ram) : '');
  const storage = p.storage ? String(p.storage) : (p.variants?.[0]?.storage ? String(p.variants[0].storage) : (p.specs?.storage_built ? String(p.specs.storage_built) : ''));
  const color = p.color ? String(p.color) : (p.variants?.[0]?.color ? String(p.variants[0].color) : (p.specs?.color ? String(p.specs.color) : ''));
  const variant = p.variant ? String(p.variant) : (p.variants?.[0] ? `${p.variants[0].color || ''} ${p.variants[0].storage || ''}`.trim() : (color || storage ? `${color} ${storage}`.trim() : ''));
  const price = Number(p.price) || 0;
  const originalPrice = p.original_price ? Number(p.original_price) : undefined;
  const discountPrice = p.discount_price ? Number(p.discount_price) : undefined;
  const stock = Number(p.stock) || 0;
  const isActive = p.is_active ?? p.published ?? true;
  const isFeatured = Boolean(p.is_featured ?? p.featured);
  const offer = p.offer ? String(p.offer) : (p.specs?.offer_details ? String(p.specs.offer_details) : '');
  const available = p.available ?? (stock > 0 && isActive);

  return {
    ...p,
    id: String(p.id),
    brand: p.brand || 'Other',
    model: p.model || 'New Phone',
    variant,
    ram,
    storage,
    color,
    image_url: primaryImg,
    images: imgList,
    price,
    original_price: originalPrice,
    discount_price: discountPrice,
    stock,
    offer,
    available,
    featured: isFeatured,
    published: isActive,
    is_active: isActive,
    is_featured: isFeatured,
    specs: p.specs || { ram, storage_built: storage, color, offer_details: offer },
    variants: Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [{ color: color || 'Default', storage: storage || 'Standard', price, discount_price: discountPrice, stock, images: imgList }],
    tags: Array.isArray(p.tags) ? p.tags : ['smartphone', (p.brand || 'phone').toLowerCase()],
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
  return local.filter(p => p.is_active !== false && p.published !== false);
}

export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data: byId } = await supabase.from('products').select('*').eq('id', idOrSlug).maybeSingle();
      if (byId) return normalizeProduct(byId);

      const { data: bySlug } = await supabase.from('products').select('*').eq('slug', idOrSlug).maybeSingle();
      if (bySlug) return normalizeProduct(bySlug);
    } catch (err) {
      console.warn('Supabase getProductByIdOrSlug query error:', err);
    }
  }

  const local = readLocalProducts().map(normalizeProduct);
  return local.find(p => p.id === idOrSlug || p.slug === idOrSlug) || null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(p => p.is_featured || p.featured);
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
  const id = productData.id && String(productData.id).trim().length > 0
    ? String(productData.id).trim()
    : randomUUID();

  const slug = productData.slug || productData.model?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `phone-${Date.now()}`;
  const now = new Date().toISOString();
  const primaryImg = productData.image_url || (productData.images && productData.images[0]) || 'https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=600';
  const imgList = productData.images && productData.images.length > 0 ? productData.images : [primaryImg];

  const ram = productData.ram || (productData.specs?.ram ? String(productData.specs.ram) : '');
  const storage = productData.storage || productData.variants?.[0]?.storage || (productData.specs?.storage_built ? String(productData.specs.storage_built) : '');
  const color = productData.color || productData.variants?.[0]?.color || (productData.specs?.color ? String(productData.specs.color) : '');
  const variant = productData.variant || (color || storage ? `${color} ${storage}`.trim() : 'Standard');
  const offer = productData.offer || (productData.specs?.offer_details ? String(productData.specs.offer_details) : '');

  const price = Number(productData.price) || 0;
  const originalPrice = productData.original_price !== undefined ? Number(productData.original_price) : (productData.discount_price ? price : undefined);
  const discountPrice = productData.discount_price !== undefined ? Number(productData.discount_price) : undefined;
  const stock = Number(productData.stock) || 0;
  const isActive = productData.is_active ?? productData.published ?? true;
  const isFeatured = Boolean(productData.is_featured ?? productData.featured);

  const payloadSpecs = {
    ...(productData.specs || {}),
    ram,
    storage_built: storage,
    color,
    offer_details: offer,
  };

  const payloadVariants = productData.variants && productData.variants.length > 0
    ? productData.variants
    : [
        {
          color: color || 'Default',
          storage: storage || 'Standard',
          price,
          discount_price: discountPrice,
          stock,
          images: imgList,
        },
      ];

  const newProduct: Product = {
    id,
    brand_id: productData.brand_id || 'b1000000-0000-0000-0000-000000000001',
    category_id: productData.category_id || (productData.condition === 'pre-owned' ? 'c1000000-0000-0000-0000-000000000002' : 'c1000000-0000-0000-0000-000000000001'),
    brand: productData.brand || 'Other',
    model: productData.model || 'New Phone',
    variant,
    ram,
    storage,
    color,
    slug,
    condition: productData.condition || 'new',
    grade: productData.grade || undefined,
    short_description: productData.short_description || `${productData.brand || ''} ${productData.model || ''}`.trim(),
    description: productData.description || productData.short_description || '',
    specs: payloadSpecs,
    variants: payloadVariants,
    images: imgList,
    image_url: primaryImg,
    price,
    original_price: originalPrice,
    discount_price: discountPrice,
    stock,
    offer,
    available: stock > 0 && isActive,
    featured: isFeatured,
    published: isActive,
    sku: productData.sku || `${(productData.brand || 'PHONE').slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    is_featured: isFeatured,
    is_active: isActive,
    flash_sale_ends_at: productData.flash_sale_ends_at,
    inspection_report: productData.inspection_report,
    tags: productData.tags || ['smartphone', (productData.brand || 'mobile').toLowerCase()],
    average_rating: productData.average_rating || 5.0,
    review_count: productData.review_count || 1,
    sold_count: productData.sold_count || 0,
    created_at: now,
    updated_at: now,
  };

  // 1. Primary persistence to Supabase PostgreSQL table
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
  const primaryImg = updates.image_url || (updates.images && updates.images[0]);
  const imgList = updates.images && updates.images.length > 0 ? updates.images : (primaryImg ? [primaryImg] : undefined);
  const isActive = updates.is_active !== undefined ? updates.is_active : (updates.published !== undefined ? updates.published : undefined);
  const isFeatured = updates.is_featured !== undefined ? updates.is_featured : (updates.featured !== undefined ? updates.featured : undefined);

  const normalizedUpdates: Record<string, any> = {
    ...updates,
    ...(primaryImg ? { image_url: primaryImg } : {}),
    ...(imgList ? { images: imgList } : {}),
    ...(updates.price !== undefined ? { price: Number(updates.price) } : {}),
    ...(updates.original_price !== undefined ? { original_price: Number(updates.original_price) } : {}),
    ...(updates.discount_price !== undefined ? { discount_price: updates.discount_price ? Number(updates.discount_price) : null } : {}),
    ...(updates.stock !== undefined ? { stock: Number(updates.stock) } : {}),
    ...(isActive !== undefined ? { is_active: isActive, published: isActive } : {}),
    ...(isFeatured !== undefined ? { is_featured: isFeatured, featured: isFeatured } : {}),
    ...(updates.stock !== undefined && isActive !== undefined ? { available: Number(updates.stock) > 0 && isActive } : {}),
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
        .maybeSingle();

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
    const index = localProducts.findIndex(p => String(p.id) === String(id));
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
    const filtered = localProducts.filter(p => String(p.id) !== String(id));
    writeLocalProducts(filtered);
  } catch (err) {
    console.warn('Local product delete skipped:', err);
  }

  return true;
}
