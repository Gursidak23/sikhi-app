/**
 * Next.js Middleware
 * Handles CORS preflight, security headers, and request tracing
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Allowed origins — computed once at module level */
const ALLOWED_ORIGINS: string[] = (() => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
  const origins = [
    appUrl,
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  if (vercelUrl) origins.push(vercelUrl);
  return origins.map((u) => u.replace(/\/$/, '')).filter(Boolean);
})();

/** Bot detection regex — compiled once */
const BOT_REGEX = /bot|crawl|spider|scrape/i;

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((o) => origin === o);
}

function addCorsHeaders(response: NextResponse, origin: string | null) {
  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Session-Token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  // Prevent CDN/proxy cache poisoning — origin-dependent responses must vary
  response.headers.set('Vary', 'Origin');
  return response;
}

/** Add security headers to all responses */
function addSecurityHeaders(response: NextResponse) {
  // Prevent clickjacking — only allow same-origin framing
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  // Prevent MIME-type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // XSS protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // Control referrer information leakage
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict browser features
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  // HSTS — force HTTPS (1 year, include subdomains)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.banidb.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
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

  // Add security headers to ALL responses
  addSecurityHeaders(response);

  // Add CORS headers to API responses
  if (pathname.startsWith('/api/')) {
    addCorsHeaders(response, origin);
  }

  // Add request ID for tracing (API routes only — skip for static pages)
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Request-Id', crypto.randomUUID());
  }

  // Block known bots from API (except health check)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/health')) {
    const userAgent = request.headers.get('user-agent') || '';
    if (BOT_REGEX.test(userAgent)) {
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
