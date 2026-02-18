/**
 * Resilient Fetch — Retry, Timeout, Circuit Breaker
 * ============================================================================
 * Wraps fetch() with production-grade resilience patterns:
 * - Configurable timeout (default: 10s)
 * - Exponential backoff retry (default: 3 attempts)
 * - Circuit breaker to avoid hammering a dead API
 * - Request deduplication (same URL won't fire twice simultaneously)
 * ============================================================================
 */

interface ResilientFetchOptions {
  /** Max retries (default: 3) */
  retries?: number;
  /** Initial retry delay in ms (default: 1000, doubles each retry) */
  retryDelay?: number;
  /** Request timeout in ms (default: 10000) */
  timeout?: number;
  /** Cache key for deduplication (default: url) */
  dedupeKey?: string;
}

// Circuit breaker state
const circuitBreaker = {
  failures: 0,
  lastFailure: 0,
  isOpen: false,
  threshold: 5,         // Open after 5 consecutive failures
  resetTimeout: 30000,  // Try again after 30s
};

// In-flight request deduplication
const inFlight = new Map<string, Promise<Response>>();

function checkCircuitBreaker(): boolean {
  if (!circuitBreaker.isOpen) return false;
  
  // Check if enough time has passed to try again (half-open state)
  if (Date.now() - circuitBreaker.lastFailure > circuitBreaker.resetTimeout) {
    circuitBreaker.isOpen = false;
    circuitBreaker.failures = 0;
    return false;
  }
  
  return true;
}

function recordSuccess(): void {
  circuitBreaker.failures = 0;
  circuitBreaker.isOpen = false;
}

function recordFailure(): void {
  circuitBreaker.failures++;
  circuitBreaker.lastFailure = Date.now();
  if (circuitBreaker.failures >= circuitBreaker.threshold) {
    circuitBreaker.isOpen = true;
    console.warn(`[Circuit Breaker] OPEN — ${circuitBreaker.failures} consecutive failures. Will retry in ${circuitBreaker.resetTimeout / 1000}s.`);
  }
}

/**
 * Fetch with timeout support using AbortController
 */
function fetchWithTimeout(url: string, init: RequestInit | undefined, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  
  return fetch(url, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Sleep for exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Resilient fetch with retry, timeout, circuit breaker, and deduplication
 */
export async function resilientFetch(
  url: string,
  init?: RequestInit,
  options: ResilientFetchOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    dedupeKey,
  } = options;

  const key = dedupeKey || url;

  // Check circuit breaker
  if (checkCircuitBreaker()) {
    throw new Error('Circuit breaker is open — BaniDB API appears to be down. Will retry automatically.');
  }

  // Deduplicate in-flight requests
  const existing = inFlight.get(key);
  if (existing) {
    return existing.then(r => r.clone());
  }

  const attempt = async (): Promise<Response> => {
    let lastError: Error | null = null;

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetchWithTimeout(url, init, timeout);
        
        if (response.ok) {
          recordSuccess();
          return response;
        }

        // Don't retry 4xx errors (client errors) except 429 (rate limit)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          recordSuccess(); // Not a server failure
          return response;
        }

        // For 429, respect Retry-After header
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * Math.pow(2, i);
          await sleep(waitMs);
          continue;
        }

        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry if aborted by user (not timeout)
        if (lastError.name === 'AbortError' && i === 0) {
          // First attempt timeout - retry
        } else if (lastError.name === 'AbortError') {
          // Subsequent timeout - might be genuinely slow
        }
      }

      // Exponential backoff before retry
      if (i < retries) {
        const delay = retryDelay * Math.pow(2, i) + Math.random() * 500;
        await sleep(delay);
      }
    }

    // All retries exhausted
    recordFailure();
    throw lastError || new Error(`Failed to fetch ${url} after ${retries + 1} attempts`);
  };

  const promise = attempt();
  inFlight.set(key, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    inFlight.delete(key);
  }
}

/**
 * Get circuit breaker status (for UI display)
 */
export function getApiHealthStatus(): {
  healthy: boolean;
  failures: number;
  circuitOpen: boolean;
} {
  return {
    healthy: !circuitBreaker.isOpen && circuitBreaker.failures < 2,
    failures: circuitBreaker.failures,
    circuitOpen: circuitBreaker.isOpen,
  };
}

/**
 * Reset circuit breaker (e.g., when user manually retries)
 */
export function resetCircuitBreaker(): void {
  circuitBreaker.failures = 0;
  circuitBreaker.isOpen = false;
  circuitBreaker.lastFailure = 0;
}
