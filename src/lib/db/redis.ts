// ============================================================================
// HYBRID CACHE — Upstash Redis (production) + In-Memory (local dev)
// ============================================================================
// Auto-detects which backend to use:
//
//   • If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set → Redis
//   • Otherwise → in-memory Map with TTL + LRU eviction
//
// For Vercel:
//   1. Go to https://console.upstash.com → Create a free Redis database
//   2. Copy the REST URL and REST Token
//   3. In Vercel Dashboard → Settings → Environment Variables, add:
//        UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
//        UPSTASH_REDIS_REST_TOKEN=AXxx...
//
// For local dev: nothing needed — in-memory cache works automatically.
// ============================================================================

import { Redis } from '@upstash/redis';

// ============================================================================
// Backend detection
// ============================================================================

let redis: Redis | null = null;
let backendLogged = false;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  try {
    redis = new Redis({ url, token });
    if (!backendLogged) {
      console.log('[Cache] Using Upstash Redis');
      backendLogged = true;
    }
    return redis;
  } catch {
    return null;
  }
}

function useRedis(): boolean {
  return getRedis() !== null;
}

// ============================================================================
// In-memory fallback
// ============================================================================

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
}

const MAX_ENTRIES = 500;
const store = new Map<string, CacheEntry>();

function evictExpired(): void {
  const now = Date.now();
  // Iterate without copying entire array — break early after a batch
  let cleaned = 0;
  for (const [key, entry] of Array.from(store.entries())) {
    if (entry.expiresAt <= now) {
      store.delete(key);
      cleaned++;
    }
    if (cleaned >= 50) break; // Limit per cleanup to avoid blocking
  }
}

function evictLRU(): void {
  if (store.size <= MAX_ENTRIES) return;
  // True LRU: Map preserves insertion order; cacheGet re-inserts on access
  const excess = store.size - MAX_ENTRIES;
  const keys = store.keys();
  for (let i = 0; i < excess; i++) {
    const { value: key } = keys.next();
    if (key) store.delete(key);
  }
}

// Log once which backend is active
function logMemory(): void {
  if (!backendLogged) {
    console.log('[Cache] Using in-memory (no Redis env vars found)');
    backendLogged = true;
  }
}

// ============================================================================
// Unified Cache API
// ============================================================================

const PREFIX = 'sikhi:';

/**
 * Get a cached value. Returns null if key doesn't exist or has expired.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis();
    if (r) {
      const val = await r.get<T>(`${PREFIX}${key}`);
      return val ?? null;
    }

    // In-memory fallback
    logMemory();
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      store.delete(key);
      return null;
    }
    // True LRU: re-insert to move to end (most recently used)
    store.delete(key);
    store.set(key, entry);
    return entry.value as T;
  } catch {
    return null;
  }
}

/**
 * Set a cached value with TTL (seconds).
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const r = getRedis();
    if (r) {
      await r.set(`${PREFIX}${key}`, value, { ex: ttlSeconds });
      return;
    }

    // In-memory fallback
    logMemory();
    evictExpired();
    store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    evictLRU();
  } catch {
    // Non-critical
  }
}

/**
 * Delete cached keys (for cache invalidation).
 */
export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    const r = getRedis();
    if (r) {
      await r.del(...keys.map((k) => `${PREFIX}${k}`));
      return;
    }

    // In-memory fallback
    for (const key of keys) {
      store.delete(key);
    }
  } catch {
    // Non-critical
  }
}

/**
 * Delete all keys matching a pattern (e.g. "community:msgs:*").
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const r = getRedis();
    if (r) {
      // Redis SCAN-based deletion
      let cursor = 0;
      let done = false;
      while (!done) {
        const result = await r.scan(cursor, {
          match: `${PREFIX}${pattern}`,
          count: 100,
        });
        const nextCursor = Number(result[0]);
        const foundKeys = result[1] as string[];
        cursor = nextCursor;
        if (foundKeys.length > 0) {
          await r.del(...foundKeys);
        }
        done = cursor === 0;
      }
      return;
    }

    // In-memory fallback — supports trailing * wildcard
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      Array.from(store.keys()).forEach((key) => {
        if (key.startsWith(prefix)) {
          store.delete(key);
        }
      });
    } else {
      store.delete(pattern);
    }
  } catch {
    // Non-critical
  }
}

// ============================================================================
// Community-specific Cache Keys & TTLs
// ============================================================================

export const CACHE_KEYS = {
  rooms: () => 'community:rooms',
  messages: (roomId: string) => `community:msgs:${roomId}`,
  members: (roomId: string) => `community:members:${roomId}`,
  room: (roomId: string) => `community:room:${roomId}`,
} as const;

export const CACHE_TTL = {
  rooms: 60,
  messages: 5,
  members: 15,
  room: 30,
} as const;
