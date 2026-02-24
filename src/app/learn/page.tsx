'use client';

// ============================================================================
// GURMUKHI LEARNING MODULE
// ============================================================================
// Interactive Gurmukhi alphabet learning with pronunciation, practice,
// quizzes, and progress tracking
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { useLanguage } from '@/components/common/LanguageProvider';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import type { Language } from '@/types';

// Complete Gurmukhi alphabet data
const CONSONANTS = [
  { gurmukhi: 'ੳ', roman: 'ura', ipa: 'ʊɽɑ', example: 'ਊਠ (ooth) - camel', group: 'base' },
  { gurmukhi: 'ਅ', roman: 'aira', ipa: 'æɽɑ', example: 'ਅੰਬ (amb) - mango', group: 'base' },
  { gurmukhi: 'ੲ', roman: 'iri', ipa: 'iɽi', example: 'ਇੱਟ (itt) - brick', group: 'base' },
  { gurmukhi: 'ਸ', roman: 'sassaa', ipa: 'sə', example: 'ਸੱਪ (sapp) - snake', group: 'row1' },
  { gurmukhi: 'ਹ', roman: 'hahaa', ipa: 'hə', example: 'ਹਾਥੀ (haathi) - elephant', group: 'row1' },
  { gurmukhi: 'ਕ', roman: 'kakkaa', ipa: 'kə', example: 'ਕਮਲ (kamal) - lotus', group: 'row2' },
  { gurmukhi: 'ਖ', roman: 'khakhaa', ipa: 'kʰə', example: 'ਖੀਰ (kheer) - rice pudding', group: 'row2' },
  { gurmukhi: 'ਗ', roman: 'gaggaa', ipa: 'gə', example: 'ਗੁਰੂ (guru) - teacher', group: 'row2' },
  { gurmukhi: 'ਘ', roman: 'ghaghaa', ipa: 'gʱə', example: 'ਘਰ (ghar) - home', group: 'row2' },
  { gurmukhi: 'ਙ', roman: 'ngangaa', ipa: 'ŋə', example: 'ਬੰਗ (bang)', group: 'row2' },
  { gurmukhi: 'ਚ', roman: 'chachchaa', ipa: 'tʃə', example: 'ਚੰਨ (chann) - moon', group: 'row3' },
  { gurmukhi: 'ਛ', roman: 'chhachchhaa', ipa: 'tʃʰə', example: 'ਛੱਤ (chhatt) - roof', group: 'row3' },
  { gurmukhi: 'ਜ', roman: 'jajjaa', ipa: 'dʒə', example: 'ਜਲ (jal) - water', group: 'row3' },
  { gurmukhi: 'ਝ', roman: 'jhajjhaa', ipa: 'dʒʱə', example: 'ਝੰਡਾ (jhanda) - flag', group: 'row3' },
  { gurmukhi: 'ਞ', roman: 'nyanyaa', ipa: 'ɲə', example: 'ਮੰਞ (manj)', group: 'row3' },
  { gurmukhi: 'ਟ', roman: 'tainkaa', ipa: 'ʈə', example: 'ਟੱਬ (tabb) - tub', group: 'row4' },
  { gurmukhi: 'ਠ', roman: 'thaithaa', ipa: 'ʈʰə', example: 'ਠੰਡ (thand) - cold', group: 'row4' },
  { gurmukhi: 'ਡ', roman: 'daddaa', ipa: 'ɖə', example: 'ਡੱਬ (dabb) - box', group: 'row4' },
  { gurmukhi: 'ਢ', roman: 'dhaddhaa', ipa: 'ɖʱə', example: 'ਢੋਲ (dhol) - drum', group: 'row4' },
  { gurmukhi: 'ਣ', roman: 'naanaa', ipa: 'ɳə', example: 'ਬਾਣ (baan) - arrow', group: 'row4' },
  { gurmukhi: 'ਤ', roman: 'tattaa', ipa: 'tə', example: 'ਤਾਰਾ (taara) - star', group: 'row5' },
  { gurmukhi: 'ਥ', roman: 'thaththaa', ipa: 'tʰə', example: 'ਥਾਲ (thaal) - plate', group: 'row5' },
  { gurmukhi: 'ਦ', roman: 'daddaa', ipa: 'də', example: 'ਦਮ (dam) - breath', group: 'row5' },
  { gurmukhi: 'ਧ', roman: 'dhaddhaa', ipa: 'dʱə', example: 'ਧਰਮ (dharam) - faith', group: 'row5' },
  { gurmukhi: 'ਨ', roman: 'nannaa', ipa: 'nə', example: 'ਨਾਮ (naam) - name', group: 'row5' },
  { gurmukhi: 'ਪ', roman: 'pappaa', ipa: 'pə', example: 'ਪਾਣੀ (paani) - water', group: 'row6' },
  { gurmukhi: 'ਫ', roman: 'phaphaa', ipa: 'pʰə', example: 'ਫੁੱਲ (phull) - flower', group: 'row6' },
  { gurmukhi: 'ਬ', roman: 'babbaa', ipa: 'bə', example: 'ਬਾਗ (baag) - garden', group: 'row6' },
  { gurmukhi: 'ਭ', roman: 'bhabhaa', ipa: 'bʱə', example: 'ਭਗਤ (bhagat) - devotee', group: 'row6' },
  { gurmukhi: 'ਮ', roman: 'mammaa', ipa: 'mə', example: 'ਮਾਤਾ (maata) - mother', group: 'row6' },
  { gurmukhi: 'ਯ', roman: 'yayyaa', ipa: 'jə', example: 'ਯੋਧਾ (yodha) - warrior', group: 'row7' },
  { gurmukhi: 'ਰ', roman: 'raaraa', ipa: 'ɾə', example: 'ਰਾਜਾ (raaja) - king', group: 'row7' },
  { gurmukhi: 'ਲ', roman: 'lallaa', ipa: 'lə', example: 'ਲੋਕ (lok) - people', group: 'row7' },
  { gurmukhi: 'ਵ', roman: 'vavvaa', ipa: 'ʋə', example: 'ਵਾਹਿਗੁਰੂ (waheguru)', group: 'row7' },
  { gurmukhi: 'ੜ', roman: 'rharha', ipa: 'ɽə', example: 'ਘੋੜਾ (ghora) - horse', group: 'row7' },
];

const VOWELS = [
  { gurmukhi: 'ਾ', roman: 'kannaa', sound: 'aa', example: 'ਕਾ (kaa)', sign: 'ਕਾ' },
  { gurmukhi: 'ਿ', roman: 'sihaari', sound: 'i', example: 'ਕਿ (ki)', sign: 'ਕਿ' },
  { gurmukhi: 'ੀ', roman: 'bihaari', sound: 'ee', example: 'ਕੀ (kee)', sign: 'ਕੀ' },
  { gurmukhi: 'ੁ', roman: 'aunkarh', sound: 'u', example: 'ਕੁ (ku)', sign: 'ਕੁ' },
  { gurmukhi: 'ੂ', roman: 'dulankarh', sound: 'oo', example: 'ਕੂ (koo)', sign: 'ਕੂ' },
  { gurmukhi: 'ੇ', roman: 'laavaan', sound: 'ay', example: 'ਕੇ (kay)', sign: 'ਕੇ' },
  { gurmukhi: 'ੈ', roman: 'dulaavaan', sound: 'ai', example: 'ਕੈ (kai)', sign: 'ਕੈ' },
  { gurmukhi: 'ੋ', roman: 'horhaa', sound: 'o', example: 'ਕੋ (ko)', sign: 'ਕੋ' },
  { gurmukhi: 'ੌ', roman: 'kanaura', sound: 'au', example: 'ਕੌ (kau)', sign: 'ਕੌ' },
];

const NUMBERS = [
  { gurmukhi: '੦', arabic: '0', punjabi: 'ਸਿਫ਼ਰ' },
  { gurmukhi: '੧', arabic: '1', punjabi: 'ਇੱਕ' },
  { gurmukhi: '੨', arabic: '2', punjabi: 'ਦੋ' },
  { gurmukhi: '੩', arabic: '3', punjabi: 'ਤਿੰਨ' },
  { gurmukhi: '੪', arabic: '4', punjabi: 'ਚਾਰ' },
  { gurmukhi: '੫', arabic: '5', punjabi: 'ਪੰਜ' },
  { gurmukhi: '੬', arabic: '6', punjabi: 'ਛੇ' },
  { gurmukhi: '੭', arabic: '7', punjabi: 'ਸੱਤ' },
  { gurmukhi: '੮', arabic: '8', punjabi: 'ਅੱਠ' },
  { gurmukhi: '੯', arabic: '9', punjabi: 'ਨੌਂ' },
];

type Tab = 'alphabet' | 'vowels' | 'numbers' | 'practice' | 'quiz';

interface QuizQuestion {
  gurmukhi: string;
  correct: string;
  options: string[];
}

export default function LearnPage() {
  const { language, isPunjabi } = useLanguage();
  const isHindi = language === 'hi';
  const [tab, setTab] = useState<Tab>('alphabet');
  const [selectedLetter, setSelectedLetter] = useState<typeof CONSONANTS[0] | null>(null);
  const [practiceInput, setPracticeInput] = useState('');
  const [practiceTarget, setPracticeTarget] = useState<string>('');
  const [streak, setStreak] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [learnedLetters, setLearnedLetters] = useState<Set<string>>(new Set());

  // Load learned letters from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sikhi-learned-letters');
      if (saved) {
        try {
          setLearnedLetters(new Set(JSON.parse(saved)));
        } catch { /* ignore */ }
      }
    }
  }, []);

  // Save learned letters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sikhi-learned-letters', JSON.stringify(Array.from(learnedLetters)));
    }
  }, [learnedLetters]);

  const markLearned = (letter: string) => {
    setLearnedLetters(prev => {
      const next = new Set(prev);
      next.add(letter);
      return next;
    });
  };

  // Practice mode - random letter matching
  const generatePracticeTarget = useCallback(() => {
    const allLetters = CONSONANTS.map(c => c.gurmukhi);
    const target = allLetters[Math.floor(Math.random() * allLetters.length)];
    setPracticeTarget(target);
    setPracticeInput('');
  }, []);

  useEffect(() => {
    if (tab === 'practice' && !practiceTarget) {
      generatePracticeTarget();
    }
  }, [tab, practiceTarget, generatePracticeTarget]);

  const checkPractice = () => {
    if (practiceInput === practiceTarget) {
      setStreak(prev => prev + 1);
      markLearned(practiceTarget);
      generatePracticeTarget();
    } else {
      setStreak(0);
    }
  };

  // Quiz mode
  const generateQuiz = useCallback(() => {
    const questions: QuizQuestion[] = [];
    const shuffled = [...CONSONANTS].sort(() => Math.random() - 0.5).slice(0, 10);
    
    for (const letter of shuffled) {
      const wrong = CONSONANTS
        .filter(c => c.gurmukhi !== letter.gurmukhi)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.roman);
      
      const options = [...wrong, letter.roman].sort(() => Math.random() - 0.5);
      questions.push({ gurmukhi: letter.gurmukhi, correct: letter.roman, options });
    }
    
    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswer(null);
  }, []);

  useEffect(() => {
    if (tab === 'quiz' && quizQuestions.length === 0) {
      generateQuiz();
    }
  }, [tab, quizQuestions.length, generateQuiz]);

  const handleQuizAnswer = (answer: string) => {
    setQuizAnswer(answer);
    if (answer === quizQuestions[quizIndex].correct) {
      setQuizScore(prev => prev + 1);
      markLearned(quizQuestions[quizIndex].gurmukhi);
    }
    setTimeout(() => {
      setQuizAnswer(null);
      if (quizIndex < quizQuestions.length - 1) {
        setQuizIndex(prev => prev + 1);
      }
    }, 1200);
  };

  const progress = Math.round((learnedLetters.size / CONSONANTS.length) * 100);

  const tabs: { id: Tab; label: { pa: string; en: string; hi?: string }; icon: string }[] = [
    { id: 'alphabet', label: { pa: 'ਅੱਖਰ', en: 'Alphabet', hi: 'अक्षर' }, icon: 'ੳ' },
    { id: 'vowels', label: { pa: 'ਲਗਾਂ ਮਾਤਰਾ', en: 'Vowels', hi: 'स्वर' }, icon: 'ਾ' },
    { id: 'numbers', label: { pa: 'ਅੰਕ', en: 'Numbers', hi: 'अंक' }, icon: '੧' },
    { id: 'practice', label: { pa: 'ਅਭਿਆਸ', en: 'Practice', hi: 'अभ्यास' }, icon: '✍️' },
    { id: 'quiz', label: { pa: 'ਕੁਇਜ਼', en: 'Quiz', hi: 'क्विज़' }, icon: '🎯' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 via-white to-indigo-50 dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#1a1a2e]">
      <MainNavigation />

      <main id="main-content" className="flex-1">
        {/* Header */}
        <section className="py-8 md:py-12 text-center">
          <div className="container-content">
            <div className="text-5xl font-gurmukhi text-purple-600 dark:text-purple-400 mb-3">ੳ ਅ ੲ</div>
            <h1 className={cn('text-3xl md:text-4xl font-bold text-purple-900 dark:text-purple-200', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi ? 'ਗੁਰਮੁਖੀ ਸਿੱਖੋ' : isHindi ? 'गुरमुखी सीखें' : 'Learn Gurmukhi'}
            </h1>
            <p className={cn('text-purple-700 dark:text-purple-300 mt-2 text-lg', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi ? 'ਗੁਰੂ ਦੀ ਲਿਪੀ — ਅੱਖਰ, ਲਗਾਂ, ਅੰਕ ਅਤੇ ਅਭਿਆਸ' : isHindi ? 'गुरु की लिपि — अक्षर, स्वर, अंक और अभ्यास' : "The Guru's Script — Letters, Vowels, Numbers & Practice"}
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mt-6">
              <div className="flex items-center justify-between text-sm text-purple-600 dark:text-purple-400 mb-2">
                <span>{isPunjabi ? 'ਤਰੱਕੀ' : isHindi ? 'प्रगति' : 'Progress'}</span>
                <span>{progress}% ({learnedLetters.size}/{CONSONANTS.length})</span>
              </div>
              <div className="h-3 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section>
          <div className="container-content">
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] flex items-center gap-2',
                    tab === t.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-purple-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
                  )}
                >
                  <span className="font-gurmukhi">{t.icon}</span>
                  <span className={isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : ''}>{isPunjabi ? t.label.pa : isHindi ? (t.label.hi || t.label.en) : t.label.en}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-16">
          <div className="container-content max-w-6xl">
            {/* Alphabet Tab */}
            {tab === 'alphabet' && (
              <div>
                {/* Letter Detail Modal */}
                {selectedLetter && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLetter(null)}>
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      <div className="text-center">
                        <div className="text-8xl font-gurmukhi text-purple-600 dark:text-purple-400 mb-4">
                          {selectedLetter.gurmukhi}
                        </div>
                        <p className="text-2xl font-medium text-neutral-900 dark:text-white mb-1">{selectedLetter.roman}</p>
                        <p className="text-sm text-neutral-500 font-mono">IPA: [{selectedLetter.ipa}]</p>
                        <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                          <p className="text-sm text-purple-700 dark:text-purple-300 font-gurmukhi">{selectedLetter.example}</p>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => { markLearned(selectedLetter.gurmukhi); setSelectedLetter(null); }}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                          >
                            ✓ {isPunjabi ? 'ਸਿੱਖ ਲਿਆ' : isHindi ? 'सीख लिया' : 'Mark Learned'}
                          </button>
                          <button
                            onClick={() => setSelectedLetter(null)}
                            className="px-4 py-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                          >
                            {isPunjabi ? 'ਬੰਦ' : isHindi ? 'बंद' : 'Close'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Letter Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2 sm:gap-3">
                  {CONSONANTS.map((letter) => (
                    <button
                      key={letter.gurmukhi}
                      onClick={() => setSelectedLetter(letter)}
                      className={cn(
                        'aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all hover:scale-105 active:scale-95 min-h-[60px]',
                        learnedLetters.has(letter.gurmukhi)
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                          : 'bg-white dark:bg-neutral-800 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 hover:border-purple-400 dark:hover:border-purple-600'
                      )}
                    >
                      <span className="font-gurmukhi text-2xl sm:text-3xl">{letter.gurmukhi}</span>
                      <span className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">{letter.roman}</span>
                      {learnedLetters.has(letter.gurmukhi) && (
                        <span className="text-[10px] text-emerald-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Vowels Tab */}
            {tab === 'vowels' && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {VOWELS.map((vowel) => (
                  <div key={vowel.roman} className="bg-white dark:bg-neutral-800 rounded-xl border border-indigo-200 dark:border-indigo-800 p-4 sm:p-6 text-center hover:shadow-lg transition-all">
                    <div className="text-4xl sm:text-5xl font-gurmukhi text-indigo-600 dark:text-indigo-400 mb-2">
                      {vowel.sign}
                    </div>
                    <p className="text-lg font-medium text-neutral-900 dark:text-white">{vowel.roman}</p>
                    <p className="text-sm text-neutral-500">Sound: {vowel.sound}</p>
                    <p className="text-sm font-gurmukhi text-indigo-600 dark:text-indigo-400 mt-2">{vowel.example}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Numbers Tab */}
            {tab === 'numbers' && (
              <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-3 sm:gap-4">
                {NUMBERS.map((num) => (
                  <div key={num.arabic} className="bg-white dark:bg-neutral-800 rounded-xl border border-amber-200 dark:border-amber-800 p-4 text-center hover:shadow-lg transition-all">
                    <div className="text-4xl sm:text-5xl font-gurmukhi text-amber-600 dark:text-amber-400 mb-1">
                      {num.gurmukhi}
                    </div>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">{num.arabic}</p>
                    <p className="text-xs font-gurmukhi text-amber-600 dark:text-amber-400">{num.punjabi}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Practice Tab */}
            {tab === 'practice' && (
              <div className="max-w-lg mx-auto text-center">
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 shadow-lg">
                  <p className={cn('text-sm text-purple-600 dark:text-purple-400 mb-4', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                    {isPunjabi ? 'ਇਹ ਅੱਖਰ ਟਾਈਪ ਕਰੋ:' : isHindi ? 'यह अक्षर टाइप करें:' : 'Type this letter:'}
                  </p>
                  <div className="text-8xl font-gurmukhi text-purple-700 dark:text-purple-300 mb-6">
                    {practiceTarget}
                  </div>
                  <div className="text-sm text-neutral-500 mb-4">
                    {CONSONANTS.find(c => c.gurmukhi === practiceTarget)?.roman || ''}
                  </div>
                  <input
                    type="text"
                    value={practiceInput}
                    onChange={(e) => setPracticeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkPractice()}
                    className="w-32 text-center text-4xl font-gurmukhi px-4 py-3 border-2 border-purple-300 dark:border-purple-700 rounded-xl bg-purple-50 dark:bg-purple-900/20 focus:ring-2 focus:ring-purple-500 outline-none"
                    autoFocus
                    lang="pa"
                  />
                  <div className="flex gap-3 justify-center mt-6">
                    <button onClick={checkPractice} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                      {isPunjabi ? 'ਚੈੱਕ ਕਰੋ' : isHindi ? 'जाँचें' : 'Check'}
                    </button>
                    <button onClick={generatePracticeTarget} className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">
                      {isPunjabi ? 'ਅਗਲਾ' : isHindi ? 'अगला' : 'Skip'}
                    </button>
                  </div>
                  <div className="mt-6 text-lg">
                    🔥 {isPunjabi ? 'ਲੜੀ' : isHindi ? 'लड़ी' : 'Streak'}: <span className="font-bold text-purple-600">{streak}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quiz Tab */}
            {tab === 'quiz' && quizQuestions.length > 0 && (
              <div className="max-w-lg mx-auto text-center">
                {quizIndex < quizQuestions.length ? (
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 shadow-lg">
                    {/* Progress */}
                    <div className="flex items-center justify-between text-sm text-neutral-500 mb-6">
                      <span>{isPunjabi ? `ਸਵਾਲ ${quizIndex + 1}/${quizQuestions.length}` : isHindi ? `सवाल ${quizIndex + 1}/${quizQuestions.length}` : `Question ${quizIndex + 1}/${quizQuestions.length}`}</span>
                      <span>🎯 {quizScore}/{quizIndex}</span>
                    </div>

                    <p className={cn('text-sm text-purple-600 dark:text-purple-400 mb-4', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                      {isPunjabi ? 'ਇਸ ਅੱਖਰ ਦਾ ਉਚਾਰਨ ਕੀ ਹੈ?' : isHindi ? 'इस अक्षर का उच्चारण क्या है?' : 'What is the pronunciation?'}
                    </p>
                    <div className="text-8xl font-gurmukhi text-purple-700 dark:text-purple-300 mb-8">
                      {quizQuestions[quizIndex].gurmukhi}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {quizQuestions[quizIndex].options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => !quizAnswer && handleQuizAnswer(opt)}
                          disabled={!!quizAnswer}
                          className={cn(
                            'px-4 py-3 rounded-xl text-lg font-medium transition-all min-h-[48px]',
                            quizAnswer === null
                              ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 text-neutral-900 dark:text-white'
                              : opt === quizQuestions[quizIndex].correct
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-400 text-emerald-800 dark:text-emerald-300'
                                : opt === quizAnswer
                                  ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-400 text-red-800 dark:text-red-300'
                                  : 'bg-neutral-100 dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 opacity-50'
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Quiz Complete */
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 shadow-lg">
                    <div className="text-6xl mb-4">{quizScore >= 8 ? '🏆' : quizScore >= 5 ? '👍' : '💪'}</div>
                    <h2 className={cn('text-2xl font-bold text-neutral-900 dark:text-white mb-2', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                      {isPunjabi ? 'ਕੁਇਜ਼ ਪੂਰਾ!' : isHindi ? 'क्विज़ पूरा!' : 'Quiz Complete!'}
                    </h2>
                    <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 my-4">
                      {quizScore}/{quizQuestions.length}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {quizScore >= 8 ? (isPunjabi ? 'ਬਹੁਤ ਵਧੀਆ!' : isHindi ? 'बहुत बढ़िया!' : 'Excellent!') : quizScore >= 5 ? (isPunjabi ? 'ਚੰਗਾ ਕੰਮ!' : isHindi ? 'अच्छा काम!' : 'Good work!') : (isPunjabi ? 'ਹੋਰ ਅਭਿਆਸ ਕਰੋ' : isHindi ? 'और अभ्यास करें' : 'Keep practicing!')}
                    </p>
                    <button
                      onClick={generateQuiz}
                      className="mt-6 px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      {isPunjabi ? 'ਦੁਬਾਰਾ ਖੇਡੋ' : isHindi ? 'दोबारा खेलें' : 'Play Again'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}
