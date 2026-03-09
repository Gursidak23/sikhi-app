import { NextRequest, NextResponse } from 'next/server';
import { getRaags, getShabadsByRaag } from '@/lib/api/gurbani-handlers';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
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
    // Rate limit
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`gurbani-raag:${ip}`, { limit: 60, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const searchParams = request.nextUrl.searchParams;
    const raagId = searchParams.get('id');

    if (raagId) {
      // Validate raagId format
      if (!raagId.trim() || raagId.length > 100) {
        return NextResponse.json({ error: 'Invalid raag ID' }, { status: 400 });
      }
      const raag = await getShabadsByRaag(raagId);
      return NextResponse.json(raag, {
        headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
      });
    }

    const raags = await getRaags();

    return NextResponse.json({
      raags,
      total: raags.length,
      description:
        'The 31 Raags of Sri Guru Granth Sahib Ji, arranged in their traditional order.',
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
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
