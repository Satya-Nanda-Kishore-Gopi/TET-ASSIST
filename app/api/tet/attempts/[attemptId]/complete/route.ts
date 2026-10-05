import { NextRequest, NextResponse } from 'next/server';
import { TetAttemptService } from '@/lib/services/tet/tetAttemptService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    let expired = false;

    try {
      const body = await req.json();
      expired = body?.expired === true;
    } catch {
      // Empty POST body is valid.
    }

    if (!attemptId) {
      return NextResponse.json(
        { success: false, error: 'attemptId is required.' },
        { status: 400 }
      );
    }

    const result = await TetAttemptService.submitAttempt(attemptId, expired);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to complete attempt.';
    console.error('[API /api/tet/attempts/[attemptId]/complete]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
