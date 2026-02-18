/**
 * Next.js Middleware
 * Handles global security, rate limiting indicators, and request logging
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('X-Request-Id', requestId);
  
  // Block API crawling
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/api/health')) {
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = /bot|crawl|spider|scrape/i.test(userAgent);
    if (isBot) {
      return NextResponse.json(
        { error: 'Bot access to API is not permitted' },
        { status: 403 }
      );
    }
  }

  // Add security headers for community chat POST routes
  if (request.method === 'POST' && request.nextUrl.pathname.startsWith('/api/community/')) {
    const origin = request.headers.get('origin');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Only allow requests from our own origin
    if (origin && !appUrl.includes(new URL(origin).hostname)) {
      return NextResponse.json(
        { error: 'Cross-origin requests not allowed' },
        { status: 403 }
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
