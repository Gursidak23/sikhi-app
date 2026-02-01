'use client';

// ============================================================================
// ANG NAVIGATOR COMPONENT
// ============================================================================
// Navigation for browsing Guru Granth Sahib Ji by Ang (page)
// No infinite scrolling - intentional, respectful navigation
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn, toGurmukhiNumeral, fromGurmukhiNumeral, hasGurmukhiNumerals } from '@/lib/utils';
import type { Language } from '@/types';

interface AngNavigatorProps {
  currentAng: number;
  totalAngs?: number;
  onAngChange: (ang: number) => void;
  language?: Language;
  className?: string;
}

// Total Angs in Sri Guru Granth Sahib Ji
const TOTAL_ANGS = 1430;

export function AngNavigator({
  currentAng,
  totalAngs = TOTAL_ANGS,
  onAngChange,
  language = 'pa',
  className,
}: AngNavigatorProps) {
  const [inputValue, setInputValue] = useState(currentAng.toString());
  const [isInputFocused, setIsInputFocused] = useState(false);

  const goToAng = useCallback((ang: number) => {
    const validAng = Math.max(1, Math.min(ang, totalAngs));
    onAngChange(validAng);
    setInputValue(validAng.toString());
  }, [onAngChange, totalAngs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ang = parseInt(inputValue, 10);
    if (!isNaN(ang)) {
      goToAng(ang);
    }
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    const ang = parseInt(inputValue, 10);
    if (isNaN(ang) || ang < 1 || ang > totalAngs) {
      setInputValue(currentAng.toString());
    }
  };

  return (
    <nav
      className={cn(
        'flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-neutral-200',
        className
      )}
      aria-label="Ang navigation"
    >
      {/* Previous Ang */}
      <button
        onClick={() => goToAng(currentAng - 1)}
        disabled={currentAng <= 1}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          currentAng <= 1
            ? 'text-neutral-300 cursor-not-allowed'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
        )}
        aria-label={language === 'pa' ? 'ਪਿਛਲਾ ਅੰਗ' : 'Previous Ang'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline text-sm">
          {language === 'pa' ? 'ਪਿਛਲਾ' : 'Previous'}
        </span>
      </button>

      {/* Current Ang Display & Input */}
      <div className="flex items-center gap-3">
        <span className={cn(
          'text-sm text-neutral-500',
          language === 'pa' && 'font-gurmukhi'
        )}>
          {language === 'pa' ? 'ਅੰਗ' : 'Ang'}
        </span>
        
        <form onSubmit={handleInputSubmit} className="relative">
          <input
            type="text"
            value={isInputFocused ? inputValue : (language === 'pa' ? toGurmukhiNumeral(currentAng) : currentAng)}
            onChange={handleInputChange}
            onFocus={() => {
              setIsInputFocused(true);
              setInputValue(currentAng.toString());
            }}
            onBlur={handleInputBlur}
            className={cn(
              'w-20 px-3 py-2 text-center text-lg font-medium rounded-lg border',
              'focus:outline-none focus:ring-2 focus:ring-neela-500 focus:border-neela-500',
              language === 'pa' && 'font-gurmukhi',
              'bg-neela-50 border-neela-200 text-neela-800'
            )}
            aria-label={language === 'pa' ? 'ਅੰਗ ਨੰਬਰ' : 'Ang number'}
          />
        </form>

        <span className="text-sm text-neutral-400">
          / {language === 'pa' ? toGurmukhiNumeral(totalAngs) : totalAngs}
        </span>
      </div>

      {/* Next Ang */}
      <button
        onClick={() => goToAng(currentAng + 1)}
        disabled={currentAng >= totalAngs}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          currentAng >= totalAngs
            ? 'text-neutral-300 cursor-not-allowed'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
        )}
        aria-label={language === 'pa' ? 'ਅਗਲਾ ਅੰਗ' : 'Next Ang'}
      >
        <span className="hidden sm:inline text-sm">
          {language === 'pa' ? 'ਅਗਲਾ' : 'Next'}
        </span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}

// ============================================================================
// RAAG NAVIGATOR
// ============================================================================

interface RaagNavigatorProps {
  raags: Array<{
    id: string;
    name: { pa: string; en?: string };
    angStart: number;
    angEnd: number;
  }>;
  currentRaagId?: string;
  onRaagSelect: (raagId: string, startAng: number) => void;
  language?: Language;
  className?: string;
}

export function RaagNavigator({
  raags,
  currentRaagId,
  onRaagSelect,
  language = 'pa',
  className,
}: RaagNavigatorProps) {
  return (
    <nav className={cn('space-y-1', className)} aria-label="Raag navigation">
      <h3 className={cn(
        'text-sm font-medium text-neutral-500 mb-3 px-2',
        language === 'pa' && 'font-gurmukhi'
      )}>
        {language === 'pa' ? 'ਰਾਗ' : 'Raag'}
      </h3>
      
      <div className="space-y-0.5 max-h-96 overflow-y-auto scrollbar-hide">
        {raags.map((raag) => (
          <button
            key={raag.id}
            onClick={() => onRaagSelect(raag.id, raag.angStart)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
              currentRaagId === raag.id
                ? 'bg-neela-100 text-neela-800'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            )}
          >
            <span className={cn(
              'block',
              language === 'pa' && 'font-gurmukhi'
            )}>
              {language === 'pa' ? raag.name.pa : raag.name.en || raag.name.pa}
            </span>
            <span className="text-xs text-neutral-400">
              ਅੰਗ {raag.angStart} - {raag.angEnd}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ============================================================================
// QUICK JUMP COMPONENT
// ============================================================================

interface QuickJumpProps {
  onJump: (ang: number) => void;
  language?: Language;
  className?: string;
}

export function QuickJump({ onJump, language = 'pa', className }: QuickJumpProps) {
  const importantAngs = [
    { ang: 1, name: { pa: 'ਜਪੁ ਜੀ ਸਾਹਿਬ', en: 'Japji Sahib' } },
    { ang: 917, name: { pa: 'ਅਨੰਦ ਸਾਹਿਬ', en: 'Anand Sahib' } },
    { ang: 262, name: { pa: 'ਸੁਖਮਨੀ ਸਾਹਿਬ', en: 'Sukhmani Sahib' } },
    { ang: 12, name: { pa: 'ਸੋ ਦਰੁ', en: 'So Dar' } },
    { ang: 1429, name: { pa: 'ਮੁੰਦਾਵਣੀ', en: 'Mundavani' } },
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className={cn(
        'text-sm font-medium text-neutral-500 px-2',
        language === 'pa' && 'font-gurmukhi'
      )}>
        {language === 'pa' ? 'ਜਲਦੀ ਜਾਓ' : 'Quick Jump'}
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {importantAngs.map((item) => (
          <button
            key={item.ang}
            onClick={() => onJump(item.ang)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-full border border-neela-200',
              'bg-neela-50 text-neela-700 hover:bg-neela-100 transition-colors'
            )}
          >
            <span className={language === 'pa' ? 'font-gurmukhi' : ''}>
              {language === 'pa' ? item.name.pa : item.name.en}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ANG SEARCH COMPONENT
// ============================================================================
// Direct Ang number search with support for both Punjabi and English numerals

interface AngSearchProps {
  onAngSelect: (ang: number) => void;
  language?: Language;
  className?: string;
}

export function AngSearch({ onAngSelect, language = 'pa', className }: AngSearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input change - supports both Punjabi and English numerals
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError(null);
    
    // Allow Gurmukhi numerals (੦-੯) and Arabic numerals (0-9)
    const cleanedValue = value.replace(/[^੦-੯0-9]/g, '');
    setInputValue(cleanedValue);
  };

  // Get the numeric value from input (handles both Punjabi and English)
  const getNumericValue = useCallback((): number | null => {
    if (!inputValue) return null;
    return fromGurmukhiNumeral(inputValue);
  }, [inputValue]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const angNumber = getNumericValue();
    
    if (angNumber === null) {
      setError(language === 'pa' ? 'ਕਿਰਪਾ ਕਰਕੇ ਅੰਗ ਨੰਬਰ ਦਾਖਲ ਕਰੋ' : 'Please enter an Ang number');
      return;
    }
    
    if (angNumber < 1 || angNumber > TOTAL_ANGS) {
      setError(
        language === 'pa' 
          ? `ਅੰਗ ੧ ਤੋਂ ${toGurmukhiNumeral(TOTAL_ANGS)} ਦੇ ਵਿਚਕਾਰ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ`
          : `Ang must be between 1 and ${TOTAL_ANGS}`
      );
      return;
    }
    
    onAngSelect(angNumber);
    setInputValue('');
    setIsOpen(false);
    setError(null);
  };

  // Get display value for preview
  const previewValue = getNumericValue();
  const isValidPreview = previewValue !== null && previewValue >= 1 && previewValue <= TOTAL_ANGS;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
          'bg-gradient-to-r from-kesri-500 to-kesri-600 text-white',
          'hover:from-kesri-600 hover:to-kesri-700 shadow-md hover:shadow-lg',
          language === 'pa' && 'font-gurmukhi'
        )}
        aria-label={language === 'pa' ? 'ਅੰਗ ਖੋਜੋ' : 'Search Ang'}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">
          {language === 'pa' ? 'ਅੰਗ ਖੋਜੋ' : 'Go to Ang'}
        </span>
      </button>

      {/* Search Dropdown */}
      {isOpen && (
        <div className={cn(
          'absolute top-full mt-2 right-0 z-50',
          'bg-white rounded-xl shadow-xl border border-neutral-200',
          'p-4 min-w-[280px]'
        )}>
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="mb-3">
              <h4 className={cn(
                'text-sm font-medium text-neutral-700',
                language === 'pa' && 'font-gurmukhi'
              )}>
                {language === 'pa' ? 'ਅੰਗ ਨੰਬਰ ਦਾਖਲ ਕਰੋ' : 'Enter Ang Number'}
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                {language === 'pa' 
                  ? 'ਪੰਜਾਬੀ (੧੨੩) ਜਾਂ ਅੰਗਰੇਜ਼ੀ (123) ਨੰਬਰ ਵਰਤੋ'
                  : 'Use Punjabi (੧੨੩) or English (123) numbers'
                }
              </p>
            </div>

            {/* Input Field */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={language === 'pa' ? '੧ - ੧੪੩੦' : '1 - 1430'}
                  className={cn(
                    'w-full px-4 py-3 text-lg text-center rounded-lg border-2',
                    'focus:outline-none focus:ring-2 focus:ring-kesri-500 focus:border-kesri-500',
                    'transition-all',
                    error 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-neutral-200 bg-neutral-50',
                    hasGurmukhiNumerals(inputValue) && 'font-gurmukhi'
                  )}
                  aria-label={language === 'pa' ? 'ਅੰਗ ਨੰਬਰ' : 'Ang number'}
                  autoComplete="off"
                />
                
                {/* Preview Badge */}
                {isValidPreview && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                    {language === 'pa' ? `ਅੰਗ ${toGurmukhiNumeral(previewValue!)}` : `Ang ${previewValue}`}
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!isValidPreview}
                className={cn(
                  'px-4 py-3 rounded-lg font-medium transition-all',
                  isValidPreview
                    ? 'bg-kesri-500 text-white hover:bg-kesri-600'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                )}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <p className={cn(
                'mt-2 text-sm text-red-600',
                language === 'pa' && 'font-gurmukhi'
              )}>
                {error}
              </p>
            )}

            {/* Quick Number Pad */}
            <div className="mt-4 pt-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-500 mb-2">
                {language === 'pa' ? 'ਜਲਦੀ ਚੋਣ:' : 'Quick select:'}
              </p>
              <div className="grid grid-cols-5 gap-1">
                {[1, 262, 917, 1, 1430].map((ang, i) => {
                  const labels = [
                    { pa: 'ਜਪੁ ਜੀ ਸਾਹਿਬ', en: 'Japji Sahib' },
                    { pa: 'ਸੁਖਮਨੀ ਸਾਹਿਬ', en: 'Sukhmani Sahib' },
                    { pa: 'ਅਨੰਦ ਸਾਹਿਬ', en: 'Anand Sahib' },
                    { pa: 'ਪਹਿਲਾ ਅੰਗ', en: 'First Ang' },
                    { pa: 'ਆਖਰੀ ਅੰਗ', en: 'Last Ang' },
                  ];
                  const angValues = [1, 262, 917, 1, 1430];
                  return (
                    <button
                      key={`${ang}-${i}`}
                      type="button"
                      onClick={() => {
                        onAngSelect(angValues[i]);
                        setIsOpen(false);
                        setInputValue('');
                      }}
                      className={cn(
                        'px-2 py-1.5 text-xs rounded-lg',
                        'bg-neela-50 text-neela-700 hover:bg-neela-100',
                        'transition-colors',
                        language === 'pa' && 'font-gurmukhi'
                      )}
                    >
                      {language === 'pa' ? labels[i].pa : labels[i].en}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
