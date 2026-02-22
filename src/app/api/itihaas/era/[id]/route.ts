import { NextRequest, NextResponse } from 'next/server';
import { getEraWithEvents } from '@/lib/api/history-handlers';
import { rateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';
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
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = rateLimit(clientId, { limit: 60, windowSeconds: 60 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000) },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate ID format
    if (!params.id || params.id.length > 100) {
      return NextResponse.json({ error: 'Invalid era ID' }, { status: 400 });
    }

    const era = await getEraWithEvents(params.id);

    return NextResponse.json(era, {
      headers: {
        ...rateLimitHeaders(rateLimitResult),
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
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
