import { NextRequest, NextResponse } from 'next/server';
import { TetTestService } from '@/lib/services/tet/tetTestService';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params;

    if (!testId) {
      return NextResponse.json(
        { success: false, error: 'Test ID is required.' },
        { status: 400 }
      );
    }

    const result = await TetTestService.getTest(testId);

    return NextResponse.json({
      success: true,
      test: result.test,
      questions: result.questions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load TET test.';
    console.error('[API /api/tet/tests/[testId]]', message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
