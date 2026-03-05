/**
 * Search Panel - Search messages and view pinned messages
 * 
 * Features:
 * - Full-text message search across current room
 * - Pinned messages tab
 * - Click to scroll to message in chat
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatMessage } from '../store/chatStore';
import { useChatMessages } from '../hooks/useChatMessages';

interface SearchPanelProps {
  language: Language;
  onClose: () => void;
  onScrollToMessage?: (messageId: string) => void;
}

type SearchTab = 'search' | 'pinned';

export function SearchPanel({ language, onClose, onScrollToMessage }: SearchPanelProps) {
  const [activeTab, setActiveTab] = useState<SearchTab>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChatMessage[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [total, setTotal] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { searchMessages, getPinnedMessages } = useChatMessages();
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  // Load pinned messages on mount
  useEffect(() => {
    getPinnedMessages().then((pinned) => {
      setPinnedMessages(pinned);
    });
  }, [getPinnedMessages]);

  // Focus search input on mount
  useEffect(() => {
    if (activeTab === 'search') {
      inputRef.current?.focus();
    }
  }, [activeTab]);

  const handleSearch = useCallback((searchQuery: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery(searchQuery);

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setTotal(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const data = await searchMessages(searchQuery.trim());
      setResults(data.results || []);
      setTotal(data.total || 0);
      setIsSearching(false);
    }, 300);
  }, [searchMessages]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isPunjabi ? 'pa-IN' : isHindi ? 'hi-IN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const highlightQuery = (text: string, q: string) => {
    if (!q.trim()) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-800/50 rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  const renderMessage = (msg: ChatMessage, showHighlight: boolean) => (
    <button
      key={msg.id}
      onClick={() => onScrollToMessage?.(msg.id)}
      className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
          style={{ backgroundColor: msg.user.avatarColor }}
        >
          {msg.user.displayName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <span className={cn(
              'text-xs font-semibold text-gray-900 dark:text-white truncate',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {msg.user.displayName}
            </span>
            <span className="text-[10px] text-gray-400 whitespace-nowrap">
              {formatTime(msg.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-words">
            {showHighlight ? highlightQuery(msg.content, query) : msg.content}
          </p>
        </div>
        <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className={cn(
            'text-sm font-bold text-gray-900 dark:text-white',
            isPunjabi && 'font-gurmukhi',
            isHindi && 'font-devanagari'
          )}>
            {isPunjabi ? 'ਖੋਜ' : isHindi ? 'खोज' : 'Search'}
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

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800">
        {([
          { key: 'search' as SearchTab, label: isPunjabi ? 'ਖੋਜ' : isHindi ? 'खोज' : 'Search', icon: '🔍' },
          { key: 'pinned' as SearchTab, label: isPunjabi ? 'ਪਿੰਨ ਕੀਤੇ' : isHindi ? 'पिन किए' : 'Pinned', icon: '📌', count: pinnedMessages.length },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors',
              activeTab === tab.key
                ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <span>{tab.icon}</span>
            <span className={cn(isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {tab.label}
            </span>
            {'count' in tab && tab.count! > 0 && (
              <span className="ml-1 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'search' && (
          <div className="p-3">
            {/* Search Input */}
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={isPunjabi ? 'ਸੁਨੇਹੇ ਖੋਜੋ...' : isHindi ? 'संदेश खोजें...' : 'Search messages...'}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Results */}
            {query.trim().length >= 2 && !isSearching && (
              <p className={cn(
                'text-xs text-gray-400 mb-2 px-1',
                isPunjabi && 'font-gurmukhi',
                isHindi && 'font-devanagari'
              )}>
                {total > 0
                  ? `${total} ${isPunjabi ? 'ਨਤੀਜੇ' : isHindi ? 'परिणाम' : 'results'}`
                  : (isPunjabi ? 'ਕੋਈ ਨਤੀਜੇ ਨਹੀਂ' : isHindi ? 'कोई परिणाम नहीं' : 'No results')
                }
              </p>
            )}

            <div className="space-y-1">
              {results.map((msg) => renderMessage(msg, true))}
            </div>

            {query.trim().length < 2 && results.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl mb-3 block">🔍</span>
                <p className={cn(
                  'text-sm text-gray-400',
                  isPunjabi && 'font-gurmukhi',
                  isHindi && 'font-devanagari'
                )}>
                  {isPunjabi ? 'ਸੁਨੇਹੇ ਖੋਜਣ ਲਈ ਲਿਖੋ' : isHindi ? 'संदेश खोजने के लिए लिखें' : 'Type to search messages'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pinned' && (
          <div className="p-3 space-y-1">
            {pinnedMessages.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-3 block">📌</span>
                <p className={cn(
                  'text-sm text-gray-400',
                  isPunjabi && 'font-gurmukhi',
                  isHindi && 'font-devanagari'
                )}>
                  {isPunjabi ? 'ਕੋਈ ਪਿੰਨ ਕੀਤਾ ਸੁਨੇਹਾ ਨਹੀਂ' : isHindi ? 'कोई पिन किया संदेश नहीं' : 'No pinned messages yet'}
                </p>
              </div>
            ) : (
              pinnedMessages.map((msg) => renderMessage(msg, false))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
