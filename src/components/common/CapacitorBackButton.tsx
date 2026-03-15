'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Handles Android hardware back button in Capacitor.
 * - On sub-pages: navigates back to home
 * - On home page: shows exit confirmation dialog
 */
export function CapacitorBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const pathnameRef = useRef(pathname);
  const appRef = useRef<typeof import('@capacitor/app').App | null>(null);

  // Keep pathname ref in sync
  pathnameRef.current = pathname;

  // Register the back button listener once on mount
  useEffect(() => {
    let removed = false;
    let listenerHandle: { remove: () => Promise<void> } | null = null;

    (async () => {
      try {
        const { App } = await import('@capacitor/app');
        appRef.current = App;

        if (removed) return;

        listenerHandle = await App.addListener('backButton', ({ canGoBack }) => {
          if (pathnameRef.current === '/') {
            setShowExitDialog(true);
            return;
          }

          if (canGoBack) {
            window.history.back();
          } else {
            router.push('/');
          }
        });
      } catch {
        // Not running in Capacitor — no-op
      }
    })();

    return () => {
      removed = true;
      listenerHandle?.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExit = () => {
    appRef.current?.exitApp();
  };

  if (!showExitDialog) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onClick={() => setShowExitDialog(false)}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '320px',
          width: '85%',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🙏</div>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: '#1E3A8A',
          }}
        >
          ਕੀ ਤੁਸੀਂ ਬਾਹਰ ਜਾਣਾ ਚਾਹੁੰਦੇ ਹੋ?
        </h3>
        <p
          style={{
            margin: '0 0 20px 0',
            fontSize: '14px',
            color: '#555',
          }}
        >
          Do you want to exit the app?
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => setShowExitDialog(false)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: '2px solid #1E3A8A',
              backgroundColor: 'transparent',
              color: '#1E3A8A',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            No
          </button>
          <button
            onClick={handleExit}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#1E3A8A',
              color: 'white',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
