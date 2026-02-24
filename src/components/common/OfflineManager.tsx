'use client';

/**
 * Offline Manager — Download & Manage Offline Content
 * ============================================================================
 * Lets users:
 * - See what's cached for offline use
 * - Download Ang ranges for offline reading
 * - Clear cached data
 * - View cache statistics
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getOfflineStats, clearAllOfflineData, getCachedAngCount, getAllCachedBaniIds } from '@/lib/offline/indexeddb';
import { fetchAng } from '@/lib/api/banidb-client';

interface OfflineStats {
  angsCached: number;
  banisCached: number;
  hasHukamnama: boolean;
  estimatedSizeMB: number;
}

export function OfflineManager({ language = 'pa' }: { language?: string }) {
  const [stats, setStats] = useState<OfflineStats | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [mounted, setMounted] = useState(false);

  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  useEffect(() => {
    setMounted(true);
    refreshStats();
  }, []);

  async function refreshStats() {
    const s = await getOfflineStats();
    setStats(s);
  }

  const downloadAngRange = useCallback(async (start: number, end: number) => {
    setDownloading(true);
    const total = end - start + 1;
    setProgress({ current: 0, total });

    try {
      for (let ang = start; ang <= end; ang++) {
        try {
          await fetchAng(ang); // This automatically saves to IndexedDB
        } catch {
          // Continue even if one Ang fails
        }
        setProgress(prev => ({ ...prev, current: ang - start + 1 }));
        
        // Small delay to avoid overwhelming the API
        if ((ang - start) % 5 === 4) {
          await new Promise(r => setTimeout(r, 200));
        }
      }
    } finally {
      setDownloading(false);
      refreshStats();
    }
  }, []);

  const handleClearCache = async () => {
    const confirmMsg = isPunjabi 
      ? 'ਸਾਰਾ ਆਫ਼ਲਾਈਨ ਡਾਟਾ ਮਿਟਾਉਣਾ ਹੈ?' 
      : isHindi ? 'सारा ऑफ़लाइन डेटा मिटाना है?'
      : 'Clear all offline data?';
    
    if (confirm(confirmMsg)) {
      await clearAllOfflineData();
      refreshStats();
    }
  };

  if (!mounted) return null;

  const downloadPresets = [
    { label: isPunjabi ? 'ਜਪੁ ਜੀ ਸਾਹਿਬ (੧-੮)' : isHindi ? 'जपु जी साहिब (१-८)' : 'Japji Sahib (1-8)', start: 1, end: 8 },
    { label: isPunjabi ? 'ਸੁਖਮਨੀ ਸਾਹਿਬ (੨੬੨-੨੯੬)' : isHindi ? 'सुखमनी साहिब (२६२-२९६)' : 'Sukhmani Sahib (262-296)', start: 262, end: 296 },
    { label: isPunjabi ? 'ਸ੍ਰੀ ਰਾਗੁ (੧੪-੯੩)' : isHindi ? 'श्री रागु (१४-९३)' : 'Sri Raag (14-93)', start: 14, end: 93 },
    { label: isPunjabi ? 'ਸਾਰੇ ੧੪੩੦ ਅੰਗ' : isHindi ? 'सारे १४३० अंग' : 'All 1430 Angs', start: 1, end: 1430 },
  ];

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-amber-200 dark:border-amber-800 p-4 sm:p-6">
      <h3 className={cn('text-lg font-semibold text-amber-900 dark:text-amber-200 mb-4', isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : '')}>
        {isPunjabi ? '📱 ਆਫ਼ਲਾਈਨ ਸਮੱਗਰੀ' : isHindi ? '📱 ऑफ़लाइन सामग्री' : '📱 Offline Content'}
      </h3>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.angsCached}</p>
            <p className={cn('text-xs text-amber-600 dark:text-amber-500', isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : '')}>
              {isPunjabi ? 'ਅੰਗ ਸੇਵ' : isHindi ? 'अंग सेव' : 'Angs Saved'}
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-2xl font-bold text-neela-700 dark:text-blue-400">{stats.banisCached}</p>
            <p className={cn('text-xs text-neela-600 dark:text-blue-500', isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : '')}>
              {isPunjabi ? 'ਬਾਣੀਆਂ' : isHindi ? 'बाणियाँ' : 'Banis'}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.estimatedSizeMB}</p>
            <p className="text-xs text-green-600 dark:text-green-500">MB</p>
          </div>
        </div>
      )}

      {/* Download Progress */}
      {downloading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-amber-700 dark:text-amber-400 mb-1">
            <span className={isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : ''}>
              {isPunjabi ? 'ਡਾਊਨਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : isHindi ? 'डाउनलोड हो रहा है...' : 'Downloading...'}
            </span>
            <span>{progress.current}/{progress.total}</span>
          </div>
          <div className="h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neela-500 to-neela-600 rounded-full transition-all"
              style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Download Presets */}
      <div className="space-y-2">
        <p className={cn('text-sm font-medium text-neutral-600 dark:text-neutral-400', isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : '')}>
          {isPunjabi ? 'ਡਾਊਨਲੋਡ ਕਰੋ:' : isHindi ? 'डाउनलोड करें:' : 'Download for offline:'}
        </p>
        {downloadPresets.map((preset, i) => (
          <button
            key={i}
            onClick={() => downloadAngRange(preset.start, preset.end)}
            disabled={downloading}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
              'bg-neutral-50 dark:bg-neutral-700 hover:bg-amber-50 dark:hover:bg-amber-900/30',
              'text-neutral-700 dark:text-neutral-300',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : '',
            )}
          >
            ⬇️ {preset.label}
          </button>
        ))}
      </div>

      {/* Clear Cache */}
      {stats && stats.angsCached > 0 && (
        <button
          onClick={handleClearCache}
          className="mt-4 w-full text-center text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors py-2"
        >
          {isPunjabi ? '🗑️ ਸਾਰਾ ਆਫ਼ਲਾਈਨ ਡਾਟਾ ਮਿਟਾਓ' : isHindi ? '🗑️ सारा ऑफ़लाइन डेटा मिटाएँ' : '🗑️ Clear All Offline Data'}
        </button>
      )}
    </div>
  );
}
