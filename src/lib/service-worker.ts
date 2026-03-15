'use client';

// ============================================================================
// SERVICE WORKER REGISTRATION
// ============================================================================
// Register service worker for offline support
// ============================================================================

import { useState, useEffect } from 'react';

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  // Register in production or when explicitly enabled
  const enableOffline = process.env.NEXT_PUBLIC_ENABLE_OFFLINE === 'true';
  if (process.env.NODE_ENV !== 'production' && !enableOffline) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      console.log('SW registered:', registration.scope);

      // Check for updates periodically
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available — dispatch custom event for UI notification
              window.dispatchEvent(new CustomEvent('sw-update-available'));
              console.log('New content available; please refresh.');
            }
          });
        }
      });
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });
}

export function unregisterServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.unregister();
  });
}

// Cache a specific Ang for offline access
export function cacheAng(angNumber: number): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      type: 'CACHE_ANG',
      angNumber,
    });
  });
}

// Clear all caches
export function clearCache(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      type: 'CLEAR_CACHE',
    });
  });
}

// Check if currently offline
export function isOffline(): boolean {
  if (typeof window === 'undefined') return false;
  return !navigator.onLine;
}

// Hook for offline status
export function useOfflineStatus(): boolean {
  if (typeof window === 'undefined') return false;
  
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return offline;
}

// Pre-cache all Nitnem Banis for offline use
export function precacheNitnemBanis(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  const baniIds = [2, 4, 6, 9, 10, 21, 23, 31, 90]; // All Nitnem Bani IDs
  
  navigator.serviceWorker.ready.then((registration) => {
    baniIds.forEach(id => {
      registration.active?.postMessage({
        type: 'CACHE_BANI',
        baniId: id,
      });
    });
  });
}
