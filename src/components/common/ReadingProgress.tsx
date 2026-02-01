'use client';

// ============================================================================
// READING PROGRESS BAR
// ============================================================================
// Visual indicator of reading progress on long pages
// Helpful for Gurbani and history content
// ============================================================================

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ReadingProgressProps {
  variant?: 'kesri' | 'neela';
  className?: string;
}

export function ReadingProgress({ variant = 'neela', className }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    };

    window.addEventListener('scroll', calculateProgress, { passive: true });
    calculateProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', calculateProgress);
  }, []);

  if (progress === 0) return null;

  return (
    <div
      className={cn(
        'reading-progress',
        variant === 'kesri' ? 'reading-progress-kesri' : 'reading-progress-neela',
        className
      )}
      style={{ '--reading-progress': `${progress}%` } as React.CSSProperties}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Reading progress: ${Math.round(progress)}%`}
    />
  );
}
