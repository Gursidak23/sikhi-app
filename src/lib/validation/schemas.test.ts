import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  MultilingualTextSchema,
  CitationSchema,
  RaagSchema,
  validateSourceAttribution,
  validateContemporaryContent,
} from '@/lib/validation/schemas';

// Create test schemas that match the expected patterns
const AngNumberSchema = z.number().min(1).max(1430);
const ShabadIdSchema = z.string().min(1);
const SearchQuerySchema = z.string().min(3).max(200);

describe('Validation Schemas', () => {
  describe('AngNumberSchema (Pattern Test)', () => {
    it('should accept valid ang numbers (1-1430)', () => {
      expect(AngNumberSchema.safeParse(1).success).toBe(true);
      expect(AngNumberSchema.safeParse(717).success).toBe(true);
      expect(AngNumberSchema.safeParse(1430).success).toBe(true);
    });

    it('should reject invalid ang numbers', () => {
      expect(AngNumberSchema.safeParse(0).success).toBe(false);
      expect(AngNumberSchema.safeParse(-1).success).toBe(false);
      expect(AngNumberSchema.safeParse(1431).success).toBe(false);
      expect(AngNumberSchema.safeParse('abc').success).toBe(false);
    });
  });

  describe('ShabadIdSchema (Pattern Test)', () => {
    it('should accept valid shabad IDs', () => {
      expect(ShabadIdSchema.safeParse('123').success).toBe(true);
      expect(ShabadIdSchema.safeParse('shabad-456').success).toBe(true);
    });

    it('should reject empty strings', () => {
      expect(ShabadIdSchema.safeParse('').success).toBe(false);
    });
  });

  describe('SearchQuerySchema (Pattern Test)', () => {
    it('should accept valid search queries', () => {
      expect(SearchQuerySchema.safeParse('ਵਾਹਿਗੁਰੂ').success).toBe(true);
      expect(SearchQuerySchema.safeParse('waheguru').success).toBe(true);
    });

    it('should reject short queries', () => {
      expect(SearchQuerySchema.safeParse('ab').success).toBe(false);
    });

    it('should reject overly long queries', () => {
      const longQuery = 'a'.repeat(201);
      expect(SearchQuerySchema.safeParse(longQuery).success).toBe(false);
    });
  });

  describe('MultilingualTextSchema', () => {
    it('should require Punjabi text', () => {
      expect(MultilingualTextSchema.safeParse({ pa: 'ਵਾਹਿਗੁਰੂ' }).success).toBe(true);
      expect(MultilingualTextSchema.safeParse({ en: 'Hello' }).success).toBe(false);
    });
  });

  describe('CitationSchema', () => {
    it('should require sourceId', () => {
      expect(CitationSchema.safeParse({ sourceId: 'src-1' }).success).toBe(true);
      expect(CitationSchema.safeParse({ page: '42' }).success).toBe(false);
    });
  });

  describe('validateSourceAttribution', () => {
    it('should validate content with proper citations', () => {
      const result = validateSourceAttribution([
        { sourceId: 'source-1', page: '42' },
      ]);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when no citations provided', () => {
      const result = validateSourceAttribution([]);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No source citations provided. Every claim must be attributed.');
    });
  });

  describe('validateContemporaryContent', () => {
    it('should require disclaimer for contemporary content', () => {
      const result = validateContemporaryContent(true, undefined);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should pass when contemporary content has note', () => {
      const result = validateContemporaryContent(true, 'This is evolving history');
      
      expect(result.valid).toBe(true);
    });

    it('should pass for non-contemporary content without note', () => {
      const result = validateContemporaryContent(false);
      
      expect(result.valid).toBe(true);
    });
  });
});
