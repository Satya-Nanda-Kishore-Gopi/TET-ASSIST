import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

function sanitizeSupabaseUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (url.endsWith('/rest/v1') || url.endsWith('/rest/v1/')) {
    url = url.replace(/\/rest\/v1\/?$/, '');
  }
  return url.replace(/\/+$/, '');
}

/**
 * Check if Supabase client credentials are fully configured
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey && url.trim() !== '' && anonKey.trim() !== '');
}

/**
 * Get or create browser-side Supabase client singleton
 */
export function createClient(): SupabaseClient | null {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.trim() === '' || anonKey.trim() === '') {
    return null;
  }

  browserClient = createBrowserClient(sanitizeSupabaseUrl(url), anonKey.trim());
  return browserClient;
}
