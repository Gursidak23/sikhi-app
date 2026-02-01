'use client';

// ============================================================================
// OPTIMIZED IMAGE COMPONENT
// ============================================================================
// Next.js Image wrapper with blur placeholder and loading states
// Optimized for sacred imagery and historical photos
// ============================================================================

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

// Base64 blur placeholder - subtle sacred cream color
const BLUR_PLACEHOLDER = 
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

// Golden blur for sacred images
const SACRED_BLUR = 
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOsr6uvBwAE1wHsS7qLqAAAAABJRU5ErkJggg==';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  variant?: 'default' | 'sacred';
  showSkeleton?: boolean;
}

export function OptimizedImage({
  variant = 'default',
  showSkeleton = true,
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  const blurPlaceholder = variant === 'sacred' ? SACRED_BLUR : BLUR_PLACEHOLDER;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Skeleton loader */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 animate-pulse bg-neutral-200" />
      )}
      
      <Image
        {...props}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        placeholder="blur"
        blurDataURL={blurPlaceholder}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

// Avatar/Profile Image Component
interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export function AvatarImage({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className 
}: AvatarImageProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  if (!src || error) {
    // Fallback to initials
    const initials = fallback || alt.charAt(0).toUpperCase();
    return (
      <div
        className={cn(
          sizeClasses[size],
          'rounded-full bg-gradient-to-br from-amber-400 to-amber-600',
          'flex items-center justify-center font-gurmukhi font-bold text-white',
          textSizes[size],
          className
        )}
        aria-label={alt}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={cn(sizeClasses[size], 'relative rounded-full overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
