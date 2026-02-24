'use client';

/**
 * Waheguru Simran Counter — Mala Counter
 * ============================================================================
 * Digital mala (rosary) for counting Waheguru Simran/Naam Jaap.
 * Features:
 * - Tap/click to count
 * - Haptic feedback on mobile
 * - Tracks daily, weekly, and all-time counts
 * - Persists to localStorage
 * - Beautiful Sikh-themed UI
 * ============================================================================
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SimranStats {
  today: number;
  todayDate: string;
  allTime: number;
  streak: number;
  lastDate: string;
}

function getDefaultStats(): SimranStats {
  const today = new Date().toISOString().split('T')[0];
  return {
    today: 0,
    todayDate: today,
    allTime: 0,
    streak: 0,
    lastDate: '',
  };
}

function loadStats(): SimranStats {
  if (typeof window === 'undefined') return getDefaultStats();
  try {
    const stored = localStorage.getItem('sikhi-simran-stats');
    if (!stored) return getDefaultStats();
    
    const stats: SimranStats = JSON.parse(stored);
    const today = new Date().toISOString().split('T')[0];
    
    // Reset today count if it's a new day
    if (stats.todayDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      stats.streak = stats.lastDate === yesterday ? stats.streak : 0;
      stats.today = 0;
      stats.todayDate = today;
    }
    
    return stats;
  } catch {
    return getDefaultStats();
  }
}

function saveStats(stats: SimranStats): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sikhi-simran-stats', JSON.stringify(stats));
}

export function WaheguruSimran({ language = 'pa' }: { language?: string }) {
  const [stats, setStats] = useState<SimranStats>(getDefaultStats);
  const [isActive, setIsActive] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setStats(loadStats());
    setMounted(true);
  }, []);

  const handleCount = useCallback(() => {
    setStats(prev => {
      const today = new Date().toISOString().split('T')[0];
      const newStats: SimranStats = {
        today: prev.today + 1,
        todayDate: today,
        allTime: prev.allTime + 1,
        streak: prev.todayDate === today ? prev.streak : prev.streak + 1,
        lastDate: today,
      };
      
      // Mark streak on first count of the day
      if (prev.today === 0) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        newStats.streak = prev.lastDate === yesterday ? prev.streak + 1 : 1;
      }
      
      saveStats(newStats);
      return newStats;
    });

    // Visual ripple effect
    setRipple(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setRipple(false), 300);

    // Haptic feedback on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, []);

  const handleReset = () => {
    if (confirm(isPunjabi ? 'ਅੱਜ ਦੀ ਗਿਣਤੀ ਮਿਟਾਉਣੀ ਹੈ?' : isHindi ? 'आज की गिनती मिटानी है?' : 'Reset today\'s count?')) {
      setStats(prev => {
        const newStats = { ...prev, today: 0 };
        saveStats(newStats);
        return newStats;
      });
    }
  };

  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  // Complete a mala (108 beads)
  const malasCompleted = Math.floor(stats.today / 108);
  const beadsInCurrentMala = stats.today % 108;

  if (!mounted) return null;

  return (
    <div className="max-w-md mx-auto">
      {/* Main Counter Button */}
      <div className="text-center">
        <button
          onClick={handleCount}
          onTouchStart={() => setIsActive(true)}
          onTouchEnd={() => setIsActive(false)}
          onMouseDown={() => setIsActive(true)}
          onMouseUp={() => setIsActive(false)}
          className={cn(
            'relative w-48 h-48 sm:w-56 sm:h-56 rounded-full mx-auto',
            'bg-gradient-to-br from-neela-600 via-neela-700 to-neela-800',
            'shadow-2xl transition-all duration-150',
            'flex flex-col items-center justify-center',
            'focus:outline-none focus:ring-4 focus:ring-neela-400/50',
            'select-none touch-manipulation',
            isActive && 'scale-95 shadow-lg',
            ripple && 'ring-4 ring-amber-400/60',
          )}
          aria-label={isPunjabi ? 'ਵਾਹਿਗੁਰੂ ਦਾ ਸਿਮਰਨ ਕਰੋ' : isHindi ? 'वाहेगुरू का सिमरन करें' : 'Count Waheguru'}
        >
          {/* Ripple effect */}
          {ripple && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          )}
          
          {/* Ik Onkar */}
          <span className="text-amber-300 text-4xl mb-1 font-gurmukhi">ੴ</span>
          
          {/* Count */}
          <span className="text-white text-5xl sm:text-6xl font-bold tabular-nums">
            {stats.today}
          </span>
          
          {/* Label */}
          <span className="text-blue-200 text-sm mt-1 font-gurmukhi">
            {isPunjabi ? 'ਵਾਹਿਗੁਰੂ' : isHindi ? 'वाहेगुरू' : 'Waheguru'}
          </span>
        </button>
      </div>

      {/* Mala Progress */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {malasCompleted}
            </p>
            <p className={cn('text-amber-600 dark:text-amber-500 text-xs', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi ? 'ਮਾਲਾ' : isHindi ? 'माला' : 'Malas'}
            </p>
          </div>
          
          <div className="w-px h-8 bg-amber-300 dark:bg-amber-700" />
          
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {beadsInCurrentMala}<span className="text-base text-amber-500">/108</span>
            </p>
            <p className={cn('text-amber-600 dark:text-amber-500 text-xs', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi ? 'ਮਣਕੇ' : isHindi ? 'मनके' : 'Beads'}
            </p>
          </div>
          
          <div className="w-px h-8 bg-amber-300 dark:bg-amber-700" />
          
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {stats.streak}
            </p>
            <p className={cn('text-amber-600 dark:text-amber-500 text-xs', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'Day Streak'}
            </p>
          </div>
        </div>

        {/* Mala Progress Bar */}
        <div className="mt-4 mx-auto max-w-xs">
          <div className="h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300"
              style={{ width: `${(beadsInCurrentMala / 108) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 flex justify-between items-center px-4">
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {isPunjabi ? 'ਕੁੱਲ' : isHindi ? 'कुल' : 'All Time'}
          </p>
          <p className="text-lg font-bold text-neutral-700 dark:text-neutral-300">
            {stats.allTime.toLocaleString()}
          </p>
        </div>
        
        <button
          onClick={handleReset}
          className="text-xs text-neutral-400 hover:text-red-500 transition-colors px-3 py-1 rounded"
        >
          {isPunjabi ? 'ਰੀਸੈੱਟ' : isHindi ? 'रीसेट' : 'Reset Today'}
        </button>
      </div>
    </div>
  );
}
