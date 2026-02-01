import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, ErrorFallback, ApiError } from '@/components/common/ErrorBoundary';

describe('Error Components', () => {
  describe('ErrorFallback', () => {
    it('renders error message in English', () => {
      render(
        <ErrorFallback 
          title="Something went wrong" 
          message="Please try again" 
          language="en"
        />
      );
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Please try again')).toBeInTheDocument();
    });

    it('renders error message in Punjabi', () => {
      render(
        <ErrorFallback 
          title="ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ" 
          message="ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ" 
          language="pa"
        />
      );
      
      expect(screen.getByText('ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ')).toBeInTheDocument();
    });

    it('renders with action button when provided', () => {
      const mockAction = vi.fn();
      
      render(
        <ErrorFallback 
          title="Error" 
          message="An error occurred"
          action={{ label: 'Retry', onClick: mockAction }}
          language="en"
        />
      );
      
      const button = screen.getByText('Retry');
      expect(button).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(mockAction).toHaveBeenCalled();
    });

    it('renders different types of errors', () => {
      const { rerender } = render(
        <ErrorFallback 
          title="Error" 
          message="Error message"
          type="error"
          language="en"
        />
      );
      
      expect(document.querySelector('.text-red-500, .bg-red-100')).toBeInTheDocument();
      
      rerender(
        <ErrorFallback 
          title="Not Found" 
          message="Page not found"
          type="notFound"
          language="en"
        />
      );
      
      // NotFound should have different styling
      expect(screen.getByText('Not Found')).toBeInTheDocument();
    });
  });

  describe('ApiError', () => {
    it('shows 404 error message', () => {
      render(
        <ApiError 
          error={{ status: 404, message: 'Not found' }}
          language="en"
        />
      );
      
      expect(screen.getByText(/not found/i)).toBeInTheDocument();
    });

    it('shows 429 rate limit error', () => {
      render(
        <ApiError 
          error={{ status: 429, message: 'Rate limit' }}
          language="en"
        />
      );
      
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });

    it('shows 500 server error', () => {
      render(
        <ApiError 
          error={{ status: 500, message: 'Server error' }}
          language="en"
        />
      );
      
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });

    it('shows retry button when onRetry provided', () => {
      const mockRetry = vi.fn();
      
      render(
        <ApiError 
          error={{ status: 500, message: 'Error' }}
          onRetry={mockRetry}
          language="en"
        />
      );
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe('ErrorBoundary', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    it('catches errors and displays fallback', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary language="en">
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('renders children when no error', () => {
      render(
        <ErrorBoundary language="en">
          <div>Test content</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });
});
