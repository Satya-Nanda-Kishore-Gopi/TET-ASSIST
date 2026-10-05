import { NextResponse } from 'next/server';
import { TetTestService } from '@/lib/services/tet/tetTestService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await TetTestService.getCurrentPaper1A();

    return NextResponse.json({
      success: true,
      test: result.test,
      questions: result.questions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load TET test.';
    console.error('[API /api/tet/tests/current]', message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
