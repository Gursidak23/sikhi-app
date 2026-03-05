/**
 * Chat Admin Hook - Ban, unban, pin, delete, set role
 * 
 * Uses Zustand store for user/error state.
 */

'use client';

import { useCallback } from 'react';
import { useChatStore } from '../store/chatStore';

export function useChatAdmin() {
  const user = useChatStore((s) => s.user);

  const adminAction = useCallback(async (action: string, payload: Record<string, unknown>) => {
    const currentUser = useChatStore.getState().user;
    if (!currentUser?.sessionToken) return;
    try {
      const res = await fetch('/api/community/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId: currentUser.id,
          sessionToken: currentUser.sessionToken,
          ...payload,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Admin action failed');
      }

      return await res.json();
    } catch (err: any) {
      useChatStore.getState().setError(err.message);
      throw err;
    }
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  return {
    isAdmin,
    adminAction,
  };
}
