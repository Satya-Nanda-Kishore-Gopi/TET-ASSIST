import { NextRequest, NextResponse } from 'next/server';
import { TetAttemptService } from '@/lib/services/tet/tetAttemptService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await req.json();
    const questionId = Number(body?.questionId);
    const selectedOption = Number(body?.selectedOption);

    if (!attemptId || !Number.isInteger(questionId)) {
      return NextResponse.json(
        { success: false, error: 'Valid attemptId and questionId are required.' },
        { status: 400 }
      );
    }

    await TetAttemptService.saveAnswer(attemptId, questionId, selectedOption);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save answer.';
    console.error('[API /api/tet/attempts/[attemptId]/answers]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
