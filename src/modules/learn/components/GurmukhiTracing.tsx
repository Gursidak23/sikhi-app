'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/common/LanguageProvider';

interface Letter {
  gurmukhi: string;
  roman: string;
}

interface GurmukhiTracingProps {
  letters: Letter[];
  onLetterComplete?: (letter: string) => void;
  learnedLetters: Set<string>;
}

const CANVAS_SIZE = 300;
const LINE_WIDTH = 18;
const PASS_THRESHOLD = 35;

export default function GurmukhiTracing({ letters, onLetterComplete, learnedLetters }: GurmukhiTracingProps) {
  const { language, isPunjabi } = useLanguage();
  const isHindi = language === 'hi';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const currentLetter = letters[currentIndex];

  // Draw the guide letter on both canvases
  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    const guideCanvas = guideCanvasRef.current;
    if (!canvas || !guideCanvas) return;

    const ctx = canvas.getContext('2d');
    const guideCtx = guideCanvas.getContext('2d');
    if (!ctx || !guideCtx) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;
    ctx.scale(dpr, dpr);

    guideCanvas.width = CANVAS_SIZE * dpr;
    guideCanvas.height = CANVAS_SIZE * dpr;
    guideCtx.scale(dpr, dpr);

    // Dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    guideCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Guide letter (faded purple)
    ctx.font = '180px "Noto Sans Gurmukhi", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(147, 130, 220, 0.25)';
    ctx.fillText(currentLetter.gurmukhi, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 10);

    // Hidden guide for comparison (solid white)
    guideCtx.font = '180px "Noto Sans Gurmukhi", sans-serif';
    guideCtx.textAlign = 'center';
    guideCtx.textBaseline = 'middle';
    guideCtx.fillStyle = '#ffffff';
    guideCtx.fillText(currentLetter.gurmukhi, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 10);

    // Subtle border
    ctx.strokeStyle = 'rgba(147, 130, 220, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(4, 4, CANVAS_SIZE - 8, CANVAS_SIZE - 8);
  }, [currentLetter]);

  useEffect(() => {
    drawGuide();
    setHasDrawn(false);
    setScore(null);
    setShowResult(false);
    lastPointRef.current = null;
  }, [drawGuide]);

  const getPosition = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (showResult) return;
    e.preventDefault();
    setIsDrawing(true);
    setHasDrawn(true);
    const pos = getPosition(e);
    lastPointRef.current = pos;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || showResult) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const pos = getPosition(e);
    const last = lastPointRef.current;

    if (last) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = '#6C63FF';
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.restore();
    }

    lastPointRef.current = pos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const calculateAccuracy = useCallback(() => {
    const canvas = canvasRef.current;
    const guideCanvas = guideCanvasRef.current;
    if (!canvas || !guideCanvas) return 0;

    const ctx = canvas.getContext('2d');
    const guideCtx = guideCanvas.getContext('2d');
    if (!ctx || !guideCtx) return 0;

    const dpr = window.devicePixelRatio || 1;
    const size = CANVAS_SIZE * dpr;

    const drawnData = ctx.getImageData(0, 0, size, size).data;
    const guideData = guideCtx.getImageData(0, 0, size, size).data;

    let guidePixels = 0;
    let overlapPixels = 0;
    let totalDrawn = 0;

    for (let i = 0; i < drawnData.length; i += 4) {
      const isGuide = guideData[i] > 128;
      const r = drawnData[i];
      const b = drawnData[i + 2];
      // Detect the drawn stroke (#6C63FF — blue channel > 200, red 50–150)
      const isDrawnPixel = b > 200 && r < 150 && r > 50;

      if (isGuide) guidePixels++;
      if (isDrawnPixel) totalDrawn++;
      if (isGuide && isDrawnPixel) overlapPixels++;
    }

    if (guidePixels === 0 || totalDrawn === 0) return 0;

    const coverage = overlapPixels / guidePixels;
    const precision = overlapPixels / totalDrawn;
    return Math.min(Math.round((coverage * 0.6 + precision * 0.4) * 100), 100);
  }, []);

  const handleCheck = () => {
    const accuracy = calculateAccuracy();
    setScore(accuracy);
    setShowResult(true);

    if (accuracy >= PASS_THRESHOLD) {
      setStreak(prev => prev + 1);
      onLetterComplete?.(currentLetter.gurmukhi);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % letters.length);
  };

  const handleRetry = () => {
    drawGuide();
    setHasDrawn(false);
    setScore(null);
    setShowResult(false);
    lastPointRef.current = null;
  };

  const handleClear = () => {
    drawGuide();
    setHasDrawn(false);
    lastPointRef.current = null;
  };

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-6 sm:p-8 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className={cn('text-sm text-purple-600 dark:text-purple-400', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi ? 'ਅੱਖਰ ਲਿਖੋ:' : isHindi ? 'अक्षर लिखें:' : 'Trace the letter:'}
          </p>
          <span className="text-sm text-neutral-500">
            {currentIndex + 1}/{letters.length}
          </span>
        </div>

        {/* Letter name */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl font-gurmukhi text-purple-600 dark:text-purple-400">
            {currentLetter.gurmukhi}
          </span>
          <span className="text-lg text-neutral-500">
            {currentLetter.roman}
          </span>
        </div>

        {/* Canvas area */}
        <div className="relative inline-block rounded-xl overflow-hidden shadow-inner border-2 border-purple-300 dark:border-purple-700 touch-none">
          <canvas
            ref={canvasRef}
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            className="cursor-crosshair bg-[#1a1a2e]"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <canvas ref={guideCanvasRef} style={{ display: 'none' }} />

          {/* Score overlay */}
          {showResult && score !== null && (
            <div className={cn(
              'absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl transition-opacity',
              score >= PASS_THRESHOLD ? 'text-emerald-400' : 'text-amber-400'
            )}>
              <div className="text-6xl mb-2">
                {score >= 80 ? '🌟' : score >= PASS_THRESHOLD ? '✅' : '🔄'}
              </div>
              <div className="text-3xl font-bold">{score}%</div>
              <p className={cn('text-sm mt-1', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                {score >= 80
                  ? (isPunjabi ? 'ਬਹੁਤ ਵਧੀਆ!' : isHindi ? 'बहुत बढ़िया!' : 'Excellent!')
                  : score >= PASS_THRESHOLD
                    ? (isPunjabi ? 'ਚੰਗਾ!' : isHindi ? 'अच्छा!' : 'Good!')
                    : (isPunjabi ? 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ' : isHindi ? 'दोबारा कोशिश करें' : 'Try again!')}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center mt-6">
          {!showResult ? (
            <>
              <button
                onClick={handleClear}
                disabled={!hasDrawn}
                className="px-5 py-3 bg-neutral-200 dark:bg-neutral-700 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPunjabi ? 'ਮਿਟਾਓ' : isHindi ? 'मिटाएं' : 'Clear'}
              </button>
              <button
                onClick={handleCheck}
                disabled={!hasDrawn}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPunjabi ? 'ਚੈੱਕ ਕਰੋ' : isHindi ? 'जाँचें' : 'Check'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetry}
                className="px-5 py-3 bg-neutral-200 dark:bg-neutral-700 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                {isPunjabi ? 'ਦੁਬਾਰਾ' : isHindi ? 'दोबारा' : 'Retry'}
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                {isPunjabi ? 'ਅਗਲਾ' : isHindi ? 'अगला' : 'Next'} →
              </button>
            </>
          )}
        </div>

        {/* Streak counter */}
        <div className="mt-5 text-lg">
          🔥 {isPunjabi ? 'ਲੜੀ' : isHindi ? 'लड़ी' : 'Streak'}: <span className="font-bold text-purple-600">{streak}</span>
        </div>

        {/* Letter navigation grid */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-5">
          {letters.map((letter, i) => (
            <button
              key={letter.gurmukhi}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-gurmukhi transition-all',
                i === currentIndex
                  ? 'bg-purple-600 text-white scale-110'
                  : learnedLetters.has(letter.gurmukhi)
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              )}
              title={letter.roman}
            >
              {letter.gurmukhi}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
