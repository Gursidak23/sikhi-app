/**
 * Chat Registration Form
 * Beautiful onboarding with Sikh-themed design, avatar color picker
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

const AVATAR_COLORS = [
  '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4',
  '#84CC16', '#D946EF',
];

interface ChatRegistrationProps {
  onRegister: (displayName: string, displayNameGurmukhi?: string, avatarColor?: string) => Promise<any>;
  language: Language;
}

export function ChatRegistration({ onRegister, language }: ChatRegistrationProps) {
  const [displayName, setDisplayName] = useState('');
  const [gurmukhiName, setGurmukhiName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'name' | 'avatar'>('name');

  const isPunjabi = language === 'pa';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'name') {
      if (!displayName.trim() || displayName.trim().length < 2) {
        setError(isPunjabi ? 'ਘੱਟੋ-ਘੱਟ 2 ਅੱਖਰ ਲੋੜੀਂਦੇ ਹਨ' : 'At least 2 characters required');
        return;
      }
      setError('');
      setStep('avatar');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onRegister(displayName.trim(), gurmukhiName.trim() || undefined, selectedColor);
    } catch (err: any) {
      setError(err.message || (isPunjabi ? 'ਗਲਤੀ ਹੋਈ' : 'Something went wrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name.trim()) return '?';
    return name.trim().slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center justify-center min-h-[65vh] p-4">
      <div className="w-full max-w-md relative">
        {/* Decorative background blobs */}
        <div className="absolute -top-8 -left-8 w-40 h-40 bg-amber-300/20 dark:bg-amber-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-orange-300/20 dark:bg-orange-600/10 rounded-full blur-3xl" />

        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-amber-200/50 dark:border-amber-800/30 overflow-hidden">
          {/* Top decorative bar with Khanda pattern */}
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 pt-5">
            <div className={cn(
              'w-8 h-1 rounded-full transition-colors',
              step === 'name' ? 'bg-amber-500' : 'bg-amber-300'
            )} />
            <div className={cn(
              'w-8 h-1 rounded-full transition-colors',
              step === 'avatar' ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'
            )} />
          </div>

          <div className="p-8 sm:p-10">
            {step === 'name' ? (
              <>
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

                {/* Gurbani Quote */}
                <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 text-center">
                  <p className="text-sm font-gurmukhi text-amber-800 dark:text-amber-300 leading-relaxed">
                    ਸੰਤ ਸਭਾ ਮਹਿ ਹਰਿ ਪ੍ਰਭੁ ਵਸੈ
                  </p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-1 italic">
                    The Lord God dwells in the Society of the Saints
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
                    disabled={!displayName.trim()}
                    className={cn(
                      'w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all text-base',
                      'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'shadow-lg hover:shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40',
                      'active:scale-[0.98]',
                      isPunjabi && 'font-gurmukhi text-lg'
                    )}
                  >
                    {isPunjabi ? 'ਅੱਗੇ ਵਧੋ' : 'Continue'}
                    <span className="ml-2">→</span>
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Avatar step */}
                <div className="text-center mb-6">
                  <button
                    onClick={() => setStep('name')}
                    className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {isPunjabi ? 'ਪਿੱਛੇ' : 'Back'}
                  </button>

                  {/* Live avatar preview */}
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div
                      className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl transition-colors duration-300"
                      style={{ backgroundColor: selectedColor }}
                    >
                      {getInitials(displayName)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-3 border-white dark:border-gray-900 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <h2 className={cn(
                    'text-xl font-bold text-gray-900 dark:text-white',
                    isPunjabi && 'font-gurmukhi text-2xl'
                  )}>
                    {isPunjabi ? 'ਆਪਣਾ ਰੰਗ ਚੁਣੋ' : 'Choose your color'}
                  </h2>
                  <p className={cn(
                    'text-sm text-gray-400 mt-1',
                    isPunjabi && 'font-gurmukhi'
                  )}>
                    {isPunjabi ? 'ਇਹ ਤੁਹਾਡੀ ਫੋਟੋ ਵਜੋਂ ਦਿਖਾਈ ਦੇਵੇਗਾ' : 'This will be your avatar in chat'}
                  </p>
                </div>

                {/* Color picker grid */}
                <div className="grid grid-cols-6 gap-3 mb-6 justify-items-center">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'w-10 h-10 rounded-xl transition-all duration-200',
                        selectedColor === color
                          ? 'ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-gray-900 scale-110 shadow-lg'
                          : 'hover:scale-105 hover:shadow-md'
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-200/50 dark:border-red-800/30 mb-4">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
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
              </>
            )}

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
