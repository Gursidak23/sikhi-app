/**
 * Chat Registration Form
 * First-time user registration with display name
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
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <span className="text-3xl">🤝</span>
          </div>
          <h2 className={cn(
            'text-2xl font-bold text-gray-900 dark:text-white',
            isPunjabi && 'font-gurmukhi'
          )}>
            {isPunjabi ? 'ਸੰਗਤ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ' : 'Join the Sangat'}
          </h2>
          <p className={cn(
            'text-sm text-gray-500 dark:text-gray-400 mt-2',
            isPunjabi && 'font-gurmukhi'
          )}>
            {isPunjabi
              ? 'ਸਿੱਖ ਸੰਗਤ ਨਾਲ ਗੱਲਬਾਤ ਕਰੋ ਅਤੇ ਸਿੱਖੋ'
              : 'Connect and learn with the Sikh community'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {isPunjabi ? 'ਤੁਹਾਡਾ ਨਾਮ' : 'Your Display Name'}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={isPunjabi ? 'ਨਾਮ ਦਰਜ ਕਰੋ...' : 'Enter your name...'}
              maxLength={30}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <span className="font-gurmukhi">ਗੁਰਮੁਖੀ ਨਾਮ</span>
              <span className="text-gray-400 ml-2 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={gurmukhiName}
              onChange={(e) => setGurmukhiName(e.target.value)}
              placeholder="ਗੁਰਮੁਖੀ ਵਿੱਚ ਨਾਮ..."
              maxLength={30}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-gurmukhi text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !displayName.trim()}
            className={cn(
              'w-full py-3 px-4 rounded-xl font-medium text-white transition-all',
              'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'shadow-md hover:shadow-lg',
              isPunjabi && 'font-gurmukhi text-lg'
            )}
          >
            {isSubmitting
              ? (isPunjabi ? 'ਜੋੜ ਰਿਹਾ ਹੈ...' : 'Joining...')
              : (isPunjabi ? 'ਸ਼ਾਮਲ ਹੋਵੋ' : 'Join Community')}
          </button>
        </form>

        <p className={cn(
          'text-xs text-gray-400 text-center mt-6',
          isPunjabi && 'font-gurmukhi'
        )}>
          {isPunjabi
            ? 'ਕਿਰਪਾ ਕਰਕੇ ਸਤਿਕਾਰ ਨਾਲ ਗੱਲਬਾਤ ਕਰੋ'
            : 'Please communicate with respect and dignity'}
        </p>
      </div>
    </div>
  );
}
