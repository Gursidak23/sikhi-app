import { NextRequest, NextResponse } from 'next/server';
import { getTimeline } from '@/lib/api/history-handlers';
import { logApiError } from '@/lib/error-tracking';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

/**
 * GET /api/itihaas/timeline
 * Get the complete timeline structure with all Eras and Periods
 */
export async function GET(request: NextRequest) {
  try {
    const timeline = await getTimeline();

    return NextResponse.json({
      ...timeline,
      sourceNote:
        'Every historical claim in this timeline is attributed to its source. Where sources conflict, interpretations are presented separately.',
    });
  } catch (error) {
    logApiError('/api/itihaas/timeline', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Failed to fetch timeline',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
