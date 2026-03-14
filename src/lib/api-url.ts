/**
 * API Base URL utility for Capacitor builds
 *
 * In the web app, API calls use relative paths (e.g., `/api/gurbani/...`).
 * In the Capacitor Android app (static export), there's no server —
 * so API calls go directly to BaniDB API.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * Returns the full URL for an API route.
 * - Web: `/api/community/messages` (relative, hits same origin)
 * - Capacitor: prefixed with NEXT_PUBLIC_API_BASE_URL if set
 */
export function apiUrl(path: string): string {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
}
