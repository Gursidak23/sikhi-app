/**
 * Members Panel - Shows online/offline members in the room
 */

'use client';

import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatUser } from '../hooks/useChat';

interface MembersPanelProps {
  members: ChatUser[];
  language: Language;
  currentUserId?: string;
}

export function MembersPanel({ members, language, currentUserId }: MembersPanelProps) {
  const isPunjabi = language === 'pa';
  const onlineMembers = members.filter((m) => m.isOnline);
  const offlineMembers = members.filter((m) => !m.isOnline);

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

  const formatLastSeen = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 5) return isPunjabi ? 'ਹੁਣੇ' : 'just now';
    if (diffMins < 60) return `${diffMins}${isPunjabi ? ' ਮਿੰਟ' : 'm'}`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}${isPunjabi ? ' ਘੰਟੇ' : 'h'}`;
    return date.toLocaleDateString(isPunjabi ? 'pa-IN' : 'en-US', { month: 'short', day: 'numeric' });
  };

  const renderMember = (member: ChatUser) => {
    const isYou = member.id === currentUserId;
    const displayName = isPunjabi && member.displayNameGurmukhi
      ? member.displayNameGurmukhi
      : member.displayName;

    return (
      <div
        key={member.id}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
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
            isPunjabi && 'font-gurmukhi'
          )}>
            {displayName}
            {isYou && (
              <span className="ml-1.5 text-xs text-amber-500 font-normal">
                ({isPunjabi ? 'ਤੁਸੀਂ' : 'you'})
              </span>
            )}
          </div>
          {!member.isOnline && member.lastSeenAt && (
            <p className="text-xs text-gray-400">
              {formatLastSeen(member.lastSeenAt)}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className={cn(
          'text-sm font-bold text-gray-900 dark:text-white',
          isPunjabi && 'font-gurmukhi text-base'
        )}>
          {isPunjabi ? 'ਮੈਂਬਰ' : 'Members'} ({members.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* Online */}
        {onlineMembers.length > 0 && (
          <div className="mb-3">
            <div className="px-3 py-1">
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                {isPunjabi ? 'ਔਨਲਾਈਨ' : 'Online'} — {onlineMembers.length}
              </span>
            </div>
            {onlineMembers.map(renderMember)}
          </div>
        )}

        {/* Offline */}
        {offlineMembers.length > 0 && (
          <div>
            <div className="px-3 py-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {isPunjabi ? 'ਔਫ਼ਲਾਈਨ' : 'Offline'} — {offlineMembers.length}
              </span>
            </div>
            {offlineMembers.map(renderMember)}
          </div>
        )}

        {members.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className={cn(
              'text-sm text-gray-400',
              isPunjabi && 'font-gurmukhi'
            )}>
              {isPunjabi ? 'ਕੋਈ ਮੈਂਬਰ ਨਹੀਂ' : 'No members yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
