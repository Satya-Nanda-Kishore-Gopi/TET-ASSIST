import { NextRequest, NextResponse } from 'next/server';
import { TetAttemptService } from '@/lib/services/tet/tetAttemptService';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    if (!attemptId) {
      return NextResponse.json({ success: false, error: 'attemptId is required.' }, { status: 400 });
    }

    const state = await TetAttemptService.getAttemptState(attemptId);
    return NextResponse.json({ success: true, ...state });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load attempt.';
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }
}
