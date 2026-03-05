/**
 * Zustand Chat Store - Centralized state management for community chat
 * 
 * Replaces the monolithic useChat() hook's 15+ useState calls with granular
 * Zustand slices. Components subscribe only to the state they need, eliminating
 * unnecessary re-renders.
 * 
 * Slices:
 * - Auth: user, session, registration
 * - Rooms: room list, active room, selection
 * - Messages: message list, pagination, expiry sweep
 * - Members: member list, online count
 * - UI: connection status, typing, errors, unread counts
 */

'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ============================================================================
// Types (re-exported from here so components can import from one place)
// ============================================================================

export interface ChatUser {
  id: string;
  displayName: string;
  displayNameGurmukhi?: string | null;
  email?: string | null;
  bio?: string | null;
  role?: string;
  avatarColor: string;
  isOnline?: boolean;
  isBanned?: boolean;
  lastSeenAt?: string;
  sessionToken?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
  reacted: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  expiresAt: string;
  isSaved: boolean;
  reactions: MessageReaction[];
  createdAt: string;
  updatedAt: string;
  editedAt?: string | null;
  user: Pick<ChatUser, 'id' | 'displayName' | 'displayNameGurmukhi' | 'avatarColor'>;
  replyToId?: string | null;
  replyTo?: {
    id: string;
    content: string;
    user: { displayName: string };
  } | null;
  _optimistic?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  nameGurmukhi?: string | null;
  description?: string | null;
  descriptionGurmukhi?: string | null;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
  _count: {
    members: number;
    messages: number;
  };
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

// ============================================================================
// Store State Shape
// ============================================================================

interface ChatState {
  // Auth slice
  user: ChatUser | null;
  
  // Rooms slice
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  
  // Messages slice
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor: string | undefined;
  replyingTo: ChatMessage | null;
  savedMessages: ChatMessage[];
  
  // Members slice
  members: ChatUser[];
  onlineCount: number;
  
  // UI slice
  isLoading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  unreadCounts: Record<string, number>;
  typingNames: string[];
}

interface ChatActions {
  // Auth actions
  setUser: (user: ChatUser | null) => void;
  
  // Room actions
  setRooms: (rooms: ChatRoom[]) => void;
  setActiveRoom: (room: ChatRoom | null) => void;
  updateRoomMemberCount: (roomId: string, count: number) => void;
  
  // Message actions
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  addMessages: (newMessages: ChatMessage[]) => void;
  prependMessages: (olderMessages: ChatMessage[]) => void;
  updateMessage: (messageId: string, update: Partial<ChatMessage>) => void;
  removeOptimisticAndAdd: (optimisticContent: string, optimisticUserId: string, realMessage: ChatMessage) => void;
  replaceOptimistic: (optimisticId: string, realMessage: ChatMessage) => void;
  sweepExpired: () => void;
  setHasMore: (hasMore: boolean) => void;
  setNextCursor: (cursor: string | undefined) => void;
  setReplyingTo: (message: ChatMessage | null) => void;
  setSavedMessages: (msgs: ChatMessage[]) => void;
  
  // Members actions
  setMembers: (members: ChatUser[]) => void;
  setOnlineCount: (count: number) => void;
  
  // UI actions
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setUnreadCounts: (counts: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  clearUnreadForRoom: (roomId: string) => void;
  setTypingNames: (names: string[]) => void;
  
  // Bulk reset
  resetAll: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const CHAT_USER_KEY = 'sikhi-chat-user';
const UNREAD_KEY = 'sikhi-chat-unread';

// ============================================================================
// Initial State
// ============================================================================

const initialState: ChatState = {
  user: null,
  rooms: [],
  activeRoom: null,
  messages: [],
  hasMore: false,
  nextCursor: undefined,
  replyingTo: null,
  savedMessages: [],
  members: [],
  onlineCount: 0,
  isLoading: true,
  error: null,
  connectionStatus: 'connected',
  unreadCounts: {},
  typingNames: [],
};

// ============================================================================
// Store
// ============================================================================

export const useChatStore = create<ChatState & ChatActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ---- Auth ----
    setUser: (user) => {
      set({ user });
      if (user) {
        localStorage.setItem(CHAT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CHAT_USER_KEY);
      }
    },

    // ---- Rooms ----
    setRooms: (rooms) => set({ rooms }),
    setActiveRoom: (room) => set({ activeRoom: room }),
    updateRoomMemberCount: (roomId, count) => set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId && r._count.members !== count
          ? { ...r, _count: { ...r._count, members: count } }
          : r
      ),
      activeRoom: state.activeRoom?.id === roomId && state.activeRoom._count.members !== count
        ? { ...state.activeRoom, _count: { ...state.activeRoom._count, members: count } }
        : state.activeRoom,
    })),

    // ---- Messages ----
    setMessages: (messagesOrUpdater) => set((state) => ({
      messages: typeof messagesOrUpdater === 'function'
        ? messagesOrUpdater(state.messages)
        : messagesOrUpdater,
    })),

    addMessages: (newMessages) => set((state) => {
      const existingIds = new Set(state.messages.filter(m => !m._optimistic).map(m => m.id));
      const deduped = newMessages.filter(m => !existingIds.has(m.id));
      if (deduped.length === 0) return state;
      // Remove optimistic duplicates that match incoming messages
      const cleaned = state.messages.filter((m) => {
        if (!m._optimistic) return true;
        return !deduped.some(nm => nm.content === m.content && nm.userId === m.userId);
      });
      return { messages: [...cleaned, ...deduped] };
    }),

    prependMessages: (olderMessages) => set((state) => ({
      messages: [...olderMessages, ...state.messages],
    })),

    updateMessage: (messageId, update) => set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, ...update } : m
      ),
    })),

    removeOptimisticAndAdd: (content, userId, realMessage) => set((state) => ({
      messages: state.messages
        .filter(m => !(m._optimistic && m.content === content && m.userId === userId))
        .concat(realMessage),
    })),

    replaceOptimistic: (optimisticId, realMessage) => set((state) => ({
      messages: state.messages.map((m) =>
        m.id === optimisticId ? realMessage : m
      ),
    })),

    sweepExpired: () => set((state) => {
      const now = Date.now();
      const filtered = state.messages.filter((m) => {
        if (m.isSaved) return true;
        if (m._optimistic) return true;
        return new Date(m.expiresAt).getTime() > now;
      });
      return filtered.length === state.messages.length ? state : { messages: filtered };
    }),

    setHasMore: (hasMore) => set({ hasMore }),
    setNextCursor: (cursor) => set({ nextCursor: cursor }),
    setReplyingTo: (message) => set({ replyingTo: message }),
    setSavedMessages: (msgs) => set({ savedMessages: msgs }),

    // ---- Members ----
    setMembers: (members) => set({ members }),
    setOnlineCount: (count) => set({ onlineCount: count }),

    // ---- UI ----
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    setUnreadCounts: (countsOrUpdater) => set((state) => {
      const next = typeof countsOrUpdater === 'function'
        ? countsOrUpdater(state.unreadCounts)
        : countsOrUpdater;
      localStorage.setItem(UNREAD_KEY, JSON.stringify(next));
      return { unreadCounts: next };
    }),
    clearUnreadForRoom: (roomId) => set((state) => {
      const next = { ...state.unreadCounts };
      delete next[roomId];
      localStorage.setItem(UNREAD_KEY, JSON.stringify(next));
      return { unreadCounts: next };
    }),
    setTypingNames: (names) => set({ typingNames: names }),

    // ---- Bulk Reset ----
    resetAll: () => {
      localStorage.removeItem(CHAT_USER_KEY);
      localStorage.removeItem(UNREAD_KEY);
      set(initialState);
    },
  }))
);

// ============================================================================
// Selectors (for granular subscriptions — prevents re-renders)
// ============================================================================

export const selectUser = (s: ChatState & ChatActions) => s.user;
export const selectRooms = (s: ChatState & ChatActions) => s.rooms;
export const selectActiveRoom = (s: ChatState & ChatActions) => s.activeRoom;
export const selectMessages = (s: ChatState & ChatActions) => s.messages;
export const selectMembers = (s: ChatState & ChatActions) => s.members;
export const selectOnlineCount = (s: ChatState & ChatActions) => s.onlineCount;
export const selectIsLoading = (s: ChatState & ChatActions) => s.isLoading;
export const selectError = (s: ChatState & ChatActions) => s.error;
export const selectConnectionStatus = (s: ChatState & ChatActions) => s.connectionStatus;
export const selectUnreadCounts = (s: ChatState & ChatActions) => s.unreadCounts;
export const selectTypingNames = (s: ChatState & ChatActions) => s.typingNames;
export const selectReplyingTo = (s: ChatState & ChatActions) => s.replyingTo;
export const selectHasMore = (s: ChatState & ChatActions) => s.hasMore;
export const selectSavedMessages = (s: ChatState & ChatActions) => s.savedMessages;

export const selectTotalUnread = (s: ChatState & ChatActions) =>
  Object.values(s.unreadCounts).reduce((sum, n) => sum + n, 0);

// ============================================================================
// Hydration Helper — call once on mount to load from localStorage
// ============================================================================

export function hydrateFromLocalStorage() {
  const stored = localStorage.getItem(CHAT_USER_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      useChatStore.getState().setUser(parsed);
    } catch {
      localStorage.removeItem(CHAT_USER_KEY);
    }
  }

  const unreadStored = localStorage.getItem(UNREAD_KEY);
  if (unreadStored) {
    try {
      useChatStore.setState({ unreadCounts: JSON.parse(unreadStored) });
    } catch { /* ignore */ }
  }
}
