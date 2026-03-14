/**
 * API Base URL utility for Capacitor builds
 *
 * In the web app, API calls use relative paths (e.g., `/api/gurbani/...`).
 * In the Capacitor Android app (static export), there's no server —
 * so API calls must be prefixed with the production backend URL.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * Returns the full URL for an API route.
 * - Web: `/api/community/messages` (relative, hits same origin)
 * - Capacitor: `https://shabad-itehas.vercel.app/api/community/messages`
 */
export function apiUrl(path: string): string {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
}
