// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================
// Validates required environment variables at startup
// Provides type-safe access to environment variables
// ============================================================================

import { z } from 'zod';

const envSchema = z.object({
  // Database (Required in production)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().optional().default('ਸਿੱਖੀ ਵਿੱਦਿਆ'),

  // BaniDB API
  BANIDB_API_URL: z.string().url().optional().default('https://api.banidb.com/v2'),

  // Error Tracking
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_REQUESTS_PER_MINUTE: z.string().optional().default('60'),

  // Cache TTL
  CACHE_TTL_GURBANI: z.string().optional().default('3600'),
  CACHE_TTL_HISTORY: z.string().optional().default('1800'),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_OFFLINE: z.string().optional().default('false'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().optional().default('false'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map(e => e.path.join('.')).join(', ');
      console.error(`❌ Missing or invalid environment variables: ${missing}`);
      
      // In development, continue with defaults
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Running with default values in development mode');
        return envSchema.parse({
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/sikhi',
        });
      }
      
      throw new Error(`Environment validation failed: ${missing}`);
    }
    throw error;
  }
}

export const env = validateEnv();

// Helper functions
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}

export function getRateLimitConfig() {
  return {
    limit: parseInt(env.RATE_LIMIT_REQUESTS_PER_MINUTE, 10),
    windowSeconds: 60,
  };
}

export function getCacheTTL(type: 'gurbani' | 'history'): number {
  if (type === 'gurbani') {
    return parseInt(env.CACHE_TTL_GURBANI, 10);
  }
  return parseInt(env.CACHE_TTL_HISTORY, 10);
}
