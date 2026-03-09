'use client';

// ============================================================================
// THEME PROVIDER
// ============================================================================
// Provides dark/light mode support with system preference detection
// Persists user preference in localStorage
// ============================================================================

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage or default to light
  useEffect(() => {
    const saved = localStorage.getItem('sikhi-theme') as Theme | null;
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      setThemeState(saved);
    }
    setMounted(true);
  }, []);

  // Apply theme to <html>
  useEffect(() => {
    if (!mounted) return;
    const isAmritVela = document.documentElement.classList.contains('amrit-vela');
    // Amrit Vela overrides everything to dark — but still allow toggle to store preference
    if (isAmritVela) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      setResolvedTheme('dark');
      return;
    }

    let resolved: 'light' | 'dark' = 'light';
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme === 'dark' ? 'dark' : 'light';
    }

    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    setResolvedTheme(resolved);
  }, [mounted, theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (!mounted || theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light';
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      document.documentElement.setAttribute('data-theme', resolved);
      setResolvedTheme(resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mounted, theme]);

  // Re-apply theme when Amrit Vela mode changes
  useEffect(() => {
    if (!mounted) return;
    const handler = () => {
      // Force re-apply by reading theme and toggling a re-render
      const saved = localStorage.getItem('sikhi-theme') as Theme | null;
      const newTheme = saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'light';
      // Always force a state update to re-trigger the apply effect
      setThemeState('__reset' as Theme);
      setTimeout(() => setThemeState(newTheme), 0);
    };
    window.addEventListener('amritvela-change', handler);
    return () => window.removeEventListener('amritvela-change', handler);
  }, [mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('sikhi-theme', newTheme);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  // Render children immediately — use suppressHydrationWarning on html to avoid flash
  // The inline script in layout.tsx sets the correct theme class before React hydrates

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme toggle button component
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      {resolvedTheme === 'light' ? (
        // Moon icon for switching to dark
        <svg className="w-5 h-5 text-neela-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        // Sun icon for switching to light
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}

// Theme selector with all three options
export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  
  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    {
      value: 'light',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      label: 'Light',
    },
    {
      value: 'dark',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      label: 'Dark',
    },
    {
      value: 'system',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'System',
    },
  ];
  
  return (
    <div className={`flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
            theme === option.value
              ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
