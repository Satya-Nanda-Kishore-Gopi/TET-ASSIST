import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

function sanitizeSupabaseUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (url.endsWith('/rest/v1') || url.endsWith('/rest/v1/')) {
    url = url.replace(/\/rest\/v1\/?$/, '');
  }
  return url.replace(/\/+$/, '');
}

/**
 * Server-only Supabase client for administrative/background processing operations.
 * Uses SUPABASE_SERVICE_ROLE_KEY if provided, or falls back to anon key.
 * 
 * NEVER import or invoke this in client components or client bundles.
 */
export function createAdminClient(): SupabaseClient | null {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role key if available, otherwise fallback to anon key for server-side operations
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.trim() === '' || key.trim() === '') {
    return null;
  }

  adminClient = createClient(sanitizeSupabaseUrl(url), key.trim(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}
