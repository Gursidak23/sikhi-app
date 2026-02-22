import { NextRequest, NextResponse } from 'next/server';
import { getEraWithEvents } from '@/lib/api/history-handlers';
import { logApiError } from '@/lib/error-tracking';

/**
 * GET /api/itihaas/era/[id]
 * Get an Era with all its Periods and Events
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const era = await getEraWithEvents(params.id);

    return NextResponse.json(era);
  } catch (error) {
    if (error instanceof Error && error.message === 'Era not found') {
      return NextResponse.json(
        {
          error: 'Era not found',
          message: 'The requested Era could not be found',
        },
        { status: 404 }
      );
    }

    logApiError('/api/itihaas/era', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Failed to fetch Era',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
