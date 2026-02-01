'use client';

// ============================================================================
// HISTORY TIMELINE COMPONENT
// ============================================================================
// Displays Sikh history in chronological timeline format
// Every claim is source-attributed, conflicts are preserved
// ============================================================================

import { useState } from 'react';
import { cn, formatYearRange } from '@/lib/utils';
import { SourceCitation, MultipleSources } from '@/components/common/SourceCitation';
import { ContemporaryHistoryDisclaimer } from '@/components/common/Disclaimer';
import type { Era, Period, HistoricalEvent, Language } from '@/types';

// ============================================================================
// ERA COMPONENT
// ============================================================================

interface EraNodeProps {
  era: Era;
  language?: Language;
  isExpanded?: boolean;
  onToggle?: () => void;
  onEventClick?: (eventId: string) => void;
  className?: string;
}

export function EraNode({
  era,
  language = 'pa',
  isExpanded = false,
  onToggle,
  onEventClick,
  className,
}: EraNodeProps) {
  const getName = () => {
    if (language === 'pa') return era.name.pa;
    if (language === 'hi' && era.name.hi) return era.name.hi;
    return era.name.en || era.name.pa;
  };

  const getDescription = () => {
    if (!era.description) return null;
    if (language === 'pa') return era.description.pa;
    if (language === 'hi' && era.description.hi) return era.description.hi;
    return era.description.en || era.description.pa;
  };

  return (
    <div className={cn('timeline-node', className)}>
      <button
        onClick={onToggle}
        className="w-full text-left group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={cn(
              'timeline-era group-hover:text-kesri-600 transition-colors',
              language === 'pa' && 'font-gurmukhi'
            )}>
              {getName()}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {formatYearRange(era.yearStart, era.yearEnd, era.isOngoing, language)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {era.isOngoing && (
              <span className="contemporary-marker">
                {language === 'pa' ? 'ਚੱਲ ਰਿਹਾ' : 'Ongoing'}
              </span>
            )}
            <svg
              className={cn(
                'w-5 h-5 text-neutral-400 transition-transform',
                isExpanded && 'rotate-90'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {getDescription() && (
            <p className={cn(
              'text-neutral-600',
              language === 'pa' && 'font-gurmukhi'
            )}>
              {getDescription()}
            </p>
          )}
          
          {/* Contemporary disclaimer for ongoing eras */}
          {era.isOngoing && (
            <ContemporaryHistoryDisclaimer language={language} />
          )}
          
          {/* Periods within era */}
          <div className="space-y-3 ml-4 border-l-2 border-neutral-200 pl-4">
            {era.periods.map((period) => (
              <PeriodNode
                key={period.id}
                period={period}
                language={language}
                onEventClick={onEventClick}
                eraId={era.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PERIOD COMPONENT
// ============================================================================

interface PeriodNodeProps {
  period: Period;
  language?: Language;
  onEventClick?: (eventId: string) => void;
  eraId?: string;
  className?: string;
}

export function PeriodNode({
  period,
  language = 'pa',
  onEventClick,
  eraId,
  className,
}: PeriodNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getName = () => {
    if (language === 'pa') return period.name.pa;
    if (language === 'hi' && period.name.hi) return period.name.hi;
    return period.name.en || period.name.pa;
  };

  // Determine if this period is clickable (has associated event)
  const periodEventId = period.id.replace('-period', '');
  const hasEvent = onEventClick !== undefined;

  const handleClick = () => {
    if (hasEvent && onEventClick) {
      // Try to find matching event by period id pattern
      onEventClick(periodEventId);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={cn('py-2', className)}>
      <button
        onClick={handleClick}
        className="w-full text-left group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center justify-between hover:bg-neutral-50 p-2 -m-2 rounded-lg transition-colors">
          <h3 className={cn(
            'timeline-period group-hover:text-kesri-600 transition-colors',
            language === 'pa' && 'font-gurmukhi'
          )}>
            {getName()}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">
              {formatYearRange(period.yearStart, period.yearEnd, false, language)}
            </span>
            {hasEvent && (
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-kesri-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        </div>
      </button>

      {isExpanded && period.events.length > 0 && (
        <div className="mt-3 space-y-3">
          {period.events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              language={language}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EVENT CARD COMPONENT
// ============================================================================

interface EventCardProps {
  event: HistoricalEvent;
  language?: Language;
  showFullDetails?: boolean;
  className?: string;
}

export function EventCard({
  event,
  language = 'pa',
  showFullDetails = false,
  className,
}: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(showFullDetails);

  const getTitle = () => {
    if (language === 'pa') return event.title.pa;
    if (language === 'hi' && event.title.hi) return event.title.hi;
    return event.title.en || event.title.pa;
  };

  const getDescription = () => {
    if (language === 'pa') return event.description.pa;
    if (language === 'hi' && event.description.hi) return event.description.hi;
    return event.description.en || event.description.pa;
  };

  const formatEventDate = () => {
    const { date } = event;
    let dateStr = date.yearStart.toString();
    
    if (date.monthStart && date.dayStart) {
      dateStr = `${date.dayStart}/${date.monthStart}/${date.yearStart}`;
    } else if (date.yearEnd) {
      dateStr = `${date.yearStart} - ${date.yearEnd}`;
    }
    
    if (date.type === 'approximate') {
      dateStr = language === 'pa' ? `ਲਗਭਗ ${dateStr}` : `c. ${dateStr}`;
    } else if (date.type === 'disputed') {
      dateStr = language === 'pa' ? `${dateStr} (ਵਿਵਾਦਿਤ)` : `${dateStr} (disputed)`;
    }
    
    return dateStr;
  };

  return (
    <article className={cn('timeline-event', className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className={cn(
            'font-medium text-neutral-900',
            language === 'pa' && 'font-gurmukhi text-lg'
          )}>
            {getTitle()}
          </h4>
          <p className="text-sm text-neutral-500 mt-0.5">
            {formatEventDate()}
            {event.location && (
              <span className="ml-2">
                📍 {event.location}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {event.isContemporary && (
            <span className="contemporary-marker">
              {language === 'pa' ? 'ਸਮਕਾਲੀ' : 'Contemporary'}
            </span>
          )}
          {event.date.type === 'disputed' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
              {language === 'pa' ? 'ਵਿਵਾਦਿਤ ਮਿਤੀ' : 'Disputed'}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className={cn(
        'mt-3 text-neutral-700',
        language === 'pa' && 'font-gurmukhi'
      )}>
        {getDescription()}
      </p>

      {/* Contemporary Warning */}
      {event.isContemporary && event.contemporaryNote && (
        <div className="mt-3 p-2 bg-amber-50 rounded text-sm text-amber-700">
          ⚠️ {event.contemporaryNote}
        </div>
      )}

      {/* Key Figures */}
      {event.figures.length > 0 && (
        <div className="mt-3">
          <h5 className="text-sm font-medium text-neutral-600 mb-2">
            {language === 'pa' ? 'ਮੁੱਖ ਹਸਤੀਆਂ:' : 'Key Figures:'}
          </h5>
          <div className="flex flex-wrap gap-2">
            {event.figures.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-neutral-100 rounded text-sm"
              >
                <span className={language === 'pa' ? 'font-gurmukhi' : ''}>
                  {language === 'pa' 
                    ? item.figure.name.pa 
                    : item.figure.name.en || item.figure.name.pa}
                </span>
                {item.role && (
                  <span className="text-neutral-500 text-xs ml-1">
                    ({item.role})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Toggle for more details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 text-sm text-kesri-600 hover:text-kesri-700 flex items-center gap-1"
      >
        {isExpanded 
          ? (language === 'pa' ? 'ਘੱਟ ਵੇਖੋ' : 'Show less')
          : (language === 'pa' ? 'ਹੋਰ ਵੇਖੋ' : 'Show more')}
        <svg
          className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-neutral-100 space-y-4">
          {/* Different Interpretations */}
          {event.interpretations.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-neutral-700 mb-2">
                {language === 'pa' ? 'ਵੱਖ-ਵੱਖ ਵਿਆਖਿਆਵਾਂ:' : 'Different Interpretations:'}
              </h5>
              <div className="space-y-3">
                {event.interpretations.map((interp) => (
                  <div
                    key={interp.id}
                    className="p-3 bg-neutral-50 rounded-lg border-l-2 border-neutral-300"
                  >
                    <p className={cn(
                      'text-neutral-700',
                      language === 'pa' && 'font-gurmukhi'
                    )}>
                      {language === 'pa' 
                        ? interp.interpretation.pa 
                        : interp.interpretation.en || interp.interpretation.pa}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2 italic">
                      — {interp.scholarName}, <em>{interp.workTitle}</em>
                      {interp.publicationYear && ` (${interp.publicationYear})`}
                      {interp.isPrimarySource && (
                        <span className="ml-2 px-1 py-0.5 bg-neela-100 text-neela-700 rounded">
                          Primary
                        </span>
                      )}
                    </p>
                    {interp.perspectiveNotes && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ {interp.perspectiveNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source Citations - MANDATORY */}
          {event.citations.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-neutral-700 mb-2">
                {language === 'pa' ? 'ਸਰੋਤ:' : 'Sources:'}
              </h5>
              <div className="space-y-2">
                {/* Note: In real implementation, we'd fetch full source details */}
                {event.citations.map((citation, index) => (
                  <div
                    key={index}
                    className="text-sm text-neutral-600 p-2 bg-neutral-50 rounded"
                  >
                    Source ID: {citation.sourceId}
                    {citation.page && `, p. ${citation.page}`}
                    {citation.chapter && `, ch. ${citation.chapter}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Status */}
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>
              Status: {event.status}
            </span>
            {event.lastReviewedAt && (
              <span>
                Last reviewed: {new Date(event.lastReviewedAt).toLocaleDateString()}
                {event.lastReviewedBy && ` by ${event.lastReviewedBy}`}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

// ============================================================================
// FULL TIMELINE COMPONENT
// ============================================================================

interface TimelineProps {
  eras: Era[];
  language?: Language;
  onEventClick?: (eventId: string) => void;
  className?: string;
}

export function Timeline({
  eras,
  language = 'pa',
  onEventClick,
  className,
}: TimelineProps) {
  const [expandedEras, setExpandedEras] = useState<Set<string>>(new Set());

  const toggleEra = (eraId: string) => {
    setExpandedEras((prev) => {
      const next = new Set(prev);
      if (next.has(eraId)) {
        next.delete(eraId);
      } else {
        next.add(eraId);
      }
      return next;
    });
  };

  // Sort eras by start year
  const sortedEras = [...eras].sort((a, b) => a.yearStart - b.yearStart);

  return (
    <div className={cn('timeline-container', className)}>
      <div className="timeline-line" aria-hidden="true" />
      
      <div className="space-y-6">
        {sortedEras.map((era) => (
          <EraNode
            key={era.id}
            era={era}
            language={language}
            isExpanded={expandedEras.has(era.id)}
            onToggle={() => toggleEra(era.id)}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}
