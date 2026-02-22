'use client';

// ============================================================================
// GURBANI AUDIO PLAYER COMPONENT
// ============================================================================
// Audio player for Gurbani recitation and Kirtan
// Supports playback controls, speed adjustment, and repeat
// ============================================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

interface GurbaniAudioPlayerProps {
  src: string;
  title: string;
  subtitle?: string;
  language: Language;
  onEnded?: () => void;
  className?: string;
}

export function GurbaniAudioPlayer({
  src,
  title,
  subtitle,
  language,
  onEnded,
  className,
}: GurbaniAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooped, setIsLooped] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (!isLooped) {
        setIsPlaying(false);
        setCurrentTime(0);
        onEnded?.();
      }
    };

    const handleError = () => {
      setError(language === 'pa' ? 'ਆਡੀਓ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ' : 'Could not load audio');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [isLooped, onEnded, language]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooped;
    }
  }, [isLooped]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const skipForward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.currentTime + 10, duration);
  }, [duration]);

  const skipBackward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(audio.currentTime - 10, 0);
  }, []);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5];

  return (
    <div className={cn(
      'bg-gradient-to-r from-neela-50 to-neela-100 dark:from-neela-900/50 dark:to-neela-800/50',
      'rounded-xl p-4 shadow-md border border-neela-200 dark:border-neela-800',
      className
    )}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title */}
      <div className="mb-4">
        <h3 className="font-gurmukhi text-lg text-neela-900 dark:text-neela-100 font-semibold">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-neela-700 dark:text-neela-300">{subtitle}</p>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-4 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="text-center py-4">
          <div className="animate-pulse flex justify-center">
            <div className="w-12 h-12 rounded-full bg-neela-300 dark:bg-neela-700"></div>
          </div>
          <p className="text-sm text-neela-600 dark:text-neela-400 mt-2">
            {language === 'pa' ? 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : 'Loading...'}
          </p>
        </div>
      )}

      {/* Player Controls */}
      {!isLoading && !error && (
        <>
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-neela-200 dark:bg-neela-700 rounded-lg appearance-none cursor-pointer accent-neela-600"
              style={{
                background: `linear-gradient(to right, rgb(30 58 138) ${(currentTime / (duration || 1)) * 100}%, rgb(191 219 254) ${(currentTime / (duration || 1)) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-neela-600 dark:text-neela-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Skip Back */}
            <button
              onClick={skipBackward}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-neela-200 dark:hover:bg-neela-700 transition-colors text-neela-700 dark:text-neela-300"
              aria-label="Skip back 10 seconds"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className={cn(
                'p-4 rounded-full transition-all',
                'bg-neela-600 dark:bg-neela-500 text-white',
                'hover:bg-neela-700 dark:hover:bg-neela-400',
                'shadow-lg hover:shadow-xl',
                'transform hover:scale-105 active:scale-95'
              )}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>

            {/* Skip Forward */}
            <button
              onClick={skipForward}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-neela-200 dark:hover:bg-neela-700 transition-colors text-neela-700 dark:text-neela-300"
              aria-label="Skip forward 10 seconds"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
              </svg>
            </button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Playback Speed */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neela-600 dark:text-neela-400">
                {language === 'pa' ? 'ਸਪੀਡ' : 'Speed'}
              </span>
              <select
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="text-sm bg-white dark:bg-neutral-800 border border-neela-300 dark:border-neela-700 rounded px-2 py-1 text-neela-800 dark:text-neela-200"
              >
                {playbackRates.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}x
                  </option>
                ))}
              </select>
            </div>

            {/* Loop Toggle */}
            <button
              onClick={() => setIsLooped(!isLooped)}
              className={cn(
                'flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-full text-sm transition-colors',
                isLooped
                  ? 'bg-neela-600 text-white'
                  : 'bg-neela-200 dark:bg-neela-700 text-neela-700 dark:text-neela-300'
              )}
              aria-label={isLooped ? 'Disable loop' : 'Enable loop'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{language === 'pa' ? 'ਦੁਹਰਾਓ' : 'Loop'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Mini player for inline use
export function GurbaniAudioMini({
  src,
  label,
}: {
  src: string;
  label: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  return (
    <button
      onClick={togglePlay}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors',
        isPlaying
          ? 'bg-neela-600 text-white'
          : 'bg-neela-100 dark:bg-neela-900 text-neela-700 dark:text-neela-300 hover:bg-neela-200 dark:hover:bg-neela-800'
      )}
    >
      <audio ref={audioRef} src={src} />
      {isPlaying ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
}
