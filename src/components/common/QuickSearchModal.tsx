'use client';

// ============================================================================
// QUICK SEARCH MODAL COMPONENT
// ============================================================================
// Global search modal for searching Gurbani and History
// Triggered by Cmd/Ctrl + K keyboard shortcut
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

interface SearchResult {
  type: 'gurbani' | 'history' | 'bani';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon: string;
}

interface QuickSearchModalProps {
  language: Language;
}

export function QuickSearchModal({ language }: QuickSearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  // Quick navigation options
  const quickNav: SearchResult[] = [
    {
      type: 'bani',
      id: 'japji',
      title: isPunjabi ? 'ਜਪੁ ਜੀ ਸਾਹਿਬ' : isHindi ? 'जपु जी साहिब' : 'Japji Sahib',
      subtitle: isPunjabi ? 'ਸਵੇਰ ਦੀ ਬਾਣੀ' : isHindi ? 'सुबह की बाणी' : 'Morning Prayer',
      url: '/nitnem',
      icon: '🙏',
    },
    {
      type: 'gurbani',
      id: 'ang1',
      title: isPunjabi ? 'ਅੰਗ ੧' : isHindi ? 'अंग १' : 'Ang 1',
      subtitle: 'Mool Mantar',
      url: '/gurbani?ang=1',
      icon: '📖',
    },
    {
      type: 'gurbani',
      id: 'gurbani',
      title: isPunjabi ? 'ਗੁਰਬਾਣੀ' : isHindi ? 'गुरबाणी' : 'Gurbani',
      subtitle: isPunjabi ? 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ' : isHindi ? 'श्री गुरू ग्रंथ साहिब जी' : 'Sri Guru Granth Sahib Ji',
      url: '/gurbani',
      icon: '📖',
    },
    {
      type: 'bani',
      id: 'nitnem',
      title: isPunjabi ? 'ਨਿਤਨੇਮ' : isHindi ? 'नितनेम' : 'Nitnem',
      subtitle: isPunjabi ? 'ਰੋਜ਼ਾਨਾ ਬਾਣੀਆਂ' : isHindi ? 'रोज़ाना बाणियाँ' : 'Daily Prayers',
      url: '/nitnem',
      icon: '📿',
    },
    {
      type: 'history',
      id: 'itihaas',
      title: isPunjabi ? 'ਇਤਿਹਾਸ' : isHindi ? 'इतिहास' : 'History',
      subtitle: isPunjabi ? 'ਸਿੱਖ ਇਤਿਹਾਸ' : isHindi ? 'सिख इतिहास' : 'Sikh History',
      url: '/itihaas',
      icon: '📜',
    },
  ];

  // Handle keyboard shortcut to open/close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search logic
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // Filter quick nav by query
      const filtered = quickNav.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Check if query is a number (Ang search)
      const angNumber = parseInt(searchQuery);
      if (!isNaN(angNumber) && angNumber >= 1 && angNumber <= 1430) {
        filtered.unshift({
          type: 'gurbani',
          id: `ang-${angNumber}`,
          title: isPunjabi ? `ਅੰਗ ${angNumber}` : isHindi ? `अंग ${angNumber}` : `Ang ${angNumber}`,
          subtitle: 'Go to Ang',
          url: `/gurbani?ang=${angNumber}`,
          icon: '📖',
        });
      }

      // Search BaniDB if query is text
      if (searchQuery.length >= 2 && isNaN(angNumber)) {
        try {
          const response = await fetch(
            `https://api.banidb.com/v2/search/${encodeURIComponent(searchQuery)}?source=G&searchtype=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const baniResults: SearchResult[] = (data.verses || []).slice(0, 5).map((verse: any) => ({
              type: 'gurbani' as const,
              id: `verse-${verse.verseId}`,
              title: verse.verse?.unicode || verse.verse?.gurmukhi || '',
              subtitle: `${isPunjabi ? 'ਅੰਗ' : isHindi ? 'अंग' : 'Ang'} ${verse.pageNo}`,
              url: `/gurbani?ang=${verse.pageNo}`,
              icon: '📖',
            }));
            
            filtered.push(...baniResults);
          }
        } catch (error) {
          console.error('Search error:', error);
        }
      }

      setResults(filtered);
      setSelectedIndex(0);
    } finally {
      setIsSearching(false);
    }
  }, [language, quickNav]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, handleSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query ? results : quickNav;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
        e.preventDefault();
        const selected = items[selectedIndex];
        if (selected) {
          router.push(selected.url);
          setIsOpen(false);
        }
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
  };

  const displayResults = query ? results : quickNav;

  if (!isOpen) {
    return (
      <>
        {/* Mobile: Icon-only search button */}
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'md:hidden flex items-center justify-center p-2.5 min-w-[44px] min-h-[44px] rounded-lg',
            'text-neutral-500 dark:text-neutral-400',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'transition-colors'
          )}
          aria-label={isPunjabi ? 'ਖੋਜੋ' : isHindi ? 'खोजें' : 'Search'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Desktop: Full search button with label */}
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
            'bg-neutral-100 dark:bg-neutral-800',
            'text-neutral-500 dark:text-neutral-400',
            'hover:bg-neutral-200 dark:hover:bg-neutral-700',
            'border border-neutral-200 dark:border-neutral-700',
            'transition-colors'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>{isPunjabi ? 'ਖੋਜੋ' : isHindi ? 'खोजें' : 'Search'}</span>
          <kbd className="ml-2 text-xs bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </button>
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-700">
          <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isPunjabi ? 'ਗੁਰਬਾਣੀ ਜਾਂ ਅੰਗ ਨੰਬਰ ਖੋਜੋ...' : isHindi ? 'गुरबाणी या अंग नंबर खोजें...' : 'Search Gurbani or Ang number...'}
            className={cn(
              'flex-1 bg-transparent border-none outline-none',
              'text-neutral-900 dark:text-neutral-100',
              'placeholder-neutral-400 dark:placeholder-neutral-500',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}
          />
          {isSearching && (
            <div className="animate-spin w-5 h-5 border-2 border-neela-500 border-t-transparent rounded-full" />
          )}
          <kbd className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {displayResults.length === 0 && query && !isSearching && (
            <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
              {isPunjabi ? 'ਕੋਈ ਨਤੀਜੇ ਨਹੀਂ ਮਿਲੇ' : isHindi ? 'कोई नतीजे नहीं मिले' : 'No results found'}
            </div>
          )}

          {!query && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                {isPunjabi ? 'ਤੇਜ਼ ਨੈਵੀਗੇਸ਼ਨ' : isHindi ? 'तेज़ नेविगेशन' : 'Quick Navigation'}
              </p>
            </div>
          )}

          <div className="p-2">
            {displayResults.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                  selectedIndex === index
                    ? 'bg-neela-100 dark:bg-neela-900'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                <span className="text-xl">{result.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate',
                    result.type === 'gurbani' && 'font-gurmukhi'
                  )}>
                    {result.title}
                  </p>
                  {result.subtitle && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {result.subtitle}
                    </p>
                  )}
                </div>
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  result.type === 'gurbani' && 'bg-neela-100 dark:bg-neela-900 text-neela-700 dark:text-neela-300',
                  result.type === 'history' && 'bg-kesri-100 dark:bg-kesri-900 text-kesri-700 dark:text-kesri-300',
                  result.type === 'bani' && 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                )}>
                  {result.type === 'gurbani' && (isPunjabi ? 'ਗੁਰਬਾਣੀ' : isHindi ? 'गुरबाणी' : 'Gurbani')}
                  {result.type === 'history' && (isPunjabi ? 'ਇਤਿਹਾਸ' : isHindi ? 'इतिहास' : 'History')}
                  {result.type === 'bani' && (isPunjabi ? 'ਬਾਣੀ' : isHindi ? 'बाणी' : 'Bani')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          <div className="flex items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded">↑↓</kbd>
              {isPunjabi ? 'ਨੈਵੀਗੇਟ' : isHindi ? 'नेविगेत' : 'Navigate'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded">↵</kbd>
              {isPunjabi ? 'ਚੁਣੋ' : isHindi ? 'चुनें' : 'Select'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded">esc</kbd>
              {isPunjabi ? 'ਬੰਦ ਕਰੋ' : isHindi ? 'बंद करें' : 'Close'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to use search modal
export function useQuickSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
}
