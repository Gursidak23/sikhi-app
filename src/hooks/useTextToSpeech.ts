'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Language } from '@/types';

interface TTSOptions {
  language: Language;
  rate?: number;
  onLineChange?: (index: number) => void;
  onEnd?: () => void;
}

interface TTSLine {
  text: string;
  lang?: 'pa' | 'hi' | 'en';
}

// Map our Language type to BCP 47 language tags
function getVoiceLang(lang: Language | 'pa' | 'hi' | 'en'): string {
  switch (lang) {
    case 'pa':
    case 'pa-roman':
      return 'pa-IN';
    case 'hi':
      return 'hi-IN';
    default:
      return 'en-US';
  }
}

function findBestVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  // Prefer voices that exactly match the language
  const exact = voices.find(v => v.lang === lang);
  if (exact) return exact;
  // Fall back to partial match (e.g. 'pa' matches 'pa-IN')
  const prefix = lang.split('-')[0];
  const partial = voices.find(v => v.lang.startsWith(prefix));
  if (partial) return partial;
  // For Punjabi, try Hindi as fallback (similar Gurmukhi/Devanagari phonetics)
  if (prefix === 'pa') {
    const hindi = voices.find(v => v.lang.startsWith('hi'));
    if (hindi) return hindi;
  }
  return null;
}

export function useTextToSpeech({ language, rate = 1, onLineChange, onEnd }: TTSOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [playbackRate, setPlaybackRate] = useState(rate);
  const [isSupported, setIsSupported] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);

  const linesRef = useRef<TTSLine[]>([]);
  const currentIndexRef = useRef(-1);
  const isPlayingRef = useRef(false);

  // Check browser support and load voices
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);
    if (!supported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) setVoiceReady(true);
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakLine = useCallback((line: TTSLine, index: number, onDone: () => void) => {
    if (!isPlayingRef.current) return;

    const utterance = new SpeechSynthesisUtterance(line.text);
    const lang = line.lang || (language === 'pa' || language === 'pa-roman' ? 'pa' : language === 'hi' ? 'hi' : 'en');
    const voiceLang = getVoiceLang(lang);
    
    const voice = findBestVoice(voiceLang);
    if (voice) utterance.voice = voice;
    utterance.lang = voiceLang;
    utterance.rate = playbackRate;
    utterance.pitch = 1;

    utterance.onend = () => {
      if (isPlayingRef.current) onDone();
    };

    utterance.onerror = (e) => {
      // 'interrupted' and 'canceled' are not real errors
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('TTS error:', e.error);
      }
      if (isPlayingRef.current) onDone();
    };

    setCurrentLineIndex(index);
    currentIndexRef.current = index;
    onLineChange?.(index);
    window.speechSynthesis.speak(utterance);
  }, [language, playbackRate, onLineChange]);

  const speakSequentially = useCallback((lines: TTSLine[], startIndex: number) => {
    if (startIndex >= lines.length) {
      setIsPlaying(false);
      setCurrentLineIndex(-1);
      isPlayingRef.current = false;
      onEnd?.();
      return;
    }

    const line = lines[startIndex];
    if (!line.text.trim()) {
      // Skip empty lines
      speakSequentially(lines, startIndex + 1);
      return;
    }

    speakLine(line, startIndex, () => {
      speakSequentially(lines, startIndex + 1);
    });
  }, [speakLine, onEnd]);

  /** Read a single line of text aloud */
  const speakSingle = useCallback((text: string, lang?: 'pa' | 'hi' | 'en') => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();

    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);

    const line: TTSLine = { text, lang };
    speakLine(line, 0, () => {
      setIsPlaying(false);
      setCurrentLineIndex(-1);
      isPlayingRef.current = false;
      onEnd?.();
    });
  }, [isSupported, speakLine, onEnd]);

  /** Read multiple lines sequentially with auto-advance */
  const speakAll = useCallback((lines: TTSLine[], startFrom = 0) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();

    linesRef.current = lines;
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    speakSequentially(lines, startFrom);
  }, [isSupported, speakSequentially]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    isPlayingRef.current = false;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentLineIndex(-1);
    currentIndexRef.current = -1;
  }, [isSupported]);

  const togglePause = useCallback(() => {
    if (isPaused) resume(); else pause();
  }, [isPaused, pause, resume]);

  const updateRate = useCallback((newRate: number) => {
    setPlaybackRate(newRate);
    // If currently speaking, restart from current line with new rate
    if (isPlaying && linesRef.current.length > 0) {
      window.speechSynthesis.cancel();
      isPlayingRef.current = true;
      // Small delay to let cancel complete
      setTimeout(() => {
        speakSequentially(linesRef.current, currentIndexRef.current);
      }, 100);
    }
  }, [isPlaying, speakSequentially]);

  return {
    isSupported,
    voiceReady,
    isPlaying,
    isPaused,
    currentLineIndex,
    playbackRate,
    speakSingle,
    speakAll,
    pause,
    resume,
    stop,
    togglePause,
    updateRate,
  };
}
