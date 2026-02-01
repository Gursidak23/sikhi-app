/**
 * BaniDB API Client
 * Fetches Gurbani data from the BaniDB API (Khalis Foundation)
 * https://github.com/KhalisFoundation/banidb-api
 * 
 * BaniDB is the most accurate Gurbani database with over 43,000+ corrections.
 * Used by SikhiToTheMax and approved by SGPC.
 */

const BANIDB_API_BASE = 'https://api.banidb.com/v2';

export interface BaniDBVerse {
  verseId: number;
  shabadId: number;
  verse: {
    gurmukhi: string;
    unicode: string;
    larivaar?: {
      gurmukhi: string;
      unicode: string;
    };
  };
  larivaar: {
    gurmukhi: string;
    unicode: string;
  };
  translation: {
    en: {
      bdb: string | null;
      ms: string | null;
      ssk: string | null;
    };
    pu: {
      // BaniDB returns Punjabi translations as objects with gurmukhi/unicode
      bdb: string | { gurmukhi: string; unicode: string } | null;
      ss?: string | { gurmukhi: string; unicode: string } | null;
      ft?: string | { gurmukhi: string; unicode: string } | null;
      ms?: string | { gurmukhi: string; unicode: string } | null;
    };
    hi?: {
      ss?: string | null;
      sts?: string | null;
    };
    es?: {
      sn?: string | null;
    };
  };
  transliteration: {
    english: string;
    hindi: string;
    en: string;
    hi: string;
    ipa: string;
    ur: string;
  };
  pageNo: number;
  lineNo: number;
  updated: string;
  visraam: {
    sttm: Array<{ p: number; t: string }>;
    igurbani: Array<{ p: number; t: string }>;
    sttm2: Array<{ p: number; t: string }>;
  };
  writer?: {
    writerId: number;
    gurmukhi: string;
    unicode: string | null;
    english: string;
  };
  raag?: {
    raagId: number;
    gurmukhi: string;
    unicode: string;
    english: string;
    raagWithPage: string;
  };
}

export interface BaniDBAngResponse {
  source: {
    sourceId: string;
    gurmukhi: string;
    unicode: string;
    english: string;
    pageNo: number;
  };
  count: number;
  navigation: {
    previous: number | null;
    next: number | null;
  };
  page: BaniDBVerse[];
}

export interface BaniDBShabadResponse {
  shabadInfo: {
    shabadId: number;
    shabadName: number;
    pageNo: number;
    source: {
      sourceId: string;
      gurmukhi: string;
      unicode: string;
      english: string;
      pageNo: number;
    };
    raag: {
      raagId: number;
      gurmukhi: string;
      unicode: string;
      english: string;
      raagWithPage: string;
    };
    writer: {
      writerId: number;
      gurmukhi: string;
      unicode: string;
      english: string;
    };
  };
  count: number;
  navigation: {
    previous: number | null;
    next: number | null;
  };
  verses: BaniDBVerse[];
}

export interface BaniDBSearchResponse {
  resultsInfo: {
    totalResults: number;
    pageResults: number;
    pages: {
      page: number;
      resultsPerPage: number;
      totalPages: number;
      nextPage?: string;
    };
  };
  verses: BaniDBVerse[];
}

// In-memory cache for instant navigation
const angCache = new Map<number, { data: BaniDBAngResponse; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

/**
 * Fetch content for a specific Ang (page) of Sri Guru Granth Sahib Ji
 * Uses local cached API route for instant loading
 * Falls back to direct BaniDB API if cache unavailable
 */
export async function fetchAng(angNumber: number, sourceId: string = 'G'): Promise<BaniDBAngResponse | null> {
  // Check in-memory cache first (instant!)
  const cached = angCache.get(angNumber);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Use cached API route (reads from Aiven PostgreSQL)
    const response = await fetch(`/api/gurbani/cached/${angNumber}?source=${sourceId}`);
    
    if (!response.ok) {
      // Fallback to direct BaniDB proxy
      const fallbackResponse = await fetch(`/api/gurbani/banidb/${angNumber}?source=${sourceId}`);
      if (!fallbackResponse.ok) {
        console.error(`API error: ${fallbackResponse.status}`);
        return null;
      }
      const data = await fallbackResponse.json();
      angCache.set(angNumber, { data, timestamp: Date.now() });
      return data as BaniDBAngResponse;
    }
    
    const data = await response.json();
    // Store in memory cache
    angCache.set(angNumber, { data, timestamp: Date.now() });
    return data as BaniDBAngResponse;
  } catch (error) {
    console.error('Error fetching from API:', error);
    return null;
  }
}

/**
 * Prefetch adjacent Angs in the background for instant navigation
 * Call this after loading an Ang to preload prev/next
 */
export function prefetchAdjacentAngs(currentAng: number): void {
  const prev = currentAng - 1;
  const next = currentAng + 1;

  // Prefetch previous Ang if valid and not cached
  if (prev >= 1 && !angCache.has(prev)) {
    fetchAng(prev).catch(() => {}); // Silent prefetch
  }

  // Prefetch next Ang if valid and not cached
  if (next <= 1430 && !angCache.has(next)) {
    fetchAng(next).catch(() => {}); // Silent prefetch
  }
}

/**
 * Clear the in-memory cache
 */
export function clearAngCache(): void {
  angCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: number[] } {
  return {
    size: angCache.size,
    keys: Array.from(angCache.keys()),
  };
}

/**
 * Fetch a specific Shabad by ID
 */
export async function fetchShabad(shabadId: number): Promise<BaniDBShabadResponse | null> {
  try {
    const response = await fetch(`${BANIDB_API_BASE}/shabads/${shabadId}`);
    
    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data as BaniDBShabadResponse;
  } catch (error) {
    console.error('Error fetching shabad from BaniDB:', error);
    return null;
  }
}

/**
 * Search Gurbani
 * @param query - Search query (first letters or full words)
 * @param searchType - 0: First letter start, 1: First letter anywhere, 2: Full word Gurmukhi
 */
export async function searchGurbani(
  query: string,
  searchType: number = 0,
  page: number = 1
): Promise<BaniDBSearchResponse | null> {
  try {
    const response = await fetch(
      `${BANIDB_API_BASE}/search/${encodeURIComponent(query)}?searchtype=${searchType}&page=${page}`
    );
    
    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data as BaniDBSearchResponse;
  } catch (error) {
    console.error('Error searching BaniDB:', error);
    return null;
  }
}

/**
 * Get today's Hukamnama from Sri Darbar Sahib
 */
export async function fetchHukamnama(): Promise<any> {
  try {
    const response = await fetch(`${BANIDB_API_BASE}/hukamnamas`);
    
    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Hukamnama from BaniDB:', error);
    return null;
  }
}

/**
 * Get random Shabad
 */
export async function fetchRandomShabad(sourceId: string = 'G'): Promise<BaniDBShabadResponse | null> {
  try {
    const response = await fetch(`${BANIDB_API_BASE}/random/${sourceId}`);
    
    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data as BaniDBShabadResponse;
  } catch (error) {
    console.error('Error fetching random shabad from BaniDB:', error);
    return null;
  }
}

/**
 * Get all Raags
 */
export async function fetchRaags(): Promise<any[]> {
  try {
    const response = await fetch(`${BANIDB_API_BASE}/raags`);
    
    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.rows || [];
  } catch (error) {
    console.error('Error fetching raags from BaniDB:', error);
    return [];
  }
}

/**
 * Get all Writers (Bani authors)
 */
export async function fetchWriters(): Promise<any[]> {
  try {
    const response = await fetch(`${BANIDB_API_BASE}/writers`);
    
    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.rows || [];
  } catch (error) {
    console.error('Error fetching writers from BaniDB:', error);
    return [];
  }
}

// Source IDs
export const BANIDB_SOURCES = {
  G: 'Sri Guru Granth Sahib Ji',
  D: 'Sri Dasam Granth Sahib',
  B: 'Vaaran Bhai Gurdaas Ji',
  N: 'Bhai Nand Lal Ji',
  A: 'Amrit Keertan',
  S: 'Bhai Gurdas Singh Ji Vaaran',
  R: 'Rehatnamas & Panthic Sources',
} as const;
