import { NextRequest, NextResponse } from 'next/server';
import { getAngContent } from '@/lib/api/gurbani-handlers';
import { logApiError } from '@/lib/error-tracking';

/**
 * GET /api/gurbani/ang/[angNumber]
 * Retrieves Gurbani content for a specific Ang (page) of Sri Guru Granth Sahib Ji
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { angNumber: string } }
) {
  try {
    const angNumber = parseInt(params.angNumber, 10);

    if (isNaN(angNumber) || angNumber < 1 || angNumber > 1430) {
      return NextResponse.json(
        {
          error: 'Invalid Ang number',
          message: 'Ang number must be between 1 and 1430',
        },
        { status: 400 }
      );
    }

    const content = await getAngContent(angNumber);

    // Set cache headers - but with revalidation
    // We don't cache Gurbani content aggressively
    return NextResponse.json(content, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    logApiError('/api/gurbani/ang', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Failed to fetch Ang content',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
