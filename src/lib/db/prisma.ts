// ============================================================================
// PRISMA DATABASE CLIENT
// ============================================================================
// Singleton pattern for Prisma client to prevent connection exhaustion
// ============================================================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

// Cache globally in all environments to prevent connection exhaustion
globalForPrisma.prisma = prisma;

export default prisma;
