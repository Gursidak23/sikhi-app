import { NextRequest, NextResponse } from 'next/server';
import { getEraWithEvents } from '@/lib/api/history-handlers';

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
    console.error('Error fetching Era:', error);

    if (error instanceof Error && error.message === 'Era not found') {
      return NextResponse.json(
        {
          error: 'Era not found',
          message: 'The requested Era could not be found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch Era',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
