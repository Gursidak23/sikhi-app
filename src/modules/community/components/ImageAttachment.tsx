/**
 * Image Attachment Component for Community Chat
 * 
 * Features:
 * - File picker (camera + gallery)
 * - Paste image from clipboard
 * - Client-side compression to WebP (max 400x400, quality 0.6)
 * - Preview before sending
 * - Data URL stored in message content with marker
 * 
 * Message format: [IMG]data:image/webp;base64,...[/IMG]optional caption
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

// Max dimensions and quality for compressed images
const MAX_WIDTH = 400;
const MAX_HEIGHT = 400;
const QUALITY = 0.6;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB input limit

export const IMG_MARKER_START = '[IMG]';
export const IMG_MARKER_END = '[/IMG]';

/**
 * Extract image data URL and caption from a message content string.
 * Returns null if the message is not an image message.
 */
export function parseImageMessage(content: string): { imageUrl: string; caption: string } | null {
  if (!content.startsWith(IMG_MARKER_START)) return null;
  const endIdx = content.indexOf(IMG_MARKER_END);
  if (endIdx === -1) return null;
  const imageUrl = content.slice(IMG_MARKER_START.length, endIdx);
  const caption = content.slice(endIdx + IMG_MARKER_END.length).trim();
  return { imageUrl, caption };
}

/**
 * Compress an image file to a WebP data URL.
 * Returns the data URL string.
 */
export function compressImage(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      // Scale down preserving aspect ratio
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fall back to JPEG
      let dataUrl = canvas.toDataURL('image/webp', QUALITY);
      if (!dataUrl.startsWith('data:image/webp')) {
        dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
      }

      // Re-compress at lower quality if the output is still too large for the API (150KB limit)
      const MAX_DATA_URL_LENGTH = 140_000; // Leave room for markers and caption
      if (dataUrl.length > MAX_DATA_URL_LENGTH) {
        const lowerQuality = 0.3;
        dataUrl = canvas.toDataURL('image/webp', lowerQuality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', lowerQuality);
        }
      }

      if (dataUrl.length > MAX_DATA_URL_LENGTH) {
        reject(new Error('Image is too large even after compression'));
        return;
      }

      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

interface ImageAttachmentProps {
  language: Language;
  onImageReady: (content: string) => void; // Fires with formatted [IMG]...[/IMG]caption content
  onCancel: () => void;
}

export function ImageAttachment({ language, onImageReady, onCancel }: ImageAttachmentProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  const processFile = useCallback(async (file: File | Blob) => {
    setError('');

    if (file.size > MAX_FILE_SIZE) {
      setError(isPunjabi ? 'ਫ਼ਾਈਲ 5MB ਤੋਂ ਵੱਡੀ ਹੈ' : isHindi ? 'फ़ाइल 5MB से बड़ी है' : 'File is larger than 5MB');
      return;
    }

    // Validate it's actually an image
    if (file.type && !file.type.startsWith('image/')) {
      setError(isPunjabi ? 'ਸਿਰਫ਼ ਤਸਵੀਰਾਂ ਭੇਜ ਸਕਦੇ ਹੋ' : isHindi ? 'सिर्फ़ तस्वीरें भेज सकते हैं' : 'Only images are allowed');
      return;
    }

    setIsCompressing(true);
    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('too large')) {
        setError(isPunjabi ? 'ਤਸਵੀਰ ਬਹੁਤ ਵੱਡੀ ਹੈ' : isHindi ? 'तस्वीर बहुत बड़ी है' : 'Image is too large even after compression');
      } else {
        setError(isPunjabi ? 'ਤਸਵੀਰ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ' : isHindi ? 'तस्वीर लोड नहीं हो सकी' : 'Failed to load image');
      }
    } finally {
      setIsCompressing(false);
    }
  }, [isPunjabi, isHindi]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  // Handle paste events on the component
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) processFile(blob);
          return;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [processFile]);

  const handleSend = useCallback(() => {
    if (!preview) return;
    const content = `${IMG_MARKER_START}${preview}${IMG_MARKER_END}${caption.trim()}`;
    onImageReady(content);
  }, [preview, caption, onImageReady]);

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3">
      {!preview ? (
        /* File Picker */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={cn(
              'text-sm font-medium text-gray-700 dark:text-gray-300',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਤਸਵੀਰ ਭੇਜੋ' : isHindi ? 'तस्वीर भेजें' : 'Send Image'}
            </span>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
            className={cn(
              'w-full flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed',
              'border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500',
              'text-gray-400 hover:text-amber-600 dark:hover:text-amber-400',
              'transition-colors cursor-pointer group',
              isCompressing && 'opacity-50 pointer-events-none'
            )}
          >
            {isCompressing ? (
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            <span className={cn(
              'text-sm',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isCompressing
                ? (isPunjabi ? 'ਸੰਕੁਚਿਤ ਹੋ ਰਿਹਾ ਹੈ...' : isHindi ? 'संपीड़ित हो रहा है...' : 'Compressing...')
                : (isPunjabi ? 'ਤਸਵੀਰ ਚੁਣੋ ਜਾਂ ਪੇਸਟ ਕਰੋ' : isHindi ? 'तस्वीर चुनें या पेस्ट करें' : 'Choose or paste an image')
              }
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
        </div>
      ) : (
        /* Preview & Send */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={cn(
              'text-sm font-medium text-gray-700 dark:text-gray-300',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਪ੍ਰੀਵਿਊ' : isHindi ? 'प्रीव्यू' : 'Preview'}
            </span>
            <button
              onClick={() => { setPreview(null); setCaption(''); setError(''); }}
              className="text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              {isPunjabi ? 'ਹਟਾਓ' : isHindi ? 'हटाएं' : 'Remove'}
            </button>
          </div>

          {/* Image Preview */}
          <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 max-h-48 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 max-w-full object-contain rounded-xl"
            />
          </div>

          {/* Caption Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={isPunjabi ? 'ਕੈਪਸ਼ਨ (ਵਿਕਲਪਿਕ)' : isHindi ? 'कैप्शन (वैकल्पिक)' : 'Caption (optional)'}
              maxLength={200}
              className={cn(
                'flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700',
                'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-amber-400/50',
                isPunjabi && 'font-gurmukhi',
                isHindi && 'font-devanagari'
              )}
            />
            <button
              onClick={handleSend}
              className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-xl active:scale-90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
