import { NextRequest, NextResponse } from 'next/server';
import { getShabadById } from '@/lib/api/gurbani-handlers';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

/**
 * GET /api/gurbani/shabad/[id]
 * Get a specific Shabad with all Panktis and interpretations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID format
    if (!params.id || params.id.length > 100) {
      return NextResponse.json({ error: 'Invalid Shabad ID' }, { status: 400 });
    }

    // Rate limit
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`gurbani-shabad:${ip}`, { limit: 60, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const shabad = await getShabadById(params.id);

    return NextResponse.json({
      shabad,
      disclaimer:
        'Meanings are interpretations from named sources, not literal translations.',
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Shabad not found') {
      return NextResponse.json(
        {
          error: 'Shabad not found',
          message: 'The requested Shabad could not be found',
        },
        { status: 404 }
      );
    }

    logApiError('/api/gurbani/shabad', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Failed to fetch Shabad',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
