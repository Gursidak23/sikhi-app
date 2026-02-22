'use client';

// ============================================================================
// KIRTAN AUDIO LIBRARY PAGE
// ============================================================================
// Browse and listen to Shabads with audio, organized by Raag
// Uses fetchAng (with working server-side proxy) to load shabads
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { BookmarkButton } from '@/components/common/BookmarkSystem';
import { fetchAng, searchGurbani, type BaniDBVerse, type BaniDBAngResponse } from '@/lib/api/banidb-client';
import { SGGS_RAAG_RANGES, getRaagForAng } from '@/lib/constants/raag-ranges';
import type { Language } from '@/types';

interface ShabadItem {
  shabadId: number;
  pageNo: number;
  raag: string;
  raagPa: string;
  writer: string;
  firstLine: string;
  firstLineUnicode: string;
  translation: string;
  verseCount: number;
}

/**
 * Extract unique shabads from a BaniDB Ang response.
 * Groups verses by shabadId and takes the first verse of each shabad.
 */
function extractShabadsFromAng(angData: BaniDBAngResponse): ShabadItem[] {
  if (!angData?.page?.length) return [];
  const shabadMap = new Map<number, BaniDBVerse>();
  const countMap = new Map<number, number>();
  for (const verse of angData.page) {
    countMap.set(verse.shabadId, (countMap.get(verse.shabadId) || 0) + 1);
    if (!shabadMap.has(verse.shabadId)) {
      shabadMap.set(verse.shabadId, verse);
    }
  }
  return Array.from(shabadMap.entries()).map(([shabadId, verse]) => {
    const raag = getRaagForAng(verse.pageNo);
    return {
      shabadId,
      pageNo: verse.pageNo,
      raag: raag.en,
      raagPa: raag.pa,
      writer: verse.writer?.english || verse.writer?.unicode || '',
      firstLine: verse.verse?.gurmukhi || '',
      firstLineUnicode: verse.verse?.unicode || '',
      translation: verse.translation?.en?.bdb || verse.translation?.en?.ms || '',
      verseCount: countMap.get(shabadId) || 0,
    };
  });
}

/** Pick N random integers in [min, max] without repeats */
function pickRandomAngs(min: number, max: number, count: number): number[] {
  const range = max - min + 1;
  const n = Math.min(count, range);
  const picked = new Set<number>();
  while (picked.size < n) {
    picked.add(min + Math.floor(Math.random() * range));
  }
  return Array.from(picked);
}

export default function KirtanPage() {
  const [language, setLanguage] = useState<Language>('pa');
  const [shabads, setShabads] = useState<ShabadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRaag, setSelectedRaag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ShabadItem[]>([]);
  const [searching, setSearching] = useState(false);

  const isPunjabi = language === 'pa';
  const loadIdRef = useRef(0); // prevent stale loads

  /**
   * Load shabads by fetching random Angs.
   * When a raag is selected, we pick Angs within that raag's range.
   * When "all", we pick from the full SGGS range.
   * Uses fetchAng which routes through our server-side cached proxy — reliable.
   */
  const loadShabads = useCallback(async (raagFilter: string) => {
    const id = ++loadIdRef.current;
    setLoading(true);

    try {
      let angMin = 1;
      let angMax = 1430;

      // If a specific raag is selected, constrain to its Ang range
      if (raagFilter !== 'all') {
        const raagRange = SGGS_RAAG_RANGES.find(r => r.name.en === raagFilter);
        if (raagRange) {
          angMin = raagRange.angStart;
          angMax = raagRange.angEnd;
        }
      }

      // Pick 6 random Angs (each Ang has ~2-4 shabads, so 6 Angs ≈ 12-24 shabads)
      const randomAngs = pickRandomAngs(angMin, angMax, 6);
      const angResults = await Promise.all(randomAngs.map(ang => fetchAng(ang)));

      if (id !== loadIdRef.current) return; // stale — user switched raag

      // Extract shabads from all fetched Angs, deduplicate by shabadId
      const seen = new Set<number>();
      let items: ShabadItem[] = [];
      for (const angData of angResults) {
        if (!angData) continue;
        for (const shabad of extractShabadsFromAng(angData)) {
          if (!seen.has(shabad.shabadId)) {
            seen.add(shabad.shabadId);
            items.push(shabad);
          }
        }
      }

      // If we got very few results, try a few more Angs
      if (items.length < 4) {
        const moreAngs = pickRandomAngs(angMin, angMax, 4);
        const moreResults = await Promise.all(moreAngs.map(ang => fetchAng(ang)));
        if (id !== loadIdRef.current) return;
        for (const angData of moreResults) {
          if (!angData) continue;
          for (const shabad of extractShabadsFromAng(angData)) {
            if (!seen.has(shabad.shabadId)) {
              seen.add(shabad.shabadId);
              items.push(shabad);
            }
          }
        }
      }

      // Sort by pageNo for a natural reading order
      items.sort((a, b) => a.pageNo - b.pageNo);

      setShabads(items);
    } catch (err) {
      console.error('Error loading shabads:', err);
    } finally {
      if (id === loadIdRef.current) setLoading(false);
    }
  }, []);

  // Load on mount and when raag changes
  useEffect(() => { loadShabads(selectedRaag); }, [selectedRaag, loadShabads]);

  // Search shabads
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await searchGurbani(searchQuery.trim(), 2);
      if (data?.verses) {
        // Group by shabadId to get unique shabads
        const shabadMap = new Map<number, BaniDBVerse>();
        for (const verse of data.verses) {
          if (!shabadMap.has(verse.shabadId)) {
            shabadMap.set(verse.shabadId, verse);
          }
        }
        const items: ShabadItem[] = Array.from(shabadMap.entries()).map(([shabadId, verse]) => {
          const raag = getRaagForAng(verse.pageNo);
          return {
            shabadId,
            pageNo: verse.pageNo,
            raag: raag.en,
            raagPa: raag.pa,
            writer: verse.writer?.english || verse.writer?.unicode || 'Unknown',
            firstLine: verse.verse?.gurmukhi || '',
            firstLineUnicode: verse.verse?.unicode || '',
            translation: verse.translation?.en?.bdb || verse.translation?.en?.ms || '',
            verseCount: 0,
          };
        });
        setSearchResults(items);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  // When search is active, show search results; otherwise show loaded shabads
  const displayShabads = searchResults.length > 0 ? searchResults : shabads;

  // Featured raags for quick browse
  const featuredRaags = SGGS_RAAG_RANGES.filter(r => 
    ['sri-raag', 'raag-aasaa', 'raag-gauri', 'raag-bilaval', 'raag-sorath', 'raag-ramkali', 'raag-maru'].includes(r.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 via-white to-teal-50 dark:from-[#0d1b2a] dark:via-[#1b2838] dark:to-[#0d1b2a]">
      <MainNavigation currentLanguage={language} onLanguageChange={setLanguage} />

      <main id="main-content" className="flex-1">
        {/* Header */}
        <section className="py-8 md:py-12 text-center">
          <div className="container-content">
            <div className="text-5xl mb-3">🎵</div>
            <h1 className={cn('text-3xl md:text-4xl font-bold text-emerald-900 dark:text-emerald-200', isPunjabi && 'font-gurmukhi')}>
              {isPunjabi ? 'ਕੀਰਤਨ ਖ਼ਜ਼ਾਨਾ' : 'Kirtan Library'}
            </h1>
            <p className={cn('text-emerald-700 dark:text-emerald-300 mt-2 text-lg', isPunjabi && 'font-gurmukhi')}>
              {isPunjabi ? 'ਸ਼ਬਦ ਖੋਜੋ, ਪੜ੍ਹੋ ਅਤੇ ਸੁਣੋ' : 'Discover, Read & Listen to Shabads'}
            </p>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="pb-6">
          <div className="container-content max-w-5xl">
            {/* Search Bar */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={isPunjabi ? 'ਸ਼ਬਦ ਖੋਜੋ...' : 'Search shabads...'}
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600',
                  'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white',
                  'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none',
                  'font-gurmukhi'
                )}
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors min-h-[48px]"
              >
                {searching ? '...' : '🔍'}
              </button>
            </div>

            {/* Featured Raags */}
            <div className="mb-6">
              <h3 className={cn('text-sm font-medium text-neutral-500 mb-3', isPunjabi && 'font-gurmukhi')}>
                {isPunjabi ? 'ਮੁੱਖ ਰਾਗ:' : 'Browse by Raag:'}
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRaag('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-colors',
                    selectedRaag === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  )}
                >
                  {isPunjabi ? 'ਸਾਰੇ' : 'All'}
                </button>
                {featuredRaags.map((raag) => (
                  <button
                    key={raag.id}
                    onClick={() => setSelectedRaag(raag.name.en)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-colors',
                      selectedRaag === raag.name.en
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    )}
                  >
                    {isPunjabi ? raag.name.pa : raag.name.en}
                  </button>
                ))}
              </div>
            </div>

            {/* View Toggle + Refresh */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                {displayShabads.length} {isPunjabi ? 'ਸ਼ਬਦ' : 'shabads'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('p-2 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' : 'text-neutral-400')}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-2 rounded-lg transition-colors', viewMode === 'list' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' : 'text-neutral-400')}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                </button>
                <button
                  onClick={() => loadShabads(selectedRaag)}
                  className="px-3 py-2 text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  🔄 {isPunjabi ? 'ਹੋਰ ਲੋਡ' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Shabads Grid/List */}
        <section className="pb-16">
          <div className="container-content max-w-5xl">
            {loading && (
              <div className="text-center py-20">
                <div className="text-5xl animate-pulse">🎵</div>
                <p className={cn('text-emerald-700 dark:text-emerald-400 mt-4', isPunjabi && 'font-gurmukhi')}>
                  {isPunjabi ? 'ਸ਼ਬਦ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...' : 'Loading shabads...'}
                </p>
              </div>
            )}

            {!loading && displayShabads.length === 0 && (
              <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-neutral-600 dark:text-neutral-400 font-gurmukhi">
                  {isPunjabi ? 'ਕੋਈ ਸ਼ਬਦ ਨਹੀਂ ਮਿਲੇ' : 'No shabads found'}
                </p>
                <button
                  onClick={() => loadShabads(selectedRaag)}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                >
                  {isPunjabi ? '🔄 ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ' : '🔄 Try Again'}
                </button>
              </div>
            )}

            {!loading && displayShabads.length > 0 && (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
              )}>
                {displayShabads.map((shabad) => (
                  viewMode === 'grid' ? (
                    /* Grid Card */
                    <Link
                      key={shabad.shabadId}
                      href={`/shabad/${shabad.shabadId}`}
                      className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-lg transition-all group block"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          {shabad.raag}
                        </span>
                        <span className="text-xs text-neutral-500">ਅੰਗ {shabad.pageNo}</span>
                      </div>
                      <p className="font-gurmukhi text-lg text-neutral-900 dark:text-neutral-100 leading-relaxed line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors" style={{ lineHeight: '1.8' }}>
                        {shabad.firstLineUnicode || shabad.firstLine}
                      </p>
                      {shabad.translation && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
                          {shabad.translation}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                        <span className="text-xs text-neutral-500">✍️ {shabad.writer}</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isPunjabi ? 'ਪੜ੍ਹੋ →' : 'Read →'}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    /* List Row */
                    <Link
                      key={shabad.shabadId}
                      href={`/shabad/${shabad.shabadId}`}
                      className="flex items-center gap-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 hover:shadow-md transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xl flex-shrink-0">
                        📖
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-gurmukhi text-base text-neutral-900 dark:text-neutral-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                          {shabad.firstLineUnicode || shabad.firstLine}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                          <span>{shabad.raag}</span>
                          <span>•</span>
                          <span>✍️ {shabad.writer}</span>
                          <span>•</span>
                          <span>ਅੰਗ {shabad.pageNo}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-neutral-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <ScrollToTop />
      <Footer language={language} />
    </div>
  );
}
