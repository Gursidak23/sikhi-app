import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  Skeleton, 
  GurbaniSkeleton, 
  TimelineSkeleton,
  PageLoader,
  Spinner 
} from '@/components/common/LoadingStates';

describe('Loading States', () => {
  describe('Skeleton', () => {
    it('renders with default styles', () => {
      render(<Skeleton />);
      
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<Skeleton className="w-full h-10" />);
      
      const skeleton = document.querySelector('.w-full');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('GurbaniSkeleton', () => {
    it('renders Gurbani-specific skeleton layout', () => {
      render(<GurbaniSkeleton />);
      
      // Should render multiple skeleton lines
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('TimelineSkeleton', () => {
    it('renders timeline skeleton layout', () => {
      render(<TimelineSkeleton />);
      
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('PageLoader', () => {
    it('renders with Punjabi message by default', () => {
      render(<PageLoader />);
      
      // Should show Punjabi loading message (default is Punjabi 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...')
      expect(screen.getByText('ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...')).toBeInTheDocument();
    });

    it('renders custom message', () => {
      render(<PageLoader message="Loading Data..." language="en" />);
      
      expect(screen.getByText('Loading Data...')).toBeInTheDocument();
    });
  });

  describe('Spinner', () => {
    it('renders small spinner', () => {
      const { container } = render(<Spinner size="sm" />);
      
      expect(container.querySelector('.w-4')).toBeInTheDocument();
    });

    it('renders medium spinner by default', () => {
      const { container } = render(<Spinner />);
      
      expect(container.querySelector('.w-6')).toBeInTheDocument();
    });

    it('renders large spinner', () => {
      const { container } = render(<Spinner size="lg" />);
      
      expect(container.querySelector('.w-8')).toBeInTheDocument();
    });
  });
});
