/**
 * Chat Hook - Thin facade that combines all composable hooks
 * 
 * This maintains backward compatibility for components that import useChat().
 * New components should use the individual hooks directly for better perf:
 * - useChatAuth()      — user, registration, profile, logout
 * - useChatRooms()     — rooms, activeRoom, selection
 * - useChatMessages()  — messages, send, edit, delete, search, save
 * - useChatPresence()  — polling, typing, connection, presence
 * - useChatAdmin()     — admin actions (ban, pin, delete, roles)
 * 
 * All state lives in the Zustand store (chatStore.ts).
 */

'use client';

import { useEffect, useState } from 'react';

// Re-export types from the store
export type { ChatUser, ChatMessage, ChatRoom, MessageReaction, ConnectionStatus } from '../store/chatStore';
export { hydrateFromLocalStorage } from '../store/chatStore';

// Import composable hooks
import { useChatStore, hydrateFromLocalStorage, selectTotalUnread } from '../store/chatStore';
import { useChatAuth } from './useChatAuth';
import { useChatRooms } from './useChatRooms';
import { useChatMessages } from './useChatMessages';
import { useChatPresence } from './useChatPresence';
import { useChatAdmin } from './useChatAdmin';

// ============================================================================
// Facade Hook — combines all composable hooks for backward compat
// ============================================================================

export function useChat() {
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    hydrateFromLocalStorage();
    setHydrated(true);
  }, []);

  const { user, registerUser, updateProfile, logout } = useChatAuth();
  const { rooms, activeRoom, unreadCounts, selectRoom } = useChatRooms();
  const {
    messages, hasMore, replyingTo, savedMessages,
    loadMore, sendMessage, deleteMessage, editMessage,
    toggleReaction, saveMessage, unsaveMessage,
    fetchSavedMessages, searchMessages, getPinnedMessages,
    setReplyingTo,
  } = useChatMessages();
  const {
    connectionStatus, onlineCount, typingNames,
    markActive, setIsTyping, reconnect,
  } = useChatPresence();
  const { adminAction } = useChatAdmin();

  const members = useChatStore((s) => s.members);
  const isLoading = useChatStore((s) => s.isLoading);
  const error = useChatStore((s) => s.error);
  const setError = useChatStore((s) => s.setError);
  const totalUnread = useChatStore(selectTotalUnread);

  return {
    // State
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
    totalUnread,
    onlineCount,
    typingNames,
    savedMessages,

    // Actions
    registerUser,
    fetchRooms: () => {}, // rooms load automatically
    selectRoom,
    sendMessage,
    deleteMessage,
    editMessage,
    toggleReaction,
    searchMessages,
    getPinnedMessages,
    updateProfile,
    adminAction,
    loadMore,
    setReplyingTo,
    logout,
    setError,
    reconnect,
    markActive,
    setIsTyping,
    saveMessage,
    unsaveMessage,
    fetchSavedMessages,
  };
}
