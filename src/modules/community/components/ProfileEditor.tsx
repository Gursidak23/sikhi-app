/**
 * Profile Editor Panel - Edit user profile after registration
 * 
 * Features:
 * - Edit display name
 * - Edit Gurmukhi name
 * - Edit bio
 * - Change avatar color
 * - Update email
 */

'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import { useChatAuth } from '../hooks/useChatAuth';

const AVATAR_COLORS = [
  '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4',
  '#84CC16', '#D946EF',
];

interface ProfileEditorProps {
  language: Language;
  onClose: () => void;
}

export function ProfileEditor({ language, onClose }: ProfileEditorProps) {
  const { user, updateProfile } = useChatAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [gurmukhiName, setGurmukhiName] = useState(user?.displayNameGurmukhi || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || AVATAR_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      setError(isPunjabi ? 'ਘੱਟੋ-ਘੱਟ 2 ਅੱਖਰ ਲੋੜੀਂਦੇ ਹਨ' : isHindi ? 'कम से कम 2 अक्षर चाहिए' : 'At least 2 characters required');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updateProfile({
        displayName: displayName.trim(),
        displayNameGurmukhi: gurmukhiName.trim() || undefined,
        bio: bio.trim() || undefined,
        email: email.trim() || undefined,
        avatarColor,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || (isPunjabi ? 'ਗਲਤੀ ਹੋਈ' : isHindi ? 'कुछ गलत हो गई' : 'Something went wrong'));
    } finally {
      setIsSaving(false);
    }
  }, [displayName, gurmukhiName, bio, email, avatarColor, updateProfile, isPunjabi, isHindi]);

  if (!user) return null;

  const getInitials = (name: string) => {
    if (!name.trim()) return '?';
    return name.trim().slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className={cn(
            'text-sm font-bold text-gray-900 dark:text-white',
            isPunjabi && 'font-gurmukhi',
            isHindi && 'font-devanagari'
          )}>
            {isPunjabi ? 'ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ' : isHindi ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-colors duration-300 mb-3"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(displayName)}
            </div>
            <p className={cn(
              'text-sm font-medium text-gray-900 dark:text-white',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {displayName || '?'}
            </p>
            {user.role && user.role !== 'member' && (
              <span className={cn(
                'text-[10px] mt-1 px-2 py-0.5 rounded-full font-medium',
                user.role === 'admin'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              )}>
                {user.role}
              </span>
            )}
          </div>

          {/* Avatar Color */}
          <div>
            <label className={cn(
              'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਅਵਤਾਰ ਰੰਗ' : isHindi ? 'अवतार रंग' : 'Avatar Color'}
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={cn(
                    'w-9 h-9 rounded-lg transition-all duration-200',
                    avatarColor === color
                      ? 'ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-gray-900 scale-110'
                      : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className={cn(
              'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਨਾਮ' : isHindi ? 'नाम' : 'Display Name'} *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Gurmukhi Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <span className="font-gurmukhi">ਗੁਰਮੁਖੀ ਨਾਮ</span>
              <span className="text-gray-400 ml-1 text-[10px]">(optional)</span>
            </label>
            <input
              type="text"
              value={gurmukhiName}
              onChange={(e) => setGurmukhiName(e.target.value)}
              placeholder="ਗੁਰਮੁਖੀ ਵਿੱਚ..."
              maxLength={30}
              className="w-full px-3 py-2.5 text-sm font-gurmukhi rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Bio */}
          <div>
            <label className={cn(
              'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਜੀਵਨ-ਵੇਰਵਾ' : isHindi ? 'जीवनी' : 'Bio'}
              <span className="text-gray-400 ml-1 text-[10px]">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={isPunjabi ? 'ਆਪਣੇ ਬਾਰੇ ਲਿਖੋ...' : isHindi ? 'अपने बारे में लिखें...' : 'Tell us about yourself...'}
              maxLength={300}
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">
              {bio.length}/300
            </p>
          </div>

          {/* Email */}
          <div>
            <label className={cn(
              'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਈਮੇਲ' : isHindi ? 'ईमेल' : 'Email'}
              <span className="text-gray-400 ml-1 text-[10px]">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              maxLength={254}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-200/50 dark:border-red-800/30">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-xl border border-green-200/50 dark:border-green-800/30">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isPunjabi ? 'ਪ੍ਰੋਫਾਈਲ ਅੱਪਡੇਟ ਹੋ ਗਈ!' : isHindi ? 'प्रोफ़ाइल अपडेट हो गई!' : 'Profile updated!'}
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving || !displayName.trim()}
            className={cn(
              'w-full py-3 px-4 rounded-xl font-semibold text-white transition-all text-sm',
              'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'shadow-lg hover:shadow-xl shadow-amber-500/25',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}
          >
            {isSaving
              ? (isPunjabi ? 'ਸੇਵ ਹੋ ਰਿਹਾ ਹੈ...' : isHindi ? 'सेव हो रहा है...' : 'Saving...')
              : (isPunjabi ? 'ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰੋ' : isHindi ? 'प्रोफ़ाइल सेव करें' : 'Save Profile')
            }
          </button>
        </form>
      </div>
    </div>
  );
}
