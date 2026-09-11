import { randomUUID } from 'crypto';
import type { Accessory, AccessoryCategory } from '@/lib/types';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { INITIAL_ACCESSORY_CATEGORIES, normalizeAccessory } from '@/lib/accessory-constants';

export { INITIAL_ACCESSORY_CATEGORIES, normalizeAccessory };

export async function getAllAccessories(includeInactive = false): Promise<Accessory[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured on server.');
    return [];
  }

  try {
    const supabase = getSupabaseAdminClient();
    let query = supabase.from('accessories').select('*').order('created_at', { ascending: false });
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase getAllAccessories query error:', error.message);
      return [];
    }

    return (data || []).map(normalizeAccessory);
  } catch (err) {
    console.error('Supabase getAllAccessories unexpected error:', err);
    return [];
  }
}

export async function getAccessoryById(id: string): Promise<Accessory | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase is not configured on server.');
    return null;
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase getAccessoryById query error:', error.message);
      return null;
    }

    if (data) return normalizeAccessory(data);

    return null;
  } catch (err) {
    console.error('Supabase getAccessoryById unexpected error:', err);
    return null;
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
    throw new Error('Supabase credentials are not configured. Cannot save accessory to database.');
  }

  const id = accessoryData.id && String(accessoryData.id).trim().length > 0
    ? String(accessoryData.id).trim()
    : `acc-${Date.now()}-${randomUUID().slice(0, 6)}`;

  const now = new Date().toISOString();
  const primaryImg = accessoryData.image_url || (accessoryData.images && accessoryData.images[0]) || '';
  const imgList = accessoryData.images && accessoryData.images.length > 0 ? accessoryData.images : (primaryImg ? [primaryImg] : []);

  const price = Number(accessoryData.price) || 0;
  const originalPrice = accessoryData.original_price !== undefined && accessoryData.original_price !== null && String(accessoryData.original_price).trim() !== ''
    ? Number(accessoryData.original_price)
    : undefined;
  const discountPrice = accessoryData.discount_price !== undefined && accessoryData.discount_price !== null && String(accessoryData.discount_price).trim() !== ''
    ? Number(accessoryData.discount_price)
    : undefined;
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
    throw new Error('Supabase credentials are not configured. Cannot update accessory in database.');
  }

  const primaryImg = updates.image_url || (updates.images && updates.images[0]);
  const imgList = updates.images && updates.images.length > 0 ? updates.images : (primaryImg ? [primaryImg] : undefined);
  const isActive = updates.is_active !== undefined ? updates.is_active : (updates.published !== undefined ? updates.published : undefined);
  const isFeatured = updates.is_featured !== undefined ? updates.is_featured : undefined;

  const cleanUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) cleanUpdates.name = String(updates.name).trim();
  if (updates.brand !== undefined) cleanUpdates.brand = String(updates.brand).trim();
  if (updates.category !== undefined) cleanUpdates.category = String(updates.category).trim();
  if (updates.subcategory !== undefined) cleanUpdates.subcategory = updates.subcategory ? String(updates.subcategory).trim() : null;
  if (updates.model_sku !== undefined) cleanUpdates.model_sku = updates.model_sku ? String(updates.model_sku).trim() : null;
  if (updates.color !== undefined) cleanUpdates.color = updates.color ? String(updates.color).trim() : null;
  if (updates.compatibility !== undefined) cleanUpdates.compatibility = updates.compatibility ? String(updates.compatibility).trim() : null;
  if (updates.description !== undefined) cleanUpdates.description = updates.description ? String(updates.description).trim() : null;
  if (updates.offer !== undefined) cleanUpdates.offer = updates.offer ? String(updates.offer).trim() : null;
  if (updates.specs !== undefined) cleanUpdates.specs = updates.specs;
  if (primaryImg) cleanUpdates.image_url = primaryImg;
  if (imgList) cleanUpdates.images = imgList;
  if (updates.tags !== undefined) cleanUpdates.tags = updates.tags;

  if (updates.price !== undefined) cleanUpdates.price = Number(updates.price);
  if (updates.original_price !== undefined) cleanUpdates.original_price = updates.original_price ? Number(updates.original_price) : null;
  if (updates.discount_price !== undefined) cleanUpdates.discount_price = updates.discount_price ? Number(updates.discount_price) : null;
  if (updates.discount_percent !== undefined) cleanUpdates.discount_percent = Number(updates.discount_percent);
  if (updates.stock !== undefined) cleanUpdates.stock = Number(updates.stock);
  if (isActive !== undefined) {
    cleanUpdates.is_active = isActive;
    cleanUpdates.published = isActive;
  }
  if (isFeatured !== undefined) cleanUpdates.is_featured = isFeatured;
  if (updates.stock !== undefined || isActive !== undefined) {
    const stockVal = updates.stock !== undefined ? Number(updates.stock) : 1;
    const activeVal = isActive !== undefined ? isActive : true;
    cleanUpdates.available = stockVal > 0 && activeVal;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('accessories')
    .update(cleanUpdates)
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
    throw new Error('Supabase credentials are not configured. Cannot delete accessory from database.');
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from('accessories').delete().eq('id', id);

  if (error) {
    console.error('Supabase accessory delete error:', error);
    throw new Error(`Database delete failed: ${error.message} (${error.code || 'UNKNOWN'})`);
  }

  return true;
}
