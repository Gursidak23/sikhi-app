'use client';

// ============================================================================
// GURBANI SECTION PAGE
// ============================================================================
// Sacred section for Guru Granth Sahib Ji study
// Fetches data from BaniDB API (Khalis Foundation)
// https://github.com/KhalisFoundation/banidb-api
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { cn, toGurmukhiNumeral, fromGurmukhiNumeral, hasGurmukhiNumerals } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { GurbaniDisclaimer } from '@/components/common/Disclaimer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ReadingProgress } from '@/components/common/ReadingProgress';
import { AngNavigator, RaagNavigator, QuickJump, AngSearch } from '@/modules/gurbani/components/AngNavigator';
import { GurbaniSearch } from '@/modules/gurbani/components/GurbaniSearch';
import type { Language } from '@/types';
import { fetchAng, prefetchAdjacentAngs, type BaniDBVerse, type BaniDBAngResponse } from '@/lib/api/banidb-client';

// Raag data for sidebar navigation
const RAAGS = [
  { id: 'jap', name: { pa: 'ਜਪੁ ਜੀ ਸਾਹਿਬ', en: 'Japji Sahib' }, angStart: 1, angEnd: 8 },
  { id: 'sri-raag', name: { pa: 'ਸ੍ਰੀ ਰਾਗੁ', en: 'Sri Raag' }, angStart: 14, angEnd: 93 },
  { id: 'raag-maajh', name: { pa: 'ਰਾਗੁ ਮਾਝ', en: 'Raag Maajh' }, angStart: 94, angEnd: 150 },
  { id: 'raag-gauri', name: { pa: 'ਰਾਗੁ ਗਉੜੀ', en: 'Raag Gauri' }, angStart: 151, angEnd: 346 },
  { id: 'raag-aasaa', name: { pa: 'ਰਾਗੁ ਆਸਾ', en: 'Raag Aasaa' }, angStart: 347, angEnd: 488 },
  { id: 'raag-gujri', name: { pa: 'ਰਾਗੁ ਗੂਜਰੀ', en: 'Raag Gujri' }, angStart: 489, angEnd: 526 },
  { id: 'raag-devgandhari', name: { pa: 'ਰਾਗੁ ਦੇਵਗੰਧਾਰੀ', en: 'Raag Devgandhari' }, angStart: 527, angEnd: 536 },
  { id: 'raag-bihagra', name: { pa: 'ਰਾਗੁ ਬਿਹਾਗੜਾ', en: 'Raag Bihagra' }, angStart: 537, angEnd: 556 },
  { id: 'raag-vadhans', name: { pa: 'ਰਾਗੁ ਵਡਹੰਸੁ', en: 'Raag Vadhans' }, angStart: 557, angEnd: 594 },
  { id: 'raag-sorath', name: { pa: 'ਰਾਗੁ ਸੋਰਠਿ', en: 'Raag Sorath' }, angStart: 595, angEnd: 659 },
];

// Get current Raag based on Ang number
function getCurrentRaag(angNumber: number): string {
  const raagRanges = [
    { name: 'ਜਪੁ ਜੀ ਸਾਹਿਬ', start: 1, end: 8 },
    { name: 'ਸੋ ਦਰੁ - ਸੋ ਪੁਰਖੁ', start: 8, end: 12 },
    { name: 'ਸੋਹਿਲਾ', start: 12, end: 13 },
    { name: 'ਸ੍ਰੀ ਰਾਗੁ', start: 14, end: 93 },
    { name: 'ਰਾਗੁ ਮਾਝ', start: 94, end: 150 },
    { name: 'ਰਾਗੁ ਗਉੜੀ', start: 151, end: 346 },
    { name: 'ਰਾਗੁ ਆਸਾ', start: 347, end: 488 },
    { name: 'ਰਾਗੁ ਗੂਜਰੀ', start: 489, end: 526 },
    { name: 'ਰਾਗੁ ਦੇਵਗੰਧਾਰੀ', start: 527, end: 536 },
    { name: 'ਰਾਗੁ ਬਿਹਾਗੜਾ', start: 537, end: 556 },
    { name: 'ਰਾਗੁ ਵਡਹੰਸੁ', start: 557, end: 594 },
    { name: 'ਰਾਗੁ ਸੋਰਠਿ', start: 595, end: 659 },
    { name: 'ਰਾਗੁ ਧਨਾਸਰੀ', start: 660, end: 695 },
    { name: 'ਰਾਗੁ ਜੈਤਸਰੀ', start: 696, end: 710 },
    { name: 'ਰਾਗੁ ਟੋਡੀ', start: 711, end: 718 },
    { name: 'ਰਾਗੁ ਬੈਰਾੜੀ', start: 719, end: 720 },
    { name: 'ਰਾਗੁ ਤਿਲੰਗ', start: 721, end: 727 },
    { name: 'ਰਾਗੁ ਸੂਹੀ', start: 728, end: 794 },
    { name: 'ਰਾਗੁ ਬਿਲਾਵਲੁ', start: 795, end: 858 },
    { name: 'ਰਾਗੁ ਗੋਂਡ', start: 859, end: 875 },
    { name: 'ਰਾਗੁ ਰਾਮਕਲੀ', start: 876, end: 974 },
    { name: 'ਰਾਗੁ ਨਟ ਨਾਰਾਇਣ', start: 975, end: 983 },
    { name: 'ਰਾਗੁ ਮਾਲੀ ਗਉੜਾ', start: 984, end: 988 },
    { name: 'ਰਾਗੁ ਮਾਰੂ', start: 989, end: 1106 },
    { name: 'ਰਾਗੁ ਤੁਖਾਰੀ', start: 1107, end: 1117 },
    { name: 'ਰਾਗੁ ਕੇਦਾਰਾ', start: 1118, end: 1124 },
    { name: 'ਰਾਗੁ ਭੈਰਉ', start: 1125, end: 1167 },
    { name: 'ਰਾਗੁ ਬਸੰਤੁ', start: 1168, end: 1196 },
    { name: 'ਰਾਗੁ ਸਾਰੰਗ', start: 1197, end: 1253 },
    { name: 'ਰਾਗੁ ਮਲਾਰ', start: 1254, end: 1293 },
    { name: 'ਰਾਗੁ ਕਾਨੜਾ', start: 1294, end: 1318 },
    { name: 'ਰਾਗੁ ਕਲਿਆਣ', start: 1319, end: 1326 },
    { name: 'ਰਾਗੁ ਪ੍ਰਭਾਤੀ', start: 1327, end: 1351 },
    { name: 'ਰਾਗੁ ਜੈਜਾਵੰਤੀ', start: 1352, end: 1353 },
    { name: 'ਸਲੋਕ ਸਹਸਕ੍ਰਿਤੀ', start: 1353, end: 1360 },
    { name: 'ਗਾਥਾ ਮਹਲਾ ੫', start: 1360, end: 1361 },
    { name: 'ਫੁਨਹੇ ਮਹਲਾ ੫', start: 1361, end: 1363 },
    { name: 'ਚਉਬੋਲੇ ਮਹਲਾ ੫', start: 1363, end: 1364 },
    { name: 'ਸਲੋਕ ਕਬੀਰ ਜੀ', start: 1364, end: 1377 },
    { name: 'ਸਲੋਕ ਫਰੀਦ ਜੀ', start: 1377, end: 1384 },
    { name: 'ਸਵਈਏ', start: 1385, end: 1409 },
    { name: 'ਸਲੋਕ ਵਾਰਾ ਤੇ ਵਧੀਕ', start: 1410, end: 1426 },
    { name: 'ਸਲੋਕ ਮਹਲਾ ੯', start: 1426, end: 1429 },
    { name: 'ਮੁੰਦਾਵਣੀ / ਰਾਗਮਾਲਾ', start: 1429, end: 1430 },
  ];
  const raag = raagRanges.find(r => angNumber >= r.start && angNumber <= r.end);
  return raag?.name || 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ';
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
  const [currentAng, setCurrentAng] = useState(1);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [angData, setAngData] = useState<BaniDBAngResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedVerses, setExpandedVerses] = useState<Set<number>>(new Set());
  const [showMeanings, setShowMeanings] = useState(false);

  // Fetch data from BaniDB API when Ang changes
  const loadAngData = useCallback(async (ang: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchAng(ang);
      if (data && data.page && data.page.length > 0) {
        setAngData(data);
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
              onAcknowledge={() => setHasAcknowledged(true)}
            />
          </div>
        </div>
      )}

      <main id="main-content" className="flex-1">
        <div className="container-content py-6">
          <div className="flex gap-6">
            {/* Sidebar - Raag Navigation & Search */}
            {sidebarOpen && (
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
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
                </div>
              </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Traditional Ang Navigator with Search */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                {/* Ang Search - Jump directly to any Ang */}
                <AngSearch
                  onAngSelect={handleAngChange}
                  language={language}
                />

                {/* Traditional Ang Navigator */}
                <nav className="saroop-nav flex-1" aria-label="Ang navigation">
                  <button
                    onClick={() => handleAngChange(currentAng - 1)}
                    disabled={currentAng <= 1}
                    className="saroop-nav-btn"
                    aria-label="Previous Ang"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline font-gurmukhi">ਪਿਛਲਾ</span>
                  </button>

                  <div className="saroop-ang-display">
                    <span className="text-amber-800 font-gurmukhi">ਅੰਗ</span>
                    <input
                      type="text"
                      value={language === 'pa' ? toGurmukhiNumeral(currentAng) : currentAng}
                      onChange={(e) => {
                        // Support both Gurmukhi and English numerals
                        const val = fromGurmukhiNumeral(e.target.value);
                        if (val !== null && val >= 1 && val <= 1430) {
                          handleAngChange(val);
                        }
                      }}
                      className={cn(
                        "saroop-ang-input",
                        hasGurmukhiNumerals(String(currentAng)) && "font-gurmukhi"
                      )}
                      aria-label="Ang number"
                    />
                    <span className="text-amber-700">/ {language === 'pa' ? '੧੪੩੦' : '1430'}</span>
                  </div>

                  <button
                    onClick={() => handleAngChange(currentAng + 1)}
                    disabled={currentAng >= 1430}
                    className="saroop-nav-btn"
                    aria-label="Next Ang"
                  >
                    <span className="hidden sm:inline font-gurmukhi">ਅਗਲਾ</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>

              {/* Source Attribution - Traditional Style */}
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200/50 text-sm">
                <p className={cn("text-amber-900", language === 'pa' && 'font-gurmukhi')}>
                  {language === 'pa'
                    ? 'ℹ️ ਅੰਗਰੇਜ਼ੀ ਅਰਥ ਟੀਕਾ-ਆਧਾਰਿਤ ਵਿਆਖਿਆ ਹੈ। ਮੂਲ ਗੁਰਮੁਖੀ ਪ੍ਰਮਾਣਿਕ ਹੈ।'
                    : 'ℹ️ English meanings are teeka-based interpretations. The original Gurmukhi is authoritative.'}
                </p>
                <p className="text-xs mt-1 text-amber-700">
                  ਡਾਟਾ ਸਰੋਤ: <a href="https://www.banidb.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">BaniDB</a> (Khalis Foundation)
                </p>
              </div>

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

              {/* Page Footer Note - Traditional Style */}
              <div className="mt-8 pt-6 border-t border-amber-200 text-center">
                <p className="text-lg text-amber-800 font-gurmukhi">
                  ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Please forgive any errors or omissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation FAB */}
      <button
        onClick={() => setMobileNavOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-neela-700 text-white shadow-lg flex items-center justify-center hover:bg-neela-800 transition-colors"
        aria-label={language === 'pa' ? 'ਖੋਜੋ ਅਤੇ ਨੈਵੀਗੇਟ ਕਰੋ' : 'Search and Navigate'}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
