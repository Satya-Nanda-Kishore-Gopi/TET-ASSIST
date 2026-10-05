import { NextResponse } from 'next/server';
import { TetTestService } from '@/lib/services/tet/tetTestService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tests = await TetTestService.listPaper1AMockTests();
    return NextResponse.json({ success: true, tests });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load mock tests.';
    console.error('[API /api/tet/tests]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
