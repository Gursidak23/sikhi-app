'use client';

// ============================================================================
// MAIN NAVIGATION COMPONENT - SIKHI THEMED
// ============================================================================
// Beautiful Sikh-styled navigation with Kesri and Neela accents
// Gurbani and History are visually and structurally separated
// ============================================================================

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LanguageSwitcher, LanguageSwitcherMobile } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeProvider';
import { NanakshahiCalendarFull, gregorianToNanakshahi, NANAKSHAHI_MONTHS } from '@/components/common/NanakshahiCalendar';
import { BookmarksPanel, useBookmarks } from '@/components/common/BookmarkSystem';
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const { bookmarks } = useBookmarks();
  
  // Calculate Nanakshahi date
  const nanakshahiDate = useMemo(() => gregorianToNanakshahi(new Date()), []);

  const isGurbaniSection = pathname?.includes('/gurbani');
  const isItihaasSection = pathname?.includes('/itihaas');
  const isCommunitySection = pathname?.includes('/community');
  const isNitnemSection = pathname?.includes('/nitnem');

  const navItems = [
    {
      href: '/gurbani',
      labelPa: 'ਗੁਰਬਾਣੀ',
      labelEn: 'Gurbani',
      labelHi: 'गुरबाणी',
      isSacred: true,
      icon: '📖',
      activeColor: 'blue' as const,
    },
    {
      href: '/nitnem',
      labelPa: 'ਨਿਤਨੇਮ',
      labelEn: 'Nitnem',
      labelHi: 'नितनेम',
      isSacred: true,
      icon: '🙏',
      activeColor: 'blue' as const,
    },
    {
      href: '/itihaas',
      labelPa: 'ਇਤਿਹਾਸ',
      labelEn: 'History',
      labelHi: 'इतिहास',
      isSacred: false,
      icon: '📜',
      activeColor: 'orange' as const,
    },
    {
      href: '/community',
      labelPa: 'ਸੰਗਤ',
      labelEn: 'Community',
      labelHi: 'संगत',
      isSacred: false,
      icon: '🤝',
      activeColor: 'green' as const,
    },
    {
      href: '/about',
      labelPa: 'ਬਾਰੇ',
      labelEn: 'About',
      labelHi: 'के बारे में',
      isSacred: false,
      icon: 'ℹ️',
      activeColor: 'amber' as const,
    },
  ];

  const getLabel = (item: typeof navItems[0]) => {
    if (currentLanguage === 'pa') return item.labelPa;
    if (currentLanguage === 'hi') return item.labelHi;
    return item.labelEn;
  };

  // Active color maps for desktop nav
  const activeStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800',
    orange: 'bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 ring-1 ring-orange-200 dark:ring-orange-800',
    green: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800',
    amber: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800',
  };

  return (
    <header className="sikhi-nav sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-neutral-900/90">
      <div className="container-content">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 shadow-md shadow-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-all group-hover:scale-105">
              <span className="text-white font-gurmukhi font-bold text-xl">ੴ</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <span className="font-gurmukhi text-lg font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                ਸਿੱਖੀ ਵਿੱਦਿਆ
              </span>
              {currentLanguage !== 'pa' && (
                <span className="block text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
                  Sikhi Vidhya
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const isCommunity = item.href === '/community';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative sikhi-nav-link px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    currentLanguage === 'pa' && 'font-gurmukhi text-base',
                    isActive && 'active',
                    isActive && activeStyles[item.activeColor],
                    !isActive && 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="opacity-70 text-sm">{item.icon}</span>
                    {getLabel(item)}
                    {/* Live indicator for Community */}
                    {isCommunity && (
                      <span className="relative flex h-2 w-2 ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop: All controls | Mobile: Only language + hamburger */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Desktop only - Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            
            {/* Desktop Language Switcher */}
            <LanguageSwitcher
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              size="sm"
            />
            
            {/* Mobile Language Switcher (dropdown) */}
            <LanguageSwitcherMobile
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
            />
            
            {/* Desktop only - Bookmarks Button */}
            <button
              onClick={() => setShowBookmarks(true)}
              className="hidden md:flex relative p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20 rounded-lg transition-all hover:scale-105"
              aria-label="Open Bookmarks"
              title="My Bookmarks"
            >
              <svg className="w-5 h-5" fill={bookmarks.length > 0 ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {bookmarks.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-bold shadow-sm">
                  {bookmarks.length > 9 ? '9+' : bookmarks.length}
                </span>
              )}
            </button>
            
            {/* Desktop only - Nanakshahi Date Badge */}
            <button
              onClick={() => setShowCalendar(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm rounded-lg transition-all shadow-sm shadow-amber-500/20 hover:shadow-md hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Open Nanakshahi Calendar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-gurmukhi text-xs">
                {nanakshahiDate.day} {NANAKSHAHI_MONTHS[nanakshahiDate.month].pa}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <nav className="md:hidden py-4 border-t border-amber-200/30 dark:border-amber-800/30 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1 px-1">
              {navItems.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const isCommunity = item.href === '/community';
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all',
                      currentLanguage === 'pa' && 'font-gurmukhi text-lg',
                      isActive
                        ? activeStyles[item.activeColor]
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    )}
                  >
                    <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm">
                      {item.icon}
                    </span>
                    <span className="flex-1">{getLabel(item)}</span>
                    {isCommunity && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                      </span>
                    )}
                    {isActive && (
                      <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile Quick Actions */}
            <div className="mt-4 pt-4 border-t border-amber-200/30 dark:border-amber-800/30">
              <div className="grid grid-cols-3 gap-2 px-2">
                {/* Mobile Bookmarks */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowBookmarks(true);
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 transition-all active:scale-95"
                >
                  <div className="relative">
                    <svg className="w-5 h-5" fill={bookmarks.length > 0 ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {bookmarks.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[10px] flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-bold">
                        {bookmarks.length > 9 ? '9+' : bookmarks.length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">
                    {currentLanguage === 'pa' ? 'ਬੁੱਕਮਾਰਕ' : 'Bookmarks'}
                  </span>
                </button>
                
                {/* Mobile Calendar */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowCalendar(true);
                  }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">
                    {currentLanguage === 'pa' ? 'ਕੈਲੰਡਰ' : 'Calendar'}
                  </span>
                </button>
                
                {/* Mobile Theme Toggle */}
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                  <ThemeToggle />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {currentLanguage === 'pa' ? 'ਥੀਮ' : 'Theme'}
                  </span>
                </div>
              </div>
              
              {/* Nanakshahi Date Display */}
              <div className="mt-3 mx-2 px-3 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-center shadow-sm shadow-amber-500/20">
                <span className="font-gurmukhi text-white text-sm">
                  📅 {nanakshahiDate.day} {NANAKSHAHI_MONTHS[nanakshahiDate.month].pa} {nanakshahiDate.year}
                </span>
              </div>
            </div>
          </nav>
        )}
      </div>

      {/* Section Indicator Bar */}
      {(isGurbaniSection || isItihaasSection || isCommunitySection || isNitnemSection) && (
        <div
          className={cn(
            'h-0.5 transition-all duration-300',
            (isGurbaniSection || isNitnemSection)
              ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600'
              : isCommunitySection
                ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600'
                : 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600'
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Nanakshahi Calendar Modal */}
      {showCalendar && (
        <div 
          className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-20 pb-4 px-2 sm:px-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowCalendar(false)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <NanakshahiCalendarFull language={currentLanguage} onClose={() => setShowCalendar(false)} />
          </div>
        </div>
      )}
      
      {/* Bookmarks Panel */}
      <BookmarksPanel 
        isOpen={showBookmarks} 
        onClose={() => setShowBookmarks(false)} 
        language={currentLanguage} 
      />
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
    <footer className="relative sikhi-footer py-16 mt-16 overflow-hidden">
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 -translate-y-[99%]">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33C672 36 768 42 864 44C960 46 1056 44 1152 40C1248 36 1344 30 1392 27L1440 24V60H0Z" className="fill-gray-900 dark:fill-neutral-950" />
        </svg>
      </div>
      
      <div className="container-content relative z-10">
        <div className="grid md:grid-cols-3 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20">
                <span className="text-white font-gurmukhi font-bold text-xl">ੴ</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              <div>
                <h3 className="font-gurmukhi text-xl text-white">
                  ਸਿੱਖੀ ਵਿੱਦਿਆ
                </h3>
                <p className="text-xs text-gray-500">Sikhi Vidhya</p>
              </div>
            </div>
            <p className={cn(
              'text-sm text-gray-400 leading-relaxed',
              isPunjabi && 'font-gurmukhi'
            )}>
              {isPunjabi
                ? 'ਸਿੱਖ ਇਤਿਹਾਸ ਅਤੇ ਗੁਰਬਾਣੀ ਦੀ ਸਿੱਖਿਆ ਲਈ ਪਵਿੱਤਰ ਪਲੇਟਫਾਰਮ।'
                : 'A sacred platform for Sikh learning, history documentation, and Gurbani study.'}
            </p>
            
            {/* Three pillars */}
            <div className="mt-5 flex gap-3">
              {['ਕਿਰਤ ਕਰੋ', 'ਨਾਮ ਜਪੋ', 'ਵੰਡ ਛਕੋ'].map((pillar) => (
                <span key={pillar} className="font-gurmukhi text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {pillar}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={cn(
              'text-sm font-semibold text-white mb-5 uppercase tracking-wider',
              isPunjabi && 'font-gurmukhi text-base tracking-normal normal-case'
            )}>
              {isPunjabi ? 'ਤੁਰੰਤ ਲਿੰਕ' : 'Quick Links'}
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/gurbani', icon: '📖', pa: 'ਗੁਰਬਾਣੀ', en: 'Gurbani' },
                { href: '/nitnem', icon: '🙏', pa: 'ਨਿਤਨੇਮ', en: 'Nitnem' },
                { href: '/itihaas', icon: '📜', pa: 'ਇਤਿਹਾਸ', en: 'History' },
                { href: '/community', icon: '🤝', pa: 'ਸੰਗਤ', en: 'Community' },
                { href: '/about', icon: 'ℹ️', pa: 'ਬਾਰੇ', en: 'About' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-gray-800 group-hover:bg-amber-500/10 flex items-center justify-center transition-colors text-xs">
                      {link.icon}
                    </span>
                    <span className={isPunjabi ? 'font-gurmukhi' : ''}>
                      {isPunjabi ? link.pa : link.en}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className={cn(
              'text-sm font-semibold text-white mb-5 uppercase tracking-wider',
              isPunjabi && 'font-gurmukhi text-base tracking-normal normal-case'
            )}>
              {isPunjabi ? 'ਮਹੱਤਵਪੂਰਨ ਨੋਟ' : 'Important Note'}
            </h3>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <p className={cn(
                'text-xs text-gray-400 leading-relaxed',
                isPunjabi && 'font-gurmukhi text-sm'
              )}>
                {isPunjabi
                  ? 'ਇਹ ਪਲੇਟਫਾਰਮ ਸਿੱਖਿਆ ਅਤੇ ਵਿਚਾਰ ਲਈ ਹੈ। ਇਹ ਧਾਰਮਿਕ ਅਭਿਆਸ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਸਥਾਨਕ ਗੁਰਦੁਆਰਾ ਸਾਹਿਬ ਵਿੱਚ ਜਾਓ।'
                  : 'This platform supports learning and reflection. It is not a replacement for religious practice. Please attend your local Gurdwara Sahib.'}
              </p>
            </div>
            
            {/* Decorative Khanda */}
            <div className="mt-6 flex items-center gap-3 text-gray-700">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-700" />
              <span className="font-gurmukhi text-xl text-amber-500/40">☬</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-700" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800/80">
          {/* Waheguru Ji Ka Khalsa */}
          <div className="text-center mb-5">
            <p className="font-gurmukhi text-lg bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 bg-clip-text text-transparent">
              ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਿਹ
            </p>
          </div>
          
          {/* Bhul Chuk Maaf */}
          <div className="text-center space-y-2">
            <p className={cn(
              'text-sm text-gray-500',
              isPunjabi && 'font-gurmukhi'
            )}>
              {isPunjabi ? 'ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ' : 'Please forgive any errors'}
            </p>
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} Sikhi Vidhya — {isPunjabi ? 'ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ' : 'All rights reserved'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
