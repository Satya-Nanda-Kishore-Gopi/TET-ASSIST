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
  return NextResponse.json(
    {
      success: false,
      error: 'Registration is temporarily disabled. You can access all mock tests and materials directly without registration.',
    },
    { status: 400 }
  );
}
