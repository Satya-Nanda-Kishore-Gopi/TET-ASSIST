import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 1. Sign out from Supabase Auth if session exists
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }

    // 2. Clear HTTP-only session cookie
    const cookieStore = await cookies();
    cookieStore.delete('tet_session');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /api/auth/logout]', error);
    // Still clear cookie on error
    const cookieStore = await cookies();
    cookieStore.delete('tet_session');
    return NextResponse.json({ success: true });
  }
}
