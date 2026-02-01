// ============================================================================
// API TYPES
// ============================================================================
// Shared TypeScript interfaces for API requests and responses
// Replaces `any` types throughout the codebase
// ============================================================================

// ============================================================================
// MULTILINGUAL TEXT
// ============================================================================

export interface MultilingualText {
  pa: string;          // Punjabi (Gurmukhi) - Required, Authoritative
  paRoman?: string;    // Phonetic transliteration
  en?: string;         // English
  hi?: string;         // Hindi
}

// ============================================================================
// GURBANI TYPES
// ============================================================================

export interface BaniDBVerse {
  id: number;
  shabadId: number;
  verse: {
    gurmukhi: string;
    unicode: string;
  };
  larivaar: {
    gurmukhi: string;
    unicode: string;
  };
  translation?: {
    en?: {
      bdb?: string;
      ms?: string;
      ssk?: string;
    };
    pu?: {
      bdb?: {
        gurmukhi?: string;
        unicode?: string;
      };
      ss?: {
        gurmukhi?: string;
        unicode?: string;
      };
      ft?: {
        gurmukhi?: string;
        unicode?: string;
      };
    };
  };
  transliteration?: {
    english?: string;
    hindi?: string;
    en?: string;
    hi?: string;
  };
  pageNo: number;
  lineNo: number;
  writer: {
    writerId: number;
    gurmukhi: string;
    unicode: string;
    english: string;
  };
  raag: {
    raagId: number;
    gurmukhi: string;
    unicode: string;
    english: string;
  };
}

export interface BaniDBAngResponse {
  page: {
    pageNo: number;
    totalPages: number;
  };
  source: {
    sourceId: string;
    gurmukhi: string;
    unicode: string;
    english: string;
  };
  count: number;
  verses: BaniDBVerse[];
  navigation?: {
    previous: number | null;
    next: number | null;
  };
}

export interface BaniDBShabadResponse {
  shabadInfo: {
    shabadId: number;
    pageNo: number;
    raag: {
      raagId: number;
      gurmukhi: string;
      unicode: string;
      english: string;
    };
    writer: {
      writerId: number;
      gurmukhi: string;
      unicode: string;
      english: string;
    };
  };
  count: number;
  verses: BaniDBVerse[];
}

export interface BaniDBSearchResult {
  verses: BaniDBVerse[];
  count: number;
  pages: {
    page: number;
    totalPages: number;
    resultsPerPage: number;
  };
}

export interface Raag {
  raagId: number;
  gurmukhi: string;
  unicode: string;
  english: string;
  startAng: number;
  endAng: number;
  raagWithPage?: string;
}

export interface Writer {
  writerId: number;
  gurmukhi: string;
  unicode: string;
  english: string;
}

// ============================================================================
// HISTORY/ITIHAAS TYPES
// ============================================================================

export type EraType =
  | 'GURU_PERIOD'
  | 'KHALSA_ESTABLISHMENT'
  | 'MISL_PERIOD'
  | 'SIKH_EMPIRE'
  | 'COLONIAL_PERIOD'
  | 'POST_INDEPENDENCE'
  | 'MODERN_PERIOD'
  | 'CONTEMPORARY';

export interface HistoricalPeriod {
  id: string;
  eraId: string;
  name: MultilingualText;
  yearStart: number;
  yearEnd?: number;
  events: HistoricalEvent[];
}

export interface HistoricalEra {
  id: string;
  name: MultilingualText;
  eraType: EraType;
  yearStart: number;
  yearEnd?: number;
  description: MultilingualText;
  isOngoing: boolean;
  periods: HistoricalPeriod[];
}

export interface HistoricalEvent {
  id: string;
  title: MultilingualText;
  year: number;
  yearEnd?: number;
  description: MultilingualText;
  location?: MultilingualText;
  significance?: MultilingualText;
  isContemporary?: boolean;
  sources?: SourceCitation[];
}

export interface HistoricalFigure {
  id: string;
  name: MultilingualText;
  isGuru?: boolean;
  guruNumber?: number;
  birthYear?: number;
  deathYear?: number;
  gurgaddiStart?: number;
  gurgaddiEnd?: number;
  biography?: MultilingualText;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED';
}

export interface SourceCitation {
  name: string;
  author: string;
  year?: number;
  type: 'PRIMARY' | 'SECONDARY' | 'TEEKA' | 'ACADEMIC';
  page?: string;
  chapter?: string;
}

// ============================================================================
// TIMELINE API RESPONSE
// ============================================================================

export interface TimelineResponse {
  eras: HistoricalEra[];
  sourceNote: string;
}

export interface EraResponse extends HistoricalEra {
  events: HistoricalEvent[];
}

export interface EventResponse extends HistoricalEvent {
  detailedDescription?: MultilingualText;
  keyFigures?: Array<{
    name: MultilingualText;
    role: MultilingualText;
  }>;
  sources: SourceCitation[];
}

// ============================================================================
// GURU SAHIBAAN RESPONSE
// ============================================================================

export interface GuruSahibaanResponse {
  guruSahibaan: HistoricalFigure[];
  note: string;
}

// ============================================================================
// API ERROR RESPONSE
// ============================================================================

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode?: number;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseMutationResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  mutate: (input: unknown) => Promise<void>;
}
