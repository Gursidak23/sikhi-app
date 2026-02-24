'use client';

// ============================================================================
// GLOBAL LANGUAGE PROVIDER
// ============================================================================
// Shares language state across all pages and components.
// Persists selection in localStorage so it survives navigation + refresh.
// ============================================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Language } from '@/types';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** True while the provider is hydrating from localStorage */
  isHydrating: boolean;
  /** Shorthand: true when language is 'pa' */
  isPunjabi: boolean;
  /** Shorthand: true when language is 'hi' */
  isHindi: boolean;
  /** Resolve a { pa, en, hi } translation record to the current language */
  t: (translations: { pa: string; en: string; hi?: string }) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'sikhi-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pa');
  const [isHydrating, setIsHydrating] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['pa', 'pa-roman', 'en', 'hi'].includes(stored)) {
        setLanguageState(stored as Language);
      }
    } catch {
      // localStorage unavailable — stay with default
    }
    setIsHydrating(false);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore write failures (private browsing, quota, etc.)
    }
  }, []);

  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  const t = useCallback(
    (translations: { pa: string; en: string; hi?: string }) => {
      if (language === 'pa' || language === 'pa-roman') return translations.pa;
      if (language === 'hi') return translations.hi ?? translations.en;
      return translations.en;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isHydrating, isPunjabi, isHindi, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access the global language state.
 * Must be used within a <LanguageProvider>.
 */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a <LanguageProvider>');
  }
  return ctx;
}
