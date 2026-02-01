// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
// Helper functions used throughout the application
// ============================================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Language } from '@/types';

/**
 * Normalize language code for display (pa-roman -> pa)
 */
function normalizeLanguage(lang: Language): 'pa' | 'en' | 'hi' {
  if (lang === 'pa-roman') return 'pa';
  return lang;
}

/**
 * Merge Tailwind CSS classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a year with appropriate suffix for approximation
 */
export function formatYear(
  year: number,
  isApproximate?: boolean,
  language: Language = 'en'
): string {
  const lang = normalizeLanguage(language);
  if (lang === 'pa') {
    return isApproximate ? `ਲਗਭਗ ${year}` : `${year}`;
  }
  if (lang === 'hi') {
    return isApproximate ? `लगभग ${year}` : `${year}`;
  }
  return isApproximate ? `c. ${year}` : `${year}`;
}

/**
 * Format a year range
 */
export function formatYearRange(
  startYear: number,
  endYear?: number,
  isOngoing?: boolean,
  language: Language = 'en'
): string {
  const lang = normalizeLanguage(language);
  if (isOngoing) {
    if (lang === 'pa') return `${startYear} - ਮੌਜੂਦਾ`;
    if (lang === 'hi') return `${startYear} - वर्तमान`;
    return `${startYear} - Present`;
  }
  
  if (endYear) {
    return `${startYear} - ${endYear}`;
  }
  
  return `${startYear}`;
}

/**
 * Format date precision indicator
 */
export function formatDatePrecision(
  precision: 'exact' | 'year' | 'approximate' | 'disputed',
  language: Language = 'en'
): string {
  const lang = normalizeLanguage(language);
  const labels = {
    exact: { pa: 'ਪੱਕੀ ਮਿਤੀ', en: 'Exact date', hi: 'सटीक तिथि' },
    year: { pa: 'ਸਾਲ', en: 'Year', hi: 'वर्ष' },
    approximate: { pa: 'ਅੰਦਾਜ਼ਨ', en: 'Approximate', hi: 'अनुमानित' },
    disputed: { pa: 'ਵਿਵਾਦਿਤ', en: 'Disputed', hi: 'विवादित' },
  };
  
  return labels[precision][lang];
}

/**
 * Convert Ang (page) number to display format
 */
export function formatAng(angNumber: number): string {
  return `ਅੰਗ ${angNumber}`;
}

/**
 * Get Gurmukhi numeral
 */
export function toGurmukhiNumeral(num: number): string {
  const gurmukhiDigits = ['੦', '੧', '੨', '੩', '੪', '੫', '੬', '੭', '੮', '੯'];
  return num.toString().split('').map(d => gurmukhiDigits[parseInt(d)] || d).join('');
}

/**
 * Convert Gurmukhi numeral to Arabic number
 * Supports both Gurmukhi (੧੨੩) and English (123) numerals
 */
export function fromGurmukhiNumeral(str: string): number | null {
  const gurmukhiToArabic: Record<string, string> = {
    '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4',
    '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9',
  };
  
  // Convert each character
  const converted = str.split('').map(char => {
    if (gurmukhiToArabic[char]) return gurmukhiToArabic[char];
    if (/[0-9]/.test(char)) return char;
    return '';
  }).join('');
  
  if (!converted) return null;
  const num = parseInt(converted, 10);
  return isNaN(num) ? null : num;
}

/**
 * Check if a string contains Gurmukhi numerals
 */
export function hasGurmukhiNumerals(str: string): boolean {
  return /[੦-੯]/.test(str);
}

/**
 * Sanitize text for display (prevent XSS but preserve Gurmukhi)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Truncate text with ellipsis, respecting word boundaries
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.slice(0, lastSpace) + '…'
    : truncated + '…';
}

/**
 * Generate breadcrumb path for timeline navigation
 */
export function generateTimelineBreadcrumbs(
  era?: { id: string; name: { pa: string; en: string } },
  period?: { id: string; name: { pa: string; en: string } },
  event?: { id: string; title: { pa: string; en: string } }
) {
  const crumbs = [];
  
  if (era) {
    crumbs.push({ id: era.id, label: era.name, type: 'era' });
  }
  if (period) {
    crumbs.push({ id: period.id, label: period.name, type: 'period' });
  }
  if (event) {
    crumbs.push({ id: event.id, label: event.title, type: 'event' });
  }
  
  return crumbs;
}

/**
 * Check if content should trigger scholarly review
 */
export function requiresScholarlyReview(
  isNewContent: boolean,
  isContemporary: boolean,
  hasConflictingSources: boolean
): boolean {
  return isNewContent || isContemporary || hasConflictingSources;
}

/**
 * Generate contemporary content warning
 */
export function getContemporaryWarning(language: 'pa' | 'en' | 'hi' = 'en'): string {
  const warnings = {
    pa: 'ਇਹ ਸਮਕਾਲੀ ਇਤਿਹਾਸ ਹੈ ਜੋ ਵਿਕਸਿਤ ਹੋ ਰਿਹਾ ਹੈ। ਜਾਣਕਾਰੀ ਨਵੇਂ ਤੱਥਾਂ ਦੇ ਸਾਹਮਣੇ ਆਉਣ ਨਾਲ ਬਦਲ ਸਕਦੀ ਹੈ।',
    en: 'This is contemporary, evolving history. Information may be subject to revision as new facts emerge.',
    hi: 'यह समकालीन, विकसित होता इतिहास है। नए तथ्यों के सामने आने पर जानकारी में बदलाव हो सकता है।',
  };
  
  return warnings[language];
}

/**
 * Get interpretation disclaimer
 */
export function getInterpretationDisclaimer(
  sourceName: string,
  language: 'pa' | 'en' | 'hi' = 'en'
): string {
  if (language === 'pa') {
    return `ਅਰਥ ${sourceName} ਅਨੁਸਾਰ`;
  }
  if (language === 'hi') {
    return `${sourceName} के अनुसार अर्थ`;
  }
  return `Meaning/interpretation based on ${sourceName}`;
}
