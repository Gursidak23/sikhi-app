'use client';

// ============================================================================
// LOADING STATES & SKELETON COMPONENTS
// ============================================================================
// Beautiful loading states with Sikh-themed styling
// Skeleton loaders for smooth perceived performance
// ============================================================================

import { cn } from '@/lib/utils';

// Animated pulse skeleton
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200',
        'bg-[length:200%_100%]',
        className
      )}
    />
  );
}

// Gurbani verse skeleton
export function GurbaniSkeleton() {
  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-amber-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      
      {/* Verses */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-3 py-4 border-b border-neutral-100 last:border-0">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// Timeline/History skeleton
export function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="w-0.5 flex-1 mt-2" />
          </div>
          <div className="flex-1 pb-8 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-xl border border-neutral-200 space-y-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  );
}

// Full page loader
interface PageLoaderProps {
  message?: string;
  language?: 'pa' | 'en' | 'hi';
}

export function PageLoader({ message, language = 'pa' }: PageLoaderProps) {
  const defaultMessages = {
    pa: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-neela-900 to-neela-800">
      {/* Animated Ik Onkar */}
      <div className="relative">
        <div className="text-6xl font-gurmukhi text-amber-400 animate-pulse">
          ੴ
        </div>
        {/* Rotating ring */}
        <div className="absolute inset-0 -m-4">
          <svg className="w-24 h-24 animate-spin-slow" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(251, 191, 36, 0.3)"
              strokeWidth="2"
              strokeDasharray="70 30"
            />
          </svg>
        </div>
      </div>
      
      <p className={cn(
        'mt-6 text-amber-100 text-lg',
        language === 'pa' && 'font-gurmukhi'
      )}>
        {message || defaultMessages[language]}
      </p>
      
      {/* Progress dots */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// Inline spinner
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <svg
      className={cn('animate-spin text-kesri-500', sizes[size], className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// Button loading state
export function LoadingButton({
  loading,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center',
        loading && 'cursor-wait',
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading && (
        <Spinner size="sm" className="absolute" />
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  );
}
