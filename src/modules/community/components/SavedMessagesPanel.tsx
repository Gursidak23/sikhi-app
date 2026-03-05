/**
 * Saved Messages Panel - Browse and manage saved messages
 * 
 * Features:
 * - View all saved messages across rooms
 * - Unsave messages
 * - Click to navigate to original message
 */

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatMessage } from '../store/chatStore';
import { useChatMessages } from '../hooks/useChatMessages';

interface SavedMessagesPanelProps {
  language: Language;
  onClose: () => void;
  onScrollToMessage?: (messageId: string) => void;
}

export function SavedMessagesPanel({ language, onClose, onScrollToMessage }: SavedMessagesPanelProps) {
  const [savedList, setSavedList] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchSavedMessages, unsaveMessage } = useChatMessages();

  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  useEffect(() => {
    setIsLoading(true);
    fetchSavedMessages().then((saved) => {
      setSavedList(saved || []);
      setIsLoading(false);
    });
  }, [fetchSavedMessages]);

  const handleUnsave = async (messageId: string) => {
    await unsaveMessage(messageId);
    setSavedList((prev) => prev.filter((m) => m.id !== messageId));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isPunjabi ? 'pa-IN' : isHindi ? 'hi-IN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <span className="text-sm">🔖</span>
          </div>
          <div>
            <h3 className={cn(
              'text-sm font-bold text-gray-900 dark:text-white',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਸੇਵ ਕੀਤੇ ਸੁਨੇਹੇ' : isHindi ? 'सेव किए संदेश' : 'Saved Messages'}
            </h3>
            {!isLoading && (
              <p className="text-[10px] text-gray-400">
                {savedList.length} {isPunjabi ? 'ਸੇਵ ਕੀਤੇ' : isHindi ? 'सेव किए' : 'saved'}
              </p>
            )}
          </div>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : savedList.length === 0 ? (
          <div className="text-center py-16 px-6">
            <span className="text-5xl mb-4 block">🔖</span>
            <h4 className={cn(
              'text-base font-semibold text-gray-900 dark:text-white mb-2',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਕੋਈ ਸੇਵ ਕੀਤਾ ਸੁਨੇਹਾ ਨਹੀਂ' : isHindi ? 'कोई सेव किया संदेश नहीं' : 'No saved messages'}
            </h4>
            <p className={cn(
              'text-sm text-gray-400 leading-relaxed',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi
                ? 'ਸੁਨੇਹੇ ਉੱਤੇ 🔖 ਬਟਨ ਦਬਾ ਕੇ ਸੇਵ ਕਰੋ। ਸੇਵ ਕੀਤੇ ਸੁਨੇਹੇ ਮਿਆਦ ਪੁੱਗਣ ਤੋਂ ਬਾਅਦ ਵੀ ਰਹਿੰਦੇ ਹਨ।'
                : isHindi
                ? 'संदेश पर 🔖 बटन दबाकर सेव करें। सेव किए संदेश समाप्ति के बाद भी रहते हैं।'
                : 'Tap the 🔖 button on any message to save it. Saved messages persist even after expiry.'}
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {savedList.map((msg) => (
              <div
                key={msg.id}
                className="group relative p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: msg.user?.avatarColor || '#F59E0B' }}
                  >
                    {(msg.user?.displayName || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <span className={cn(
                        'text-xs font-semibold text-gray-900 dark:text-white truncate',
                        isPunjabi && 'font-gurmukhi',
                        isHindi && 'font-devanagari'
                      )}>
                        {msg.user?.displayName || '?'}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap line-clamp-4">
                      {msg.content}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  {onScrollToMessage && (
                    <button
                      onClick={() => onScrollToMessage(msg.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {isPunjabi ? 'ਦੇਖੋ' : isHindi ? 'देखें' : 'View'}
                    </button>
                  )}
                  <button
                    onClick={() => handleUnsave(msg.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {isPunjabi ? 'ਹਟਾਓ' : isHindi ? 'हटाएं' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
