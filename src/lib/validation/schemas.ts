// ============================================================================
// CONTENT VALIDATION SCHEMAS
// ============================================================================
// Using Zod for runtime validation of all content
// Ensures data integrity and source attribution requirements
// ============================================================================

import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Multilingual text - Punjabi (Gurmukhi) is ALWAYS required
 */
export const MultilingualTextSchema = z.object({
  pa: z.string().min(1, 'Punjabi (Gurmukhi) text is required - this is authoritative'),
  paRoman: z.string().optional(),
  en: z.string().optional(),
  hi: z.string().optional(),
});

/**
 * Source types with descriptions
 */
export const SourceTypeSchema = z.enum([
  'PRIMARY',
  'SECONDARY', 
  'TEEKA',
  'ORAL_TRADITION',
  'CONTEMPORARY',
]);

/**
 * Content status for governance
 */
export const ContentStatusSchema = z.enum([
  'DRAFT',
  'SCHOLARLY_REVIEW',
  'PUBLISHED',
  'REQUIRES_UPDATE',
  'DISPUTED',
]);

// ============================================================================
// SOURCE & CITATION SCHEMAS
// ============================================================================

export const SourceSchema = z.object({
  id: z.string(),
  title: MultilingualTextSchema,
  author: MultilingualTextSchema.optional(),
  sourceType: SourceTypeSchema,
  yearComposed: z.number().optional(),
  yearPublished: z.number().optional(),
  publisher: z.string().optional(),
  reliabilityNotes: z.string().optional(),
  caveats: z.string().optional(),
});

export const CitationSchema = z.object({
  sourceId: z.string().min(1, 'Source attribution is mandatory'),
  volume: z.string().optional(),
  chapter: z.string().optional(),
  page: z.string().optional(),
  verse: z.string().optional(),
  originalQuote: z.string().optional(),
  accessNotes: z.string().optional(),
});

// ============================================================================
// GURBANI SCHEMAS
// ============================================================================

export const RaagSchema = z.object({
  id: z.string(),
  name: MultilingualTextSchema,
  orderInGranth: z.number().min(1).max(31),
  angStart: z.number().min(1).max(1430),
  angEnd: z.number().min(1).max(1430),
  timeOfDay: z.string().optional(),
  season: z.string().optional(),
  mood: z.string().optional(),
  description: MultilingualTextSchema.optional(),
});

export const BaniAuthorSchema = z.object({
  id: z.string(),
  name: MultilingualTextSchema,
  isGuru: z.boolean(),
  guruNumber: z.number().min(1).max(10).optional(),
  isBhagat: z.boolean(),
  birthYear: z.number().optional(),
  deathYear: z.number().optional(),
  region: z.string().optional(),
  biography: MultilingualTextSchema.optional(),
});

export const PadArthSchema = z.object({
  word: z.string().min(1),
  meaning: z.string().min(1),
  grammaticalNote: z.string().optional(),
});

/**
 * Teeka Interpretation - requires source attribution
 */
export const TeekaInterpretationSchema = z.object({
  id: z.string(),
  panktiId: z.string(),
  // SOURCE IS MANDATORY - no anonymous interpretations
  source: SourceSchema,
  arthPunjabi: z.string().optional(),
  arthHindi: z.string().optional(),
  // NEVER called "translation" - always "meaning/interpretation"
  meaningEnglish: z.string().optional(),
  viakhyaPunjabi: z.string().optional(),
  viakhyaEnglish: z.string().optional(),
  padArth: z.array(PadArthSchema).optional(),
  notes: z.string().optional(),
  status: ContentStatusSchema,
  verifiedBy: z.string().optional(),
  verifiedAt: z.date().optional(),
}).refine(
  (data: { arthPunjabi?: string; meaningEnglish?: string }) => data.arthPunjabi || data.meaningEnglish,
  { message: 'At least Punjabi arth or English meaning is required' }
);

export const PanktiSchema = z.object({
  id: z.string(),
  shabadId: z.string(),
  lineNumber: z.number().min(1),
  // Gurmukhi is AUTHORITATIVE
  gurmukhiUnicode: z.string().min(1, 'Gurmukhi text is required'),
  gurmukhiAscii: z.string().optional(),
  transliteration: z.string().optional(),
  vishraamPositions: z.array(z.number()).optional(),
  interpretations: z.array(TeekaInterpretationSchema),
});

export const ShabadSchema = z.object({
  id: z.string(),
  angNumber: z.number().min(1).max(1430),
  raag: RaagSchema,
  author: BaniAuthorSchema,
  shabadNumber: z.number().min(1),
  panktis: z.array(PanktiSchema).min(1),
});

// ============================================================================
// HISTORY (ITIHAAS) SCHEMAS
// ============================================================================

export const HistoricalEraTypeSchema = z.enum([
  'GURU_PERIOD',
  'KHALSA_ESTABLISHMENT',
  'MISL_PERIOD',
  'SIKH_EMPIRE',
  'COLONIAL_PERIOD',
  'POST_INDEPENDENCE',
  'MODERN_PERIOD',
  'CONTEMPORARY',
]);

export const DatePrecisionSchema = z.enum([
  'exact',
  'year',
  'approximate',
  'disputed',
]);

export const HistoricalDateSchema = z.object({
  type: DatePrecisionSchema,
  yearStart: z.number(),
  monthStart: z.number().min(1).max(12).optional(),
  dayStart: z.number().min(1).max(31).optional(),
  yearEnd: z.number().optional(),
  notes: z.string().optional(),
});

export const HistoricalFigureSchema = z.object({
  id: z.string(),
  name: MultilingualTextSchema,
  birthYear: z.number().optional(),
  birthYearApprox: z.boolean().optional(),
  deathYear: z.number().optional(),
  deathYearApprox: z.boolean().optional(),
  biography: MultilingualTextSchema.optional(),
  isGuru: z.boolean(),
  guruNumber: z.number().min(1).max(10).optional(),
  status: ContentStatusSchema,
});

export const HistoricalFigureRoleSchema = z.object({
  figure: HistoricalFigureSchema,
  role: z.string().optional(),
});

/**
 * Event interpretation - never merged with others
 */
export const EventInterpretationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  // Source attribution is mandatory
  scholarName: z.string().min(1, 'Scholar name is required'),
  workTitle: z.string().min(1, 'Work title is required'),
  publicationYear: z.number().optional(),
  interpretation: MultilingualTextSchema,
  isPrimarySource: z.boolean(),
  isSecondary: z.boolean(),
  perspectiveNotes: z.string().optional(),
});

/**
 * Historical event - requires citations
 */
export const HistoricalEventSchema = z.object({
  id: z.string(),
  periodId: z.string(),
  title: MultilingualTextSchema,
  date: HistoricalDateSchema,
  description: MultilingualTextSchema,
  location: z.string().optional(),
  locationDetails: z.string().optional(),
  // CITATIONS ARE MANDATORY
  citations: z.array(CitationSchema).min(1, 'At least one source citation is required'),
  figures: z.array(HistoricalFigureRoleSchema),
  interpretations: z.array(EventInterpretationSchema),
  status: ContentStatusSchema,
  isContemporary: z.boolean(),
  contemporaryNote: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastReviewedAt: z.date().optional(),
  lastReviewedBy: z.string().optional(),
}).refine(
  (data: { isContemporary: boolean; contemporaryNote?: string }) => {
    // Contemporary events MUST have a warning note
    if (data.isContemporary && !data.contemporaryNote) {
      return false;
    }
    return true;
  },
  { message: 'Contemporary events must include a contemporaryNote disclaimer' }
);

export const PeriodSchema = z.object({
  id: z.string(),
  eraId: z.string(),
  name: MultilingualTextSchema,
  yearStart: z.number(),
  yearEnd: z.number().optional(),
  description: MultilingualTextSchema.optional(),
  events: z.array(HistoricalEventSchema),
});

export const EraSchema = z.object({
  id: z.string(),
  name: MultilingualTextSchema,
  eraType: HistoricalEraTypeSchema,
  yearStart: z.number(),
  yearEnd: z.number().optional(),
  description: MultilingualTextSchema.optional(),
  isOngoing: z.boolean(),
  periods: z.array(PeriodSchema),
});

// ============================================================================
// DISCLAIMER SCHEMAS
// ============================================================================

export const DisclaimerLocationSchema = z.enum([
  'gurbani_header',
  'gurbani_meaning',
  'history_general',
  'history_contemporary',
  'site_footer',
]);

export const DisclaimerSchema = z.object({
  id: z.string(),
  key: z.string(),
  text: MultilingualTextSchema,
  displayLocation: DisclaimerLocationSchema,
  requiresAcknowledgement: z.boolean(),
  isActive: z.boolean(),
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that content has proper source attribution
 */
export function validateSourceAttribution(
  citations: z.infer<typeof CitationSchema>[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (citations.length === 0) {
    errors.push('No source citations provided. Every claim must be attributed.');
  }
  
  for (const citation of citations) {
    if (!citation.sourceId) {
      errors.push('Citation missing source ID');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate contemporary content has proper disclaimers
 */
export function validateContemporaryContent(
  isContemporary: boolean,
  note?: string
): { valid: boolean; error?: string } {
  if (isContemporary && !note) {
    return {
      valid: false,
      error: 'Contemporary content must include a disclaimer noting that this information is evolving and not final.',
    };
  }
  return { valid: true };
}

/**
 * Validate Gurbani interpretation has teeka source
 */
export function validateTeekaAttribution(
  source: z.infer<typeof SourceSchema>
): { valid: boolean; error?: string } {
  if (source.sourceType !== 'TEEKA') {
    return {
      valid: false,
      error: 'Gurbani interpretations must be attributed to a named Teeka source.',
    };
  }
  return { valid: true };
}
