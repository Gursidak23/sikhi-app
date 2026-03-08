'use client';

// ============================================================================
// GURBANI TERMS GLOSSARY — Interactive spiritual vocabulary
// ============================================================================
// Searchable glossary with categories, deep meanings, flashcard mode,
// and Gurbani references
// ============================================================================

import { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/common/LanguageProvider';
import { GURBANI_TERMS, TERM_CATEGORIES } from '../data/gurbani-terms';
import type { GurbaniTerm, TermCategory } from '../data/gurbani-terms';

const TERMS_LEARNED_KEY = 'sikhi-terms-learned';

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; pill: string; pillActive: string }> = {
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', pill: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', pillActive: 'bg-amber-500 text-white border-amber-500' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', pill: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', pillActive: 'bg-purple-500 text-white border-purple-500' },
  red: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', pill: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800', pillActive: 'bg-red-500 text-white border-red-500' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', pill: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', pillActive: 'bg-emerald-500 text-white border-emerald-500' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', pill: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', pillActive: 'bg-blue-500 text-white border-blue-500' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', pill: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800', pillActive: 'bg-orange-500 text-white border-orange-500' },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GurbaniGlossary() {
  const { language, isPunjabi } = useLanguage();
  const isHindi = language === 'hi';
  const t = (v: { pa: string; en: string; hi: string }) => isPunjabi ? v.pa : isHindi ? v.hi : v.en;

  const [activeCategory, setActiveCategory] = useState<TermCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [mode, setMode] = useState<'browse' | 'flashcard' | 'quiz'>('browse');
  const [learnedTerms, setLearnedTerms] = useState<Set<string>>(new Set());

  // Flashcard state
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [flashcardTerms, setFlashcardTerms] = useState<GurbaniTerm[]>([]);

  // Quiz state
  const [quizTerms, setQuizTerms] = useState<GurbaniTerm[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // Load learned terms
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(TERMS_LEARNED_KEY);
    if (saved) {
      try { setLearnedTerms(new Set(JSON.parse(saved))); } catch { /* ignore */ }
    }
  }, []);

  const markLearned = useCallback((termId: string) => {
    setLearnedTerms(prev => {
      const next = new Set(prev);
      next.add(termId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(TERMS_LEARNED_KEY, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  }, []);

  const filteredTerms = useMemo(() => {
    let terms = GURBANI_TERMS;
    if (activeCategory !== 'all') {
      terms = terms.filter(term => term.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      terms = terms.filter(term =>
        term.gurmukhi.includes(q) ||
        term.roman.toLowerCase().includes(q) ||
        term.meaning.en.toLowerCase().includes(q) ||
        term.meaning.pa.includes(q) ||
        term.meaning.hi.includes(q)
      );
    }
    return terms;
  }, [activeCategory, searchQuery]);

  const getCategoryColor = (cat: TermCategory) => {
    const category = TERM_CATEGORIES.find(c => c.id === cat);
    return CATEGORY_COLORS[category?.color || 'purple'];
  };

  // Start flashcard mode
  const startFlashcards = useCallback(() => {
    const terms = activeCategory === 'all' ? GURBANI_TERMS : GURBANI_TERMS.filter(t => t.category === activeCategory);
    setFlashcardTerms(shuffle(terms));
    setFlashcardIdx(0);
    setFlashcardFlipped(false);
    setMode('flashcard');
  }, [activeCategory]);

  // Start quiz mode
  const startQuiz = useCallback(() => {
    const terms = activeCategory === 'all' ? GURBANI_TERMS : GURBANI_TERMS.filter(t => t.category === activeCategory);
    const selected = shuffle(terms).slice(0, Math.min(10, terms.length));
    setQuizTerms(selected);
    setQuizIdx(0);
    setQuizScore(0);
    setQuizAnswer(null);
    // Generate options for first question
    if (selected.length > 0) {
      const wrong = shuffle(GURBANI_TERMS.filter(t => t.id !== selected[0].id)).slice(0, 3).map(t => t.meaning.en);
      setQuizOptions(shuffle([selected[0].meaning.en, ...wrong]));
    }
    setMode('quiz');
  }, [activeCategory]);

  const handleQuizAnswer = useCallback((answer: string) => {
    if (quizAnswer) return;
    setQuizAnswer(answer);
    const isCorrect = answer === quizTerms[quizIdx].meaning.en;
    if (isCorrect) {
      setQuizScore(s => s + 1);
      markLearned(quizTerms[quizIdx].id);
    }

    setTimeout(() => {
      setQuizAnswer(null);
      const nextIdx = quizIdx + 1;
      if (nextIdx < quizTerms.length) {
        setQuizIdx(nextIdx);
        const wrong = shuffle(GURBANI_TERMS.filter(t => t.id !== quizTerms[nextIdx].id)).slice(0, 3).map(t => t.meaning.en);
        setQuizOptions(shuffle([quizTerms[nextIdx].meaning.en, ...wrong]));
      } else {
        setQuizIdx(nextIdx); // trigger "complete" view
      }
    }, 1200);
  }, [quizAnswer, quizTerms, quizIdx, markLearned]);

  const termsProgress = Math.round((learnedTerms.size / GURBANI_TERMS.length) * 100);

  // ═════════════════════════════════════════════
  // RENDER: FLASHCARD MODE
  // ═════════════════════════════════════════════
  if (mode === 'flashcard') {
    if (flashcardIdx >= flashcardTerms.length) {
      return (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 shadow-lg">
            <div className="text-6xl mb-4">📚</div>
            <h2 className={cn('text-2xl font-bold text-neutral-900 dark:text-white mb-4', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi ? 'ਸਾਰੇ ਕਾਰਡ ਪੂਰੇ!' : isHindi ? 'सभी कार्ड पूरे!' : 'All Cards Done!'}
            </h2>
            <div className="flex gap-3 justify-center">
              <button onClick={startFlashcards} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
                {isPunjabi ? 'ਦੁਬਾਰਾ' : isHindi ? 'दोबारा' : 'Restart'}
              </button>
              <button onClick={() => setMode('browse')} className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600">
                {isPunjabi ? 'ਵਾਪਸ' : isHindi ? 'वापस' : 'Back'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    const term = flashcardTerms[flashcardIdx];
    const colors = getCategoryColor(term.category);

    return (
      <div className="max-w-md mx-auto">
        {/* Counter */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMode('browse')} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">✕</button>
          <span className="text-sm text-neutral-500">{flashcardIdx + 1}/{flashcardTerms.length}</span>
        </div>

        {/* Card */}
        <button
          onClick={() => {
            if (flashcardFlipped) {
              markLearned(term.id);
              setFlashcardFlipped(false);
              setFlashcardIdx(i => i + 1);
            } else {
              setFlashcardFlipped(true);
            }
          }}
          className={cn(
            'w-full rounded-2xl border-2 p-5 sm:p-8 shadow-lg text-center transition-all min-h-[280px] sm:min-h-[300px] flex flex-col items-center justify-center cursor-pointer hover:shadow-xl',
            colors.bg, colors.border
          )}
        >
          {!flashcardFlipped ? (
            <>
              <div className="text-5xl sm:text-6xl font-gurmukhi text-neutral-900 dark:text-white mb-4">{term.gurmukhi}</div>
              <p className="text-lg sm:text-xl font-medium text-neutral-700 dark:text-neutral-300">{term.roman}</p>
              <p className="text-sm text-neutral-400 mt-4">
                {isPunjabi ? 'ਅਰਥ ਦੇਖਣ ਲਈ ਟੈਪ ਕਰੋ' : isHindi ? 'अर्थ देखने के लिए टैप करें' : 'Tap to reveal meaning'}
              </p>
            </>
          ) : (
            <>
              <div className="text-3xl font-gurmukhi text-neutral-900 dark:text-white mb-2">{term.gurmukhi}</div>
              <p className={cn('text-lg font-medium mb-4', colors.text, isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                {t(term.meaning)}
              </p>
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 w-full">
                <p className={cn('text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                  {t(term.deepMeaning)}
                </p>
              </div>
              <p className="text-sm text-neutral-400 mt-4">
                {isPunjabi ? 'ਅੱਗੇ ਜਾਣ ਲਈ ਟੈਪ ਕਰੋ' : isHindi ? 'आगे जाने के लिए टैप करें' : 'Tap to continue'}
              </p>
            </>
          )}
        </button>
      </div>
    );
  }

  // ═════════════════════════════════════════════
  // RENDER: QUIZ MODE
  // ═════════════════════════════════════════════
  if (mode === 'quiz') {
    if (quizIdx >= quizTerms.length) {
      return (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 shadow-lg">
            <div className="text-6xl mb-4">{quizScore >= 8 ? '🏆' : quizScore >= 5 ? '👍' : '💪'}</div>
            <h2 className={cn('text-2xl font-bold text-neutral-900 dark:text-white mb-2', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi ? 'ਕੁਇਜ਼ ਪੂਰੀ!' : isHindi ? 'क्विज़ पूरी!' : 'Quiz Complete!'}
            </h2>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 my-4">{quizScore}/{quizTerms.length}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={startQuiz} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
                {isPunjabi ? 'ਦੁਬਾਰਾ' : isHindi ? 'दोबारा' : 'Play Again'}
              </button>
              <button onClick={() => setMode('browse')} className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600">
                {isPunjabi ? 'ਵਾਪਸ' : isHindi ? 'वापस' : 'Back'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    const term = quizTerms[quizIdx];
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 shadow-lg">
          <div className="flex items-center justify-between text-sm text-neutral-500 mb-6">
            <button onClick={() => setMode('browse')} className="text-neutral-400 hover:text-neutral-600">✕</button>
            <span>{quizIdx + 1}/{quizTerms.length}</span>
            <span>🎯 {quizScore}/{quizIdx}</span>
          </div>
          <p className={cn('text-sm text-purple-600 dark:text-purple-400 mb-4', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi ? 'ਇਸ ਸ਼ਬਦ ਦਾ ਅਰਥ ਕੀ ਹੈ?' : isHindi ? 'इस शब्द का अर्थ क्या है?' : 'What does this term mean?'}
          </p>
          <div className="text-5xl sm:text-6xl font-gurmukhi text-purple-700 dark:text-purple-300 mb-2">{term.gurmukhi}</div>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mb-6 sm:mb-8">{term.roman}</p>
          <div className="space-y-3">
            {quizOptions.map(opt => (
              <button
                key={opt}
                onClick={() => handleQuizAnswer(opt)}
                disabled={!!quizAnswer}
                className={cn(
                  'w-full px-4 py-3 rounded-xl text-left text-sm border-2 transition-all min-h-[48px]',
                  !quizAnswer
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-400 text-neutral-900 dark:text-white'
                    : opt === term.meaning.en
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 text-emerald-800 dark:text-emerald-300'
                      : opt === quizAnswer
                        ? 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-800 dark:text-red-300'
                        : 'bg-neutral-100 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 opacity-50'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════
  // RENDER: BROWSE MODE
  // ═════════════════════════════════════════════
  return (
    <div>
      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400 mb-2">
          <span className={cn(isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi ? 'ਸ਼ਬਦ ਸਿੱਖੇ' : isHindi ? 'शब्द सीखे' : 'Terms Learned'}
          </span>
          <span>{learnedTerms.size}/{GURBANI_TERMS.length} ({termsProgress}%)</span>
        </div>
        <div className="h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${termsProgress}%` }} />
        </div>
      </div>

      {/* Mode Buttons + Search */}
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isPunjabi ? 'ਖੋਜੋ...' : isHindi ? 'खोजें...' : 'Search terms...'}
            className={cn(
              'w-full px-4 py-2.5 pl-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none text-sm',
              isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari'
            )}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
        </div>
        <div className="flex gap-2">
          <button onClick={startFlashcards} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap">
            {isPunjabi ? '📇 ਫਲੈਸ਼ਕਾਰਡ' : isHindi ? '📇 फ्लैशकार्ड' : '📇 Flashcards'}
          </button>
          <button onClick={startQuiz} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors whitespace-nowrap">
            {isPunjabi ? '🎯 ਕੁਇਜ਼' : isHindi ? '🎯 क्विज़' : '🎯 Quiz'}
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-2xl mx-auto flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm border transition-all',
            activeCategory === 'all'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:border-purple-400'
          )}
        >
          {isPunjabi ? 'ਸਾਰੇ' : isHindi ? 'सभी' : 'All'} ({GURBANI_TERMS.length})
        </button>
        {TERM_CATEGORIES.map(cat => {
          const count = GURBANI_TERMS.filter(t => t.category === cat.id).length;
          const colors = CATEGORY_COLORS[cat.color];
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm border transition-all',
                activeCategory === cat.id ? colors.pillActive : colors.pill
              )}
            >
              <span className={cn(isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                {cat.icon} {t(cat.label)} ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Term Cards */}
      <div className="max-w-2xl mx-auto space-y-3">
        {filteredTerms.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className={cn(isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi ? 'ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ' : isHindi ? 'कोई परिणाम नहीं मिला' : 'No terms found'}
            </p>
          </div>
        ) : (
          filteredTerms.map(term => {
            const isExpanded = expandedTerm === term.id;
            const isLearned = learnedTerms.has(term.id);
            const colors = getCategoryColor(term.category);

            return (
              <div
                key={term.id}
                className={cn(
                  'rounded-xl border-2 overflow-hidden transition-all',
                  isExpanded ? cn(colors.bg, colors.border) : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                )}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedTerm(isExpanded ? null : term.id)}
                  className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 text-left"
                >
                  <div className="text-2xl sm:text-3xl font-gurmukhi text-neutral-900 dark:text-white shrink-0 w-auto min-w-[3rem] sm:min-w-[4rem]">
                    {term.gurmukhi}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm sm:text-base text-neutral-900 dark:text-white">{term.roman}</span>
                      {isLearned && <span className="text-xs text-emerald-500">✓</span>}
                    </div>
                    <p className={cn('text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                      {t(term.meaning)}
                    </p>
                  </div>
                  <span className={cn('text-neutral-400 text-sm transition-transform shrink-0', isExpanded && 'rotate-180')}>▼</span>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-neutral-200/50 dark:border-neutral-700/50">
                    {/* Deep Meaning */}
                    <div className="mt-3 sm:mt-4">
                      <h4 className={cn('text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 sm:mb-2', colors.text)}>
                        {isPunjabi ? 'ਡੂੰਘਾ ਅਰਥ' : isHindi ? 'गहरा अर्थ' : 'Deep Meaning'}
                      </h4>
                      <p className={cn('text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                        {t(term.deepMeaning)}
                      </p>
                    </div>

                    {/* Gurbani Usage */}
                    {term.usage && (
                      <div className="mt-3 sm:mt-4 bg-white/60 dark:bg-black/20 rounded-lg p-2.5 sm:p-3">
                        <h4 className={cn('text-xs font-semibold uppercase tracking-wider mb-2', colors.text)}>
                          {isPunjabi ? 'ਗੁਰਬਾਣੀ ਵਿੱਚ' : isHindi ? 'गुरबाणी में' : 'In Gurbani'}
                        </h4>
                        <p className="text-xs sm:text-sm font-gurmukhi text-neutral-900 dark:text-white leading-relaxed mb-1">
                          &ldquo;{term.usage.line}&rdquo;
                        </p>
                        <p className={cn('text-xs text-neutral-500', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                          — {term.usage.source}
                        </p>
                      </div>
                    )}

                    {/* Mark Learned Button */}
                    {!isLearned && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markLearned(term.id); }}
                        className="mt-4 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        ✓ {isPunjabi ? 'ਸਿੱਖ ਲਿਆ' : isHindi ? 'सीख लिया' : 'Mark as Learned'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
