'use client';

// ============================================================================
// SOURCE CITATION COMPONENT
// ============================================================================
// Displays source attribution for all content
// Sources are mandatory and always visible
// ============================================================================

import { cn } from '@/lib/utils';
import type { Source, Citation, Language } from '@/types';

interface SourceCitationProps {
  source: Source;
  citation?: Citation;
  language?: Language;
  variant?: 'inline' | 'block' | 'minimal';
  className?: string;
}

export function SourceCitation({
  source,
  citation,
  language = 'pa',
  variant = 'block',
  className,
}: SourceCitationProps) {
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  const getTitle = () => {
    if (language === 'pa') return source.title.pa;
    if (language === 'hi' && source.title.hi) return source.title.hi;
    return source.title.en || source.title.pa;
  };

  const getAuthor = () => {
    if (!source.author) return null;
    if (language === 'pa') return source.author.pa;
    if (language === 'hi' && source.author.hi) return source.author.hi;
    return source.author.en || source.author.pa;
  };

  const formatCitationDetails = () => {
    const parts = [];
    if (citation?.volume) parts.push(`Vol. ${citation.volume}`);
    if (citation?.chapter) parts.push(`Ch. ${citation.chapter}`);
    if (citation?.page) parts.push(`p. ${citation.page}`);
    if (citation?.verse) parts.push(`v. ${citation.verse}`);
    return parts.join(', ');
  };

  // Minimal variant for inline references
  if (variant === 'minimal') {
    return (
      <span
        className={cn(
          'text-xs text-neutral-500 italic',
          isPunjabi && 'font-gurmukhi',
          isHindi && 'font-devanagari',
          className
        )}
      >
        — {getTitle()}
        {getAuthor() && `, ${getAuthor()}`}
      </span>
    );
  }

  // Inline variant for within text
  if (variant === 'inline') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-sm text-neutral-600',
          className
        )}
      >
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <span className={isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : ''}>
          {getTitle()}
        </span>
      </span>
    );
  }

  // Block variant (default) - full citation display
  return (
    <div
      className={cn(
        'bg-neutral-50 rounded-lg p-3 mt-4 border border-neutral-200',
        className
      )}
    >
      <div className="flex items-start gap-2">
        <svg
          className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium text-neutral-800 text-sm',
            isPunjabi && 'font-gurmukhi',
            isHindi && 'font-devanagari'
          )}>
            {getTitle()}
          </p>
          
          {getAuthor() && (
            <p className={cn(
              'text-neutral-600 text-xs mt-0.5',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {getAuthor()}
              {source.yearPublished && ` (${source.yearPublished})`}
            </p>
          )}
          
          {formatCitationDetails() && (
            <p className="text-neutral-500 text-xs mt-1">
              {formatCitationDetails()}
            </p>
          )}
          
          {source.caveats && (
            <p className="text-amber-700 text-xs mt-2 italic">
              ⚠️ {source.caveats}
            </p>
          )}
        </div>
        
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded',
          source.sourceType === 'PRIMARY' && 'bg-neela-100 text-neela-700',
          source.sourceType === 'SECONDARY' && 'bg-neutral-200 text-neutral-600',
          source.sourceType === 'TEEKA' && 'bg-kesri-100 text-kesri-700',
          source.sourceType === 'CONTEMPORARY' && 'bg-amber-100 text-amber-700',
        )}>
          {source.sourceType === 'PRIMARY' && 'Primary'}
          {source.sourceType === 'SECONDARY' && 'Secondary'}
          {source.sourceType === 'TEEKA' && 'Teeka'}
          {source.sourceType === 'CONTEMPORARY' && 'Contemporary'}
        </span>
      </div>
      
      {citation?.originalQuote && (
        <blockquote className={cn(
          'mt-3 pl-3 border-l-2 border-neutral-300 text-sm text-neutral-600 italic',
          isPunjabi && 'font-gurmukhi',
          isHindi && 'font-devanagari'
        )}>
          "{citation.originalQuote}"
        </blockquote>
      )}
    </div>
  );
}

// Multiple sources display
interface MultipleSourcesProps {
  sources: Array<{ source: Source; citation?: Citation }>;
  language?: Language;
  className?: string;
}

export function MultipleSources({
  sources,
  language = 'pa',
  className,
}: MultipleSourcesProps) {
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  if (sources.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className={cn(
        'text-sm font-medium text-neutral-700',
        isPunjabi && 'font-gurmukhi',
        isHindi && 'font-devanagari'
      )}>
        {isPunjabi ? 'ਸਰੋਤ:' : isHindi ? 'स्रोत:' : 'Sources:'}
      </h4>
      {sources.map((item, index) => (
        <SourceCitation
          key={item.source.id || index}
          source={item.source}
          citation={item.citation}
          language={language}
          variant="block"
        />
      ))}
    </div>
  );
}
