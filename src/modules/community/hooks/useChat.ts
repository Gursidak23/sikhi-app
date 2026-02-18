/**
 * Chat Hook - Manages real-time chat state with polling
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ChatUser {
  id: string;
  displayName: string;
  displayNameGurmukhi?: string | null;
  avatarColor: string;
  isOnline?: boolean;
  lastSeenAt?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: Pick<ChatUser, 'id' | 'displayName' | 'displayNameGurmukhi' | 'avatarColor'>;
  replyTo?: {
    id: string;
    content: string;
    user: { displayName: string };
  } | null;
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

// ============================================================================
// Local Storage Keys
// ============================================================================

const CHAT_USER_KEY = 'sikhi-chat-user';

// ============================================================================
// Hook
// ============================================================================

export function useChat() {
  const [user, setUser] = useState<ChatUser | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPollTimeRef = useRef<string>(new Date().toISOString());
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  // ---- Load user from localStorage on mount ----
  useEffect(() => {
    const stored = localStorage.getItem(CHAT_USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem(CHAT_USER_KEY);
      }
    }
  }, []);

  // ---- Register / Create User ----
  const registerUser = useCallback(async (displayName: string, displayNameGurmukhi?: string) => {
    try {
      setError(null);
      const res = await fetch('/api/community/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, displayNameGurmukhi }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to register');
      }

      const { user: newUser } = await res.json();
      setUser(newUser);
      localStorage.setItem(CHAT_USER_KEY, JSON.stringify(newUser));
      return newUser;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // ---- Fetch Rooms ----
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/community/rooms');
      if (!res.ok) throw new Error('Failed to fetch rooms');
      const data = await res.json();
      setRooms(data.rooms);
      return data.rooms;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, []);

  // ---- Join Room ----
  const joinRoom = useCallback(async (roomId: string) => {
    if (!user) return;
    try {
      await fetch(`/api/community/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
    } catch (err: any) {
      console.error('Failed to join room:', err);
    }
  }, [user]);

  // ---- Select Room ----
  const selectRoom = useCallback(async (room: ChatRoom) => {
    setActiveRoom(room);
    setMessages([]);
    setIsLoading(true);
    setError(null);
    setReplyingTo(null);

    if (user) {
      await joinRoom(room.id);
    }

    try {
      const res = await fetch(`/api/community/messages?roomId=${room.id}&limit=50`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
      lastPollTimeRef.current = new Date().toISOString();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }

    // Fetch members
    try {
      const res = await fetch(`/api/community/rooms/${room.id}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
      }
    } catch {
      // Non-critical
    }
  }, [user, joinRoom]);

  // ---- Load More Messages ----
  const loadMore = useCallback(async () => {
    if (!activeRoom || !nextCursor || !hasMore) return;
    try {
      const res = await fetch(
        `/api/community/messages?roomId=${activeRoom.id}&cursor=${nextCursor}&limit=50`
      );
      if (!res.ok) throw new Error('Failed to load more messages');
      const data = await res.json();
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      setError(err.message);
    }
  }, [activeRoom, nextCursor, hasMore]);

  // ---- Send Message ----
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !activeRoom || !content.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      const res = await fetch('/api/community/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          userId: user.id,
          roomId: activeRoom.id,
          replyToId: replyingTo?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      const { message } = await res.json();
      setMessages((prev) => [...prev, message]);
      setReplyingTo(null);
      lastPollTimeRef.current = new Date().toISOString();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }, [user, activeRoom, replyingTo]);

  // ---- Delete Message ----
  const deleteMsg = useCallback(async (messageId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/community/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, userId: user.id }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, content: '[Message deleted]', isDeleted: true }
              : m
          )
        );
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [user]);

  // ---- Polling for real-time updates ----
  useEffect(() => {
    if (!activeRoom) return;

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/community/messages/poll?roomId=${activeRoom.id}&since=${encodeURIComponent(lastPollTimeRef.current)}`
        );
        if (!res.ok) return;
        const data = await res.json();

        if (data.messages && data.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
            if (newMsgs.length === 0) return prev;
            return [...prev, ...newMsgs];
          });
        }

        if (data.members) {
          setMembers(data.members);
        }

        if (data.serverTime) {
          lastPollTimeRef.current = data.serverTime;
        }
      } catch {
        // Silent fail for polling
      }
    };

    // Poll every 2 seconds
    pollIntervalRef.current = setInterval(poll, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [activeRoom]);

  // ---- Update presence on mount/unmount ----
  useEffect(() => {
    if (!user) return;

    const setOnline = () => {
      fetch('/api/community/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isOnline: true }),
      }).catch(() => {});
    };

    const setOffline = () => {
      // Use sendBeacon for reliable offline notification
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/community/user',
          new Blob(
            [JSON.stringify({ userId: user.id, isOnline: false })],
            { type: 'application/json' }
          )
        );
      }
    };

    setOnline();
    window.addEventListener('beforeunload', setOffline);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    });

    return () => {
      window.removeEventListener('beforeunload', setOffline);
      setOffline();
    };
  }, [user]);

  // ---- Load rooms on mount ----
  useEffect(() => {
    fetchRooms().then((rooms) => {
      setIsLoading(false);
      // Auto-select first default room
      if (rooms.length > 0 && !activeRoom) {
        const defaultRoom = rooms.find((r: ChatRoom) => r.isDefault) || rooms[0];
        selectRoom(defaultRoom);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Logout ----
  const logout = useCallback(() => {
    if (user) {
      fetch('/api/community/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isOnline: false }),
      }).catch(() => {});
    }
    setUser(null);
    localStorage.removeItem(CHAT_USER_KEY);
  }, [user]);

  return {
    // State
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

    // Actions
    registerUser,
    fetchRooms,
    selectRoom,
    sendMessage,
    deleteMessage: deleteMsg,
    loadMore,
    setReplyingTo,
    logout,
    setError,
  };
}
