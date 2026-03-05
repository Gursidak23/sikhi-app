/**
 * Chat Messages Hook - Send, edit, delete, save, search, reactions, pagination
 * 
 * Uses Zustand store for state, exposes message-related actions.
 */

'use client';

import { useCallback } from 'react';
import { useChatStore, type ChatMessage } from '../store/chatStore';
import { useChatAuth } from './useChatAuth';

export function useChatMessages() {
  const messages = useChatStore((s) => s.messages);
  const hasMore = useChatStore((s) => s.hasMore);
  const replyingTo = useChatStore((s) => s.replyingTo);
  const savedMessages = useChatStore((s) => s.savedMessages);

  const { recoverSession } = useChatAuth();

  const loadMore = useCallback(async () => {
    const { activeRoom, nextCursor, hasMore: canLoadMore } = useChatStore.getState();
    if (!activeRoom || !nextCursor || !canLoadMore) return;
    try {
      const res = await fetch(
        `/api/community/messages?roomId=${activeRoom.id}&cursor=${nextCursor}&limit=50`
      );
      if (!res.ok) throw new Error('Failed to load more messages');
      const data = await res.json();
      useChatStore.getState().prependMessages(data.messages);
      useChatStore.getState().setHasMore(data.hasMore);
      useChatStore.getState().setNextCursor(data.nextCursor);
    } catch (err: any) {
      useChatStore.getState().setError(err.message);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const store = useChatStore.getState();
    const { user, activeRoom, replyingTo: currentReply } = store;
    if (!user || !activeRoom || !content.trim()) return;

    const trimmed = content.trim();
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
      replyTo: currentReply ? {
        id: currentReply.id,
        content: currentReply.content,
        user: { displayName: currentReply.user.displayName },
      } : null,
      _optimistic: true,
    };

    store.setMessages((prev) => [...prev, optimisticMsg]);
    store.setReplyingTo(null);
    store.setError(null);

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
          replyToId: currentReply?.id,
        }),
      });

      if (res.status === 401) {
        const recovered = await recoverSession();
        if (recovered) {
          currentUser = recovered;
          const retryHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          if (recovered.sessionToken) retryHeaders['X-Session-Token'] = recovered.sessionToken;
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
              replyToId: currentReply?.id,
            }),
          });
        }
        if (res.status === 401) {
          useChatStore.getState().setUser(null);
          useChatStore.getState().setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          useChatStore.getState().setError('Session expired. Please register again.');
          return;
        }
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      const { message } = await res.json();
      useChatStore.getState().replaceOptimistic(optimisticId, message);
    } catch (err: any) {
      useChatStore.getState().setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      useChatStore.getState().setError(err.message);
    }
  }, [recoverSession]);

  const deleteMessage = useCallback(async (messageId: string) => {
    const user = useChatStore.getState().user;
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
        useChatStore.getState().updateMessage(messageId, {
          content: '[Message deleted]',
          isDeleted: true,
        });
      }
    } catch (err: any) {
      useChatStore.getState().setError(err.message);
    }
  }, []);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    const user = useChatStore.getState().user;
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
      useChatStore.getState().updateMessage(messageId, { ...message, _optimistic: false });
      return message;
    } catch (err: any) {
      useChatStore.getState().setError(err.message);
      throw err;
    }
  }, []);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    const user = useChatStore.getState().user;
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
      useChatStore.getState().updateMessage(messageId, { reactions: result.reactions });
      return result;
    } catch (err: any) {
      useChatStore.getState().setError(err.message);
    }
  }, []);

  const saveMessage = useCallback(async (messageId: string) => {
    const user = useChatStore.getState().user;
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
        useChatStore.getState().updateMessage(messageId, { isSaved: true });
      }
    } catch { /* Non-critical */ }
  }, []);

  const unsaveMessage = useCallback(async (messageId: string) => {
    const user = useChatStore.getState().user;
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
        useChatStore.getState().updateMessage(messageId, { isSaved: false });
      }
    } catch { /* Non-critical */ }
  }, []);

  const fetchSavedMessages = useCallback(async () => {
    const user = useChatStore.getState().user;
    if (!user) return [];
    try {
      const headers: Record<string, string> = {};
      if (user.sessionToken) headers['X-Session-Token'] = user.sessionToken;
      const res = await fetch(`/api/community/messages/save?userId=${user.id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        useChatStore.getState().setSavedMessages(data.saved);
        return data.saved;
      }
    } catch { /* Non-critical */ }
    return [];
  }, []);

  const searchMessages = useCallback(async (query: string) => {
    const activeRoom = useChatStore.getState().activeRoom;
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
  }, []);

  const getPinnedMessages = useCallback(async () => {
    const activeRoom = useChatStore.getState().activeRoom;
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
  }, []);

  const setReplyingTo = useChatStore((s) => s.setReplyingTo);

  return {
    messages,
    hasMore,
    replyingTo,
    savedMessages,
    loadMore,
    sendMessage,
    deleteMessage,
    editMessage,
    toggleReaction,
    saveMessage,
    unsaveMessage,
    fetchSavedMessages,
    searchMessages,
    getPinnedMessages,
    setReplyingTo,
  };
}
