import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/api/history-handlers';

/**
 * GET /api/itihaas/event/[id]
 * Get a specific historical event with all details and citations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await getEventById(params.id);

    return NextResponse.json({
      event,
      sourceNote:
        'This event is documented with citations from the listed sources. Multiple interpretations are shown separately.',
    });
  } catch (error) {
    console.error('Error fetching Event:', error);

    if (error instanceof Error && error.message === 'Event not found') {
      return NextResponse.json(
        {
          error: 'Event not found',
          message: 'The requested event could not be found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch Event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
