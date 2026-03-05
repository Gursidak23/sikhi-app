/**
 * Expiry Timer Context - Single shared timer for all message expiry countdowns
 * 
 * Instead of each MessageBubble running its own setInterval (50 messages = 50 timers),
 * this context provides a single tick counter that all messages subscribe to.
 * The tick advances every 5s when messages are expiring soon, 30s otherwise.
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { useChatStore } from '../store/chatStore';

interface ExpiryTimerContextValue {
  tick: number;
}

const ExpiryTimerContext = createContext<ExpiryTimerContextValue>({ tick: 0 });

export function useExpiryTick() {
  return useContext(ExpiryTimerContext).tick;
}

export function ExpiryTimerProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const updateInterval = () => {
      const messages = useChatStore.getState().messages;
      const now = Date.now();
      const hasExpiringSoon = messages.some((m) => {
        if (m.isSaved || !m.expiresAt) return false;
        const remaining = new Date(m.expiresAt).getTime() - now;
        return remaining > 0 && remaining < 300_000; // < 5 min
      });
      return hasExpiringSoon ? 5_000 : 30_000;
    };

    const startTimer = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const interval = updateInterval();
      intervalRef.current = setInterval(() => {
        setTick((t) => t + 1);
        // Re-check interval — switch to faster ticking if needed
        const newInterval = updateInterval();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => setTick((t) => t + 1), newInterval);
        }
      }, interval);
    };

    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <ExpiryTimerContext.Provider value={{ tick }}>
      {children}
    </ExpiryTimerContext.Provider>
  );
}
