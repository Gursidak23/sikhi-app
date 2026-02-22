import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/api/history-handlers';
import { rateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

/**
 * GET /api/itihaas/event/[id]
 * Get a specific historical event with all details and citations
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
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const event = await getEventById(params.id);

    return NextResponse.json({
      event,
      sourceNote:
        'This event is documented with citations from the listed sources. Multiple interpretations are shown separately.',
    }, {
      headers: {
        ...rateLimitHeaders(rateLimitResult),
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Event not found') {
      return NextResponse.json(
        {
          error: 'Event not found',
          message: 'The requested event could not be found',
        },
        { status: 404 }
      );
    }

    logApiError('/api/itihaas/event', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Failed to fetch Event',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
