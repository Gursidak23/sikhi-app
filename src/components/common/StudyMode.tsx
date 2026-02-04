'use client';

// ============================================================================
// STUDY MODE COMPONENT
// ============================================================================
// Focused reading mode for studying Gurbani
// Features: Line highlighting, notes, word meanings
// ============================================================================

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

interface StudyModeContextType {
  isStudyMode: boolean;
  toggleStudyMode: () => void;
  highlightedLine: number | null;
  setHighlightedLine: (line: number | null) => void;
  notes: Map<string, string>;
  addNote: (verseId: string, note: string) => void;
  removeNote: (verseId: string) => void;
  readingSpeed: 'slow' | 'medium' | 'fast';
  setReadingSpeed: (speed: 'slow' | 'medium' | 'fast') => void;
}

const StudyModeContext = createContext<StudyModeContextType | null>(null);

export function StudyModeProvider({ children }: { children: ReactNode }) {
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [notes, setNotes] = useState<Map<string, string>>(new Map());
  const [readingSpeed, setReadingSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');

  // Load notes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedNotes = localStorage.getItem('sikhi-vidhya-study-notes');
        if (savedNotes) {
          const parsed = JSON.parse(savedNotes);
          setNotes(new Map(Object.entries(parsed)));
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && notes.size > 0) {
      const notesObj = Object.fromEntries(notes);
      localStorage.setItem('sikhi-vidhya-study-notes', JSON.stringify(notesObj));
    }
  }, [notes]);

  const toggleStudyMode = () => {
    setIsStudyMode((prev) => !prev);
    if (!isStudyMode) {
      document.body.classList.add('study-mode');
    } else {
      document.body.classList.remove('study-mode');
    }
  };

  const addNote = (verseId: string, note: string) => {
    setNotes((prev) => {
      const newNotes = new Map(prev);
      newNotes.set(verseId, note);
      return newNotes;
    });
  };

  const removeNote = (verseId: string) => {
    setNotes((prev) => {
      const newNotes = new Map(prev);
      newNotes.delete(verseId);
      return newNotes;
    });
  };

  return (
    <StudyModeContext.Provider
      value={{
        isStudyMode,
        toggleStudyMode,
        highlightedLine,
        setHighlightedLine,
        notes,
        addNote,
        removeNote,
        readingSpeed,
        setReadingSpeed,
      }}
    >
      {children}
    </StudyModeContext.Provider>
  );
}

export function useStudyMode() {
  const context = useContext(StudyModeContext);
  if (!context) {
    // Return defaults if not wrapped in provider
    return {
      isStudyMode: false,
      toggleStudyMode: () => {},
      highlightedLine: null,
      setHighlightedLine: () => {},
      notes: new Map<string, string>(),
      addNote: () => {},
      removeNote: () => {},
      readingSpeed: 'medium' as const,
      setReadingSpeed: () => {},
    };
  }
  return context;
}

// Study Mode Toggle Button
export function StudyModeToggle({ language }: { language: Language }) {
  const { isStudyMode, toggleStudyMode } = useStudyMode();

  return (
    <button
      onClick={toggleStudyMode}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
        isStudyMode
          ? 'bg-amber-500 text-white shadow-lg'
          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/50'
      )}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
        />
      </svg>
      <span className={language === 'pa' ? 'font-gurmukhi' : ''}>
        {isStudyMode
          ? (language === 'pa' ? 'ਅਧਿਐਨ ਮੋਡ ਬੰਦ' : 'Exit Study Mode')
          : (language === 'pa' ? 'ਅਧਿਐਨ ਮੋਡ' : 'Study Mode')
        }
      </span>
    </button>
  );
}

// Study Mode Controls Panel
export function StudyModeControls({ language }: { language: Language }) {
  const { isStudyMode, readingSpeed, setReadingSpeed, notes } = useStudyMode();

  if (!isStudyMode) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-amber-200 dark:border-amber-800 p-4 max-w-xs">
      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        {language === 'pa' ? 'ਅਧਿਐਨ ਸੈਟਿੰਗਾਂ' : 'Study Settings'}
      </h4>

      {/* Reading Speed */}
      <div className="mb-4">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
          {language === 'pa' ? 'ਪੜ੍ਹਨ ਦੀ ਗਤੀ' : 'Reading Speed'}
        </p>
        <div className="flex gap-2">
          {(['slow', 'medium', 'fast'] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => setReadingSpeed(speed)}
              className={cn(
                'flex-1 px-3 py-1.5 rounded-lg text-xs transition-colors',
                readingSpeed === speed
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              )}
            >
              {speed === 'slow' && (language === 'pa' ? 'ਹੌਲੀ' : 'Slow')}
              {speed === 'medium' && (language === 'pa' ? 'ਮੱਧਮ' : 'Medium')}
              {speed === 'fast' && (language === 'pa' ? 'ਤੇਜ਼' : 'Fast')}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Count */}
      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        <span className="text-amber-600 dark:text-amber-400 font-semibold">{notes.size}</span>
        {language === 'pa' ? ' ਨੋਟਸ ਸੇਵ ਕੀਤੇ' : ' notes saved'}
      </div>
    </div>
  );
}

// Note Component for verses
export function VerseNote({
  verseId,
  language,
}: {
  verseId: string;
  language: Language;
}) {
  const { isStudyMode, notes, addNote, removeNote } = useStudyMode();
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(notes.get(verseId) || '');

  useEffect(() => {
    setNoteText(notes.get(verseId) || '');
  }, [notes, verseId]);

  if (!isStudyMode) return null;

  const hasNote = notes.has(verseId);

  const handleSave = () => {
    if (noteText.trim()) {
      addNote(verseId, noteText.trim());
    } else {
      removeNote(verseId);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={language === 'pa' ? 'ਆਪਣਾ ਨੋਟ ਲਿਖੋ...' : 'Write your note...'}
          className={cn(
            'w-full p-2 rounded border border-amber-300 dark:border-amber-700',
            'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200',
            'text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500'
          )}
          rows={3}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            {language === 'pa' ? 'ਰੱਦ ਕਰੋ' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600"
          >
            {language === 'pa' ? 'ਸੇਵ ਕਰੋ' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  if (hasNote) {
    return (
      <div 
        className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-800/30"
        onClick={() => setIsEditing(true)}
      >
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-sm text-amber-800 dark:text-amber-200">{notes.get(verseId)}</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="mt-2 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      {language === 'pa' ? 'ਨੋਟ ਜੋੜੋ' : 'Add Note'}
    </button>
  );
}

// Line Highlighter
export function LineHighlighter({
  lineIndex,
  children,
}: {
  lineIndex: number;
  children: ReactNode;
}) {
  const { isStudyMode, highlightedLine, setHighlightedLine } = useStudyMode();

  if (!isStudyMode) return <>{children}</>;

  return (
    <div
      onClick={() => setHighlightedLine(lineIndex === highlightedLine ? null : lineIndex)}
      className={cn(
        'cursor-pointer transition-all rounded-lg px-2 py-1 -mx-2',
        highlightedLine === lineIndex
          ? 'bg-amber-200 dark:bg-amber-800/50 ring-2 ring-amber-400 dark:ring-amber-600'
          : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
      )}
    >
      {children}
    </div>
  );
}
