import { NextRequest, NextResponse } from 'next/server';
import { getContemporaryEvents } from '@/lib/api/history-handlers';
import { logApiError } from '@/lib/error-tracking';

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

/**
 * GET /api/itihaas/contemporary
 * Get contemporary (recent) historical events with mandatory disclaimers
 */
export async function GET(request: NextRequest) {
  try {
    const contemporary = await getContemporaryEvents();

    return NextResponse.json({
      ...contemporary,
      isContemporary: true,
      warningNote:
        'Content in this section represents contemporary, evolving history. Information may be subject to revision as new information becomes available.',
    });
  } catch (error) {
    logApiError('/api/itihaas/contemporary', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Failed to fetch contemporary events',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
