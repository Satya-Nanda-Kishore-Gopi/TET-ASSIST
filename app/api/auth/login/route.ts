import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  validateIndianMobile,
  getControlledLoginEmail,
  formatMobileNumber,
} from '@/lib/auth/authUtils';

export const dynamic = 'force-dynamic';

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'tet-assist-educational-session-secret-salt-2026';

function signSession(data: object): string {
  const json = JSON.stringify(data);
  const payload = Buffer.from(json).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mobile, password } = body;

    const validation = validateIndianMobile(mobile);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mobile number or password is incorrect.',
        },
        { status: 401 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mobile number or password is incorrect.',
        },
        { status: 401 }
      );
    }

    const cleanMobile = validation.cleanMobile;
    const controlledEmail = getControlledLoginEmail(cleanMobile);

    let loggedInUser: { id: string; mobile: string; formattedMobile: string } | null = null;

    // 1. Attempt Supabase Auth login (phone first, then controlled email identity)
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      // 1a. Attempt direct Supabase phone authentication (+91XXXXXXXXXX)
      let authRes = await supabase.auth.signInWithPassword({
        phone: `+91${cleanMobile}`,
        password: password,
      });

      // 1b. If phone auth returns an error or no user, try controlled email identity
      if (authRes.error || !authRes.data?.user) {
        authRes = await supabase.auth.signInWithPassword({
          email: controlledEmail,
          password: password,
        });
      }

      if (!authRes.error && authRes.data?.user) {
        loggedInUser = {
          id: authRes.data.user.id,
          mobile: cleanMobile,
          formattedMobile: formatMobileNumber(cleanMobile),
        };
      }
    }

    // Strictly reject login if Supabase Auth verification failed or returned no user
    if (!loggedInUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mobile number or password is incorrect.',
        },
        { status: 401 }
      );
    }

    // Establish persistent HTTP-only cookie
    const userSession = {
      id: loggedInUser.id,
      mobile: cleanMobile,
      formattedMobile: loggedInUser.formattedMobile,
      role: 'aspirant',
      loggedInAt: new Date().toISOString(),
    };

    const cookieValue = signSession(userSession);
    const cookieStore = await cookies();
    cookieStore.set('tet_session', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      user: loggedInUser,
    });
  } catch (error) {
    console.error('[API /api/auth/login]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong. Please try again.',
      },
      { status: 500 }
    );
  }
}
