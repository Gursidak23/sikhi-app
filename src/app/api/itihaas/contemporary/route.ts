import { NextRequest, NextResponse } from 'next/server';
import { getContemporaryEvents } from '@/lib/api/history-handlers';
import { rateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

export const dynamic = 'force-dynamic';

/**
 * GET /api/itihaas/contemporary
 * Get contemporary (recent) historical events with mandatory disclaimers
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

    const contemporary = await getContemporaryEvents();

    return NextResponse.json({
      ...contemporary,
      isContemporary: true,
      warningNote:
        'Content in this section represents contemporary, evolving history. Information may be subject to revision as new information becomes available.',
    }, {
      headers: {
        ...rateLimitHeaders(rateLimitResult),
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
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
