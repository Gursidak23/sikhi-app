'use client';

// ============================================================================
// PANKTI DISPLAY COMPONENT
// ============================================================================
// Displays a single line (Pankti) of Gurbani with interpretations
// The most sacred component - handles Gurbani with full reverence
// ============================================================================

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SourceCitation } from '@/components/common/SourceCitation';
import type { Pankti, TeekaInterpretation, Language } from '@/types';

// Re-export types for convenience
export type { Pankti, TeekaInterpretation };

interface PanktiDisplayProps {
  pankti: Pankti;
  language?: Language;
  showTransliteration?: boolean;
  showInterpretations?: boolean;
  defaultInterpretationExpanded?: boolean;
  className?: string;
}

export function PanktiDisplay({
  pankti,
  language = 'pa',
  showTransliteration = true,
  showInterpretations = true,
  defaultInterpretationExpanded = false,
  className,
}: PanktiDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(defaultInterpretationExpanded);
  const [selectedTeeka, setSelectedTeeka] = useState<string | null>(null);

  // Apply vishraam (pause) markers to Gurmukhi text
  const renderGurmukhiWithVishraam = () => {
    const text = pankti.gurmukhiUnicode;
    
    if (!pankti.vishraamPositions || pankti.vishraamPositions.length === 0) {
      return <span>{text}</span>;
    }

    // This is a simplified version - real implementation would parse word positions
    return <span>{text}</span>;
  };

  return (
    <div
      className={cn(
        'py-4 border-b border-neutral-100 last:border-b-0',
        'hover:bg-neela-50/20 transition-colors',
        className
      )}
    >
      {/* Gurmukhi Text - AUTHORITATIVE */}
      <p
        className="gurbani-text text-gurbani-lg leading-relaxed"
        lang="pa"
        dir="ltr"
      >
        {renderGurmukhiWithVishraam()}
      </p>

      {/* Transliteration (phonetic aid only) */}
      {showTransliteration && pankti.transliteration && (
        <p className="mt-2 text-neutral-600 text-base italic">
          {pankti.transliteration}
        </p>
      )}

      {/* Interpretations Section */}
      {showInterpretations && pankti.interpretations.length > 0 && (
        <div className="mt-4">
          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-neela-700 hover:text-neela-800 transition-colors"
            aria-expanded={isExpanded}
          >
            <svg
              className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-90')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            {language === 'pa' ? 'ਅਰਥ ਵੇਖੋ' : language === 'hi' ? 'अर्थ देखें' : 'View Meanings'}
            <span className="text-neutral-400 text-xs">
              ({pankti.interpretations.length} {language === 'pa' ? 'ਟੀਕੇ' : 'sources'})
            </span>
          </button>

          {/* Expanded Interpretations */}
          {isExpanded && (
            <div className="mt-3 space-y-4">
              {/* Teeka Selector (if multiple) */}
              {pankti.interpretations.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTeeka(null)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full border transition-colors',
                      selectedTeeka === null
                        ? 'bg-neela-100 border-neela-300 text-neela-700'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    )}
                  >
                    {language === 'pa' ? 'ਸਾਰੇ' : 'All'}
                  </button>
                  {pankti.interpretations.map((interp) => (
                    <button
                      key={interp.id}
                      onClick={() => setSelectedTeeka(interp.source.id)}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full border transition-colors',
                        selectedTeeka === interp.source.id
                          ? 'bg-neela-100 border-neela-300 text-neela-700'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                      )}
                    >
                      {interp.source.title.en || interp.source.title.pa}
                    </button>
                  ))}
                </div>
              )}

              {/* Display Interpretations */}
              {pankti.interpretations
                .filter((interp) => !selectedTeeka || interp.source.id === selectedTeeka)
                .map((interpretation) => (
                  <InterpretationBlock
                    key={interpretation.id}
                    interpretation={interpretation}
                    language={language}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INTERPRETATION BLOCK SUB-COMPONENT
// ============================================================================

interface InterpretationBlockProps {
  interpretation: TeekaInterpretation;
  language: Language;
}

function InterpretationBlock({ interpretation, language }: InterpretationBlockProps) {
  const getArth = () => {
    if (language === 'pa' && interpretation.arthPunjabi) {
      return { text: interpretation.arthPunjabi, isGurmukhi: true };
    }
    if (language === 'hi' && interpretation.arthHindi) {
      return { text: interpretation.arthHindi, isGurmukhi: false };
    }
    if (interpretation.meaningEnglish) {
      return { text: interpretation.meaningEnglish, isGurmukhi: false };
    }
    // Fallback to Punjabi
    return { text: interpretation.arthPunjabi || '', isGurmukhi: true };
  };

  const arth = getArth();

  return (
    <div className="pl-4 border-l-2 border-neela-200 bg-neela-50/30 rounded-r-lg p-3">
      {/* Arth/Meaning */}
      <p
        className={cn(
          'text-neutral-700',
          arth.isGurmukhi ? 'font-gurmukhi text-lg' : 'text-base'
        )}
      >
        {arth.text}
      </p>

      {/* Extended Explanation (if available) */}
      {language === 'pa' && interpretation.viakhyaPunjabi && (
        <p className="mt-2 text-neutral-600 font-gurmukhi text-base">
          {interpretation.viakhyaPunjabi}
        </p>
      )}
      {language === 'en' && interpretation.viakhyaEnglish && (
        <p className="mt-2 text-neutral-600 text-sm">
          {interpretation.viakhyaEnglish}
        </p>
      )}

      {/* Pad Arth (word-by-word) */}
      {interpretation.padArth && interpretation.padArth.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neela-100">
          <p className="text-xs text-neutral-500 mb-2">
            {language === 'pa' ? 'ਪਦ ਅਰਥ:' : 'Word meanings:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {interpretation.padArth.map((pad, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded text-xs"
              >
                <span className="font-gurmukhi text-neela-700">{pad.word}</span>
                <span className="text-neutral-400">→</span>
                <span className="text-neutral-600">{pad.meaning}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Source Attribution - MANDATORY */}
      <div className="mt-3 pt-2 border-t border-neela-100">
        <p className="text-xs text-neutral-500 italic">
          {language === 'pa' && 'ਅਰਥ '}
          {language === 'en' && 'Meaning/interpretation based on '}
          {language === 'hi' && 'अर्थ '}
          <span className="font-medium text-neutral-600">
            {interpretation.source.title.en || interpretation.source.title.pa}
          </span>
          {interpretation.source.author && (
            <span className="text-neutral-400">
              {' — '}
              {interpretation.source.author.en || interpretation.source.author.pa}
            </span>
          )}
        </p>
      </div>

      {/* Verification Status */}
      {interpretation.verifiedBy && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Verified by {interpretation.verifiedBy}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// MULTIPLE PANKTIS DISPLAY
// ============================================================================

interface ShabadDisplayProps {
  panktis: Pankti[];
  language?: Language;
  showHeader?: boolean;
  raagName?: string;
  authorName?: string;
  angNumber?: number;
  className?: string;
}

export function ShabadDisplay({
  panktis,
  language = 'pa',
  showHeader = true,
  raagName,
  authorName,
  angNumber,
  className,
}: ShabadDisplayProps) {
  return (
    <div className={cn('gurbani-section', className)}>
      {/* Shabad Header */}
      {showHeader && (raagName || authorName || angNumber) && (
        <div className="flex flex-wrap items-center gap-4 pb-4 mb-4 border-b border-neutral-200">
          {raagName && (
            <span className="text-sm text-neela-700 font-gurmukhi">
              {raagName}
            </span>
          )}
          {authorName && (
            <span className="text-sm text-neutral-600 font-gurmukhi">
              {authorName}
            </span>
          )}
          {angNumber && (
            <span className="text-sm text-neutral-500">
              ਅੰਗ {angNumber}
            </span>
          )}
        </div>
      )}

      {/* Panktis */}
      <div className="space-y-2">
        {panktis.map((pankti) => (
          <PanktiDisplay
            key={pankti.id}
            pankti={pankti}
            language={language}
          />
        ))}
      </div>
    </div>
  );
}
