'use client';

// ============================================================================
// READ-ALOUD CONTROLS COMPONENT
// ============================================================================
// Floating control bar for text-to-speech playback of Gurbani
// Supports play/pause, stop, speed control, and line indicator
// ============================================================================

import { cn } from '@/lib/utils';
import type { Language } from '@/types';

interface ReadAloudControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  currentLineIndex: number;
  totalLines: number;
  playbackRate: number;
  language: Language;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRateChange: (rate: number) => void;
  className?: string;
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5];

export function ReadAloudControls({
  isPlaying,
  isPaused,
  isSupported,
  currentLineIndex,
  totalLines,
  playbackRate,
  language,
  onPlay,
  onPause,
  onResume,
  onStop,
  onRateChange,
  className,
}: ReadAloudControlsProps) {
  const isPunjabi = language === 'pa' || language === 'pa-roman';
  const isHindi = language === 'hi';

  if (!isSupported) return null;

  return (
    <div className={cn(
      'flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl',
      'bg-gradient-to-r from-neela-50 to-neela-100 dark:from-neela-900/60 dark:to-neela-800/60',
      'border border-neela-200 dark:border-neela-700',
      'shadow-sm',
      className,
    )}>
      {/* Play / Pause Button */}
      {!isPlaying ? (
        <button
          onClick={onPlay}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-all',
            'bg-neela-600 text-white hover:bg-neela-700',
            'shadow-sm hover:shadow active:scale-95'
          )}
          title={isPunjabi ? 'ਸੁਣੋ' : isHindi ? 'सुनें' : 'Listen'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <span className="hidden sm:inline">
            {isPunjabi ? 'ਸੁਣੋ' : isHindi ? 'सुनें' : 'Listen'}
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            onClick={isPaused ? onResume : onPause}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-all',
              isPaused
                ? 'bg-neela-600 text-white hover:bg-neela-700'
                : 'bg-amber-500 text-white hover:bg-amber-600',
              'shadow-sm active:scale-95'
            )}
          >
            {isPaused ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
            <span className="hidden sm:inline">
              {isPaused
                ? (isPunjabi ? 'ਜਾਰੀ' : isHindi ? 'जारी' : 'Resume')
                : (isPunjabi ? 'ਰੁਕੋ' : isHindi ? 'रुकें' : 'Pause')
              }
            </span>
          </button>
          <button
            onClick={onStop}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors active:scale-95"
            title={isPunjabi ? 'ਬੰਦ ਕਰੋ' : isHindi ? 'बंद करें' : 'Stop'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>
        </div>
      )}

      {/* Progress indicator */}
      {isPlaying && totalLines > 0 && (
        <div className="hidden sm:flex items-center gap-2 text-xs text-neela-700 dark:text-neela-300">
          <div className="w-16 h-1.5 bg-neela-200 dark:bg-neela-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-neela-600 dark:bg-neela-400 rounded-full transition-all duration-300"
              style={{ width: `${((currentLineIndex + 1) / totalLines) * 100}%` }}
            />
          </div>
          <span>{currentLineIndex + 1}/{totalLines}</span>
        </div>
      )}

      {/* Speed Control */}
      <select
        value={playbackRate}
        onChange={(e) => onRateChange(parseFloat(e.target.value))}
        className="text-xs sm:text-sm bg-white dark:bg-neutral-800 border border-neela-300 dark:border-neela-700 rounded-lg px-1.5 py-1.5 min-h-[36px] text-neela-800 dark:text-neela-200"
        title={isPunjabi ? 'ਸਪੀਡ' : isHindi ? 'स्पीड' : 'Speed'}
      >
        {RATES.map((r) => (
          <option key={r} value={r}>{r}x</option>
        ))}
      </select>
    </div>
  );
}

// Mini inline "listen" button for a single line
export function ReadAloudMini({
  onClick,
  isActive,
  language,
}: {
  onClick: () => void;
  isActive?: boolean;
  language: Language;
}) {
  const isPunjabi = language === 'pa' || language === 'pa-roman';
  const isHindi = language === 'hi';

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-full transition-all',
        isActive
          ? 'bg-neela-600 text-white scale-110 shadow-md'
          : 'text-neela-500 dark:text-neela-400 hover:bg-neela-100 dark:hover:bg-neela-900/50 hover:text-neela-700'
      )}
      title={isPunjabi ? 'ਇਹ ਪੰਕਤੀ ਸੁਣੋ' : isHindi ? 'यह पंक्ति सुनें' : 'Listen to this line'}
    >
      {isActive ? (
        <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
    </button>
  );
}
