'use client';

// ============================================================================
// MAIN NAVIGATION COMPONENT - SIKHI THEMED
// ============================================================================
// Beautiful Sikh-styled navigation with Kesri and Neela accents
// Gurbani and History are visually and structurally separated
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import type { Language } from '@/types';

interface MainNavigationProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function MainNavigation({
  currentLanguage,
  onLanguageChange,
}: MainNavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isGurbaniSection = pathname?.includes('/gurbani');
  const isItihaasSection = pathname?.includes('/itihaas');

  const navItems = [
    {
      href: '/gurbani',
      labelPa: 'ਗੁਰਬਾਣੀ',
      labelEn: 'Gurbani',
      labelHi: 'गुरबाणी',
      isSacred: true,
    },
    {
      href: '/itihaas',
      labelPa: 'ਇਤਿਹਾਸ',
      labelEn: 'History',
      labelHi: 'इतिहास',
      isSacred: false,
    },
    {
      href: '/about',
      labelPa: 'ਬਾਰੇ',
      labelEn: 'About',
      labelHi: 'के बारे में',
      isSacred: false,
    },
  ];

  const getLabel = (item: typeof navItems[0]) => {
    if (currentLanguage === 'pa') return item.labelPa;
    if (currentLanguage === 'hi') return item.labelHi;
    return item.labelEn;
  };

  return (
    <header className="sikhi-nav sticky top-0 z-50">
      <div className="container-content">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-gurmukhi font-bold text-xl">ੴ</span>
            </div>
            <div>
              <span className="font-gurmukhi text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                ਸਿੱਖੀ ਵਿੱਦਿਆ
              </span>
              {currentLanguage !== 'pa' && (
                <span className="block text-xs text-gray-500">
                  Sikhi Vidhya
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'sikhi-nav-link px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    currentLanguage === 'pa' && 'font-gurmukhi text-base',
                    isActive && 'active',
                    isActive && item.isSacred && 'bg-blue-50 text-blue-800',
                    isActive && !item.isSacred && !item.href.includes('about') && 'bg-orange-50 text-orange-800',
                    !isActive && 'hover:bg-gray-100'
                  )}
                >
                  {item.isSacred && (
                    <span className="mr-1.5 opacity-70">📖</span>
                  )}
                  {getLabel(item)}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher & Mobile Menu */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              size="sm"
            />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-amber-200/50">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors',
                      currentLanguage === 'pa' && 'font-gurmukhi text-lg',
                      isActive
                        ? item.isSacred
                          ? 'bg-blue-50 text-blue-800'
                          : 'bg-orange-50 text-orange-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {item.isSacred && <span>📖</span>}
                    {!item.isSacred && item.href.includes('itihaas') && <span>📜</span>}
                    {getLabel(item)}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>

      {/* Section Indicator Bar */}
      {(isGurbaniSection || isItihaasSection) && (
        <div
          className={cn(
            'h-1',
            isGurbaniSection 
              ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700' 
              : 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600'
          )}
          aria-hidden="true"
        />
      )}
    </header>
  );
}

// ============================================================================
// FOOTER COMPONENT - SIKHI THEMED
// ============================================================================

interface FooterProps {
  language?: Language;
}

export function Footer({ language = 'pa' }: FooterProps) {
  const isPunjabi = language === 'pa';
  
  return (
    <footer className="sikhi-footer py-12 mt-16">
      <div className="container-content">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600">
                <span className="text-white font-gurmukhi font-bold text-xl">ੴ</span>
              </div>
              <h3 className="font-gurmukhi text-xl text-white">
                ਸਿੱਖੀ ਵਿੱਦਿਆ
              </h3>
            </div>
            <p className={cn(
              'text-sm text-gray-400 leading-relaxed',
              isPunjabi && 'font-gurmukhi'
            )}>
              {isPunjabi
                ? 'ਸਿੱਖ ਇਤਿਹਾਸ ਅਤੇ ਗੁਰਬਾਣੀ ਦੀ ਸਿੱਖਿਆ ਲਈ ਪਵਿੱਤਰ ਪਲੇਟਫਾਰਮ।'
                : 'A sacred platform for Sikh learning, history documentation, and Gurbani study.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={cn(
              'text-sm font-medium text-white mb-4',
              isPunjabi && 'font-gurmukhi text-base'
            )}>
              {isPunjabi ? 'ਤੁਰੰਤ ਲਿੰਕ' : 'Quick Links'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/gurbani" className="text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-center gap-2">
                  <span>📖</span>
                  <span className={isPunjabi ? 'font-gurmukhi' : ''}>
                    {isPunjabi ? 'ਗੁਰਬਾਣੀ' : 'Gurbani'}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/itihaas" className="text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-center gap-2">
                  <span>📜</span>
                  <span className={isPunjabi ? 'font-gurmukhi' : ''}>
                    {isPunjabi ? 'ਇਤਿਹਾਸ' : 'History'}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-center gap-2">
                  <span>ℹ️</span>
                  <span className={isPunjabi ? 'font-gurmukhi' : ''}>
                    {isPunjabi ? 'ਬਾਰੇ' : 'About'}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className={cn(
              'text-sm font-medium text-white mb-4',
              isPunjabi && 'font-gurmukhi text-base'
            )}>
              {isPunjabi ? 'ਮਹੱਤਵਪੂਰਨ ਨੋਟ' : 'Important Note'}
            </h3>
            <p className={cn(
              'text-xs text-gray-400 leading-relaxed',
              isPunjabi && 'font-gurmukhi text-sm'
            )}>
              {isPunjabi
                ? 'ਇਹ ਪਲੇਟਫਾਰਮ ਸਿੱਖਿਆ ਅਤੇ ਵਿਚਾਰ ਲਈ ਹੈ। ਇਹ ਧਾਰਮਿਕ ਅਭਿਆਸ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਸਥਾਨਕ ਗੁਰਦੁਆਰਾ ਸਾਹਿਬ ਵਿੱਚ ਜਾਓ।'
                : 'This platform supports learning and reflection. It is not a replacement for religious practice. Please attend your local Gurdwara Sahib.'}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-gray-800">
          {/* Waheguru Ji Ka Khalsa */}
          <div className="text-center mb-4">
            <p className="font-gurmukhi text-lg text-amber-400">
              ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਿਹ
            </p>
          </div>
          
          {/* Bhul Chuk Maaf */}
          <div className="text-center">
            <p className={cn(
              'text-sm text-gray-500',
              isPunjabi && 'font-gurmukhi'
            )}>
              {isPunjabi ? 'ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ' : 'Please forgive any errors'}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              © {new Date().getFullYear()} Sikhi Vidhya
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
