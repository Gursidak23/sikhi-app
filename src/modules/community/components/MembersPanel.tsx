/**
 * Members Panel - Enhanced online/offline members with status and search
 */

'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatUser } from '../hooks/useChat';

const MEMBERS_PAGE_SIZE = 20;

interface MembersPanelProps {
  members: ChatUser[];
  language: Language;
  currentUserId?: string;
}

export function MembersPanel({ members, language, currentUserId }: MembersPanelProps) {
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';
  const [search, setSearch] = useState('');
  const [offlineVisible, setOfflineVisible] = useState(MEMBERS_PAGE_SIZE);

  const onlineMembers = members.filter((m) => m.isOnline);
  const offlineMembers = members.filter((m) => !m.isOnline);

  const filterMembers = (list: ChatUser[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(m =>
      m.displayName.toLowerCase().includes(q) ||
      (m.displayNameGurmukhi && m.displayNameGurmukhi.includes(q))
    );
  };

  const filteredOnline = filterMembers(onlineMembers);
  const filteredOffline = filterMembers(offlineMembers);
  const paginatedOffline = useMemo(
    () => filteredOffline.slice(0, offlineVisible),
    [filteredOffline, offlineVisible]
  );
  const hasMoreOffline = filteredOffline.length > offlineVisible;

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  const formatLastSeen = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 5) return isPunjabi ? 'ਹੁਣੇ' : isHindi ? 'अभी' : 'just now';
    if (diffMins < 60) return `${diffMins}${isPunjabi ? ' ਮਿੰਟ' : isHindi ? ' मिनट' : 'm'}`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}${isPunjabi ? ' ਘੰਟੇ' : isHindi ? ' घंटे' : 'h'}`;
    return date.toLocaleDateString(isPunjabi ? 'pa-IN' : isHindi ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const renderMember = (member: ChatUser) => {
    const isYou = member.id === currentUserId;
    const displayName = isPunjabi && member.displayNameGurmukhi
      ? member.displayNameGurmukhi
      : member.displayName;

    return (
      <div
        key={member.id}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors',
          isYou
            ? 'bg-amber-50/50 dark:bg-amber-900/10'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
        )}
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
            style={{ backgroundColor: member.avatarColor }}
          >
            {getInitials(member.displayName)}
          </div>
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
              member.isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn(
            'text-sm font-medium text-gray-900 dark:text-white truncate',
            isPunjabi && 'font-gurmukhi',
            isHindi && 'font-devanagari'
          )}>
            {displayName}
            {isYou && (
              <span className="ml-1.5 text-[11px] text-amber-500 font-normal">
                ({isPunjabi ? 'ਤੁਸੀਂ' : isHindi ? 'आप' : 'you'})
              </span>
            )}
          </div>
          {!member.isOnline && member.lastSeenAt && (
            <p className="text-[11px] text-gray-400 mt-0.5">
              {formatLastSeen(member.lastSeenAt)}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-l border-gray-100 dark:border-gray-800">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className={cn(
          'text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2',
          isPunjabi && 'font-gurmukhi text-base',
          isHindi && 'font-devanagari text-base'
        )}>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
          </svg>
          {isPunjabi ? 'ਮੈਂਬਰ' : isHindi ? 'सदस्य' : 'Members'}
          <span className="text-xs font-normal text-gray-400 ml-auto">
            {members.length}
          </span>
        </h3>

        {/* Member search */}
        {members.length > 5 && (
          <div className="mt-3 relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isPunjabi ? 'ਮੈਂਬਰ ਲੱਭੋ...' : isHindi ? 'सदस्य खोजें...' : 'Search members...'}
              className={cn(
                'w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg',
                'text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all',
                isPunjabi && 'font-gurmukhi',
                isHindi && 'font-devanagari'
              )}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* Online */}
        {filteredOnline.length > 0 && (
          <div className="mb-3">
            <div className="px-4 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                {isPunjabi ? 'ਔਨਲਾਈਨ' : isHindi ? 'ऑनलाइन' : 'Online'} — {filteredOnline.length}
              </span>
            </div>
            {filteredOnline.map(renderMember)}
          </div>
        )}

        {/* Offline (paginated) */}
        {filteredOffline.length > 0 && (
          <div>
            <div className="px-4 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {isPunjabi ? 'ਔਫ਼ਲਾਈਨ' : isHindi ? 'ऑफलाइन' : 'Offline'} — {filteredOffline.length}
              </span>
            </div>
            {paginatedOffline.map(renderMember)}
            {hasMoreOffline && (
              <div className="px-3 py-2">
                <button
                  onClick={() => setOfflineVisible((v) => v + MEMBERS_PAGE_SIZE)}
                  className={cn(
                    'w-full py-2 text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 rounded-lg transition-colors',
                    isPunjabi && 'font-gurmukhi',
                    isHindi && 'font-devanagari'
                  )}
                >
                  {isPunjabi ? `ਹੋਰ ਦਿਖਾਓ (${filteredOffline.length - offlineVisible} ਬਾਕੀ)` :
                   isHindi ? `और दिखाएं (${filteredOffline.length - offlineVisible} शेष)` :
                   `Show more (${filteredOffline.length - offlineVisible} remaining)`}
                </button>
              </div>
            )}
          </div>
        )}

        {members.length === 0 && (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
              </svg>
            </div>
            <p className={cn(
              'text-sm text-gray-400',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਕੋਈ ਮੈਂਬਰ ਨਹੀਂ' : isHindi ? 'कोई सदस्य नहीं' : 'No members yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
