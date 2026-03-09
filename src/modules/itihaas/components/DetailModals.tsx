'use client';

// ============================================================================
// HISTORY DETAIL MODAL COMPONENT
// ============================================================================
// Displays detailed information about Guru Sahibaan and historical events
// All information is source-attributed as per CONTENT_GUIDELINES.md
// ============================================================================

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FocusTrap } from '@/components/common/FocusTrap';
import type { Language } from '@/types';
import type { GuruDetail } from '../data/guru-sahibaan-details';
import { GURU_SAHIBAAN_DETAILS } from '../data/guru-sahibaan-details';

// ============================================================================
// GURU DETAIL MODAL
// ============================================================================

interface GuruDetailModalProps {
  guruId: string | null;
  language: Language;
  onClose: () => void;
}

export function GuruDetailModal({ guruId, language, onClose }: GuruDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'contributions' | 'bani'>('overview');
  
  const guru = guruId ? GURU_SAHIBAAN_DETAILS.find(g => g.id === guruId) : null;
  
  // Reset tab when guru changes
  useEffect(() => {
    setActiveTab('overview');
  }, [guruId]);
  
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  if (!guru) return null;
  
  const isPunjabi = language === 'pa';
  
  const getName = (text: { pa: string; en?: string; hi?: string }) => {
    if (language === 'pa') return text.pa;
    if (language === 'hi' && text.hi) return text.hi;
    return text.en || text.pa;
  };

  const tabs = [
    { id: 'overview' as const, labelPa: 'ਜਾਣਕਾਰੀ', labelEn: 'Overview', icon: '📋' },
    { id: 'events' as const, labelPa: 'ਘਟਨਾਵਾਂ', labelEn: 'Events', icon: '📅' },
    { id: 'contributions' as const, labelPa: 'ਯੋਗਦਾਨ', labelEn: 'Contributions', icon: '⭐' },
    ...(guru.baniContributed ? [{ id: 'bani' as const, labelPa: 'ਬਾਣੀ', labelEn: 'Bani', icon: '📖' }] : []),
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <FocusTrap onEscape={onClose}>
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-kesri-500 to-kesri-600 text-white p-6 pb-16">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-4">
            {/* Guru Number Badge */}
            <div className="flex-shrink-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-4xl font-bold">{guru.guruNumber}</span>
            </div>
            
            <div>
              <p className="text-kesri-100 text-sm mb-1">
                {isPunjabi ? 'ਗੁਰੂ ਸਾਹਿਬਾਨ' : 'Guru Sahibaan'}
              </p>
              <h2 className={cn(
                'text-2xl md:text-3xl font-bold',
                isPunjabi && 'font-gurmukhi'
              )}>
                {getName(guru.name)}
              </h2>
              <p className="text-kesri-100 mt-1">
                {guru.birthYear} – {guru.deathYear}
              </p>
            </div>
          </div>
        </div>
        
        {/* Tabs - overlapping header */}
        <div className="relative -mt-8 px-6">
          <nav className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap shadow-sm',
                  activeTab === tab.id
                    ? 'bg-white text-kesri-700'
                    : 'bg-white/80 text-neutral-600 hover:bg-white',
                  isPunjabi && 'font-gurmukhi'
                )}
              >
                <span>{tab.icon}</span>
                <span>{isPunjabi ? tab.labelPa : tab.labelEn}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Biography */}
              <div>
                <h3 className={cn(
                  'text-lg font-semibold text-neutral-900 mb-3',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {isPunjabi ? 'ਜੀਵਨੀ' : 'Biography'}
                </h3>
                <p className={cn(
                  'text-neutral-700 leading-relaxed',
                  isPunjabi && 'font-gurmukhi text-lg'
                )}>
                  {getName(guru.biography)}
                </p>
              </div>
              
              {/* Key Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard
                  icon="🎂"
                  label={isPunjabi ? 'ਜਨਮ' : 'Birth'}
                  value={`${guru.birthYear} - ${getName(guru.birthPlace)}`}
                  isPunjabi={isPunjabi}
                />
                <DetailCard
                  icon="🌟"
                  label={isPunjabi ? 'ਜੋਤੀ ਜੋਤ' : 'Joti Jot'}
                  value={`${guru.deathYear} - ${getName(guru.deathPlace)}`}
                  isPunjabi={isPunjabi}
                />
                <DetailCard
                  icon="👨"
                  label={isPunjabi ? 'ਪਿਤਾ ਜੀ' : 'Father'}
                  value={getName(guru.fatherName)}
                  isPunjabi={isPunjabi}
                />
                <DetailCard
                  icon="👩"
                  label={isPunjabi ? 'ਮਾਤਾ ਜੀ' : 'Mother'}
                  value={getName(guru.motherName)}
                  isPunjabi={isPunjabi}
                />
                {guru.spouseName && (
                  <DetailCard
                    icon="💑"
                    label={isPunjabi ? 'ਪਤਨੀ' : 'Spouse'}
                    value={getName(guru.spouseName)}
                    isPunjabi={isPunjabi}
                  />
                )}
                {guru.gurgaddiDate && (
                  <DetailCard
                    icon="👑"
                    label={isPunjabi ? 'ਗੁਰਗੱਦੀ' : 'Guruship'}
                    value={`${guru.gurgaddiDate}${guru.gurgaddiAge ? ` (${isPunjabi ? 'ਉਮਰ' : 'Age'}: ${guru.gurgaddiAge})` : ''}`}
                    isPunjabi={isPunjabi}
                  />
                )}
              </div>
              
              {/* Children */}
              {guru.children && guru.children.length > 0 && (
                <div>
                  <h3 className={cn(
                    'text-lg font-semibold text-neutral-900 mb-3',
                    isPunjabi && 'font-gurmukhi'
                  )}>
                    {isPunjabi ? 'ਸੰਤਾਨ' : 'Children'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {guru.children.map((child, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          'px-3 py-1.5 bg-neutral-100 rounded-full text-sm text-neutral-700',
                          isPunjabi && 'font-gurmukhi'
                        )}
                      >
                        {getName(child)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sources */}
              <SourcesSection sources={guru.sources} isPunjabi={isPunjabi} />
            </div>
          )}
          
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <h3 className={cn(
                'text-lg font-semibold text-neutral-900 mb-4',
                isPunjabi && 'font-gurmukhi'
              )}>
                {isPunjabi ? 'ਮਹੱਤਵਪੂਰਨ ਘਟਨਾਵਾਂ' : 'Major Events'}
              </h3>
              
              <div className="relative border-l-2 border-kesri-200 pl-6 space-y-6">
                {guru.majorEvents.map((event, idx) => (
                  <div key={idx} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-kesri-500 border-4 border-white shadow" />
                    
                    <div className="bg-neutral-50 rounded-lg p-4 hover:bg-neutral-100 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className={cn(
                            'font-semibold text-neutral-900',
                            isPunjabi && 'font-gurmukhi text-lg'
                          )}>
                            {getName(event.title)}
                          </h4>
                          <p className={cn(
                            'text-neutral-600 mt-1',
                            isPunjabi && 'font-gurmukhi'
                          )}>
                            {getName(event.description)}
                          </p>
                          <p className="text-xs text-neutral-500 mt-2">
                            📚 {event.source}
                          </p>
                        </div>
                        <span className="flex-shrink-0 px-3 py-1 bg-kesri-100 text-kesri-700 rounded-full text-sm font-medium">
                          {event.year}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Contributions Tab */}
          {activeTab === 'contributions' && (
            <div className="space-y-4">
              <h3 className={cn(
                'text-lg font-semibold text-neutral-900 mb-4',
                isPunjabi && 'font-gurmukhi'
              )}>
                {isPunjabi ? 'ਮੁੱਖ ਯੋਗਦਾਨ' : 'Key Contributions'}
              </h3>
              
              <div className="grid gap-4">
                {guru.keyContributions.map((contribution, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-kesri-50 to-white border border-kesri-100 rounded-lg p-4"
                  >
                    <h4 className={cn(
                      'font-semibold text-kesri-700 mb-2',
                      isPunjabi && 'font-gurmukhi text-lg'
                    )}>
                      ⭐ {getName(contribution.title)}
                    </h4>
                    <p className={cn(
                      'text-neutral-700',
                      isPunjabi && 'font-gurmukhi'
                    )}>
                      {getName(contribution.description)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      📚 {contribution.source}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Bani Tab */}
          {activeTab === 'bani' && guru.baniContributed && (
            <div className="space-y-4">
              <h3 className={cn(
                'text-lg font-semibold text-neutral-900 mb-4',
                isPunjabi && 'font-gurmukhi'
              )}>
                {isPunjabi ? 'ਬਾਣੀ ਯੋਗਦਾਨ' : 'Bani Contribution'}
              </h3>
              
              <div className="bg-gradient-to-br from-neela-50 to-white border border-neela-100 rounded-xl p-6 text-center">
                <div className="text-5xl mb-4">📖</div>
                <div className="text-4xl font-bold text-neela-700 mb-2">
                  {guru.baniContributed.shabadCount}
                </div>
                <p className={cn(
                  'text-lg text-neutral-600',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {isPunjabi ? 'ਸ਼ਬਦ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਵਿੱਚ' : 'Shabads in Sri Guru Granth Sahib Ji'}
                </p>
                
                {guru.baniContributed.salokCount && guru.baniContributed.salokCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-neela-100">
                    <span className="text-2xl font-bold text-neela-600">{guru.baniContributed.salokCount}</span>
                    <span className={cn('text-neutral-600 ml-2', isPunjabi && 'font-gurmukhi')}>
                      {isPunjabi ? 'ਸਲੋਕ' : 'Saloks'}
                    </span>
                  </div>
                )}
                
                <p className={cn(
                  'mt-4 text-neutral-600',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {getName(guru.baniContributed.description)}
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <span className="text-xl">📌</span>
                <p className={cn(
                  'text-sm text-amber-800',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {isPunjabi 
                    ? 'ਗੁਰਬਾਣੀ ਪੜ੍ਹਨ ਲਈ ਗੁਰਬਾਣੀ ਸੈਕਸ਼ਨ ਵਿੱਚ ਜਾਓ ਜਿੱਥੇ ਸਾਰੀ ਬਾਣੀ ਸਰੋਤ-ਆਧਾਰਿਤ ਅਰਥਾਂ ਨਾਲ ਉਪਲਬਧ ਹੈ।'
                    : 'Visit the Gurbani section to read the sacred Bani with source-attributed meanings.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      </FocusTrap>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface DetailCardProps {
  icon: string;
  label: string;
  value: string;
  isPunjabi: boolean;
}

function DetailCard({ icon, label, value, isPunjabi }: DetailCardProps) {
  return (
    <div className="bg-neutral-50 rounded-lg p-4 flex items-start gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className={cn(
          'text-xs text-neutral-500 uppercase tracking-wide',
          isPunjabi && 'font-gurmukhi'
        )}>
          {label}
        </p>
        <p className={cn(
          'font-medium text-neutral-900 mt-0.5',
          isPunjabi && 'font-gurmukhi'
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface SourcesSectionProps {
  sources: GuruDetail['sources'];
  isPunjabi: boolean;
}

function SourcesSection({ sources, isPunjabi }: SourcesSectionProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <h4 className={cn(
        'font-semibold text-amber-800 mb-3 flex items-center gap-2',
        isPunjabi && 'font-gurmukhi'
      )}>
        <span>📚</span>
        {isPunjabi ? 'ਸਰੋਤ' : 'Sources'}
      </h4>
      <ul className="space-y-2">
        {sources.map((source, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-amber-900">
            <span className="text-amber-600">•</span>
            <span>
              <strong>{source.name}</strong>
              {source.author && <span> – {source.author}</span>}
              {source.year && <span> ({source.year})</span>}
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-amber-100 rounded">
                {source.type}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// HISTORICAL EVENT DETAIL MODAL
// ============================================================================

export interface EventDetail {
  id: string;
  title: { pa: string; en?: string };
  year: number;
  yearEnd?: number;
  description: { pa: string; en?: string };
  detailedDescription?: { pa: string; en?: string };
  location?: { pa: string; en?: string };
  significance?: { pa: string; en?: string };
  keyFigures?: { name: { pa: string; en?: string }; role?: { pa: string; en?: string } }[];
  sources: { name: string; author: string; year?: number; type: 'PRIMARY' | 'SECONDARY' | 'TEEKA' }[];
  isContemporary?: boolean;
}

interface EventDetailModalProps {
  event: EventDetail | null;
  language: Language;
  onClose: () => void;
}

export function EventDetailModal({ event, language, onClose }: EventDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  if (!event) return null;
  
  const isPunjabi = language === 'pa';
  
  const getName = (text: { pa: string; en?: string }) => {
    if (language === 'pa') return text.pa;
    return text.en || text.pa;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <FocusTrap onEscape={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-neela-600 to-neela-700 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-3xl">📅</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white/20 rounded text-sm">
                  {event.year}{event.yearEnd ? ` - ${event.yearEnd}` : ''}
                </span>
                {event.isContemporary && (
                  <span className="px-2 py-0.5 bg-amber-400 text-amber-900 rounded text-xs font-medium">
                    {isPunjabi ? 'ਸਮਕਾਲੀ' : 'Contemporary'}
                  </span>
                )}
              </div>
              <h2 className={cn(
                'text-xl md:text-2xl font-bold mt-1',
                isPunjabi && 'font-gurmukhi'
              )}>
                {getName(event.title)}
              </h2>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-5">
          {/* Contemporary Warning */}
          {event.isContemporary && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <p className={cn(
                'text-sm text-amber-800',
                isPunjabi && 'font-gurmukhi'
              )}>
                {isPunjabi 
                  ? 'ਇਹ ਸਮਕਾਲੀ ਇਤਿਹਾਸ ਹੈ। ਨਵੇਂ ਸਬੂਤ ਸਾਹਮਣੇ ਆਉਣ ਤੇ ਇਹ ਜਾਣਕਾਰੀ ਬਦਲ ਸਕਦੀ ਹੈ।'
                  : 'This is contemporary history. Information may evolve as new evidence emerges.'}
              </p>
            </div>
          )}
          
          {/* Description */}
          <div>
            <h3 className={cn(
              'text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2',
              isPunjabi && 'font-gurmukhi'
            )}>
              {isPunjabi ? 'ਵੇਰਵਾ' : 'Description'}
            </h3>
            <p className={cn(
              'text-neutral-700 leading-relaxed',
              isPunjabi && 'font-gurmukhi text-lg'
            )}>
              {getName(event.detailedDescription || event.description)}
            </p>
          </div>
          
          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3 bg-neutral-50 rounded-lg p-4">
              <span className="text-xl">📍</span>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide">
                  {isPunjabi ? 'ਸਥਾਨ' : 'Location'}
                </p>
                <p className={cn(
                  'font-medium text-neutral-900',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {getName(event.location)}
                </p>
              </div>
            </div>
          )}
          
          {/* Significance */}
          {event.significance && (
            <div className="bg-kesri-50 border border-kesri-100 rounded-lg p-4">
              <h3 className={cn(
                'text-sm font-semibold text-kesri-700 uppercase tracking-wide mb-2 flex items-center gap-2',
                isPunjabi && 'font-gurmukhi'
              )}>
                <span>⭐</span>
                {isPunjabi ? 'ਮਹੱਤਤਾ' : 'Significance'}
              </h3>
              <p className={cn(
                'text-kesri-900',
                isPunjabi && 'font-gurmukhi'
              )}>
                {getName(event.significance)}
              </p>
            </div>
          )}
          
          {/* Key Figures */}
          {event.keyFigures && event.keyFigures.length > 0 && (
            <div>
              <h3 className={cn(
                'text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 flex items-center gap-2',
                isPunjabi && 'font-gurmukhi'
              )}>
                <span>👥</span>
                {isPunjabi ? 'ਮੁੱਖ ਹਸਤੀਆਂ' : 'Key Figures'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.keyFigures.map((figure, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'px-3 py-1.5 bg-neutral-100 rounded-lg text-sm',
                      isPunjabi && 'font-gurmukhi'
                    )}
                  >
                    <span className="font-medium text-neutral-900">{getName(figure.name)}</span>
                    {figure.role && (
                      <span className="text-neutral-500 ml-1">({getName(figure.role)})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Sources */}
          <SourcesSection sources={event.sources} isPunjabi={isPunjabi} />
        </div>
      </div>
      </FocusTrap>
    </div>
  );
}
