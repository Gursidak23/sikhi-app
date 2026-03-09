import { NextRequest, NextResponse } from 'next/server';
import { getTimeline } from '@/lib/api/history-handlers';
import { rateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

export const dynamic = 'force-dynamic';

/**
 * GET /api/itihaas/timeline
 * Get the complete timeline structure with all Eras and Periods
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = rateLimit(clientId, { limit: 60, windowSeconds: 60 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    const timeline = await getTimeline();

    return NextResponse.json({
      ...timeline,
      sourceNote:
        'Every historical claim in this timeline is attributed to its source. Where sources conflict, interpretations are presented separately.',
    }, {
      headers: {
        ...rateLimitHeaders(rateLimitResult),
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    logApiError('/api/itihaas/timeline', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Failed to fetch timeline',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
