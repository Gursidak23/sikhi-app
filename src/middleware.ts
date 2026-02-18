/**
 * Next.js Middleware
 * Handles CORS preflight, security, and request tracing
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Allowed origins for API requests */
function getAllowedOrigins(): string[] {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return [
    appUrl,
    'http://localhost:3000',
    'http://localhost:3001',
  ].map((u) => u.replace(/\/$/, ''));
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests don't send Origin header
  const allowed = getAllowedOrigins();
  return allowed.some((o) => origin === o || origin.endsWith('.vercel.app'));
}

function addCorsHeaders(response: NextResponse, origin: string | null) {
  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : getAllowedOrigins()[0];
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // Handle CORS preflight (OPTIONS) for all API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const preflight = new NextResponse(null, { status: 204 });
    return addCorsHeaders(preflight, origin);
  }

  const response = NextResponse.next();

  // Add CORS headers to API responses
  if (pathname.startsWith('/api/')) {
    addCorsHeaders(response, origin);
  }

  // Add request ID for tracing
  response.headers.set('X-Request-Id', crypto.randomUUID());

  // Block known bots from API (except health check)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/health')) {
    const userAgent = request.headers.get('user-agent') || '';
    if (/bot|crawl|spider|scrape/i.test(userAgent)) {
      return addCorsHeaders(
        NextResponse.json({ error: 'Bot access to API is not permitted' }, { status: 403 }),
        origin
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|robots.txt|sw.js).*)',
  ],
};
