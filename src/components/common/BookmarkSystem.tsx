'use client';

// ============================================================================
// BOOKMARK SYSTEM
// ============================================================================
// Allows users to save favorite Shabads and Angs
// Persists in localStorage for offline access
// ============================================================================

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FocusTrap } from './FocusTrap';

export interface Bookmark {
  id: string;
  type: 'ang' | 'shabad' | 'verse';
  angNumber?: number;
  shabadId?: number;
  verseId?: number;
  title: string;
  gurmukhi: string;
  translation?: string;
  raag?: string;
  writer?: string;
  createdAt: number;
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (type: string, identifier: number) => boolean;
  getBookmark: (type: string, identifier: number) => Bookmark | undefined;
  clearAllBookmarks: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const STORAGE_KEY = 'sikhi-bookmarks';

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
    setMounted(true);
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error('Error saving bookmarks:', error);
      }
    }
  }, [bookmarks, mounted]);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: `${bookmark.type}-${bookmark.angNumber || bookmark.shabadId || bookmark.verseId}-${Date.now()}`,
      createdAt: Date.now(),
    };
    
    setBookmarks((prev) => {
      // Check if already bookmarked
      const exists = prev.some(
        (b) =>
          b.type === bookmark.type &&
          (b.angNumber === bookmark.angNumber ||
            b.shabadId === bookmark.shabadId ||
            b.verseId === bookmark.verseId)
      );
      if (exists) return prev;
      return [newBookmark, ...prev];
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isBookmarked = useCallback(
    (type: string, identifier: number) => {
      return bookmarks.some(
        (b) =>
          b.type === type &&
          (b.angNumber === identifier ||
            b.shabadId === identifier ||
            b.verseId === identifier)
      );
    },
    [bookmarks]
  );

  const getBookmark = useCallback(
    (type: string, identifier: number) => {
      return bookmarks.find(
        (b) =>
          b.type === type &&
          (b.angNumber === identifier ||
            b.shabadId === identifier ||
            b.verseId === identifier)
      );
    },
    [bookmarks]
  );

  const clearAllBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        getBookmark,
        clearAllBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}

// Bookmark button component
interface BookmarkButtonProps {
  type: 'ang' | 'shabad' | 'verse';
  angNumber?: number;
  shabadId?: number;
  verseId?: number;
  title: string;
  gurmukhi: string;
  translation?: string;
  raag?: string;
  writer?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BookmarkButton({
  type,
  angNumber,
  shabadId,
  verseId,
  title,
  gurmukhi,
  translation,
  raag,
  writer,
  className = '',
  size = 'md',
}: BookmarkButtonProps) {
  const { addBookmark, removeBookmark, isBookmarked, getBookmark } = useBookmarks();
  
  const identifier = angNumber || shabadId || verseId || 0;
  const bookmarked = isBookmarked(type, identifier);
  
  const handleClick = () => {
    if (bookmarked) {
      const bookmark = getBookmark(type, identifier);
      if (bookmark) {
        removeBookmark(bookmark.id);
      }
    } else {
      addBookmark({
        type,
        angNumber,
        shabadId,
        verseId,
        title,
        gurmukhi,
        translation,
        raag,
        writer,
      });
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full transition-all ${
        bookmarked
          ? 'bg-kesri-100 text-kesri-600 hover:bg-kesri-200 dark:bg-kesri-900/30 dark:text-kesri-400'
          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-kesri-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
      } ${className}`}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <svg
        className={iconSizes[size]}
        fill={bookmarked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}

// ============================================================================
// BOOKMARKS PANEL - View saved bookmarks
// ============================================================================

interface BookmarksPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'pa' | 'pa-roman' | 'en' | 'hi';
}

export function BookmarksPanel({ isOpen, onClose, language = 'en' }: BookmarksPanelProps) {
  const { bookmarks, removeBookmark, clearAllBookmarks } = useBookmarks();
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Set up portal root
  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  // ESC key + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen || !portalRoot) return null;

  // Treat pa-roman same as pa for display labels
  const displayLang = language === 'pa-roman' ? 'pa' : language;
  
  const labels = {
    pa: {
      title: 'ਮੇਰੇ ਬੁੱਕਮਾਰਕ',
      empty: 'ਕੋਈ ਬੁੱਕਮਾਰਕ ਨਹੀਂ ਮਿਲੇ',
      emptyDesc: 'ਹੁਕਮਨਾਮਾ ਜਾਂ ਸ਼ਬਦ ਨੂੰ ਬੁੱਕਮਾਰਕ ਕਰਨ ਲਈ ਬੁੱਕਮਾਰਕ ਆਈਕਨ \'ਤੇ ਕਲਿੱਕ ਕਰੋ',
      clearAll: 'ਸਭ ਹਟਾਓ',
      ang: 'ਅੰਗ',
    },
    hi: {
      title: 'मेरे बुकमार्क',
      empty: 'कोई बुकमार्क नहीं मिले',
      emptyDesc: 'हुकमनामा या शब्द को बुकमार्क करने के लिए बुकमार्क आइकन पर क्लिक करें',
      clearAll: 'सभी हटाएं',
      ang: 'अंग',
    },
    en: {
      title: 'My Bookmarks',
      empty: 'No bookmarks yet',
      emptyDesc: 'Click the bookmark icon on any Hukamnama or Shabad to save it here',
      clearAll: 'Clear All',
      ang: 'Ang',
    },
  };

  const t = labels[displayLang];

  const panel = (
    <div 
      className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Bookmarks"
    >
      <FocusTrap onEscape={onClose}>
      <div 
        ref={panelRef}
        className="w-full max-w-lg max-h-[90vh] overflow-hidden bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 mt-16 sm:mt-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <h2 className={`text-lg font-semibold ${displayLang === 'pa' ? 'font-gurmukhi' : ''}`}>
            🔖 {t.title}
          </h2>
          <div className="flex items-center gap-2">
            {bookmarks.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all bookmarks?')) {
                    clearAllBookmarks();
                  }
                }}
                className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                {t.clearAll}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p className={`text-neutral-600 dark:text-neutral-400 font-medium ${displayLang === 'pa' ? 'font-gurmukhi' : ''}`}>
                {t.empty}
              </p>
              <p className={`text-sm text-neutral-500 dark:text-neutral-500 mt-1 ${displayLang === 'pa' ? 'font-gurmukhi' : ''}`}>
                {t.emptyDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div 
                  key={bookmark.id}
                  className="group p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {bookmark.title}
                      </p>
                      
                      {/* Gurmukhi */}
                      <p className="font-gurmukhi text-base sm:text-lg text-neutral-900 dark:text-neutral-100 mt-1 line-clamp-2" lang="pa">
                        {bookmark.gurmukhi}
                      </p>
                      
                      {/* Translation */}
                      {bookmark.translation && (
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-1 italic">
                          {bookmark.translation}
                        </p>
                      )}
                      
                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {bookmark.angNumber && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                            📖 {t.ang} {bookmark.angNumber}
                          </span>
                        )}
                        {bookmark.raag && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                            🎵 {bookmark.raag}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      aria-label="Remove bookmark"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </FocusTrap>
    </div>
  );

  return createPortal(panel, portalRoot);
}
