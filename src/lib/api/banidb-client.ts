/**
 * BaniDB API Client
 * Fetches Gurbani data from the BaniDB API (Khalis Foundation)
 * https://github.com/KhalisFoundation/banidb-api
 * 
 * BaniDB is the most accurate Gurbani database with over 43,000+ corrections.
 * Used by SikhiToTheMax and approved by SGPC.
 * 
 * To use the local BaniDB backup, set NEXT_PUBLIC_BANIDB_API_URL in .env.local:
 *   NEXT_PUBLIC_BANIDB_API_URL=http://localhost:3001/v2
 */

const BANIDB_API_BASE = process.env.NEXT_PUBLIC_BANIDB_API_URL || 'https://api.banidb.com/v2';

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

// Lazy imports for offline storage (avoid SSR issues)
async function getOfflineStorage() {
  if (typeof window === 'undefined') return null;
  const { saveAng, getAng, saveBani, getBani, saveHukamnama, getHukamnama, saveSearchResults, getSearchResults } = await import('@/lib/offline/indexeddb');
  return { saveAng, getAng, saveBani, getBani, saveHukamnama, getHukamnama, saveSearchResults, getSearchResults };
}

async function getResilientFetch() {
  if (typeof window === 'undefined') return null;
  const { resilientFetch } = await import('@/lib/offline/resilient-fetch');
  return resilientFetch;
}

/**
 * Fetch content for a specific Ang (page) of Sri Guru Granth Sahib Ji
 * 
 * 4-layer fallback strategy:
 * 1. In-memory cache (instant)
 * 2. IndexedDB persistent cache (offline-capable)
 * 3. App API route with retry (resilient)
 * 4. Direct BaniDB proxy (last resort)
 */
export async function fetchAng(angNumber: number, sourceId: string = 'G'): Promise<BaniDBAngResponse | null> {
  // Layer 1: In-memory cache (instant)
  const cached = angCache.get(angNumber);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Layer 2: IndexedDB persistent cache (works offline)
  const storage = await getOfflineStorage();
  if (storage) {
    const idbCached = await storage.getAng(angNumber);
    if (idbCached) {
      const data = idbCached as BaniDBAngResponse;
      angCache.set(angNumber, { data, timestamp: Date.now() });
      
      // Background refresh from network (stale-while-revalidate)
      refreshAngInBackground(angNumber, sourceId).catch(() => {});
      return data;
    }
  }

  // Layer 3: Network fetch with resilience
  try {
    const rfetch = await getResilientFetch();
    const doFetch = rfetch || fetch;

    // Try cached API route first
    const response = await doFetch(`/api/gurbani/cached/${angNumber}?source=${sourceId}`);
    
    if (response.ok) {
      const data = await response.json();
      angCache.set(angNumber, { data, timestamp: Date.now() });
      // Persist to IndexedDB for offline use
      storage?.saveAng(angNumber, data).catch(() => {});
      return data as BaniDBAngResponse;
    }

    // Layer 4: Fallback to direct BaniDB proxy
    const fallbackResponse = await doFetch(`/api/gurbani/banidb/${angNumber}?source=${sourceId}`);
    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      angCache.set(angNumber, { data, timestamp: Date.now() });
      storage?.saveAng(angNumber, data).catch(() => {});
      return data as BaniDBAngResponse;
    }
    
    console.error(`API error: ${fallbackResponse.status}`);
    return null;
  } catch (error) {
    console.error('Error fetching from API:', error);
    
    // Final fallback: try IndexedDB one more time (network may have just gone down)
    if (storage) {
      const offlineData = await storage.getAng(angNumber);
      if (offlineData) return offlineData as BaniDBAngResponse;
    }
    return null;
  }
}

/** Background refresh — update IndexedDB without blocking the UI */
async function refreshAngInBackground(angNumber: number, sourceId: string): Promise<void> {
  try {
    const response = await fetch(`/api/gurbani/cached/${angNumber}?source=${sourceId}`);
    if (response.ok) {
      const data = await response.json();
      angCache.set(angNumber, { data, timestamp: Date.now() });
      const storage = await getOfflineStorage();
      storage?.saveAng(angNumber, data);
    }
  } catch {
    // Silent — this is a background optimization
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
 * Fetch a specific Shabad by ID (with resilient fetch)
 */
export async function fetchShabad(shabadId: number): Promise<BaniDBShabadResponse | null> {
  try {
    const rfetch = await getResilientFetch();
    const doFetch = rfetch || fetch;
    const response = await doFetch(`${BANIDB_API_BASE}/shabads/${shabadId}`);
    
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
 * Search Gurbani with caching
 * @param query - Search query (first letters or full words)
 * @param searchType - 0: First letter start, 1: First letter anywhere, 2: Full word Gurmukhi
 */
export async function searchGurbani(
  query: string,
  searchType: number = 0,
  page: number = 1
): Promise<BaniDBSearchResponse | null> {
  const cacheKey = `${query}:${searchType}:${page}`;
  
  try {
    // Check IndexedDB search cache
    const storage = await getOfflineStorage();
    if (storage) {
      const cached = await storage.getSearchResults(cacheKey);
      if (cached) return cached as BaniDBSearchResponse;
    }

    const rfetch = await getResilientFetch();
    const doFetch = rfetch || fetch;
    const response = await doFetch(
      `${BANIDB_API_BASE}/search/${encodeURIComponent(query)}?searchtype=${searchType}&page=${page}`
    );
    
    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Cache search results
    storage?.saveSearchResults(cacheKey, data).catch(() => {});
    
    return data as BaniDBSearchResponse;
  } catch (error) {
    console.error('Error searching BaniDB:', error);
    return null;
  }
}

/**
 * Get today's Hukamnama from Sri Darbar Sahib (with daily cache)
 */
export async function fetchHukamnama(): Promise<HukamnamaResponse | null> {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Check IndexedDB for today's cached Hukamnama
    const storage = await getOfflineStorage();
    if (storage) {
      const cached = await storage.getHukamnama(today);
      if (cached) return cached as HukamnamaResponse;
    }

    const rfetch = await getResilientFetch();
    const doFetch = rfetch || fetch;
    const response = await doFetch(`${BANIDB_API_BASE}/hukamnamas`);
    
    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status}`);
      // Fallback: try yesterday's cached Hukamnama
      if (storage) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const yesterdayCache = await storage.getHukamnama(yesterday);
        if (yesterdayCache) return yesterdayCache as HukamnamaResponse;
      }
      return null;
    }

    const data = await response.json();
    
    // Cache today's Hukamnama in IndexedDB
    storage?.saveHukamnama(today, data).catch(() => {});
    
    return data as HukamnamaResponse;
  } catch (error) {
    console.error('Error fetching Hukamnama from BaniDB:', error);
    // Offline fallback
    const storage = await getOfflineStorage();
    if (storage) {
      const cached = await storage.getHukamnama(today);
      if (cached) return cached as HukamnamaResponse;
    }
    return null;
  }
}

/** Typed Hukamnama response */
export interface HukamnamaResponse {
  date?: { gregorian?: { date?: string } };
  hukamnamainfo?: { shabadid?: number; pageno?: number };
  verses?: BaniDBVerse[];
  [key: string]: unknown;
}

/**
 * Fetch a specific Bani by ID (for Nitnem) with IndexedDB caching
 * Critical for offline daily prayers
 */
export async function fetchBani(baniId: number): Promise<{ verses: unknown[] } | null> {
  try {
    // Check IndexedDB first (offline Nitnem!)
    const storage = await getOfflineStorage();
    if (storage) {
      const cached = await storage.getBani(baniId);
      if (cached) {
        // Background refresh
        refreshBaniInBackground(baniId).catch(() => {});
        return cached as { verses: unknown[] };
      }
    }

    const rfetch = await getResilientFetch();
    const doFetch = rfetch || fetch;
    const response = await doFetch(`${BANIDB_API_BASE}/banis/${baniId}`);
    
    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Cache Bani for offline use (these are static sacred texts)
    storage?.saveBani(baniId, data).catch(() => {});
    
    return data;
  } catch (error) {
    console.error('Error fetching bani from BaniDB:', error);
    // Offline fallback
    const storage = await getOfflineStorage();
    if (storage) {
      const cached = await storage.getBani(baniId);
      if (cached) return cached as { verses: unknown[] };
    }
    return null;
  }
}

/** Background refresh for Bani content */
async function refreshBaniInBackground(baniId: number): Promise<void> {
  try {
    const response = await fetch(`${BANIDB_API_BASE}/banis/${baniId}`);
    if (response.ok) {
      const data = await response.json();
      const storage = await getOfflineStorage();
      storage?.saveBani(baniId, data);
    }
  } catch {
    // Silent background refresh
  }
}

/**
 * Get random Shabad (with resilient fetch)
 */
export async function fetchRandomShabad(sourceId: string = 'G'): Promise<BaniDBShabadResponse | null> {
  try {
    const rfetch = await getResilientFetch();
    const doFetch = rfetch || fetch;
    const response = await doFetch(`${BANIDB_API_BASE}/random/${sourceId}`);
    
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
 * Get all Raags (with resilient fetch)
 */
export async function fetchRaags(): Promise<Array<{ raagId: number; gurmukhi: string; unicode: string; english: string }>> {
  try {
    const rfetch = await getResilientFetch();
    const doFetch = rfetch || fetch;
    const response = await doFetch(`${BANIDB_API_BASE}/raags`);
    
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
 * Get all Writers (Bani authors) (with resilient fetch)
 */
export async function fetchWriters(): Promise<Array<{ writerId: number; gurmukhi: string; unicode: string; english: string }>> {
  try {
    const rfetch = await getResilientFetch();
    const doFetch = rfetch || fetch;
    const response = await doFetch(`${BANIDB_API_BASE}/writers`);
    
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
