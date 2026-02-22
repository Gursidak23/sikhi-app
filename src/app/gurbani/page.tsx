'use client';

// ============================================================================
// GURBANI SECTION PAGE
// ============================================================================
// Sacred section for Guru Granth Sahib Ji study
// Fetches data from BaniDB API (Khalis Foundation)
// https://github.com/KhalisFoundation/banidb-api
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn, toGurmukhiNumeral, fromGurmukhiNumeral, hasGurmukhiNumerals } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { GurbaniDisclaimer } from '@/components/common/Disclaimer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ReadingProgress } from '@/components/common/ReadingProgress';
import { PageTurnWrapper } from '@/components/common/PageTurnWrapper';
import { AngNavigator, RaagNavigator, QuickJump, AngSearch } from '@/modules/gurbani/components/AngNavigator';
import { GurbaniSearch } from '@/modules/gurbani/components/GurbaniSearch';
import { AngBrowser, recordAngVisit } from '@/components/common/AngBrowser';
import type { Language } from '@/types';
import { fetchAng, prefetchAdjacentAngs, type BaniDBVerse, type BaniDBAngResponse } from '@/lib/api/banidb-client';
import { SGGS_RAAG_RANGES, getRaagForAng } from '@/lib/constants/raag-ranges';

// Use the complete Raag list from shared constants
const RAAGS = SGGS_RAAG_RANGES.map(r => ({
  id: r.id,
  name: r.name,
  angStart: r.angStart,
  angEnd: r.angEnd,
}));

// Get current Raag based on Ang number (uses shared constant)
function getCurrentRaag(angNumber: number): string {
  return getRaagForAng(angNumber).pa;
}

// Get English meaning with source attribution
function getTranslation(verse: BaniDBVerse): { text: string; source: string } | null {
  if (verse.translation?.en?.bdb) {
    return { text: verse.translation.en.bdb, source: 'BaniDB / Dr. Sant Singh Khalsa' };
  }
  if (verse.translation?.en?.ms) {
    return { text: verse.translation.en.ms, source: 'Bhai Manmohan Singh' };
  }
  if (verse.translation?.en?.ssk) {
    return { text: verse.translation.en.ssk, source: 'Dr. Sant Singh Khalsa' };
  }
  return null;
}

// Get Punjabi meaning - handles nested object structure from BaniDB API
function getPunjabiMeaning(verse: BaniDBVerse): { text: string; source: string } | null {
  // BaniDB returns Punjabi translations as objects with {gurmukhi, unicode} keys
  const puTranslation = verse.translation?.pu;
  if (!puTranslation) return null;

  // Check bdb first (has unicode property)
  if (puTranslation.bdb) {
    const bdb = puTranslation.bdb as unknown;
    if (typeof bdb === 'string') {
      return { text: bdb, source: 'BaniDB' };
    }
    if (typeof bdb === 'object' && bdb !== null && 'unicode' in bdb) {
      const text = (bdb as { unicode?: string }).unicode;
      if (text) return { text, source: 'BaniDB' };
    }
  }

  // Check Prof. Sahib Singh's teeka
  if (puTranslation.ss) {
    const ss = puTranslation.ss as unknown;
    if (typeof ss === 'string') {
      return { text: ss, source: 'Prof. Sahib Singh' };
    }
    if (typeof ss === 'object' && ss !== null && 'unicode' in ss) {
      const text = (ss as { unicode?: string }).unicode;
      if (text) return { text, source: 'Prof. Sahib Singh' };
    }
  }

  // Check Faridkot Teeka
  if (puTranslation.ft) {
    const ft = puTranslation.ft as unknown;
    if (typeof ft === 'string') {
      return { text: ft, source: 'Faridkot Teeka' };
    }
    if (typeof ft === 'object' && ft !== null && 'unicode' in ft) {
      const text = (ft as { unicode?: string }).unicode;
      if (text) return { text, source: 'Faridkot Teeka' };
    }
  }

  return null;
}

export default function GurbaniPage() {
  const [language, setLanguage] = useState<Language>('pa');
  const [hasAcknowledged, setHasAcknowledged] = useState(() => {
    // Persist disclaimer acknowledgement
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sikhi-gurbani-acknowledged') === 'true';
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [angData, setAngData] = useState<BaniDBAngResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedVerses, setExpandedVerses] = useState<Set<number>>(new Set());
  const [showMeanings, setShowMeanings] = useState(false);

  // Initialize Ang from URL or localStorage (reading position)
  const [currentAng, setCurrentAng] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlAng = urlParams.get('ang');
      if (urlAng) {
        const parsed = parseInt(urlAng, 10);
        if (parsed >= 1 && parsed <= 1430) return parsed;
      }
      // Fall back to saved reading position
      const saved = localStorage.getItem('sikhi-last-ang');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 1 && parsed <= 1430) return parsed;
      }
    }
    return 1;
  });

  // Sync Ang to URL and localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('ang', String(currentAng));
      window.history.replaceState({}, '', url.toString());
      localStorage.setItem('sikhi-last-ang', String(currentAng));
    }
  }, [currentAng]);

  // Handle browser back/forward for Ang navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlAng = urlParams.get('ang');
      if (urlAng) {
        const parsed = parseInt(urlAng, 10);
        if (parsed >= 1 && parsed <= 1430) {
          setCurrentAng(parsed);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAcknowledge = () => {
    setHasAcknowledged(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sikhi-gurbani-acknowledged', 'true');
    }
  };

  // Fetch data from BaniDB API when Ang changes
  const loadAngData = useCallback(async (ang: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchAng(ang);
      if (data && data.page && data.page.length > 0) {
        setAngData(data);
        // Record visit for reading history
        recordAngVisit(ang);
        // Prefetch adjacent Angs for instant navigation
        prefetchAdjacentAngs(ang);
      } else {
        setError('ਡਾਟਾ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।');
      }
    } catch (err) {
      console.error('Error fetching ang:', err);
      setError('ਇੰਟਰਨੈੱਟ ਕਨੈਕਸ਼ਨ ਚੈੱਕ ਕਰੋ ਜੀ।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAngData(currentAng);
  }, [currentAng, loadAngData]);

  const handleAngChange = (ang: number) => {
    if (ang >= 1 && ang <= 1430) {
      // Push to browser history for back/forward navigation
      const url = new URL(window.location.href);
      url.searchParams.set('ang', String(ang));
      window.history.pushState({}, '', url.toString());
      setCurrentAng(ang);
      setExpandedVerses(new Set());
    }
  };

  const toggleVerse = (verseId: number) => {
    setExpandedVerses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(verseId)) {
        newSet.delete(verseId);
      } else {
        newSet.add(verseId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (angData?.page) {
      setExpandedVerses(new Set(angData.page.map(v => v.verseId)));
    }
  };

  const collapseAll = () => {
    setExpandedVerses(new Set());
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef3c7 100%)' }}>
      <MainNavigation
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      {/* Maryada Disclaimer - Must be acknowledged */}
      {!hasAcknowledged && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl">
            <div className="text-center mb-6">
              <span className="text-4xl font-gurmukhi text-neela-700">ੴ</span>
              <h2 className="text-xl font-semibold text-neutral-900 mt-2 font-gurmukhi">
                ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ
              </h2>
            </div>
            
            <GurbaniDisclaimer
              language={language}
              requiresAcknowledgement={true}
              onAcknowledge={handleAcknowledge}
            />
          </div>
        </div>
      )}

      <main id="main-content" className="flex-1">
        <div className="container-content py-4 sm:py-6 px-2 sm:px-4">
          <div className="flex gap-4 lg:gap-6">
            {/* Sidebar - Raag Navigation & Search (Desktop only) */}
            {sidebarOpen && (
              <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
                <div className="sticky top-24 space-y-4">
                  {/* Search Component */}
                  <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
                    <h3 className="font-gurmukhi text-amber-900 font-medium mb-3">
                      {language === 'pa' ? '🔍 ਖੋਜੋ' : '🔍 Search'}
                    </h3>
                    <GurbaniSearch
                      onResultSelect={(angNumber) => handleAngChange(angNumber)}
                      language={language}
                    />
                  </div>

                  <RaagNavigator
                    raags={RAAGS}
                    onRaagSelect={(raagId, startAng) => handleAngChange(startAng)}
                    language={language}
                  />
                  
                  <QuickJump
                    onJump={(ang) => handleAngChange(ang)}
                    language={language}
                  />

                  {/* Enhanced Ang Browser */}
                  <AngBrowser
                    language={language}
                    currentAng={currentAng}
                    onNavigate={(ang) => handleAngChange(ang)}
                  />
                </div>
              </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Ang Navigator - Compact and centered */}
              <div className="flex flex-col items-center gap-3 mb-4 sm:mb-6">
                {/* Ang Search - Hidden on mobile (use FAB instead) */}
                <div className="hidden sm:block sm:max-w-xs">
                  <AngSearch
                    onAngSelect={handleAngChange}
                    language={language}
                  />
                </div>

                {/* Traditional Ang Navigator - Responsive */}
                <nav className="saroop-nav flex-wrap justify-center" aria-label="Ang navigation">
                  <button
                    onClick={() => handleAngChange(currentAng - 1)}
                    disabled={currentAng <= 1}
                    className="saroop-nav-btn min-h-[44px] min-w-[44px]"
                    aria-label="Previous Ang"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline font-gurmukhi">ਪਿਛਲਾ</span>
                  </button>

                  <div className="saroop-ang-display text-sm sm:text-base">
                    <span className="text-amber-800 font-gurmukhi">ਅੰਗ</span>
                    <input
                      type="text"
                      value={language === 'pa' ? toGurmukhiNumeral(currentAng) : currentAng}
                      onChange={(e) => {
                        const val = fromGurmukhiNumeral(e.target.value);
                        if (val !== null && val >= 1 && val <= 1430) {
                          handleAngChange(val);
                        }
                      }}
                      className={cn(
                        "saroop-ang-input w-16 sm:w-20",
                        hasGurmukhiNumerals(String(currentAng)) && "font-gurmukhi"
                      )}
                      aria-label="Ang number"
                    />
                    <span className="text-amber-700">/ {language === 'pa' ? '੧੪੩੦' : '1430'}</span>
                  </div>

                  <button
                    onClick={() => handleAngChange(currentAng + 1)}
                    disabled={currentAng >= 1430}
                    className="saroop-nav-btn min-h-[44px] min-w-[44px]"
                    aria-label="Next Ang"
                  >
                    <span className="hidden sm:inline font-gurmukhi">ਅਗਲਾ</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>

              {/* Source Attribution - Compact on mobile */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200/50 text-xs sm:text-sm">
                <p className={cn("text-amber-900", language === 'pa' && 'font-gurmukhi')}>
                  {language === 'pa'
                    ? 'ℹ️ ਅੰਗਰੇਜ਼ੀ ਅਰਥ ਟੀਕਾ-ਆਧਾਰਿਤ ਵਿਆਖਿਆ ਹੈ। ਮੂਲ ਗੁਰਮੁਖੀ ਪ੍ਰਮਾਣਿਕ ਹੈ।'
                    : 'ℹ️ English meanings are teeka-based interpretations. The original Gurmukhi is authoritative.'}
                </p>
                <p className="text-xs mt-1 text-amber-700">
                  ਡਾਟਾ ਸਰੋਤ: <a href="https://www.banidb.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">BaniDB</a> (Khalis Foundation)
                </p>
              </div>

              {/* Swipe hint for mobile */}
              <div className="lg:hidden text-center mb-3 text-xs text-amber-700">
                <span className="font-gurmukhi">← ਸਵਾਈਪ ਕਰੋ →</span>
                <span className="mx-2">|</span>
                <span>Swipe or use arrows</span>
              </div>

              {/* Page Turn Wrapper for swipe gestures */}
              <PageTurnWrapper
                onNextPage={() => handleAngChange(currentAng + 1)}
                onPrevPage={() => handleAngChange(currentAng - 1)}
                canGoNext={currentAng < 1430}
                canGoPrev={currentAng > 1}
                currentPage={currentAng}
              >

              {/* Loading State */}
              {loading && (
                <div className="saroop-page">
                  <div className="saroop-inner-frame flex items-center justify-center py-20">
                    <div className="text-center">
                      <span className="ik-onkar animate-pulse">ੴ</span>
                      <p className="text-amber-800 mt-4 font-gurmukhi text-lg">ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-700 font-gurmukhi">{error}</p>
                  <button
                    onClick={() => loadAngData(currentAng)}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ
                  </button>
                </div>
              )}

              {/* Gurbani Display - Traditional Saroop Style */}
              {!loading && !error && angData && angData.page && (
                <div className="saroop-page">
                  <div className="saroop-inner-frame">
                    {/* Traditional Header */}
                    <div className="saroop-header">
                      <div className="ik-onkar">ੴ</div>
                      <p className="raag-title">{getCurrentRaag(currentAng)}</p>
                      <div className="mt-3">
                        <span className="ang-number">
                          ਅੰਗ {language === 'pa' ? toGurmukhiNumeral(currentAng) : currentAng}
                        </span>
                      </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex justify-center gap-3 py-3 border-b border-amber-200/50">
                      <button
                        onClick={expandAll}
                        className="arth-toggle"
                      >
                        <span>◉</span>
                        <span className={language === 'pa' ? 'font-gurmukhi' : ''}>
                          {language === 'pa' ? 'ਸਾਰੇ ਅਰਥ' : 'All Meanings'}
                        </span>
                      </button>
                      <button
                        onClick={collapseAll}
                        className="arth-toggle"
                      >
                        <span>○</span>
                        <span className={language === 'pa' ? 'font-gurmukhi' : ''}>
                          {language === 'pa' ? 'ਛੁਪਾਓ' : 'Hide'}
                        </span>
                      </button>
                    </div>

                    {/* Sacred Content - Panktis */}
                    <div className="saroop-content">
                      {angData.page.map((verse) => {
                        const isExpanded = expandedVerses.has(verse.verseId);
                        const translation = getTranslation(verse);
                        const punjabiMeaning = getPunjabiMeaning(verse);

                        return (
                          <div key={verse.verseId} className="pankti-traditional">
                            {/* Main Gurbani Line */}
                            <button
                              onClick={() => toggleVerse(verse.verseId)}
                              className="w-full group"
                            >
                              <p className="gurbani-traditional" lang="pa">
                                {verse.verse?.unicode || verse.verse?.gurmukhi || ''}
                              </p>
                              
                              {/* Transliteration */}
                              {(verse.transliteration?.en || verse.transliteration?.english) && (
                                <p className="transliteration-traditional">
                                  {verse.transliteration?.en || verse.transliteration?.english}
                                </p>
                              )}

                              {/* Expand indicator */}
                              {(translation || punjabiMeaning) && (
                                <p className="arth-toggle justify-center mt-2">
                                  <span>{isExpanded ? '▼' : '▶'}</span>
                                  <span className={language === 'pa' ? 'font-gurmukhi' : ''}>
                                    {language === 'pa' ? 'ਅਰਥ' : 'Meaning'}
                                  </span>
                                </p>
                              )}
                            </button>

                            {/* Expanded Meanings */}
                            {isExpanded && (translation || punjabiMeaning) && (
                              <div className="arth-section">
                                {/* Punjabi Meaning */}
                                {punjabiMeaning && (
                                  <div className="mb-3">
                                    <p className="arth-label font-gurmukhi">
                                      ਅਰਥ ({punjabiMeaning.source})
                                    </p>
                                    <p className="arth-text-punjabi">
                                      {punjabiMeaning.text}
                                    </p>
                                  </div>
                                )}

                                {/* English Meaning */}
                                {translation && (
                                  <div>
                                    <p className="arth-label">
                                      English ({translation.source})
                                    </p>
                                    <p className="arth-text-english">
                                      {translation.text}
                                    </p>
                                  </div>
                                )}

                                {/* Writer Info */}
                                {verse.writer && (
                                  <p className="writer-attribution font-gurmukhi">
                                    ✍️ {verse.writer.unicode || verse.writer.english || ''}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="saroop-footer">
                      <p className="text-sm text-amber-800 font-gurmukhi">
                        {angData.count} ਪੰਕਤੀਆਂ
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        ਡਾਟਾ ਸਰੋਤ: BaniDB (Khalis Foundation)
                      </p>
                    </div>
                  </div>
                </div>
              )}
              </PageTurnWrapper>

              {/* Page Footer Note - Traditional Style */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-amber-200 text-center">
                <p className="text-base sm:text-lg text-amber-800 font-gurmukhi">
                  ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ
                </p>
                <p className="text-xs sm:text-sm text-amber-700 mt-1">
                  Please forgive any errors or omissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation FAB - positioned lower right */}
      <button
        onClick={() => setMobileNavOpen(true)}
        className="lg:hidden fixed bottom-6 right-4 z-40 w-12 h-12 rounded-full bg-amber-600 text-white shadow-lg flex items-center justify-center hover:bg-amber-700 active:scale-95 transition-all"
        aria-label={language === 'pa' ? 'ਖੋਜੋ ਅਤੇ ਨੈਵੀਗੇਟ ਕਰੋ' : 'Search and Navigate'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Mobile Navigation Panel */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileNavOpen(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
            {/* Handle */}
            <div className="sticky top-0 bg-white pt-3 pb-2 px-4 border-b border-amber-100">
              <div className="w-12 h-1 bg-amber-300 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h3 className={cn("font-semibold text-lg", language === 'pa' && 'font-gurmukhi')}>
                  {language === 'pa' ? 'ਖੋਜੋ ਅਤੇ ਨੈਵੀਗੇਟ ਕਰੋ' : 'Search & Navigate'}
                </h3>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Search */}
              <div>
                <h4 className={cn("font-medium text-amber-900 mb-3", language === 'pa' && 'font-gurmukhi')}>
                  {language === 'pa' ? '🔍 ਗੁਰਬਾਣੀ ਖੋਜੋ' : '🔍 Search Gurbani'}
                </h4>
                <GurbaniSearch
                  onResultSelect={(angNumber) => {
                    handleAngChange(angNumber);
                    setMobileNavOpen(false);
                  }}
                  language={language}
                />
              </div>
              
              {/* Quick Jump */}
              <div>
                <h4 className={cn("font-medium text-amber-900 mb-3", language === 'pa' && 'font-gurmukhi')}>
                  {language === 'pa' ? '⚡ ਝੱਟ ਜਾਓ' : '⚡ Quick Jump'}
                </h4>
                <QuickJump
                  onJump={(ang) => {
                    handleAngChange(ang);
                    setMobileNavOpen(false);
                  }}
                  language={language}
                />
              </div>
              
              {/* Raag List */}
              <div>
                <h4 className={cn("font-medium text-amber-900 mb-3", language === 'pa' && 'font-gurmukhi')}>
                  {language === 'pa' ? '🎵 ਰਾਗ ਸੂਚੀ' : '🎵 Raag List'}
                </h4>
                <RaagNavigator
                  raags={RAAGS}
                  onRaagSelect={(raagId, startAng) => {
                    handleAngChange(startAng);
                    setMobileNavOpen(false);
                  }}
                  language={language}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <ReadingProgress variant="neela" />
      <ScrollToTop />
      <Footer language={language} />
    </div>
  );
}
