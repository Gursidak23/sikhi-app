/**
 * Chat Hook - Manages real-time chat state with adaptive polling
 * 
 * Optimizations:
 * - Adaptive polling: 1.5s active → 5s idle → 15s background
 * - Connection status tracking with auto-reconnect
 * - Optimistic message sending for instant UX
 * - Typing indicator support
 * - Debounced presence updates
 * - Unread message counting per room
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
  _optimistic?: boolean; // Client-side only flag for optimistic sends
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
// Constants
// ============================================================================

const CHAT_USER_KEY = 'sikhi-chat-user';
const UNREAD_KEY = 'sikhi-chat-unread';

// Adaptive polling intervals (ms)
const POLL_MULTI_USER = 1000; // Multiple users are online – fastest
const POLL_ACTIVE = 1500;     // User recently sent/received messages
const POLL_IDLE = 4000;       // User is viewing but not active
const POLL_BACKGROUND = 12000; // Tab is hidden/blurred

// ---- Notification Sound (Web Audio) ----
let audioCtx: AudioContext | null = null;
function playNotificationSound() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.3);
  } catch { /* audio not available */ }
}

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
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  // Refs for polling management
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPollTimeRef = useRef<string>(new Date().toISOString());
  const lastActivityRef = useRef<number>(Date.now());
  const onlineCountRef = useRef(0);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTabVisibleRef = useRef<boolean>(true);
  const failedPollsRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);

  // ---- Compute adaptive poll interval ----
  const getPollInterval = useCallback(() => {
    if (!isTabVisibleRef.current) return POLL_BACKGROUND;
    const idleTime = Date.now() - lastActivityRef.current;
    // Fastest polling when multiple users are online
    if (onlineCountRef.current > 1 && idleTime < 10000) return POLL_MULTI_USER;
    if (idleTime < 10000) return POLL_ACTIVE;
    return POLL_IDLE;
  }, []);

  // ---- Send typing indicator ----
  const sendTypingIndicator = useCallback(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 3000);
  }, []);

  // ---- Track user activity ----
  const markActive = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // ---- Load user from localStorage on mount ----
  useEffect(() => {
    mountedRef.current = true;
    const stored = localStorage.getItem(CHAT_USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem(CHAT_USER_KEY);
      }
    }

    // Load unread counts
    const unreadStored = localStorage.getItem(UNREAD_KEY);
    if (unreadStored) {
      try { setUnreadCounts(JSON.parse(unreadStored)); } catch { /* ignore */ }
    }

    return () => { mountedRef.current = false; };
  }, []);

  // ---- Persist unread counts ----
  useEffect(() => {
    localStorage.setItem(UNREAD_KEY, JSON.stringify(unreadCounts));
  }, [unreadCounts]);

  // ---- Register / Create User ----
  const registerUser = useCallback(async (displayName: string, displayNameGurmukhi?: string, avatarColor?: string) => {
    try {
      setError(null);
      const res = await fetch('/api/community/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, displayNameGurmukhi, avatarColor }),
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
    setTypingUsers([]);
    markActive();

    // Clear unread for this room
    setUnreadCounts((prev) => {
      const next = { ...prev };
      delete next[room.id];
      return next;
    });

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
  }, [user, joinRoom, markActive]);

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

  // ---- Send Message (with optimistic update) ----
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !activeRoom || !content.trim()) return;

    const trimmed = content.trim();
    markActive();

    // Optimistic message
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      content: trimmed,
      userId: user.id,
      roomId: activeRoom.id,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: user.id,
        displayName: user.displayName,
        displayNameGurmukhi: user.displayNameGurmukhi,
        avatarColor: user.avatarColor,
      },
      replyTo: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        user: { displayName: replyingTo.user.displayName },
      } : null,
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setReplyingTo(null);
    setIsSending(true);
    setError(null);

    try {
      const res = await fetch('/api/community/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
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
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? message : m))
      );
      lastPollTimeRef.current = new Date().toISOString();
    } catch (err: any) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }, [user, activeRoom, replyingTo, markActive]);

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

  // ---- Adaptive Polling for real-time updates ----
  useEffect(() => {
    if (!activeRoom) return;

    const poll = async () => {
      if (!mountedRef.current) return;

      try {
        const res = await fetch(
          `/api/community/messages/poll?roomId=${activeRoom.id}&since=${encodeURIComponent(lastPollTimeRef.current)}`
        );

        if (!res.ok) {
          failedPollsRef.current++;
          if (failedPollsRef.current >= 3) {
            setConnectionStatus('reconnecting');
          }
          return;
        }

        // Reset failure counter on success
        if (failedPollsRef.current > 0) {
          failedPollsRef.current = 0;
          setConnectionStatus('connected');
        }

        const data = await res.json();

        if (data.messages && data.messages.length > 0) {
          setMessages((prev) => {
            // Replace optimistic messages with real ones & add new
            const newMsgs: ChatMessage[] = [];
            for (const msg of data.messages) {
              if (messageIdsRef.current.has(msg.id)) continue;
              messageIdsRef.current.add(msg.id);
              newMsgs.push(msg);
            }
            if (newMsgs.length === 0) {
              // Still replace optimistic msgs
              return prev.map((m) => {
                if (!m._optimistic) return m;
                const real = data.messages.find(
                  (rm: ChatMessage) => rm.content === m.content && rm.userId === m.userId
                );
                return real || m;
              });
            }
            // Remove optimistic duplicates
            const cleaned = prev.filter((m) => {
              if (!m._optimistic) return true;
              return !newMsgs.some(
                (nm) => nm.content === m.content && nm.userId === m.userId
              );
            });
            return [...cleaned, ...newMsgs];
          });

          // Notification sound for messages from others
          const otherMsgs = data.messages.filter(
            (m: ChatMessage) => m.userId !== user?.id && !messageIdsRef.current.has(m.id)
          );
          if (otherMsgs.length > 0) {
            playNotificationSound();
          }

          // Count as unread if tab hidden
          if (!isTabVisibleRef.current) {
            const otherNew = data.messages.filter(
              (m: ChatMessage) => m.userId !== user?.id
            );
            if (otherNew.length > 0) {
              setUnreadCounts((prev) => ({
                ...prev,
                [activeRoom.id]: (prev[activeRoom.id] || 0) + otherNew.length,
              }));
            }
          }
        }

        if (data.members) {
          setMembers(data.members);
          const count = data.members.filter((m: ChatUser) => m.isOnline).length;
          onlineCountRef.current = count;
          setOnlineCount(count);
        }

        if (data.serverTime) {
          lastPollTimeRef.current = data.serverTime;
        }
      } catch {
        failedPollsRef.current++;
        if (failedPollsRef.current >= 5) {
          setConnectionStatus('disconnected');
        } else if (failedPollsRef.current >= 3) {
          setConnectionStatus('reconnecting');
        }
      }

      // Schedule next poll with adaptive interval
      if (mountedRef.current) {
        const interval = getPollInterval();
        // Exponential backoff on failures
        const backoff = failedPollsRef.current > 0
          ? Math.min(interval * Math.pow(1.5, failedPollsRef.current), 30000)
          : interval;
        pollTimeoutRef.current = setTimeout(poll, backoff);
      }
    };

    // Start first poll quickly (500ms)
    pollTimeoutRef.current = setTimeout(poll, 500);

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, [activeRoom, getPollInterval, user?.id]);

  // ---- Track tab visibility for adaptive polling ----
  useEffect(() => {
    const handler = () => {
      isTabVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        // Clear unread for active room when tab becomes visible
        if (activeRoom) {
          setUnreadCounts((prev) => {
            const next = { ...prev };
            delete next[activeRoom.id];
            return next;
          });
        }
        markActive();
      }
    };

    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [activeRoom, markActive]);

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

    // Presence heartbeat every 45s
    const presenceInterval = setInterval(setOnline, 45000);

    window.addEventListener('beforeunload', setOffline);

    return () => {
      clearInterval(presenceInterval);
      window.removeEventListener('beforeunload', setOffline);
      setOffline();
    };
  }, [user]);

  // ---- Load rooms on mount ----
  useEffect(() => {
    fetchRooms().then((rooms) => {
      setIsLoading(false);
      if (rooms.length > 0 && !activeRoom) {
        const defaultRoom = rooms.find((r: ChatRoom) => r.isDefault) || rooms[0];
        selectRoom(defaultRoom);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Manual reconnect ----
  const reconnect = useCallback(() => {
    failedPollsRef.current = 0;
    setConnectionStatus('connected');
    setError(null);
    // If we have an active room, re-fetch messages
    if (activeRoom) {
      selectRoom(activeRoom);
    }
  }, [activeRoom, selectRoom]);

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
    localStorage.removeItem(UNREAD_KEY);
  }, [user]);

  // ---- Total unread count ----
  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0);

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
    connectionStatus,
    unreadCounts,
    totalUnread,
    typingUsers,

    onlineCount,

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
    reconnect,
    markActive,
    sendTypingIndicator,
  };
}
