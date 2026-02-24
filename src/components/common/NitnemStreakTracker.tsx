'use client';

// ============================================================================
// NITNEM STREAK TRACKER
// ============================================================================
// Tracks daily Bani completion, maintains streaks,
// and provides a visual progress dashboard
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

const STORAGE_KEY = 'sikhi-nitnem-streak';

interface DayLog {
  date: string; // YYYY-MM-DD
  completed: string[]; // bani IDs completed
}

interface StreakData {
  logs: DayLog[];
  currentStreak: number;
  longestStreak: number;
  totalDaysCompleted: number;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function loadStreak(): StreakData {
  if (typeof window === 'undefined') return { logs: [], currentStreak: 0, longestStreak: 0, totalDaysCompleted: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { logs: [], currentStreak: 0, longestStreak: 0, totalDaysCompleted: 0 };
    return JSON.parse(raw);
  } catch {
    return { logs: [], currentStreak: 0, longestStreak: 0, totalDaysCompleted: 0 };
  }
}

function saveStreak(data: StreakData) {
  if (typeof window === 'undefined') return;
  // Keep only last 90 days of logs
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffKey = cutoff.toISOString().split('T')[0];
  data.logs = data.logs.filter(l => l.date >= cutoffKey);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function calculateStreak(logs: DayLog[]): { current: number; longest: number; totalDays: number } {
  if (logs.length === 0) return { current: 0, longest: 0, totalDays: 0 };

  // Days that had at least one bani completed
  const completedDates = Array.from(new Set(logs.filter(l => l.completed.length > 0).map(l => l.date))).sort().reverse();
  const totalDays = completedDates.length;

  if (completedDates.length === 0) return { current: 0, longest: 0, totalDays: 0 };

  const today = getTodayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  // Current streak
  let current = 0;
  const startDate = completedDates[0] === today || completedDates[0] === yesterdayKey ? completedDates[0] : null;
  if (startDate) {
    for (let i = 0; i < completedDates.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - (startDate === today ? i : i + 1));
      const expectedKey = expected.toISOString().split('T')[0];
      if (completedDates[i] === expectedKey) {
        current++;
      } else {
        break;
      }
    }
  }

  // Longest streak
  let longest = 0;
  const sortedAsc = [...completedDates].sort();
  let streak = 1;
  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1]);
    const curr = new Date(sortedAsc[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      longest = Math.max(longest, streak);
      streak = 1;
    }
  }
  longest = Math.max(longest, streak, current);

  return { current, longest, totalDays };
}

// Required daily banis (5 Amritvela + Rehras + Kirtan Sohila)
const REQUIRED_DAILY = ['japji', 'jaap', 'tav-prasad-savaiye', 'chaupai', 'anand', 'rehras', 'kirtan-sohila'];

interface NitnemStreakTrackerProps {
  language: Language;
  onMarkComplete?: (baniId: string) => void;
}

export function NitnemStreakTracker({ language, onMarkComplete }: NitnemStreakTrackerProps) {
  const [streakData, setStreakData] = useState<StreakData>(loadStreak);
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  const todayLog = useMemo(() => {
    const today = getTodayKey();
    return streakData.logs.find(l => l.date === today) || { date: today, completed: [] };
  }, [streakData]);

  const completedToday = todayLog.completed.length;
  const requiredCount = REQUIRED_DAILY.length;
  const progressPercent = Math.min(100, Math.round((completedToday / requiredCount) * 100));

  // Heatmap for last 30 days
  const last30Days = useMemo(() => {
    const days: { date: string; count: number; isToday: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const log = streakData.logs.find(l => l.date === key);
      days.push({
        date: key,
        count: log ? log.completed.length : 0,
        isToday: i === 0,
      });
    }
    return days;
  }, [streakData]);

  const stats = useMemo(() => calculateStreak(streakData.logs), [streakData]);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-neutral-800 dark:to-amber-950/30 rounded-2xl p-5 md:p-6 border border-amber-200 dark:border-amber-800/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={cn('text-lg font-bold text-amber-900 dark:text-amber-200', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
          {isPunjabi ? '🔥 ਨਿਤਨੇਮ ਲੜੀ' : isHindi ? '🔥 नितनेम लड़ी' : '🔥 Nitnem Streak'}
        </h2>
        <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/40 px-3 py-1 rounded-full">
          <span className="text-lg">🔥</span>
          <span className="font-bold text-amber-800 dark:text-amber-300">{stats.current}</span>
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}
          </span>
        </div>
      </div>

      {/* Today's Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className={cn('text-amber-700 dark:text-amber-400', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi ? 'ਅੱਜ ਦੀ ਪ੍ਰਗਤੀ' : isHindi ? 'आज की प्रगति' : "Today's Progress"}
          </span>
          <span className="font-mono text-amber-800 dark:text-amber-300">{completedToday}/{requiredCount}</span>
        </div>
        <div className="h-3 bg-amber-100 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              progressPercent === 100
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : 'bg-gradient-to-r from-amber-400 to-orange-500'
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {progressPercent === 100 && (
          <p className={cn('text-sm text-green-600 dark:text-green-400 mt-1.5 text-center font-medium', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi ? '✅ ਅੱਜ ਦੇ ਸਾਰੇ ਨਿਤਨੇਮ ਪੂਰੇ!' : isHindi ? '✅ आज के सारे नितनेम पूरे!' : '✅ All daily Nitnem complete!'}
          </p>
        )}
      </div>

      {/* Bani Checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-5">
        {REQUIRED_DAILY.map((baniId) => {
          const done = todayLog.completed.includes(baniId);
          const baniLabel = BANI_LABELS[baniId];
          return (
            <button
              key={baniId}
              onClick={() => {
                if (!done) {
                  const today = getTodayKey();
                  const newLogs = [...streakData.logs];
                  const idx = newLogs.findIndex(l => l.date === today);
                  if (idx >= 0) {
                    newLogs[idx] = { ...newLogs[idx], completed: [...newLogs[idx].completed, baniId] };
                  } else {
                    newLogs.push({ date: today, completed: [baniId] });
                  }
                  const newStats = calculateStreak(newLogs);
                  const newData: StreakData = {
                    logs: newLogs,
                    currentStreak: newStats.current,
                    longestStreak: newStats.longest,
                    totalDaysCompleted: newStats.totalDays,
                  };
                  setStreakData(newData);
                  saveStreak(newData);
                  onMarkComplete?.(baniId);
                }
              }}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs transition-all min-h-[40px]',
                done
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
              )}
            >
              <span>{done ? '✅' : '⬜'}</span>
              <span className={cn('truncate', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                {isPunjabi ? baniLabel.pa : isHindi ? (baniLabel.hi || baniLabel.en) : baniLabel.en}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center bg-white dark:bg-neutral-800 rounded-xl p-3 border border-amber-100 dark:border-neutral-700">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.current}</p>
          <p className={cn('text-xs text-neutral-600 dark:text-neutral-400', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi ? 'ਮੌਜੂਦਾ ਲੜੀ' : isHindi ? 'वर्तमान लड़ी' : 'Current'}
          </p>
        </div>
        <div className="text-center bg-white dark:bg-neutral-800 rounded-xl p-3 border border-amber-100 dark:border-neutral-700">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.longest}</p>
          <p className={cn('text-xs text-neutral-600 dark:text-neutral-400', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi ? 'ਸਭ ਤੋਂ ਲੰਬੀ' : isHindi ? 'सबसे लंबी' : 'Longest'}
          </p>
        </div>
        <div className="text-center bg-white dark:bg-neutral-800 rounded-xl p-3 border border-amber-100 dark:border-neutral-700">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalDays}</p>
          <p className={cn('text-xs text-neutral-600 dark:text-neutral-400', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi ? 'ਕੁੱਲ ਦਿਨ' : isHindi ? 'कुल दिन' : 'Total Days'}
          </p>
        </div>
      </div>

      {/* 30-Day Heatmap */}
      <div>
        <h3 className={cn('text-sm font-medium text-amber-800 dark:text-amber-300 mb-2', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
          {isPunjabi ? 'ਪਿਛਲੇ 30 ਦਿਨ' : isHindi ? 'पिछले 30 दिन' : 'Last 30 Days'}
        </h3>
        <div className="flex gap-[3px] flex-wrap">
          {last30Days.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} banis`}
              className={cn(
                'w-[18px] h-[18px] sm:w-5 sm:h-5 rounded-sm transition-colors',
                day.isToday && 'ring-1 ring-amber-500',
                day.count === 0 && 'bg-neutral-200 dark:bg-neutral-700',
                day.count >= 1 && day.count <= 2 && 'bg-amber-300 dark:bg-amber-800',
                day.count >= 3 && day.count <= 4 && 'bg-amber-400 dark:bg-amber-700',
                day.count >= 5 && day.count <= 6 && 'bg-orange-400 dark:bg-orange-700',
                day.count >= 7 && 'bg-green-500 dark:bg-green-600',
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-500 dark:text-neutral-500">
          <span>{isPunjabi ? 'ਘੱਟ' : isHindi ? 'कम' : 'Less'}</span>
          <div className="w-3 h-3 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
          <div className="w-3 h-3 rounded-sm bg-amber-300 dark:bg-amber-800" />
          <div className="w-3 h-3 rounded-sm bg-amber-400 dark:bg-amber-700" />
          <div className="w-3 h-3 rounded-sm bg-orange-400 dark:bg-orange-700" />
          <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
          <span>{isPunjabi ? 'ਵੱਧ' : isHindi ? 'ज़्यादा' : 'More'}</span>
        </div>
      </div>
    </div>
  );
}

// Also export a compact badge version for use in nav/header
export function NitnemStreakBadge({ language }: { language: Language }) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const data = loadStreak();
    const stats = calculateStreak(data.logs);
    setStreak(stats.current);
  }, []);

  if (streak === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
      🔥 {streak} {language === 'pa' ? 'ਦਿਨ' : language === 'hi' ? 'दिन' : 'days'}
    </span>
  );
}

// Auto-complete bani when user finishes reading (to be called from Nitnem page)
export function markBaniComplete(baniId: string) {
  const data = loadStreak();
  const today = getTodayKey();
  const idx = data.logs.findIndex(l => l.date === today);
  if (idx >= 0) {
    if (!data.logs[idx].completed.includes(baniId)) {
      data.logs[idx].completed.push(baniId);
    }
  } else {
    data.logs.push({ date: today, completed: [baniId] });
  }
  const stats = calculateStreak(data.logs);
  data.currentStreak = stats.current;
  data.longestStreak = stats.longest;
  data.totalDaysCompleted = stats.totalDays;
  saveStreak(data);
}

const BANI_LABELS: Record<string, { pa: string; en: string; hi: string }> = {
  'japji': { pa: 'ਜਪੁਜੀ', en: 'Japji', hi: 'जपुजी' },
  'jaap': { pa: 'ਜਾਪ', en: 'Jaap', hi: 'जाप' },
  'tav-prasad-savaiye': { pa: 'ਸਵੱਯੇ', en: 'Savaiye', hi: 'सवैये' },
  'chaupai': { pa: 'ਚੌਪਈ', en: 'Chaupai', hi: 'चौपई' },
  'anand': { pa: 'ਅਨੰਦ', en: 'Anand', hi: 'आनंद' },
  'rehras': { pa: 'ਰਹਿਰਾਸ', en: 'Rehras', hi: 'रहिरास' },
  'kirtan-sohila': { pa: 'ਸੋਹਿਲਾ', en: 'Sohila', hi: 'सोहिला' },
};
