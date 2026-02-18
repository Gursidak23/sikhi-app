/**
 * BaniDB Proxy API Route
 * Fetches Gurbani data from BaniDB API server-side to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';

const BANIDB_API_BASE = 'https://api.banidb.com/v2';

export async function GET(
  request: NextRequest,
  { params }: { params: { angNumber: string } }
) {
  try {
    const angNumber = parseInt(params.angNumber, 10);
    
    // Validate ang number
    if (isNaN(angNumber) || angNumber < 1 || angNumber > 1430) {
      return NextResponse.json(
        { error: 'Invalid Ang number. Must be between 1 and 1430.' },
        { status: 400 }
      );
    }

    // Get source ID from query params (default: G for Guru Granth Sahib)
    const searchParams = request.nextUrl.searchParams;
    const ALLOWED_SOURCES = ['G', 'D', 'B', 'N', 'A', 'S', 'R'];
    const rawSourceId = searchParams.get('source') || 'G';
    const sourceId = ALLOWED_SOURCES.includes(rawSourceId) ? rawSourceId : 'G';

    // Fetch from BaniDB API
    const response = await fetch(`${BANIDB_API_BASE}/angs/${angNumber}/${sourceId}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SikhiVidhya/1.0',
      },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch from BaniDB: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching from BaniDB:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Gurbani data' },
      { status: 500 }
    );
  }
}
