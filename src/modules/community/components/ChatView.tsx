/**
 * Main Chat View - Full chat interface with rooms, messages, members
 * 
 * Features:
 * - Connection status indicator
 * - Unread badges on rooms
 * - Mobile-first responsive design
 * - Glass-morphism design elements
 * - Search, Saved Messages, Admin, Profile, Threads panels
 * - Image attachment support
 * - Virtual scrolling for messages
 * - ExpiryTimerProvider for shared timer
 */

'use client';

import { useRef, useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import { useChat } from '../hooks/useChat';
import type { ChatMessage } from '../store/chatStore';
import { useChatAdmin } from '../hooks/useChatAdmin';
import { ChatRegistration } from './ChatRegistration';
import { RoomSidebar } from './RoomSidebar';
import { ChatInput } from './ChatInput';
import { ExpiryTimerProvider } from './ExpiryTimerProvider';
import { ImageAttachment } from './ImageAttachment';
import { VirtualMessageList } from './VirtualMessageList';

// Lazy-loaded panels
const MembersPanel = lazy(() => import('./MembersPanel').then(m => ({ default: m.MembersPanel })));
const SearchPanel = lazy(() => import('./SearchPanel').then(m => ({ default: m.SearchPanel })));
const SavedMessagesPanel = lazy(() => import('./SavedMessagesPanel').then(m => ({ default: m.SavedMessagesPanel })));
const AdminPanel = lazy(() => import('./AdminPanel').then(m => ({ default: m.AdminPanel })));
const ProfileEditor = lazy(() => import('./ProfileEditor').then(m => ({ default: m.ProfileEditor })));
const ThreadView = lazy(() => import('./ThreadView').then(m => ({ default: m.ThreadView })));

function PanelFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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
    error,
    hasMore,
    replyingTo,
    connectionStatus,
    unreadCounts,
    onlineCount,
    typingNames,
    registerUser,
    selectRoom,
    sendMessage,
    deleteMessage,
    editMessage,
    toggleReaction,
    loadMore,
    setReplyingTo,
    logout,
    setError,
    reconnect,
    markActive,
    setIsTyping,
    saveMessage,
    unsaveMessage,
  } = useChat();

  const userMenuBtnRef = useRef<HTMLButtonElement>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // New panel states
  const [showSearch, setShowSearch] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [threadMessage, setThreadMessage] = useState<ChatMessage | null>(null);
  const { isAdmin } = useChatAdmin();

  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  // Close all side panels
  const closeAllPanels = useCallback(() => {
    setShowSearch(false);
    setShowSaved(false);
    setShowAdmin(false);
    setShowProfile(false);
    setShowMembers(false);
    setThreadMessage(null);
  }, []);

  // Toggle a panel (close others first)
  const togglePanel = useCallback((panel: 'search' | 'saved' | 'admin' | 'profile' | 'members' | 'thread') => {
    const setters: Record<string, (v: boolean) => void> = {
      search: setShowSearch,
      saved: setShowSaved,
      admin: setShowAdmin,
      profile: setShowProfile,
      members: setShowMembers,
    };
    const currentlyOpen = {
      search: showSearch,
      saved: showSaved,
      admin: showAdmin,
      profile: showProfile,
      members: showMembers,
      thread: threadMessage !== null,
    }[panel];
    closeAllPanels();
    if (!currentlyOpen && panel !== 'thread') {
      setters[panel]?.(true);
    }
  }, [showSearch, showSaved, showAdmin, showProfile, showMembers, threadMessage, closeAllPanels]);

  // Open a thread view for a message
  const openThread = useCallback((msg: ChatMessage) => {
    closeAllPanels();
    setThreadMessage(msg);
  }, [closeAllPanels]);

  // Scroll to a specific message by ID
  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2', 'dark:ring-offset-gray-900');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2', 'dark:ring-offset-gray-900');
      }, 2000);
    }
  }, []);

  // Mark component as hydrated after first mount (prevents flash of wrong state)
  useEffect(() => { setHydrated(true); }, []);

  // Cleanup typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  // If user is not registered, show registration form
  // Wait for hydration to avoid flashing the registration form when user is in localStorage
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-14rem)] rounded-2xl border border-amber-200/30 dark:border-gray-700/50 bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-amber-200 dark:border-amber-800 rounded-full" />
            <div className="absolute inset-0 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className={cn(
            'text-sm text-gray-400',
            isPunjabi && 'font-gurmukhi',
            isHindi && 'font-devanagari'
          )}>
            {isPunjabi ? 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : isHindi ? 'लोड हो रहा है...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <ChatRegistration onRegister={registerUser} language={language} />;
  }

  return (
    <ExpiryTimerProvider>
    <div className="flex h-[calc(100dvh-10rem)] sm:h-[calc(100dvh-9rem)] rounded-2xl shadow-2xl border border-amber-200/30 dark:border-gray-700/50 overflow-hidden bg-white dark:bg-gray-900">
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
                    isPunjabi && 'font-gurmukhi text-base',
                    isHindi && 'font-devanagari text-base'
                  )}>
                    {isPunjabi && activeRoom.nameGurmukhi
                      ? activeRoom.nameGurmukhi
                      : activeRoom.name}
                  </h2>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    {onlineCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        {onlineCount} {isPunjabi ? 'ਔਨਲਾਈਨ' : isHindi ? 'ऑनलाइन' : 'online'}
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
                    {isPunjabi ? 'ਜੋੜ ਰਿਹਾ...' : isHindi ? 'जोड़ रहा है...' : 'Reconnecting...'}
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    {isPunjabi ? 'ਮੁੜ ਜੋੜੋ' : isHindi ? 'पुनः जोड़ें' : 'Reconnect'}
                  </>
                )}
              </button>
            )}

            {/* Search Toggle */}
            <button
              onClick={() => togglePanel('search')}
              className={cn(
                'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all',
                showSearch
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600'
              )}
              aria-label={isPunjabi ? 'ਖੋਜ' : isHindi ? 'खोज' : 'Search'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Saved Messages Toggle */}
            <button
              onClick={() => togglePanel('saved')}
              className={cn(
                'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all',
                showSaved
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600'
              )}
              aria-label={isPunjabi ? 'ਸੇਵ ਕੀਤੇ' : isHindi ? 'सेव किए' : 'Saved'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            {/* Admin Panel Toggle (only for admins) */}
            {isAdmin && (
              <button
                onClick={() => togglePanel('admin')}
                className={cn(
                  'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all',
                  showAdmin
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shadow-sm'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600'
                )}
                aria-label="Admin"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </button>
            )}

            {/* Members Toggle */}
            <button
              onClick={() => togglePanel('members')}
              className={cn(
                'p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all',
                showMembers
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600'
              )}
              aria-label={isPunjabi ? 'ਮੈਂਬਰ ਦਿਖਾਓ' : isHindi ? 'सदस्य दिखाएं' : 'Toggle members'}
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
                        isPunjabi && 'font-gurmukhi',
                        isHindi && 'font-devanagari'
                      )}>
                        {isPunjabi && user.displayNameGurmukhi
                          ? user.displayNameGurmukhi
                          : user.displayName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-xs text-gray-400">{isPunjabi ? 'ਔਨਲਾਈਨ' : isHindi ? 'ऑनलाइन' : 'Online'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        togglePanel('profile');
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2',
                        isPunjabi && 'font-gurmukhi',
                        isHindi && 'font-devanagari'
                      )}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {isPunjabi ? 'ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ' : isHindi ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}
                    </button>
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
                      {isPunjabi ? 'ਬਾਹਰ ਜਾਓ' : isHindi ? 'साइन आउट' : 'Sign Out'}
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

        {/* Messages Area (Virtual Scrolling) */}
        <VirtualMessageList
          messages={messages}
          currentUser={user}
          language={language}
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={loadMore}
          onReply={(m) => {
            const replyCount = messages.filter(r => r.replyToId === m.id).length;
            if (replyCount > 0) {
              openThread(m);
            } else {
              setReplyingTo(m);
            }
          }}
          onDelete={deleteMessage}
          onSave={saveMessage}
          onUnsave={unsaveMessage}
          onEdit={editMessage}
          onToggleReaction={toggleReaction}
          onMarkActive={markActive}
        />

        {/* Typing Indicator */}
        {typingNames.length > 0 && (
          <div className="px-4 py-1.5 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800/50">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            <span className={cn(isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {typingNames.length === 1
                ? `${typingNames[0]} ${isPunjabi ? 'ਲਿਖ ਰਿਹਾ ਹੈ...' : isHindi ? 'लिख रहा है...' : 'is typing...'}`
                : typingNames.length === 2
                  ? `${typingNames[0]} ${isPunjabi ? 'ਤੇ' : isHindi ? 'और' : '&'} ${typingNames[1]} ${isPunjabi ? 'ਲਿਖ ਰਹੇ ਹਨ...' : isHindi ? 'लिख रहे हैं...' : 'are typing...'}`
                  : `${typingNames.length} ${isPunjabi ? 'ਲੋਕ ਲਿਖ ਰਹੇ ਹਨ...' : isHindi ? 'लोग लिख रहे हैं...' : 'people are typing...'}`}
            </span>
          </div>
        )}

        {/* Ephemeral notice */}
        <div className="px-4 py-1 text-[10px] text-gray-400/60 text-center border-t border-gray-100/50 dark:border-gray-800/30">
          {isPunjabi
            ? '⏱ ਸੁਨੇਹੇ 12 ਘੰਟਿਆਂ ਬਾਅਦ ਆਪਣੇ ਆਪ ਮਿਟ ਜਾਂਦੇ ਹਨ • 🔖 ਸੇਵ ਕਰੋ ਰੱਖਣ ਲਈ'
            : isHindi
            ? '⏱ संदेश 12 घंटे बाद स्वतः मिट जाते हैं • 🔖 रखने के लिए सेव करें'
            : '⏱ Messages auto-delete after 12h • 🔖 Save to keep'}
        </div>

        {/* Image Attachment Picker */}
        {showImagePicker && (
          <ImageAttachment
            language={language}
            onImageReady={(content) => {
              setShowImagePicker(false);
              sendMessage(content);
            }}
            onCancel={() => setShowImagePicker(false)}
          />
        )}

        {/* Chat Input */}
        <div>
          {/* Image attachment button - inline above input */}
          {!showImagePicker && (
            <div className="flex items-center px-3 sm:px-4 pt-1.5 pb-0.5 border-t border-gray-100 dark:border-gray-800/50">
              <button
                onClick={() => setShowImagePicker(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                aria-label={isPunjabi ? 'ਤਸਵੀਰ ਭੇਜੋ' : isHindi ? 'तस्वीर भेजें' : 'Send image'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={cn(isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                  {isPunjabi ? 'ਤਸਵੀਰ' : isHindi ? 'तस्वीर' : 'Image'}
                </span>
              </button>
            </div>
          )}
          <ChatInput
            onSend={sendMessage}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            language={language}
            disabled={!activeRoom}
            onActivity={() => {
              markActive();
              setIsTyping(true);
              // Debounce: clear previous timer so we don't fire stop prematurely
              if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
              typingTimerRef.current = setTimeout(() => setIsTyping(false), 3000);
            }}
          />
        </div>
      </div>

      {/* Side Panel (Desktop) */}
      {(showMembers || showSearch || showSaved || showAdmin || showProfile || threadMessage) && (
        <div className="hidden md:block w-64 lg:w-80 flex-shrink-0 border-l border-gray-100 dark:border-gray-800">
          <Suspense fallback={<PanelFallback />}>
            {showMembers && (
              <MembersPanel
                members={members}
                language={language}
                currentUserId={user.id}
              />
            )}
            {showSearch && (
              <SearchPanel
                language={language}
                onClose={() => setShowSearch(false)}
                onScrollToMessage={scrollToMessage}
              />
            )}
            {showSaved && (
              <SavedMessagesPanel
                language={language}
                onClose={() => setShowSaved(false)}
                onScrollToMessage={scrollToMessage}
              />
            )}
            {showAdmin && (
              <AdminPanel
                language={language}
                onClose={() => setShowAdmin(false)}
              />
            )}
            {showProfile && (
              <ProfileEditor
                language={language}
                onClose={() => setShowProfile(false)}
              />
            )}
            {threadMessage && (
              <ThreadView
                parentMessage={threadMessage}
                allMessages={messages}
                currentUser={user}
                language={language}
                onClose={() => setThreadMessage(null)}
                onSendReply={async (content) => {
                  setReplyingTo(threadMessage);
                  await sendMessage(content);
                  setReplyingTo(null);
                }}
                onDelete={deleteMessage}
                onSave={saveMessage}
                onUnsave={unsaveMessage}
                onEdit={editMessage}
                onToggleReaction={toggleReaction}
                onReply={setReplyingTo}
              />
            )}
          </Suspense>
        </div>
      )}

      {/* Side Panel (Mobile Overlay) */}
      {(showMembers || showSearch || showSaved || showAdmin || showProfile || threadMessage) && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeAllPanels}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-80 animate-in slide-in-from-right shadow-2xl">
            <div className="h-full relative">
              {!showMembers && (
                <button
                  onClick={closeAllPanels}
                  className="absolute top-3 right-3 z-10 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500"
                  aria-label="Close panel"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <Suspense fallback={<PanelFallback />}>
                {showMembers && (
                  <>
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
                  </>
                )}
                {showSearch && (
                  <SearchPanel
                    language={language}
                    onClose={() => setShowSearch(false)}
                    onScrollToMessage={(id) => {
                      setShowSearch(false);
                      setTimeout(() => scrollToMessage(id), 300);
                    }}
                  />
                )}
                {showSaved && (
                  <SavedMessagesPanel
                    language={language}
                    onClose={() => setShowSaved(false)}
                    onScrollToMessage={(id) => {
                      setShowSaved(false);
                      setTimeout(() => scrollToMessage(id), 300);
                    }}
                  />
                )}
                {showAdmin && (
                  <AdminPanel
                    language={language}
                    onClose={() => setShowAdmin(false)}
                  />
                )}
                {showProfile && (
                  <ProfileEditor
                    language={language}
                    onClose={() => setShowProfile(false)}
                  />
                )}
                {threadMessage && (
                  <ThreadView
                    parentMessage={threadMessage}
                    allMessages={messages}
                    currentUser={user}
                    language={language}
                    onClose={() => setThreadMessage(null)}
                    onSendReply={async (content) => {
                      setReplyingTo(threadMessage);
                      await sendMessage(content);
                      setReplyingTo(null);
                    }}
                    onDelete={deleteMessage}
                    onSave={saveMessage}
                    onUnsave={unsaveMessage}
                    onEdit={editMessage}
                    onToggleReaction={toggleReaction}
                    onReply={setReplyingTo}
                  />
                )}
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
    </ExpiryTimerProvider>
  );
}
