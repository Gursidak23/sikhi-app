'use client';

// ============================================================================
// HISTORY (ITIHAAS) SECTION PAGE
// ============================================================================
// Chronological, source-attributed documentation of Sikh history
// Contemporary events clearly marked as evolving
// ============================================================================

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { useLanguage } from '@/components/common/LanguageProvider';
import { SourceAttributionNotice, ContemporaryHistoryDisclaimer } from '@/components/common/Disclaimer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ReadingProgress } from '@/components/common/ReadingProgress';
import { Timeline, EraNode } from '@/modules/itihaas/components/Timeline';
import { GuruSahibaanList } from '@/modules/itihaas/components/FigureProfile';
import { GuruDetailModal, EventDetailModal, type EventDetail } from '@/modules/itihaas/components/DetailModals';
import { getEventById, ALL_HISTORICAL_EVENTS } from '@/modules/itihaas/data/historical-events-details';
import type { Language, Era, HistoricalFigure } from '@/types';

// Sample data for demonstration
const SAMPLE_ERAS: Era[] = [
  {
    id: 'guru-period',
    name: {
      pa: 'ਗੁਰੂ ਸਾਹਿਬਾਨ ਦਾ ਕਾਲ',
      en: 'The Period of the Guru Sahibaan',
      hi: 'गुरु साहिबान का काल',
    },
    eraType: 'GURU_PERIOD',
    yearStart: 1469,
    yearEnd: 1708,
    description: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਦੇ ਪ੍ਰਗਟ ਹੋਣ ਤੋਂ ਲੈ ਕੇ ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਦੇ ਜੋਤੀ ਜੋਤ ਸਮਾਉਣ ਤੱਕ ਦਾ ਸਮਾਂ।',
      en: 'From the Prakash of Sri Guru Nanak Dev Ji to the Joti Jot of Sri Guru Gobind Singh Ji.',
    },
    isOngoing: false,
    periods: [
      {
        id: 'guru-nanak-period',
        eraId: 'guru-period',
        name: {
          pa: 'ਸ੍ਰੀ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਦਾ ਸਮਾਂ',
          en: 'Period of Sri Guru Nanak Dev Ji',
        },
        yearStart: 1469,
        yearEnd: 1539,
        events: [],
      },
      {
        id: 'guru-angad-period',
        eraId: 'guru-period',
        name: {
          pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ ਦਾ ਸਮਾਂ',
          en: 'Period of Sri Guru Angad Dev Ji',
        },
        yearStart: 1539,
        yearEnd: 1552,
        events: [],
      },
      {
        id: 'guru-amardas-period',
        eraId: 'guru-period',
        name: {
          pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅਮਰਦਾਸ ਜੀ ਦਾ ਸਮਾਂ',
          en: 'Period of Sri Guru Amar Das Ji',
        },
        yearStart: 1552,
        yearEnd: 1574,
        events: [],
      },
      {
        id: 'guru-ramdas-period',
        eraId: 'guru-period',
        name: {
          pa: 'ਸ੍ਰੀ ਗੁਰੂ ਰਾਮਦਾਸ ਜੀ ਦਾ ਸਮਾਂ',
          en: 'Period of Sri Guru Ram Das Ji',
        },
        yearStart: 1574,
        yearEnd: 1581,
        events: [],
      },
      {
        id: 'guru-arjan-period',
        eraId: 'guru-period',
        name: {
          pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ ਦਾ ਸਮਾਂ',
          en: 'Period of Sri Guru Arjan Dev Ji',
        },
        yearStart: 1581,
        yearEnd: 1606,
        events: [],
      },
      {
        id: 'guru-hargobind-period',
        eraId: 'guru-period',
        name: {
          pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਗੋਬਿੰਦ ਜੀ ਦਾ ਸਮਾਂ',
          en: 'Period of Sri Guru Hargobind Ji',
        },
        yearStart: 1606,
        yearEnd: 1644,
        events: [],
      },
      {
        id: 'guru-har-rai-period',
        eraId: 'guru-period',
        name: {
          pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਰਾਇ ਜੀ ਦਾ ਸਮਾਂ',
          en: 'Period of Sri Guru Har Rai Ji',
        },
        yearStart: 1644,
        yearEnd: 1661,
        events: [],
      },
      {
        id: 'guru-har-krishan-period',
        eraId: 'guru-period',
        name: {
          pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਕ੍ਰਿਸ਼ਨ ਜੀ ਦਾ ਸਮਾਂ',
          en: 'Period of Sri Guru Har Krishan Ji',
        },
        yearStart: 1661,
        yearEnd: 1664,
        events: [],
      },
      {
        id: 'guru-tegh-bahadur-period',
        eraId: 'guru-period',
        name: {
          pa: 'ਸ੍ਰੀ ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ ਦਾ ਸਮਾਂ',
          en: 'Period of Sri Guru Tegh Bahadur Ji',
        },
        yearStart: 1664,
        yearEnd: 1675,
        events: [],
      },
      {
        id: 'guru-gobind-singh-period',
        eraId: 'guru-period',
        name: {
          pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਦਾ ਸਮਾਂ',
          en: 'Period of Sri Guru Gobind Singh Ji',
        },
        yearStart: 1675,
        yearEnd: 1708,
        events: [],
      },
    ],
  },
  {
    id: 'khalsa-establishment',
    name: {
      pa: 'ਖਾਲਸਾ ਦੀ ਸਿਰਜਣਾ',
      en: 'Khalsa Establishment',
    },
    eraType: 'KHALSA_ESTABLISHMENT',
    yearStart: 1699,
    yearEnd: 1716,
    description: {
      pa: 'ਖਾਲਸੇ ਦੀ ਸਿਰਜਣਾ ਅਤੇ ਬੰਦਾ ਸਿੰਘ ਬਹਾਦਰ ਦੀ ਸ਼ਹਾਦਤ ਤੱਕ ਦਾ ਸਮਾਂ।',
      en: 'From the creation of the Khalsa to the martyrdom of Banda Singh Bahadur.',
    },
    isOngoing: false,
    periods: [
      {
        id: 'khalsa-creation',
        eraId: 'khalsa-establishment',
        name: {
          pa: 'ਖਾਲਸਾ ਪੰਥ ਦੀ ਸਾਜਣਾ',
          en: 'Creation of Khalsa Panth (1699)',
        },
        yearStart: 1699,
        yearEnd: 1699,
        events: [],
      },
      {
        id: 'banda-singh-bahadur',
        eraId: 'khalsa-establishment',
        name: {
          pa: 'ਬਾਬਾ ਬੰਦਾ ਸਿੰਘ ਬਹਾਦਰ',
          en: 'Baba Banda Singh Bahadur',
        },
        yearStart: 1708,
        yearEnd: 1716,
        events: [],
      },
    ],
  },
  {
    id: 'misl-period',
    name: {
      pa: 'ਮਿਸਲ ਕਾਲ',
      en: 'The Misl Period',
    },
    eraType: 'MISL_PERIOD',
    yearStart: 1716,
    yearEnd: 1799,
    description: {
      pa: 'ਸਿੱਖ ਮਿਸਲਾਂ ਦਾ ਸਮਾਂ - ਬਾਰਾਂ ਮਿਸਲਾਂ ਦੀ ਸਥਾਪਨਾ ਅਤੇ ਰਾਜ।',
      en: 'The era of Sikh Misls - establishment and rule of the twelve confederacies.',
    },
    isOngoing: false,
    periods: [
      {
        id: 'misl-formation',
        eraId: 'misl-period',
        name: {
          pa: 'ਮਿਸਲਾਂ ਦੀ ਸਥਾਪਨਾ',
          en: 'Formation of Misls',
        },
        yearStart: 1716,
        yearEnd: 1799,
        events: [],
      },
      {
        id: 'chhota-ghallughara',
        eraId: 'misl-period',
        name: {
          pa: 'ਛੋਟਾ ਘੱਲੂਘਾਰਾ',
          en: 'Chhota Ghallughara (1746)',
        },
        yearStart: 1746,
        yearEnd: 1746,
        events: [],
      },
      {
        id: 'wadda-ghallughara',
        eraId: 'misl-period',
        name: {
          pa: 'ਵੱਡਾ ਘੱਲੂਘਾਰਾ',
          en: 'Wadda Ghallughara (1762)',
        },
        yearStart: 1762,
        yearEnd: 1762,
        events: [],
      },
    ],
  },
  {
    id: 'sikh-empire',
    name: {
      pa: 'ਸਿੱਖ ਰਾਜ',
      en: 'The Sikh Empire',
    },
    eraType: 'SIKH_EMPIRE',
    yearStart: 1799,
    yearEnd: 1849,
    description: {
      pa: 'ਮਹਾਰਾਜਾ ਰਣਜੀਤ ਸਿੰਘ ਦੀ ਅਗਵਾਈ ਹੇਠ ਸਿੱਖ ਰਾਜ ਦੀ ਸਥਾਪਨਾ ਅਤੇ ਪਤਨ।',
      en: 'The establishment and fall of the Sikh Kingdom under Maharaja Ranjit Singh.',
    },
    isOngoing: false,
    periods: [
      {
        id: 'maharaja-ranjit-singh-rule',
        eraId: 'sikh-empire',
        name: {
          pa: 'ਮਹਾਰਾਜਾ ਰਣਜੀਤ ਸਿੰਘ ਦਾ ਰਾਜ',
          en: 'Reign of Maharaja Ranjit Singh',
        },
        yearStart: 1799,
        yearEnd: 1839,
        events: [],
      },
      {
        id: 'anglo-sikh-wars',
        eraId: 'sikh-empire',
        name: {
          pa: 'ਐਂਗਲੋ-ਸਿੱਖ ਯੁੱਧ',
          en: 'Anglo-Sikh Wars',
        },
        yearStart: 1845,
        yearEnd: 1849,
        events: [],
      },
    ],
  },
  {
    id: 'colonial-period',
    name: {
      pa: 'ਬਸਤੀਵਾਦੀ ਕਾਲ',
      en: 'Colonial Period',
    },
    eraType: 'COLONIAL_PERIOD',
    yearStart: 1849,
    yearEnd: 1947,
    description: {
      pa: 'ਬ੍ਰਿਟਿਸ਼ ਰਾਜ ਅਧੀਨ ਪੰਜਾਬ। ਸਿੰਘ ਸਭਾ ਲਹਿਰ ਅਤੇ ਗੁਰਦੁਆਰਾ ਸੁਧਾਰ ਲਹਿਰ।',
      en: 'Punjab under British rule. Singh Sabha Movement and Gurdwara Reform Movement.',
    },
    isOngoing: false,
    periods: [
      {
        id: 'singh-sabha-movement',
        eraId: 'colonial-period',
        name: {
          pa: 'ਸਿੰਘ ਸਭਾ ਲਹਿਰ',
          en: 'Singh Sabha Movement',
        },
        yearStart: 1873,
        yearEnd: 1925,
        events: [],
      },
      {
        id: 'jallianwala-bagh',
        eraId: 'colonial-period',
        name: {
          pa: 'ਜਲ੍ਹਿਆਂਵਾਲਾ ਬਾਗ਼ ਸਾਕਾ',
          en: 'Jallianwala Bagh Massacre (1919)',
        },
        yearStart: 1919,
        yearEnd: 1919,
        events: [],
      },
      {
        id: 'gurdwara-reform-movement',
        eraId: 'colonial-period',
        name: {
          pa: 'ਗੁਰਦੁਆਰਾ ਸੁਧਾਰ ਲਹਿਰ',
          en: 'Gurdwara Reform Movement',
        },
        yearStart: 1920,
        yearEnd: 1925,
        events: [],
      },
    ],
  },
  {
    id: 'post-independence',
    name: {
      pa: 'ਆਜ਼ਾਦੀ ਤੋਂ ਬਾਅਦ',
      en: 'Post-Independence Era',
    },
    eraType: 'POST_INDEPENDENCE',
    yearStart: 1947,
    yearEnd: 1984,
    description: {
      pa: '1947 ਦੀ ਵੰਡ ਤੋਂ ਲੈ ਕੇ 1984 ਤੱਕ ਦਾ ਸਮਾਂ।',
      en: 'From the 1947 Partition to 1984.',
    },
    isOngoing: false,
    periods: [
      {
        id: 'partition-1947',
        eraId: 'post-independence',
        name: {
          pa: '੧੯੪੭ ਦੀ ਵੰਡ',
          en: 'Partition of 1947',
        },
        yearStart: 1947,
        yearEnd: 1947,
        events: [],
      },
      {
        id: 'punjabi-suba',
        eraId: 'post-independence',
        name: {
          pa: 'ਪੰਜਾਬੀ ਸੂਬਾ ਅੰਦੋਲਨ',
          en: 'Punjabi Suba Movement',
        },
        yearStart: 1955,
        yearEnd: 1966,
        events: [],
      },
      {
        id: 'anandpur-sahib-resolution',
        eraId: 'post-independence',
        name: {
          pa: 'ਅਨੰਦਪੁਰ ਸਾਹਿਬ ਦਾ ਮਤਾ',
          en: 'Anandpur Sahib Resolution',
        },
        yearStart: 1973,
        yearEnd: 1973,
        events: [],
      },
    ],
  },
  {
    id: 'modern-period',
    name: {
      pa: 'ਆਧੁਨਿਕ ਕਾਲ',
      en: 'The Modern Period',
    },
    eraType: 'MODERN_PERIOD',
    yearStart: 1984,
    yearEnd: undefined,
    description: {
      pa: '1984 ਤੋਂ ਲੈ ਕੇ ਅੱਜ ਤੱਕ ਦਾ ਸਮਾਂ।',
      en: 'From 1984 to the present day.',
    },
    isOngoing: true,
    periods: [
      {
        id: 'operation-bluestar',
        eraId: 'modern-period',
        name: {
          pa: 'ਸਾਕਾ ਨੀਲਾ ਤਾਰਾ (ਜੂਨ ੧੯੮੪)',
          en: 'Operation Blue Star (June 1984)',
        },
        yearStart: 1984,
        yearEnd: 1984,
        events: [],
      },
      {
        id: 'sikh-genocide-1984',
        eraId: 'modern-period',
        name: {
          pa: '੧੯੮੪ ਦਾ ਸਿੱਖ ਕਤਲੇਆਮ',
          en: 'Sikh Genocide of 1984',
        },
        yearStart: 1984,
        yearEnd: 1984,
        events: [],
      },
      {
        id: 'operation-woodrose',
        eraId: 'modern-period',
        name: {
          pa: 'ਆਪਰੇਸ਼ਨ ਵੁੱਡਰੋਜ਼',
          en: 'Operation Woodrose',
        },
        yearStart: 1984,
        yearEnd: 1984,
        events: [],
      },
      {
        id: 'sikh-diaspora',
        eraId: 'modern-period',
        name: {
          pa: 'ਸਿੱਖ ਪਰਵਾਸ',
          en: 'Sikh Diaspora',
        },
        yearStart: 1984,
        yearEnd: 2000,
        events: [],
      },
    ],
  },
  {
    id: 'contemporary',
    name: {
      pa: 'ਸਮਕਾਲੀ ਘਟਨਾਵਾਂ',
      en: 'Contemporary Events',
    },
    eraType: 'CONTEMPORARY',
    yearStart: 2019,
    yearEnd: undefined,
    description: {
      pa: 'ਚੱਲ ਰਹੇ ਸਮਕਾਲੀ ਇਤਿਹਾਸ। ਇਹ ਜਾਣਕਾਰੀ ਵਿਕਾਸਸ਼ੀਲ ਹੈ ਅਤੇ ਅੰਤਿਮ ਨਹੀਂ ਹੈ।',
      en: 'Ongoing contemporary history. This information is evolving and not final.',
    },
    isOngoing: true,
    periods: [
      {
        id: 'kartarpur-corridor',
        eraId: 'contemporary',
        name: {
          pa: 'ਕਰਤਾਰਪੁਰ ਲਾਂਘਾ (੨੦੧੯)',
          en: 'Kartarpur Corridor (2019)',
        },
        yearStart: 2019,
        yearEnd: 2019,
        events: [],
      },
      {
        id: 'farmers-protest',
        eraId: 'contemporary',
        name: {
          pa: 'ਕਿਸਾਨ ਅੰਦੋਲਨ ੨੦੨੦-੨੧',
          en: 'Farmers\' Protest 2020-21',
        },
        yearStart: 2020,
        yearEnd: 2021,
        events: [],
      },
      {
        id: 'sikh-representation',
        eraId: 'contemporary',
        name: {
          pa: 'ਸਿੱਖਾਂ ਦੀ ਵਿਸ਼ਵ ਪੱਧਰੀ ਪ੍ਰਤੀਨਿਧਤਾ',
          en: 'Global Sikh Representation',
        },
        yearStart: 2020,
        yearEnd: undefined,
        events: [],
      },
    ],
  },
];

const SAMPLE_GURUS: HistoricalFigure[] = [
  {
    id: 'guru-nanak',
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ',
      en: 'Sri Guru Nanak Dev Ji',
      hi: 'श्री गुरु नानक देव जी',
    },
    isGuru: true,
    guruNumber: 1,
    birthYear: 1469,
    deathYear: 1539,
    status: 'PUBLISHED',
  },
  {
    id: 'guru-angad',
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ',
      en: 'Sri Guru Angad Dev Ji',
    },
    isGuru: true,
    guruNumber: 2,
    birthYear: 1504,
    deathYear: 1552,
    status: 'PUBLISHED',
  },
  {
    id: 'guru-amardas',
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅਮਰਦਾਸ ਜੀ',
      en: 'Sri Guru Amar Das Ji',
    },
    isGuru: true,
    guruNumber: 3,
    birthYear: 1479,
    deathYear: 1574,
    status: 'PUBLISHED',
  },
  {
    id: 'guru-ramdas',
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਰਾਮਦਾਸ ਜੀ',
      en: 'Sri Guru Ram Das Ji',
    },
    isGuru: true,
    guruNumber: 4,
    birthYear: 1534,
    deathYear: 1581,
    status: 'PUBLISHED',
  },
  {
    id: 'guru-arjan',
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ',
      en: 'Sri Guru Arjan Dev Ji',
    },
    isGuru: true,
    guruNumber: 5,
    birthYear: 1563,
    deathYear: 1606,
    status: 'PUBLISHED',
  },
  {
    id: 'guru-hargobind',
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਗੋਬਿੰਦ ਜੀ',
      en: 'Sri Guru Hargobind Ji',
    },
    isGuru: true,
    guruNumber: 6,
    birthYear: 1595,
    deathYear: 1644,
    status: 'PUBLISHED',
  },
  {
    id: 'guru-har-rai',
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਰਾਇ ਜੀ',
      en: 'Sri Guru Har Rai Ji',
    },
    isGuru: true,
    guruNumber: 7,
    birthYear: 1630,
    deathYear: 1661,
    status: 'PUBLISHED',
  },
  {
    id: 'guru-har-krishan',
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਕ੍ਰਿਸ਼ਨ ਜੀ',
      en: 'Sri Guru Har Krishan Ji',
    },
    isGuru: true,
    guruNumber: 8,
    birthYear: 1656,
    deathYear: 1664,
    status: 'PUBLISHED',
  },
  {
    id: 'guru-tegh-bahadur',
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ',
      en: 'Sri Guru Tegh Bahadur Ji',
    },
    isGuru: true,
    guruNumber: 9,
    birthYear: 1621,
    deathYear: 1675,
    status: 'PUBLISHED',
  },
  {
    id: 'guru-gobind-singh',
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ',
      en: 'Sri Guru Gobind Singh Ji',
    },
    isGuru: true,
    guruNumber: 10,
    birthYear: 1666,
    deathYear: 1708,
    status: 'PUBLISHED',
  },
];

type TabType = 'timeline' | 'gurus' | 'sources';

export default function ItihaasPage() {
  const { language, isPunjabi } = useLanguage();
  const isHindi = language === 'hi';
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [showContemporaryWarning, setShowContemporaryWarning] = useState(true);
  const [selectedGuruId, setSelectedGuruId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);

  const tabs: { id: TabType; labelPa: string; labelEn: string; labelHi?: string; icon: string }[] = [
    { id: 'timeline', labelPa: 'ਸਮਾਂ-ਰੇਖਾ', labelEn: 'Timeline', labelHi: 'समय-रेखा', icon: '📅' },
    { id: 'gurus', labelPa: 'ਗੁਰੂ ਸਾਹਿਬਾਨ', labelEn: 'Guru Sahibaan', labelHi: 'गुरु साहिबान', icon: '🙏' },
    { id: 'sources', labelPa: 'ਸਰੋਤ', labelEn: 'Sources', labelHi: 'स्रोत', icon: '📚' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigation />

      <main id="main-content" className="flex-1">
        {/* Hero Header */}
        <section className="relative py-16 md:py-20 overflow-hidden" style={{
          background: 'linear-gradient(135deg, #FF8533 0%, #FF6B00 50%, #E55A00 100%)'
        }}>
          <div className="absolute inset-0 sikhi-pattern opacity-10" />
          <div className="container-content relative z-10 text-center">
            {/* Khanda Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white text-4xl">☬</span>
            </div>
            
            <h1 className={cn(
              'text-4xl md:text-5xl font-bold text-white mb-4',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi ? 'ਸਿੱਖ ਇਤਿਹਾਸ' : isHindi ? 'सिख इतिहास' : 'Sikh History'}
            </h1>
            <p className={cn(
              'text-xl text-orange-100 max-w-2xl mx-auto',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {isPunjabi
                ? 'ਸਰੋਤ-ਆਧਾਰਿਤ ਇਤਿਹਾਸਕ ਦਸਤਾਵੇਜ਼ (੧੪੬੯ - ਅੱਜ ਤੱਕ)'
                : isHindi ? 'स्रोत-आधारित ऐतिहासिक दस्तावेज़ (१४६९ - वर्तमान)'
                : 'Source-attributed historical documentation (1469 - Present)'}
            </p>
          </div>
          
          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" className="w-full">
              <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="#FDF8F0"/>
            </svg>
          </div>
        </section>

        {/* Source Attribution Notice */}
        <div className="bg-[#FDF8F0] py-4">
          <div className="container-content">
            <SourceAttributionNotice language={language} />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#FDF8F0] sticky top-16 z-40 border-b-2 border-orange-200">
          <div className="container-content">
            <nav className="flex gap-2 overflow-x-auto py-2" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                    isPunjabi && 'font-gurmukhi text-base',
                    isHindi && 'font-devanagari text-base',
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-orange-50 border border-orange-200'
                  )}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  <span>{tab.icon}</span>
                  {isPunjabi ? tab.labelPa : isHindi ? (tab.labelHi || tab.labelEn) : tab.labelEn}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#FDF8F0] py-8">
          <div className="container-content">
            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="max-w-4xl">
                <p className={cn(
                  'text-neutral-600 mb-6',
                  isPunjabi && 'font-gurmukhi',
                  isHindi && 'font-devanagari'
                )}>
                  {isPunjabi 
                    ? 'ਕਿਸੇ ਵੀ ਯੁੱਗ ਜਾਂ ਘਟਨਾ ਤੇ ਕਲਿੱਕ ਕਰੋ ਵਿਸਤਾਰਿਤ ਜਾਣਕਾਰੀ ਵੇਖਣ ਲਈ'
                    : isHindi ? 'किसी भी युग या घटना पर क्लिक करें विस्तृत जानकारी देखने के लिए'
                    : 'Click on any era or event to view detailed information'}
                </p>
                <Timeline
                  eras={SAMPLE_ERAS}
                  language={language}
                  onEventClick={(eventId) => {
                    const event = getEventById(eventId);
                    if (event) {
                      setSelectedEvent(event);
                    }
                  }}
                />
              </div>
            )}

            {/* Guru Sahibaan Tab */}
            {activeTab === 'gurus' && (
              <div className="max-w-4xl">
                <GuruSahibaanList
                  gurus={SAMPLE_GURUS}
                  language={language}
                  onGuruClick={(guruId) => setSelectedGuruId(guruId)}
                />
              </div>
            )}

            {/* Sources Tab */}
            {activeTab === 'sources' && (
              <div className="max-w-4xl">
                <h2 className={cn(
                  'text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3',
                  isPunjabi && 'font-gurmukhi text-2xl',
                  isHindi && 'font-devanagari text-2xl'
                )}>
                  <div className="sikhi-icon sikhi-icon-kesri">
                    <span>📚</span>
                  </div>
                  {isPunjabi ? 'ਪ੍ਰਮਾਣਿਕ ਸਰੋਤ' : isHindi ? 'प्रामाणिक स्रोत' : 'Authoritative Sources'}
                </h2>
                
                <div className="space-y-6">
                  {/* Primary Sources */}
                  <div className="sikhi-card p-6">
                    <h3 className={cn(
                      'font-semibold text-gray-800 mb-4 flex items-center gap-2',
                      isPunjabi && 'font-gurmukhi',
                      isHindi && 'font-devanagari'
                    )}>
                      <span className="w-3 h-3 rounded-full bg-blue-500" />
                      {isPunjabi ? 'ਮੁੱਖ ਸਰੋਤ' : isHindi ? 'मुख्य स्रोत' : 'Primary Sources'}
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-blue-600">•</span>
                        <div>
                          <p className="font-gurmukhi font-medium">ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ</p>
                          <p className="text-sm text-gray-600">Primary spiritual source</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-600">•</span>
                      <div>
                          <p className="font-gurmukhi font-medium">ਸ੍ਰੀ ਗੁਰ ਪੰਥ ਪ੍ਰਕਾਸ਼</p>
                          <p className="text-sm text-gray-600">Bhai Rattan Singh Bhangu (1841)</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-600">•</span>
                        <div>
                          <p className="font-gurmukhi font-medium">ਸੂਰਜ ਪ੍ਰਕਾਸ਼</p>
                          <p className="text-sm text-gray-600">Bhai Santokh Singh (1843)</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Secondary Sources */}
                  <div className="sikhi-card p-6">
                    <h3 className={cn(
                      'font-semibold text-gray-800 mb-4 flex items-center gap-2',
                      isPunjabi && 'font-gurmukhi',
                      isHindi && 'font-devanagari'
                    )}>
                      <span className="w-3 h-3 rounded-full bg-gray-400" />
                      {isPunjabi ? 'ਸਹਾਇਕ ਸਰੋਤ' : isHindi ? 'सहायक स्रोत' : 'Secondary Sources'}
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-gray-400">•</span>
                        <div>
                          <p className="font-medium">The Sikh Religion</p>
                          <p className="text-sm text-gray-600">Max Arthur Macauliffe (1909)</p>
                          <p className="text-xs text-amber-600 mt-1 bg-amber-50 inline-block px-2 py-0.5 rounded">
                            ⚠️ Colonial-era perspective - use with caution
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-gray-400">•</span>
                        <div>
                          <p className="font-medium">A History of the Sikhs</p>
                          <p className="text-sm text-gray-600">Khushwant Singh (1963)</p>
                          <p className="text-xs text-amber-600 mt-1 bg-amber-50 inline-block px-2 py-0.5 rounded">
                            ⚠️ Cross-reference required
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Teeka Sources */}
                  <div className="sikhi-card sikhi-card-neela p-6">
                    <h3 className={cn(
                      'font-semibold text-gray-800 mb-4 flex items-center gap-2',
                      isPunjabi && 'font-gurmukhi',
                      isHindi && 'font-devanagari'
                    )}>
                      <span className="w-3 h-3 rounded-full bg-orange-500" />
                      {isPunjabi ? 'ਟੀਕੇ ਅਤੇ ਵਿਆਖਿਆ' : isHindi ? 'टीके और व्याख्या' : 'Teekas & Interpretations'}
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-orange-500">•</span>
                        <div>
                          <p className="font-gurmukhi font-medium">ਫ਼ਰੀਦਕੋਟ ਵਾਲਾ ਟੀਕਾ</p>
                          <p className="text-sm text-gray-600">Classical traditional interpretation</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-orange-500">•</span>
                        <div>
                          <p className="font-gurmukhi font-medium">ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ</p>
                          <p className="text-sm text-gray-600">Prof. Sahib Singh (1962)</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-orange-500">•</span>
                        <div>
                          <p className="font-medium">English Interpretation</p>
                          <p className="text-sm text-gray-600">Dr. Manmohan Singh (SGPC)</p>
                          <p className="text-xs text-blue-600 mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded">
                            ℹ️ English is interpretive, not literal translation
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contemporary History Warning Toast */}
        {showContemporaryWarning && activeTab === 'timeline' && SAMPLE_ERAS.some(e => e.isOngoing) && (
          <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 max-w-sm z-50">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg shadow-xl p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-2">
                  <span className="text-xl">⚠️</span>
                  <p className={cn(
                    'text-sm text-amber-800',
                    isPunjabi && 'font-gurmukhi',
                    isHindi && 'font-devanagari'
                  )}>
                    {isPunjabi
                      ? 'ਸਮਕਾਲੀ ਘਟਨਾਵਾਂ ਵਿਕਾਸਸ਼ੀਲ ਇਤਿਹਾਸ ਹਨ ਅਤੇ ਅੰਤਿਮ ਨਹੀਂ ਹਨ।'
                      : isHindi ? 'समकालीन घटनाएँ विकासशील इतिहास हैं और अंतिम नहीं हैं।'
                      : 'Contemporary events are evolving history and not final.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowContemporaryWarning(false)}
                  className="text-amber-600 hover:text-amber-800 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <ReadingProgress variant="kesri" />
      <ScrollToTop />
      <Footer />

      {/* Detail Modals */}
      <GuruDetailModal
        guruId={selectedGuruId}
        language={language}
        onClose={() => setSelectedGuruId(null)}
      />
      
      <EventDetailModal
        event={selectedEvent}
        language={language}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
