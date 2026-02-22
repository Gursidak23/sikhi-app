/**
 * Chat Message Bubble Component - Enhanced with reactions and optimistic state
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatMessage, ChatUser } from '../hooks/useChat';

const QUICK_REACTIONS = ['🙏', '❤️', '👍', '✨', '😊'];

interface MessageBubbleProps {
  message: ChatMessage;
  currentUser: ChatUser | null;
  language: Language;
  onReply: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
}

export function MessageBubble({
  message,
  currentUser,
  language,
  onReply,
  onDelete,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOwn = currentUser?.id === message.userId;
  const isPunjabi = language === 'pa';
  const isOptimistic = (message as any)._optimistic;

  const displayName = isPunjabi && message.user.displayNameGurmukhi
    ? message.user.displayNameGurmukhi
    : message.user.displayName;

  const toggleReaction = useCallback((emoji: string) => {
    setReactions(prev => {
      const next = { ...prev };
      if (myReaction === emoji) {
        // Un-react
        next[emoji] = (next[emoji] || 1) - 1;
        if (next[emoji] <= 0) delete next[emoji];
        setMyReaction(null);
      } else {
        // Remove old reaction
        if (myReaction) {
          next[myReaction] = (next[myReaction] || 1) - 1;
          if (next[myReaction] <= 0) delete next[myReaction];
        }
        // Add new reaction
        next[emoji] = (next[emoji] || 0) + 1;
        setMyReaction(emoji);
      }
      return next;
    });
  }, [myReaction]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return isPunjabi ? 'ਹੁਣੇ' : 'just now';
    if (diffMins < 60) return `${diffMins}${isPunjabi ? ' ਮਿੰਟ ਪਹਿਲਾਂ' : 'm ago'}`;
    if (diffHours < 24) return `${diffHours}${isPunjabi ? ' ਘੰਟੇ ਪਹਿਲਾਂ' : 'h ago'}`;
    return date.toLocaleDateString(isPunjabi ? 'pa-IN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  if (message.isDeleted) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className={cn(
            'text-xs text-gray-400 italic',
            isPunjabi && 'font-gurmukhi'
          )}>
            {isPunjabi ? 'ਸੁਨੇਹਾ ਮਿਟਾਇਆ ਗਿਆ' : 'Message deleted'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 py-1.5 transition-colors',
        isOwn ? 'flex-row-reverse' : '',
        !isOptimistic && 'hover:bg-gray-50/80 dark:hover:bg-gray-800/30',
        isOptimistic && 'opacity-70'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onTouchStart={() => {
        longPressTimerRef.current = setTimeout(() => setShowActions(true), 500);
      }}
      onTouchEnd={() => {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      }}
      onTouchMove={() => {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      }}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm ring-2 ring-white dark:ring-gray-900',
          isOptimistic && 'animate-pulse'
        )}
        style={{ backgroundColor: message.user.avatarColor }}
        title={message.user.displayName}
      >
        {getInitials(message.user.displayName)}
      </div>

      {/* Message Content */}
      <div className={cn('max-w-[75%] min-w-0', isOwn && 'text-right')}>
        {/* Header */}
        <div className={cn(
          'flex items-center gap-2 mb-1',
          isOwn && 'flex-row-reverse'
        )}>
          <span className={cn(
            'text-sm font-semibold text-gray-900 dark:text-white',
            isPunjabi && 'font-gurmukhi'
          )}>
            {displayName}
          </span>
          <span className="text-[11px] text-gray-400 tabular-nums">
            {isOptimistic ? (isPunjabi ? 'ਭੇਜ ਰਿਹਾ...' : 'Sending...') : formatTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-[11px] text-gray-400 italic">
              ({isPunjabi ? 'ਸੋਧਿਆ' : 'edited'})
            </span>
          )}
        </div>

        {/* Reply Reference */}
        {message.replyTo && (
          <div className={cn(
            'mb-1.5 px-3 py-2 rounded-xl text-xs border-l-[3px] border-amber-400',
            isOwn
              ? 'bg-amber-50 dark:bg-amber-900/10 ml-auto'
              : 'bg-gray-50 dark:bg-gray-800/50'
          )}>
            <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              {message.replyTo.user.displayName}
            </span>
            <p className="text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {message.replyTo.content}
            </p>
          </div>
        )}

        {/* Message Body */}
        <div
          className={cn(
            'inline-block px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap',
            isOwn
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl rounded-tr-md shadow-sm shadow-amber-500/20'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-md'
          )}
        >
          {message.content}
        </div>

        {/* Action Buttons */}
        {showActions && !isOptimistic && (
          <div className={cn(
            'flex items-center gap-0.5 mt-1',
            isOwn && 'flex-row-reverse'
          )}>
            {/* Quick Reactions */}
            <div className="flex items-center gap-0.5 mr-1">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  className={cn(
                    'p-1.5 sm:p-1 min-w-[36px] min-h-[36px] sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-md text-sm transition-all hover:scale-125',
                    myReaction === emoji
                      ? 'bg-amber-100 dark:bg-amber-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  title={"Reactions are temporary and only visible to you"}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
            <button
              onClick={() => onReply(message)}
              className="p-2 min-w-[40px] min-h-[40px] sm:p-1.5 sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
              title={isPunjabi ? 'ਜਵਾਬ' : 'Reply'}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            {isOwn && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-2 min-w-[40px] min-h-[40px] sm:p-1.5 sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                title={isPunjabi ? 'ਮਿਟਾਓ' : 'Delete'}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {/* Dismiss button for mobile */}
            <button
              onClick={() => setShowActions(false)}
              className="md:hidden p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ml-0.5"
              aria-label="Close actions"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Reaction badges */}
        {Object.keys(reactions).length > 0 && (
          <div className={cn('flex flex-wrap gap-1 mt-1', isOwn && 'justify-end')}>
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className={cn(
                  'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all border',
                  myReaction === emoji
                    ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <span>{emoji}</span>
                <span className="text-gray-500 dark:text-gray-400 font-medium">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// System Message / Date Divider
// ============================================================================

interface DateDividerProps {
  date: string;
  language: Language;
}

export function DateDivider({ date, language }: DateDividerProps) {
  const isPunjabi = language === 'pa';
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let label: string;
  if (d.toDateString() === today.toDateString()) {
    label = isPunjabi ? 'ਅੱਜ' : 'Today';
  } else if (d.toDateString() === yesterday.toDateString()) {
    label = isPunjabi ? 'ਕੱਲ੍ਹ' : 'Yesterday';
  } else {
    label = d.toLocaleDateString(isPunjabi ? 'pa-IN' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
      <span className={cn(
        'text-xs font-semibold text-gray-400 dark:text-gray-500 px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800/50',
        isPunjabi && 'font-gurmukhi'
      )}>
        {label}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
    </div>
  );
}
