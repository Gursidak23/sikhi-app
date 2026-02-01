import { NextRequest, NextResponse } from 'next/server';
import { searchHistory } from '@/lib/api/history-handlers';
import { rateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

// Force dynamic rendering for routes that use searchParams
export const dynamic = 'force-dynamic';

/**
 * GET /api/itihaas/search
 * Search historical events and figures
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = rateLimit(clientId, { limit: 30, windowSeconds: 60 });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please wait before searching again.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: rateLimitHeaders(rateLimitResult),
        }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          error: 'Invalid search query',
          message: 'Search query must be at least 2 characters',
        },
        { status: 400 }
      );
    }

    const results = await searchHistory(query);

    return NextResponse.json({
      query,
      results,
      totalEvents: results.events.length,
      totalFigures: results.figures.length,
      sourceNote: 'Select an item to view full details with source citations.',
    }, {
      headers: rateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    logApiError('/api/itihaas/search', error as Error, 500);
    return NextResponse.json(
      {
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
