// ============================================================================
// ERROR TRACKING
// ============================================================================
// Centralized error tracking and logging
// Uses console logging by default
// Can be extended with Sentry or other services when installed
// ============================================================================

interface ErrorContext {
  /** Component or function name */
  component?: string;
  /** User action that triggered the error */
  action?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Error severity level */
  level?: 'error' | 'warning' | 'info';
}

interface ErrorTracker {
  captureException: (error: Error, context?: ErrorContext) => void;
  captureMessage: (message: string, context?: ErrorContext) => void;
  setUser: (user: { id?: string; email?: string }) => void;
}

// Helper to log to console with level
function logToConsole(level: 'error' | 'warning' | 'info', ...args: unknown[]): void {
  if (level === 'warning') {
    console.warn(...args);
  } else if (level === 'error') {
    console.error(...args);
  } else {
    console.log(...args);
  }
}

// Console-based tracker (production-ready)
const consoleTracker: ErrorTracker = {
  captureException: (error: Error, context?: ErrorContext) => {
    const level = context?.level || 'error';
    const prefix = `[${level.toUpperCase()}]`;
    const timestamp = new Date().toISOString();
    
    if (context?.component) {
      logToConsole(level, `${timestamp} ${prefix} [${context.component}]`, error.message, {
        stack: error.stack,
        action: context.action,
        ...context.metadata,
      });
    } else {
      logToConsole(level, `${timestamp} ${prefix}`, error.message, {
        stack: error.stack,
        action: context?.action,
        ...context?.metadata,
      });
    }
  },
  captureMessage: (message: string, context?: ErrorContext) => {
    const level = context?.level || 'info';
    const timestamp = new Date().toISOString();
    logToConsole(level, `${timestamp} [${level.toUpperCase()}]`, message, context);
  },
  setUser: () => {
    // No-op for console tracker
  },
};

// Active tracker (can be swapped with Sentry when installed)
let activeTracker: ErrorTracker = consoleTracker;

/**
 * Set a custom error tracker (e.g., Sentry integration)
 * Call this from your app initialization if using Sentry
 */
export function setErrorTracker(tracker: ErrorTracker): void {
  activeTracker = tracker;
}

// Get the current tracker
function getTracker(): ErrorTracker {
  return activeTracker;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Capture an exception and send to error tracking service
 */
export function captureException(error: Error, context?: ErrorContext): void {
  getTracker().captureException(error, context);
}

/**
 * Capture a message (for non-exception issues)
 */
export function captureMessage(message: string, context?: ErrorContext): void {
  getTracker().captureMessage(message, context);
}

/**
 * Set the current user for error tracking
 */
export function setErrorTrackingUser(user: { id?: string; email?: string }): void {
  getTracker().setUser(user);
}

/**
 * Log an API error with context
 */
export function logApiError(
  endpoint: string,
  error: Error,
  statusCode?: number
): void {
  captureException(error, {
    component: 'API',
    action: endpoint,
    metadata: { statusCode },
    level: statusCode && statusCode < 500 ? 'warning' : 'error',
  });
}

/**
 * Log a client-side error
 */
export function logClientError(
  component: string,
  error: Error,
  action?: string
): void {
  captureException(error, {
    component,
    action,
    level: 'error',
  });
}

/**
 * Create a wrapped function that automatically captures errors
 */
export function withErrorTracking<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context: ErrorContext
): T {
  return ((...args: unknown[]) => {
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.catch((error: Error) => {
          captureException(error, context);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      captureException(error as Error, context);
      throw error;
    }
  }) as T;
}
