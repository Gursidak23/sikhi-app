/**
 * Chat Room Sidebar - Enhanced room list with unread badges
 */

'use client';

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
            <h2 className={cn(
              'text-base font-bold text-gray-900 dark:text-white',
              isPunjabi && 'font-gurmukhi text-lg'
            )}>
              {isPunjabi ? 'ਕਮਰੇ' : 'Rooms'}
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {rooms.map((room) => {
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
                      isPunjabi && 'font-gurmukhi text-base'
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
                      isPunjabi && 'font-gurmukhi'
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
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/10">
          <span className="text-xs">🙏</span>
          <span className={cn(
            'text-xs text-amber-700/80 dark:text-amber-400/70',
            isPunjabi && 'font-gurmukhi'
          )}>
            {isPunjabi ? 'ਸਤਿਕਾਰ ਨਾਲ ਗੱਲ ਕਰੋ' : 'Speak with respect'}
          </span>
        </div>
      </div>
    </div>
  );
}
