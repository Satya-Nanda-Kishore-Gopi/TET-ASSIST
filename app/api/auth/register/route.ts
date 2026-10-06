import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mobile, password } = body;

    const validation = validateIndianMobile(mobile);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || 'Please enter a valid Indian mobile number.',
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must contain at least 6 characters.',
        },
        { status: 400 }
      );
    }

    const cleanMobile = validation.cleanMobile;
    const controlledEmail = getControlledLoginEmail(cleanMobile);

    let userId: string = crypto.randomUUID();

    // 1. Try Supabase Auth via Admin Client (bypasses email confirmation rate limits if service role key provided)
    const adminSupabase = createAdminClient();
    let supabaseSuccess = false;

    if (adminSupabase && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await adminSupabase.auth.admin.createUser({
        email: controlledEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          phone_number: cleanMobile,
          mobile_number: formatMobileNumber(cleanMobile),
          display_name: 'TET Assist User',
        },
      });

      if (!error && data?.user) {
        userId = data.user.id;
        supabaseSuccess = true;
      } else if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
          return NextResponse.json(
            {
              success: false,
              error: 'An account with this mobile number already exists.',
            },
            { status: 400 }
          );
        }
      }
    }

    // 2. If admin client is not available or wasn't used, try standard Supabase Auth
    if (!supabaseSuccess) {
      const browserOrAnonClient = await createServerSupabaseClient();
      if (browserOrAnonClient) {
        const { data, error } = await browserOrAnonClient.auth.signUp({
          email: controlledEmail,
          password: password,
          options: {
            data: {
              phone_number: cleanMobile,
              mobile_number: formatMobileNumber(cleanMobile),
              display_name: 'TET Assist User',
            },
          },
        });

        if (!error && data?.user) {
          userId = data.user.id;
          supabaseSuccess = true;
        } else if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('already') || msg.includes('exists') || msg.includes('registered')) {
            return NextResponse.json(
              {
                success: false,
                error: 'An account with this mobile number already exists.',
              },
              { status: 400 }
            );
          }
          console.error('[Registration Supabase Error]', error);
          const isRateLimit = msg.includes('rate limit');
          return NextResponse.json(
            {
              success: false,
              error: isRateLimit
                ? 'Supabase email send rate limit exceeded. Disable "Confirm email" in Supabase dashboard to register instantly.'
                : error.message || 'Unable to register account in Supabase.',
            },
            { status: 400 }
          );
        }
      }
    }

    if (!supabaseSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Registration failed. Supabase authentication service could not create the account.',
        },
        { status: 500 }
      );
    }

    // 3. Establish persistent secure HTTP-only session cookie
    const userSession = {
      id: userId,
      mobile: cleanMobile,
      formattedMobile: formatMobileNumber(cleanMobile),
      role: 'aspirant',
      createdAt: new Date().toISOString(),
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
      user: {
        id: userId,
        mobile: cleanMobile,
        formattedMobile: formatMobileNumber(cleanMobile),
      },
    });
  } catch (error) {
    console.error('[API /api/auth/register]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to create your account. Please try again.',
      },
      { status: 500 }
    );
  }
}
