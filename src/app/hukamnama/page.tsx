'use client';

// ============================================================================
// DEDICATED HUKAMNAMA PAGE
// ============================================================================
// Full-page daily Hukamnama from Sri Harmandir Sahib with sharing & audio
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { useLanguage } from '@/components/common/LanguageProvider';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ReadingProgress } from '@/components/common/ReadingProgress';
import { BookmarkButton } from '@/components/common/BookmarkSystem';
import { FontSizeControls } from '@/components/common/FontSizeControls';
import { fetchHukamnama as fetchHukamnamaClient } from '@/lib/api/banidb-client';
import type { Language } from '@/types';

interface HukamnamaVerse {
  verseId: number;
  shabadId: number;
  verse: { gurmukhi: string; unicode: string };
  larivaar?: { gurmukhi: string; unicode: string };
  translation?: {
    en?: { bdb?: string; ms?: string; ssk?: string };
    pu?: { bdb?: { unicode?: string }; ss?: { unicode?: string } };
  };
  transliteration?: { english?: string; en?: string };
  pageNo: number;
  lineNo: number;
  writer?: { gurmukhi?: string; unicode?: string; english?: string };
  raag?: { gurmukhi?: string; unicode?: string; english?: string };
}

interface HukamnamaData {
  shabadInfo: {
    shabadId: number;
    pageNo: number;
    raag?: { unicode?: string; english?: string };
    writer?: { unicode?: string; english?: string };
  };
  verses: HukamnamaVerse[];
}

export default function HukamnamaPage() {
  const { language, isPunjabi } = useLanguage();
  const isHindi = language === 'hi';
  const [hukamnama, setHukamnama] = useState<HukamnamaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [showLarivaar, setShowLarivaar] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchHukamnama = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try the /today endpoint first for the page-specific format
      let data: Record<string, unknown> | null = null;
      try {
        const response = await fetch('https://api.banidb.com/v2/hukamnamas/today');
        if (response.ok) data = await response.json();
      } catch {
        // Network unavailable
      }

      if (data?.shabads && Array.isArray(data.shabads) && data.shabads[0]) {
        setHukamnama(data.shabads[0] as HukamnamaData);
        return;
      }

      // Fallback: use cached client (has IndexedDB + bundled JSON fallbacks)
      const clientData = await fetchHukamnamaClient();
      if (clientData?.verses?.length) {
        const firstVerse = clientData.verses[0] as HukamnamaVerse;
        setHukamnama({
          shabadInfo: {
            shabadId: clientData.hukamnamainfo?.shabadid || firstVerse.shabadId || 0,
            pageNo: clientData.hukamnamainfo?.pageno || firstVerse.pageNo || 0,
            raag: firstVerse.raag ? { unicode: firstVerse.raag.unicode, english: firstVerse.raag.english } : undefined,
            writer: firstVerse.writer ? { unicode: firstVerse.writer.unicode || undefined, english: firstVerse.writer.english } : undefined,
          },
          verses: clientData.verses as HukamnamaVerse[],
        });
        return;
      }

      throw new Error('No Hukamnama');
    } catch {
      setError('Could not load Hukamnama');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHukamnama(); }, [fetchHukamnama]);

  const getTranslation = (verse: HukamnamaVerse) => {
    return verse.translation?.en?.bdb || verse.translation?.en?.ms || verse.translation?.en?.ssk || null;
  };

  const handleShare = async () => {
    if (!hukamnama) return;
    const firstVerse = hukamnama.verses[0];
    const text = `${firstVerse?.verse?.unicode || ''}\n\n${getTranslation(firstVerse) || ''}\n\nAng ${hukamnama.shabadInfo.pageNo} • Sri Guru Granth Sahib Ji\nvia Sikhi Vidhya`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: "Today's Hukamnama", text });
      } catch { /* User cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fef9e7] via-[#fdf6e3] to-[#fef3c7] dark:from-[#1a1a1a] dark:via-[#1f1a14] dark:to-[#231a0f]">
      <MainNavigation />
      <ReadingProgress />

      <main id="main-content" className="flex-1">
        {/* Hero Header */}
        <section className="relative py-10 md:py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10 dark:opacity-5" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L60 30L30 60L0 30z\' fill=\'none\' stroke=\'%23daa520\' stroke-width=\'1\'/%3E%3C/svg%3E")'
          }} />
          <div className="container-content relative z-10 text-center">
            <div className="text-6xl md:text-7xl text-amber-700 dark:text-[#daa520] font-gurmukhi mb-3">ੴ</div>
            <h1 className={cn(
              'text-3xl md:text-4xl lg:text-5xl font-bold text-amber-900 dark:text-[#daa520]',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਅੱਜ ਦਾ ਹੁਕਮਨਾਮਾ' : isHindi ? 'आज का हुकमनामा' : "Today's Hukamnama"}
            </h1>
            <p className={cn(
              'text-amber-700 dark:text-amber-400 mt-3 text-lg',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਤੋਂ' : isHindi ? 'श्री हरिमंदर साहिब से' : 'From Sri Harmandir Sahib'}
            </p>
            <p className="text-amber-600 dark:text-amber-500 mt-1 text-sm">
              {new Date().toLocaleDateString(isPunjabi ? 'pa-IN' : isHindi ? 'hi-IN' : 'en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-16">
          <div className="container-content max-w-4xl">
            {loading && (
              <div className="text-center py-20">
                <div className="text-6xl animate-pulse text-amber-600 dark:text-[#daa520] font-gurmukhi">ੴ</div>
                <p className={cn('text-amber-700 dark:text-amber-400 mt-6 text-lg', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                  {isPunjabi ? 'ਹੁਕਮਨਾਮਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : isHindi ? 'हुकमनामा लोड हो रहा है...' : 'Loading Hukamnama...'}
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                <p className="text-red-700 dark:text-red-300 text-lg">{isPunjabi ? 'ਹੁਕਮਨਾਮਾ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ' : isHindi ? 'हुकमनामा लोड नहीं हो सका' : error}</p>
                <button onClick={fetchHukamnama} className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                  {isPunjabi ? 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ' : isHindi ? 'दोबारा कोशिश करें' : 'Try Again'}
                </button>
              </div>
            )}

            {hukamnama && !loading && (
              <div className="relative bg-white/90 dark:bg-[#1e1e1e]/95 backdrop-blur rounded-2xl border-2 border-amber-400 dark:border-[#daa520]/50 shadow-xl overflow-hidden">
                {/* Decorative corners */}
                <div className="absolute top-4 left-4 text-amber-300 dark:text-amber-700 text-3xl select-none">❋</div>
                <div className="absolute top-4 right-4 text-amber-300 dark:text-amber-700 text-3xl select-none">❋</div>

                {/* Metadata Bar */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 py-4 px-4 bg-amber-100/50 dark:bg-amber-900/20 border-b border-amber-200/50 dark:border-amber-800/30">
                  <span className="text-sm font-gurmukhi bg-white dark:bg-neutral-700 px-3 py-1.5 rounded-full text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                    ਅੰਗ {hukamnama.shabadInfo.pageNo}
                  </span>
                  {hukamnama.shabadInfo.raag && (
                    <span className="text-sm bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full text-blue-800 dark:text-blue-300">
                      {hukamnama.shabadInfo.raag.unicode || hukamnama.shabadInfo.raag.english}
                    </span>
                  )}
                  {hukamnama.shabadInfo.writer && (
                    <span className="text-sm bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full text-orange-800 dark:text-orange-300">
                      ✍️ {hukamnama.shabadInfo.writer.unicode || hukamnama.shabadInfo.writer.english}
                    </span>
                  )}
                  <BookmarkButton
                    type="shabad"
                    shabadId={hukamnama.shabadInfo.shabadId}
                    angNumber={hukamnama.shabadInfo.pageNo}
                    title={`Hukamnama - Ang ${hukamnama.shabadInfo.pageNo}`}
                    gurmukhi={hukamnama.verses[0]?.verse?.unicode || ''}
                    translation={getTranslation(hukamnama.verses[0]) || undefined}
                    raag={hukamnama.shabadInfo.raag?.unicode}
                    writer={hukamnama.shabadInfo.writer?.unicode}
                    size="sm"
                  />
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-center gap-3 py-4 px-4 border-b border-amber-100 dark:border-neutral-800">
                  <FontSizeControls />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className={cn('px-3 py-1.5 rounded-lg text-sm transition-colors min-h-[36px]',
                        showTranslation ? 'bg-neela-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      )}
                    >
                      {isPunjabi ? 'ਅਰਥ' : isHindi ? 'अर्थ' : 'Translation'}
                    </button>
                    <button
                      onClick={() => setShowTransliteration(!showTransliteration)}
                      className={cn('px-3 py-1.5 rounded-lg text-sm transition-colors min-h-[36px]',
                        showTransliteration ? 'bg-neela-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      )}
                    >
                      {isPunjabi ? 'ਉਚਾਰਨ' : isHindi ? 'उच्चारण' : 'Transliteration'}
                    </button>
                    <button
                      onClick={() => setShowLarivaar(!showLarivaar)}
                      className={cn('px-3 py-1.5 rounded-lg text-sm transition-colors min-h-[36px]',
                        showLarivaar ? 'bg-amber-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      )}
                    >
                      {isPunjabi ? 'ਲੜੀਵਾਰ' : isHindi ? 'लड़ीवार' : 'Larivaar'}
                    </button>
                  </div>
                  <button
                    onClick={handleShare}
                    className="px-3 py-1.5 rounded-lg text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors min-h-[36px]"
                  >
                    {copied ? '✓ Copied!' : (isPunjabi ? '📤 ਸ਼ੇਅਰ' : isHindi ? '📤 शेअर' : '📤 Share')}
                  </button>
                </div>

                {/* Verses */}
                <div className="p-6 md:p-10 space-y-8">
                  {hukamnama.verses.map((verse, index) => (
                    <div key={verse.verseId} className="text-center group">
                      {/* Line number */}
                      <div className="text-xs text-amber-500 dark:text-amber-600 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isPunjabi ? `ਪੰਕਤੀ ${index + 1}` : isHindi ? `पंक्ति ${index + 1}` : `Line ${index + 1}`}
                      </div>

                      {/* Gurmukhi */}
                      <p
                        className="font-gurmukhi text-xl sm:text-2xl md:text-3xl leading-loose text-neutral-900 dark:text-[#f0e6d2]"
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

                      {/* Translation */}
                      {showTranslation && getTranslation(verse) && (
                        <p className="text-base md:text-lg text-neutral-700 dark:text-neutral-300 mt-3 max-w-3xl mx-auto leading-relaxed">
                          {getTranslation(verse)}
                        </p>
                      )}

                      {index < hukamnama.verses.length - 1 && (
                        <div className="mt-6 flex justify-center">
                          <span className="text-amber-400 dark:text-[#daa520]">✦</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="text-center py-6 border-t border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-t from-amber-50/50 to-transparent dark:from-amber-900/10">
                  <p className="text-amber-700 dark:text-amber-400 font-gurmukhi">
                    ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ 🙏
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                    {isPunjabi
                      ? 'ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਤੋਂ ਅੱਜ ਦਾ ਹੁਕਮਨਾਮਾ • ਡਾਟਾ: BaniDB (Khalis Foundation)'
                      : isHindi ? 'श्री हरिमंदर साहिब से आज का हुकमनामा • डेटा: BaniDB (Khalis Foundation)'
                      : "Today's Hukamnama from Sri Harmandir Sahib • Data: BaniDB (Khalis Foundation)"}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {hukamnama.verses.length} {isPunjabi ? 'ਪੰਕਤੀਆਂ' : isHindi ? 'पंक्तियाँ' : 'lines'} • ਅੰਗ {hukamnama.shabadInfo.pageNo}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}
