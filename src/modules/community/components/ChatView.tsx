/**
 * Main Chat View - Full chat interface with rooms, messages, and members
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import { useChat } from '../hooks/useChat';
import { ChatRegistration } from './ChatRegistration';
import { RoomSidebar } from './RoomSidebar';
import { MessageBubble, DateDivider } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { MembersPanel } from './MembersPanel';

interface ChatViewProps {
  language: Language;
}

export function ChatView({ language }: ChatViewProps) {
  const {
    user,
    rooms,
    activeRoom,
    messages,
    members,
    isLoading,
    isSending,
    error,
    hasMore,
    replyingTo,
    registerUser,
    selectRoom,
    sendMessage,
    deleteMessage,
    loadMore,
    setReplyingTo,
    logout,
    setError,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const isPunjabi = language === 'pa';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Only auto-scroll if user is near the bottom
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Group messages by date for dividers
  const getMessageDate = (dateStr: string) => new Date(dateStr).toDateString();

  // If user is not registered, show registration form
  if (!user) {
    return <ChatRegistration onRegister={registerUser} language={language} />;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Mobile Room Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 animate-in slide-in-from-left">
            <RoomSidebar
              rooms={rooms}
              activeRoom={activeRoom}
              onSelectRoom={selectRoom}
              language={language}
              onClose={() => setShowMobileSidebar(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Room Sidebar */}
      <div className="hidden md:block w-72 flex-shrink-0">
        <RoomSidebar
          rooms={rooms}
          activeRoom={activeRoom}
          onSelectRoom={selectRoom}
          language={language}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open rooms"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {activeRoom && (
              <>
                <span className="text-xl">{activeRoom.icon}</span>
                <div className="min-w-0">
                  <h2 className={cn(
                    'text-base font-bold text-gray-900 dark:text-white truncate',
                    isPunjabi && 'font-gurmukhi text-lg'
                  )}>
                    {isPunjabi && activeRoom.nameGurmukhi
                      ? activeRoom.nameGurmukhi
                      : activeRoom.name}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {activeRoom._count.members} {isPunjabi ? 'ਮੈਂਬਰ' : 'members'}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                showMembers
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              aria-label={isPunjabi ? 'ਮੈਂਬਰ ਦਿਖਾਓ' : 'Toggle members'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </button>

            <div className="relative group">
              <button
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="User menu"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.displayName.slice(0, 2).toUpperCase()}
                </div>
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className={cn(
                    'text-sm font-medium text-gray-900 dark:text-white',
                    isPunjabi && 'font-gurmukhi'
                  )}>
                    {isPunjabi && user.displayNameGurmukhi
                      ? user.displayNameGurmukhi
                      : user.displayName}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  {isPunjabi ? '🚪 ਬਾਹਰ ਜਾਓ' : '🚪 Sign Out'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className={cn(
                  'text-sm text-gray-400',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {isPunjabi ? 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : 'Loading messages...'}
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-4">
                <span className="text-5xl block mb-4">💭</span>
                <h3 className={cn(
                  'text-lg font-semibold text-gray-900 dark:text-white mb-2',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {isPunjabi ? 'ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ' : 'Start the conversation'}
                </h3>
                <p className={cn(
                  'text-sm text-gray-400',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {isPunjabi
                    ? 'ਪਹਿਲਾ ਸੁਨੇਹਾ ਭੇਜ ਕੇ ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ!'
                    : 'Be the first to send a message!'}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              {/* Load More */}
              {hasMore && (
                <div className="text-center py-3">
                  <button
                    onClick={loadMore}
                    className={cn(
                      'px-4 py-1.5 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors',
                      isPunjabi && 'font-gurmukhi'
                    )}
                  >
                    {isPunjabi ? '⬆️ ਹੋਰ ਲੋਡ ਕਰੋ' : '⬆️ Load earlier messages'}
                  </button>
                </div>
              )}

              {/* Messages with Date Dividers */}
              {messages.map((msg, idx) => {
                const showDivider =
                  idx === 0 ||
                  getMessageDate(msg.createdAt) !== getMessageDate(messages[idx - 1].createdAt);

                return (
                  <div key={msg.id}>
                    {showDivider && (
                      <DateDivider date={msg.createdAt} language={language} />
                    )}
                    <MessageBubble
                      message={msg}
                      currentUser={user}
                      language={language}
                      onReply={setReplyingTo}
                      onDelete={deleteMessage}
                    />
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          onSend={sendMessage}
          isSending={isSending}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          language={language}
          disabled={!activeRoom}
        />
      </div>

      {/* Members Panel (Desktop) */}
      {showMembers && (
        <div className="hidden md:block w-60 flex-shrink-0">
          <MembersPanel
            members={members}
            language={language}
            currentUserId={user.id}
          />
        </div>
      )}
    </div>
  );
}
