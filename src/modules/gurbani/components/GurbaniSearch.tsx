'use client';

// ============================================================================
// GURBANI SEARCH COMPONENT
// ============================================================================
// Powerful search for finding Shabads in Sri Guru Granth Sahib Ji
// Supports: First Letter (traditional), Full Word, and Transliteration search
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

interface SearchResult {
  verseId: number;
  shabadId: number;
  verse: {
    gurmukhi: string;
    unicode: string;
  };
  translation?: {
    en?: {
      bdb?: string;
    };
  };
  transliteration?: {
    english?: string;
    en?: string;
  };
  pageNo: number;
  writer?: {
    writerId?: number;
    gurmukhi?: string;
    unicode?: string | null;
    english?: string;
  };
  raag?: {
    raagId?: number;
    gurmukhi?: string;
    unicode?: string | null;
    english?: string;
  };
}

interface GurbaniSearchProps {
  onResultSelect: (angNumber: number, shabadId?: number) => void;
  language?: Language;
  className?: string;
}

type SearchType = 'firstLetter' | 'fullWord' | 'transliteration';

const SEARCH_TYPES: { value: SearchType; labelPa: string; labelEn: string; apiType: number }[] = [
  { value: 'firstLetter', labelPa: 'ਪਹਿਲੇ ਅੱਖਰ', labelEn: 'First Letters', apiType: 0 },
  { value: 'fullWord', labelPa: 'ਪੂਰੇ ਸ਼ਬਦ', labelEn: 'Full Words', apiType: 2 },
  { value: 'transliteration', labelPa: 'ਅੰਗਰੇਜ਼ੀ', labelEn: 'English/Roman', apiType: 4 },
];

export function GurbaniSearch({
  onResultSelect,
  language = 'pa',
  className,
}: GurbaniSearchProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('firstLetter');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(async () => {
    if (query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchTypeConfig = SEARCH_TYPES.find(t => t.value === searchType);
      const apiType = searchTypeConfig?.apiType ?? 0;
      
      const response = await fetch(
        `https://api.banidb.com/v2/search/${encodeURIComponent(query)}?searchtype=${apiType}&source=G`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.verses || []);
      setIsOpen(true);
    } catch (err) {
      console.error('Search error:', err);
      setError(language === 'pa' ? 'ਖੋਜ ਵਿੱਚ ਗਲਤੀ' : 'Search error');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, searchType, language]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchType, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result.pageNo, result.shabadId);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="flex flex-col gap-2">
        {/* Search Type Selector */}
        <div className="flex gap-1 p-1 bg-amber-100/50 rounded-lg">
          {SEARCH_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSearchType(type.value)}
              className={cn(
                'flex-1 px-2 py-1.5 text-xs rounded-md transition-all',
                searchType === type.value
                  ? 'bg-white shadow-sm text-amber-900 font-medium'
                  : 'text-amber-700 hover:bg-amber-50'
              )}
            >
              {language === 'pa' ? type.labelPa : type.labelEn}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'pa'
                ? searchType === 'firstLetter'
                  ? 'ਪਹਿਲੇ ਅੱਖਰ ਲਿਖੋ (ਜਿਵੇਂ: ਜਕਰਨ)'
                  : searchType === 'fullWord'
                  ? 'ਸ਼ਬਦ ਖੋਜੋ...'
                  : 'Type in English...'
                : searchType === 'firstLetter'
                ? 'Type first letters (e.g., jkrn)'
                : searchType === 'fullWord'
                ? 'Search words...'
                : 'Type in English/Roman...'
            }
            className={cn(
              'w-full px-4 py-3 pr-10 rounded-lg border-2 transition-all',
              'focus:outline-none focus:ring-0',
              'border-amber-200 focus:border-amber-400',
              'bg-white text-gray-900 placeholder-gray-400',
              language === 'pa' && searchType !== 'transliteration' && 'font-gurmukhi'
            )}
          />
          
          {/* Search Icon / Loading */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <svg className="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Search Tip */}
        {searchType === 'firstLetter' && (
          <p className="text-xs text-amber-600">
            {language === 'pa'
              ? 'ਟਿਪ: ਹਰ ਸ਼ਬਦ ਦਾ ਪਹਿਲਾ ਅੱਖਰ ਲਿਖੋ'
              : 'Tip: Type the first letter of each word'}
          </p>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (results.length > 0 || error) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-amber-200 max-h-96 overflow-y-auto z-50">
          {error ? (
            <div className="p-4 text-center text-red-600">{error}</div>
          ) : (
            <>
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-sm text-amber-700">
                {results.length} {language === 'pa' ? 'ਨਤੀਜੇ' : 'results'}
              </div>
              
              <ul className="divide-y divide-amber-100">
                {results.slice(0, 20).map((result) => (
                  <li key={result.verseId}>
                    <button
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-4 hover:bg-amber-50 transition-colors"
                    >
                      {/* Gurmukhi Text */}
                      <p className="font-gurmukhi text-lg text-gray-900 leading-relaxed">
                        {result.verse?.unicode || result.verse?.gurmukhi}
                      </p>
                      
                      {/* Transliteration */}
                      {(result.transliteration?.en || result.transliteration?.english) && (
                        <p className="text-sm text-gray-500 italic mt-1">
                          {result.transliteration?.en || result.transliteration?.english}
                        </p>
                      )}
                      
                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                        <span className="font-gurmukhi bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          ਅੰਗ {result.pageNo}
                        </span>
                        {result.raag && (
                          <span className="bg-neela-100 text-neela-800 px-2 py-0.5 rounded">
                            {result.raag.unicode || result.raag.english || result.raag.gurmukhi}
                          </span>
                        )}
                        {result.writer && (
                          <span className="bg-kesri-100 text-kesri-800 px-2 py-0.5 rounded">
                            ✍️ {result.writer.english || result.writer.unicode || result.writer.gurmukhi}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              
              {results.length > 20 && (
                <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-sm text-amber-600 text-center">
                  {language === 'pa' 
                    ? `ਹੋਰ ${results.length - 20} ਨਤੀਜੇ...` 
                    : `${results.length - 20} more results...`}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && !error && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-amber-200 p-6 text-center z-50">
          <p className="text-gray-500 font-gurmukhi">
            {language === 'pa' ? 'ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ' : 'No results found'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {language === 'pa' ? 'ਵੱਖਰੇ ਸ਼ਬਦ ਅਜ਼ਮਾਓ' : 'Try different keywords'}
          </p>
        </div>
      )}
    </div>
  );
}

export default GurbaniSearch;
