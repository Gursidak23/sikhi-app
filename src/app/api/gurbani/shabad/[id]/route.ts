import { NextRequest, NextResponse } from 'next/server';
import { getShabadById } from '@/lib/api/gurbani-handlers';
import { logApiError } from '@/lib/error-tracking';

/**
 * GET /api/gurbani/shabad/[id]
 * Get a specific Shabad with all Panktis and interpretations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shabad = await getShabadById(params.id);

    return NextResponse.json({
      shabad,
      disclaimer:
        'Meanings are interpretations from named sources, not literal translations.',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Shabad not found') {
      return NextResponse.json(
        {
          error: 'Shabad not found',
          message: 'The requested Shabad could not be found',
        },
        { status: 404 }
      );
    }

    logApiError('/api/gurbani/shabad', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Failed to fetch Shabad',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
