// ============================================================================
// RATE LIMITING
// ============================================================================
// Simple in-memory rate limiter for API routes
// WARNING: Not production safe — resets on serverless cold start. Use Redis or distributed store for production.
// For production, consider using Redis-based solutions like @upstash/ratelimit
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const MAX_RATE_LIMIT_ENTRIES = 10000; // Prevent unbounded memory growth

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address, API key, etc.)
 * @param config - Rate limit configuration
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 60, windowSeconds: 60 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = `${identifier}`;

  const existing = rateLimitStore.get(key);

  // If no existing entry or window has passed, create new entry
  if (!existing || now > existing.resetTime) {
    // Enforce max size to prevent unbounded growth from many IPs
    if (rateLimitStore.size >= MAX_RATE_LIMIT_ENTRIES) {
      // Evict oldest entries
      const keys = rateLimitStore.keys();
      for (let i = 0; i < 1000; i++) {
        const { value: k } = keys.next();
        if (k) rateLimitStore.delete(k);
        else break;
      }
    }
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime,
    };
  }

  // Increment count
  existing.count++;
  rateLimitStore.set(key, existing);

  // Check if over limit
  if (existing.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - existing.count,
    resetTime: existing.resetTime,
  };
}

/**
 * Get client identifier from request headers
 * Uses X-Forwarded-For for proxied requests, falls back to a default
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback for development
  return 'localhost';
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
  };
}
