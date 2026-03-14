/**
 * Chat Rooms Hook - Manages room list, selection, joining
 * 
 * Uses Zustand store for state, exposes room-related actions.
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { apiUrl } from '@/lib/api-url';
import { useChatStore, type ChatRoom } from '../store/chatStore';
import { useChatAuth } from './useChatAuth';

export function useChatRooms() {
  const rooms = useChatStore((s) => s.rooms);
  const activeRoom = useChatStore((s) => s.activeRoom);
  const user = useChatStore((s) => s.user);
  const unreadCounts = useChatStore((s) => s.unreadCounts);
  const roomsLoadedRef = useRef(false);

  const { recoverSession } = useChatAuth();

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/community/rooms'));
      if (!res.ok) throw new Error('Failed to fetch rooms');
      const data = await res.json();
      useChatStore.getState().setRooms(data.rooms);
      return data.rooms;
    } catch (err: any) {
      useChatStore.getState().setError(err.message);
      return [];
    }
  }, []);

  const joinRoom = useCallback(async (roomId: string) => {
    const currentUser = useChatStore.getState().user;
    if (!currentUser) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser.sessionToken) headers['X-Session-Token'] = currentUser.sessionToken;
      const res = await fetch(apiUrl(`/api/community/rooms/${roomId}`), {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (res.status === 401) {
        const recovered = await recoverSession();
        if (recovered) {
          const retryHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          if (recovered.sessionToken) retryHeaders['X-Session-Token'] = recovered.sessionToken;
          await fetch(apiUrl(`/api/community/rooms/${roomId}`), {
            method: 'POST',
            headers: retryHeaders,
            body: JSON.stringify({ userId: recovered.id }),
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to join room:', err);
    }
  }, [recoverSession]);

  const selectRoom = useCallback(async (room: ChatRoom) => {
    const store = useChatStore.getState();
    store.setActiveRoom(room);
    store.setMessages([]);
    store.setIsLoading(true);
    store.setError(null);
    store.setReplyingTo(null);
    store.clearUnreadForRoom(room.id);

    const currentUser = store.user;
    if (currentUser) {
      await joinRoom(room.id);
    }

    try {
      const res = await fetch(apiUrl(`/api/community/messages?roomId=${room.id}&limit=50`));
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      useChatStore.getState().setMessages(data.messages);
      useChatStore.getState().setHasMore(data.hasMore);
      useChatStore.getState().setNextCursor(data.nextCursor);
    } catch (err: any) {
      useChatStore.getState().setError(err.message);
    } finally {
      useChatStore.getState().setIsLoading(false);
    }

    // Fetch members
    try {
      const res = await fetch(apiUrl(`/api/community/rooms/${room.id}`));
      if (res.ok) {
        const data = await res.json();
        useChatStore.getState().setMembers(data.members);
      }
    } catch {
      // Non-critical
    }
  }, [joinRoom]);

  // Load rooms on mount
  useEffect(() => {
    fetchRooms().then((fetchedRooms) => {
      roomsLoadedRef.current = true;
      if (fetchedRooms.length > 0) {
        const stored = localStorage.getItem('sikhi-chat-user');
        if (stored) {
          const defaultRoom = fetchedRooms.find((r: ChatRoom) => r.isDefault) || fetchedRooms[0];
          selectRoom(defaultRoom);
        }
      }
      useChatStore.getState().setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When user changes (registration/load), select default room
  useEffect(() => {
    if (!user) {
      useChatStore.getState().setIsLoading(false);
      return;
    }
    if (roomsLoadedRef.current && rooms.length > 0 && !activeRoom) {
      const defaultRoom = rooms.find((r: ChatRoom) => r.isDefault) || rooms[0];
      selectRoom(defaultRoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    rooms,
    activeRoom,
    unreadCounts,
    fetchRooms,
    selectRoom,
  };
}
