'use client';

// ============================================================================
// SCROLL TO TOP & READING PROGRESS COMPONENTS
// ============================================================================
// Enhances navigation with scroll utilities
// Shows reading progress for Gurbani sections
// ============================================================================

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Scroll to top button
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'w-12 h-12 rounded-full',
        'bg-gradient-to-br from-kesri-500 to-kesri-600',
        'text-white shadow-lg',
        'flex items-center justify-center',
        'hover:from-kesri-600 hover:to-kesri-700',
        'transform hover:scale-110 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-kesri-400 focus:ring-offset-2'
      )}
      aria-label="Scroll to top"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}

// Reading progress bar for Gurbani
export function ReadingProgress({ color = 'kesri' }: { color?: 'kesri' | 'neela' }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', calculateProgress, { passive: true });
    calculateProgress();
    return () => window.removeEventListener('scroll', calculateProgress);
  }, []);

  const colorClasses = {
    kesri: 'from-kesri-400 via-kesri-500 to-kesri-600',
    neela: 'from-neela-400 via-neela-500 to-neela-600',
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-neutral-200/50">
      <div
        className={cn(
          'h-full bg-gradient-to-r transition-all duration-150',
          colorClasses[color]
        )}
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />
    </div>
  );
}

// Keyboard shortcuts helper
interface KeyboardShortcut {
  key: string;
  description: { pa: string; en: string };
  action: () => void;
  ctrlKey?: boolean;
  shiftKey?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!e.ctrlKey === !!shortcut.ctrlKey &&
          !!e.shiftKey === !!shortcut.shiftKey
        ) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Keyboard shortcuts modal
interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
  language?: 'pa' | 'en';
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  shortcuts,
  language = 'pa',
}: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn(
            'text-lg font-semibold text-gray-900',
            language === 'pa' && 'font-gurmukhi'
          )}>
            {language === 'pa' ? '⌨️ ਕੀਬੋਰਡ ਸ਼ਾਰਟਕੱਟ' : '⌨️ Keyboard Shortcuts'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className={cn(
                'text-gray-700',
                language === 'pa' && 'font-gurmukhi'
              )}>
                {language === 'pa' ? shortcut.description.pa : shortcut.description.en}
              </span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-600">
                {shortcut.ctrlKey && 'Ctrl + '}
                {shortcut.shiftKey && 'Shift + '}
                {shortcut.key.toUpperCase()}
              </kbd>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          {language === 'pa' ? 'ਬੰਦ ਕਰਨ ਲਈ Esc ਦਬਾਓ' : 'Press Esc to close'}
        </p>
      </div>
    </div>
  );
}
