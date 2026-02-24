'use client';

// ============================================================================
// SHARE FUNCTIONALITY
// ============================================================================
// Share buttons for Gurbani verses and historical content
// Supports native sharing, copy to clipboard, and social media
// ============================================================================

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  language?: 'pa' | 'en' | 'hi';
  className?: string;
}

export function ShareButton({ title, text, url, language = 'pa', className }: ShareButtonProps) {
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  const copyToClipboard = async () => {
    const shareText = `${text}\n\n— ${title}\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToTwitter = () => {
    const tweetText = encodeURIComponent(`${text.slice(0, 200)}...\n\n— ${title}`);
    const tweetUrl = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(`${text}\n\n— ${title}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={handleNativeShare}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-neela-50 text-neela-700 hover:bg-neela-100',
          'transition-colors text-sm font-medium',
          isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : ''
        )}
        aria-label={isPunjabi ? 'ਸਾਂਝਾ ਕਰੋ' : isHindi ? 'साझा करें' : 'Share'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="hidden sm:inline">
          {isPunjabi ? 'ਸਾਂਝਾ ਕਰੋ' : isHindi ? 'साझा करें' : 'Share'}
        </span>
      </button>

      {/* Share Menu */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
          <button
            onClick={() => { copyToClipboard(); setShowMenu(false); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{isPunjabi ? 'ਕਾਪੀ ਹੋ ਗਿਆ!' : isHindi ? 'कॉपी हो गया!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{isPunjabi ? 'ਕਾਪੀ ਕਰੋ' : isHindi ? 'कॉपी करें' : 'Copy'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => { shareToWhatsApp(); setShowMenu(false); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => { shareToTwitter(); setShowMenu(false); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>X (Twitter)</span>
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

// Copy verse button (simplified)
interface CopyVerseButtonProps {
  verse: string;
  translation?: string;
  source?: string;
  language?: 'pa' | 'en' | 'hi';
}

export function CopyVerseButton({ verse, translation, source, language = 'pa' }: CopyVerseButtonProps) {
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    let text = verse;
    if (translation) {
      text += `\n\n${translation}`;
    }
    if (source) {
      text += `\n— ${source}`;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'p-2 rounded-lg transition-colors',
        copied
          ? 'bg-green-100 text-green-600'
          : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
      )}
      title={isPunjabi ? 'ਕਾਪੀ ਕਰੋ' : isHindi ? 'कॉपी करें' : 'Copy'}
    >
      {copied ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}
