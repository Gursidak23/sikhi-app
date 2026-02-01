'use client';

import { useState } from 'react';
import { PanktiDisplay } from './PanktiDisplay';
import { SourceCitation } from '@/components/common/SourceCitation';
import type { Pankti, TeekaInterpretation } from '@/types';

/**
 * ShabadDisplay Component
 * Displays a complete Shabad with all Panktis and metadata
 * Maintains sacred discipline with proper source attribution
 */

interface Shabad {
  id: string;
  title: {
    pa: string;
    en?: string;
  };
  author?: {
    id: string;
    name: {
      pa: string;
      en?: string;
    };
  };
  raag?: {
    id: string;
    name: {
      pa: string;
      en?: string;
    };
  };
  panktis: Pankti[];
}

interface ShabadDisplayProps {
  shabad: Shabad;
  showNavigation?: boolean;
  onPreviousShabad?: () => void;
  onNextShabad?: () => void;
}

export function ShabadDisplay({
  shabad,
  showNavigation = false,
  onPreviousShabad,
  onNextShabad,
}: ShabadDisplayProps) {
  const [expandAll, setExpandAll] = useState(false);
  const [selectedTeeka, setSelectedTeeka] = useState<string | null>(null);

  // Get unique Teeka sources from all Panktis
  const teekaSources = getUniqueTeekas(shabad.panktis);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Shabad Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            {/* Title */}
            <h2 className="text-2xl font-gurmukhi">{shabad.title.pa}</h2>
            {shabad.title.en && (
              <p className="text-blue-200 text-sm mt-1">{shabad.title.en}</p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              {shabad.author && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-300">ਬਾਣੀਕਾਰ:</span>
                  <span className="font-gurmukhi">{shabad.author.name.pa}</span>
                </div>
              )}
              {shabad.raag && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-300">ਰਾਗ:</span>
                  <span className="font-gurmukhi">{shabad.raag.name.pa}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation (optional) */}
          {showNavigation && (
            <div className="flex gap-2">
              <button
                onClick={onPreviousShabad}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded text-sm transition-colors disabled:opacity-50"
                disabled={!onPreviousShabad}
              >
                ◀ ਪਿਛਲਾ
              </button>
              <button
                onClick={onNextShabad}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded text-sm transition-colors disabled:opacity-50"
                disabled={!onNextShabad}
              >
                ਅਗਲਾ ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Teeka Source Selector (if multiple sources available) */}
      {teekaSources.length > 1 && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600">ਟੀਕਾ ਸਰੋਤ:</span>
            <button
              onClick={() => setSelectedTeeka(null)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedTeeka === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              ਸਾਰੇ ਦਿਖਾਓ
            </button>
            {teekaSources.map((source) => (
              <button
                key={source.id}
                onClick={() => setSelectedTeeka(source.id)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedTeeka === source.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {source.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {shabad.panktis.length} ਪੰਕਤੀਆਂ
        </span>
        <button
          onClick={() => setExpandAll(!expandAll)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {expandAll ? 'ਸਾਰੇ ਅਰਥ ਬੰਦ ਕਰੋ' : 'ਸਾਰੇ ਅਰਥ ਖੋਲ੍ਹੋ'}
        </button>
      </div>

      {/* Panktis */}
      <div className="divide-y divide-gray-100">
        {shabad.panktis.map((pankti, index) => {
          // Filter interpretations if Teeka is selected
          const filteredPankti = selectedTeeka
            ? {
                ...pankti,
                interpretations: pankti.interpretations.filter(
                  (i: TeekaInterpretation) => i.source.id === selectedTeeka
                ),
              }
            : pankti;

          return (
            <PanktiDisplay
              key={pankti.id}
              pankti={filteredPankti}
              showInterpretations={expandAll}
            />
          );
        })}
      </div>

      {/* Source Attribution Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <p className="text-xs text-gray-500 text-center">
          ਅਰਥ/Meanings are interpretations from named Teekas. Not literal
          translations.
        </p>
        {teekaSources.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {teekaSources.map((source) => (
              <span
                key={source.id}
                className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded"
              >
                {source.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get unique Teeka sources
function getUniqueTeekas(
  panktis: Pankti[]
): Array<{ id: string; title: string }> {
  const sourceMap = new Map<string, string>();

  panktis.forEach((pankti) => {
    pankti.interpretations.forEach((interp: TeekaInterpretation) => {
      if (!sourceMap.has(interp.source.id)) {
        sourceMap.set(
          interp.source.id,
          interp.source.title.en || interp.source.title.pa
        );
      }
    });
  });

  return Array.from(sourceMap.entries()).map(([id, title]) => ({ id, title }));
}

export default ShabadDisplay;
