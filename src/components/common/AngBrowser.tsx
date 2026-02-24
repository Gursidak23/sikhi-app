'use client';

// ============================================================================
// ANG BROWSER — VISUAL RAAG MAP + READING HISTORY
// ============================================================================
// Visual overview of all 1430 Angs organized by Raag section,
// with reading history tracking and progress visualization
// ============================================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { SGGS_RAAG_RANGES } from '@/lib/constants/raag-ranges';
import type { Language } from '@/types';

const HISTORY_KEY = 'sikhi-ang-history';

interface AngHistory {
  visited: number[]; // ang numbers visited
  lastVisited: number;
  lastTimestamp: string;
}

function loadHistory(): AngHistory {
  if (typeof window === 'undefined') return { visited: [], lastVisited: 1, lastTimestamp: '' };
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return { visited: [], lastVisited: 1, lastTimestamp: '' };
    return JSON.parse(raw);
  } catch {
    return { visited: [], lastVisited: 1, lastTimestamp: '' };
  }
}

export function recordAngVisit(ang: number) {
  if (typeof window === 'undefined') return;
  const history = loadHistory();
  if (!history.visited.includes(ang)) {
    history.visited.push(ang);
  }
  history.lastVisited = ang;
  history.lastTimestamp = new Date().toISOString();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// Raag section colors for visual differentiation
const RAAG_COLORS = [
  'bg-amber-400', 'bg-orange-400', 'bg-red-400', 'bg-rose-400', 'bg-pink-400',
  'bg-fuchsia-400', 'bg-purple-400', 'bg-violet-400', 'bg-indigo-400', 'bg-blue-400',
  'bg-sky-400', 'bg-cyan-400', 'bg-teal-400', 'bg-emerald-400', 'bg-green-400',
  'bg-lime-400', 'bg-yellow-400', 'bg-amber-500', 'bg-orange-500', 'bg-red-500',
  'bg-rose-500', 'bg-pink-500', 'bg-fuchsia-500', 'bg-purple-500', 'bg-violet-500',
  'bg-indigo-500', 'bg-blue-500', 'bg-sky-500', 'bg-cyan-500', 'bg-teal-500',
  'bg-emerald-500', 'bg-green-500', 'bg-lime-500', 'bg-yellow-500', 'bg-amber-300',
  'bg-orange-300', 'bg-red-300', 'bg-rose-300', 'bg-pink-300', 'bg-fuchsia-300',
  'bg-purple-300', 'bg-violet-300', 'bg-indigo-300', 'bg-blue-300',
];

interface AngBrowserProps {
  language: Language;
  currentAng: number;
  onNavigate: (ang: number) => void;
}

export function AngBrowser({ language, currentAng, onNavigate }: AngBrowserProps) {
  const [history, setHistory] = useState<AngHistory>(loadHistory);
  const [view, setView] = useState<'raag' | 'grid'>('raag');
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  // Refresh history when component mounts or becomes visible
  useEffect(() => {
    setHistory(loadHistory());
  }, [currentAng]);

  const visitedSet = useMemo(() => new Set(history.visited), [history]);
  const totalVisited = visitedSet.size;
  const progressPercent = Math.round((totalVisited / 1430) * 100);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-amber-200 dark:border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-neutral-800 dark:to-amber-950/30 border-b border-amber-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn('font-bold text-amber-900 dark:text-amber-200', isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : '')}>
            {isPunjabi ? '📖 ਅੰਗ ਬ੍ਰਾਊਜ਼ਰ' : isHindi ? '📖 अंग ब्राउज़र' : '📖 Ang Browser'}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setView('raag')}
              className={cn(
                'px-3 py-1.5 text-xs rounded-lg transition-colors min-h-[36px] sm:min-h-0',
                view === 'raag' ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-neutral-700 text-amber-700 dark:text-neutral-300'
              )}
            >
              {isPunjabi ? 'ਰਾਗ' : isHindi ? 'राग' : 'Raag'}
            </button>
            <button
              onClick={() => setView('grid')}
              className={cn(
                'px-3 py-1 text-xs rounded-lg transition-colors',
                view === 'grid' ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-neutral-700 text-amber-700 dark:text-neutral-300'
              )}
            >
              {isPunjabi ? 'ਗਰਿੱਡ' : isHindi ? 'ग्रिड' : 'Grid'}
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-amber-100 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-green-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono text-amber-700 dark:text-amber-400 whitespace-nowrap">
            {totalVisited}/1430 ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[60vh] overflow-y-auto">
        {view === 'raag' ? (
          <RaagView
            language={language}
            currentAng={currentAng}
            visitedSet={visitedSet}
            onNavigate={onNavigate}
          />
        ) : (
          <GridView
            language={language}
            currentAng={currentAng}
            visitedSet={visitedSet}
            onNavigate={onNavigate}
          />
        )}
      </div>
    </div>
  );
}

function RaagView({
  language,
  currentAng,
  visitedSet,
  onNavigate,
}: {
  language: Language;
  currentAng: number;
  visitedSet: Set<number>;
  onNavigate: (ang: number) => void;
}) {
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  return (
    <div className="space-y-2">
      {SGGS_RAAG_RANGES.map((raag, idx) => {
        const angCount = raag.angEnd - raag.angStart + 1;
        const visitedInRaag = Array.from({ length: angCount }, (_, i) => raag.angStart + i).filter(a => visitedSet.has(a)).length;
        const raagProgress = Math.round((visitedInRaag / angCount) * 100);
        const isCurrentRaag = currentAng >= raag.angStart && currentAng <= raag.angEnd;

        return (
          <button
            key={idx}
            onClick={() => onNavigate(raag.angStart)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-amber-50 dark:hover:bg-neutral-800',
              isCurrentRaag && 'bg-amber-100 dark:bg-amber-900/30 ring-1 ring-amber-400'
            )}
          >
            <div className={cn('w-2.5 h-10 rounded-full flex-shrink-0', RAAG_COLORS[idx % RAAG_COLORS.length])} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={cn(
                  'font-medium text-sm text-neutral-900 dark:text-white truncate',
                  isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : ''
                )}>
                  {isPunjabi ? raag.name.pa : isHindi ? (raag.name.hi ?? raag.name.pa) : raag.name.en}
                </p>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-500 flex-shrink-0 ml-2">
                  {raag.angStart}-{raag.angEnd}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', RAAG_COLORS[idx % RAAG_COLORS.length])}
                    style={{ width: `${raagProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                  {visitedInRaag}/{angCount}
                </span>
              </div>
            </div>
            {isCurrentRaag && (
              <span className="text-amber-500 flex-shrink-0">⬤</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function GridView({
  language,
  currentAng,
  visitedSet,
  onNavigate,
}: {
  language: Language;
  currentAng: number;
  visitedSet: Set<number>;
  onNavigate: (ang: number) => void;
}) {
  // Show 1430 ang cells grouped in blocks of 100
  const blocks = useMemo(() => {
    const result: { label: string; start: number; end: number }[] = [];
    for (let i = 1; i <= 1430; i += 100) {
      result.push({
        label: `${i}-${Math.min(i + 99, 1430)}`,
        start: i,
        end: Math.min(i + 99, 1430),
      });
    }
    return result;
  }, []);

  const [expandedBlock, setExpandedBlock] = useState<number | null>(() => {
    // Auto-expand block containing current ang
    return Math.floor((currentAng - 1) / 100) * 100 + 1;
  });

  return (
    <div className="space-y-3">
      {blocks.map((block) => {
        const isExpanded = expandedBlock === block.start;
        const blockAngs = Array.from({ length: block.end - block.start + 1 }, (_, i) => block.start + i);
        const visitedCount = blockAngs.filter(a => visitedSet.has(a)).length;
        const total = blockAngs.length;

        return (
          <div key={block.start} className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedBlock(isExpanded ? null : block.start)}
              className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 transition-colors"
            >
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Ang {block.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-500">{visitedCount}/{total}</span>
                <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
              </div>
            </button>
            {isExpanded && (
              <div className="p-3 grid grid-cols-5 sm:grid-cols-10 gap-1">
                {blockAngs.map((ang) => (
                  <button
                    key={ang}
                    onClick={() => onNavigate(ang)}
                    title={`Ang ${ang}`}
                    className={cn(
                      'aspect-square rounded text-[9px] sm:text-[10px] font-mono transition-all',
                      ang === currentAng
                        ? 'bg-amber-500 text-white ring-2 ring-amber-300 font-bold'
                        : visitedSet.has(ang)
                          ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 hover:bg-green-300'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                    )}
                  >
                    {ang}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
