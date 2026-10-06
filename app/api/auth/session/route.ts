import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatMobileNumber } from '@/lib/auth/authUtils';

export const dynamic = 'force-dynamic';

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'tet-assist-educational-session-secret-salt-2026';

function verifySession(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }
    const json = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // 1. Check HTTP-only secure cookie session
    const cookieStore = await cookies();
    const token = cookieStore.get('tet_session')?.value;

    if (token) {
      const sessionData = verifySession(token);
      if (sessionData && sessionData.mobile) {
        return NextResponse.json({
          authenticated: true,
          user: {
            id: sessionData.id,
            mobile: sessionData.mobile,
            formattedMobile: sessionData.formattedMobile || formatMobileNumber(sessionData.mobile),
          },
        });
      }
    }

    // 2. Check Supabase Auth server session
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const rawPhone =
          user.user_metadata?.phone_number ||
          user.email?.replace(/^candidate_/, '').replace(/@.*$/, '') ||
          '';
        const formatted =
          user.user_metadata?.mobile_number || formatMobileNumber(rawPhone);

        return NextResponse.json({
          authenticated: true,
          user: {
            id: user.id,
            mobile: rawPhone,
            formattedMobile: formatted,
          },
        });
      }
    }

    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  } catch (error) {
    console.error('[API /api/auth/session]', error);
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }
}
