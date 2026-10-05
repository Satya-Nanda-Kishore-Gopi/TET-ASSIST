import { NextRequest, NextResponse } from 'next/server';
import { TetAttemptService } from '@/lib/services/tet/tetAttemptService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const testId = typeof body?.testId === 'string' ? body.testId : '';

    if (!testId) {
      return NextResponse.json(
        { success: false, error: 'testId is required.' },
        { status: 400 }
      );
    }

    const result = await TetAttemptService.startAttempt(testId, body?.userId ?? null);

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start attempt.';
    console.error('[API /api/tet/attempts]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
