import { randomUUID } from 'crypto';
import type { Accessory, AccessoryCategory } from '@/lib/types';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { INITIAL_ACCESSORY_CATEGORIES, INITIAL_ACCESSORIES, normalizeAccessory } from '@/lib/accessory-constants';

export { INITIAL_ACCESSORY_CATEGORIES, INITIAL_ACCESSORIES, normalizeAccessory };

export async function getAllAccessories(includeInactive = false): Promise<Accessory[]> {
  if (!isSupabaseConfigured()) {
    return includeInactive ? INITIAL_ACCESSORIES : INITIAL_ACCESSORIES.filter(a => a.is_active);
  }

  try {
    const supabase = getSupabaseAdminClient();
    let query = supabase.from('accessories').select('*').order('created_at', { ascending: false });
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) {
      // If table doesn't exist yet or has error, gracefully fall back to initial data
      console.warn('Supabase getAllAccessories error, using initial dataset:', error.message);
      return includeInactive ? INITIAL_ACCESSORIES : INITIAL_ACCESSORIES.filter(a => a.is_active);
    }

    if (!data || data.length === 0) {
      return includeInactive ? INITIAL_ACCESSORIES : INITIAL_ACCESSORIES.filter(a => a.is_active);
    }

    return data.map(normalizeAccessory);
  } catch (err) {
    console.warn('Error fetching accessories from Supabase:', err);
    return includeInactive ? INITIAL_ACCESSORIES : INITIAL_ACCESSORIES.filter(a => a.is_active);
  }
}

export async function getAccessoryById(id: string): Promise<Accessory | null> {
  if (!isSupabaseConfigured()) {
    const found = INITIAL_ACCESSORIES.find(a => a.id === id);
    return found ? normalizeAccessory(found) : null;
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (data) return normalizeAccessory(data);

    if (error) {
      console.warn('Supabase getAccessoryById error:', error.message);
    }

    // Check in initial accessories
    const fallback = INITIAL_ACCESSORIES.find(a => a.id === id);
    return fallback ? normalizeAccessory(fallback) : null;
  } catch (err) {
    console.warn('Error fetching accessory by ID from Supabase:', err);
    const fallback = INITIAL_ACCESSORIES.find(a => a.id === id);
    return fallback ? normalizeAccessory(fallback) : null;
  }
}

export async function getFeaturedAccessories(): Promise<Accessory[]> {
  const all = await getAllAccessories(false);
  return all.filter(a => a.is_featured);
}

export async function getAccessoryCategories(): Promise<AccessoryCategory[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_ACCESSORY_CATEGORIES;
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('accessory_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return INITIAL_ACCESSORY_CATEGORIES;
    }

    return data;
  } catch {
    return INITIAL_ACCESSORY_CATEGORIES;
  }
}

export async function createAccessory(accessoryData: Partial<Accessory>): Promise<Accessory> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are not configured. Cannot save accessory.');
  }

  const id = accessoryData.id && String(accessoryData.id).trim().length > 0
    ? String(accessoryData.id).trim()
    : `acc-${Date.now()}-${randomUUID().slice(0, 6)}`;

  const now = new Date().toISOString();
  const primaryImg = accessoryData.image_url || (accessoryData.images && accessoryData.images[0]) || '';
  const imgList = accessoryData.images && accessoryData.images.length > 0 ? accessoryData.images : (primaryImg ? [primaryImg] : []);

  const price = Number(accessoryData.price) || 0;
  const originalPrice = accessoryData.original_price !== undefined ? Number(accessoryData.original_price) : undefined;
  const discountPrice = accessoryData.discount_price !== undefined ? Number(accessoryData.discount_price) : undefined;
  const discountPercent = originalPrice && originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : (accessoryData.discount_percent || 0);
  
  const stock = Number(accessoryData.stock) || 0;
  const isActive = accessoryData.is_active ?? accessoryData.published ?? true;
  const isFeatured = Boolean(accessoryData.is_featured);

  const newRecord: Record<string, any> = {
    id,
    name: accessoryData.name || 'New Accessory',
    brand: accessoryData.brand || 'Other',
    category: accessoryData.category || 'Other Accessories',
    subcategory: accessoryData.subcategory || null,
    model_sku: accessoryData.model_sku || null,
    price,
    original_price: originalPrice ?? null,
    discount_price: discountPrice ?? null,
    discount_percent: discountPercent,
    offer: accessoryData.offer || null,
    stock,
    color: accessoryData.color || null,
    compatibility: accessoryData.compatibility || null,
    description: accessoryData.description || null,
    specs: accessoryData.specs || {},
    images: imgList,
    image_url: primaryImg,
    is_featured: isFeatured,
    is_active: isActive,
    published: isActive,
    available: stock > 0 && isActive,
    tags: accessoryData.tags || ['accessory', (accessoryData.brand || '').toLowerCase(), (accessoryData.category || '').toLowerCase()],
    average_rating: accessoryData.average_rating || 4.8,
    review_count: accessoryData.review_count || 1,
    sold_count: accessoryData.sold_count || 0,
    created_at: now,
    updated_at: now,
  };

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('accessories')
    .insert(newRecord)
    .select('*')
    .single();

  if (error) {
    console.error('Supabase accessory insert error:', error);
    throw new Error(`Database insert failed: ${error.message} (${error.code || 'UNKNOWN'})`);
  }

  return normalizeAccessory(data || newRecord);
}

export async function updateAccessory(id: string, updates: Partial<Accessory>): Promise<Accessory> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are not configured. Cannot update accessory.');
  }

  const primaryImg = updates.image_url || (updates.images && updates.images[0]);
  const imgList = updates.images && updates.images.length > 0 ? updates.images : (primaryImg ? [primaryImg] : undefined);
  const isActive = updates.is_active !== undefined ? updates.is_active : (updates.published !== undefined ? updates.published : undefined);
  const isFeatured = updates.is_featured !== undefined ? updates.is_featured : undefined;

  const normalizedUpdates: Record<string, any> = {
    ...updates,
    ...(primaryImg ? { image_url: primaryImg } : {}),
    ...(imgList ? { images: imgList } : {}),
    ...(updates.price !== undefined ? { price: Number(updates.price) } : {}),
    ...(updates.original_price !== undefined ? { original_price: updates.original_price ? Number(updates.original_price) : null } : {}),
    ...(updates.discount_price !== undefined ? { discount_price: updates.discount_price ? Number(updates.discount_price) : null } : {}),
    ...(updates.discount_percent !== undefined ? { discount_percent: Number(updates.discount_percent) } : {}),
    ...(updates.stock !== undefined ? { stock: Number(updates.stock) } : {}),
    ...(isActive !== undefined ? { is_active: isActive, published: isActive } : {}),
    ...(isFeatured !== undefined ? { is_featured: isFeatured } : {}),
    ...(updates.stock !== undefined && isActive !== undefined ? { available: Number(updates.stock) > 0 && isActive } : {}),
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('accessories')
    .update(normalizedUpdates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Supabase accessory update error:', error);
    throw new Error(`Database update failed: ${error.message} (${error.code || 'UNKNOWN'})`);
  }

  if (!data) {
    throw new Error(`Accessory with ID "${id}" was not found in Supabase.`);
  }

  return normalizeAccessory(data);
}

export async function deleteAccessory(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are not configured. Cannot delete accessory.');
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from('accessories').delete().eq('id', id);

  if (error) {
    console.error('Supabase accessory delete error:', error);
    throw new Error(`Database delete failed: ${error.message} (${error.code || 'UNKNOWN'})`);
  }

  return true;
}
