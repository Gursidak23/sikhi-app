// ============================================================================
// SWIPE GESTURE HOOK
// ============================================================================
// Detects swipe gestures for touch-based navigation
// Used for page-turning navigation in Gurbani reader
// ============================================================================

import { useEffect, useRef, useCallback } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance for swipe detection
  velocityThreshold?: number; // Minimum velocity for swipe
  preventScrollOnSwipe?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  isSwiping: boolean;
}

export function useSwipeGesture(
  elementRef: React.RefObject<HTMLElement | null>,
  config: SwipeConfig
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocityThreshold = 0.3,
    preventScrollOnSwipe = false,
  } = config;

  const stateRef = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: true,
    };
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!stateRef.current.isSwiping) return;

    const touch = e.touches[0];
    stateRef.current.currentX = touch.clientX;
    stateRef.current.currentY = touch.clientY;

    // Calculate direction
    const deltaX = touch.clientX - stateRef.current.startX;
    const deltaY = touch.clientY - stateRef.current.startY;

    // If horizontal swipe is dominant, prevent scroll
    if (preventScrollOnSwipe && Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }
  }, [preventScrollOnSwipe]);

  const handleTouchEnd = useCallback(() => {
    if (!stateRef.current.isSwiping) return;

    const { startX, startY, startTime, currentX, currentY } = stateRef.current;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const duration = Date.now() - startTime;
    
    // Calculate velocity (pixels per millisecond)
    const velocityX = Math.abs(deltaX) / duration;
    const velocityY = Math.abs(deltaY) / duration;

    // Determine if this is a valid swipe
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX);

    if (isHorizontalSwipe && Math.abs(deltaX) >= threshold && velocityX >= velocityThreshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (isVerticalSwipe && Math.abs(deltaY) >= threshold && velocityY >= velocityThreshold) {
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    stateRef.current.isSwiping = false;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, velocityThreshold]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScrollOnSwipe });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, preventScrollOnSwipe]);
}

// Hook for tracking swipe progress (for animations)
export function useSwipeProgress(
  elementRef: React.RefObject<HTMLElement | null>,
  onProgress: (progress: number, direction: 'left' | 'right') => void
) {
  const stateRef = useRef({
    startX: 0,
    isSwiping: false,
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    stateRef.current = {
      startX: e.touches[0].clientX,
      isSwiping: true,
    };
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!stateRef.current.isSwiping) return;

    const deltaX = e.touches[0].clientX - stateRef.current.startX;
    const maxSwipe = window.innerWidth * 0.4; // 40% of screen width
    const progress = Math.min(Math.abs(deltaX) / maxSwipe, 1);
    const direction = deltaX > 0 ? 'right' : 'left';
    
    onProgress(progress, direction);
  }, [onProgress]);

  const handleTouchEnd = useCallback(() => {
    stateRef.current.isSwiping = false;
    onProgress(0, 'left'); // Reset
  }, [onProgress]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);
}
