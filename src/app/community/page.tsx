/**
 * Community Chat Page - Real-time Sangat discussion
 */

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
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
    <main className="min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-b border-amber-200/50 dark:border-gray-700">
        <div className="container-content py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={cn(
                'text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white',
                isPunjabi && 'font-gurmukhi'
              )}>
                {isPunjabi ? '🤝 ਸੰਗਤ' : '🤝 Sangat Community'}
              </h1>
              <p className={cn(
                'text-sm text-gray-500 dark:text-gray-400 mt-1.5',
                isPunjabi && 'font-gurmukhi'
              )}>
                {isPunjabi
                  ? 'ਸਿੱਖ ਸੰਗਤ ਨਾਲ ਜੁੜੋ, ਸਿੱਖੋ, ਅਤੇ ਵਿਚਾਰ ਸਾਂਝੇ ਕਰੋ'
                  : 'Connect with the Sikh community, learn, and share insights'}
              </p>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className={cn(
                'text-xs font-medium text-green-700 dark:text-green-400',
                isPunjabi && 'font-gurmukhi'
              )}>
                {isPunjabi ? 'ਲਾਈਵ ਚੈਟ' : 'Live Chat'}
              </span>
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="mt-4 p-3 bg-amber-50/80 dark:bg-amber-900/10 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
            <p className={cn(
              'text-xs text-amber-800 dark:text-amber-300',
              isPunjabi && 'font-gurmukhi text-sm'
            )}>
              {isPunjabi
                ? '⚠️ ਕਿਰਪਾ ਕਰਕੇ ਸਤਿਕਾਰ ਨਾਲ ਗੱਲਬਾਤ ਕਰੋ। ਗੁਰਬਾਣੀ ਅਤੇ ਸਿੱਖ ਕਦਰਾਂ-ਕੀਮਤਾਂ ਦਾ ਸਨਮਾਨ ਕਰੋ। ਨਫ਼ਰਤ, ਸਪੈਮ, ਜਾਂ ਅਣਉਚਿਤ ਸਮੱਗਰੀ ਦੀ ਮਨਾਹੀ ਹੈ।'
                : '⚠️ Please communicate with respect. Honor Gurbani and Sikh values. Hate speech, spam, or inappropriate content is prohibited.'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-content py-4 sm:py-6">
        <ChatView language={language} />
      </div>
    </main>
  );
}
