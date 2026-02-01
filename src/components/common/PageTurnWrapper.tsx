'use client';

// ============================================================================
// PAGE TURN WRAPPER COMPONENT
// ============================================================================
// Provides swipe gestures and page turn animations for Gurbani navigation
// Works on both mobile (touch) and desktop (click navigation buttons)
// ============================================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PageTurnWrapperProps {
  children: React.ReactNode;
  onNextPage: () => void;
  onPrevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  currentPage: number;
  className?: string;
}

type TurnDirection = 'next' | 'prev' | null;

export function PageTurnWrapper({
  children,
  onNextPage,
  onPrevPage,
  canGoNext,
  canGoPrev,
  currentPage,
  className,
}: PageTurnWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [turnDirection, setTurnDirection] = useState<TurnDirection>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Use refs to avoid stale closure issues
  const stateRef = useRef({
    onNextPage,
    onPrevPage,
    canGoNext,
    canGoPrev,
    isAnimating,
  });

  // Keep refs updated
  useEffect(() => {
    stateRef.current = {
      onNextPage,
      onPrevPage,
      canGoNext,
      canGoPrev,
      isAnimating,
    };
  }, [onNextPage, onPrevPage, canGoNext, canGoPrev, isAnimating]);

  const handlePageTurn = useCallback((direction: TurnDirection) => {
    const { isAnimating, canGoNext, canGoPrev, onNextPage, onPrevPage } = stateRef.current;
    
    if (isAnimating) return;
    if (direction === 'next' && !canGoNext) return;
    if (direction === 'prev' && !canGoPrev) return;

    setIsAnimating(true);
    setTurnDirection(direction);

    // Wait for animation to complete
    setTimeout(() => {
      if (direction === 'next') {
        onNextPage();
      } else if (direction === 'prev') {
        onPrevPage();
      }
      
      // Reset after content changes
      setTimeout(() => {
        setIsAnimating(false);
        setTurnDirection(null);
      }, 50);
    }, 400);
  }, []);

  // Combined touch handling - both for swipe detection AND visual feedback
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isSwiping = false;
    let isHorizontalSwipe: boolean | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      isSwiping = true;
      isHorizontalSwipe = null; // Reset direction detection
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      // Determine if this is a horizontal or vertical swipe (only once)
      if (isHorizontalSwipe === null && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      }
      
      // Only process horizontal swipes
      if (isHorizontalSwipe) {
        const maxSwipe = window.innerWidth * 0.25;
        const progress = Math.min(Math.abs(deltaX) / maxSwipe, 1);
        const { canGoPrev, canGoNext } = stateRef.current;
        
        if (deltaX > 0 && canGoPrev) {
          setSwipeProgress(progress);
          setSwipeDirection('right');
        } else if (deltaX < 0 && canGoNext) {
          setSwipeProgress(progress);
          setSwipeDirection('left');
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwiping) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const duration = Date.now() - startTime;
      
      // Reset visual state
      setSwipeProgress(0);
      setSwipeDirection(null);
      isSwiping = false;
      
      // Only trigger page turn for horizontal swipes
      if (isHorizontalSwipe) {
        const velocity = Math.abs(deltaX) / duration;
        const threshold = 40; // Reduced threshold for easier swiping
        const velocityThreshold = 0.15; // Reduced velocity threshold
        
        if (Math.abs(deltaX) >= threshold && velocity >= velocityThreshold) {
          if (deltaX > 0) {
            handlePageTurn('prev');
          } else {
            handlePageTurn('next');
          }
        }
      }
      
      isHorizontalSwipe = null;
    };

    // Use capture phase for better event handling
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlePageTurn]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePageTurn('prev');
      } else if (e.key === 'ArrowRight') {
        handlePageTurn('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePageTurn]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "page-turn-container relative overflow-hidden",
        className
      )}
      style={{ touchAction: 'pan-y pinch-zoom' }}
    >
      {/* Swipe indicators */}
      {swipeProgress > 0.1 && (
        <>
          {/* Left indicator (next page) */}
          {swipeDirection === 'left' && canGoNext && (
            <div 
              className="swipe-indicator swipe-indicator-left"
              style={{ opacity: swipeProgress }}
            >
              <span className="font-gurmukhi">ਅਗਲਾ ਅੰਗ →</span>
            </div>
          )}
          {/* Right indicator (prev page) */}
          {swipeDirection === 'right' && canGoPrev && (
            <div 
              className="swipe-indicator swipe-indicator-right"
              style={{ opacity: swipeProgress }}
            >
              <span className="font-gurmukhi">← ਪਿਛਲਾ ਅੰਗ</span>
            </div>
          )}
        </>
      )}

      {/* Page content with turn animation */}
      <div 
        className={cn(
          "page-turn-content",
          isAnimating && turnDirection === 'next' && 'page-turn-next',
          isAnimating && turnDirection === 'prev' && 'page-turn-prev',
        )}
        style={{
          // Subtle transform during swipe
          transform: swipeProgress > 0 
            ? `translateX(${swipeDirection === 'right' ? swipeProgress * 20 : -swipeProgress * 20}px) rotateY(${swipeDirection === 'right' ? swipeProgress * 3 : -swipeProgress * 3}deg)`
            : undefined,
        }}
      >
        {children}
      </div>

      {/* Page curl effect during turn */}
      {isAnimating && (
        <div className={cn(
          "page-curl-overlay",
          turnDirection === 'next' && 'page-curl-next',
          turnDirection === 'prev' && 'page-curl-prev',
        )} />
      )}

      {/* Navigation hints for desktop */}
      <div className="hidden lg:flex page-nav-hints">
        {canGoPrev && (
          <button
            onClick={() => handlePageTurn('prev')}
            className="page-nav-hint page-nav-hint-left"
            aria-label="Previous Ang"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-gurmukhi text-sm">ਪਿਛਲਾ</span>
          </button>
        )}
        {canGoNext && (
          <button
            onClick={() => handlePageTurn('next')}
            className="page-nav-hint page-nav-hint-right"
            aria-label="Next Ang"
          >
            <span className="font-gurmukhi text-sm">ਅਗਲਾ</span>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile swipe instruction (shows once) */}
      <SwipeHint />
    </div>
  );
}

// One-time hint for mobile users
function SwipeHint() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if this is a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasSeenHint = localStorage.getItem('sikhi-swipe-hint-seen');
    
    if (isTouchDevice && !hasSeenHint) {
      // Show hint after a short delay
      const showTimer = setTimeout(() => setShowHint(true), 1500);
      
      // Auto-hide after 4 seconds
      const hideTimer = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('sikhi-swipe-hint-seen', 'true');
      }, 5500);
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  if (!showHint) return null;

  return (
    <div 
      className="swipe-hint"
      onClick={() => {
        setShowHint(false);
        localStorage.setItem('sikhi-swipe-hint-seen', 'true');
      }}
    >
      <div className="swipe-hint-content">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 animate-bounce-x" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="w-px h-6 bg-white/30" />
          <svg className="w-6 h-6 animate-bounce-x-reverse" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        <span className="font-gurmukhi text-sm mt-2">ਅੰਗ ਬਦਲਣ ਲਈ ਸਵਾਈਪ ਕਰੋ</span>
        <span className="text-xs opacity-80">Swipe left or right to turn pages</span>
      </div>
    </div>
  );
}

export default PageTurnWrapper;
