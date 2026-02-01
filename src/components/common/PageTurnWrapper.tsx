'use client';

// ============================================================================
// PAGE TURN WRAPPER COMPONENT
// ============================================================================
// Provides swipe gestures and page turn animations for Gurbani navigation
// Works on both mobile (touch) and desktop (click navigation buttons)
// ============================================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
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

  const handlePageTurn = useCallback((direction: TurnDirection) => {
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
    }, 400); // Match animation duration
  }, [isAnimating, canGoNext, canGoPrev, onNextPage, onPrevPage]);

  // Swipe gesture handling
  useSwipeGesture(containerRef, {
    onSwipeLeft: () => handlePageTurn('next'),
    onSwipeRight: () => handlePageTurn('prev'),
    threshold: 50,
    velocityThreshold: 0.2,
  });

  // Track swipe progress for visual feedback
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let startX = 0;
    let isSwiping = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isSwiping = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;
      const deltaX = e.touches[0].clientX - startX;
      const maxSwipe = window.innerWidth * 0.3;
      const progress = Math.min(Math.abs(deltaX) / maxSwipe, 1);
      
      // Only show progress if we can navigate in that direction
      if (deltaX > 0 && canGoPrev) {
        setSwipeProgress(progress);
        setSwipeDirection('right');
      } else if (deltaX < 0 && canGoNext) {
        setSwipeProgress(progress);
        setSwipeDirection('left');
      }
    };

    const handleTouchEnd = () => {
      isSwiping = false;
      setSwipeProgress(0);
      setSwipeDirection(null);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canGoNext, canGoPrev]);

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
        "page-turn-container relative overflow-hidden touch-pan-y",
        className
      )}
    >
      {/* Swipe indicators */}
      {swipeProgress > 0 && (
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
    const hasSeenHint = localStorage.getItem('sikhi-swipe-hint-seen');
    if (!hasSeenHint && 'ontouchstart' in window) {
      setShowHint(true);
      const timer = setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('sikhi-swipe-hint-seen', 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showHint) return null;

  return (
    <div className="swipe-hint">
      <div className="swipe-hint-content">
        <svg className="w-8 h-8 animate-swipe-hint" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <span className="font-gurmukhi">ਅੰਗ ਬਦਲਣ ਲਈ ਸਵਾਈਪ ਕਰੋ</span>
        <span className="text-xs text-amber-700">Swipe to turn pages</span>
      </div>
    </div>
  );
}

export default PageTurnWrapper;
