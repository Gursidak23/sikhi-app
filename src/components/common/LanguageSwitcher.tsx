'use client';

// ============================================================================
// LANGUAGE SWITCHER COMPONENT
// ============================================================================
// Allows switching between supported languages
// Punjabi (Gurmukhi) is always primary and default
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  availableLanguages?: Language[];
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LANGUAGE_INFO: Record<Language, { name: string; nativeName: string; shortName: string; isPrimary: boolean }> = {
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', shortName: 'ਪੰ', isPrimary: true },
  'pa-roman': { name: 'Punjabi (Roman)', nativeName: 'Punjabi', shortName: 'PA', isPrimary: false },
  en: { name: 'English', nativeName: 'English', shortName: 'EN', isPrimary: false },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', shortName: 'हि', isPrimary: false },
};

export function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
  availableLanguages = ['pa', 'en', 'hi'],
  showLabels = true,
  size = 'md',
  className,
}: LanguageSwitcherProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <nav
      className={cn('hidden sm:flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1', className)}
      role="navigation"
      aria-label="Language selection"
    >
      {availableLanguages.map((lang) => {
        const info = LANGUAGE_INFO[lang];
        const isActive = currentLanguage === lang;
        
        return (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={cn(
              'rounded-md font-medium transition-colors',
              sizeClasses[size],
              isActive
                ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200',
              info.isPrimary && !isActive && 'text-neela-700 dark:text-neela-400',
              lang === 'pa' && 'font-gurmukhi'
            )}
            aria-current={isActive ? 'true' : undefined}
            title={info.name}
          >
            {showLabels ? info.nativeName : lang.toUpperCase()}
            {info.isPrimary && (
              <span className="sr-only"> (Primary/Authoritative)</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// Mobile dropdown version for small screens
export function LanguageSwitcherMobile({
  currentLanguage,
  onLanguageChange,
  availableLanguages = ['pa', 'en', 'hi'],
  className,
}: Omit<LanguageSwitcherProps, 'showLabels' | 'size'>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentInfo = LANGUAGE_INFO[currentLanguage];

  return (
    <div ref={dropdownRef} className={cn('relative sm:hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className={currentLanguage === 'pa' ? 'font-gurmukhi' : ''}>
          {currentInfo.shortName}
        </span>
        <svg className={cn('w-3.5 h-3.5 transition-transform', isOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
          {availableLanguages.map((lang) => {
            const info = LANGUAGE_INFO[lang];
            const isActive = currentLanguage === lang;
            
            return (
              <button
                key={lang}
                onClick={() => {
                  onLanguageChange(lang);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700',
                  lang === 'pa' && 'font-gurmukhi'
                )}
              >
                {info.nativeName}
                {isActive && (
                  <svg className="inline-block w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Compact version for tight spaces
export function LanguageSwitcherCompact({
  currentLanguage,
  onLanguageChange,
  className,
}: Omit<LanguageSwitcherProps, 'showLabels' | 'size'>) {
  return (
    <LanguageSwitcher
      currentLanguage={currentLanguage}
      onLanguageChange={onLanguageChange}
      showLabels={false}
      size="sm"
      className={className}
    />
  );
}
