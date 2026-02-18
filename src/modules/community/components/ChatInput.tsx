/**
 * Chat Input Bar with reply preview and typing indicator
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatMessage } from '../hooks/useChat';

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  isSending: boolean;
  replyingTo: ChatMessage | null;
  onCancelReply: () => void;
  language: Language;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  isSending,
  replyingTo,
  onCancelReply,
  language,
  disabled,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
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

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) return;
    const content = message;
    setMessage('');
    await onSend(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50">
          <div className="w-1 h-8 rounded bg-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              ↩ {isPunjabi ? 'ਜਵਾਬ ਦੇ ਰਹੇ ਹੋ' : 'Replying to'} {replyingTo.user.displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {replyingTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
            'flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl',
            'text-sm text-gray-900 dark:text-white placeholder-gray-400',
            'resize-none border-0 focus:outline-none focus:ring-2 focus:ring-amber-500/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all',
            isPunjabi && 'font-gurmukhi'
          )}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending || disabled}
          className={cn(
            'p-2.5 rounded-full transition-all flex-shrink-0',
            message.trim() && !isSending && !disabled
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
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
          <span className={cn(
            'text-xs',
            message.length > 1900 ? 'text-red-500' : 'text-gray-400'
          )}>
            {message.length}/2000
          </span>
        </div>
      )}
    </div>
  );
}
