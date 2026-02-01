// ============================================================================
// CORE TYPE DEFINITIONS
// ============================================================================
// These types define the content models and data structures used throughout
// the platform. They ensure type safety and document the expected shape
// of all data.
// ============================================================================

// Re-export API types for convenience
export * from './api';

// ============================================================================
// LANGUAGE SYSTEM
// ============================================================================

/**
 * Supported languages in the platform
 * PA_GURU (Punjabi Gurmukhi) is PRIMARY and AUTHORITATIVE
 */
export type Language = 'pa' | 'pa-roman' | 'en' | 'hi';

export const LANGUAGE_CONFIG = {
  pa: {
    code: 'pa',
    name: 'ਪੰਜਾਬੀ',
    nameEnglish: 'Punjabi (Gurmukhi)',
    script: 'Gurmukhi',
    direction: 'ltr',
    isPrimary: true,
    isAuthoritative: true,
  },
  'pa-roman': {
    code: 'pa-roman',
    name: 'Punjabi (Roman)',
    nameEnglish: 'Punjabi (Roman)',
    script: 'Latin',
    direction: 'ltr',
    isPrimary: false,
    isAuthoritative: false,
    note: 'Phonetic transliteration only',
  },
  en: {
    code: 'en',
    name: 'English',
    nameEnglish: 'English',
    script: 'Latin',
    direction: 'ltr',
    isPrimary: false,
    isAuthoritative: false,
    note: 'Interpretive - not literal translation',
  },
  hi: {
    code: 'hi',
    name: 'हिन्दी',
    nameEnglish: 'Hindi',
    script: 'Devanagari',
    direction: 'ltr',
    isPrimary: false,
    isAuthoritative: false,
  },
} as const;

/**
 * Multilingual content container
 * Punjabi (Gurmukhi) is always required
 */
export interface MultilingualText {
  /** ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ) - Required, authoritative */
  pa: string;
  /** Punjabi in Roman script - Optional, phonetic only */
  paRoman?: string;
  /** English - Optional, interpretive */
  en?: string;
  /** Hindi - Optional */
  hi?: string;
}

/**
 * Interpretation text - explicitly marked as non-literal
 */
export interface InterpretationText {
  /** The interpretation text */
  text: string;
  /** Source teeka/scholar */
  source: string;
  /** Year of interpretation if known */
  year?: number;
  /** Explicit note that this is interpretation */
  isInterpretation: true;
}

// ============================================================================
// SOURCE & ATTRIBUTION
// ============================================================================

export type SourceType = 
  | 'PRIMARY'           // Direct historical documents, Gurbani
  | 'SECONDARY'         // Academic works, historical analyses  
  | 'TEEKA'             // Gurbani interpretations/commentaries
  | 'ORAL_TRADITION'    // Recorded oral histories
  | 'CONTEMPORARY';     // Modern documentation (evolving)

export interface Source {
  id: string;
  title: MultilingualText;
  author?: MultilingualText;
  sourceType: SourceType;
  yearComposed?: number;
  yearPublished?: number;
  publisher?: string;
  reliabilityNotes?: string;
  caveats?: string;
}

export interface Citation {
  sourceId: string;
  volume?: string;
  chapter?: string;
  page?: string;
  verse?: string;
  originalQuote?: string;
  accessNotes?: string;
}

// ============================================================================
// GURBANI MODULE TYPES
// ============================================================================

export interface Raag {
  id: string;
  name: MultilingualText;
  orderInGranth: number;
  angStart: number;
  angEnd: number;
  timeOfDay?: string;
  season?: string;
  mood?: string;
  description?: MultilingualText;
}

export interface BaniAuthor {
  id: string;
  name: MultilingualText;
  isGuru: boolean;
  guruNumber?: number;
  isBhagat: boolean;
  birthYear?: number;
  deathYear?: number;
  region?: string;
  biography?: MultilingualText;
}

export interface Shabad {
  id: string;
  angNumber: number;
  raag: Raag;
  author: BaniAuthor;
  shabadNumber: number;
  panktis: Pankti[];
}

export interface Pankti {
  id: string;
  shabadId: string;
  lineNumber: number;
  /** The sacred Gurmukhi text - AUTHORITATIVE */
  gurmukhiUnicode: string;
  /** ASCII encoding for legacy systems */
  gurmukhiAscii?: string;
  /** Romanized transliteration (phonetic aid only) */
  transliteration?: string;
  /** Pause positions for correct recitation */
  vishraamPositions?: number[];
  /** Interpretations from various Teekas */
  interpretations: TeekaInterpretation[];
}

/**
 * Interpretation from a named Teeka
 * CRITICAL: Never merged, always attributed
 */
export interface TeekaInterpretation {
  id: string;
  panktiId: string;
  /** Source teeka - MANDATORY */
  source: Source;
  /** Punjabi meaning (arth) */
  arthPunjabi?: string;
  /** Hindi meaning */
  arthHindi?: string;
  /** 
   * English meaning - NEVER called "translation"
   * Always labeled as interpretation
   */
  meaningEnglish?: string;
  /** Extended explanation in Punjabi */
  viakhyaPunjabi?: string;
  /** Extended explanation in English */
  viakhyaEnglish?: string;
  /** Word-by-word meanings */
  padArth?: PadArth[];
  /** Additional scholarly notes */
  notes?: string;
  /** Verification status */
  status: ContentStatus;
  /** Who verified this interpretation */
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface PadArth {
  word: string;
  meaning: string;
  grammaticalNote?: string;
}

// ============================================================================
// HISTORY (ITIHAAS) MODULE TYPES
// ============================================================================

export type HistoricalEra =
  | 'GURU_PERIOD'          // 1469-1708
  | 'KHALSA_ESTABLISHMENT' // 1699-1716
  | 'MISL_PERIOD'          // 1716-1799
  | 'SIKH_EMPIRE'          // 1799-1849
  | 'COLONIAL_PERIOD'      // 1849-1947
  | 'POST_INDEPENDENCE'    // 1947-1984
  | 'MODERN_PERIOD'        // 1984-present
  | 'CONTEMPORARY';        // Ongoing (clearly marked)

export interface Era {
  id: string;
  name: MultilingualText;
  eraType: HistoricalEra;
  yearStart: number;
  yearEnd?: number;
  description?: MultilingualText;
  isOngoing: boolean;
  periods: Period[];
}

export interface Period {
  id: string;
  eraId: string;
  name: MultilingualText;
  yearStart: number;
  yearEnd?: number;
  description?: MultilingualText;
  events: HistoricalEvent[];
}

export type DatePrecision = 'exact' | 'year' | 'approximate' | 'disputed';

export interface HistoricalDate {
  type: DatePrecision;
  yearStart: number;
  monthStart?: number;
  dayStart?: number;
  yearEnd?: number;
  notes?: string;
}

export interface HistoricalEvent {
  id: string;
  periodId: string;
  title: MultilingualText;
  date: HistoricalDate;
  description: MultilingualText;
  location?: string;
  locationDetails?: string;
  /** Source citations - MANDATORY */
  citations: Citation[];
  /** Key figures involved */
  figures: HistoricalFigureRole[];
  /** Different scholarly interpretations - never merged */
  interpretations: EventInterpretation[];
  /** Content status */
  status: ContentStatus;
  /** Is this contemporary/ongoing history? */
  isContemporary: boolean;
  /** Warning for contemporary events */
  contemporaryNote?: string;
  /** Metadata */
  createdAt: Date;
  updatedAt: Date;
  lastReviewedAt?: Date;
  lastReviewedBy?: string;
}

export interface HistoricalFigure {
  id: string;
  name: MultilingualText;
  birthYear?: number;
  birthYearApprox?: boolean;
  deathYear?: number;
  deathYearApprox?: boolean;
  biography?: MultilingualText;
  isGuru: boolean;
  guruNumber?: number;
  status: ContentStatus;
}

export interface HistoricalFigureRole {
  figure: HistoricalFigure;
  role?: string;
}

/**
 * Different historical interpretations
 * CRITICAL: Never merged, always preserved separately
 */
export interface EventInterpretation {
  id: string;
  eventId: string;
  scholarName: string;
  workTitle: string;
  publicationYear?: number;
  interpretation: MultilingualText;
  isPrimarySource: boolean;
  isSecondary: boolean;
  perspectiveNotes?: string;
}

// ============================================================================
// CONTENT STATUS & GOVERNANCE
// ============================================================================

export type ContentStatus =
  | 'DRAFT'              // Being prepared
  | 'SCHOLARLY_REVIEW'   // Awaiting expert verification
  | 'PUBLISHED'          // Verified and live
  | 'REQUIRES_UPDATE'    // Flagged for revision
  | 'DISPUTED';          // Multiple conflicting sources

export interface ContentAuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'review';
  changeDetails?: Record<string, unknown>;
  authorId: string;
  authorName: string;
  reason?: string;
  createdAt: Date;
}

export interface ScholarlyReviewRequest {
  id: string;
  entityType: string;
  entityId: string;
  requestReason: string;
  requestedBy: string;
  status: 'pending' | 'in_review' | 'completed' | 'rejected';
  reviewerName?: string;
  reviewNotes?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

// ============================================================================
// DISCLAIMERS
// ============================================================================

export interface Disclaimer {
  id: string;
  key: string;
  text: MultilingualText;
  displayLocation: DisclaimerLocation;
  requiresAcknowledgement: boolean;
  isActive: boolean;
}

export type DisclaimerLocation =
  | 'gurbani_header'
  | 'gurbani_meaning'
  | 'history_general'
  | 'history_contemporary'
  | 'site_footer';

// ============================================================================
// UI/UX TYPES
// ============================================================================

export interface TimelineNode {
  type: 'era' | 'period' | 'event';
  id: string;
  title: MultilingualText;
  yearStart: number;
  yearEnd?: number;
  isContemporary: boolean;
  children?: TimelineNode[];
}

export interface GurbaniNavigation {
  currentAng: number;
  currentRaag: Raag;
  currentShabad: Shabad;
  totalAngs: 1430;
}

export interface SearchFilters {
  language?: Language;
  module: 'gurbani' | 'itihaas';
  era?: HistoricalEra;
  raag?: string;
  author?: string;
  yearRange?: {
    start: number;
    end: number;
  };
}
