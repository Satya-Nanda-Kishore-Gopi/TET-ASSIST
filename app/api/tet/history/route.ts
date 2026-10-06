import { NextRequest, NextResponse } from 'next/server';
import { TetAnalyticsService } from '@/lib/services/tet/tetAnalyticsService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const history = await TetAnalyticsService.getHistory(userId);
    return NextResponse.json({ success: true, history });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load test history.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
