/**
 * Chat Auth Hook - Manages user registration, session recovery, profile, logout
 * 
 * Uses Zustand store for state, exposes auth-related actions.
 */

'use client';

import { useCallback } from 'react';
import { apiUrl } from '@/lib/api-url';
import { useChatStore, type ChatUser } from '../store/chatStore';

const CHAT_USER_KEY = 'sikhi-chat-user';

export function useChatAuth() {
  const user = useChatStore((s) => s.user);
  const setUser = useChatStore((s) => s.setUser);
  const setError = useChatStore((s) => s.setError);
  const resetAll = useChatStore((s) => s.resetAll);

  const registerUser = useCallback(async (
    displayName: string,
    displayNameGurmukhi?: string,
    avatarColor?: string,
    email?: string
  ) => {
    try {
      setError(null);
      const res = await fetch(apiUrl('/api/community/user'), {
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
      return newUser;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [setUser, setError]);

  const recoverSession = useCallback(async (): Promise<ChatUser | null> => {
    const currentUser = useChatStore.getState().user;
    if (!currentUser) return null;
    try {
      const res = await fetch(apiUrl('/api/community/user'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: currentUser.displayName,
          displayNameGurmukhi: currentUser.displayNameGurmukhi || undefined,
          avatarColor: currentUser.avatarColor,
          existingUserId: currentUser.id,
        }),
      });
      if (!res.ok) return null;
      const { user: newUser } = await res.json();
      setUser(newUser);
      return newUser;
    } catch {
      return null;
    }
  }, [setUser]);

  const updateProfile = useCallback(async (data: {
    displayName?: string;
    displayNameGurmukhi?: string;
    email?: string;
    bio?: string;
    avatarColor?: string;
  }) => {
    const currentUser = useChatStore.getState().user;
    if (!currentUser?.sessionToken) return;
    try {
      const res = await fetch(apiUrl('/api/community/user'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': currentUser.sessionToken,
        },
        body: JSON.stringify({ userId: currentUser.id, ...data }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to update profile');
      }

      const { user: updatedUser } = await res.json();
      const merged = { ...currentUser, ...updatedUser };
      setUser(merged);
      return merged;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [setUser, setError]);

  const logout = useCallback(() => {
    const currentUser = useChatStore.getState().user;
    if (currentUser) {
      fetch(apiUrl('/api/community/user'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser.sessionToken ? { 'X-Session-Token': currentUser.sessionToken } : {}),
        },
        body: JSON.stringify({ userId: currentUser.id, isOnline: false }),
        keepalive: true,
      }).catch(() => {});
    }
    resetAll();
  }, [resetAll]);

  return {
    user,
    registerUser,
    recoverSession,
    updateProfile,
    logout,
  };
}
