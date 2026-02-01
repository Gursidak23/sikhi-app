'use client';

// ============================================================================
// SKIP LINK COMPONENT
// ============================================================================
// Accessibility feature for keyboard users to skip navigation
// Follows WCAG 2.1 AA guidelines
// ============================================================================

import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href?: string;
  className?: string;
}

export function SkipLink({ href = '#main-content', className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default, visible on focus
        'sr-only focus:not-sr-only',
        // Positioning
        'fixed top-4 left-4 z-[100]',
        // Styling
        'px-6 py-3 rounded-lg font-medium text-sm',
        'bg-neela-700 text-white shadow-lg',
        // Focus states
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neela-500',
        // Animation
        'transition-all duration-200',
        className
      )}
    >
      <span className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        Skip to main content
      </span>
    </a>
  );
}

// Punjabi version
export function SkipLinkPunjabi({ href = '#main-content', className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'fixed top-4 left-4 z-[100]',
        'px-6 py-3 rounded-lg font-medium text-sm font-gurmukhi',
        'bg-neela-700 text-white shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neela-500',
        'transition-all duration-200',
        className
      )}
    >
      <span className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        ਮੁੱਖ ਸਮੱਗਰੀ ਤੇ ਜਾਓ
      </span>
    </a>
  );
}
