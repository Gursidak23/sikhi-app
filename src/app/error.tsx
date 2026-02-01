'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream-50 to-white">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-gurmukhi text-neutral-900 mb-2">
          ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ
        </h1>
        
        <p className="text-lg text-neutral-600 mb-4">
          Something went wrong
        </p>

        <p className="text-sm text-neutral-500 mb-8">
          We apologize for the inconvenience. Please try again.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-kesri-500 text-white rounded-lg font-medium hover:bg-kesri-600 transition-colors"
          >
            ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ / Try Again
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            Go Home
          </Link>
        </div>

        {/* Supportive Message */}
        <div className="mt-12 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="font-gurmukhi text-amber-800">
            ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ ਕਰਨਾ
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Please forgive any errors
          </p>
        </div>
      </div>
    </div>
  );
}
