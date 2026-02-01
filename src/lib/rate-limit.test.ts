import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimit, getClientIdentifier, rateLimitHeaders } from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('rateLimit', () => {
    it('should allow requests under the limit', () => {
      const result = rateLimit('test-user-1', { limit: 5, windowSeconds: 60 });
      
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
    });

    it('should decrement remaining count with each request', () => {
      const config = { limit: 5, windowSeconds: 60 };
      
      const result1 = rateLimit('test-user-2', config);
      expect(result1.remaining).toBe(4);
      
      const result2 = rateLimit('test-user-2', config);
      expect(result2.remaining).toBe(3);
      
      const result3 = rateLimit('test-user-2', config);
      expect(result3.remaining).toBe(2);
    });

    it('should block requests over the limit', () => {
      const config = { limit: 2, windowSeconds: 60 };
      
      rateLimit('test-user-3', config);
      rateLimit('test-user-3', config);
      const result = rateLimit('test-user-3', config);
      
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
      const config = { limit: 2, windowSeconds: 60 };
      
      rateLimit('test-user-4', config);
      rateLimit('test-user-4', config);
      
      // Advance time past the window
      vi.advanceTimersByTime(61 * 1000);
      
      const result = rateLimit('test-user-4', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should track different users separately', () => {
      const config = { limit: 2, windowSeconds: 60 };
      
      rateLimit('user-a', config);
      rateLimit('user-a', config);
      
      const resultA = rateLimit('user-a', config);
      const resultB = rateLimit('user-b', config);
      
      expect(resultA.success).toBe(false);
      expect(resultB.success).toBe(true);
    });
  });

  describe('getClientIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://test.com', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      });
      
      expect(getClientIdentifier(request)).toBe('192.168.1.1');
    });

    it('should use x-real-ip as fallback', () => {
      const request = new Request('http://test.com', {
        headers: { 'x-real-ip': '192.168.1.2' },
      });
      
      expect(getClientIdentifier(request)).toBe('192.168.1.2');
    });

    it('should return localhost as default', () => {
      const request = new Request('http://test.com');
      
      expect(getClientIdentifier(request)).toBe('localhost');
    });
  });

  describe('rateLimitHeaders', () => {
    it('should return correct headers', () => {
      const result = {
        success: true,
        limit: 60,
        remaining: 55,
        resetTime: Date.now() + 60000,
      };
      
      const headers = rateLimitHeaders(result);
      
      expect(headers['X-RateLimit-Limit']).toBe('60');
      expect(headers['X-RateLimit-Remaining']).toBe('55');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
    });
  });
});
