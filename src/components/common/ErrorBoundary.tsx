'use client';

// ============================================================================
// ERROR BOUNDARY
// ============================================================================
// Graceful error handling for React components
// Catches JavaScript errors and displays fallback UI
// ============================================================================

import React from 'react';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  language?: 'pa' | 'en';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isPunjabi = this.props.language === 'pa';

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            {/* Error icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Error message */}
            <h2 className={cn(
              'text-xl font-semibold text-gray-900 mb-2',
              isPunjabi && 'font-gurmukhi'
            )}>
              {isPunjabi ? 'ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ' : 'Something went wrong'}
            </h2>

            <p className="text-gray-600 mb-6">
              {isPunjabi
                ? 'ਕਿਰਪਾ ਕਰਕੇ ਪੰਨਾ ਦੁਬਾਰਾ ਲੋਡ ਕਰੋ ਜਾਂ ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।'
                : 'Please refresh the page or try again later.'}
            </p>

            {/* Retry button */}
            <button
              onClick={() => window.location.reload()}
              className={cn(
                'px-6 py-3 rounded-lg font-medium',
                'bg-kesri-500 text-white hover:bg-kesri-600',
                'transition-colors'
              )}
            >
              {isPunjabi ? 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ' : 'Try Again'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// ERROR FALLBACK COMPONENT
// ============================================================================

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  language?: 'pa' | 'en';
  type?: 'error' | 'empty' | 'notFound';
}

export function ErrorFallback({
  title,
  message,
  action,
  language = 'en',
  type = 'error'
}: ErrorFallbackProps) {
  const isPunjabi = language === 'pa';

  const defaultContent = {
    error: {
      title: isPunjabi ? 'ਗਲਤੀ' : 'Error',
      message: isPunjabi ? 'ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ' : 'Something went wrong',
      icon: (
        <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100'
    },
    empty: {
      title: isPunjabi ? 'ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ' : 'No Results',
      message: isPunjabi ? 'ਕੋਈ ਡੇਟਾ ਨਹੀਂ ਮਿਲਿਆ' : 'No data found',
      icon: (
        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
      bgColor: 'bg-gray-50',
      iconBg: 'bg-gray-100'
    },
    notFound: {
      title: isPunjabi ? 'ਨਹੀਂ ਲੱਭਿਆ' : 'Not Found',
      message: isPunjabi ? 'ਇਹ ਪੰਨਾ ਮੌਜੂਦ ਨਹੀਂ ਹੈ' : 'This page does not exist',
      icon: (
        <svg className="w-12 h-12 text-neela-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-neela-50',
      iconBg: 'bg-neela-100'
    }
  };

  const content = defaultContent[type];

  return (
    <div className={cn('rounded-xl p-8 text-center', content.bgColor)}>
      <div className={cn(
        'w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center',
        content.iconBg
      )}>
        {content.icon}
      </div>

      <h3 className={cn(
        'text-lg font-semibold text-gray-900 mb-2',
        isPunjabi && 'font-gurmukhi'
      )}>
        {title || content.title}
      </h3>

      <p className={cn(
        'text-gray-600 mb-4',
        isPunjabi && 'font-gurmukhi'
      )}>
        {message || content.message}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm',
            'bg-neela-600 text-white hover:bg-neela-700',
            'transition-colors'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// API ERROR DISPLAY
// ============================================================================

interface ApiErrorProps {
  error: {
    message?: string;
    status?: number;
    code?: string;
  };
  onRetry?: () => void;
  language?: 'pa' | 'en';
}

export function ApiError({ error, onRetry, language = 'en' }: ApiErrorProps) {
  const isPunjabi = language === 'pa';

  const getErrorMessage = () => {
    if (error.status === 404) {
      return isPunjabi ? 'ਡੇਟਾ ਨਹੀਂ ਮਿਲਿਆ' : 'Data not found';
    }
    if (error.status === 429) {
      return isPunjabi ? 'ਬਹੁਤ ਸਾਰੀਆਂ ਬੇਨਤੀਆਂ। ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕ ਕਰੋ।' : 'Too many requests. Please wait.';
    }
    if (error.status === 500) {
      return isPunjabi ? 'ਸਰਵਰ ਗਲਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਕੋਸ਼ਿਸ਼ ਕਰੋ।' : 'Server error. Please try later.';
    }
    return error.message || (isPunjabi ? 'ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ' : 'Something went wrong');
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm text-red-700',
            isPunjabi && 'font-gurmukhi'
          )}>
            {getErrorMessage()}
          </p>
          {error.code && (
            <p className="text-xs text-red-500 mt-1">
              Error code: {error.code}
            </p>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 text-sm font-medium text-red-600 hover:text-red-700"
          >
            {isPunjabi ? 'ਦੁਬਾਰਾ' : 'Retry'}
          </button>
        )}
      </div>
    </div>
  );
}
