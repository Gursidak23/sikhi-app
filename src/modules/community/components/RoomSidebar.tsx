/**
 * Chat Room Sidebar - Room list with member counts
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
}

export function RoomSidebar({ rooms, activeRoom, onSelectRoom, language, onClose }: RoomSidebarProps) {
  const isPunjabi = language === 'pa';

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className={cn(
            'text-lg font-bold text-gray-900 dark:text-white',
            isPunjabi && 'font-gurmukhi'
          )}>
            {isPunjabi ? 'ਕਮਰੇ' : 'Rooms'}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {rooms.map((room) => {
          const isActive = activeRoom?.id === room.id;
          const displayName = isPunjabi && room.nameGurmukhi ? room.nameGurmukhi : room.name;
          const displayDesc = isPunjabi && room.descriptionGurmukhi
            ? room.descriptionGurmukhi
            : room.description;

          return (
            <button
              key={room.id}
              onClick={() => {
                onSelectRoom(room);
                onClose?.();
              }}
              className={cn(
                'w-full text-left px-3 py-3 rounded-xl transition-all group',
                isActive
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 shadow-sm'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{room.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className={cn(
                    'font-medium text-sm truncate',
                    isPunjabi && 'font-gurmukhi text-base'
                  )}>
                    {displayName}
                  </div>
                  {displayDesc && (
                    <p className={cn(
                      'text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5',
                      isPunjabi && 'font-gurmukhi'
                    )}>
                      {displayDesc}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {room._count.members} 👤
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
