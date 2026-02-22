import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

export const dynamic = 'force-dynamic';

const BANIDB_API_BASE = process.env.NEXT_PUBLIC_BANIDB_API_URL || 'https://api.banidb.com/v2';
const ALLOWED_SOURCES = ['G', 'D', 'B', 'N', 'A', 'S', 'R'];

/**
 * GET /api/gurbani/random?source=G
 * Server-side proxy for BaniDB random shabad endpoint.
 */
export async function GET(request: NextRequest) {
  // Rate limit
  const ip = getClientIdentifier(request);
  const rl = rateLimit(`gurbani-random:${ip}`, { limit: 30, windowSeconds: 60 });
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Validate source
  const rawSource = request.nextUrl.searchParams.get('source') || 'G';
  const sourceId = ALLOWED_SOURCES.includes(rawSource) ? rawSource : 'G';
  
  try {
    const response = await fetch(`${BANIDB_API_BASE}/random/${sourceId}`, {
      headers: {
        'Accept': 'application/json',
      },
      // Revalidate every 0 seconds — each random request should be fresh
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`BaniDB random API error: ${response.status}`);
      return NextResponse.json(
        { error: 'BaniDB API returned an error', status: response.status },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logApiError('/api/gurbani/random', error instanceof Error ? error : new Error(String(error)), 500);
    return NextResponse.json(
      { error: 'Failed to fetch random shabad from BaniDB' },
      { status: 500 }
    );
  }
}
