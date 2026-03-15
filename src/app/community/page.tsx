/**
 * Community Chat Page - Real-time Sangat discussion
 * Full-page immersive chat experience with site navigation
 */

'use client';

import { cn } from '@/lib/utils';
import { MainNavigation } from '@/components/layout/Navigation';
import { useLanguage } from '@/components/common/LanguageProvider';
import { ChatView } from '@/modules/community/components/ChatView';
import { useOfflineStatus } from '@/lib/service-worker';
import type { Language } from '@/types';

export default function CommunityPage() {
  const { language, isPunjabi } = useLanguage();
  const isHindi = language === 'hi';
  const offline = useOfflineStatus();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FDF8F0] via-white to-[#fef9e7] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <MainNavigation />

      {/* Offline notice */}
      {offline && (
        <div className="w-full bg-red-50 border-b border-red-200 text-red-800 text-sm py-3 px-4 flex items-center justify-center gap-2 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/30">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01" />
          </svg>
          <span className={cn(isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi
              ? 'ਸੰਗਤ ਚੈਟ ਲਈ ਇੰਟਰਨੈੱਟ ਕਨੈਕਸ਼ਨ ਲੋੜੀਂਦਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਇੰਟਰਨੈੱਟ ਨਾਲ ਜੁੜੋ।'
              : isHindi ? 'संगत चैट के लिए इंटरनेट कनेक्शन आवश्यक है। कृपया इंटरनेट से जुड़ें।'
              : 'Community chat requires an internet connection. Please connect to participate.'}
          </span>
        </div>
      )}

      {/* Ephemeral chat info banner - more subtle */}
      <div className="w-full bg-amber-50/80 border-b border-amber-200/50 text-amber-800 text-xs py-1.5 px-4 flex items-center justify-center gap-2 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30">
        <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={cn(isPunjabi && 'font-gurmukhi text-sm', isHindi && 'font-devanagari text-sm')}>
          {isPunjabi
            ? 'ℹ️ ਚੈਟ ਡੇਟਾ ਅਸਥਾਈ ਹੈ ਅਤੇ ਸਮੇਂ-ਸਮੇਂ ਰੀਸੈਟ ਹੋ ਸਕਦਾ ਹੈ'
            : isHindi ? 'ℹ️ चैट डेटा अस्थायी है और समय-समय पर रीसेट हो सकता है'
            : 'ℹ️ Chat data is temporary and may reset periodically'}
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
                    isPunjabi && 'font-gurmukhi text-2xl sm:text-3xl',
                    isHindi && 'font-devanagari text-2xl sm:text-3xl'
                  )}>
                    {isPunjabi ? 'ਸੰਗਤ' : isHindi ? 'संगत समुदाय' : 'Sangat Community'}
                  </h1>
                  <p className={cn(
                    'text-xs sm:text-sm text-amber-100/90 mt-0.5',
                    isPunjabi && 'font-gurmukhi',
                    isHindi && 'font-devanagari'
                  )}>
                    {isPunjabi
                      ? 'ਸਿੱਖ ਸੰਗਤ ਨਾਲ ਜੁੜੋ, ਸਿੱਖੋ ਤੇ ਸਾਂਝ ਪਾਓ'
                      : isHindi ? 'सिख संगत से जुड़ें, सीखें और साझा करें'
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
                    isPunjabi && 'font-gurmukhi',
                    isHindi && 'font-devanagari'
                  )}>
                    {isPunjabi ? 'ਲਾਈਵ' : isHindi ? 'लाइव' : 'Live'}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/15">
                  <span className="text-xs">🙏</span>
                  <span className={cn(
                    'text-xs text-white/80',
                    isPunjabi && 'font-gurmukhi',
                    isHindi && 'font-devanagari'
                  )}>
                    {isPunjabi ? 'ਸਤਿਕਾਰ ਨਾਲ' : isHindi ? 'सम्मान सहित' : 'With respect'}
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

      {/* Minimal Community Footer */}
      <footer className="border-t border-amber-200/30 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
        <div className="container-content py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <p className="font-gurmukhi text-sm bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent font-semibold">
                ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਿਹ
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className={cn(isPunjabi && 'font-gurmukhi text-sm', isHindi && 'font-devanagari text-sm')}>
                {isPunjabi ? '🙏 ਸਤਿਕਾਰ ਨਾਲ ਗੱਲਬਾਤ ਕਰੋ' : isHindi ? '🙏 सम्मान से बात करें' : '🙏 Communicate with respect'}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className={cn('hidden sm:inline', isPunjabi && 'font-gurmukhi text-sm', isHindi && 'font-devanagari text-sm')}>
                {isPunjabi ? 'ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ' : isHindi ? 'भूल चूक माफ़ करना' : 'Please forgive any errors'}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
