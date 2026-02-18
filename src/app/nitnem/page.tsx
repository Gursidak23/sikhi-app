'use client';

// ============================================================================
// NITNEM BANIS PAGE
// ============================================================================
// Dedicated page for daily prayers
// Japji Sahib, Rehras Sahib, Kirtan Sohila, etc.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ReadingProgress } from '@/components/common/ReadingProgress';
import { BookmarkButton } from '@/components/common/BookmarkSystem';
import { FontSizeControls } from '@/components/common/FontSizeControls';
import { fetchBani } from '@/lib/api/banidb-client';
import { NITNEM_BANIS_CONFIG } from '@/lib/constants/raag-ranges';
import type { Language } from '@/types';

// Use the complete Nitnem Banis from shared constants
const NITNEM_BANIS = NITNEM_BANIS_CONFIG;

// BaniDB returns nested structure: { header, verse: { verseId, verse, translation, etc. } }
interface BaniVerseData {
  verseId: number;
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
    };
    pu?: {
      ss?: { unicode?: string };
    };
  };
  transliteration?: {
    english?: string;
    en?: string;
  };
}

interface BaniVerse {
  header: number;
  verse: BaniVerseData;
}

export default function NitnemPage() {
  const [language, setLanguage] = useState<Language>('pa');
  const [selectedBani, setSelectedBani] = useState<string | null>(null);
  const [baniContent, setBaniContent] = useState<BaniVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);

  const loadBani = useCallback(async (baniId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Uses resilient fetch + IndexedDB caching from banidb-client
      const data = await fetchBani(baniId);
      
      if (!data || !data.verses) {
        throw new Error('Failed to fetch Bani');
      }
      
      setBaniContent(data.verses as BaniVerse[]);
    } catch (err) {
      console.error('Error fetching bani:', err);
      setError(language === 'pa' 
        ? 'ਬਾਣੀ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ। ਕਿਰਪਾ ਕਰਕੇ ਇੰਟਰਨੈੱਟ ਚੈੱਕ ਕਰੋ।' 
        : 'Could not load Bani. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, [language]);

  const handleBaniSelect = (baniId: string, baniDBId: number) => {
    setSelectedBani(baniId);
    loadBani(baniDBId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedBani(null);
    setBaniContent([]);
  };

  const currentBani = NITNEM_BANIS.find(b => b.id === selectedBani);

  const getTranslation = (verseData: BaniVerseData): string | null => {
    if (verseData.translation?.en?.bdb) return verseData.translation.en.bdb;
    if (verseData.translation?.en?.ms) return verseData.translation.en.ms;
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fef9e7] via-[#fdf6e3] to-[#fef3c7] dark:from-[#1a1a1a] dark:via-[#1f1f1f] dark:to-[#262626]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L60 30L30 60L0 30z\' fill=\'none\' stroke=\'%23daa52015\' stroke-width=\'1\'/%3E%3C/svg%3E")' }}>
      <MainNavigation
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      <main id="main-content" className="flex-1">
        <div className="container-content py-6 px-4">
          {/* Back button when viewing a Bani */}
          {selectedBani && (
            <button
              onClick={handleBack}
              className="mb-4 flex items-center gap-2 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-gurmukhi">
                {language === 'pa' ? 'ਵਾਪਸ' : 'Back to Nitnem'}
              </span>
            </button>
          )}

          {!selectedBani ? (
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <div className="text-5xl mb-3">📿</div>
                <h1 className="text-3xl sm:text-4xl font-gurmukhi font-bold text-amber-900 dark:text-[#daa520]">
                  {language === 'pa' ? 'ਨਿਤਨੇਮ' : 'Nitnem'}
                </h1>
                <p className="text-amber-700 dark:text-amber-400 mt-2 font-gurmukhi text-lg">
                  {language === 'pa' ? 'ਰੋਜ਼ਾਨਾ ਬਾਣੀਆਂ' : 'Daily Prayers'}
                </p>
                <div className="mt-4 w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
              </div>

              {/* Time-based sections */}
              <div className="space-y-10">
                {/* Amritvela (Early Morning) */}
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">🌅</span>
                    <div>
                      <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300 font-gurmukhi">
                        {language === 'pa' ? 'ਅੰਮ੍ਰਿਤ ਵੇਲਾ (ਸਵੇਰ)' : 'Amritvela (Morning)'}
                      </h2>
                      <p className="text-sm text-amber-600 dark:text-amber-500">
                        {language === 'pa' ? '੫ ਬਾਣੀਆਂ' : '5 Banis'}
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-amber-300 to-transparent dark:from-amber-700" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {NITNEM_BANIS.filter(b => b.time === 'amritvela').map((bani) => (
                      <BaniCard
                        key={bani.id}
                        bani={bani}
                        language={language}
                        onClick={() => handleBaniSelect(bani.id, bani.baniId)}
                      />
                    ))}
                  </div>
                </section>

                {/* Evening */}
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">🌆</span>
                    <div>
                      <h2 className="text-lg font-semibold text-orange-800 dark:text-orange-300 font-gurmukhi">
                        {language === 'pa' ? 'ਸ਼ਾਮ' : 'Evening'}
                      </h2>
                      <p className="text-sm text-orange-600 dark:text-orange-500">
                        {language === 'pa' ? '੧ ਬਾਣੀ' : '1 Bani'}
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-orange-300 to-transparent dark:from-orange-700" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {NITNEM_BANIS.filter(b => b.time === 'evening').map((bani) => (
                      <BaniCard
                        key={bani.id}
                        bani={bani}
                        language={language}
                        onClick={() => handleBaniSelect(bani.id, bani.baniId)}
                      />
                    ))}
                  </div>
                </section>

                {/* Night */}
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">🌙</span>
                    <div>
                      <h2 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300 font-gurmukhi">
                        {language === 'pa' ? 'ਰਾਤ' : 'Night'}
                      </h2>
                      <p className="text-sm text-indigo-600 dark:text-indigo-500">
                        {language === 'pa' ? '੧ ਬਾਣੀ' : '1 Bani'}
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-indigo-300 to-transparent dark:from-indigo-700" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {NITNEM_BANIS.filter(b => b.time === 'night').map((bani) => (
                      <BaniCard
                        key={bani.id}
                        bani={bani}
                        language={language}
                        onClick={() => handleBaniSelect(bani.id, bani.baniId)}
                      />
                    ))}
                  </div>
                </section>

                {/* Anytime */}
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h2 className="text-lg font-semibold text-teal-800 dark:text-teal-300 font-gurmukhi">
                        {language === 'pa' ? 'ਹੋਰ ਬਾਣੀਆਂ' : 'Other Banis'}
                      </h2>
                      <p className="text-sm text-teal-600 dark:text-teal-500">
                        {language === 'pa' ? '੨ ਬਾਣੀਆਂ' : '2 Banis'}
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-teal-300 to-transparent dark:from-teal-700" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {NITNEM_BANIS.filter(b => b.time === 'anytime').map((bani) => (
                      <BaniCard
                        key={bani.id}
                        bani={bani}
                        language={language}
                        onClick={() => handleBaniSelect(bani.id, bani.baniId)}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <>
              {/* Bani Reader */}
              {currentBani && (
                <div className="max-w-4xl mx-auto">
                  {/* Bani Header */}
                  <div className="text-center mb-6 pb-6 border-b border-amber-200 dark:border-amber-800">
                    <span className="text-4xl">{currentBani.icon}</span>
                    <h1 className="text-2xl sm:text-3xl font-gurmukhi text-amber-900 dark:text-amber-200 mt-2">
                      {language === 'pa' ? currentBani.name.pa : currentBani.name.en}
                    </h1>
                    <p className="text-amber-700 dark:text-amber-400 mt-1">
                      {language === 'pa' ? currentBani.description.pa : currentBani.description.en}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-4 bg-amber-50 dark:bg-neutral-800 rounded-xl">
                    <FontSizeControls />
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowTranslation(!showTranslation)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm transition-colors',
                          showTranslation
                            ? 'bg-neela-600 text-white'
                            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                        )}
                      >
                        {language === 'pa' ? 'ਅਰਥ' : 'Translation'}
                      </button>
                      <button
                        onClick={() => setShowTransliteration(!showTransliteration)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm transition-colors',
                          showTransliteration
                            ? 'bg-neela-600 text-white'
                            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                        )}
                      >
                        {language === 'pa' ? 'ਉਚਾਰਨ' : 'Pronunciation'}
                      </button>
                    </div>
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="text-center py-12">
                      <div className="text-4xl animate-pulse">ੴ</div>
                      <p className="text-amber-700 dark:text-amber-400 mt-4 font-gurmukhi">
                        {language === 'pa' ? 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : 'Loading...'}
                      </p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && !loading && (
                    <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                      <button
                        onClick={() => loadBani(currentBani.baniId)}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        {language === 'pa' ? 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ' : 'Try Again'}
                      </button>
                    </div>
                  )}

                  {/* Bani Content */}
                  {!loading && !error && baniContent.length > 0 && (
                    <div className="saroop-page">
                      <div className="saroop-inner-frame">
                        <div className="saroop-header">
                          <div className="ik-onkar">ੴ</div>
                          <p className="raag-title font-gurmukhi">
                            {language === 'pa' ? currentBani.name.pa : currentBani.name.en}
                          </p>
                        </div>

                        <div className="saroop-content space-y-6">
                          {baniContent.map((item, index) => {
                            const verseData = item.verse;
                            return (
                            <div key={verseData.verseId} className="pankti-traditional">
                              {/* Section header */}
                              {item.header === 1 && index > 0 && (
                                <div className="my-6 text-center">
                                  <span className="text-amber-400 dark:text-amber-600">॥ ✦ ॥</span>
                                </div>
                              )}
                              
                              {/* Gurmukhi */}
                              <p 
                                className="gurbani-traditional text-center"
                                style={{ fontSize: 'var(--gurbani-font-size, 1.375rem)' }}
                                lang="pa"
                              >
                                {verseData.verse?.unicode || verseData.verse?.gurmukhi}
                              </p>
                              
                              {/* Transliteration */}
                              {showTransliteration && (verseData.transliteration?.en || verseData.transliteration?.english) && (
                                <p className="transliteration-traditional text-center text-sm text-neutral-500 dark:text-neutral-400 italic mt-1">
                                  {verseData.transliteration?.en || verseData.transliteration?.english}
                                </p>
                              )}
                              
                              {/* Translation */}
                              {showTranslation && getTranslation(verseData) && (
                                <p className="text-base text-neutral-600 dark:text-neutral-300 mt-2 max-w-3xl mx-auto text-center">
                                  {getTranslation(verseData)}
                                </p>
                              )}
                            </div>
                          );
                          })}
                        </div>

                        <div className="saroop-footer">
                          <p className="text-sm text-amber-800 dark:text-amber-400 font-gurmukhi">
                            {baniContent.length} ਪੰਕਤੀਆਂ
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-8 text-center">
                    <p className="text-lg text-amber-800 dark:text-amber-400 font-gurmukhi">
                      ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ 🙏
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                      Data: BaniDB (Khalis Foundation)
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ReadingProgress variant="kesri" />
      <ScrollToTop />
      <Footer language={language} />
    </div>
  );
}

// Color mapping for gradient classes (ensures Tailwind JIT picks them up)
const GRADIENT_MAP: Record<string, { from: string; to: string; shadow: string }> = {
  'from-amber-500 to-orange-600': { from: 'from-amber-500', to: 'to-orange-600', shadow: 'shadow-amber-500/25' },
  'from-blue-600 to-blue-800': { from: 'from-blue-600', to: 'to-blue-800', shadow: 'shadow-blue-600/25' },
  'from-amber-600 to-yellow-700': { from: 'from-amber-600', to: 'to-yellow-700', shadow: 'shadow-amber-600/25' },
  'from-purple-600 to-indigo-700': { from: 'from-purple-600', to: 'to-indigo-700', shadow: 'shadow-purple-600/25' },
  'from-yellow-500 to-orange-500': { from: 'from-yellow-500', to: 'to-orange-500', shadow: 'shadow-yellow-500/25' },
  'from-orange-600 to-red-600': { from: 'from-orange-600', to: 'to-red-600', shadow: 'shadow-orange-600/25' },
  'from-indigo-600 to-purple-700': { from: 'from-indigo-600', to: 'to-purple-700', shadow: 'shadow-indigo-600/25' },
  'from-teal-500 to-cyan-600': { from: 'from-teal-500', to: 'to-cyan-600', shadow: 'shadow-teal-500/25' },
  'from-emerald-500 to-green-600': { from: 'from-emerald-500', to: 'to-green-600', shadow: 'shadow-emerald-500/25' },
};

// Bani Card Component
function BaniCard({
  bani,
  language,
  onClick,
}: {
  bani: (typeof NITNEM_BANIS)[number];
  language: Language;
  onClick: () => void;
}) {
  const gradient = GRADIENT_MAP[bani.color] || { from: 'from-amber-500', to: 'to-orange-600', shadow: 'shadow-amber-500/25' };

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300',
        'bg-gradient-to-br',
        gradient.from,
        gradient.to,
        'text-white shadow-lg hover:shadow-2xl',
        gradient.shadow,
        'hover:scale-[1.03] active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-transparent'
      )}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0L40 20L20 40L0 20z\' fill=\'none\' stroke=\'white\' stroke-width=\'1\'/%3E%3C/svg%3E")' }} />
      
      {/* Background icon */}
      <div className="absolute -top-2 -right-2 text-5xl opacity-15 group-hover:opacity-25 transition-opacity duration-300 transform group-hover:rotate-12 group-hover:scale-110">
        {bani.icon}
      </div>
      
      <span className="text-3xl drop-shadow-sm">{bani.icon}</span>
      
      <h3 className="text-xl font-gurmukhi mt-3 font-semibold drop-shadow-sm">
        {language === 'pa' ? bani.name.pa : bani.name.en}
      </h3>
      
      <p className="text-sm text-white/85 mt-1.5 leading-relaxed">
        {language === 'pa' ? bani.description.pa : bani.description.en}
      </p>
      
      <div className="mt-4 flex items-center gap-1.5 text-sm text-white/75 group-hover:text-white transition-colors">
        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        <span className="font-medium">{language === 'pa' ? 'ਪੜ੍ਹੋ' : 'Read'}</span>
      </div>
    </button>
  );
}
