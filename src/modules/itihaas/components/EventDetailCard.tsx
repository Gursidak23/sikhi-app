'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SourceCitation } from '@/components/common/SourceCitation';

/**
 * EventDetailCard Component
 * Displays a historical event with full details, sources, and interpretations
 * Implements source-first architecture with proper attribution
 */

interface Source {
  id: string;
  title: {
    pa: string;
    en?: string;
  };
  author?: string;
  type: string;
  reference?: {
    volume?: string;
    chapter?: string;
    page?: string;
    originalQuote?: string;
  };
}

interface Interpretation {
  id: string;
  source: {
    id: string;
    title: string;
    author?: string;
  };
  text: {
    pa?: string;
    en?: string;
  };
  perspectiveNote?: string;
}

interface KeyFigure {
  id: string;
  name: {
    pa: string;
    en?: string;
  };
  figureType: string;
}

interface HistoricalEvent {
  id: string;
  title: {
    pa: string;
    en?: string;
  };
  description: {
    pa: string;
    en?: string;
  };
  date: {
    type: 'EXACT' | 'YEAR' | 'APPROXIMATE' | 'DISPUTED';
    yearStart: number;
    yearEnd?: number;
    monthStart?: number;
    dayStart?: number;
  };
  location?: {
    pa?: string;
    en?: string;
  };
  significance?: {
    pa?: string;
    en?: string;
  };
  isContemporary: boolean;
  warningNote?: {
    pa?: string;
    en?: string;
  };
  sources: Source[];
  interpretations?: Interpretation[];
  keyFigures?: KeyFigure[];
}

interface EventDetailCardProps {
  event: HistoricalEvent;
  onClose?: () => void;
}

export function EventDetailCard({ event, onClose }: EventDetailCardProps) {
  const [activeTab, setActiveTab] = useState<
    'details' | 'sources' | 'interpretations'
  >('details');
  const [language, setLanguage] = useState<'pa' | 'en'>('pa');

  // Format date display
  const formatDate = () => {
    const { type, yearStart, yearEnd, monthStart, dayStart } = event.date;

    let dateStr = '';
    if (type === 'EXACT' && dayStart && monthStart) {
      dateStr = `${dayStart}/${monthStart}/${yearStart}`;
    } else if (type === 'YEAR') {
      dateStr = `${yearStart}`;
    } else if (type === 'APPROXIMATE') {
      dateStr = `c. ${yearStart}`;
    } else if (type === 'DISPUTED') {
      dateStr = `${yearStart}${yearEnd ? ` - ${yearEnd}` : ''} (disputed)`;
    } else {
      dateStr = `${yearStart}`;
    }

    return dateStr;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-3xl mx-auto">
      {/* Header */}
      <div
        className={`px-6 py-5 ${
          event.isContemporary
            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
            : 'bg-gradient-to-r from-orange-600 to-orange-700'
        } text-white`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-gurmukhi">{event.title.pa}</h2>
            {event.title.en && (
              <p className="text-orange-100 mt-1">{event.title.en}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <span className="bg-white/20 px-2 py-1 rounded">
                {formatDate()}
              </span>
              {event.location && (
                <span className="bg-white/20 px-2 py-1 rounded">
                  📍{' '}
                  {language === 'pa'
                    ? event.location.pa || event.location.en
                    : event.location.en || event.location.pa}
                </span>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* Contemporary Warning */}
        {event.isContemporary && (
          <div className="mt-4 bg-white/20 rounded px-3 py-2 text-sm flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>
              {event.warningNote
                ? language === 'pa'
                  ? event.warningNote.pa
                  : event.warningNote.en
                : 'This is contemporary, evolving history that is not final.'}
            </span>
          </div>
        )}
      </div>

      {/* Language Toggle */}
      <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('pa')}
            className={`px-3 py-1 text-sm rounded ${
              language === 'pa'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border'
            }`}
          >
            ਪੰਜਾਬੀ
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-sm rounded ${
              language === 'en'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border'
            }`}
          >
            English
          </button>
        </div>
        <div className="text-xs text-gray-400">
          {event.sources.length} source(s)
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b flex">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'details'
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ਵੇਰਵਾ / Details
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'sources'
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ਸਰੋਤ / Sources
        </button>
        {event.interpretations && event.interpretations.length > 0 && (
          <button
            onClick={() => setActiveTab('interpretations')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'interpretations'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ਵਿਆਖਿਆਵਾਂ / Interpretations
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                {language === 'pa' ? 'ਵੇਰਵਾ' : 'Description'}
              </h4>
              <p
                className={`text-gray-700 leading-relaxed ${
                  language === 'pa' ? 'font-gurmukhi text-lg' : ''
                }`}
              >
                {language === 'pa'
                  ? event.description.pa || event.description.en
                  : event.description.en || event.description.pa}
              </p>
            </div>

            {/* Significance */}
            {event.significance && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  {language === 'pa' ? 'ਮਹੱਤਤਾ' : 'Significance'}
                </h4>
                <p
                  className={`text-gray-700 leading-relaxed ${
                    language === 'pa' ? 'font-gurmukhi' : ''
                  }`}
                >
                  {language === 'pa'
                    ? event.significance.pa || event.significance.en
                    : event.significance.en || event.significance.pa}
                </p>
              </div>
            )}

            {/* Key Figures */}
            {event.keyFigures && event.keyFigures.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  {language === 'pa' ? 'ਮੁੱਖ ਸ਼ਖ਼ਸੀਅਤਾਂ' : 'Key Figures'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {event.keyFigures.map((figure) => (
                    <Link
                      key={figure.id}
                      href={`/itihaas/figure/${figure.id}`}
                      className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm transition-colors"
                    >
                      <span className="font-gurmukhi">{figure.name.pa}</span>
                      <span className="text-xs text-gray-500">
                        ({figure.figureType})
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              This event is documented from the following sources:
            </p>
            {event.sources.map((source, index) => (
              <div
                key={source.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {source.title.en || source.title.pa}
                    </h4>
                    {source.author && (
                      <p className="text-sm text-gray-600">{source.author}</p>
                    )}
                    <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                      {source.type}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">#{index + 1}</span>
                </div>
                {source.reference && (
                  <div className="mt-3 text-sm text-gray-600">
                    {source.reference.volume && (
                      <span>Vol. {source.reference.volume}</span>
                    )}
                    {source.reference.chapter && (
                      <span>, Ch. {source.reference.chapter}</span>
                    )}
                    {source.reference.page && (
                      <span>, p. {source.reference.page}</span>
                    )}
                  </div>
                )}
                {source.reference?.originalQuote && (
                  <blockquote className="mt-3 pl-3 border-l-2 border-orange-300 text-sm text-gray-600 italic">
                    "{source.reference.originalQuote}"
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Interpretations Tab */}
        {activeTab === 'interpretations' && event.interpretations && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Different scholarly interpretations of this event (shown
              separately, not merged):
            </p>
            {event.interpretations.map((interp, index) => (
              <div
                key={interp.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Interpretation {index + 1}
                    </span>
                    <h4 className="font-medium text-gray-900 mt-2">
                      {interp.source.title}
                    </h4>
                    {interp.source.author && (
                      <p className="text-sm text-gray-500">
                        {interp.source.author}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={`text-gray-700 ${
                    language === 'pa' ? 'font-gurmukhi' : ''
                  }`}
                >
                  {language === 'pa'
                    ? interp.text.pa || interp.text.en
                    : interp.text.en || interp.text.pa}
                </div>
                {interp.perspectiveNote && (
                  <div className="mt-3 text-xs text-gray-500 bg-yellow-50 px-3 py-2 rounded">
                    <strong>Perspective note:</strong> {interp.perspectiveNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t text-center">
        <p className="text-xs text-gray-500">
          Every historical claim is attributed to its source.
        </p>
      </div>
    </div>
  );
}

export default EventDetailCard;
