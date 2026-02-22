// ============================================================================
// OPTIMIZED GURBANI API - Reads from local database cache
// ============================================================================
// This route serves Gurbani data from local PostgreSQL cache for instant loading
// Falls back to BaniDB API if cache miss or database unavailable
// ============================================================================

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logApiError } from '@/lib/error-tracking';

// Use shared Prisma singleton
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

const ALLOWED_SOURCES = ['G', 'D', 'B', 'N', 'A', 'S', 'R'];

// Complete Raag ranges for all of SGGS — no gaps
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
    { pa: 'ਰਾਗੁ ਦੇਵਗੰਧਾਰੀ', en: 'Raag Devgandhari', start: 527, end: 536 },
    { pa: 'ਰਾਗੁ ਬਿਹਾਗੜਾ', en: 'Raag Bihagra', start: 537, end: 556 },
    { pa: 'ਰਾਗੁ ਵਡਹੰਸੁ', en: 'Raag Vadhans', start: 557, end: 594 },
    { pa: 'ਰਾਗੁ ਸੋਰਠਿ', en: 'Raag Sorath', start: 595, end: 659 },
    { pa: 'ਰਾਗੁ ਧਨਾਸਰੀ', en: 'Raag Dhanasri', start: 660, end: 695 },
    { pa: 'ਰਾਗੁ ਜੈਤਸਰੀ', en: 'Raag Jaitsri', start: 696, end: 710 },
    { pa: 'ਰਾਗੁ ਟੋਡੀ', en: 'Raag Todi', start: 711, end: 718 },
    { pa: 'ਰਾਗੁ ਬੈਰਾੜੀ', en: 'Raag Bairari', start: 719, end: 720 },
    { pa: 'ਰਾਗੁ ਤਿਲੰਗ', en: 'Raag Tilang', start: 721, end: 727 },
    { pa: 'ਰਾਗੁ ਸੂਹੀ', en: 'Raag Suhi', start: 728, end: 794 },
    { pa: 'ਰਾਗੁ ਬਿਲਾਵਲੁ', en: 'Raag Bilaval', start: 795, end: 858 },
    { pa: 'ਰਾਗੁ ਗੋਂਡ', en: 'Raag Gond', start: 859, end: 875 },
    { pa: 'ਰਾਗੁ ਰਾਮਕਲੀ', en: 'Raag Ramkali', start: 876, end: 974 },
    { pa: 'ਰਾਗੁ ਨਟ ਨਾਰਾਇਣ', en: 'Raag Nat Narayan', start: 975, end: 983 },
    { pa: 'ਰਾਗੁ ਮਾਲੀ ਗਉੜਾ', en: 'Raag Mali Gaura', start: 984, end: 988 },
    { pa: 'ਰਾਗੁ ਮਾਰੂ', en: 'Raag Maru', start: 989, end: 1106 },
    { pa: 'ਰਾਗੁ ਤੁਖਾਰੀ', en: 'Raag Tukhari', start: 1107, end: 1117 },
    { pa: 'ਰਾਗੁ ਕੇਦਾਰਾ', en: 'Raag Kedara', start: 1118, end: 1124 },
    { pa: 'ਰਾਗੁ ਭੈਰਉ', en: 'Raag Bhairo', start: 1125, end: 1167 },
    { pa: 'ਰਾਗੁ ਬਸੰਤੁ', en: 'Raag Basant', start: 1168, end: 1196 },
    { pa: 'ਰਾਗੁ ਸਾਰੰਗ', en: 'Raag Sarang', start: 1197, end: 1253 },
    { pa: 'ਰਾਗੁ ਮਲਾਰ', en: 'Raag Malaar', start: 1254, end: 1293 },
    { pa: 'ਰਾਗੁ ਕਾਨੜਾ', en: 'Raag Kanra', start: 1294, end: 1318 },
    { pa: 'ਰਾਗੁ ਕਲਿਆਣ', en: 'Raag Kalyan', start: 1319, end: 1326 },
    { pa: 'ਰਾਗੁ ਪ੍ਰਭਾਤੀ', en: 'Raag Parbhati', start: 1327, end: 1351 },
    { pa: 'ਰਾਗੁ ਜੈਜਾਵੰਤੀ', en: 'Raag Jaijavanti', start: 1352, end: 1353 },
    { pa: 'ਸਲੋਕ ਸਹਸਕ੍ਰਿਤੀ', en: 'Salok Sehskriti', start: 1353, end: 1360 },
    { pa: 'ਗਾਥਾ / ਫੁਨਹੇ', en: 'Gaatha / Funhey', start: 1360, end: 1364 },
    { pa: 'ਸਲੋਕ ਕਬੀਰ ਜੀ', en: 'Salok Kabir Ji', start: 1364, end: 1377 },
    { pa: 'ਸਲੋਕ ਫਰੀਦ ਜੀ', en: 'Salok Farid Ji', start: 1377, end: 1384 },
    { pa: 'ਸਵੈਏ', en: 'Savaiye', start: 1385, end: 1409 },
    { pa: 'ਭਗਤ ਕਬੀਰ ਜੀ', en: 'Bhagat Kabir Ji', start: 1410, end: 1425 },
    { pa: 'ਸਲੋਕ ਮਹਲਾ ੩', en: 'Salok Mehl 9', start: 1426, end: 1429 },
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

  const rawSource = request.nextUrl.searchParams.get('source') || 'G';
  const sourceId = ALLOWED_SOURCES.includes(rawSource) ? rawSource : 'G';

  try {
    // Rate limit
    const ip = getClientIdentifier(request);
    const rl = rateLimit(`gurbani-cached:${ip}`, { limit: 120, windowSeconds: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Try to get from local cache first (FAST!)
    const db = await getPrisma();
    if (db) {
      try {
        const cached = await db.gurbaniAngCache.findUnique({
          where: { angNumber },
        });

        if (cached) {
          // Safe JSON parse — treat corrupt cache as miss
          let verses;
          try {
            verses = JSON.parse(cached.versesJson);
          } catch {
            console.warn(`Corrupt cache for Ang ${angNumber}, treating as miss`);
            verses = null;
          }
          
          if (verses) {
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
                  'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
                  'X-Cache-Status': 'HIT',
                },
              }
            );
          }
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
      }).catch((err: unknown) => console.warn('Cache write failed:', err));
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
    logApiError('/api/gurbani/cached', error instanceof Error ? error : new Error(String(error)), 500);
    
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
