import { NextRequest, NextResponse } from 'next/server';
import { getContemporaryEvents } from '@/lib/api/history-handlers';

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
    console.error('Error fetching contemporary events:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch contemporary events',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
