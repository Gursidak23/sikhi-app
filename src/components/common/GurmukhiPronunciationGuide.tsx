'use client';

// ============================================================================
// GURMUKHI PRONUNCIATION GUIDE
// ============================================================================
// Interactive guide for learning Gurmukhi pronunciation
// Click on letters to hear pronunciation and see examples
// ============================================================================

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

interface GurmukhiLetter {
  letter: string;
  name: { pa: string; en: string; hi?: string };
  pronunciation: string;
  example?: { word: string; meaning: string };
  category: 'vowel-carrier' | 'consonant' | 'vowel-sign' | 'nasal' | 'special';
}

const GURMUKHI_ALPHABET: GurmukhiLetter[] = [
  // Vowel Carriers (ਊੜਾ, ਅੈੜਾ, ਈੜੀ)
  { letter: 'ੳ', name: { pa: 'ਊੜਾ', en: 'Oora' }, pronunciation: 'oo', category: 'vowel-carrier' },
  { letter: 'ਅ', name: { pa: 'ਅੈੜਾ', en: 'Aira' }, pronunciation: 'a', category: 'vowel-carrier' },
  { letter: 'ੲ', name: { pa: 'ਈੜੀ', en: 'Eeri' }, pronunciation: 'ee', category: 'vowel-carrier' },
  
  // Consonants
  { letter: 'ਸ', name: { pa: 'ਸੱਸਾ', en: 'Sassa' }, pronunciation: 's', example: { word: 'ਸਤਿ', meaning: 'Truth' }, category: 'consonant' },
  { letter: 'ਹ', name: { pa: 'ਹਾਹਾ', en: 'Haha' }, pronunciation: 'h', example: { word: 'ਹਰਿ', meaning: 'God' }, category: 'consonant' },
  { letter: 'ਕ', name: { pa: 'ਕੱਕਾ', en: 'Kakka' }, pronunciation: 'k', example: { word: 'ਕਰਤਾ', meaning: 'Creator' }, category: 'consonant' },
  { letter: 'ਖ', name: { pa: 'ਖੱਖਾ', en: 'Khakha' }, pronunciation: 'kh', example: { word: 'ਖਾਲਸਾ', meaning: 'Pure' }, category: 'consonant' },
  { letter: 'ਗ', name: { pa: 'ਗੱਗਾ', en: 'Gagga' }, pronunciation: 'g', example: { word: 'ਗੁਰੂ', meaning: 'Teacher' }, category: 'consonant' },
  { letter: 'ਘ', name: { pa: 'ਘੱਘਾ', en: 'Ghagha' }, pronunciation: 'gh', category: 'consonant' },
  { letter: 'ਙ', name: { pa: 'ਙੰਙਾ', en: 'Nganga' }, pronunciation: 'ng', category: 'nasal' },
  
  { letter: 'ਚ', name: { pa: 'ਚੱਚਾ', en: 'Chacha' }, pronunciation: 'ch', category: 'consonant' },
  { letter: 'ਛ', name: { pa: 'ਛੱਛਾ', en: 'Chhachha' }, pronunciation: 'chh', category: 'consonant' },
  { letter: 'ਜ', name: { pa: 'ਜੱਜਾ', en: 'Jajja' }, pronunciation: 'j', example: { word: 'ਜਪੁ', meaning: 'Meditation' }, category: 'consonant' },
  { letter: 'ਝ', name: { pa: 'ਝੱਝਾ', en: 'Jhajha' }, pronunciation: 'jh', category: 'consonant' },
  { letter: 'ਞ', name: { pa: 'ਞੰਞਾ', en: 'Nyanya' }, pronunciation: 'ny', category: 'nasal' },
  
  { letter: 'ਟ', name: { pa: 'ਟੈਂਕਾ', en: 'Tainka' }, pronunciation: 't (hard)', category: 'consonant' },
  { letter: 'ਠ', name: { pa: 'ਠੱਠਾ', en: 'Thatha' }, pronunciation: 'th (hard)', category: 'consonant' },
  { letter: 'ਡ', name: { pa: 'ਡੱਡਾ', en: 'Dadda' }, pronunciation: 'd (hard)', category: 'consonant' },
  { letter: 'ਢ', name: { pa: 'ਢੱਢਾ', en: 'Dhadha' }, pronunciation: 'dh (hard)', category: 'consonant' },
  { letter: 'ਣ', name: { pa: 'ਣਾਣਾ', en: 'Nana' }, pronunciation: 'n (retroflex)', category: 'nasal' },
  
  { letter: 'ਤ', name: { pa: 'ਤੱਤਾ', en: 'Tatta' }, pronunciation: 't (soft)', category: 'consonant' },
  { letter: 'ਥ', name: { pa: 'ਥੱਥਾ', en: 'Thatha' }, pronunciation: 'th (soft)', category: 'consonant' },
  { letter: 'ਦ', name: { pa: 'ਦੱਦਾ', en: 'Dadda' }, pronunciation: 'd (soft)', category: 'consonant' },
  { letter: 'ਧ', name: { pa: 'ਧੱਧਾ', en: 'Dhadha' }, pronunciation: 'dh (soft)', category: 'consonant' },
  { letter: 'ਨ', name: { pa: 'ਨੱਨਾ', en: 'Nanna' }, pronunciation: 'n', example: { word: 'ਨਾਮੁ', meaning: 'Name' }, category: 'nasal' },
  
  { letter: 'ਪ', name: { pa: 'ਪੱਪਾ', en: 'Pappa' }, pronunciation: 'p', example: { word: 'ਪੁਰਖੁ', meaning: 'Being' }, category: 'consonant' },
  { letter: 'ਫ', name: { pa: 'ਫੱਫਾ', en: 'Phaphha' }, pronunciation: 'ph', category: 'consonant' },
  { letter: 'ਬ', name: { pa: 'ਬੱਬਾ', en: 'Babba' }, pronunciation: 'b', example: { word: 'ਬਾਣੀ', meaning: 'Divine Word' }, category: 'consonant' },
  { letter: 'ਭ', name: { pa: 'ਭੱਭਾ', en: 'Bhabha' }, pronunciation: 'bh', category: 'consonant' },
  { letter: 'ਮ', name: { pa: 'ਮੱਮਾ', en: 'Mamma' }, pronunciation: 'm', example: { word: 'ਮੂਰਤਿ', meaning: 'Form' }, category: 'consonant' },
  
  { letter: 'ਯ', name: { pa: 'ਯੱਯਾ', en: 'Yaya' }, pronunciation: 'y', category: 'consonant' },
  { letter: 'ਰ', name: { pa: 'ਰਾਰਾ', en: 'Rara' }, pronunciation: 'r', category: 'consonant' },
  { letter: 'ਲ', name: { pa: 'ਲੱਲਾ', en: 'Lalla' }, pronunciation: 'l', category: 'consonant' },
  { letter: 'ਵ', name: { pa: 'ਵੱਵਾ', en: 'Vava' }, pronunciation: 'v/w', example: { word: 'ਵਾਹਿਗੁਰੂ', meaning: 'Wonderful Lord' }, category: 'consonant' },
  { letter: 'ੜ', name: { pa: 'ੜਾੜਾ', en: 'Rarra' }, pronunciation: 'r (hard)', category: 'consonant' },
];

const VOWEL_SIGNS: GurmukhiLetter[] = [
  { letter: 'ਾ', name: { pa: 'ਕੰਨਾ', en: 'Kanna' }, pronunciation: 'aa', category: 'vowel-sign' },
  { letter: 'ਿ', name: { pa: 'ਸਿਹਾਰੀ', en: 'Sihari' }, pronunciation: 'i', category: 'vowel-sign' },
  { letter: 'ੀ', name: { pa: 'ਬਿਹਾਰੀ', en: 'Bihari' }, pronunciation: 'ee', category: 'vowel-sign' },
  { letter: 'ੁ', name: { pa: 'ਔਂਕੜ', en: 'Aunkar' }, pronunciation: 'u', category: 'vowel-sign' },
  { letter: 'ੂ', name: { pa: 'ਦੁਲੈਂਕੜ', en: 'Dulainkar' }, pronunciation: 'oo', category: 'vowel-sign' },
  { letter: 'ੇ', name: { pa: 'ਲਾਂਵਾਂ', en: 'Laanvan' }, pronunciation: 'e', category: 'vowel-sign' },
  { letter: 'ੈ', name: { pa: 'ਦੁਲਾਂਵਾਂ', en: 'Dulaanvan' }, pronunciation: 'ai', category: 'vowel-sign' },
  { letter: 'ੋ', name: { pa: 'ਹੋੜਾ', en: 'Hora' }, pronunciation: 'o', category: 'vowel-sign' },
  { letter: 'ੌ', name: { pa: 'ਕਨੌੜਾ', en: 'Kanaura' }, pronunciation: 'au', category: 'vowel-sign' },
];

export function GurmukhiPronunciationGuide({ language }: { language: Language }) {
  const [selectedLetter, setSelectedLetter] = useState<GurmukhiLetter | null>(null);
  const [activeTab, setActiveTab] = useState<'consonants' | 'vowels'>('consonants');
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  const getCategoryColor = (category: GurmukhiLetter['category']) => {
    switch (category) {
      case 'vowel-carrier':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700';
      case 'consonant':
        return 'bg-neela-100 dark:bg-neela-900/30 text-neela-800 dark:text-neela-200 border-neela-300 dark:border-neela-700';
      case 'vowel-sign':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700';
      case 'nasal':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700';
      case 'special':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700';
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-neela-600 to-neela-700 text-white p-6">
        <h2 className="text-xl font-gurmukhi mb-2">
          {isPunjabi ? 'ਗੁਰਮੁਖੀ ਉਚਾਰਨ ਗਾਈਡ' : isHindi ? 'गुरमुखी उच्चारण गाइड' : 'Gurmukhi Pronunciation Guide'}
        </h2>
        <p className="text-neela-100 text-sm">
          {isPunjabi 
            ? 'ਅੱਖਰਾਂ ਤੇ ਕਲਿੱਕ ਕਰੋ ਉਚਾਰਨ ਸਿੱਖਣ ਲਈ' 
            : isHindi ? 'अक्षरों पर क्लिक करें उच्चारण सीखने के लिए'
            : 'Click on letters to learn pronunciation'
          }
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => setActiveTab('consonants')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors',
            activeTab === 'consonants'
              ? 'bg-neela-50 dark:bg-neela-900/50 text-neela-700 dark:text-neela-300 border-b-2 border-neela-600'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          )}
        >
          {isPunjabi ? 'ਵਿਅੰਜਨ' : isHindi ? 'व्यंजन' : 'Consonants'}
        </button>
        <button
          onClick={() => setActiveTab('vowels')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors',
            activeTab === 'vowels'
              ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-b-2 border-green-600'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
          )}
        >
          {isPunjabi ? 'ਲਗਾਂ ਮਾਤਰਾਂ' : isHindi ? 'लगाँ मात्राएँ' : 'Vowel Signs'}
        </button>
      </div>

      {/* Letter Grid */}
      <div className="p-4">
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
          {(activeTab === 'consonants' ? GURMUKHI_ALPHABET : VOWEL_SIGNS).map((item) => (
            <button
              key={item.letter}
              onClick={() => setSelectedLetter(item)}
              className={cn(
                'aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition-all',
                'hover:scale-105 active:scale-95',
                getCategoryColor(item.category),
                selectedLetter?.letter === item.letter && 'ring-2 ring-offset-2 ring-neela-500'
              )}
            >
              <span className="font-gurmukhi text-2xl sm:text-3xl">
                {item.category === 'vowel-sign' ? `ਕ${item.letter}` : item.letter}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Letter Details */}
      {selectedLetter && (
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-20 h-20 rounded-xl flex items-center justify-center font-gurmukhi text-4xl border-2',
              getCategoryColor(selectedLetter.category)
            )}>
              {selectedLetter.category === 'vowel-sign' 
                ? `ਕ${selectedLetter.letter}` 
                : selectedLetter.letter
              }
            </div>
            <div className="flex-1">
              <h3 className="font-gurmukhi text-xl text-neutral-900 dark:text-neutral-100">
                {isPunjabi ? selectedLetter.name.pa : isHindi ? (selectedLetter.name.hi || selectedLetter.name.pa) : selectedLetter.name.en}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                <span className="font-medium">{isPunjabi ? 'ਉਚਾਰਨ' : isHindi ? 'उच्चारण' : 'Pronunciation'}:</span>{' '}
                <span className="text-lg font-mono">{selectedLetter.pronunciation}</span>
              </p>
              {selectedLetter.example && (
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                  <span className="font-medium">{isPunjabi ? 'ਉਦਾਹਰਨ' : isHindi ? 'उदाहरण' : 'Example'}:</span>{' '}
                  <span className="font-gurmukhi text-lg">{selectedLetter.example.word}</span>
                  <span className="text-sm ml-2">({selectedLetter.example.meaning})</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-neutral-100 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400"></span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {isPunjabi ? 'ਸਵਰ ਵਾਹਕ' : isHindi ? 'स्वर वाहक' : 'Vowel Carriers'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-neela-400"></span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {isPunjabi ? 'ਵਿਅੰਜਨ' : isHindi ? 'व्यंजन' : 'Consonants'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-400"></span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {isPunjabi ? 'ਨਾਸਕ' : isHindi ? 'नासिक' : 'Nasals'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-400"></span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {isPunjabi ? 'ਲਗਾਂ ਮਾਤਰਾਂ' : isHindi ? 'लगाँ मात्राएँ' : 'Vowel Signs'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for quick reference
export function GurmukhiQuickReference() {
  return (
    <div className="bg-gradient-to-br from-neela-50 to-amber-50 dark:from-neela-900/30 dark:to-amber-900/30 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
        Quick Gurmukhi Reference
      </h4>
      <div className="grid grid-cols-10 gap-1 font-gurmukhi text-sm text-center">
        {['ੳ', 'ਅ', 'ੲ', 'ਸ', 'ਹ', 'ਕ', 'ਖ', 'ਗ', 'ਘ', 'ਙ'].map((char) => (
          <span key={char} className="bg-white dark:bg-neutral-800 rounded p-1">{char}</span>
        ))}
        {['ਚ', 'ਛ', 'ਜ', 'ਝ', 'ਞ', 'ਟ', 'ਠ', 'ਡ', 'ਢ', 'ਣ'].map((char) => (
          <span key={char} className="bg-white dark:bg-neutral-800 rounded p-1">{char}</span>
        ))}
        {['ਤ', 'ਥ', 'ਦ', 'ਧ', 'ਨ', 'ਪ', 'ਫ', 'ਬ', 'ਭ', 'ਮ'].map((char) => (
          <span key={char} className="bg-white dark:bg-neutral-800 rounded p-1">{char}</span>
        ))}
        {['ਯ', 'ਰ', 'ਲ', 'ਵ', 'ੜ', 'ਾ', 'ਿ', 'ੀ', 'ੁ', 'ੂ'].map((char) => (
          <span key={char} className="bg-white dark:bg-neutral-800 rounded p-1">{char}</span>
        ))}
      </div>
    </div>
  );
}
