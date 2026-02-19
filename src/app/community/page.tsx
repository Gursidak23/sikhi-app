/**
 * Community Chat Page - Real-time Sangat discussion
 * Full-page immersive chat experience with site navigation
 */

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { ChatView } from '@/modules/community/components/ChatView';
import type { Language } from '@/types';

export default function CommunityPage() {
  const [language, setLanguage] = useState<Language>('pa');

  // Sync language from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sikhi-language');
    if (stored && ['pa', 'en', 'hi', 'pa-roman'].includes(stored)) {
      setLanguage(stored as Language);
    }

    const handler = () => {
      const lang = localStorage.getItem('sikhi-language');
      if (lang) setLanguage(lang as Language);
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const isPunjabi = language === 'pa';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FDF8F0] via-white to-[#fef9e7] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <MainNavigation
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      {/* Ephemeral chat warning banner */}
      <div className="w-full bg-yellow-100 border-b border-yellow-300 text-yellow-900 text-sm font-medium py-2 px-4 flex items-center gap-2 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700">
        <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>Notice:</strong> All chat data is temporary and will reset periodically. For production, use a persistent backend.
        </span>
      </div>

      <main id="main-content" className="flex-1 flex flex-col">
        {/* Compact Hero Header with Sikh ornamental style */}
        <div className="relative overflow-hidden">
          {/* Background gradient + pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 dark:from-amber-900 dark:via-amber-800 dark:to-orange-900" />
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L60 30L30 60L0 30z\' fill=\'none\' stroke=\'%23fff\' stroke-width=\'1\'/%3E%3C/svg%3E")',
            }}
          />

          <div className="container-content py-5 sm:py-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                  <span className="text-2xl">🤝</span>
                </div>
                <div>
                  <h1 className={cn(
                    'text-xl sm:text-2xl font-bold text-white',
                    isPunjabi && 'font-gurmukhi text-2xl sm:text-3xl'
                  )}>
                    {isPunjabi ? 'ਸੰਗਤ' : 'Sangat Community'}
                  </h1>
                  <p className={cn(
                    'text-xs sm:text-sm text-amber-100/90 mt-0.5',
                    isPunjabi && 'font-gurmukhi'
                  )}>
                    {isPunjabi
                      ? 'ਸਿੱਖ ਸੰਗਤ ਨਾਲ ਜੁੜੋ, ਸਿੱਖੋ ਤੇ ਸਾਂਝ ਪਾਓ'
                      : 'Connect, learn, and share with the Sikh community'}
                  </p>
                </div>
              </div>

              {/* Live indicator + Sikh Greeting + Guidelines badge */}
              <div className="flex items-center gap-2">
                {/* Sikh Greeting */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/15">
                  <span className="text-xs font-gurmukhi text-white/90">ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖ਼ਾਲਸਾ</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                  </div>
                  <span className={cn(
                    'text-xs font-medium text-white/95',
                    isPunjabi && 'font-gurmukhi'
                  )}>
                    {isPunjabi ? 'ਲਾਈਵ' : 'Live'}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/15">
                  <span className="text-xs">🙏</span>
                  <span className={cn(
                    'text-xs text-white/80',
                    isPunjabi && 'font-gurmukhi'
                  )}>
                    {isPunjabi ? 'ਸਤਿਕਾਰ ਨਾਲ' : 'With respect'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
              <path d="M0 40L720 20L1440 40V40H0Z" className="fill-[#FDF8F0] dark:fill-gray-950" />
            </svg>
          </div>
        </div>

        {/* Chat Interface - Fills remaining space */}
        <div className="flex-1 container-content py-3 sm:py-4">
          <ChatView language={language} />
        </div>
      </main>
    </div>
  );
}
