import { NextRequest, NextResponse } from 'next/server';
import { getTimeline } from '@/lib/api/history-handlers';

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
    console.error('Error fetching timeline:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch timeline',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
