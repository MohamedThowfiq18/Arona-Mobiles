import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Check if real Supabase credentials are provided (not default placeholder/dummy project)
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;
  if (url.includes('placeholder.supabase.co') || url.includes('your-project-id')) return false;
  if (anonKey.includes('placeholder-anon-key') || anonKey.includes('your-supabase-anon-key')) return false;
  return true;
}

/**
 * Get the Supabase browser client (singleton).
 * Use in Client Components and client-side hooks.
 */
export function getSupabaseClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  client = createBrowserClient(url, anonKey);
  return client;
}

