/**
 * Health Check Endpoint
 * Used by load balancers and monitoring to verify app + DB are operational
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { logApiError } from '@/lib/error-tracking';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  
  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        latencyMs: dbLatency,
      },
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache' },
    });
  } catch (error) {
    logApiError('/api/health', error instanceof Error ? error : new Error(String(error)), 503);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          status: 'disconnected',
          error: 'Database connection failed',
        },
      },
      { status: 503 }
    );
  }
}
