import { NextRequest, NextResponse } from 'next/server';
import { searchGurbani } from '@/lib/api/gurbani-handlers';
import { rateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

// Force dynamic rendering for routes that use searchParams
export const dynamic = 'force-dynamic';

/**
 * GET /api/gurbani/search
 * Search Gurbani by Gurmukhi or transliteration
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

    if (!query || query.length < 3 || query.length > 200) {
      return NextResponse.json(
        {
          error: 'Invalid search query',
          message: 'Search query must be between 3 and 200 characters',
        },
        { status: 400 }
      );
    }

    const results = await searchGurbani(query);

    return NextResponse.json({
      query,
      resultCount: results.length,
      results,
      disclaimer:
        'Search results show first line of Shabads. View full Shabad for complete context.',
    }, {
      headers: {
        ...rateLimitHeaders(rateLimitResult),
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    logApiError('/api/gurbani/search', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Search failed',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
