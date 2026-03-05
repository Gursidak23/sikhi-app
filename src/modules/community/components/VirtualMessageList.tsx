/**
 * Virtual Message List - Uses @tanstack/react-virtual for efficient
 * rendering of large message lists.
 * 
 * Features:
 * - Only renders visible messages + overscan
 * - Dynamic measurement for variable-height messages
 * - Auto-scroll to bottom on new messages (if near bottom)
 * - "New messages" button when scrolled up
 * - Date dividers between message groups
 * - Load more button at top
 */

'use client';

import { useRef, useEffect, useCallback, useState, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatMessage, ChatUser } from '../store/chatStore';
import { MessageBubble, DateDivider } from './MessageBubble';

interface VirtualMessageListProps {
  messages: ChatMessage[];
  currentUser: ChatUser | null;
  language: Language;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onReply: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onSave?: (messageId: string) => void;
  onUnsave?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onMarkActive: () => void;
}

// Build items list: messages with date dividers interspersed
type ListItem =
  | { type: 'divider'; date: string; key: string }
  | { type: 'message'; message: ChatMessage; key: string }
  | { type: 'load-more'; key: string };

function buildItems(messages: ChatMessage[], hasMore: boolean): ListItem[] {
  const items: ListItem[] = [];

  if (hasMore) {
    items.push({ type: 'load-more', key: '__load-more__' });
  }

  let lastDate = '';
  for (const msg of messages) {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== lastDate) {
      lastDate = msgDate;
      items.push({ type: 'divider', date: msg.createdAt, key: `div-${msgDate}` });
    }
    items.push({ type: 'message', message: msg, key: msg.id });
  }

  return items;
}

export const VirtualMessageList = memo(function VirtualMessageList({
  messages,
  currentUser,
  language,
  hasMore,
  isLoading,
  onLoadMore,
  onReply,
  onDelete,
  onSave,
  onUnsave,
  onEdit,
  onToggleReaction,
  onMarkActive,
}: VirtualMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [showNewMsg, setShowNewMsg] = useState(false);
  const prevLenRef = useRef(0);
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  const items = buildItems(messages, hasMore);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = items[index];
      if (!item) return 60;
      if (item.type === 'load-more') return 48;
      if (item.type === 'divider') return 36;
      return 72; // estimated average message height
    },
    overscan: 10,
    getItemKey: (index) => items[index]?.key ?? index,
  });

  // Auto-scroll to bottom when new messages arrive (if near bottom)
  useEffect(() => {
    const container = parentRef.current;
    if (!container || messages.length === 0) return;

    if (messages.length > prevLenRef.current) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
      const latestMsg = messages[messages.length - 1];
      const isOwnMessage = latestMsg?.userId === currentUser?.id;

      if (isNearBottom || isOwnMessage) {
        requestAnimationFrame(() => {
          virtualizer.scrollToIndex(items.length - 1, { align: 'end', behavior: 'smooth' });
        });
        setShowNewMsg(false);
      } else if (!isOwnMessage) {
        setShowNewMsg(true);
      }
    }

    prevLenRef.current = messages.length;
  }, [messages, currentUser?.id, items.length, virtualizer]);

  const scrollToBottom = useCallback(() => {
    virtualizer.scrollToIndex(items.length - 1, { align: 'end', behavior: 'smooth' });
    setShowNewMsg(false);
  }, [virtualizer, items.length]);

  const handleScroll = useCallback(() => {
    const container = parentRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (isNearBottom && showNewMsg) setShowNewMsg(false);
  }, [showNewMsg]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-amber-200 dark:border-amber-800 rounded-full" />
            <div className="absolute inset-0 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className={cn('text-sm text-gray-400', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi ? 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : isHindi ? 'संदेश लोड हो रहे हैं...' : 'Loading messages...'}
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center px-6 max-w-sm">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <h3 className={cn('text-lg font-bold text-gray-900 dark:text-white mb-2', isPunjabi && 'font-gurmukhi text-xl', isHindi && 'font-devanagari text-xl')}>
            {isPunjabi ? 'ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ' : isHindi ? 'बातचीत शुरू करें' : 'Start the conversation'}
          </h3>
          <p className={cn('text-sm text-gray-400 leading-relaxed', isPunjabi && 'font-gurmukhi')}>
            {isPunjabi ? 'ਪਹਿਲਾ ਸੁਨੇਹਾ ਭੇਜ ਕੇ ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ!' : isHindi ? 'पहला संदेश भेजकर बातचीत शुरू करें!' : 'Be the first to send a message!'}
          </p>
        </div>
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-y-auto scroll-smooth relative overscroll-contain"
      onClick={onMarkActive}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          if (!item) return null;

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {item.type === 'load-more' && (
                <div className="text-center py-3">
                  <button
                    onClick={onLoadMore}
                    className={cn(
                      'inline-flex items-center gap-2 px-5 py-2 text-sm text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 rounded-xl transition-all font-medium',
                      isPunjabi && 'font-gurmukhi'
                    )}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {isPunjabi ? 'ਹੋਰ ਲੋਡ ਕਰੋ' : isHindi ? 'पुराने संदेश लोड करें' : 'Load earlier messages'}
                  </button>
                </div>
              )}
              {item.type === 'divider' && (
                <DateDivider date={item.date} language={language} />
              )}
              {item.type === 'message' && (
                <div id={`msg-${item.message.id}`} className="transition-all duration-300 rounded-lg">
                  <MessageBubble
                    message={item.message}
                    currentUser={currentUser}
                    language={language}
                    onReply={onReply}
                    onDelete={onDelete}
                    onSave={onSave}
                    onUnsave={onUnsave}
                    onEdit={onEdit}
                    onToggleReaction={onToggleReaction}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* "New messages" scroll button */}
      {showNewMsg && (
        <button
          onClick={scrollToBottom}
          className="sticky bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-full shadow-lg shadow-amber-500/30 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          {isPunjabi ? 'ਨਵੇਂ ਸੁਨੇਹੇ' : isHindi ? 'नए संदेश' : 'New messages'}
        </button>
      )}
    </div>
  );
});
