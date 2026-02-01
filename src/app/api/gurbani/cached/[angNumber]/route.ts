// ============================================================================
// OPTIMIZED GURBANI API - Reads from local database cache
// ============================================================================
// This route serves Gurbani data from local PostgreSQL cache for instant loading
// Falls back to BaniDB API if cache miss or database unavailable
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

// Dynamic import to handle cases where DB isn't configured
let prismaInstance: typeof import('@/lib/db/prisma').prisma | null = null;

async function getPrisma() {
  if (prismaInstance) return prismaInstance;
  try {
    const module = await import('@/lib/db/prisma');
    prismaInstance = module.prisma;
    return prismaInstance;
  } catch {
    return null;
  }
}

// Raag ranges helper
function getRaagForAng(angNumber: number): { pa: string; en: string } {
  const RAAG_RANGES = [
    { pa: 'ਜਪੁ ਜੀ ਸਾਹਿਬ', en: 'Japji Sahib', start: 1, end: 8 },
    { pa: 'ਸੋ ਦਰੁ - ਸੋ ਪੁਰਖੁ', en: 'So Dar - So Purakh', start: 8, end: 12 },
    { pa: 'ਸੋਹਿਲਾ', en: 'Sohila', start: 12, end: 13 },
    { pa: 'ਸ੍ਰੀ ਰਾਗੁ', en: 'Sri Raag', start: 14, end: 93 },
    { pa: 'ਰਾਗੁ ਮਾਝ', en: 'Raag Maajh', start: 94, end: 150 },
    { pa: 'ਰਾਗੁ ਗਉੜੀ', en: 'Raag Gauri', start: 151, end: 346 },
    { pa: 'ਰਾਗੁ ਆਸਾ', en: 'Raag Aasaa', start: 347, end: 488 },
    { pa: 'ਰਾਗੁ ਗੂਜਰੀ', en: 'Raag Gujri', start: 489, end: 526 },
    { pa: 'ਰਾਗੁ ਸੋਰਠਿ', en: 'Raag Sorath', start: 595, end: 659 },
    { pa: 'ਰਾਗੁ ਬਿਲਾਵਲੁ', en: 'Raag Bilaval', start: 795, end: 858 },
    { pa: 'ਰਾਗੁ ਰਾਮਕਲੀ', en: 'Raag Ramkali', start: 876, end: 974 },
    { pa: 'ਰਾਗੁ ਮਾਰੂ', en: 'Raag Maru', start: 989, end: 1106 },
    { pa: 'ਮੁੰਦਾਵਣੀ / ਰਾਗਮਾਲਾ', en: 'Mundavani / Raagmala', start: 1429, end: 1430 },
  ];
  const raag = RAAG_RANGES.find(r => angNumber >= r.start && angNumber <= r.end);
  return raag || { pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ', en: 'Sri Guru Granth Sahib Ji' };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { angNumber: string } }
) {
  const angNumber = parseInt(params.angNumber, 10);

  // Validate ang number
  if (isNaN(angNumber) || angNumber < 1 || angNumber > 1430) {
    return NextResponse.json(
      { error: 'Invalid ang number. Must be between 1 and 1430.' },
      { status: 400 }
    );
  }

  const sourceId = request.nextUrl.searchParams.get('source') || 'G';

  try {
    // Try to get from local cache first (FAST!)
    const db = await getPrisma();
    if (db) {
      try {
        const cached = await db.gurbaniAngCache.findUnique({
          where: { angNumber },
        });

        if (cached) {
          // Parse cached JSON and return
          const verses = JSON.parse(cached.versesJson);
          
          return NextResponse.json(
            {
              source: 'cache',
              angInfo: {
                source: { sourceId: cached.sourceId },
                pageNo: angNumber,
                totalPages: 1430,
              },
              count: cached.verseCount,
              page: verses,
              raag: {
                pa: cached.raagName,
                en: cached.raagNameEn,
              },
              cachedAt: cached.fetchedAt.toISOString(),
            },
            {
              headers: {
                'Cache-Control': 'public, max-age=86400',
                'X-Cache-Status': 'HIT',
              },
            }
          );
        }
      } catch (dbError) {
        console.log('Database not available, falling back to BaniDB API');
      }
    }

    // Cache miss or DB unavailable - fetch from BaniDB API
    const baniDbResponse = await fetch(
      `https://api.banidb.com/v2/angs/${angNumber}/${sourceId}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 },
      }
    );

    if (!baniDbResponse.ok) {
      throw new Error(`BaniDB API error: ${baniDbResponse.status}`);
    }

    const data = await baniDbResponse.json();

    // Try to cache the result for next time (async, don't block)
    if (db) {
      const raag = getRaagForAng(angNumber);
      db.gurbaniAngCache.upsert({
        where: { angNumber },
        update: {
          versesJson: JSON.stringify(data.page || []),
          verseCount: data.count || 0,
          raagName: raag.pa,
          raagNameEn: raag.en,
          fetchedAt: new Date(),
        },
        create: {
          angNumber,
          sourceId,
          versesJson: JSON.stringify(data.page || []),
          verseCount: data.count || 0,
          raagName: raag.pa,
          raagNameEn: raag.en,
          fetchedAt: new Date(),
        },
      }).catch(() => {});
    }

    return NextResponse.json(
      { source: 'banidb', ...data },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600',
          'X-Cache-Status': 'MISS',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching ang:', error);
    
    // Last resort: direct BaniDB fetch
    try {
      const fallbackResponse = await fetch(
        `https://api.banidb.com/v2/angs/${angNumber}/G`
      );
      
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return NextResponse.json(
          { source: 'banidb-fallback', ...data },
          { 
            headers: { 
              'Cache-Control': 'public, max-age=1800',
              'X-Cache-Status': 'FALLBACK',
            } 
          }
        );
      }
    } catch {
      // Fallback also failed
    }

    return NextResponse.json(
      { error: 'Failed to load Gurbani data. Please try again.' },
      { status: 500 }
    );
  }
}
