/**
 * Chat Input Bar with reply preview, emoji picker, and enhanced UX
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatMessage } from '../hooks/useChat';

const QUICK_EMOJIS = ['🙏', '😊', '❤️', '👍', '✨', 'ੴ', '🎵', '📖', '💡', '🌸'];

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  isSending: boolean;
  replyingTo: ChatMessage | null;
  onCancelReply: () => void;
  language: Language;
  disabled?: boolean;
  onActivity?: () => void;
}

export function ChatInput({
  onSend,
  isSending,
  replyingTo,
  onCancelReply,
  language,
  disabled,
  onActivity,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isPunjabi = language === 'pa';

  // Auto-focus when replying
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    const content = message;
    setMessage('');
    setShowEmojis(false);
    onActivity?.();
    // Fire-and-forget: optimistic UI already shows the message instantly
    onSend(content);
  };

  const insertEmoji = useCallback((emoji: string) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
    onActivity?.();
  }, [onActivity]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onActivity?.();
  };

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50/80 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-800/30">
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-amber-400 to-amber-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              {isPunjabi ? 'ਜਵਾਬ ਦੇ ਰਹੇ ਹੋ' : 'Replying to'} {replyingTo.user.displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {replyingTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Emoji Quick Picker */}
      {showEmojis && (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => insertEmoji(emoji)}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-base hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:scale-110 transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-3">
        {/* Emoji Toggle */}
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className={cn(
            'p-2.5 rounded-xl transition-all flex-shrink-0 mb-0.5',
            showEmojis
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
          aria-label={isPunjabi ? 'ਇਮੋਜੀ' : 'Emoji'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? (isPunjabi ? 'ਪਹਿਲਾਂ ਸ਼ਾਮਲ ਹੋਵੋ...' : 'Join to start chatting...')
                : (isPunjabi ? 'ਸੁਨੇਹਾ ਲਿਖੋ...' : 'Type a message...')
            }
            disabled={disabled || isSending}
            rows={1}
            maxLength={2000}
            className={cn(
              'w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl',
              'text-sm text-gray-900 dark:text-white placeholder-gray-400',
              'resize-none border border-gray-200 dark:border-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all',
              isPunjabi && 'font-gurmukhi'
            )}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending || disabled}
          className={cn(
            'p-3 rounded-xl transition-all flex-shrink-0',
            message.trim() && !isSending && !disabled
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 active:scale-95'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          )}
          aria-label={isPunjabi ? 'ਭੇਜੋ' : 'Send'}
        >
          {isSending ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      {/* Character count for long messages */}
      {message.length > 1500 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all rounded-full',
                  message.length > 1900 ? 'bg-red-500' : message.length > 1800 ? 'bg-yellow-500' : 'bg-amber-400'
                )}
                style={{ width: `${(message.length / 2000) * 100}%` }}
              />
            </div>
            <span className={cn(
              'text-xs tabular-nums',
              message.length > 1900 ? 'text-red-500 font-semibold' : 'text-gray-400'
            )}>
              {message.length}/2000
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
