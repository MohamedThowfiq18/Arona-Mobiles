import { randomUUID } from 'crypto';
import type { Product } from '@/lib/types';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

function normalizeProduct(p: any): Product {
  const primaryImg = p.image_url || (Array.isArray(p.images) && p.images[0]) || '';
  const imgList = Array.isArray(p.images) && p.images.length > 0 
    ? p.images 
    : (primaryImg ? [primaryImg] : []);
  
  const ram = p.ram ? String(p.ram) : (p.specs?.ram ? String(p.specs.ram) : '');
  const storage = p.storage ? String(p.storage) : (p.variants?.[0]?.storage ? String(p.variants[0].storage) : (p.specs?.storage_built ? String(p.specs.storage_built) : ''));
  const color = p.color ? String(p.color) : (p.variants?.[0]?.color ? String(p.variants[0].color) : (p.specs?.color ? String(p.specs.color) : ''));
  const variant = p.variant ? String(p.variant) : (p.variants?.[0] ? `${p.variants[0].color || ''} ${p.variants[0].storage || ''}`.trim() : (color || storage ? `${color} ${storage}`.trim() : ''));
  const price = Number(p.price) || 0;
  const originalPrice = p.original_price !== undefined && p.original_price !== null ? Number(p.original_price) : undefined;
  const discountPrice = p.discount_price !== undefined && p.discount_price !== null ? Number(p.discount_price) : undefined;
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
    variants: Array.isArray(p.variants) && p.variants.length > 0 
      ? p.variants 
      : [{ color: color || 'Default', storage: storage || 'Standard', price, discount_price: discountPrice, stock, images: imgList }],
    tags: Array.isArray(p.tags) ? p.tags : ['smartphone', (p.brand || 'phone').toLowerCase()],
    average_rating: Number(p.average_rating) || 5.0,
    review_count: Number(p.review_count) || 0,
    sold_count: Number(p.sold_count) || 0,
  };
}

export async function getAllProducts(includeInactive = false): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured on server.');
    return [];
  }

  const supabase = getSupabaseAdminClient();
  let query = supabase.from('products').select('*').order('created_at', { ascending: false });
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Supabase getAllProducts query error:', error);
    throw new Error(`Failed to fetch products from Supabase: ${error.message}`);
  }

  return (data || []).map(normalizeProduct);
}

export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured on server.');
    return null;
  }

  const supabase = getSupabaseAdminClient();
  
  // Try querying by ID first
  const { data: byId, error: idErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', idOrSlug)
    .maybeSingle();

  if (byId) return normalizeProduct(byId);

  // If not found by ID, try querying by slug
  const { data: bySlug, error: slugErr } = await supabase
    .from('products')
    .select('*')
    .eq('slug', idOrSlug)
    .maybeSingle();

  if (bySlug) return normalizeProduct(bySlug);

  if (idErr) console.warn('Supabase getProduct query by ID error:', idErr);
  if (slugErr) console.warn('Supabase getProduct query by slug error:', slugErr);

  return null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getAllProducts(false);
  return all.filter(p => p.is_featured || p.featured);
}

export async function getBestSellers(): Promise<Product[]> {
  const all = await getAllProducts(false);
  return all
    .filter(p => p.condition === 'new')
    .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
    .slice(0, 8);
}

export async function getPreOwnedProducts(): Promise<Product[]> {
  const all = await getAllProducts(false);
  return all.filter(p => p.condition === 'pre-owned');
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are not configured. Cannot save product to database.');
  }

  const id = productData.id && String(productData.id).trim().length > 0
    ? String(productData.id).trim()
    : randomUUID();

  const slug = productData.slug || productData.model?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `phone-${Date.now()}`;
  const now = new Date().toISOString();
  const primaryImg = productData.image_url || (productData.images && productData.images[0]) || '';
  const imgList = productData.images && productData.images.length > 0 ? productData.images : (primaryImg ? [primaryImg] : []);

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

  const newProduct: Record<string, any> = {
    id,
    brand_id: productData.brand_id || null,
    category_id: productData.category_id || null,
    brand: productData.brand || 'Other',
    model: productData.model || 'New Phone',
    variant,
    ram,
    storage,
    color,
    slug,
    condition: productData.condition || 'new',
    grade: productData.grade || null,
    short_description: productData.short_description || `${productData.brand || ''} ${productData.model || ''}`.trim(),
    description: productData.description || productData.short_description || '',
    specs: payloadSpecs,
    variants: payloadVariants,
    images: imgList,
    image_url: primaryImg,
    price,
    original_price: originalPrice ?? null,
    discount_price: discountPrice ?? null,
    stock,
    offer: offer || null,
    available: stock > 0 && isActive,
    featured: isFeatured,
    published: isActive,
    sku: productData.sku || `${(productData.brand || 'PHONE').slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    is_featured: isFeatured,
    is_active: isActive,
    flash_sale_ends_at: productData.flash_sale_ends_at || null,
    inspection_report: productData.inspection_report || {},
    tags: productData.tags || ['smartphone', (productData.brand || 'mobile').toLowerCase()],
    average_rating: productData.average_rating || 5.0,
    review_count: productData.review_count || 1,
    sold_count: productData.sold_count || 0,
    created_at: now,
    updated_at: now,
  };

  // Primary persistence strictly to Supabase PostgreSQL table
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('products')
    .insert(newProduct)
    .select('*')
    .single();

  if (error) {
    console.error('Supabase product insert error:', error);
    throw new Error(`Database insert failed: ${error.message} (${error.code || 'UNKNOWN'})`);
  }

  return normalizeProduct(data || newProduct);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are not configured. Cannot update product in database.');
  }

  const primaryImg = updates.image_url || (updates.images && updates.images[0]);
  const imgList = updates.images && updates.images.length > 0 ? updates.images : (primaryImg ? [primaryImg] : undefined);
  const isActive = updates.is_active !== undefined ? updates.is_active : (updates.published !== undefined ? updates.published : undefined);
  const isFeatured = updates.is_featured !== undefined ? updates.is_featured : (updates.featured !== undefined ? updates.featured : undefined);

  const normalizedUpdates: Record<string, any> = {
    ...updates,
    ...(primaryImg ? { image_url: primaryImg } : {}),
    ...(imgList ? { images: imgList } : {}),
    ...(updates.price !== undefined ? { price: Number(updates.price) } : {}),
    ...(updates.original_price !== undefined ? { original_price: updates.original_price ? Number(updates.original_price) : null } : {}),
    ...(updates.discount_price !== undefined ? { discount_price: updates.discount_price ? Number(updates.discount_price) : null } : {}),
    ...(updates.stock !== undefined ? { stock: Number(updates.stock) } : {}),
    ...(isActive !== undefined ? { is_active: isActive, published: isActive } : {}),
    ...(isFeatured !== undefined ? { is_featured: isFeatured, featured: isFeatured } : {}),
    ...(updates.stock !== undefined && isActive !== undefined ? { available: Number(updates.stock) > 0 && isActive } : {}),
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('products')
    .update(normalizedUpdates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Supabase product update error:', error);
    throw new Error(`Database update failed: ${error.message} (${error.code || 'UNKNOWN'})`);
  }

  if (!data) {
    throw new Error(`Product with ID "${id}" was not found in Supabase.`);
  }

  return normalizeProduct(data);
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are not configured. Cannot delete product from database.');
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error('Supabase product delete error:', error);
    throw new Error(`Database delete failed: ${error.message} (${error.code || 'UNKNOWN'})`);
  }

  return true;
}
