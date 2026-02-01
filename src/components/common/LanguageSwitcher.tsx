'use client';

// ============================================================================
// LANGUAGE SWITCHER COMPONENT
// ============================================================================
// Allows switching between supported languages
// Punjabi (Gurmukhi) is always primary and default
// ============================================================================

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

const LANGUAGE_INFO: Record<Language, { name: string; nativeName: string; isPrimary: boolean }> = {
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', isPrimary: true },
  'pa-roman': { name: 'Punjabi (Roman)', nativeName: 'Punjabi', isPrimary: false },
  en: { name: 'English', nativeName: 'English', isPrimary: false },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', isPrimary: false },
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
      className={cn('flex bg-neutral-100 rounded-lg p-1', className)}
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
                ? 'bg-white shadow-sm text-neutral-900'
                : 'text-neutral-600 hover:text-neutral-900',
              info.isPrimary && !isActive && 'text-neela-700',
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
