/**
 * Chat Registration Form
 * Beautiful onboarding with Sikh-themed design
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

interface ChatRegistrationProps {
  onRegister: (displayName: string, displayNameGurmukhi?: string) => Promise<any>;
  language: Language;
}

export function ChatRegistration({ onRegister, language }: ChatRegistrationProps) {
  const [displayName, setDisplayName] = useState('');
  const [gurmukhiName, setGurmukhiName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isPunjabi = language === 'pa';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      setError(isPunjabi ? 'ਘੱਟੋ-ਘੱਟ 2 ਅੱਖਰ ਲੋੜੀਂਦੇ ਹਨ' : 'At least 2 characters required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onRegister(displayName.trim(), gurmukhiName.trim() || undefined);
    } catch (err: any) {
      setError(err.message || (isPunjabi ? 'ਗਲਤੀ ਹੋਈ' : 'Something went wrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[65vh] p-4">
      <div className="w-full max-w-md relative">
        {/* Decorative background */}
        <div className="absolute -inset-4 bg-gradient-to-br from-amber-200/30 via-transparent to-orange-200/30 dark:from-amber-900/20 dark:to-orange-900/20 rounded-3xl blur-xl" />

        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-amber-200/50 dark:border-amber-800/30 overflow-hidden">
          {/* Top decorative bar */}
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

          <div className="p-8 sm:p-10">
            {/* Icon and title */}
            <div className="text-center mb-8">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl rotate-6 opacity-20" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🤝</span>
                </div>
              </div>
              <h2 className={cn(
                'text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white',
                isPunjabi && 'font-gurmukhi'
              )}>
                {isPunjabi ? 'ਸੰਗਤ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ' : 'Join the Sangat'}
              </h2>
              <p className={cn(
                'text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto',
                isPunjabi && 'font-gurmukhi'
              )}>
                {isPunjabi
                  ? 'ਸਿੱਖ ਸੰਗਤ ਨਾਲ ਗੱਲਬਾਤ ਕਰੋ ਅਤੇ ਸਿੱਖੋ'
                  : 'Connect and learn with the Sikh community'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isPunjabi ? 'ਤੁਹਾਡਾ ਨਾਮ' : 'Your Display Name'}
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={isPunjabi ? 'ਨਾਮ ਦਰਜ ਕਰੋ...' : 'Enter your name...'}
                    maxLength={30}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all text-base"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-gurmukhi">ਗੁਰਮੁਖੀ ਨਾਮ</span>
                  <span className="text-gray-400 ml-2 text-xs font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-gurmukhi text-sm">ੴ</span>
                  </div>
                  <input
                    type="text"
                    value={gurmukhiName}
                    onChange={(e) => setGurmukhiName(e.target.value)}
                    placeholder="ਗੁਰਮੁਖੀ ਵਿੱਚ ਨਾਮ..."
                    maxLength={30}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-gurmukhi text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all text-base"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-200/50 dark:border-red-800/30">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !displayName.trim()}
                className={cn(
                  'w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all text-base',
                  'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'shadow-lg hover:shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40',
                  'active:scale-[0.98]',
                  isPunjabi && 'font-gurmukhi text-lg'
                )}
              >
                {isSubmitting
                  ? (isPunjabi ? 'ਜੋੜ ਰਿਹਾ ਹੈ...' : 'Joining...')
                  : (isPunjabi ? 'ਸ਼ਾਮਲ ਹੋਵੋ' : 'Join Community')}
              </button>
            </form>

            <p className={cn(
              'text-xs text-gray-400 text-center mt-6 leading-relaxed',
              isPunjabi && 'font-gurmukhi text-sm'
            )}>
              {isPunjabi
                ? '🙏 ਕਿਰਪਾ ਕਰਕੇ ਸਤਿਕਾਰ ਨਾਲ ਗੱਲਬਾਤ ਕਰੋ'
                : '🙏 Please communicate with respect and dignity'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
