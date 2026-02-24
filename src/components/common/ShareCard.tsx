'use client';

// ============================================================================
// SHARING CARDS COMPONENT
// ============================================================================
// Generates beautiful shareable verse cards with canvas rendering
// Users can share on social media, download as image, or copy text
// ============================================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

interface ShareCardProps {
  gurmukhi: string;
  translation?: string;
  transliteration?: string;
  angNumber?: number;
  raag?: string;
  writer?: string;
  language?: Language;
  className?: string;
}

// Card themes
const CARD_THEMES = [
  { id: 'golden', name: 'Golden', bg: '#FDF8F0', border: '#DAA520', text: '#1A1A1A', accent: '#B8860B', gradient: ['#FEF9E7', '#FDF6E3'] },
  { id: 'royal', name: 'Royal Blue', bg: '#1E3A5F', border: '#4A90D9', text: '#F0E6D2', accent: '#6BB5FF', gradient: ['#1E3A5F', '#0D2137'] },
  { id: 'kesri', name: 'Kesri', bg: '#FF8C00', border: '#FFB347', text: '#FFFFFF', accent: '#FFF3E0', gradient: ['#FF6B00', '#FF8C00'] },
  { id: 'cream', name: 'Cream', bg: '#FFFBF0', border: '#D4B896', text: '#4A3728', accent: '#8B7355', gradient: ['#FFFBF0', '#F5E6D3'] },
  { id: 'night', name: 'Night', bg: '#0A0A1A', border: '#2A2A4A', text: '#E8E8F0', accent: '#6366F1', gradient: ['#0A0A1A', '#1A1A2E'] },
];

export function ShareCard({
  gurmukhi,
  translation,
  transliteration,
  angNumber,
  raag,
  writer,
  language = 'pa',
  className,
}: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const theme = CARD_THEMES[selectedTheme];

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, theme.gradient[0]);
    gradient.addColorStop(1, theme.gradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Inner border
    ctx.strokeStyle = theme.border + '40';
    ctx.lineWidth = 1;
    ctx.strokeRect(52, 52, width - 104, height - 104);

    // Decorative corners
    const cornerSize = 30;
    ctx.fillStyle = theme.accent;
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('❋', 65, 75);
    ctx.fillText('❋', width - 65, 75);
    ctx.fillText('❋', 65, height - 55);
    ctx.fillText('❋', width - 65, height - 55);

    // Ik Onkar
    ctx.fillStyle = theme.accent;
    ctx.font = '48px "Noto Sans Gurmukhi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('ੴ', width / 2, 120);

    // Gurmukhi verse
    ctx.fillStyle = theme.text;
    ctx.font = 'bold 36px "Noto Sans Gurmukhi", serif';
    ctx.textAlign = 'center';
    
    // Word wrap
    const maxWidth = width - 160;
    const words = gurmukhi.split(' ');
    let line = '';
    let y = 300;
    const lineHeight = 72;
    
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, width / 2, y);
        line = word;
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, width / 2, y);

    // Translation
    if (translation) {
      ctx.fillStyle = theme.text + 'B0';
      ctx.font = 'italic 22px Inter, sans-serif';
      y += 80;
      
      const transWords = translation.split(' ');
      let transLine = '';
      for (const word of transWords) {
        const testLine = transLine + (transLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && transLine) {
          ctx.fillText(transLine, width / 2, y);
          transLine = word;
          y += 36;
        } else {
          transLine = testLine;
        }
      }
      ctx.fillText(transLine, width / 2, y);
    }

    // Footer with metadata
    ctx.fillStyle = theme.accent;
    const footerY = height - 120;
    
    // Divider line
    ctx.beginPath();
    ctx.moveTo(width / 2 - 100, footerY);
    ctx.lineTo(width / 2 + 100, footerY);
    ctx.strokeStyle = theme.border + '60';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '18px "Noto Sans Gurmukhi", serif';
    let metaText = '';
    if (angNumber) metaText += `ਅੰਗ ${angNumber}`;
    if (raag) metaText += ` • ${raag}`;
    if (writer) metaText += ` • ${writer}`;
    ctx.fillText(metaText, width / 2, footerY + 30);

    // Branding
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = theme.text + '60';
    ctx.fillText('Sikhi Vidhya • sikhi-vidhya.vercel.app', width / 2, footerY + 60);
  }, [gurmukhi, translation, angNumber, raag, writer, theme]);

  useEffect(() => {
    if (isOpen) drawCard();
  }, [isOpen, drawCard, selectedTheme]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `gurbani-ang-${angNumber || 'verse'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyText = async () => {
    const text = `${gurmukhi}\n\n${translation || ''}\n\n${angNumber ? `Ang ${angNumber}` : ''} ${raag ? `• ${raag}` : ''} ${writer ? `• ${writer}` : ''}\n\nvia Sikhi Vidhya`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.share) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'gurbani-verse.png', { type: 'image/png' });
        await navigator.share({
          title: 'Gurbani',
          text: `${gurmukhi}\n${translation || ''}`,
          files: [file],
        });
      }, 'image/png');
    } catch { /* User cancelled */ }
  };

  return (
    <>
      {/* Share Button Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm min-h-[44px]',
          'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
          'hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors',
          className
        )}
        title="Create shareable card"
      >
        🎨 {isPunjabi ? 'ਕਾਰਡ' : isHindi ? 'कार्ड' : 'Card'}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                {isPunjabi ? '📤 ਸ਼ੇਅਰ ਕਾਰਡ' : isHindi ? '📤 शेअर कार्ड' : '📤 Share Card'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                ✕
              </button>
            </div>

            {/* Theme Selector */}
            <div className="flex gap-2 p-4 border-b border-neutral-200 dark:border-neutral-700">
              {CARD_THEMES.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(i)}
                  className={cn(
                    'w-11 h-11 rounded-lg border-2 transition-all',
                    i === selectedTheme ? 'border-neela-500 scale-110' : 'border-transparent'
                  )}
                  style={{ background: `linear-gradient(135deg, ${t.gradient[0]}, ${t.gradient[1]})` }}
                  title={t.name}
                />
              ))}
            </div>

            {/* Canvas Preview */}
            <div className="p-4">
              <canvas
                ref={canvasRef}
                className="w-full rounded-xl shadow-lg"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={handleDownload}
                className="flex-1 px-4 py-2.5 bg-neela-600 text-white rounded-xl hover:bg-neela-700 transition-colors text-sm font-medium"
              >
                📥 {isPunjabi ? 'ਡਾਊਨਲੋਡ' : isHindi ? 'डाउनलोड' : 'Download'}
              </button>
              <button
                onClick={handleCopyText}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium"
              >
                {copied ? '✓' : '📋'} {isPunjabi ? 'ਟੈਕਸਟ' : isHindi ? 'टेक्स्ट' : 'Copy Text'}
              </button>
              {canShare && (
                <button
                  onClick={handleNativeShare}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  📤 {isPunjabi ? 'ਸ਼ੇਅਰ' : isHindi ? 'शेअर' : 'Share'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
