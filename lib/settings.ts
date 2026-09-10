import fs from 'fs';
import path from 'path';
import type { StoreSettings } from '@/lib/types';
import { STORE_CONFIG, DEFAULT_STORE_SETTINGS, normalizePhoneNumber } from '@/lib/constants';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'store_settings.json');

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('placeholder.supabase.co') && !url.includes('your-project-id'));
}

function readLocalSettings(): StoreSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading local store_settings.json:', err);
  }
  return DEFAULT_STORE_SETTINGS;
}

function writeLocalSettings(settings: StoreSettings) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local store_settings.json:', err);
  }
}


/**
 * Fetch current store settings from cloud database with local fallback
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (!error && data) {
        return {
          ...DEFAULT_STORE_SETTINGS,
          ...data,
        };
      }
    } catch (err) {
      console.warn('Supabase store_settings fetch failed, falling back to local file:', err);
    }
  }

  return readLocalSettings();
}

/**
 * Update store settings in cloud database and local fallback
 */
export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();

  // Normalize phone numbers if provided
  let normalized = { ...updates };

  if (updates.phone_primary) {
    const p1 = normalizePhoneNumber(updates.phone_primary);
    normalized.phone_primary = p1.display;
    normalized.phone_primary_raw = p1.raw;
  }
  if (updates.phone_secondary) {
    const p2 = normalizePhoneNumber(updates.phone_secondary);
    normalized.phone_secondary = p2.display;
    normalized.phone_secondary_raw = p2.raw;
  }
  if (updates.whatsapp_number) {
    const wa = normalizePhoneNumber(updates.whatsapp_number);
    normalized.whatsapp_number = wa.whatsapp;
    normalized.whatsapp_display = wa.display;
  }

  const updated: StoreSettings = {
    ...current,
    ...normalized,
    id: 'default',
    updated_at: new Date().toISOString(),
  };

  // 1. Write to local store for fallback
  writeLocalSettings(updated);

  // 2. Write to Supabase database
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase
        .from('store_settings')
        .upsert(updated, { onConflict: 'id' });

      if (error) {
        console.error('Supabase store_settings upsert error:', error);
      }
    } catch (err) {
      console.warn('Supabase store_settings update failed:', err);
    }
  }

  return updated;
}
