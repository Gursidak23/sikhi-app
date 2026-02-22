'use client';

// ============================================================================
// SHABAD VIEWER PAGE
// ============================================================================
// Full Shabad display with line-by-line translations, transliteration,
// Teeka (Punjabi meanings), and sharing capabilities
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ReadingProgress } from '@/components/common/ReadingProgress';
import { BookmarkButton } from '@/components/common/BookmarkSystem';
import { FontSizeControls } from '@/components/common/FontSizeControls';
import { fetchShabad, type BaniDBVerse, type BaniDBShabadResponse } from '@/lib/api/banidb-client';
import { getRaagForAng } from '@/lib/constants/raag-ranges';
import type { Language } from '@/types';

export default function ShabadPage({ params }: { params: { id: string } }) {
  const shabadId = parseInt(params.id, 10);

  const [language, setLanguage] = useState<Language>('pa');
  const [shabad, setShabad] = useState<BaniDBShabadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [showTeeka, setShowTeeka] = useState(false);
  const [showLarivaar, setShowLarivaar] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  const isPunjabi = language === 'pa';

  const loadShabad = useCallback(async () => {
    if (isNaN(shabadId)) {
      setError('Invalid Shabad ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchShabad(shabadId);
      if (data && data.verses?.length > 0) {
        setShabad(data);
      } else {
        setError('Shabad not found');
      }
    } catch {
      setError('Could not load data');
    } finally {
      setLoading(false);
    }
  }, [shabadId]);

  useEffect(() => { loadShabad(); }, [loadShabad]);

  // Check URL hash for highlighted line
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#line-')) {
        const lineNum = parseInt(hash.replace('#line-', ''), 10);
        setHighlightedLine(lineNum);
        setTimeout(() => {
          document.getElementById(`line-${lineNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [shabad]);

  const getTranslation = (verse: BaniDBVerse) => {
    return verse.translation?.en?.bdb || verse.translation?.en?.ms || verse.translation?.en?.ssk || null;
  };

  const getPunjabiTeeka = (verse: BaniDBVerse): string | null => {
    const pu = verse.translation?.pu;
    if (!pu) return null;
    if (pu.bdb) {
      if (typeof pu.bdb === 'string') return pu.bdb;
      if (typeof pu.bdb === 'object' && pu.bdb?.unicode) return pu.bdb.unicode;
    }
    if (pu.ss) {
      if (typeof pu.ss === 'string') return pu.ss;
      if (typeof pu.ss === 'object' && pu.ss?.unicode) return pu.ss.unicode;
    }
    if (pu.ft) {
      if (typeof pu.ft === 'string') return pu.ft;
      if (typeof pu.ft === 'object' && pu.ft?.unicode) return pu.ft.unicode;
    }
    return null;
  };

  const handleShareLine = async (verse: BaniDBVerse, index: number) => {
    const text = `${verse.verse?.unicode || ''}\n\n${getTranslation(verse) || ''}\n\nAng ${verse.pageNo}, Line ${index + 1}\nvia Sikhi Vidhya`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Gurbani', text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  const raag = shabad?.shabadInfo ? getRaagForAng(shabad.shabadInfo.pageNo) : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fef9e7] via-white to-[#fef9e7] dark:from-[#1a1a1a] dark:via-[#1e1e1e] dark:to-[#1a1a1a]">
      <MainNavigation currentLanguage={language} onLanguageChange={setLanguage} />
      <ReadingProgress />

      <main id="main-content" className="flex-1">
        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-32">
            <div className="text-center">
              <div className="text-6xl animate-pulse text-amber-600 dark:text-[#daa520] font-gurmukhi">ੴ</div>
              <p className="text-amber-700 dark:text-amber-400 mt-4 font-gurmukhi text-lg">
                {isPunjabi ? 'ਸ਼ਬਦ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : 'Loading Shabad...'}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex-1 flex items-center justify-center py-32">
            <div className="text-center max-w-md">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-red-700 dark:text-red-300 text-lg">{isPunjabi ? 'ਡਾਟਾ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ' : error}</p>
              <div className="flex gap-3 justify-center mt-6">
                <button onClick={loadShabad} className="px-6 py-3 bg-neela-600 text-white rounded-xl hover:bg-neela-700 transition-colors">
                  {isPunjabi ? 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼' : 'Try Again'}
                </button>
                <Link href="/search" className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">
                  {isPunjabi ? 'ਖੋਜੋ' : 'Search'}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Shabad Content */}
        {shabad && !loading && (
          <>
            {/* Header */}
            <section className="py-8 md:py-12 border-b border-amber-200 dark:border-amber-800/30 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-900/10">
              <div className="container-content max-w-4xl text-center">
                <div className="text-4xl text-amber-700 dark:text-[#daa520] font-gurmukhi mb-3">ੴ</div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-4">
                  <Link
                    href={`/gurbani?ang=${shabad.shabadInfo.pageNo}`}
                    className="text-sm font-gurmukhi bg-amber-100 dark:bg-amber-900/30 px-4 py-1.5 rounded-full text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 hover:bg-amber-200 transition-colors"
                  >
                    ਅੰਗ {shabad.shabadInfo.pageNo}
                  </Link>
                  {raag && (
                    <span className="text-sm bg-blue-100 dark:bg-blue-900/30 px-4 py-1.5 rounded-full text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                      {isPunjabi ? raag.pa : raag.en}
                    </span>
                  )}
                  {shabad.shabadInfo.writer && (
                    <span className="text-sm bg-orange-100 dark:bg-orange-900/30 px-4 py-1.5 rounded-full text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700/50">
                      ✍️ {shabad.shabadInfo.writer.unicode || shabad.shabadInfo.writer.english}
                    </span>
                  )}
                  <BookmarkButton
                    type="shabad"
                    shabadId={shabad.shabadInfo.shabadId}
                    angNumber={shabad.shabadInfo.pageNo}
                    title={`Shabad ${shabadId} - Ang ${shabad.shabadInfo.pageNo}`}
                    gurmukhi={shabad.verses[0]?.verse?.unicode || ''}
                    translation={getTranslation(shabad.verses[0]) || undefined}
                    raag={raag?.en}
                    writer={shabad.shabadInfo.writer?.english}
                    size="sm"
                  />
                </div>

                <p className="text-sm text-neutral-500">
                  {shabad.count} {isPunjabi ? 'ਪੰਕਤੀਆਂ' : 'lines'} • Shabad #{shabadId}
                </p>
              </div>
            </section>

            {/* Controls Bar */}
            <div className="sticky top-[56px] md:top-[64px] z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-700">
              <div className="container-content max-w-4xl">
                <div className="flex flex-wrap items-center justify-center gap-2 py-3">
                  <FontSizeControls />
                  <div className="flex gap-1.5">
                    {[
                      { key: 'translation', active: showTranslation, toggle: () => setShowTranslation(!showTranslation), label: isPunjabi ? 'ਅਰਥ' : 'Translation' },
                      { key: 'transliteration', active: showTransliteration, toggle: () => setShowTransliteration(!showTransliteration), label: isPunjabi ? 'ਉਚਾਰਨ' : 'Pronunciation' },
                      { key: 'teeka', active: showTeeka, toggle: () => setShowTeeka(!showTeeka), label: isPunjabi ? 'ਟੀਕਾ' : 'Teeka' },
                      { key: 'larivaar', active: showLarivaar, toggle: () => setShowLarivaar(!showLarivaar), label: isPunjabi ? 'ਲੜੀਵਾਰ' : 'Larivaar' },
                    ].map((ctrl) => (
                      <button
                        key={ctrl.key}
                        onClick={ctrl.toggle}
                        className={cn(
                          'px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors min-h-[40px]',
                          ctrl.active
                            ? 'bg-neela-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        )}
                      >
                        {ctrl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Verses */}
            <section className="py-8 md:py-12">
              <div className="container-content max-w-4xl space-y-6 md:space-y-8">
                {shabad.verses.map((verse, index) => (
                  <div
                    key={verse.verseId}
                    id={`line-${index + 1}`}
                    className={cn(
                      'text-center p-4 md:p-6 rounded-xl transition-all group',
                      highlightedLine === index + 1
                        ? 'bg-amber-100/80 dark:bg-amber-900/30 ring-2 ring-amber-400 dark:ring-amber-600'
                        : 'hover:bg-amber-50/50 dark:hover:bg-neutral-800/50'
                    )}
                  >
                    {/* Line number + share */}
                    <div className="flex items-center justify-between mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-amber-500 dark:text-amber-600 font-gurmukhi">
                        ਪੰਕਤੀ {index + 1}
                      </span>
                      <button
                        onClick={() => handleShareLine(verse, index)}
                        className="text-xs text-neutral-400 hover:text-neela-600 dark:hover:text-blue-400 transition-colors p-2 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Share this line"
                      >
                        📤
                      </button>
                    </div>

                    {/* Gurmukhi */}
                    <p
                      className="font-gurmukhi text-xl sm:text-2xl md:text-3xl text-neutral-900 dark:text-[#f0e6d2]"
                      style={{ lineHeight: '2.2' }}
                      lang="pa"
                    >
                      {showLarivaar
                        ? (verse.larivaar?.unicode || verse.verse?.unicode || verse.verse?.gurmukhi)
                        : (verse.verse?.unicode || verse.verse?.gurmukhi)}
                    </p>

                    {/* Transliteration */}
                    {showTransliteration && (verse.transliteration?.en || verse.transliteration?.english) && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 italic mt-3">
                        {verse.transliteration?.en || verse.transliteration?.english}
                      </p>
                    )}

                    {/* English Translation */}
                    {showTranslation && getTranslation(verse) && (
                      <p className="text-base md:text-lg text-neutral-700 dark:text-neutral-300 mt-3 max-w-3xl mx-auto leading-relaxed">
                        {getTranslation(verse)}
                      </p>
                    )}

                    {/* Punjabi Teeka */}
                    {showTeeka && getPunjabiTeeka(verse) && (
                      <p className="font-gurmukhi text-base text-amber-800 dark:text-amber-300 mt-3 max-w-3xl mx-auto leading-relaxed bg-amber-50/50 dark:bg-amber-900/10 px-4 py-2 rounded-lg">
                        {getPunjabiTeeka(verse)}
                      </p>
                    )}

                    {/* Divider */}
                    {index < shabad.verses.length - 1 && (
                      <div className="mt-4 flex justify-center">
                        <span className="text-amber-300 dark:text-amber-700">✦</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Navigation */}
            <section className="pb-12">
              <div className="container-content max-w-4xl">
                <div className="flex flex-wrap items-center justify-center gap-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4">
                  {shabad.navigation?.previous && (
                    <Link
                      href={`/shabad/${shabad.navigation.previous}`}
                      className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-sm"
                    >
                      ← {isPunjabi ? 'ਪਿਛਲਾ ਸ਼ਬਦ' : 'Previous Shabad'}
                    </Link>
                  )}
                  <Link
                    href={`/gurbani?ang=${shabad.shabadInfo.pageNo}`}
                    className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-lg hover:bg-amber-200 transition-colors text-sm"
                  >
                    📄 ਅੰਗ {shabad.shabadInfo.pageNo}
                  </Link>
                  <Link
                    href="/search"
                    className="px-4 py-2 bg-neela-100 dark:bg-neela-900/30 text-neela-800 dark:text-neela-300 rounded-lg hover:bg-neela-200 transition-colors text-sm"
                  >
                    🔍 {isPunjabi ? 'ਖੋਜ' : 'Search'}
                  </Link>
                  {shabad.navigation?.next && (
                    <Link
                      href={`/shabad/${shabad.navigation.next}`}
                      className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-sm"
                    >
                      {isPunjabi ? 'ਅਗਲਾ ਸ਼ਬਦ' : 'Next Shabad'} →
                    </Link>
                  )}
                </div>
              </div>
            </section>

            {/* Footer Note */}
            <div className="text-center py-6 border-t border-amber-200/50 dark:border-amber-800/30 bg-amber-50/30 dark:bg-amber-900/5">
              <p className="text-sm text-amber-700 dark:text-amber-400 font-gurmukhi">
                ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ 🙏
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Data: BaniDB (Khalis Foundation)
              </p>
            </div>
          </>
        )}
      </main>

      <ScrollToTop />
      <Footer language={language} />
    </div>
  );
}
