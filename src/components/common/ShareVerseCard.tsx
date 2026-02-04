'use client';

// ============================================================================
// SHARE VERSE CARDS COMPONENT
// ============================================================================
// Create beautiful shareable images of Gurbani verses
// Uses Canvas API to generate downloadable images
// ============================================================================

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

interface ShareVerseCardProps {
  gurmukhi: string;
  translation?: string;
  transliteration?: string;
  source?: string; // e.g., "Ang 1, SGGS"
  language: Language;
}

// Card themes
const CARD_THEMES = [
  {
    id: 'kesri',
    name: { pa: 'ਕੇਸਰੀ', en: 'Kesri' },
    gradient: ['#f97316', '#ea580c'],
    textColor: '#ffffff',
  },
  {
    id: 'neela',
    name: { pa: 'ਨੀਲਾ', en: 'Neela' },
    gradient: ['#3b82f6', '#1d4ed8'],
    textColor: '#ffffff',
  },
  {
    id: 'hara',
    name: { pa: 'ਹਰਾ', en: 'Green' },
    gradient: ['#22c55e', '#16a34a'],
    textColor: '#ffffff',
  },
  {
    id: 'saffron-cream',
    name: { pa: 'ਕੇਸਰੀ-ਕਰੀਮ', en: 'Saffron Cream' },
    gradient: ['#fff7ed', '#ffedd5'],
    textColor: '#9a3412',
  },
  {
    id: 'royal',
    name: { pa: 'ਸ਼ਾਹੀ', en: 'Royal' },
    gradient: ['#581c87', '#7c3aed'],
    textColor: '#ffffff',
  },
  {
    id: 'night',
    name: { pa: 'ਰਾਤ', en: 'Night' },
    gradient: ['#1e293b', '#0f172a'],
    textColor: '#f1f5f9',
  },
];

export function ShareVerseCard({
  gurmukhi,
  translation,
  transliteration,
  source,
  language,
}: ShareVerseCardProps) {
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // Set canvas size (Instagram-friendly square)
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, selectedTheme.gradient[0]);
    gradient.addColorStop(1, selectedTheme.gradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add decorative border
    ctx.strokeStyle = selectedTheme.textColor;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);
    ctx.globalAlpha = 1;

    // Add Ik Onkar at top
    ctx.fillStyle = selectedTheme.textColor;
    ctx.font = '80px serif';
    ctx.textAlign = 'center';
    ctx.fillText('ੴ', width / 2, 120);

    // Add decorative line
    ctx.beginPath();
    ctx.moveTo(width / 2 - 100, 150);
    ctx.lineTo(width / 2 + 100, 150);
    ctx.strokeStyle = selectedTheme.textColor;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Draw Gurmukhi text (centered, wrapped)
    ctx.fillStyle = selectedTheme.textColor;
    ctx.font = '48px "Noto Sans Gurmukhi", serif';
    ctx.textAlign = 'center';
    
    const maxWidth = width - 120;
    const lineHeight = 70;
    const words = gurmukhi.split(' ');
    let line = '';
    let y = 350;
    const lines: string[] = [];

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        lines.push(line.trim());
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Center vertically
    const textBlockHeight = lines.length * lineHeight;
    y = (height - textBlockHeight) / 2 + 20;

    lines.forEach((textLine) => {
      ctx.fillText(textLine, width / 2, y);
      y += lineHeight;
    });

    // Add translation if enabled
    if (showTranslation && translation) {
      ctx.font = '28px sans-serif';
      ctx.globalAlpha = 0.85;
      
      const translationWords = translation.split(' ');
      let translationLine = '';
      const translationLines: string[] = [];
      const translationMaxWidth = width - 160;
      
      for (const word of translationWords) {
        const testLine = translationLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > translationMaxWidth && translationLine !== '') {
          translationLines.push(translationLine.trim());
          translationLine = word + ' ';
        } else {
          translationLine = testLine;
        }
      }
      translationLines.push(translationLine.trim());

      y = height - 250 - (translationLines.length * 40);
      translationLines.forEach((textLine) => {
        ctx.fillText(textLine, width / 2, y);
        y += 40;
      });
      ctx.globalAlpha = 1;
    }

    // Add source at bottom
    if (source) {
      ctx.font = '24px sans-serif';
      ctx.globalAlpha = 0.7;
      ctx.fillText(source, width / 2, height - 100);
      ctx.globalAlpha = 1;
    }

    // Add watermark
    ctx.font = '20px sans-serif';
    ctx.globalAlpha = 0.5;
    ctx.fillText('Sikhi Vidhya', width / 2, height - 60);
    ctx.globalAlpha = 1;

    setIsGenerating(false);
  }, [gurmukhi, translation, source, selectedTheme, showTranslation]);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'gurbani-verse.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const shareImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/png');
      });

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'gurbani-verse.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Gurbani Verse',
            text: gurmukhi,
          });
          return;
        }
      }

      // Fallback to download
      downloadImage();
    } catch (error) {
      console.error('Error sharing:', error);
      downloadImage();
    }
  }, [gurmukhi, downloadImage]);

  return (
    <>
      {/* Share Button */}
      <button
        onClick={() => {
          setShowModal(true);
          setTimeout(generateImage, 100);
        }}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5',
          'text-sm rounded-lg transition-colors',
          'bg-neela-100 dark:bg-neela-900 text-neela-700 dark:text-neela-300',
          'hover:bg-neela-200 dark:hover:bg-neela-800'
        )}
        aria-label={language === 'pa' ? 'ਸਾਂਝਾ ਕਰੋ' : 'Share'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
          />
        </svg>
        <span className="hidden sm:inline">
          {language === 'pa' ? 'ਸਾਂਝਾ ਕਰੋ' : 'Share'}
        </span>
      </button>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {language === 'pa' ? 'ਪੰਗਤੀ ਸਾਂਝੀ ਕਰੋ' : 'Share Verse'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview */}
            <div className="p-4">
              <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain"
                />
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="px-4 pb-4">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {language === 'pa' ? 'ਥੀਮ ਚੁਣੋ' : 'Select Theme'}
              </p>
              <div className="flex gap-2 flex-wrap">
                {CARD_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme);
                      setTimeout(generateImage, 50);
                    }}
                    className={cn(
                      'w-10 h-10 rounded-lg transition-all',
                      selectedTheme.id === theme.id && 'ring-2 ring-offset-2 ring-neela-500'
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
                    }}
                    title={language === 'pa' ? theme.name.pa : theme.name.en}
                  />
                ))}
              </div>
            </div>

            {/* Options */}
            {translation && (
              <div className="px-4 pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => {
                      setShowTranslation(e.target.checked);
                      setTimeout(generateImage, 50);
                    }}
                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-neela-600 focus:ring-neela-500"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {language === 'pa' ? 'ਅਰਥ ਸ਼ਾਮਲ ਕਰੋ' : 'Include Translation'}
                  </span>
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={shareImage}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neela-600 text-white rounded-lg hover:bg-neela-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                  />
                </svg>
                <span>{language === 'pa' ? 'ਸਾਂਝਾ ਕਰੋ' : 'Share'}</span>
              </button>
              <button
                onClick={downloadImage}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                  />
                </svg>
                <span>{language === 'pa' ? 'ਡਾਊਨਲੋਡ' : 'Download'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Simple share button that copies text
export function ShareTextButton({
  gurmukhi,
  translation,
  source,
  language,
}: Omit<ShareVerseCardProps, 'transliteration'>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = [
      gurmukhi,
      translation && `\n${translation}`,
      source && `\n— ${source}`,
    ].filter(Boolean).join('');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [gurmukhi, translation, source]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1',
        'text-xs rounded transition-colors',
        copied
          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
      )}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{language === 'pa' ? 'ਕਾਪੀ ਹੋ ਗਈ' : 'Copied!'}</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
          <span>{language === 'pa' ? 'ਕਾਪੀ' : 'Copy'}</span>
        </>
      )}
    </button>
  );
}
