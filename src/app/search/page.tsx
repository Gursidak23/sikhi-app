'use client';

// ============================================================================
// FULL GURBANI SEARCH PAGE
// ============================================================================
// Advanced search with filters, multiple search types, and detailed results
// Uses BaniDB API: /v2/search/{query}
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { useLanguage } from '@/components/common/LanguageProvider';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { GurmukhiKeyboard } from '@/components/common/GurmukhiKeyboard';
import { BookmarkButton } from '@/components/common/BookmarkSystem';
import { searchGurbani, type BaniDBVerse, type BaniDBSearchResponse } from '@/lib/api/banidb-client';
import { getRaagForAng } from '@/lib/constants/raag-ranges';
import type { Language } from '@/types';

type SearchType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const SEARCH_TYPES: { value: SearchType; label: { pa: string; en: string }; desc: string }[] = [
  { value: 0, label: { pa: 'ਪਹਿਲੇ ਅੱਖਰ (ਸ਼ੁਰੂ)', en: 'First Letter (Start)' }, desc: 'Search by first letter of each word from beginning' },
  { value: 1, label: { pa: 'ਪਹਿਲੇ ਅੱਖਰ (ਕਿਤੋਂ ਵੀ)', en: 'First Letter (Anywhere)' }, desc: 'Search by first letter anywhere in the verse' },
  { value: 2, label: { pa: 'ਪੂਰਾ ਸ਼ਬਦ (ਗੁਰਮੁਖੀ)', en: 'Full Word (Gurmukhi)' }, desc: 'Search full Gurmukhi words' },
  { value: 3, label: { pa: 'ਪੂਰਾ ਸ਼ਬਦ (ਅੰਗਰੇਜ਼ੀ)', en: 'Full Word (English)' }, desc: 'Search English translations' },
  { value: 4, label: { pa: 'ਰੋਮਾਨਾਈਜ਼ਡ', en: 'Romanized' }, desc: 'Search using romanized Gurmukhi' },
  { value: 5, label: { pa: 'ਅੰਗ ਨੰਬਰ', en: 'Ang Number' }, desc: 'Go to a specific page' },
];

export default function SearchPage() {
  const { language, isPunjabi } = useLanguage();
  const isHindi = language === 'hi';
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>(0);
  const [results, setResults] = useState<BaniDBSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async (page = 1) => {
    if (!query.trim()) return;

    // Handle Ang number search
    if (searchType === 5) {
      const ang = parseInt(query.trim(), 10);
      if (ang >= 1 && ang <= 1430) {
        window.location.href = `/gurbani?ang=${ang}`;
        return;
      }
    }

    setLoading(true);
    setSearched(true);
    setCurrentPage(page);

    try {
      const data = await searchGurbani(query.trim(), searchType, page);
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [query, searchType]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch(1);
  };

  const handleKeyboardInput = (char: string) => {
    setQuery(prev => prev + char);
    inputRef.current?.focus();
  };

  const getTranslation = (verse: BaniDBVerse) => {
    return verse.translation?.en?.bdb || verse.translation?.en?.ms || verse.translation?.en?.ssk || null;
  };

  // Popular searches
  const popularSearches = [
    { query: 'ੴ ਸਤਿ', label: 'Mool Mantar' },
    { query: 'ਜਪੁ', label: 'Japji Sahib' },
    { query: 'ਵਾਹਿਗੁਰੂ', label: 'Waheguru' },
    { query: 'ਦੇਹ ਸ਼ਿਵਾ', label: 'Deh Shiva' },
    { query: 'ਸੋ ਦਰੁ', label: 'So Dar' },
    { query: 'ਨਾਨਕ ਦੁਖੀਆ', label: 'Nanak Dukhiya' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#1a1a2e]">
      <MainNavigation />

      <main id="main-content" className="flex-1">
        {/* Hero Search Header */}
        <section className="py-10 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-neela-600/5 to-transparent dark:from-neela-900/20" />
          <div className="container-content relative z-10 max-w-4xl">
            <div className="text-center mb-8">
              <h1 className={cn(
                'text-3xl md:text-4xl lg:text-5xl font-bold text-neela-900 dark:text-blue-200',
                isPunjabi && 'font-gurmukhi',
                isHindi && 'font-devanagari'
              )}>
                {isPunjabi ? 'ਗੁਰਬਾਣੀ ਖੋਜ' : isHindi ? 'गुरबाणी खोज' : 'Gurbani Search'}
              </h1>
              <p className={cn(
                'text-neela-700 dark:text-blue-300 mt-3 text-lg',
                isPunjabi && 'font-gurmukhi',
                isHindi && 'font-devanagari'
              )}>
                {isPunjabi
                  ? 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ, ਦਸਮ ਗ੍ਰੰਥ, ਭਾਈ ਗੁਰਦਾਸ ਜੀ ਵਾਰਾਂ'
                  : 'Sri Guru Granth Sahib Ji, Dasam Granth, Bhai Gurdas Ji Vaaran'}
              </p>
            </div>

            {/* Search Box */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neela-200 dark:border-neela-700/50 p-4 md:p-6">
              {/* Search Type Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {SEARCH_TYPES.map((st) => (
                  <button
                    key={st.value}
                    onClick={() => setSearchType(st.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all min-h-[36px]',
                      searchType === st.value
                        ? 'bg-neela-600 text-white shadow-md'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    )}
                    title={st.desc}
                  >
                    {isPunjabi ? st.label.pa : isHindi ? ((st.label as any).hi || st.label.en) : st.label.en}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isPunjabi ? 'ਗੁਰਬਾਣੀ ਖੋਜੋ...' : isHindi ? 'गुरबाणी खोजें...' : 'Search Gurbani...'}
                    className={cn(
                      'w-full px-4 py-3 pr-10 rounded-xl border border-neutral-300 dark:border-neutral-600',
                      'bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white',
                      'focus:ring-2 focus:ring-neela-500 focus:border-neela-500 outline-none transition-all',
                      'text-lg placeholder:text-neutral-400',
                      (searchType <= 2) && 'font-gurmukhi'
                    )}
                    dir={searchType <= 2 ? 'auto' : 'ltr'}
                  />
                  {/* Keyboard toggle */}
                  <button
                    onClick={() => setShowKeyboard(!showKeyboard)}
                    className={cn(
                      'absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors',
                      showKeyboard ? 'text-neela-600 bg-neela-100 dark:bg-neela-900/30' : 'text-neutral-400 hover:text-neutral-600'
                    )}
                    title="Gurmukhi Keyboard"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => handleSearch(1)}
                  disabled={loading || !query.trim()}
                  className="px-6 py-3 rounded-xl bg-neela-600 hover:bg-neela-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white font-medium transition-all shadow-md hover:shadow-lg min-h-[48px]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Virtual Keyboard */}
              {showKeyboard && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <GurmukhiKeyboard
                    onKeyPress={handleKeyboardInput}
                    onBackspace={() => setQuery(prev => prev.slice(0, -1))}
                    onSpace={() => setQuery(prev => prev + ' ')}
                  />
                </div>
              )}
            </div>

            {/* Popular Searches */}
            {!searched && (
              <div className="mt-6 text-center">
                <p className={cn('text-sm text-neutral-500 mb-3', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                  {isPunjabi ? 'ਮਸ਼ਹੂਰ ਖੋਜ:' : isHindi ? 'लोकप्रिय खोज:' : 'Popular searches:'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {popularSearches.map((ps) => (
                    <button
                      key={ps.query}
                      onClick={async () => {
                        setQuery(ps.query);
                        setSearchType(2);
                        setLoading(true);
                        setSearched(true);
                        setCurrentPage(1);
                        try {
                          const data = await searchGurbani(ps.query, 2, 1);
                          setResults(data);
                        } catch {
                          setResults(null);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-4 py-2 rounded-full bg-neela-50 dark:bg-neela-900/20 text-neela-700 dark:text-neela-300 border border-neela-200 dark:border-neela-700/50 hover:bg-neela-100 dark:hover:bg-neela-900/40 transition-colors text-sm font-gurmukhi"
                    >
                      {ps.query} <span className="text-xs opacity-60 ml-1">({ps.label})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        {searched && (
          <section className="pb-16">
            <div className="container-content max-w-4xl">
              {/* Results Info */}
              {results && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <p className={cn('text-neutral-600 dark:text-neutral-400', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                    {isPunjabi
                      ? `${results.resultsInfo.totalResults} ਨਤੀਜੇ ਮਿਲੇ`
                      : `${results.resultsInfo.totalResults} results found`}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Page {results.resultsInfo.pages?.page || 1} / {results.resultsInfo.pages?.totalPages || 1}
                  </p>
                </div>
              )}

              {/* No Results */}
              {results && results.resultsInfo.totalResults === 0 && (
                <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className={cn('text-neutral-600 dark:text-neutral-400 text-lg', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                    {isPunjabi ? 'ਕੋਈ ਨਤੀਜੇ ਨਹੀਂ ਮਿਲੇ' : isHindi ? 'कोई परिणाम नहीं मिले' : 'No results found'}
                  </p>
                  <p className="text-neutral-500 mt-2 text-sm">
                    {isPunjabi ? 'ਵੱਖਰੇ ਸ਼ਬਦਾਂ ਨਾਲ ਖੋਜੋ' : isHindi ? 'अलग शब्दों से खोजें' : 'Try different keywords or search type'}
                  </p>
                </div>
              )}

              {/* Results List */}
              {results && results.verses && results.verses.length > 0 && (
                <div className="space-y-4">
                  {results.verses.map((verse) => {
                    const raag = getRaagForAng(verse.pageNo);
                    return (
                      <div
                        key={verse.verseId}
                        className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-md transition-all group"
                      >
                        {/* Verse Header */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Link
                            href={`/gurbani?ang=${verse.pageNo}`}
                            className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full hover:bg-amber-200 transition-colors"
                          >
                            ਅੰਗ {verse.pageNo}
                          </Link>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full">
                            {isPunjabi ? raag.pa : isHindi ? ((raag as any).hi || raag.en) : raag.en}
                          </span>
                          {verse.writer && (
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              ✍️ {verse.writer.unicode || verse.writer.english}
                            </span>
                          )}
                          <div className="ml-auto">
                            <BookmarkButton
                              type="verse"
                              shabadId={verse.shabadId}
                              angNumber={verse.pageNo}
                              title={`Ang ${verse.pageNo} - ${raag.en}`}
                              gurmukhi={verse.verse?.unicode || ''}
                              translation={getTranslation(verse) || undefined}
                              raag={raag.en}
                              writer={verse.writer?.english}
                              size="sm"
                            />
                          </div>
                        </div>

                        {/* Gurmukhi Verse */}
                        <Link href={`/shabad/${verse.shabadId}`} className="block">
                          <p className="font-gurmukhi text-lg sm:text-xl text-neutral-900 dark:text-neutral-100 leading-relaxed hover:text-neela-700 dark:hover:text-blue-300 transition-colors" style={{ lineHeight: '2' }}>
                            {verse.verse?.unicode || verse.verse?.gurmukhi}
                          </p>
                        </Link>

                        {/* Transliteration */}
                        {(verse.transliteration?.en || verse.transliteration?.english) && (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 italic mt-2">
                            {verse.transliteration?.en || verse.transliteration?.english}
                          </p>
                        )}

                        {/* Translation */}
                        {getTranslation(verse) && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2">
                            {getTranslation(verse)}
                          </p>
                        )}

                        {/* Action Links */}
                        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                          <Link
                            href={`/shabad/${verse.shabadId}`}
                            className="text-xs text-neela-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            📖 {isPunjabi ? 'ਪੂਰਾ ਸ਼ਬਦ' : isHindi ? 'पूरा शबद' : 'Full Shabad'}
                          </Link>
                          <Link
                            href={`/gurbani?ang=${verse.pageNo}`}
                            className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                          >
                            📄 {isPunjabi ? 'ਅੰਗ ਦੇਖੋ' : isHindi ? 'अंग देखें' : 'View Ang'}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {results && (results.resultsInfo.pages?.totalPages || 0) > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => handleSearch(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 disabled:opacity-50 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors min-h-[40px]"
                  >
                    ← {isPunjabi ? 'ਪਿਛਲਾ' : isHindi ? 'पिछला' : 'Previous'}
                  </button>
                  <span className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {currentPage} / {results.resultsInfo.pages?.totalPages || 1}
                  </span>
                  <button
                    onClick={() => handleSearch(currentPage + 1)}
                    disabled={currentPage >= (results.resultsInfo.pages?.totalPages || 1)}
                    className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 disabled:opacity-50 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors min-h-[40px]"
                  >
                    {isPunjabi ? 'ਅਗਲਾ' : isHindi ? 'अगला' : 'Next'} →
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}
