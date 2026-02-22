import { NextRequest, NextResponse } from 'next/server';
import { getAngContent } from '@/lib/api/gurbani-handlers';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

/**
 * GET /api/gurbani/ang/[angNumber]
 * Retrieves Gurbani content for a specific Ang (page) of Sri Guru Granth Sahib Ji
 * Gurbani is sacred, centuries-old scripture — safe to cache aggressively.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { angNumber: string } }
) {
  try {
    // Rate limit
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`gurbani-ang:${ip}`, { limit: 120, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const angNumber = parseInt(params.angNumber, 10);

    if (isNaN(angNumber) || angNumber < 1 || angNumber > 1430) {
      return NextResponse.json(
        {
          error: 'Invalid Ang number',
          message: 'Ang number must be between 1 and 1430',
        },
        { status: 400 }
      );
    }

    const content = await getAngContent(angNumber);

    // Gurbani is immutable sacred text — cache aggressively
    return NextResponse.json(content, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    logApiError('/api/gurbani/ang', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      {
        error: 'Failed to fetch Ang content',
        message: 'An internal error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}
