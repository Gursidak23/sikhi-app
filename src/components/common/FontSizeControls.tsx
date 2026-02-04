'use client';

// ============================================================================
// FONT SIZE CONTROLS
// ============================================================================
// Accessibility controls for adjusting Gurbani text size
// Persists preference in localStorage
// ============================================================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  getFontSizeClass: () => string;
  getFontSizeValue: () => string;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const STORAGE_KEY = 'sikhi-font-size';

const FONT_SIZES: FontSize[] = ['small', 'medium', 'large', 'xlarge'];

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: 'text-lg sm:text-xl',
  medium: 'text-xl sm:text-2xl',
  large: 'text-2xl sm:text-3xl',
  xlarge: 'text-3xl sm:text-4xl',
};

const FONT_SIZE_VALUES: Record<FontSize, string> = {
  small: '1.125rem',
  medium: '1.375rem',
  large: '1.75rem',
  xlarge: '2.25rem',
};

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as FontSize | null;
      if (stored && FONT_SIZES.includes(stored)) {
        setFontSizeState(stored);
      }
    } catch (error) {
      console.error('Error loading font size:', error);
    }
    setMounted(true);
  }, []);

  // Apply CSS custom property
  useEffect(() => {
    if (mounted) {
      document.documentElement.style.setProperty(
        '--gurbani-font-size',
        FONT_SIZE_VALUES[fontSize]
      );
    }
  }, [fontSize, mounted]);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    try {
      localStorage.setItem(STORAGE_KEY, size);
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  }, []);

  const increaseFontSize = useCallback(() => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex < FONT_SIZES.length - 1) {
      setFontSize(FONT_SIZES[currentIndex + 1]);
    }
  }, [fontSize, setFontSize]);

  const decreaseFontSize = useCallback(() => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(FONT_SIZES[currentIndex - 1]);
    }
  }, [fontSize, setFontSize]);

  const getFontSizeClass = useCallback(() => {
    return FONT_SIZE_CLASSES[fontSize];
  }, [fontSize]);

  const getFontSizeValue = useCallback(() => {
    return FONT_SIZE_VALUES[fontSize];
  }, [fontSize]);

  if (!mounted) {
    return null;
  }

  return (
    <FontSizeContext.Provider
      value={{
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        getFontSizeClass,
        getFontSizeValue,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}

// Font size control buttons
export function FontSizeControls({ className }: { className?: string }) {
  const { fontSize, setFontSize, increaseFontSize, decreaseFontSize } = useFontSize();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={decreaseFontSize}
        disabled={fontSize === 'small'}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease font size"
        title="Smaller text"
      >
        <span className="text-sm font-bold">A-</span>
      </button>
      
      <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-sm font-medium text-amber-800 dark:text-amber-300 min-w-[80px] text-center">
        {fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
      </div>
      
      <button
        onClick={increaseFontSize}
        disabled={fontSize === 'xlarge'}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase font size"
        title="Larger text"
      >
        <span className="text-lg font-bold">A+</span>
      </button>
    </div>
  );
}

// Font size selector dropdown
export function FontSizeSelector({ className }: { className?: string }) {
  const { fontSize, setFontSize } = useFontSize();

  const options: { value: FontSize; label: string; labelPa: string }[] = [
    { value: 'small', label: 'Small', labelPa: 'ਛੋਟਾ' },
    { value: 'medium', label: 'Medium', labelPa: 'ਮੱਧ' },
    { value: 'large', label: 'Large', labelPa: 'ਵੱਡਾ' },
    { value: 'xlarge', label: 'Extra Large', labelPa: 'ਬਹੁਤ ਵੱਡਾ' },
  ];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        ਅੱਖਰ ਦਾ ਆਕਾਰ / Font Size
      </label>
      <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setFontSize(option.value)}
            className={`flex-1 px-2 py-2 rounded-md text-sm transition-all ${
              fontSize === option.value
                ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <span className="font-gurmukhi text-xs block">{option.labelPa}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
