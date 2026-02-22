import { NextRequest, NextResponse } from 'next/server';
import { getRaags, getShabadsByRaag } from '@/lib/api/gurbani-handlers';
import { logApiError } from '@/lib/error-tracking';

// Force dynamic rendering for routes that use searchParams
export const dynamic = 'force-dynamic';

/**
 * GET /api/gurbani/raag
 * Get all Raags
 *
 * GET /api/gurbani/raag?id={raagId}
 * Get Shabads for a specific Raag
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const raagId = searchParams.get('id');

    if (raagId) {
      // Get Shabads for specific Raag
      const raag = await getShabadsByRaag(raagId);
      return NextResponse.json(raag);
    }

    // Get all Raags
    const raags = await getRaags();

    return NextResponse.json({
      raags,
      total: raags.length,
      description:
        'The 31 Raags of Sri Guru Granth Sahib Ji, arranged in their traditional order.',
    });
  } catch (error) {
    logApiError('/api/gurbani/raag', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Failed to fetch Raag data',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
