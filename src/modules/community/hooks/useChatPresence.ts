/**
 * Chat Presence Hook - Polling, typing, connection status, presence heartbeat
 * 
 * Manages the adaptive polling loop, tab visibility, presence heartbeats,
 * and expiry sweep. This is the "engine" that keeps the chat alive.
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useChatStore, type ChatUser, type ChatMessage } from '../store/chatStore';

// ============================================================================
// Constants
// ============================================================================

const POLL_MULTI_USER = 1200;
const POLL_ACTIVE = 2000;
const POLL_IDLE = 5000;
const POLL_BACKGROUND = 15000;
const EXPIRY_SWEEP_INTERVAL = 20000;
const MEMBER_POLL_FREQUENCY = 5;

// ============================================================================
// Notification Sound
// ============================================================================

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

export function useChatPresence() {
  const connectionStatus = useChatStore((s) => s.connectionStatus);
  const onlineCount = useChatStore((s) => s.onlineCount);
  const typingNames = useChatStore((s) => s.typingNames);

  // Refs for polling management
  const isTypingRef = useRef(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPollTimeRef = useRef<string>(new Date().toISOString());
  const lastActivityRef = useRef<number>(Date.now());
  const onlineCountRef = useRef(0);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const isTabVisibleRef = useRef<boolean>(true);
  const failedPollsRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);
  const pollCountRef = useRef(0);
  const lastPollETagRef = useRef<string>('');

  const getPollInterval = useCallback(() => {
    if (!isTabVisibleRef.current) return POLL_BACKGROUND;
    const idleTime = Date.now() - lastActivityRef.current;
    if (onlineCountRef.current > 1 && idleTime < 10000) return POLL_MULTI_USER;
    if (idleTime < 10000) return POLL_ACTIVE;
    if (idleTime > 30000) return POLL_BACKGROUND;
    return POLL_IDLE;
  }, []);

  const markActive = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const setIsTyping = useCallback((typing: boolean) => {
    isTypingRef.current = typing;
  }, []);

  // Track messageIds for dedup
  const trackMessageIds = useCallback((ids: string[]) => {
    for (const id of ids) {
      messageIdsRef.current.add(id);
    }
  }, []);

  const clearMessageIds = useCallback(() => {
    messageIdsRef.current.clear();
  }, []);

  const resetPollTime = useCallback(() => {
    lastPollTimeRef.current = new Date().toISOString();
  }, []);

  // ---- Mount/unmount ----
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ---- Expiry sweep ----
  useEffect(() => {
    const timer = setInterval(() => {
      useChatStore.getState().sweepExpired();
    }, EXPIRY_SWEEP_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // ---- Adaptive Polling ----
  useEffect(() => {
    const activeRoom = useChatStore.getState().activeRoom;
    if (!activeRoom) return;

    const poll = async () => {
      if (!mountedRef.current) return;
      pollCountRef.current++;

      try {
        const store = useChatStore.getState();
        const user = store.user;
        const currentActiveRoom = store.activeRoom;
        if (!currentActiveRoom) return;

        const skipMembers = pollCountRef.current % MEMBER_POLL_FREQUENCY !== 0;
        let pollUrl = `/api/community/messages/poll?roomId=${currentActiveRoom.id}&since=${encodeURIComponent(lastPollTimeRef.current)}`;
        if (skipMembers) pollUrl += '&skipMembers=1';
        if (user?.id) {
          pollUrl += `&userId=${user.id}`;
          pollUrl += `&typing=${isTypingRef.current ? '1' : '0'}`;
          if (isTypingRef.current && user.displayName) {
            pollUrl += `&typingName=${encodeURIComponent(user.displayName)}`;
          }
        }
        const pollHeaders: Record<string, string> = {};
        if (user?.sessionToken) pollHeaders['X-Session-Token'] = user.sessionToken;
        if (lastPollETagRef.current) {
          pollHeaders['If-None-Match'] = lastPollETagRef.current;
        }
        const res = await fetch(pollUrl, { headers: pollHeaders });

        if (res.status === 304) {
          if (failedPollsRef.current > 0) {
            failedPollsRef.current = 0;
            useChatStore.getState().setConnectionStatus('connected');
          }
          if (mountedRef.current) {
            pollTimeoutRef.current = setTimeout(poll, getPollInterval());
          }
          return;
        }

        if (!res.ok) {
          failedPollsRef.current++;
          if (failedPollsRef.current >= 3) {
            useChatStore.getState().setConnectionStatus('reconnecting');
          }
          return;
        }

        if (failedPollsRef.current > 0) {
          failedPollsRef.current = 0;
          useChatStore.getState().setConnectionStatus('connected');
        }

        const etag = res.headers.get('ETag');
        if (etag) lastPollETagRef.current = etag;

        const data = await res.json();

        if (data.messages && data.messages.length > 0) {
          const trulyNewMsgs: ChatMessage[] = [];
          for (const msg of data.messages) {
            if (!messageIdsRef.current.has(msg.id)) {
              trulyNewMsgs.push(msg);
            }
          }
          for (const msg of data.messages) {
            messageIdsRef.current.add(msg.id);
          }

          const storeNow = useChatStore.getState();
          if (trulyNewMsgs.length === 0) {
            // Replace optimistic messages
            storeNow.setMessages((prev) =>
              prev.map((m) => {
                if (!m._optimistic) return m;
                const real = data.messages.find(
                  (rm: ChatMessage) => rm.content === m.content && rm.userId === m.userId
                );
                return real || m;
              })
            );
          } else {
            storeNow.addMessages(trulyNewMsgs);
          }

          const otherNewMsgs = trulyNewMsgs.filter(
            (m: ChatMessage) => m.userId !== storeNow.user?.id
          );
          if (otherNewMsgs.length > 0) {
            playNotificationSound();
          }

          if (!isTabVisibleRef.current) {
            const otherNew = trulyNewMsgs.filter(
              (m: ChatMessage) => m.userId !== storeNow.user?.id
            );
            if (otherNew.length > 0) {
              useChatStore.getState().setUnreadCounts((prev) => ({
                ...prev,
                [currentActiveRoom.id]: (prev[currentActiveRoom.id] || 0) + otherNew.length,
              }));
            }
          }
        }

        if (data.members) {
          useChatStore.getState().setMembers(data.members);
          const count = data.members.filter((m: ChatUser) => m.isOnline).length;
          onlineCountRef.current = count;
          useChatStore.getState().setOnlineCount(count);
          useChatStore.getState().updateRoomMemberCount(currentActiveRoom.id, data.members.length);
        }

        if (data.typing) {
          useChatStore.getState().setTypingNames(data.typing);
        }

        if (data.serverTime) {
          lastPollTimeRef.current = data.serverTime;
        }
      } catch {
        failedPollsRef.current++;
        if (failedPollsRef.current >= 5) {
          useChatStore.getState().setConnectionStatus('disconnected');
        } else if (failedPollsRef.current >= 3) {
          useChatStore.getState().setConnectionStatus('reconnecting');
        }
      }

      if (mountedRef.current) {
        const interval = getPollInterval();
        const backoff = failedPollsRef.current > 0
          ? Math.min(interval * Math.pow(1.5, failedPollsRef.current), 30000)
          : interval;
        pollTimeoutRef.current = setTimeout(poll, backoff);
      }
    };

    pollTimeoutRef.current = setTimeout(poll, 500);

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, [useChatStore((s) => s.activeRoom?.id), getPollInterval]);

  // ---- Tab visibility ----
  useEffect(() => {
    const handler = () => {
      isTabVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        const activeRoom = useChatStore.getState().activeRoom;
        if (activeRoom) {
          useChatStore.getState().clearUnreadForRoom(activeRoom.id);
        }
        markActive();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [markActive]);

  // ---- Presence heartbeat ----
  useEffect(() => {
    const user = useChatStore.getState().user;
    if (!user) return;

    const setOnline = () => {
      const currentUser = useChatStore.getState().user;
      if (!currentUser) return;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser.sessionToken) headers['X-Session-Token'] = currentUser.sessionToken;
      fetch('/api/community/user', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ userId: currentUser.id, isOnline: true }),
      }).catch(() => {});
    };

    const setOffline = () => {
      const currentUser = useChatStore.getState().user;
      if (!currentUser) return;
      fetch('/api/community/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser.sessionToken ? { 'X-Session-Token': currentUser.sessionToken } : {}),
        },
        body: JSON.stringify({ userId: currentUser.id, isOnline: false }),
        keepalive: true,
      }).catch(() => {});
    };

    setOnline();
    const presenceInterval = setInterval(setOnline, 45000);
    window.addEventListener('beforeunload', setOffline);

    return () => {
      clearInterval(presenceInterval);
      window.removeEventListener('beforeunload', setOffline);
      setOffline();
    };
  }, [useChatStore((s) => s.user?.id)]);

  const reconnect = useCallback(() => {
    failedPollsRef.current = 0;
    useChatStore.getState().setConnectionStatus('connected');
    useChatStore.getState().setError(null);
  }, []);

  return {
    connectionStatus,
    onlineCount,
    typingNames,
    markActive,
    setIsTyping,
    reconnect,
    trackMessageIds,
    clearMessageIds,
    resetPollTime,
  };
}
