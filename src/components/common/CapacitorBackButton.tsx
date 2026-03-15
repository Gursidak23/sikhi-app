'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Handles Android hardware back button in Capacitor.
 * - On sub-pages: navigates back to home
 * - On home page: exits the app
 */
export function CapacitorBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function setup() {
      try {
        const { App } = await import('@capacitor/app');
        const listener = await App.addListener('backButton', ({ canGoBack }) => {
          // If on home page, exit the app
          if (pathname === '/') {
            App.exitApp();
            return;
          }

          // If browser history exists, go back
          if (canGoBack) {
            window.history.back();
          } else {
            // No history — navigate to home
            router.push('/');
          }
        });

        cleanup = () => {
          listener.remove();
        };
      } catch {
        // Not running in Capacitor — no-op
      }
    }

    setup();

    return () => {
      cleanup?.();
    };
  }, [pathname, router]);

  return null;
}
