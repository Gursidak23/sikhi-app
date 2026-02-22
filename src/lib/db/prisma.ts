// ============================================================================
// PRISMA DATABASE CLIENT
// ============================================================================
// Lazy singleton pattern for Prisma client
// - Prevents crash at import time when DATABASE_URL is not set
// - Prevents connection exhaustion via global caching
// ============================================================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Returns the cached PrismaClient singleton, creating it on first access.
 * Throws a clear error if DATABASE_URL is missing or malformed.
 */
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Add it in your Vercel project → Settings → Environment Variables, then redeploy.'
    );
  }
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    throw new Error(
      `DATABASE_URL must start with "postgresql://" or "postgres://". ` +
      `Current value starts with "${url.substring(0, 20)}…". ` +
      'Fix the value in Vercel → Settings → Environment Variables, then redeploy.'
    );
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
    datasourceUrl: url.includes('connection_limit=')
      ? url
      : `${url}${url.includes('?') ? '&' : '?'}connection_limit=5`,
  });

  globalForPrisma.prisma = client;
  return client;
}

/**
 * Lazy Prisma proxy — any property access creates the client on demand.
 * This prevents module-level crashes when DATABASE_URL is absent.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export default prisma;
