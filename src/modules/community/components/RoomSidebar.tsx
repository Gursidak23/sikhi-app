/**
 * Chat Room Sidebar - Enhanced room list with unread badges, search, stats
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import type { ChatRoom } from '../hooks/useChat';

interface RoomSidebarProps {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  onSelectRoom: (room: ChatRoom) => void;
  language: Language;
  onClose?: () => void;
  unreadCounts?: Record<string, number>;
}

export function RoomSidebar({ rooms, activeRoom, onSelectRoom, language, onClose, unreadCounts = {} }: RoomSidebarProps) {
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';
  const [search, setSearch] = useState('');

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const totalMembers = rooms.reduce((a, r) => a + (r._count?.members || 0), 0);

  const filteredRooms = rooms.filter((room) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      room.name.toLowerCase().includes(q) ||
      (room.nameGurmukhi && room.nameGurmukhi.includes(q)) ||
      (room.description && room.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-r border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className={cn(
                'text-base font-bold text-gray-900 dark:text-white',
                isPunjabi && 'font-gurmukhi text-lg',
                isHindi && 'font-devanagari text-lg'
              )}>
                {isPunjabi ? 'ਕਮਰੇ' : isHindi ? 'कमरे' : 'Rooms'}
              </h2>
              {totalUnread > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {totalUnread} {isPunjabi ? 'ਨਵੇਂ' : isHindi ? 'नए' : 'unread'}
                </p>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 mt-3 px-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {rooms.length === 0
              ? <span className="inline-block w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              : <>{rooms.length} {isPunjabi ? 'ਕਮਰੇ' : isHindi ? 'कमरे' : 'rooms'}</>}
          </div>
          <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
            </svg>
            {rooms.length === 0
              ? <span className="inline-block w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              : <>{totalMembers} {isPunjabi ? 'ਮੈਂਬਰ' : isHindi ? 'सदस्य' : 'members'}</>}
          </div>
        </div>

        {/* Search Rooms */}
        {rooms.length > 3 && (
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
              placeholder={isPunjabi ? 'ਕਮਰਾ ਲੱਭੋ...' : isHindi ? 'कमरा खोजें...' : 'Search rooms...'}
              className={cn(
                'w-full pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg',
                'text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-400 transition-all',
                isPunjabi && 'font-gurmukhi',
                isHindi && 'font-devanagari'
              )}
            />
          </div>
        )}
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {rooms.length === 0 ? (
          /* Loading skeleton */
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 w-40 bg-gray-50 dark:bg-gray-800/50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
        filteredRooms.map((room) => {
          const isActive = activeRoom?.id === room.id;
          const displayName = isPunjabi && room.nameGurmukhi ? room.nameGurmukhi : room.name;
          const displayDesc = isPunjabi && room.descriptionGurmukhi
            ? room.descriptionGurmukhi
            : room.description;
          const unread = unreadCounts[room.id] || 0;

          return (
            <button
              key={room.id}
              onClick={() => {
                onSelectRoom(room);
                onClose?.();
              }}
              className={cn(
                'w-full text-left px-3 py-3 rounded-xl transition-all group relative',
                isActive
                  ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 shadow-sm border border-amber-200/50 dark:border-amber-800/30'
                  : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/50 border border-transparent'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg transition-all',
                  isActive
                    ? 'bg-amber-200/60 dark:bg-amber-800/30'
                    : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                )}>
                  {room.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'font-semibold text-sm truncate',
                      isActive ? 'text-amber-900 dark:text-amber-200' : 'text-gray-700 dark:text-gray-300',
                      isPunjabi && 'font-gurmukhi text-base',
                      isHindi && 'font-devanagari text-base'
                    )}>
                      {displayName}
                    </span>
                    {unread > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-amber-500 rounded-full shadow-sm animate-in zoom-in">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                  {displayDesc && (
                    <p className={cn(
                      'text-xs truncate mt-0.5',
                      isActive ? 'text-amber-700/70 dark:text-amber-300/60' : 'text-gray-400 dark:text-gray-500',
                      isPunjabi && 'font-gurmukhi',
                      isHindi && 'font-devanagari'
                    )}>
                      {displayDesc}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span className={cn(
                    'text-xs',
                    isActive ? 'text-amber-600/70 dark:text-amber-400/70' : 'text-gray-400 dark:text-gray-500'
                  )}>
                    {room._count.members} 👤
                  </span>
                </div>
              </div>
            </button>
          );
        })
        )}

        {/* No search results */}
        {search.trim() && filteredRooms.length === 0 && (
          <div className="text-center py-6 px-3">
            <p className={cn(
              'text-xs text-gray-400',
              isPunjabi && 'font-gurmukhi text-sm',
              isHindi && 'font-devanagari text-sm'
            )}>
              {isPunjabi ? 'ਕੋਈ ਕਮਰਾ ਨਹੀਂ ਮਿਲਿਆ' : isHindi ? 'कोई कमरा नहीं मिला' : 'No rooms found'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/10">
          <span className="text-xs">🙏</span>
          <span className={cn(
            'text-xs text-amber-700/80 dark:text-amber-400/70',
            isPunjabi && 'font-gurmukhi',
            isHindi && 'font-devanagari'
          )}>
            {isPunjabi ? 'ਸਤਿਕਾਰ ਨਾਲ ਗੱਲ ਕਰੋ' : isHindi ? 'सम्मान से बात करें' : 'Speak with respect'}
          </span>
        </div>
      </div>
    </div>
  );
}
