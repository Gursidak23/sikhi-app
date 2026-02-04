'use client';

// ============================================================================
// HUKAMNAMA COMPONENT
// ============================================================================
// Displays daily random Shabad from Sri Guru Granth Sahib Ji
// Uses BaniDB API for fetching random verses
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { BookmarkButton } from './BookmarkSystem';
import type { Language } from '@/types';

interface HukamnamaVerse {
  verseId: number;
  shabadId: number;
  verse: {
    gurmukhi: string;
    unicode: string;
  };
  larivaar?: {
    gurmukhi: string;
    unicode: string;
  };
  translation?: {
    en?: {
      bdb?: string;
      ms?: string;
      ssk?: string;
    };
    pu?: {
      bdb?: { unicode?: string };
      ss?: { unicode?: string };
    };
  };
  transliteration?: {
    english?: string;
    en?: string;
  };
  pageNo: number;
  lineNo: number;
  writer?: {
    gurmukhi?: string;
    unicode?: string;
    english?: string;
  };
  raag?: {
    gurmukhi?: string;
    unicode?: string;
    english?: string;
  };
}

interface HukamnamaData {
  shabadInfo: {
    shabadId: number;
    pageNo: number;
    raag?: {
      unicode?: string;
      english?: string;
    };
    writer?: {
      unicode?: string;
      english?: string;
    };
  };
  verses: HukamnamaVerse[];
}

interface HukamnamaProps {
  language?: Language;
  className?: string;
  showFullShabad?: boolean;
}

export function Hukamnama({
  language = 'pa',
  className,
  showFullShabad = true,
}: HukamnamaProps) {
  const [hukamnama, setHukamnama] = useState<HukamnamaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchHukamnama = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get today's date to generate a consistent random Ang for the day
      const today = new Date();
      const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      
      // Use date to seed a pseudo-random Ang number (1-1430)
      const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomAng = (seed % 1430) + 1;
      
      // Fetch a random Shabad from that Ang
      const response = await fetch(`https://api.banidb.com/v2/angs/${randomAng}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Hukamnama');
      }
      
      const data = await response.json();
      
      if (data.page && data.page.length > 0) {
        // Get the first Shabad from this Ang
        const firstVerse = data.page[0];
        const shabadId = firstVerse.shabadId;
        
        // Fetch the full Shabad
        const shabadResponse = await fetch(`https://api.banidb.com/v2/shabads/${shabadId}`);
        
        if (!shabadResponse.ok) {
          throw new Error('Failed to fetch Shabad');
        }
        
        const shabadData = await shabadResponse.json();
        setHukamnama(shabadData);
      }
    } catch (err) {
      console.error('Hukamnama error:', err);
      setError(language === 'pa' 
        ? 'ਹੁਕਮਨਾਮਾ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ' 
        : 'Could not load Hukamnama');
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchHukamnama();
  }, [fetchHukamnama]);

  const getTranslation = (verse: HukamnamaVerse): string | null => {
    if (verse.translation?.en?.bdb) return verse.translation.en.bdb;
    if (verse.translation?.en?.ms) return verse.translation.en.ms;
    if (verse.translation?.en?.ssk) return verse.translation.en.ssk;
    return null;
  };

  const displayVerses = showFullShabad && expanded
    ? hukamnama?.verses || []
    : (hukamnama?.verses || []).slice(0, 3);

  if (loading) {
    return (
      <div className={cn('bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-6', className)}>
        <div className="text-center py-12">
          <div className="ik-onkar text-4xl animate-pulse text-amber-600 dark:text-amber-400">ੴ</div>
          <p className="text-amber-700 dark:text-amber-300 mt-4 font-gurmukhi">
            {language === 'pa' ? 'ਹੁਕਮਨਾਮਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : 'Loading Hukamnama...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('bg-red-50 dark:bg-red-900/20 rounded-2xl p-6', className)}>
        <div className="text-center py-8">
          <p className="text-red-700 dark:text-red-300 font-gurmukhi">{error}</p>
          <button
            onClick={fetchHukamnama}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {language === 'pa' ? 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  if (!hukamnama) return null;

  const firstVerse = hukamnama.verses[0];

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl',
      'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
      'dark:from-neutral-800 dark:via-neutral-850 dark:to-neutral-900',
      'border border-amber-200 dark:border-amber-800/30',
      className
    )}>
      {/* Decorative corners */}
      <div className="absolute top-3 left-3 text-amber-300 dark:text-amber-700 text-2xl">❋</div>
      <div className="absolute top-3 right-3 text-amber-300 dark:text-amber-700 text-2xl">❋</div>
      
      {/* Header */}
      <div className="text-center pt-6 pb-4 border-b border-amber-200/50 dark:border-amber-800/30">
        <div className="text-4xl text-amber-700 dark:text-amber-400 font-gurmukhi">ੴ</div>
        <h2 className="text-2xl font-gurmukhi text-amber-900 dark:text-amber-200 mt-2">
          {language === 'pa' ? 'ਅੱਜ ਦਾ ਹੁਕਮਨਾਮਾ' : "Today's Hukamnama"}
        </h2>
        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
          {new Date().toLocaleDateString(language === 'pa' ? 'pa-IN' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center justify-center gap-3 py-3 px-4 bg-amber-100/50 dark:bg-amber-900/20">
        <span className="text-sm font-gurmukhi bg-white dark:bg-neutral-700 px-3 py-1 rounded-full text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
          ਅੰਗ {hukamnama.shabadInfo.pageNo}
        </span>
        {hukamnama.shabadInfo.raag && (
          <span className="text-sm bg-neela-100 dark:bg-neela-900/30 px-3 py-1 rounded-full text-neela-800 dark:text-neela-300">
            {hukamnama.shabadInfo.raag.unicode || hukamnama.shabadInfo.raag.english}
          </span>
        )}
        {hukamnama.shabadInfo.writer && (
          <span className="text-sm bg-kesri-100 dark:bg-kesri-900/30 px-3 py-1 rounded-full text-kesri-800 dark:text-kesri-300">
            ✍️ {hukamnama.shabadInfo.writer.unicode || hukamnama.shabadInfo.writer.english}
          </span>
        )}
        
        {/* Bookmark button */}
        <BookmarkButton
          type="shabad"
          shabadId={hukamnama.shabadInfo.shabadId}
          angNumber={hukamnama.shabadInfo.pageNo}
          title={`Hukamnama - Ang ${hukamnama.shabadInfo.pageNo}`}
          gurmukhi={firstVerse?.verse?.unicode || ''}
          translation={getTranslation(firstVerse) || undefined}
          raag={hukamnama.shabadInfo.raag?.unicode || hukamnama.shabadInfo.raag?.english}
          writer={hukamnama.shabadInfo.writer?.unicode || hukamnama.shabadInfo.writer?.english}
          size="sm"
        />
      </div>

      {/* Verses */}
      <div className="p-6 space-y-6">
        {displayVerses.map((verse, index) => (
          <div key={verse.verseId} className="text-center">
            {/* Gurmukhi */}
            <p 
              className="font-gurmukhi text-xl sm:text-2xl md:text-3xl leading-relaxed text-neutral-900 dark:text-neutral-100"
              style={{ lineHeight: '2.5' }}
              lang="pa"
            >
              {verse.verse?.unicode || verse.verse?.gurmukhi}
            </p>
            
            {/* Transliteration */}
            {(verse.transliteration?.en || verse.transliteration?.english) && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 italic mt-2">
                {verse.transliteration?.en || verse.transliteration?.english}
              </p>
            )}
            
            {/* Translation */}
            {getTranslation(verse) && (
              <p className="text-base text-neutral-700 dark:text-neutral-300 mt-3 max-w-3xl mx-auto">
                {getTranslation(verse)}
              </p>
            )}
            
            {index < displayVerses.length - 1 && (
              <div className="mt-6 flex justify-center">
                <span className="text-amber-400 dark:text-amber-600">✦</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expand/Collapse button */}
      {showFullShabad && hukamnama.verses.length > 3 && (
        <div className="text-center pb-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-6 py-2 bg-amber-600 dark:bg-amber-700 text-white rounded-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors font-gurmukhi"
          >
            {expanded
              ? (language === 'pa' ? 'ਘੱਟ ਦਿਖਾਓ' : 'Show Less')
              : (language === 'pa' ? `ਪੂਰਾ ਸ਼ਬਦ (${hukamnama.verses.length} ਪੰਕਤੀਆਂ)` : `Full Shabad (${hukamnama.verses.length} lines)`)}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-4 border-t border-amber-200/50 dark:border-amber-800/30 bg-amber-100/30 dark:bg-amber-900/10">
        <p className="text-sm text-amber-700 dark:text-amber-400 font-gurmukhi">
          ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ 🙏
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
          Data: BaniDB (Khalis Foundation)
        </p>
      </div>
    </div>
  );
}

// Mini version for sidebar or homepage
export function HukamnamaMini({ language = 'pa' }: { language?: Language }) {
  const [verse, setVerse] = useState<HukamnamaVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageNo, setPageNo] = useState<number>(1);

  useEffect(() => {
    async function fetchRandomVerse() {
      try {
        const today = new Date();
        const seed = today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate();
        const randomAng = (seed % 1430) + 1;
        
        const response = await fetch(`https://api.banidb.com/v2/angs/${randomAng}`);
        const data = await response.json();
        
        if (data.page && data.page.length > 0) {
          setVerse(data.page[0]);
          setPageNo(randomAng);
        }
      } catch (error) {
        console.error('Error fetching verse:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRandomVerse();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-neutral-800 rounded-lg animate-pulse">
        <div className="h-6 bg-amber-200 dark:bg-neutral-700 rounded w-3/4 mx-auto" />
        <div className="h-4 bg-amber-200 dark:bg-neutral-700 rounded w-1/2 mx-auto mt-2" />
      </div>
    );
  }

  if (!verse) return null;

  return (
    <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-neutral-800 dark:to-neutral-850 rounded-xl border border-amber-200 dark:border-amber-800/30">
      <div className="text-center">
        <span className="text-2xl text-amber-600 dark:text-amber-400">ੴ</span>
        <p className="font-gurmukhi text-lg text-neutral-900 dark:text-neutral-100 mt-2 leading-relaxed">
          {verse.verse?.unicode || verse.verse?.gurmukhi}
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 font-gurmukhi">
          ਅੰਗ {pageNo}
        </p>
      </div>
    </div>
  );
}

// Beautiful homepage section with saroop styling
export function HukamnamaSection({ language = 'pa' }: { language?: Language }) {
  const [hukamnama, setHukamnama] = useState<HukamnamaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHukamnama() {
      try {
        const today = new Date();
        const seed = today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate();
        const randomAng = (seed % 1430) + 1;
        
        const response = await fetch(`https://api.banidb.com/v2/angs/${randomAng}`);
        const data = await response.json();
        
        if (data.page && data.page.length > 0) {
          const shabadId = data.page[0].shabadId;
          const shabadResponse = await fetch(`https://api.banidb.com/v2/shabads/${shabadId}`);
          const shabadData = await shabadResponse.json();
          setHukamnama(shabadData);
        }
      } catch (err) {
        console.error('Hukamnama error:', err);
        setError(language === 'pa' ? 'ਹੁਕਮਨਾਮਾ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ' : 'Could not load Hukamnama');
      } finally {
        setLoading(false);
      }
    }
    
    fetchHukamnama();
  }, [language]);

  const getTranslation = (verse: HukamnamaVerse): string | null => {
    if (verse.translation?.en?.bdb) return verse.translation.en.bdb;
    if (verse.translation?.en?.ms) return verse.translation.en.ms;
    if (verse.translation?.en?.ssk) return verse.translation.en.ssk;
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur rounded-2xl border-2 border-amber-300 dark:border-amber-700/50 p-8 md:p-12">
          <div className="text-center">
            <div className="text-5xl animate-pulse text-amber-600 dark:text-[#daa520] font-gurmukhi">ੴ</div>
            <p className="text-amber-700 dark:text-amber-400 mt-4 font-gurmukhi">
              {language === 'pa' ? 'ਹੁਕਮਨਾਮਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : 'Loading Hukamnama...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 text-center">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!hukamnama) return null;

  const displayVerses = hukamnama.verses.slice(0, 5);
  const firstVerse = hukamnama.verses[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Saroop-style container */}
      <div className="relative bg-white/90 dark:bg-[#1e1e1e]/95 backdrop-blur rounded-2xl border-2 border-amber-400 dark:border-[#daa520]/50 shadow-xl overflow-hidden">
        {/* Golden border glow */}
        <div className="absolute inset-0 rounded-2xl border border-amber-200/50 dark:border-[#daa520]/20 pointer-events-none" />
        
        {/* Header */}
        <div className="text-center pt-8 pb-6 border-b border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-900/10">
          <div className="text-5xl md:text-6xl text-amber-700 dark:text-[#daa520] font-gurmukhi mb-2">ੴ</div>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 px-4">
            <span className="text-sm font-gurmukhi bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
              ਅੰਗ {hukamnama.shabadInfo.pageNo}
            </span>
            {hukamnama.shabadInfo.raag && (
              <span className="text-sm bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                {hukamnama.shabadInfo.raag.unicode || hukamnama.shabadInfo.raag.english}
              </span>
            )}
            {hukamnama.shabadInfo.writer && (
              <span className="text-sm bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700/50">
                ✍️ {hukamnama.shabadInfo.writer.unicode || hukamnama.shabadInfo.writer.english}
              </span>
            )}
            
            <BookmarkButton
              type="shabad"
              shabadId={hukamnama.shabadInfo.shabadId}
              angNumber={hukamnama.shabadInfo.pageNo}
              title={`Hukamnama - Ang ${hukamnama.shabadInfo.pageNo}`}
              gurmukhi={firstVerse?.verse?.unicode || ''}
              translation={getTranslation(firstVerse) || undefined}
              raag={hukamnama.shabadInfo.raag?.unicode || hukamnama.shabadInfo.raag?.english}
              writer={hukamnama.shabadInfo.writer?.unicode || hukamnama.shabadInfo.writer?.english}
              size="sm"
            />
          </div>
        </div>

        {/* Verses */}
        <div className="p-6 md:p-10 space-y-6">
          {displayVerses.map((verse, index) => (
            <div key={verse.verseId} className="text-center">
              {/* Gurmukhi */}
              <p 
                className="font-gurmukhi text-xl sm:text-2xl md:text-3xl leading-loose text-neutral-900 dark:text-[#f0e6d2]"
                style={{ lineHeight: '2.2' }}
                lang="pa"
              >
                {verse.verse?.unicode || verse.verse?.gurmukhi}
              </p>
              
              {/* Transliteration */}
              {(verse.transliteration?.en || verse.transliteration?.english) && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 italic mt-2">
                  {verse.transliteration?.en || verse.transliteration?.english}
                </p>
              )}
              
              {/* Translation */}
              {getTranslation(verse) && (
                <p className="text-base md:text-lg text-neutral-700 dark:text-neutral-300 mt-3 max-w-3xl mx-auto leading-relaxed">
                  {getTranslation(verse)}
                </p>
              )}
              
              {index < displayVerses.length - 1 && (
                <div className="mt-6 flex justify-center">
                  <span className="text-amber-400 dark:text-[#daa520]">✦</span>
                </div>
              )}
            </div>
          ))}
          
          {hukamnama.verses.length > 5 && (
            <p className="text-center text-sm text-amber-600 dark:text-amber-500 mt-4">
              +{hukamnama.verses.length - 5} {language === 'pa' ? 'ਹੋਰ ਪੰਕਤੀਆਂ' : 'more lines'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-5 border-t border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-t from-amber-50/50 to-transparent dark:from-amber-900/10">
          <p className="text-sm text-amber-700 dark:text-amber-400 font-gurmukhi">
            ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ 🙏
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
            Data: BaniDB (Khalis Foundation)
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hukamnama;
