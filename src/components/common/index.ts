// ============================================================================
// COMMON COMPONENTS INDEX
// ============================================================================
// Export all common components for easy importing
// ============================================================================

// Loading states
export {
  Skeleton,
  GurbaniSkeleton,
  TimelineSkeleton,
  CardSkeleton,
  PageLoader,
  Spinner,
  LoadingButton,
} from './LoadingStates';

// Toast notifications
export {
  ToastProvider,
  useToast,
} from './Toast';

// Scroll utilities
export {
  ScrollToTop,
  ReadingProgress,
  useKeyboardShortcuts,
  KeyboardShortcutsModal,
} from './ScrollUtilities';

// Share functionality
export {
  ShareButton,
  CopyVerseButton,
} from './ShareButton';

// Error handling
export {
  ErrorBoundary,
  ErrorFallback,
  ApiError,
} from './ErrorBoundary';

// Disclaimer
export {
  GurbaniDisclaimer,
} from './Disclaimer';

// Language switcher
export { LanguageSwitcher } from './LanguageSwitcher';

// Source citation
export { SourceCitation } from './SourceCitation';

// Page turn wrapper for swipe gestures
export { PageTurnWrapper } from './PageTurnWrapper';
