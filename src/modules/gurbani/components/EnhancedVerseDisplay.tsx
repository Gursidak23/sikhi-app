'use client';

// ============================================================================
// ENHANCED VERSE DISPLAY COMPONENT
// ============================================================================
// Production-ready component for displaying Gurbani verses with:
// - Copy to clipboard
// - Share functionality
// - Font size controls
// - Reading mode
// - Keyboard navigation
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CopyVerseButton } from '@/components/common/ShareButton';

interface VerseDisplayProps {
  verse: {
    gurmukhi: string;
    unicode?: string;
    transliteration?: string;
    translation?: {
      en?: string;
      pa?: string;
    };
    source?: string;
    writer?: string;
  };
  verseNumber?: number;
  language?: 'pa' | 'en' | 'hi';
  onSelect?: () => void;
  isHighlighted?: boolean;
}

export function EnhancedVerseDisplay({
  verse,
  verseNumber,
  language = 'pa',
  onSelect,
  isHighlighted = false,
}: VerseDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');

  const fontSizeClasses = {
    normal: 'text-xl md:text-2xl',
    large: 'text-2xl md:text-3xl',
    xl: 'text-3xl md:text-4xl',
  };

  const verseText = verse.unicode || verse.gurmukhi;

  return (
    <div
      className={cn(
        'group relative p-4 md:p-6 rounded-lg transition-all',
        'border border-transparent hover:border-amber-200',
        'hover:bg-amber-50/50',
        isHighlighted && 'bg-amber-100 border-amber-300',
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setShowDetails(!showDetails);
        }
      }}
    >
      {/* Verse Number */}
      {verseNumber && (
        <span className="absolute left-2 top-2 text-xs text-amber-600 font-gurmukhi opacity-50">
          {verseNumber}
        </span>
      )}

      {/* Action buttons - Show on hover */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyVerseButton
          verse={verseText}
          translation={verse.translation?.en}
          source={verse.source}
          language={language === 'hi' ? 'pa' : language}
        />
        
        {/* Font size toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFontSize(prev => 
              prev === 'normal' ? 'large' : 
              prev === 'large' ? 'xl' : 'normal'
            );
          }}
          className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700"
          title="Change font size"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
      </div>

      {/* Main Verse */}
      <p
        className={cn(
          'gurbani-traditional text-center leading-relaxed',
          fontSizeClasses[fontSize]
        )}
        lang="pa"
      >
        {verseText}
      </p>

      {/* Transliteration */}
      {verse.transliteration && (
        <p className="text-center text-sm md:text-base text-amber-700 mt-2 italic">
          {verse.transliteration}
        </p>
      )}

      {/* Toggle for meanings */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(!showDetails);
        }}
        className="mx-auto mt-3 flex items-center gap-1 text-sm text-amber-600 hover:text-amber-800"
      >
        <span>{showDetails ? '▼' : '▶'}</span>
        <span className={language === 'pa' ? 'font-gurmukhi' : ''}>
          {language === 'pa' ? 'ਅਰਥ' : 'Meaning'}
        </span>
      </button>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-amber-200 animate-slide-up">
          {/* Punjabi Meaning */}
          {verse.translation?.pa && (
            <div className="mb-3">
              <p className="text-xs text-amber-600 font-gurmukhi mb-1">ਅਰਥ</p>
              <p className="text-base text-amber-900 font-gurmukhi leading-relaxed">
                {verse.translation.pa}
              </p>
            </div>
          )}

          {/* English Translation */}
          {verse.translation?.en && (
            <div className="mb-3">
              <p className="text-xs text-amber-600 mb-1">English</p>
              <p className="text-base text-amber-900 leading-relaxed">
                {verse.translation.en}
              </p>
            </div>
          )}

          {/* Writer */}
          {verse.writer && (
            <p className="text-xs text-amber-700 font-gurmukhi mt-2">
              ✍️ {verse.writer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// READING MODE WRAPPER
// ============================================================================

interface ReadingModeProps {
  children: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}

export function ReadingMode({ children, enabled, onToggle }: ReadingModeProps) {
  // Listen for 'r' key to toggle reading mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  return (
    <div
      className={cn(
        'transition-all duration-300',
        enabled && 'fixed inset-0 z-50 bg-white overflow-auto p-8 pt-16'
      )}
    >
      {/* Exit Reading Mode Button */}
      {enabled && (
        <button
          onClick={onToggle}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-amber-600 text-white rounded-lg shadow-lg hover:bg-amber-700"
        >
          Exit Reading Mode (R)
        </button>
      )}
      
      {children}
    </div>
  );
}

// ============================================================================
// DISPLAY SETTINGS COMPONENT
// ============================================================================

interface DisplaySettingsProps {
  showTransliteration: boolean;
  onToggleTransliteration: () => void;
  showMeanings: boolean;
  onToggleMeanings: () => void;
  fontSize: 'normal' | 'large' | 'xl';
  onFontSizeChange: (size: 'normal' | 'large' | 'xl') => void;
  language?: 'pa' | 'en';
}

export function DisplaySettings({
  showTransliteration,
  onToggleTransliteration,
  showMeanings,
  onToggleMeanings,
  fontSize,
  onFontSizeChange,
  language = 'pa',
}: DisplaySettingsProps) {
  const isPunjabi = language === 'pa';

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
      {/* Transliteration Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showTransliteration}
          onChange={onToggleTransliteration}
          className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
        />
        <span className={cn('text-sm text-amber-800', isPunjabi && 'font-gurmukhi')}>
          {isPunjabi ? 'ਅੰਗਰੇਜ਼ੀ ਉਚਾਰਣ' : 'Transliteration'}
        </span>
      </label>

      {/* Meanings Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showMeanings}
          onChange={onToggleMeanings}
          className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
        />
        <span className={cn('text-sm text-amber-800', isPunjabi && 'font-gurmukhi')}>
          {isPunjabi ? 'ਅਰਥ ਦਿਖਾਓ' : 'Show Meanings'}
        </span>
      </label>

      {/* Divider */}
      <div className="w-px h-6 bg-amber-300" />

      {/* Font Size */}
      <div className="flex items-center gap-2">
        <span className={cn('text-sm text-amber-800', isPunjabi && 'font-gurmukhi')}>
          {isPunjabi ? 'ਅੱਖਰ' : 'Font'}:
        </span>
        <div className="flex rounded-lg border border-amber-300 overflow-hidden">
          {(['normal', 'large', 'xl'] as const).map((size) => (
            <button
              key={size}
              onClick={() => onFontSizeChange(size)}
              className={cn(
                'px-2 py-1 text-sm',
                fontSize === size
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-amber-700 hover:bg-amber-100'
              )}
            >
              {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BOOKMARK BUTTON
// ============================================================================

interface BookmarkButtonProps {
  angNumber: number;
  isBookmarked: boolean;
  onToggle: () => void;
  language?: 'pa' | 'en';
}

export function BookmarkButton({
  angNumber,
  isBookmarked,
  onToggle,
  language = 'pa',
}: BookmarkButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
        isBookmarked
          ? 'bg-amber-100 text-amber-700 border border-amber-300'
          : 'bg-white text-neutral-600 border border-neutral-200 hover:border-amber-300'
      )}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <svg
        className={cn('w-4 h-4', isBookmarked && 'fill-current')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      <span className={cn('text-sm', language === 'pa' && 'font-gurmukhi')}>
        {language === 'pa' ? 'ਨਿਸ਼ਾਨ' : 'Bookmark'}
      </span>
    </button>
  );
}
