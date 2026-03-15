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

import { apiUrl } from '@/lib/api-url';

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

// In-memory LRU cache for instant navigation (max 150 entries)
const MAX_CACHE_SIZE = 150;
const angCache = new Map<number, { data: BaniDBAngResponse; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const STALE_THRESHOLD = 1000 * 60 * 5; // 5 minutes — don't background-refresh if newer

/** Inflight request dedup — prevents duplicate network requests for same Ang */
const inflightRequests = new Map<number, Promise<BaniDBAngResponse | null>>();

/** LRU: move key to end (most recent) */
function touchCache(angNumber: number): void {
  const entry = angCache.get(angNumber);
  if (entry) {
    angCache.delete(angNumber);
    angCache.set(angNumber, entry);
  }
}

/** LRU eviction: remove oldest entries when over limit */
function evictIfNeeded(): void {
  while (angCache.size > MAX_CACHE_SIZE) {
    const oldest = angCache.keys().next().value;
    if (oldest !== undefined) angCache.delete(oldest);
    else break;
  }
}

/** Try loading a bundled static JSON file (works in Capacitor and static export) */
async function fetchBundledJson<T>(path: string): Promise<T | null> {
  if (typeof window === 'undefined') return null;
  try {
    const response = await fetch(path);
    if (response.ok) return await response.json() as T;
  } catch {
    // Bundled file not available
  }
  return null;
}

// Cached dynamic imports (avoid re-importing every call)
let offlineStorageModule: Awaited<ReturnType<typeof getOfflineStorageInner>> | null = null;
let resilientFetchFn: ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) | null | undefined = undefined;

/** Cached offline search index */
let searchIndexCache: Array<{ i: number; s: number; g: string; f: string; p: number }> | null = null;

async function getOfflineStorageInner() {
  if (typeof window === 'undefined') return null;
  return import('@/lib/offline/indexeddb');
}

// Lazy imports for offline storage (avoid SSR issues)
async function getOfflineStorage() {
  if (typeof window === 'undefined') return null;
  if (offlineStorageModule) return offlineStorageModule;
  offlineStorageModule = await getOfflineStorageInner();
  return offlineStorageModule;
}

async function getResilientFetch() {
  if (typeof window === 'undefined') return null;
  if (resilientFetchFn !== undefined) return resilientFetchFn;
  try {
    const mod = await import('@/lib/offline/resilient-fetch');
    resilientFetchFn = mod.resilientFetch as typeof fetch;
  } catch {
    resilientFetchFn = null;
  }
  return resilientFetchFn;
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
    touchCache(angNumber);
    return cached.data;
  }

  // Dedup: if already fetching this Ang, return the same promise
  const inflight = inflightRequests.get(angNumber);
  if (inflight) return inflight;

  const fetchPromise = fetchAngInternal(angNumber, sourceId);
  inflightRequests.set(angNumber, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    inflightRequests.delete(angNumber);
  }
}

async function fetchAngInternal(angNumber: number, sourceId: string): Promise<BaniDBAngResponse | null> {
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
      evictIfNeeded();

      // Background refresh only if data is stale (older than 5 min)
      refreshAngInBackground(angNumber, sourceId).catch(() => {});
      return data;
    }
  }

  // Layer 2.5: Bundled static JSON (offline APK)
  const bundled = await fetchBundledJson<BaniDBAngResponse>(`/data/gurbani/ang-${angNumber}.json`);
  if (bundled) {
    angCache.set(angNumber, { data: bundled, timestamp: Date.now() });
    evictIfNeeded();
    storage?.saveAng(angNumber, bundled).catch(() => {});
    return bundled;
  }

  // Layer 3: Network fetch with resilience
  try {
    const rfetch = await getResilientFetch();
    const doFetch = rfetch || fetch;

    // Try cached API route first
    const response = await doFetch(apiUrl(`/api/gurbani/cached/${angNumber}?source=${sourceId}`));

    if (response.ok) {
      const data = await response.json();
      angCache.set(angNumber, { data, timestamp: Date.now() });
      evictIfNeeded();
      // Persist to IndexedDB for offline use
      storage?.saveAng(angNumber, data).catch(() => {});
      return data as BaniDBAngResponse;
    }

    // Layer 4: Fallback to direct BaniDB proxy
    const fallbackResponse = await doFetch(apiUrl(`/api/gurbani/banidb/${angNumber}?source=${sourceId}`));
    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      angCache.set(angNumber, { data, timestamp: Date.now() });
      evictIfNeeded();
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

/** Background refresh — update caches without blocking the UI. Skips if data is fresh. */
async function refreshAngInBackground(angNumber: number, sourceId: string): Promise<void> {
  // Skip if data is recent enough
  const existing = angCache.get(angNumber);
  if (existing && Date.now() - existing.timestamp < STALE_THRESHOLD) return;

  try {
    const response = await fetch(apiUrl(`/api/gurbani/cached/${angNumber}?source=${sourceId}`));
    if (response.ok) {
      const data = await response.json();
      angCache.set(angNumber, { data, timestamp: Date.now() });
      evictIfNeeded();
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
 * Fetch a specific Shabad by ID (with resilient fetch + IndexedDB caching)
 */
export async function fetchShabad(shabadId: number): Promise<BaniDBShabadResponse | null> {
  // Check IndexedDB first for offline support
  const storage = await getOfflineStorage();
  if (storage) {
    const cached = await storage.getSearchResults(`shabad:${shabadId}`);
    if (cached) return cached as BaniDBShabadResponse;
  }

  try {
    const rfetch = await getResilientFetch();
    const doFetch = rfetch || fetch;
    const response = await doFetch(`${BANIDB_API_BASE}/shabads/${shabadId}`);

    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    // Cache for offline
    storage?.saveSearchResults(`shabad:${shabadId}`, data).catch(() => {});
    return data as BaniDBShabadResponse;
  } catch (error) {
    console.error('Error fetching shabad from BaniDB:', error);
    // Offline fallback: check IndexedDB again
    if (storage) {
      const cached = await storage.getSearchResults(`shabad:${shabadId}`);
      if (cached) return cached as BaniDBShabadResponse;
    }
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

    // Layer 1: Use our own API search proxy (avoids CORS)
    try {
      const proxyResponse = await doFetch(
        apiUrl(`/api/gurbani/search?q=${encodeURIComponent(query)}&searchtype=${searchType}&page=${page}`)
      );
      if (proxyResponse.ok) {
        const data = await proxyResponse.json();
        // Wrap results in BaniDB format if needed
        if (data.results && !data.verses) {
          // App API returns { results } format — normalise to BaniDB shape
          const normalised: BaniDBSearchResponse = {
            resultsInfo: { totalResults: data.resultCount || data.results.length, pageResults: data.results.length, pages: { page, resultsPerPage: 20, totalPages: 1 } },
            verses: data.results,
          };
          storage?.saveSearchResults(cacheKey, normalised).catch(() => {});
          return normalised;
        }
        storage?.saveSearchResults(cacheKey, data).catch(() => {});
        return data as BaniDBSearchResponse;
      }
    } catch {
      // Proxy failed, try direct BaniDB
    }

    // Layer 2: Direct BaniDB (fallback)
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

    // Offline fallback: client-side search using bundled index
    return searchOfflineIndex(query, searchType, page);
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
    // Final fallback: bundled Hukamnama
    return fetchBundledJson<HukamnamaResponse>('/data/hukamnama/latest.json');
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

    // Try bundled static JSON (offline APK)
    const bundled = await fetchBundledJson<{ verses: unknown[] }>(`/data/nitnem/bani-${baniId}.json`);
    if (bundled) {
      const storage2 = await getOfflineStorage();
      storage2?.saveBani(baniId, bundled).catch(() => {});
      return bundled;
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
    const storage3 = await getOfflineStorage();
    storage3?.saveBani(baniId, data).catch(() => {});

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
 * 
 * 2-layer strategy:
 * 1. App API route (server-side proxy — no CORS issues)
 * 2. Direct BaniDB (fallback)
 */
export async function fetchRandomShabad(sourceId: string = 'G'): Promise<BaniDBShabadResponse | null> {
  try {
    const rfetch = await getResilientFetch();
    const doFetch = rfetch || fetch;

    // Layer 1: Use our own API proxy (avoids CORS & adds resilience)
    try {
      const proxyResponse = await doFetch(apiUrl(`/api/gurbani/random?source=${sourceId}`));
      if (proxyResponse.ok) {
        const data = await proxyResponse.json();
        return data as BaniDBShabadResponse;
      }
    } catch {
      // Proxy failed, try direct
    }

    // Layer 2: Direct BaniDB (fallback)
    const response = await doFetch(`${BANIDB_API_BASE}/random/${sourceId}`);
    
    if (!response.ok) {
      console.error(`BaniDB API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data as BaniDBShabadResponse;
  } catch (error) {
    console.error('Error fetching random shabad from BaniDB:', error);
    // Offline fallback: load a random Ang from bundled data
    const randomAng = Math.floor(Math.random() * 1430) + 1;
    const angData = await fetchBundledJson<BaniDBAngResponse>(`/data/gurbani/ang-${randomAng}.json`);
    if (angData?.page?.length) {
      const verse = angData.page[0];
      return {
        shabadInfo: {
          shabadId: verse.shabadId,
          shabadName: verse.shabadId,
          pageNo: verse.pageNo,
          source: angData.source,
          raag: verse.raag || { raagId: 0, gurmukhi: '', unicode: '', english: '', raagWithPage: '' },
          writer: verse.writer ? { writerId: verse.writer.writerId, gurmukhi: verse.writer.gurmukhi, unicode: verse.writer.unicode || '', english: verse.writer.english } : { writerId: 0, gurmukhi: '', unicode: '', english: '' },
        },
        count: 1,
        navigation: { previous: null, next: null },
        verses: angData.page.filter(v => v.shabadId === verse.shabadId),
      };
    }
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
    // Offline fallback: bundled raags
    const bundled = await fetchBundledJson<{ rows: Array<{ raagId: number; gurmukhi: string; unicode: string; english: string }> }>('/data/meta/raags.json');
    return bundled?.rows || [];
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
    // Offline fallback: bundled writers
    const bundled = await fetchBundledJson<{ rows: Array<{ writerId: number; gurmukhi: string; unicode: string; english: string }> }>('/data/meta/writers.json');
    return bundled?.rows || [];
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

/**
 * Offline search using bundled search index.
 * Supports first-letter (type 0,1) and full-word (type 2) search.
 */
async function searchOfflineIndex(
  query: string,
  searchType: number,
  page: number
): Promise<BaniDBSearchResponse | null> {
  if (typeof window === 'undefined') return null;

  // Lazy-load search index
  if (!searchIndexCache) {
    const data = await fetchBundledJson<Array<{ i: number; s: number; g: string; f: string; p: number }>>('/data/search-index.json');
    if (!data) return null;
    searchIndexCache = data;
  }

  const RESULTS_PER_PAGE = 20;
  let matches: typeof searchIndexCache;

  if (searchType === 0) {
    // First letter — starts with
    matches = searchIndexCache.filter(e => e.f.startsWith(query));
  } else if (searchType === 1) {
    // First letter — anywhere
    matches = searchIndexCache.filter(e => e.f.includes(query));
  } else {
    // Full word Gurmukhi
    matches = searchIndexCache.filter(e => e.g.includes(query));
  }

  const totalResults = matches.length;
  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
  const start = (page - 1) * RESULTS_PER_PAGE;
  const pageResults = matches.slice(start, start + RESULTS_PER_PAGE);

  return {
    resultsInfo: {
      totalResults,
      pageResults: pageResults.length,
      pages: { page, resultsPerPage: RESULTS_PER_PAGE, totalPages },
    },
    verses: pageResults.map(e => ({
      verseId: e.i,
      shabadId: e.s,
      verse: { gurmukhi: e.g, unicode: e.g },
      larivaar: { gurmukhi: e.g.replace(/\s+/g, ''), unicode: e.g.replace(/\s+/g, '') },
      translation: { en: { bdb: null, ms: null, ssk: null }, pu: { bdb: null } },
      transliteration: { english: '', hindi: '', en: '', hi: '', ipa: '', ur: '' },
      pageNo: e.p,
      lineNo: 0,
      updated: '',
      visraam: { sttm: [], igurbani: [], sttm2: [] },
    })),
  };
}
