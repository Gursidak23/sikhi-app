/**
 * Chat Message Bubble Component - Clean design with compact action toolbar
 */

'use client';

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatMessage, ChatUser, MessageReaction } from '../hooks/useChat';

const QUICK_REACTIONS = ['🙏', '❤️', '👍', '✨', '😊'];

interface MessageBubbleProps {
  message: ChatMessage;
  currentUser: ChatUser | null;
  language: Language;
  onReply: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onSave?: (messageId: string) => void;
  onUnsave?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  currentUser,
  language,
  onReply,
  onDelete,
  onSave,
  onUnsave,
  onEdit,
  onToggleReaction,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const isOwn = currentUser?.id === message.userId;
  const isPunjabi = language === 'pa';
  const isOptimistic = (message as any)._optimistic;

  // Can edit within 15 minutes of creation
  const canEdit = isOwn && !isOptimistic && (() => {
    const createdAt = new Date(message.createdAt).getTime();
    const fifteenMin = 15 * 60 * 1000;
    return Date.now() - createdAt < fifteenMin;
  })();

  const displayName = isPunjabi && message.user.displayNameGurmukhi
    ? message.user.displayNameGurmukhi
    : message.user.displayName;

  // Server reactions are already aggregated as { emoji, count, userIds, reacted }
  const serverReactions = message.reactions || [];

  // Close actions when clicking outside
  useEffect(() => {
    if (!showActions) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
        setShowReactions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showActions]);

  // Clean up long-press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  // Focus edit textarea when entering edit mode
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing]);

  const handleReaction = useCallback((emoji: string) => {
    onToggleReaction?.(message.id, emoji);
    setShowReactions(false);
    setShowActions(false);
  }, [message.id, onToggleReaction]);

  const handleEditSubmit = useCallback(() => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit?.(message.id, trimmed);
    }
    setIsEditing(false);
  }, [editContent, message.id, message.content, onEdit]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(message.content);
    }
  }, [handleEditSubmit, message.content]);

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

  // Ephemeral timer: how long until this message disappears
  const getExpiryLabel = () => {
    if (!message.expiresAt || message.isSaved) return null;
    const expiresAt = new Date(message.expiresAt).getTime();
    const now = Date.now();
    const remaining = expiresAt - now;
    if (remaining <= 0) return isPunjabi ? 'ਮਿਆਦ ਪੁੱਗੀ' : 'Expired';
    const hours = Math.floor(remaining / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const expiryLabel = getExpiryLabel();

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
        'group relative flex gap-3 px-4 py-1.5 transition-colors',
        isOwn ? 'flex-row-reverse' : '',
        !isOptimistic && 'hover:bg-gray-50/80 dark:hover:bg-gray-800/30',
        isOptimistic && 'opacity-70'
      )}
      onMouseEnter={() => !isOptimistic && setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactions(false); }}
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
      >
        {getInitials(message.user.displayName)}
      </div>

      {/* Message Content */}
      <div className={cn('max-w-[75%] min-w-0 relative', isOwn && 'text-right')}>
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
          {message.isSaved && (
            <span className="text-[11px] text-amber-500" title={isPunjabi ? 'ਸੇਵ ਕੀਤਾ' : 'Saved'}>
              🔖
            </span>
          )}
          {expiryLabel && !message.isSaved && (
            <span className="text-[10px] text-gray-400/70 tabular-nums flex items-center gap-0.5" title={isPunjabi ? 'ਮਿਆਦ ਪੁੱਗਣ ਤੱਕ' : 'Expires in'}>
              ⏱ {expiryLabel}
            </span>
          )}
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

        {/* Pin indicator */}
        {message.isPinned && (
          <div className={cn('flex items-center gap-1 mb-1', isOwn && 'justify-end')}>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
              📌 {isPunjabi ? 'ਪਿੰਨ ਕੀਤਾ' : 'Pinned'}
            </span>
          </div>
        )}

        {/* Message Body */}
        {isEditing ? (
          <div className="inline-block w-full">
            <textarea
              ref={editInputRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="w-full px-4 py-2.5 text-sm leading-relaxed rounded-2xl border-2 border-amber-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              rows={Math.min(editContent.split('\n').length + 1, 5)}
              maxLength={2000}
            />
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleEditSubmit}
                className="text-xs px-3 py-1 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                {isPunjabi ? 'ਸੇਵ' : 'Save'}
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditContent(message.content); }}
                className="text-xs px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {isPunjabi ? 'ਰੱਦ' : 'Cancel'}
              </button>
              <span className="text-[10px] text-gray-400">
                Enter ↵ {isPunjabi ? 'ਸੇਵ ਕਰੋ' : 'save'} · Esc {isPunjabi ? 'ਰੱਦ ਕਰੋ' : 'cancel'}
              </span>
            </div>
          </div>
        ) : (
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
        )}

        {/* Compact Floating Action Toolbar */}
        {showActions && !isOptimistic && (
          <div
            ref={actionsRef}
            className={cn(
              'absolute z-30 -top-3',
              isOwn ? 'left-0' : 'right-0'
            )}
          >
            <div className="flex items-center gap-0.5 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-1 py-0.5">
              {/* React button — toggles emoji picker */}
              <button
                onClick={() => setShowReactions(!showReactions)}
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors',
                  showReactions
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                😊
              </button>
              {/* Reply */}
              <button
                onClick={() => { onReply(message); setShowActions(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              {/* Save / Unsave */}
              <button
                onClick={() => {
                  if (message.isSaved) {
                    onUnsave?.(message.id);
                  } else {
                    onSave?.(message.id);
                  }
                  setShowActions(false);
                }}
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-full transition-colors',
                  message.isSaved
                    ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    : 'text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                )}
                title={message.isSaved ? (isPunjabi ? 'ਅਣਸੇਵ' : 'Unsave') : (isPunjabi ? 'ਸੇਵ' : 'Save')}
              >
                <svg className="w-4 h-4" fill={message.isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              {/* Delete (own messages only) */}
              {isOwn && (
                <button
                  onClick={() => { onDelete(message.id); setShowActions(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              {/* Edit (own messages within 15 min) */}
              {canEdit && (
                <button
                  onClick={() => { setIsEditing(true); setEditContent(message.content); setShowActions(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title={isPunjabi ? 'ਸੋਧੋ' : 'Edit'}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Emoji Picker Popover */}
            {showReactions && (
              <div className={cn(
                'absolute top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-1.5',
                isOwn ? 'left-0' : 'right-0'
              )}>
                <div className="flex items-center gap-1">
                  {QUICK_REACTIONS.map((emoji) => {
                    const existing = serverReactions.find((r) => r.emoji === emoji);
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className={cn(
                          'w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-all hover:scale-110',
                          existing?.reacted
                            ? 'bg-amber-100 dark:bg-amber-900/30 ring-1 ring-amber-300 dark:ring-amber-700'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        )}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reaction badges (server-persisted) */}
        {serverReactions.length > 0 && (
          <div className={cn('flex flex-wrap gap-1 mt-1', isOwn && 'justify-end')}>
            {serverReactions.map(({ emoji, count, reacted }) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={cn(
                  'inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-xs transition-all border',
                  reacted
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
});

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
