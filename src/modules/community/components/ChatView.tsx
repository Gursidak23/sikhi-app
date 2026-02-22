/**
 * Main Chat View - Full chat interface with rooms, messages, members
 * 
 * Features:
 * - Connection status indicator
 * - Unread badges on rooms
 * - Mobile-first responsive design
 * - Glass-morphism design elements
 */

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
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
    connectionStatus,
    unreadCounts,
    onlineCount,
    typingUsers,
    registerUser,
    selectRoom,
    sendMessage,
    deleteMessage,
    loadMore,
    setReplyingTo,
    logout,
    setError,
    reconnect,
    markActive,
    sendTypingIndicator,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userMenuBtnRef = useRef<HTMLButtonElement>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showNewMsgButton, setShowNewMsgButton] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const prevMessageCountRef = useRef(0);
  const isPunjabi = language === 'pa';

  // Smart auto-scroll: scroll if near bottom, else show "New messages" button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    if (messages.length > prevMessageCountRef.current) {
      const latestMsg = messages[messages.length - 1];
      const isOwnMessage = latestMsg?.userId === user?.id;
      if (isNearBottom || isOwnMessage) {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
        setShowNewMsgButton(false);
      } else if (!isOwnMessage) {
        setShowNewMsgButton(true);
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, user?.id]);

  const onScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (isNearBottom && showNewMsgButton) setShowNewMsgButton(false);
  }, [showNewMsgButton]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowNewMsgButton(false);
  }, []);

  // Group messages by date for dividers
  const getMessageDate = (dateStr: string) => new Date(dateStr).toDateString();

  // If user is not registered, show registration form
  if (!user) {
    return <ChatRegistration onRegister={registerUser} language={language} />;
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] sm:h-[calc(100vh-9rem)] rounded-2xl shadow-2xl border border-amber-200/30 dark:border-gray-700/50 overflow-hidden bg-white dark:bg-gray-900">
      {/* Mobile Room Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-80 animate-in slide-in-from-left shadow-2xl">
            <RoomSidebar
              rooms={rooms}
              activeRoom={activeRoom}
              onSelectRoom={selectRoom}
              language={language}
              onClose={() => setShowMobileSidebar(false)}
              unreadCounts={unreadCounts}
            />
          </div>
        </div>
      )}

      {/* Desktop Room Sidebar */}
      <div className="hidden md:block w-72 lg:w-80 flex-shrink-0">
        <RoomSidebar
          rooms={rooms}
          activeRoom={activeRoom}
          onSelectRoom={selectRoom}
          language={language}
          unreadCounts={unreadCounts}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="relative z-40 flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-amber-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              aria-label="Open rooms"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {activeRoom && (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{activeRoom.icon}</span>
                </div>
                <div className="min-w-0">
                  <h2 className={cn(
                    'text-sm font-bold text-gray-900 dark:text-white truncate',
                    isPunjabi && 'font-gurmukhi text-base'
                  )}>
                    {isPunjabi && activeRoom.nameGurmukhi
                      ? activeRoom.nameGurmukhi
                      : activeRoom.name}
                  </h2>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    {onlineCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        {onlineCount} {isPunjabi ? 'ਔਨਲਾਈਨ' : 'online'}
                      </span>
                    )}
                    {onlineCount > 0 && <span>·</span>}
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                      </svg>
                      {members.length || activeRoom._count.members}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Connection Status */}
            {connectionStatus !== 'connected' && (
              <button
                onClick={reconnect}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  connectionStatus === 'reconnecting'
                    ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100'
                )}
              >
                {connectionStatus === 'reconnecting' ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    {isPunjabi ? 'ਜੋੜ ਰਿਹਾ...' : 'Reconnecting...'}
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    {isPunjabi ? 'ਮੁੜ ਜੋੜੋ' : 'Reconnect'}
                  </>
                )}
              </button>
            )}

            {/* Members Toggle */}
            <button
              onClick={() => setShowMembers(!showMembers)}
              className={cn(
                'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all',
                showMembers
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600'
              )}
              aria-label={isPunjabi ? 'ਮੈਂਬਰ ਦਿਖਾਓ' : 'Toggle members'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                ref={userMenuBtnRef}
                onClick={() => {
                  if (!showUserMenu && userMenuBtnRef.current) {
                    const rect = userMenuBtnRef.current.getBoundingClientRect();
                    setMenuPos({
                      top: rect.bottom + 4,
                      right: window.innerWidth - rect.right,
                    });
                  }
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center justify-center p-1.5 min-w-[44px] min-h-[44px] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="User menu"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.displayName.slice(0, 2).toUpperCase()}
                </div>
              </button>
              {showUserMenu && menuPos && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setShowUserMenu(false)} />
                  <div
                    className="fixed w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1 z-[70] animate-in fade-in zoom-in-95 duration-150"
                    style={{ top: menuPos.top, right: menuPos.right }}
                  >
                    <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-700">
                      <p className={cn(
                        'text-sm font-semibold text-gray-900 dark:text-white truncate',
                        isPunjabi && 'font-gurmukhi'
                      )}>
                        {isPunjabi && user.displayNameGurmukhi
                          ? user.displayNameGurmukhi
                          : user.displayName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-xs text-gray-400">{isPunjabi ? 'ਔਨਲਾਈਨ' : 'Online'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {isPunjabi ? 'ਬਾਹਰ ਜਾਓ' : 'Sign Out'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400 truncate">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth relative"
          onClick={markActive}
          onScroll={onScroll}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 border-2 border-amber-200 dark:border-amber-800 rounded-full" />
                  <div className="absolute inset-0 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
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
              <div className="text-center px-6 max-w-sm">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 flex items-center justify-center">
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className={cn(
                  'text-lg font-bold text-gray-900 dark:text-white mb-2',
                  isPunjabi && 'font-gurmukhi text-xl'
                )}>
                  {isPunjabi ? 'ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ' : 'Start the conversation'}
                </h3>
                <p className={cn(
                  'text-sm text-gray-400 leading-relaxed mb-5',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {isPunjabi
                    ? 'ਪਹਿਲਾ ਸੁਨੇਹਾ ਭੇਜ ਕੇ ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕਰੋ!'
                    : 'Be the first to send a message!'}
                </p>

                {/* Quick tips */}
                <div className="text-left space-y-2">
                  {(isPunjabi ? [
                    { icon: '🙏', text: 'ਸਤਿਕਾਰ ਨਾਲ ਗੱਲ ਕਰੋ' },
                    { icon: '📚', text: 'ਗੁਰਬਾਣੀ ਅਤੇ ਇਤਿਹਾਸ ਬਾਰੇ ਸਿੱਖੋ' },
                    { icon: '💡', text: 'ਸਵਾਲ ਪੁੱਛੋ ਅਤੇ ਜਵਾਬ ਦਿਓ' },
                  ] : [
                    { icon: '🙏', text: 'Communicate with respect' },
                    { icon: '📚', text: 'Discuss Gurbani & Sikh history' },
                    { icon: '💡', text: 'Ask questions & share knowledge' },
                  ]).map((tip, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <span className="text-sm flex-shrink-0">{tip.icon}</span>
                      <span className={cn(
                        'text-xs text-gray-500 dark:text-gray-400',
                        isPunjabi && 'font-gurmukhi text-sm'
                      )}>
                        {tip.text}
                      </span>
                    </div>
                  ))}
                </div>
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
                      'inline-flex items-center gap-2 px-5 py-2 text-sm text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 rounded-xl transition-all font-medium',
                      isPunjabi && 'font-gurmukhi'
                    )}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {isPunjabi ? 'ਹੋਰ ਲੋਡ ਕਰੋ' : 'Load earlier messages'}
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

          {/* "New messages" scroll button */}
          {showNewMsgButton && (
            <button
              onClick={scrollToBottom}
              className="sticky bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-full shadow-lg shadow-amber-500/30 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              {isPunjabi ? 'ਨਵੇਂ ਸੁਨੇਹੇ' : 'New messages'}
            </button>
          )}
        </div>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-1.5 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className={cn(
              'text-xs text-gray-400 italic',
              isPunjabi && 'font-gurmukhi'
            )}>
              {isPunjabi ? 'ਕੋਈ ਲਿਖ ਰਿਹਾ ਹੈ...' : 'Someone is typing...'}
            </span>
          </div>
        )}

        {/* Chat Input */}
        <ChatInput
          onSend={sendMessage}
          isSending={isSending}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          language={language}
          disabled={!activeRoom}
          onActivity={() => { markActive(); sendTypingIndicator(); }}
        />
      </div>

      {/* Members Panel (Desktop) */}
      {showMembers && (
        <div className="hidden md:block w-64 lg:w-72 flex-shrink-0 border-l border-gray-100 dark:border-gray-800">
          <MembersPanel
            members={members}
            language={language}
            currentUserId={user.id}
          />
        </div>
      )}

      {/* Members Panel (Mobile Overlay) */}
      {showMembers && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMembers(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-80 animate-in slide-in-from-right shadow-2xl">
            <div className="h-full relative">
              <button
                onClick={() => setShowMembers(false)}
                className="absolute top-3 right-3 z-10 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
                aria-label="Close members"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <MembersPanel
                members={members}
                language={language}
                currentUserId={user.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
