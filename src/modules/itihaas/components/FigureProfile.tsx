'use client';

// ============================================================================
// HISTORICAL FIGURE PROFILE COMPONENT
// ============================================================================
// Displays information about key figures in Sikh history
// All biographical claims are source-attributed
// ============================================================================

import { cn } from '@/lib/utils';
import type { HistoricalFigure, Language } from '@/types';

interface FigureProfileProps {
  figure: HistoricalFigure;
  language?: Language;
  variant?: 'card' | 'full' | 'compact';
  className?: string;
}

export function FigureProfile({
  figure,
  language = 'pa',
  variant = 'card',
  className,
}: FigureProfileProps) {
  const getName = () => {
    if (language === 'pa') return figure.name.pa;
    if (language === 'hi' && figure.name.hi) return figure.name.hi;
    return figure.name.en || figure.name.pa;
  };

  const getBiography = () => {
    if (!figure.biography) return null;
    if (language === 'pa') return figure.biography.pa;
    if (language === 'hi' && figure.biography.hi) return figure.biography.hi;
    return figure.biography.en || figure.biography.pa;
  };

  const formatLifespan = () => {
    const parts = [];
    
    if (figure.birthYear) {
      const birth = figure.birthYearApprox 
        ? (language === 'pa' ? `ਲਗਭਗ ${figure.birthYear}` : `c. ${figure.birthYear}`)
        : figure.birthYear.toString();
      parts.push(birth);
    } else {
      parts.push('?');
    }
    
    parts.push(' – ');
    
    if (figure.deathYear) {
      const death = figure.deathYearApprox
        ? (language === 'pa' ? `ਲਗਭਗ ${figure.deathYear}` : `c. ${figure.deathYear}`)
        : figure.deathYear.toString();
      parts.push(death);
    } else {
      parts.push('?');
    }
    
    return parts.join('');
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {figure.isGuru && (
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-kesri-100 text-kesri-700 flex items-center justify-center text-sm font-medium">
            {figure.guruNumber}
          </span>
        )}
        <div>
          <p className={cn(
            'font-medium text-neutral-900',
            language === 'pa' && 'font-gurmukhi'
          )}>
            {getName()}
          </p>
          <p className="text-xs text-neutral-500">
            {formatLifespan()}
          </p>
        </div>
      </div>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <div className={cn(
        'bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow',
        className
      )}>
        <div className="flex items-start gap-4">
          {/* Guru Number Badge */}
          {figure.isGuru && figure.guruNumber && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-kesri-100 text-kesri-700 flex items-center justify-center">
                <span className="text-lg font-semibold">{figure.guruNumber}</span>
              </div>
              <p className="text-xs text-center text-neutral-500 mt-1">
                {language === 'pa' ? 'ਗੁਰੂ' : 'Guru'}
              </p>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'text-lg font-semibold text-neutral-900',
              language === 'pa' && 'font-gurmukhi'
            )}>
              {getName()}
            </h3>
            
            <p className="text-sm text-neutral-500 mt-1">
              {formatLifespan()}
            </p>
            
            {getBiography() && (
              <p className={cn(
                'mt-3 text-neutral-600 text-sm line-clamp-3',
                language === 'pa' && 'font-gurmukhi'
              )}>
                {getBiography()}
              </p>
            )}
          </div>
        </div>
        
        {/* Status indicator */}
        {figure.status !== 'PUBLISHED' && (
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded',
              figure.status === 'SCHOLARLY_REVIEW' && 'bg-amber-100 text-amber-700',
              figure.status === 'DRAFT' && 'bg-neutral-100 text-neutral-600',
              figure.status === 'DISPUTED' && 'bg-red-100 text-red-700',
            )}>
              {figure.status}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <article className={cn('bg-white rounded-lg border border-neutral-200', className)}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-start gap-6">
          {/* Guru Badge */}
          {figure.isGuru && figure.guruNumber && (
            <div className="flex-shrink-0 text-center">
              <div className="w-20 h-20 rounded-full bg-kesri-100 text-kesri-700 flex items-center justify-center">
                <span className="text-3xl font-bold">{figure.guruNumber}</span>
              </div>
              <p className="text-sm text-neutral-600 mt-2 font-gurmukhi">
                ਗੁਰੂ ਸਾਹਿਬ
              </p>
            </div>
          )}
          
          <div className="flex-1">
            <h1 className={cn(
              'text-2xl font-bold text-neutral-900',
              language === 'pa' && 'font-gurmukhi'
            )}>
              {getName()}
            </h1>
            
            {/* Show name in other languages */}
            {language !== 'pa' && (
              <p className="text-lg text-neutral-600 font-gurmukhi mt-1">
                {figure.name.pa}
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500">
              <span>
                {language === 'pa' ? 'ਜਨਮ:' : 'Born:'}{' '}
                {figure.birthYear 
                  ? (figure.birthYearApprox ? `c. ${figure.birthYear}` : figure.birthYear)
                  : 'Unknown'}
              </span>
              <span>
                {language === 'pa' ? 'ਜੋਤੀ ਜੋਤ:' : 'Passed:'}{' '}
                {figure.deathYear
                  ? (figure.deathYearApprox ? `c. ${figure.deathYear}` : figure.deathYear)
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Biography */}
      {getBiography() && (
        <div className="p-6">
          <h2 className={cn(
            'text-lg font-semibold text-neutral-800 mb-3',
            language === 'pa' && 'font-gurmukhi'
          )}>
            {language === 'pa' ? 'ਜੀਵਨ ਬਾਰੇ' : 'Biography'}
          </h2>
          <div className={cn(
            'prose prose-neutral max-w-none',
            language === 'pa' && 'font-gurmukhi'
          )}>
            <p>{getBiography()}</p>
          </div>
        </div>
      )}
      
      {/* Footer with status */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>
            Content Status:{' '}
            <span className={cn(
              'px-1.5 py-0.5 rounded',
              figure.status === 'PUBLISHED' && 'bg-green-100 text-green-700',
              figure.status === 'SCHOLARLY_REVIEW' && 'bg-amber-100 text-amber-700',
            )}>
              {figure.status}
            </span>
          </span>
          <span>
            {language === 'pa' 
              ? 'ਸਾਰੀ ਜਾਣਕਾਰੀ ਸਰੋਤਾਂ ਤੋਂ ਲਈ ਗਈ ਹੈ'
              : 'All information is source-attributed'}
          </span>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// GURU SAHIBAAN LIST
// ============================================================================

interface GuruListProps {
  gurus: HistoricalFigure[];
  language?: Language;
  onSelect?: (guru: HistoricalFigure) => void;
  onGuruClick?: (guruId: string) => void;
  className?: string;
}

export function GuruSahibaanList({
  gurus,
  language = 'pa',
  onSelect,
  onGuruClick,
  className,
}: GuruListProps) {
  // Sort by Guru number
  const sortedGurus = [...gurus]
    .filter(g => g.isGuru && g.guruNumber)
    .sort((a, b) => (a.guruNumber || 0) - (b.guruNumber || 0));

  const handleGuruClick = (guru: HistoricalFigure) => {
    if (onGuruClick) {
      onGuruClick(guru.id);
    } else if (onSelect) {
      onSelect(guru);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <h2 className={cn(
        'text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-3',
        language === 'pa' && 'font-gurmukhi'
      )}>
        <span className="text-2xl">☬</span>
        {language === 'pa' ? 'ਦਸ ਗੁਰੂ ਸਾਹਿਬਾਨ' : 'The Ten Guru Sahibaan'}
      </h2>
      
      <p className={cn(
        'text-neutral-600 mb-6',
        language === 'pa' && 'font-gurmukhi'
      )}>
        {language === 'pa' 
          ? 'ਹਰ ਗੁਰੂ ਸਾਹਿਬ ਤੇ ਕਲਿੱਕ ਕਰੋ ਵਿਸਤਾਰਿਤ ਜੀਵਨੀ ਅਤੇ ਯੋਗਦਾਨ ਵੇਖਣ ਲਈ'
          : 'Click on any Guru Sahib to view detailed biography and contributions'}
      </p>
      
      <div className="grid gap-3">
        {sortedGurus.map((guru) => (
          <button
            key={guru.id}
            onClick={() => handleGuruClick(guru)}
            className="w-full text-left group"
          >
            <div className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-lg hover:border-kesri-300 transition-all duration-200 group-hover:bg-gradient-to-r group-hover:from-kesri-50 group-hover:to-white">
              <div className="flex items-center gap-4">
                {/* Guru Number Badge */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-kesri-400 to-kesri-600 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <span className="text-xl font-bold">{guru.guruNumber}</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    'text-lg font-semibold text-neutral-900 group-hover:text-kesri-700 transition-colors',
                    language === 'pa' && 'font-gurmukhi text-xl'
                  )}>
                    {language === 'pa' ? guru.name.pa : (guru.name.en || guru.name.pa)}
                  </h3>
                  
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {guru.birthYear} – {guru.deathYear}
                  </p>
                </div>
                
                {/* Arrow indicator */}
                <div className="flex-shrink-0 text-neutral-400 group-hover:text-kesri-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
