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
  email?: string | null;
  bio?: string | null;
  role?: string;
  avatarColor: string;
  isOnline?: boolean;
  isBanned?: boolean;
  lastSeenAt?: string;
  sessionToken?: string; // Auth token from server, stored in localStorage
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
  reacted: boolean; // Whether the current user reacted
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
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [savedMessages, setSavedMessages] = useState<any[]>([]);

  // Refs for typing indicator
  const isTypingRef = useRef(false);

  // Refs for polling management
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPollTimeRef = useRef<string>(new Date().toISOString());
  const lastActivityRef = useRef<number>(Date.now());
  const onlineCountRef = useRef(0);
  const messageIdsRef = useRef<Set<string>>(new Set());
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
  const registerUser = useCallback(async (displayName: string, displayNameGurmukhi?: string, avatarColor?: string, email?: string) => {
    try {
      setError(null);
      const res = await fetch('/api/community/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, displayNameGurmukhi, avatarColor, email }),
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

  // ---- Session auto-recovery: re-authenticate with existing user ID ----
  const recoverSession = useCallback(async (): Promise<ChatUser | null> => {
    if (!user) return null;
    try {
      const res = await fetch('/api/community/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: user.displayName,
          displayNameGurmukhi: user.displayNameGurmukhi || undefined,
          avatarColor: user.avatarColor,
          existingUserId: user.id, // Reuse existing user — don't create duplicate
        }),
      });
      if (!res.ok) return null;
      const { user: newUser } = await res.json();
      setUser(newUser);
      localStorage.setItem(CHAT_USER_KEY, JSON.stringify(newUser));
      return newUser;
    } catch {
      return null;
    }
  }, [user]);

  // ---- Join Room ----
  const joinRoom = useCallback(async (roomId: string) => {
    if (!user) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user.sessionToken) headers['X-Session-Token'] = user.sessionToken;
      const res = await fetch(`/api/community/rooms/${roomId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: user.id }),
      });
      // Auto-recover session on 401
      if (res.status === 401) {
        const recovered = await recoverSession();
        if (recovered) {
          const retryHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          if (recovered.sessionToken) retryHeaders['X-Session-Token'] = recovered.sessionToken;
          await fetch(`/api/community/rooms/${roomId}`, {
            method: 'POST',
            headers: retryHeaders,
            body: JSON.stringify({ userId: recovered.id }),
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to join room:', err);
    }
  }, [user, recoverSession]);

  // ---- Select Room ----
  const selectRoom = useCallback(async (room: ChatRoom) => {
    setActiveRoom(room);
    setMessages([]);
    setIsLoading(true);
    setError(null);
    setReplyingTo(null);
    // Reset tracked message IDs for the new room
    messageIdsRef.current.clear();
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
      // Track all initially-loaded message IDs to prevent duplicates
      for (const msg of data.messages) {
        messageIdsRef.current.add(msg.id);
      }
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
      isPinned: false,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      isSaved: false,
      reactions: [],
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
    setError(null);

    try {
      let currentUser = user;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser.sessionToken) headers['X-Session-Token'] = currentUser.sessionToken;
      let res = await fetch('/api/community/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: trimmed,
          userId: currentUser.id,
          roomId: activeRoom.id,
          replyToId: replyingTo?.id,
        }),
      });

      // Session expired (serverless cold start) — auto-recover silently
      if (res.status === 401) {
        const recovered = await recoverSession();
        if (recovered) {
          currentUser = recovered;
          const retryHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          if (recovered.sessionToken) retryHeaders['X-Session-Token'] = recovered.sessionToken;

          // Re-join the room with new session
          await fetch(`/api/community/rooms/${activeRoom.id}`, {
            method: 'POST',
            headers: retryHeaders,
            body: JSON.stringify({ userId: recovered.id }),
          }).catch(() => {});

          res = await fetch('/api/community/messages', {
            method: 'POST',
            headers: retryHeaders,
            body: JSON.stringify({
              content: trimmed,
              userId: recovered.id,
              roomId: activeRoom.id,
              replyToId: replyingTo?.id,
            }),
          });
        }
        if (res.status === 401) {
          // Recovery also failed — force re-registration
          setUser(null);
          localStorage.removeItem(CHAT_USER_KEY);
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          setError('Session expired. Please register again.');
          return;
        }
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      const { message } = await res.json();
      // Track the real message ID to prevent poll from re-adding it
      messageIdsRef.current.add(message.id);
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? message : m))
      );
      lastPollTimeRef.current = new Date().toISOString();
    } catch (err: any) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setError(err.message);
    }
  }, [user, activeRoom, replyingTo, markActive, recoverSession]);

  // ---- Delete Message ----
  const deleteMsg = useCallback(async (messageId: string) => {
    if (!user) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user.sessionToken) headers['X-Session-Token'] = user.sessionToken;
      const res = await fetch('/api/community/messages', {
        method: 'DELETE',
        headers,
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
        // Build poll URL with typing indicator params
        let pollUrl = `/api/community/messages/poll?roomId=${activeRoom.id}&since=${encodeURIComponent(lastPollTimeRef.current)}`;
        if (user?.id) {
          pollUrl += `&userId=${user.id}`;
          pollUrl += `&typing=${isTypingRef.current ? '1' : '0'}`;
          if (isTypingRef.current && user.displayName) {
            pollUrl += `&typingName=${encodeURIComponent(user.displayName)}`;
          }
        }
        const pollHeaders: Record<string, string> = {};
        if (user?.sessionToken) pollHeaders['X-Session-Token'] = user.sessionToken;
        const res = await fetch(pollUrl, { headers: pollHeaders });

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
          // Determine which messages are truly new BEFORE mutating the set
          const trulyNewMsgs: ChatMessage[] = [];
          for (const msg of data.messages) {
            if (!messageIdsRef.current.has(msg.id)) {
              trulyNewMsgs.push(msg);
            }
          }

          // Now mark them all as tracked
          for (const msg of data.messages) {
            messageIdsRef.current.add(msg.id);
          }

          setMessages((prev) => {
            // Build a Set of existing non-optimistic IDs for fast lookup
            const existingIds = new Set(prev.filter(m => !m._optimistic).map(m => m.id));

            if (trulyNewMsgs.length === 0) {
              // No new messages — still replace any remaining optimistic msgs
              return prev.map((m) => {
                if (!m._optimistic) return m;
                const real = data.messages.find(
                  (rm: ChatMessage) => rm.content === m.content && rm.userId === m.userId
                );
                if (real) return real;
                return m;
              });
            }

            // Filter out truly new messages that somehow already exist (safety)
            const deduped = trulyNewMsgs.filter(nm => !existingIds.has(nm.id));

            // Remove optimistic duplicates that match incoming messages
            const cleaned = prev.filter((m) => {
              if (!m._optimistic) return true;
              return !deduped.some(
                (nm) => nm.content === m.content && nm.userId === m.userId
              );
            });
            return [...cleaned, ...deduped];
          });

          // Notification sound for truly new messages from others
          const otherNewMsgs = trulyNewMsgs.filter(
            (m: ChatMessage) => m.userId !== user?.id
          );
          if (otherNewMsgs.length > 0) {
            playNotificationSound();
          }

          // Count as unread if tab hidden (only truly new messages from others)
          if (!isTabVisibleRef.current) {
            const otherNew = trulyNewMsgs.filter(
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

          // Update active room member count to keep header accurate
          setActiveRoom((prev) => {
            if (!prev) return prev;
            const newCount = data.members.length;
            if (prev._count.members === newCount) return prev;
            return { ...prev, _count: { ...prev._count, members: newCount } };
          });

          // Also update rooms list so sidebar stays in sync
          setRooms((prevRooms) =>
            prevRooms.map((r) =>
              r.id === activeRoom.id && r._count.members !== data.members.length
                ? { ...r, _count: { ...r._count, members: data.members.length } }
                : r
            )
          );
        }

        if (data.typing) {
          setTypingNames(data.typing);
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
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user.sessionToken) headers['X-Session-Token'] = user.sessionToken;
      fetch('/api/community/user', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ userId: user.id, isOnline: true }),
      }).catch(() => {});
    };

    const setOffline = () => {
      // Use fetch with keepalive for authenticated offline status
      fetch('/api/community/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(user.sessionToken ? { 'X-Session-Token': user.sessionToken } : {}),
        },
        body: JSON.stringify({ userId: user.id, isOnline: false }),
        keepalive: true,
      }).catch(() => {});
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

  // ---- Load rooms immediately on mount (don't wait for user) ----
  const roomsLoadedRef = useRef(false);
  useEffect(() => {
    fetchRooms().then((fetchedRooms) => {
      roomsLoadedRef.current = true;
      // If user is already loaded from localStorage, select default room
      if (fetchedRooms.length > 0) {
        const stored = localStorage.getItem(CHAT_USER_KEY);
        if (stored) {
          const defaultRoom = fetchedRooms.find((r: ChatRoom) => r.isDefault) || fetchedRooms[0];
          selectRoom(defaultRoom);
        }
      }
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- When user is set (after registration or localStorage load), select room if rooms already loaded ----
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    // If rooms already loaded, select default room if none active
    if (roomsLoadedRef.current && rooms.length > 0 && !activeRoom) {
      const defaultRoom = rooms.find((r: ChatRoom) => r.isDefault) || rooms[0];
      selectRoom(defaultRoom);
    } else if (!roomsLoadedRef.current) {
      // Rooms not loaded yet (unlikely), fetch them
      fetchRooms().then((fetchedRooms) => {
        roomsLoadedRef.current = true;
        setIsLoading(false);
        if (fetchedRooms.length > 0 && !activeRoom) {
          const defaultRoom = fetchedRooms.find((r: ChatRoom) => r.isDefault) || fetchedRooms[0];
          selectRoom(defaultRoom);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user.sessionToken) headers['X-Session-Token'] = user.sessionToken;
      fetch('/api/community/user', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ userId: user.id, isOnline: false }),
        keepalive: true,
      }).catch(() => {});
    }
    // Stop polling by clearing active room first
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    // Reset all state
    setUser(null);
    setActiveRoom(null);
    setMessages([]);
    setMembers([]);
    setRooms([]);
    setOnlineCount(0);
    setReplyingTo(null);
    setUnreadCounts({});
    setConnectionStatus('connected');
    messageIdsRef.current.clear();
    failedPollsRef.current = 0;
    localStorage.removeItem(CHAT_USER_KEY);
    localStorage.removeItem(UNREAD_KEY);
  }, [user]);

  // ---- Total unread count ----
  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0);

  // ---- Typing indicator ----
  const setIsTyping = useCallback((typing: boolean) => {
    isTypingRef.current = typing;
  }, []);

  // ---- Save / Unsave messages ----
  const saveMsg = useCallback(async (messageId: string) => {
    if (!user) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user.sessionToken) headers['X-Session-Token'] = user.sessionToken;
      const res = await fetch('/api/community/messages/save', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: user.id, messageId }),
      });
      if (res.ok) {
        // Update local state to reflect saved status
        setMessages((prev) =>
          prev.map((m) => m.id === messageId ? { ...m, isSaved: true } : m)
        );
      }
    } catch {
      // Non-critical
    }
  }, [user]);

  const unsaveMsg = useCallback(async (messageId: string) => {
    if (!user) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user.sessionToken) headers['X-Session-Token'] = user.sessionToken;
      const res = await fetch('/api/community/messages/save', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ userId: user.id, messageId }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => m.id === messageId ? { ...m, isSaved: false } : m)
        );
      }
    } catch {
      // Non-critical
    }
  }, [user]);

  const fetchSavedMessages = useCallback(async () => {
    if (!user) return [];
    try {
      const headers: Record<string, string> = {};
      if (user.sessionToken) headers['X-Session-Token'] = user.sessionToken;
      const res = await fetch(`/api/community/messages/save?userId=${user.id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSavedMessages(data.saved);
        return data.saved;
      }
    } catch {
      // Non-critical
    }
    return [];
  }, [user]);

  // ---- Edit Message ----
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user?.sessionToken) return;
    try {
      const res = await fetch('/api/community/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': user.sessionToken,
        },
        body: JSON.stringify({ messageId, userId: user.id, content: newContent }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to edit message');
      }

      const { message } = await res.json();
      // Update local messages
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...message, _optimistic: false } : m)));
      return message;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user]);

  // ---- Toggle Reaction ----
  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user?.sessionToken) return;
    try {
      const res = await fetch('/api/community/messages/react', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': user.sessionToken,
        },
        body: JSON.stringify({ messageId, userId: user.id, emoji }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to toggle reaction');
      }

      const result = await res.json();
      // Update local message reactions
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, reactions: result.reactions } : m
        )
      );
      return result;
    } catch (err: any) {
      setError(err.message);
    }
  }, [user]);

  // ---- Search Messages ----
  const searchMessages = useCallback(async (query: string) => {
    if (!activeRoom) return { results: [], total: 0 };
    try {
      const res = await fetch(
        `/api/community/messages/search?roomId=${activeRoom.id}&q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error('Search failed');
      return await res.json();
    } catch {
      return { results: [], total: 0 };
    }
  }, [activeRoom]);

  // ---- Get Pinned Messages ----
  const getPinnedMessages = useCallback(async () => {
    if (!activeRoom) return [];
    try {
      const res = await fetch(
        `/api/community/messages/search?roomId=${activeRoom.id}&pinned=true`
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.pinned || [];
    } catch {
      return [];
    }
  }, [activeRoom]);

  // ---- Update Profile ----
  const updateProfile = useCallback(async (data: { displayName?: string; displayNameGurmukhi?: string; email?: string; bio?: string; avatarColor?: string }) => {
    if (!user?.sessionToken) return;
    try {
      const res = await fetch('/api/community/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': user.sessionToken,
        },
        body: JSON.stringify({ userId: user.id, ...data }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to update profile');
      }

      const { user: updatedUser } = await res.json();
      const merged = { ...user, ...updatedUser };
      setUser(merged);
      localStorage.setItem(CHAT_USER_KEY, JSON.stringify(merged));
      return merged;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user]);

  // ---- Admin Actions ----
  const adminAction = useCallback(async (action: string, payload: Record<string, unknown>) => {
    if (!user?.sessionToken) return;
    try {
      const res = await fetch('/api/community/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId: user.id, sessionToken: user.sessionToken, ...payload }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Admin action failed');
      }

      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user]);

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
    fetchRooms,
    selectRoom,
    sendMessage,
    deleteMessage: deleteMsg,
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
    saveMessage: saveMsg,
    unsaveMessage: unsaveMsg,
    fetchSavedMessages,
  };
}
