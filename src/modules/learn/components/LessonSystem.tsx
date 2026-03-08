'use client';

// ============================================================================
// DUOLINGO-STYLE GURMUKHI LESSON SYSTEM
// ============================================================================
// Progressive lessons with XP, streaks, and interactive exercises
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/common/LanguageProvider';
import { LESSON_UNITS, getAllLetters, getAllWords } from '../data/gurmukhi-lessons';
import type { LessonUnit, LessonLetter, LessonWord } from '../data/gurmukhi-lessons';

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

type ExerciseType =
  | { type: 'learn'; letters?: LessonLetter[]; words?: LessonWord[] }
  | { type: 'choose'; prompt: string; promptLabel: string; correct: string; options: string[] }
  | { type: 'match'; pairs: Array<{ left: string; right: string }> };

interface LearningProgress {
  xp: number;
  completedUnits: string[];
  streak: { count: number; lastDate: string };
}

const STORAGE_KEY = 'sikhi-learn-progress';
const XP_PER_CORRECT = 10;
const XP_PER_LESSON = 50;

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getLevel(xp: number): { title: { pa: string; en: string; hi: string }; emoji: string } {
  if (xp >= 1000) return { title: { pa: 'ਵਿਦਵਾਨ', en: 'Scholar', hi: 'विद्वान' }, emoji: '👑' };
  if (xp >= 500) return { title: { pa: 'ਮਾਹਰ', en: 'Proficient', hi: 'माहिर' }, emoji: '🌟' };
  if (xp >= 100) return { title: { pa: 'ਸਿਖਿਆਰਥੀ', en: 'Learner', hi: 'शिक्षार्थी' }, emoji: '📚' };
  return { title: { pa: 'ਸ਼ੁਰੂ', en: 'Beginner', hi: 'शुरू' }, emoji: '🌱' };
}

function generateExercises(unit: LessonUnit): ExerciseType[] {
  const exercises: ExerciseType[] = [];
  const allLetters = getAllLetters();
  const allWords = getAllWords();

  if (unit.isWordUnit && unit.words) {
    // Word-based unit
    exercises.push({ type: 'learn', words: unit.words });

    // Word → meaning exercises
    for (const word of unit.words.slice(0, 4)) {
      const wrongOptions = shuffle(allWords.filter(w => w.gurmukhi !== word.gurmukhi))
        .slice(0, 3)
        .map(w => w.meaning.en);
      exercises.push({
        type: 'choose',
        prompt: word.gurmukhi,
        promptLabel: 'What does this word mean?',
        correct: word.meaning.en,
        options: shuffle([word.meaning.en, ...wrongOptions]),
      });
    }

    // Meaning → word exercises
    for (const word of unit.words.slice(0, 2)) {
      const wrongOptions = shuffle(allWords.filter(w => w.gurmukhi !== word.gurmukhi))
        .slice(0, 3)
        .map(w => w.gurmukhi);
      exercises.push({
        type: 'choose',
        prompt: word.meaning.en,
        promptLabel: 'Which word matches this meaning?',
        correct: word.gurmukhi,
        options: shuffle([word.gurmukhi, ...wrongOptions]),
      });
    }

    // Match pairs
    const pairs = unit.words.slice(0, 4).map(w => ({ left: w.gurmukhi, right: w.meaning.en }));
    exercises.push({ type: 'match', pairs });

  } else if (unit.letters) {
    // Letter-based unit
    exercises.push({ type: 'learn', letters: unit.letters });

    // Letter → sound exercises
    for (const letter of unit.letters.slice(0, 3)) {
      const wrongOptions = shuffle(allLetters.filter(l => l.gurmukhi !== letter.gurmukhi))
        .slice(0, 3)
        .map(l => l.roman);
      exercises.push({
        type: 'choose',
        prompt: letter.gurmukhi,
        promptLabel: 'What is the pronunciation?',
        correct: letter.roman,
        options: shuffle([letter.roman, ...wrongOptions]),
      });
    }

    // Sound → letter exercises
    for (const letter of unit.letters.slice(0, 2)) {
      const wrongOptions = shuffle(allLetters.filter(l => l.gurmukhi !== letter.gurmukhi))
        .slice(0, 3)
        .map(l => l.gurmukhi);
      exercises.push({
        type: 'choose',
        prompt: letter.roman,
        promptLabel: 'Which letter makes this sound?',
        correct: letter.gurmukhi,
        options: shuffle([letter.gurmukhi, ...wrongOptions]),
      });
    }

    // Match pairs
    const pairs = unit.letters.slice(0, 4).map(l => ({ left: l.gurmukhi, right: l.roman }));
    exercises.push({ type: 'match', pairs });

    // Review
    const review = unit.letters[Math.floor(Math.random() * unit.letters.length)];
    const wrongOpts = shuffle(allLetters.filter(l => l.gurmukhi !== review.gurmukhi))
      .slice(0, 3)
      .map(l => l.roman);
    exercises.push({
      type: 'choose',
      prompt: review.gurmukhi,
      promptLabel: 'Review: What is the pronunciation?',
      correct: review.roman,
      options: shuffle([review.roman, ...wrongOpts]),
    });
  }

  return exercises;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ═══════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function LessonSystem() {
  const { language, isPunjabi } = useLanguage();
  const isHindi = language === 'hi';
  const t = (v: { pa: string; en: string; hi: string }) => isPunjabi ? v.pa : isHindi ? v.hi : v.en;

  // Progress state
  const [progress, setProgress] = useState<LearningProgress>({ xp: 0, completedUnits: [], streak: { count: 0, lastDate: '' } });
  const [view, setView] = useState<'map' | 'lesson' | 'results'>('map');
  const [activeUnit, setActiveUnit] = useState<LessonUnit | null>(null);
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Match exercise state
  const [matchSelected, setMatchSelected] = useState<{ side: 'left' | 'right'; value: string } | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [matchWrong, setMatchWrong] = useState(false);

  // Learn step state
  const [learnStep, setLearnStep] = useState(0);

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved) as LearningProgress;
        // Update streak
        const today = todayStr();
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (p.streak.lastDate !== today && p.streak.lastDate !== yesterday) {
          p.streak = { count: 0, lastDate: p.streak.lastDate };
        }
        setProgress(p);
      } catch { /* ignore */ }
    }
  }, []);

  // Save progress
  const saveProgress = useCallback((p: LearningProgress) => {
    setProgress(p);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    }
  }, []);

  const level = useMemo(() => getLevel(progress.xp), [progress.xp]);

  // Start a lesson
  const startLesson = useCallback((unit: LessonUnit) => {
    setActiveUnit(unit);
    setExercises(generateExercises(unit));
    setExerciseIdx(0);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setMatchSelected(null);
    setMatchedPairs(new Set());
    setMatchWrong(false);
    setLearnStep(0);
    setView('lesson');
  }, []);

  // Handle choose answer
  const handleChooseAnswer = useCallback((answer: string) => {
    if (showFeedback) return;
    const ex = exercises[exerciseIdx];
    if (ex.type !== 'choose') return;

    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (answer === ex.correct) setCorrectCount(c => c + 1);

    setTimeout(() => {
      setSelectedAnswer(null);
      setShowFeedback(false);
      if (exerciseIdx < exercises.length - 1) {
        setExerciseIdx(i => i + 1);
      } else {
        finishLesson();
      }
    }, 1000);
  }, [exercises, exerciseIdx, showFeedback]);

  // Handle match tap
  const handleMatchTap = useCallback((side: 'left' | 'right', value: string) => {
    if (matchedPairs.has(value)) return;

    if (!matchSelected) {
      setMatchSelected({ side, value });
      return;
    }

    if (matchSelected.side === side) {
      setMatchSelected({ side, value });
      return;
    }

    // Check match
    const ex = exercises[exerciseIdx];
    if (ex.type !== 'match') return;

    const isCorrect = ex.pairs.some(p =>
      (p.left === matchSelected.value && p.right === value) ||
      (p.right === matchSelected.value && p.left === value)
    );

    if (isCorrect) {
      const newMatched = new Set(matchedPairs);
      newMatched.add(matchSelected.value);
      newMatched.add(value);
      setMatchedPairs(newMatched);
      setMatchSelected(null);
      setCorrectCount(c => c + 1);

      // Check if all matched
      if (newMatched.size === ex.pairs.length * 2) {
        setTimeout(() => {
          if (exerciseIdx < exercises.length - 1) {
            setExerciseIdx(i => i + 1);
            setMatchedPairs(new Set());
          } else {
            finishLesson();
          }
        }, 600);
      }
    } else {
      setMatchWrong(true);
      setTimeout(() => { setMatchSelected(null); setMatchWrong(false); }, 500);
    }
  }, [matchSelected, matchedPairs, exercises, exerciseIdx]);

  // Handle learn continue
  const handleLearnContinue = useCallback(() => {
    const ex = exercises[exerciseIdx];
    if (ex.type !== 'learn') return;

    const items = ex.letters || ex.words || [];
    if (learnStep < items.length - 1) {
      setLearnStep(s => s + 1);
    } else {
      setLearnStep(0);
      if (exerciseIdx < exercises.length - 1) {
        setExerciseIdx(i => i + 1);
      } else {
        finishLesson();
      }
    }
  }, [exercises, exerciseIdx, learnStep]);

  // Finish lesson
  const finishLesson = useCallback(() => {
    if (!activeUnit) return;
    const today = todayStr();
    const xpEarned = (correctCount * XP_PER_CORRECT) + XP_PER_LESSON;

    const newProgress: LearningProgress = {
      xp: progress.xp + xpEarned,
      completedUnits: progress.completedUnits.includes(activeUnit.id)
        ? progress.completedUnits
        : [...progress.completedUnits, activeUnit.id],
      streak: {
        count: progress.streak.lastDate === today ? progress.streak.count : progress.streak.count + 1,
        lastDate: today,
      },
    };
    saveProgress(newProgress);
    setView('results');
  }, [activeUnit, correctCount, progress, saveProgress]);

  const currentExercise = exercises[exerciseIdx] as ExerciseType | undefined;
  const progressPercent = exercises.length > 0 ? Math.round(((exerciseIdx) / exercises.length) * 100) : 0;

  // ═════════════════════════════════════════════
  // RENDER: LESSON MAP
  // ═════════════════════════════════════════════
  if (view === 'map') {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Stats Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-4 mb-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{level.emoji}</span>
            <div>
              <p className={cn('text-sm font-medium text-neutral-900 dark:text-white', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                {t(level.title)}
              </p>
              <p className="text-xs text-neutral-500">{progress.xp} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-orange-500">🔥 {progress.streak.count}</p>
              <p className="text-[10px] text-neutral-500">
                {isPunjabi ? 'ਲੜੀ' : isHindi ? 'लड़ी' : 'Streak'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">{progress.completedUnits.length}/{LESSON_UNITS.length}</p>
              <p className="text-[10px] text-neutral-500">
                {isPunjabi ? 'ਪੂਰੇ' : isHindi ? 'पूरे' : 'Done'}
              </p>
            </div>
          </div>
        </div>

        {/* XP Progress to next level */}
        <div className="mb-8">
          <div className="h-2 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (progress.xp % 500) / 5)}%` }}
            />
          </div>
        </div>

        {/* Lesson Path */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-purple-200 dark:bg-purple-800 -translate-x-1/2" />

          <div className="space-y-6 relative">
            {LESSON_UNITS.map((unit, idx) => {
              const isCompleted = progress.completedUnits.includes(unit.id);
              const prevCompleted = idx === 0 || progress.completedUnits.includes(LESSON_UNITS[idx - 1].id);
              const isAvailable = prevCompleted;
              const isOdd = idx % 2 === 1;

              return (
                <div key={unit.id} className={cn('flex items-center gap-4', isOdd ? 'flex-row-reverse' : '')}>
                  {/* Info Card */}
                  <div className={cn('flex-1', isOdd ? 'text-right' : 'text-left')}>
                    <h3 className={cn(
                      'text-sm font-semibold',
                      isCompleted ? 'text-emerald-700 dark:text-emerald-400' : isAvailable ? 'text-purple-900 dark:text-purple-200' : 'text-neutral-400 dark:text-neutral-600',
                      isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari'
                    )}>
                      {t(unit.title)}
                    </h3>
                    <p className={cn(
                      'text-xs mt-0.5',
                      isCompleted ? 'text-emerald-600 dark:text-emerald-500' : isAvailable ? 'text-neutral-500' : 'text-neutral-400 dark:text-neutral-600',
                      isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari'
                    )}>
                      {t(unit.description)}
                    </p>
                  </div>

                  {/* Circle Node */}
                  <button
                    onClick={() => isAvailable && startLesson(unit)}
                    disabled={!isAvailable}
                    className={cn(
                      'relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-gurmukhi border-4 transition-all shrink-0',
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                        : isAvailable
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30 hover:scale-110 cursor-pointer animate-pulse'
                          : 'bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                    )}
                    aria-label={`${t(unit.title)} ${isCompleted ? '(Completed)' : isAvailable ? '(Start)' : '(Locked)'}`}
                  >
                    {isCompleted ? '✓' : unit.icon}
                  </button>

                  {/* Spacer for layout */}
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════
  // RENDER: RESULTS
  // ═════════════════════════════════════════════
  if (view === 'results') {
    const xpEarned = (correctCount * XP_PER_CORRECT) + XP_PER_LESSON;
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 shadow-lg">
          {/* Celebration */}
          <div className="text-7xl mb-4">🎉</div>
          <h2 className={cn('text-2xl font-bold text-purple-900 dark:text-purple-200 mb-2', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi ? 'ਸ਼ਾਬਾਸ਼!' : isHindi ? 'शाबाश!' : 'Lesson Complete!'}
          </h2>

          {activeUnit && (
            <p className={cn('text-neutral-600 dark:text-neutral-400 mb-6', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {t(activeUnit.title)}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
              <p className="text-2xl font-bold text-amber-600">+{xpEarned}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">XP</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
              <p className="text-2xl font-bold text-emerald-600">{correctCount}/{exercises.length - 1}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {isPunjabi ? 'ਸਹੀ' : isHindi ? 'सही' : 'Correct'}
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">
              <p className="text-2xl font-bold text-orange-500">🔥 {progress.streak.count}</p>
              <p className="text-xs text-orange-700 dark:text-orange-400">
                {isPunjabi ? 'ਲੜੀ' : isHindi ? 'लड़ी' : 'Streak'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setView('map')}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              {isPunjabi ? 'ਅਗਲਾ ਸਬਕ' : isHindi ? 'अगला सबक' : 'Continue'}
            </button>
            {activeUnit && (
              <button
                onClick={() => startLesson(activeUnit)}
                className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                {isPunjabi ? 'ਦੁਬਾਰਾ' : isHindi ? 'दोबारा' : 'Retry'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════
  // RENDER: LESSON (Exercises)
  // ═════════════════════════════════════════════
  if (!currentExercise) return null;

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setView('map')}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          aria-label="Exit lesson"
        >
          ✕
        </button>
        <div className="flex-1 h-3 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-sm text-neutral-500 tabular-nums">{exerciseIdx + 1}/{exercises.length}</span>
      </div>

      {/* ─── LEARN Exercise ─── */}
      {currentExercise.type === 'learn' && (() => {
        const items = currentExercise.letters || currentExercise.words || [];
        const item = items[learnStep];
        if (!item) return null;

        const isLetter = 'ipa' in item;

        return (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 shadow-lg text-center">
            <p className={cn('text-sm text-purple-600 dark:text-purple-400 mb-2', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi ? 'ਨਵਾਂ ਸਿੱਖੋ' : isHindi ? 'नया सीखें' : 'New!'} ({learnStep + 1}/{items.length})
            </p>

            {isLetter ? (
              <>
                <div className="text-8xl font-gurmukhi text-purple-700 dark:text-purple-300 mb-4">
                  {(item as LessonLetter).gurmukhi}
                </div>
                <p className="text-2xl font-medium text-neutral-900 dark:text-white mb-1">{(item as LessonLetter).roman}</p>
                <p className="text-sm text-neutral-500 font-mono mb-4">IPA: [{(item as LessonLetter).ipa}]</p>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                  <p className="font-gurmukhi text-purple-700 dark:text-purple-300">
                    {(item as LessonLetter).example} — {(item as LessonLetter).exampleMeaning}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl font-gurmukhi text-purple-700 dark:text-purple-300 mb-4">
                  {(item as LessonWord).gurmukhi}
                </div>
                <p className="text-xl font-medium text-neutral-900 dark:text-white mb-1">{(item as LessonWord).roman}</p>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                  <p className={cn('text-purple-700 dark:text-purple-300', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                    {t((item as LessonWord).meaning)}
                  </p>
                </div>
              </>
            )}

            <button
              onClick={handleLearnContinue}
              className="mt-6 w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              {isPunjabi ? 'ਅੱਗੇ' : isHindi ? 'आगे' : 'Continue'}
            </button>
          </div>
        );
      })()}

      {/* ─── CHOOSE Exercise ─── */}
      {currentExercise.type === 'choose' && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 shadow-lg text-center">
          <p className={cn('text-sm text-purple-600 dark:text-purple-400 mb-4', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {currentExercise.promptLabel}
          </p>
          <div className={cn(
            'text-7xl mb-8',
            currentExercise.prompt.length <= 3 ? 'font-gurmukhi text-purple-700 dark:text-purple-300' : 'text-2xl font-medium text-neutral-900 dark:text-white'
          )}>
            {currentExercise.prompt}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {currentExercise.options.map((opt) => {
              const isCorrect = opt === currentExercise.correct;
              const isSelected = opt === selectedAnswer;
              return (
                <button
                  key={opt}
                  onClick={() => handleChooseAnswer(opt)}
                  disabled={showFeedback}
                  className={cn(
                    'px-4 py-3.5 rounded-xl text-lg font-medium transition-all min-h-[52px] border-2',
                    !showFeedback
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 text-neutral-900 dark:text-white active:scale-95'
                      : isCorrect
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 text-emerald-800 dark:text-emerald-300'
                        : isSelected
                          ? 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-800 dark:text-red-300'
                          : 'bg-neutral-100 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 opacity-50',
                    opt.length <= 3 && 'font-gurmukhi'
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={cn(
              'mt-4 text-sm font-medium',
              selectedAnswer === currentExercise.correct ? 'text-emerald-600' : 'text-red-500'
            )}>
              {selectedAnswer === currentExercise.correct
                ? (isPunjabi ? '✓ ਸਹੀ!' : isHindi ? '✓ सही!' : '✓ Correct!')
                : (isPunjabi ? `✗ ਸਹੀ ਜਵਾਬ: ${currentExercise.correct}` : isHindi ? `✗ सही जवाब: ${currentExercise.correct}` : `✗ Correct: ${currentExercise.correct}`)}
            </div>
          )}
        </div>
      )}

      {/* ─── MATCH Exercise ─── */}
      {currentExercise.type === 'match' && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 shadow-lg">
          <p className={cn('text-sm text-purple-600 dark:text-purple-400 mb-6 text-center', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
            {isPunjabi ? 'ਜੋੜੇ ਮਿਲਾਓ' : isHindi ? 'जोड़े मिलाएँ' : 'Match the pairs'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-2">
              {currentExercise.pairs.map((pair) => (
                <button
                  key={`l-${pair.left}`}
                  onClick={() => handleMatchTap('left', pair.left)}
                  disabled={matchedPairs.has(pair.left)}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl text-lg font-gurmukhi border-2 transition-all min-h-[48px]',
                    matchedPairs.has(pair.left)
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-300 opacity-60'
                      : matchSelected?.value === pair.left
                        ? matchWrong
                          ? 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-700'
                          : 'bg-purple-200 dark:bg-purple-700 border-purple-400 text-purple-900 dark:text-white'
                        : 'bg-white dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 hover:border-purple-400 text-neutral-900 dark:text-white'
                  )}
                >
                  {pair.left}
                </button>
              ))}
            </div>
            {/* Right Column */}
            <div className="space-y-2">
              {useMemo(() => shuffle(currentExercise.pairs), [exerciseIdx]).map((pair) => (
                <button
                  key={`r-${pair.right}`}
                  onClick={() => handleMatchTap('right', pair.right)}
                  disabled={matchedPairs.has(pair.right)}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl text-base border-2 transition-all min-h-[48px]',
                    matchedPairs.has(pair.right)
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-300 opacity-60'
                      : matchSelected?.value === pair.right
                        ? matchWrong
                          ? 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-700'
                          : 'bg-purple-200 dark:bg-purple-700 border-purple-400 text-purple-900 dark:text-white'
                        : 'bg-white dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 hover:border-purple-400 text-neutral-900 dark:text-white'
                  )}
                >
                  {pair.right}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
