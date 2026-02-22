import { NextRequest, NextResponse } from 'next/server';
import { getFigureById, getGuruSahibaan } from '@/lib/api/history-handlers';
import { logApiError } from '@/lib/error-tracking';

// Force dynamic rendering for routes that use searchParams
export const dynamic = 'force-dynamic';

/**
 * GET /api/itihaas/figure
 * Get all Guru Sahibaan (special endpoint)
 *
 * GET /api/itihaas/figure?id={figureId}
 * Get a specific historical figure
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const figureId = searchParams.get('id');
    const guruList = searchParams.get('guru-sahibaan');

    if (figureId) {
      // Get specific figure
      const figure = await getFigureById(figureId);
      return NextResponse.json({
        figure,
        sourceNote:
          'Biography information is sourced from the listed citations.',
      });
    }

    if (guruList !== null) {
      // Get all Guru Sahibaan
      const gurus = await getGuruSahibaan();
      return NextResponse.json({
        guruSahibaan: gurus,
        total: gurus.length,
        note: 'The Ten Guru Sahibaan who led the Sikh faith from 1469 to 1708.',
      });
    }

    // Default: return Guru Sahibaan list
    const gurus = await getGuruSahibaan();
    return NextResponse.json({
      guruSahibaan: gurus,
      note: 'Use ?id={figureId} to get a specific figure, or ?guru-sahibaan for this list.',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Figure not found') {
      return NextResponse.json(
        {
          error: 'Figure not found',
          message: 'The requested figure could not be found',
        },
        { status: 404 }
      );
    }

    logApiError('/api/itihaas/figure', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Failed to fetch figure',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
