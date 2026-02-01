'use client';

// ============================================================================
// DISCLAIMER COMPONENT
// ============================================================================
// Displays mandatory disclaimers for Gurbani and historical content
// These are non-negotiable and must always be visible
// ============================================================================

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

interface DisclaimerProps {
  type: 'gurbani' | 'history' | 'contemporary' | 'interpretation';
  language?: Language;
  requiresAcknowledgement?: boolean;
  onAcknowledge?: () => void;
  className?: string;
}

const DISCLAIMERS = {
  gurbani: {
    pa: 'ਇਹ ਪਲੇਟਫਾਰਮ ਸਿੱਖਿਆ ਅਤੇ ਵਿਚਾਰ ਲਈ ਹੈ। ਇਹ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਦੇ ਪ੍ਰਕਾਸ਼ ਜਾਂ ਧਾਰਮਿਕ ਅਭਿਆਸ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ। ਅਰਥ ਵੱਖ-ਵੱਖ ਟੀਕਿਆਂ ਤੋਂ ਲਏ ਗਏ ਹਨ ਅਤੇ ਹਮੇਸ਼ਾ ਸਰੋਤ ਦੱਸਿਆ ਗਿਆ ਹੈ।',
    en: 'This platform is for learning and reflection. It is not a replacement for the Prakash of Guru Granth Sahib Ji or religious practice. Meanings are derived from named Teekas, and attribution is always provided. The original Gurmukhi is authoritative; English text represents interpretation, not literal translation.',
    hi: 'यह प्लेटफॉर्म सीखने और विचार के लिए है। यह गुरु ग्रंथ साहिब जी के प्रकाश या धार्मिक अभ्यास का विकल्प नहीं है।',
  },
  history: {
    pa: 'ਹਰ ਇਤਿਹਾਸਕ ਦਾਅਵੇ ਦਾ ਸਰੋਤ ਦਿੱਤਾ ਗਿਆ ਹੈ। ਜਿੱਥੇ ਸਰੋਤ ਇਕ ਦੂਜੇ ਨਾਲ ਮੇਲ ਨਹੀਂ ਖਾਂਦੇ, ਵੱਖ-ਵੱਖ ਵਿਆਖਿਆਵਾਂ ਵੱਖਰੇ ਤੌਰ ਤੇ ਪੇਸ਼ ਕੀਤੀਆਂ ਗਈਆਂ ਹਨ।',
    en: 'Every historical claim is attributed to its source. Where sources conflict, different interpretations are presented separately, not merged. We are curators, not authorities.',
    hi: 'हर ऐतिहासिक दावे का स्रोत दिया गया है। जहां स्रोत एक दूसरे से मेल नहीं खाते, विभिन्न व्याख्याएं अलग से प्रस्तुत की गई हैं।',
  },
  contemporary: {
    pa: 'ਇਹ ਸਮਕਾਲੀ ਇਤਿਹਾਸ ਹੈ ਜੋ ਵਿਕਸਿਤ ਹੋ ਰਿਹਾ ਹੈ ਅਤੇ ਅੰਤਿਮ ਨਹੀਂ ਹੈ। ਨਵੀਂ ਜਾਣਕਾਰੀ ਸਾਹਮਣੇ ਆਉਣ ਨਾਲ ਇਸ ਵਿੱਚ ਬਦਲਾਅ ਹੋ ਸਕਦਾ ਹੈ।',
    en: 'This is contemporary, evolving history that is not final. Information may be subject to revision as new facts emerge.',
    hi: 'यह समकालीन, विकसित होता इतिहास है जो अंतिम नहीं है। नए तथ्यों के सामने आने पर जानकारी में बदलाव हो सकता है।',
  },
  interpretation: {
    pa: 'ਗੁਰਬਾਣੀ ਦੇ ਅਰਥ ਵੱਖ-ਵੱਖ ਵਿਦਵਾਨਾਂ ਅਨੁਸਾਰ ਵੱਖਰੇ ਹੋ ਸਕਦੇ ਹਨ। ਜਿੱਥੇ ਕਈ ਵਿਆਖਿਆਵਾਂ ਮੌਜੂਦ ਹਨ, ਉਹ ਸਾਰੀਆਂ ਆਪਣੇ ਸਰੋਤ ਨਾਲ ਦਿਖਾਈਆਂ ਗਈਆਂ ਹਨ।',
    en: 'Meanings of Gurbani may vary according to different scholars. Where multiple interpretations exist, they are shown side-by-side with their source attribution.',
    hi: 'गुरबाणी के अर्थ विभिन्न विद्वानों के अनुसार भिन्न हो सकते हैं।',
  },
};

export function Disclaimer({
  type,
  language = 'pa',
  requiresAcknowledgement = false,
  onAcknowledge,
  className,
}: DisclaimerProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAcknowledge = () => {
    setAcknowledged(true);
    onAcknowledge?.();
  };

  const disclaimer = DISCLAIMERS[type];
  const text = disclaimer[language as keyof typeof disclaimer] || disclaimer.en;

  const isGurbaniType = type === 'gurbani' || type === 'interpretation';

  return (
    <div
      className={cn(
        'p-4 my-4 text-sm rounded-r-lg',
        isGurbaniType
          ? 'bg-neela-50 border-l-4 border-neela-400 text-neela-800'
          : type === 'contemporary'
          ? 'bg-amber-50 border-l-4 border-amber-400 text-amber-800'
          : 'bg-neutral-50 border-l-4 border-neutral-300 text-neutral-700',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <p className={language === 'pa' ? 'font-gurmukhi' : ''}>{text}</p>
          
          {requiresAcknowledgement && !acknowledged && (
            <button
              onClick={handleAcknowledge}
              className={cn(
                'mt-3 px-4 py-1.5 text-sm font-medium rounded',
                isGurbaniType
                  ? 'bg-neela-700 text-white hover:bg-neela-800'
                  : 'bg-neutral-700 text-white hover:bg-neutral-800'
              )}
            >
              {language === 'pa' ? 'ਮੈਂ ਸਮਝ ਗਿਆ/ਗਈ' : language === 'hi' ? 'मैं समझ गया/गई' : 'I understand'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Pre-configured disclaimer components
export function GurbaniDisclaimer({ 
  language = 'pa',
  requiresAcknowledgement = true,
  onAcknowledge,
}: {
  language?: Language;
  requiresAcknowledgement?: boolean;
  onAcknowledge?: () => void;
}) {
  return (
    <Disclaimer
      type="gurbani"
      language={language}
      requiresAcknowledgement={requiresAcknowledgement}
      onAcknowledge={onAcknowledge}
    />
  );
}

export function ContemporaryHistoryDisclaimer({
  language = 'pa',
}: {
  language?: Language;
}) {
  return (
    <Disclaimer
      type="contemporary"
      language={language}
      requiresAcknowledgement={true}
    />
  );
}

export function SourceAttributionNotice({
  language = 'pa',
}: {
  language?: Language;
}) {
  return (
    <Disclaimer
      type="history"
      language={language}
    />
  );
}
