'use client';

/**
 * Service Worker Registration & Offline Indicator
 * ============================================================================
 * - Registers the service worker on mount
 * - Shows offline/online status indicator
 * - Shows update notification when new version is available
 * - Pre-caches Nitnem Banis for offline use on first visit
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { registerServiceWorker, useOfflineStatus } from '@/lib/service-worker';
import { NITNEM_BANIS_CONFIG } from '@/lib/constants/raag-ranges';
import { fetchBani } from '@/lib/api/banidb-client';

export function ServiceWorkerRegistrar() {
  const isOffline = useOfflineStatus();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [precacheStatus, setPrecacheStatus] = useState<string | null>(null);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Listen for update events
    const handleUpdate = () => setUpdateAvailable(true);
    window.addEventListener('sw-update-available', handleUpdate);

    // Pre-cache Nitnem Banis in background on first visit
    const hasPreCached = localStorage.getItem('sikhi-nitnem-precached');
    if (!hasPreCached) {
      precacheNitnemBanisViaIndexedDB();
    }

    return () => {
      window.removeEventListener('sw-update-available', handleUpdate);
    };
  }, []);

  // Show offline banner with slight delay to avoid flash
  useEffect(() => {
    if (isOffline) {
      const timer = setTimeout(() => setShowOfflineBanner(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowOfflineBanner(false);
    }
  }, [isOffline]);

  async function precacheNitnemBanisViaIndexedDB() {
    try {
      setPrecacheStatus('ਬਾਣੀਆਂ ਡਾਊਨਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...');
      
      // Fetch and cache each Bani via the enhanced fetchBani (auto-saves to IndexedDB)
      for (const bani of NITNEM_BANIS_CONFIG) {
        try {
          await fetchBani(bani.baniId);
        } catch {
          // Continue with other Banis even if one fails
        }
      }
      
      localStorage.setItem('sikhi-nitnem-precached', 'true');
      setPrecacheStatus(null);
    } catch {
      setPrecacheStatus(null);
    }
  }

  function handleRefresh() {
    window.location.reload();
  }

  return (
    <>
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white text-center py-2 px-4 text-sm font-gurmukhi shadow-lg animate-slide-down">
          <span>📡 ਆਫ਼ਲਾਈਨ ਮੋਡ — ਸੇਵ ਕੀਤੀ ਸਮੱਗਰੀ ਉਪਲਬਧ ਹੈ</span>
          <span className="ml-2 text-amber-200 font-sans text-xs">Offline Mode — Cached content available</span>
        </div>
      )}

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[100] bg-neela-700 text-white rounded-xl p-4 shadow-2xl">
          <p className="font-medium font-gurmukhi">ਨਵਾਂ ਅੱਪਡੇਟ ਉਪਲਬਧ ਹੈ</p>
          <p className="text-sm text-blue-200 mt-1">A new version is available</p>
          <div className="flex gap-2 mt-3">
            <button 
              onClick={handleRefresh}
              className="px-4 py-1.5 bg-white text-neela-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Refresh
            </button>
            <button 
              onClick={() => setUpdateAvailable(false)}
              className="px-4 py-1.5 text-blue-200 hover:text-white text-sm transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Pre-cache Status (subtle) */}
      {precacheStatus && (
        <div className="fixed bottom-4 right-4 z-[90] bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-lg px-3 py-2 text-xs shadow-md font-gurmukhi">
          {precacheStatus}
        </div>
      )}
    </>
  );
}
