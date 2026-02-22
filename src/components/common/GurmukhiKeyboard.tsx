'use client';

// ============================================================================
// GURMUKHI KEYBOARD COMPONENT
// ============================================================================
// Virtual keyboard for typing Punjabi/Gurmukhi text
// Useful for search and input fields
// ============================================================================

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface GurmukhiKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  className?: string;
}

// Gurmukhi alphabet layout
const GURMUKHI_ROWS = [
  // Vowel signs (lagaan matraan)
  ['ੳ', 'ਅ', 'ੲ', 'ਸ', 'ਹ', 'ਕ', 'ਖ', 'ਗ', 'ਘ', 'ਙ'],
  ['ਚ', 'ਛ', 'ਜ', 'ਝ', 'ਞ', 'ਟ', 'ਠ', 'ਡ', 'ਢ', 'ਣ'],
  ['ਤ', 'ਥ', 'ਦ', 'ਧ', 'ਨ', 'ਪ', 'ਫ', 'ਬ', 'ਭ', 'ਮ'],
  ['ਯ', 'ਰ', 'ਲ', 'ਵ', 'ੜ', 'ਸ਼', 'ਖ਼', 'ਗ਼', 'ਜ਼', 'ਫ਼'],
];

// Vowel signs
const VOWEL_SIGNS = ['ਾ', 'ਿ', 'ੀ', 'ੁ', 'ੂ', 'ੇ', 'ੈ', 'ੋ', 'ੌ', 'ੰ', 'ਂ', '਼'];

// Numbers
const GURMUKHI_NUMBERS = ['੦', '੧', '੨', '੩', '੪', '੫', '੬', '੭', '੮', '੯'];

// Special characters
const SPECIAL_CHARS = ['ੴ', '☬', '।', '॥', '਼', 'ੱ', 'ਃ', 'ੵ'];

export function GurmukhiKeyboard({
  onKeyPress,
  onBackspace,
  onSpace,
  className,
}: GurmukhiKeyboardProps) {
  const [showNumbers, setShowNumbers] = useState(false);
  const [showVowelSigns, setShowVowelSigns] = useState(false);

  return (
    <div className={cn(
      'bg-neutral-100 dark:bg-neutral-800 rounded-xl p-3 shadow-lg',
      className
    )}>
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => {
            setShowNumbers(false);
            setShowVowelSigns(false);
          }}
          className={cn(
            'px-3 py-2 min-h-[44px] rounded-lg text-sm font-gurmukhi transition-colors',
            !showNumbers && !showVowelSigns
              ? 'bg-neela-600 text-white'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
          )}
        >
          ੳ ਅ
        </button>
        <button
          onClick={() => {
            setShowVowelSigns(true);
            setShowNumbers(false);
          }}
          className={cn(
            'px-3 py-2 min-h-[44px] rounded-lg text-sm font-gurmukhi transition-colors',
            showVowelSigns
              ? 'bg-neela-600 text-white'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
          )}
        >
          ਾ ਿ ੀ
        </button>
        <button
          onClick={() => {
            setShowNumbers(true);
            setShowVowelSigns(false);
          }}
          className={cn(
            'px-3 py-2 min-h-[44px] rounded-lg text-sm font-gurmukhi transition-colors',
            showNumbers
              ? 'bg-neela-600 text-white'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
          )}
        >
          ੧੨੩
        </button>
      </div>

      {/* Keyboard Grid */}
      {!showNumbers && !showVowelSigns && (
        <div className="space-y-2">
          {GURMUKHI_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-0.5 sm:gap-1">
              {row.map((char) => (
                <button
                  key={char}
                  onClick={() => onKeyPress(char)}
                  className={cn(
                    'flex-1 min-w-0 h-10 sm:w-10 sm:flex-none sm:h-12 rounded-lg font-gurmukhi text-base sm:text-xl',
                    'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100',
                    'hover:bg-neela-100 dark:hover:bg-neela-800',
                    'active:scale-95 transition-all shadow-sm',
                    'border border-neutral-200 dark:border-neutral-600'
                  )}
                >
                  {char}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Vowel Signs */}
      {showVowelSigns && (
        <div className="space-y-2">
          <div className="flex flex-wrap justify-center gap-1">
            {VOWEL_SIGNS.map((char) => (
              <button
                key={char}
                onClick={() => onKeyPress(char)}
                className={cn(
                  'w-10 h-12 rounded-lg font-gurmukhi text-xl',
                  'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100',
                  'hover:bg-kesri-100 dark:hover:bg-kesri-800',
                  'active:scale-95 transition-all shadow-sm',
                  'border border-neutral-200 dark:border-neutral-600'
                )}
              >
                ਕ{char}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            {SPECIAL_CHARS.map((char) => (
              <button
                key={char}
                onClick={() => onKeyPress(char)}
                className={cn(
                  'w-10 h-12 rounded-lg font-gurmukhi text-xl',
                  'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
                  'hover:bg-amber-100 dark:hover:bg-amber-800/50',
                  'active:scale-95 transition-all shadow-sm',
                  'border border-amber-200 dark:border-amber-700'
                )}
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Numbers */}
      {showNumbers && (
        <div className="flex flex-wrap justify-center gap-1">
          {GURMUKHI_NUMBERS.map((char) => (
            <button
              key={char}
              onClick={() => onKeyPress(char)}
              className={cn(
                'w-10 h-12 rounded-lg font-gurmukhi text-xl',
                'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100',
                'hover:bg-neela-100 dark:hover:bg-neela-800',
                'active:scale-95 transition-all shadow-sm',
                'border border-neutral-200 dark:border-neutral-600'
              )}
            >
              {char}
            </button>
          ))}
        </div>
      )}

      {/* Control Keys */}
      <div className="flex justify-center gap-2 mt-3">
        <button
          onClick={onSpace}
          className={cn(
            'flex-1 max-w-[200px] h-10 rounded-lg text-sm',
            'bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300',
            'hover:bg-neutral-300 dark:hover:bg-neutral-500',
            'active:scale-95 transition-all'
          )}
        >
          Space
        </button>
        <button
          onClick={onBackspace}
          className={cn(
            'px-4 h-10 rounded-lg',
            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
            'hover:bg-red-200 dark:hover:bg-red-800/50',
            'active:scale-95 transition-all'
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Compact version for inline use
export function GurmukhiKeyboardMini({
  onKeyPress,
  onBackspace,
}: {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const commonChars = ['ਸ', 'ਹ', 'ਕ', 'ਗ', 'ਨ', 'ਮ', 'ਰ', 'ਵ', 'ਾ', 'ਿ', 'ੀ', 'ੁ'];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'px-3 py-1.5 rounded-lg text-sm font-gurmukhi',
          'bg-neela-100 dark:bg-neela-900 text-neela-700 dark:text-neela-300',
          'hover:bg-neela-200 dark:hover:bg-neela-800',
          'transition-colors'
        )}
      >
        ੳ ਅ ⌨️
      </button>
    );
  }

  return (
    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Gurmukhi</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {commonChars.map((char) => (
          <button
            key={char}
            onClick={() => onKeyPress(char)}
            className={cn(
              'w-7 h-8 rounded font-gurmukhi text-sm',
              'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100',
              'hover:bg-neela-100 dark:hover:bg-neela-800',
              'active:scale-95 transition-all border border-neutral-200 dark:border-neutral-600'
            )}
          >
            {char}
          </button>
        ))}
        <button
          onClick={onBackspace}
          className={cn(
            'w-7 h-8 rounded',
            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
            'hover:bg-red-200 dark:hover:bg-red-800/50',
            'active:scale-95 transition-all'
          )}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
