import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';

function sanitizeSupabaseUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (url.endsWith('/rest/v1') || url.endsWith('/rest/v1/')) {
    url = url.replace(/\/rest\/v1\/?$/, '');
  }
  return url.replace(/\/+$/, '');
}

/**
 * Check if Supabase client credentials are fully configured on server
 */
export function isServerSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey && url.trim() !== '' && anonKey.trim() !== '');
}

/**
 * Create server-side Supabase client for Server Components, Route Handlers, and Server Actions
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.trim() === '' || anonKey.trim() === '') {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(sanitizeSupabaseUrl(url), anonKey.trim(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
