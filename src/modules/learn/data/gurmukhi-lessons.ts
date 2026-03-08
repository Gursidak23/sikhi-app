// ============================================================================
// GURMUKHI LESSON DATA — Duolingo-style progressive learning
// ============================================================================

export interface LessonLetter {
  gurmukhi: string;
  roman: string;
  ipa: string;
  example: string;
  exampleMeaning: string;
}

export interface LessonWord {
  gurmukhi: string;
  roman: string;
  meaning: { pa: string; en: string; hi: string };
}

export interface LessonUnit {
  id: string;
  title: { pa: string; en: string; hi: string };
  description: { pa: string; en: string; hi: string };
  icon: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  letters?: LessonLetter[];
  words?: LessonWord[];
  isWordUnit?: boolean;
}

export const LESSON_UNITS: LessonUnit[] = [
  {
    id: 'first-steps',
    title: { pa: 'ਪਹਿਲੇ ਕਦਮ', en: 'First Steps', hi: 'पहले कदम' },
    description: { pa: 'ਗੁਰਮੁਖੀ ਦੇ ਮੂਲ ਅੱਖਰ ਸਿੱਖੋ', en: 'Learn the foundation letters of Gurmukhi', hi: 'गुरमुखी के मूल अक्षर सीखें' },
    icon: 'ੳ',
    level: 'beginner',
    letters: [
      { gurmukhi: 'ੳ', roman: 'ura', ipa: 'ʊɽɑ', example: 'ਊਠ', exampleMeaning: 'camel' },
      { gurmukhi: 'ਅ', roman: 'aira', ipa: 'æɽɑ', example: 'ਅੰਬ', exampleMeaning: 'mango' },
      { gurmukhi: 'ੲ', roman: 'iri', ipa: 'iɽi', example: 'ਇੱਟ', exampleMeaning: 'brick' },
      { gurmukhi: 'ਸ', roman: 'sassaa', ipa: 'sə', example: 'ਸੱਪ', exampleMeaning: 'snake' },
      { gurmukhi: 'ਹ', roman: 'hahaa', ipa: 'hə', example: 'ਹਾਥੀ', exampleMeaning: 'elephant' },
    ],
  },
  {
    id: 'k-sounds',
    title: { pa: 'ਕ ਪਰਿਵਾਰ', en: 'K Sounds', hi: 'क परिवार' },
    description: { pa: 'ਕ, ਖ, ਗ, ਘ ਅੱਖਰ ਸਿੱਖੋ', en: 'Learn the Ka, Kha, Ga, Gha letters', hi: 'क, ख, ग, घ अक्षर सीखें' },
    icon: 'ਕ',
    level: 'beginner',
    letters: [
      { gurmukhi: 'ਕ', roman: 'kakkaa', ipa: 'kə', example: 'ਕਮਲ', exampleMeaning: 'lotus' },
      { gurmukhi: 'ਖ', roman: 'khakhaa', ipa: 'kʰə', example: 'ਖੀਰ', exampleMeaning: 'rice pudding' },
      { gurmukhi: 'ਗ', roman: 'gaggaa', ipa: 'gə', example: 'ਗੁਰੂ', exampleMeaning: 'teacher' },
      { gurmukhi: 'ਘ', roman: 'ghaghaa', ipa: 'gʱə', example: 'ਘਰ', exampleMeaning: 'home' },
    ],
  },
  {
    id: 'ch-j-sounds',
    title: { pa: 'ਚ ਅਤੇ ਜ', en: 'Ch & J Sounds', hi: 'च और ज' },
    description: { pa: 'ਚ, ਛ, ਜ, ਝ ਅੱਖਰ ਸਿੱਖੋ', en: 'Learn the Cha, Chha, Ja, Jha letters', hi: 'च, छ, ज, झ अक्षर सीखें' },
    icon: 'ਚ',
    level: 'beginner',
    letters: [
      { gurmukhi: 'ਚ', roman: 'chachchaa', ipa: 'tʃə', example: 'ਚੰਨ', exampleMeaning: 'moon' },
      { gurmukhi: 'ਛ', roman: 'chhachchhaa', ipa: 'tʃʰə', example: 'ਛੱਤ', exampleMeaning: 'roof' },
      { gurmukhi: 'ਜ', roman: 'jajjaa', ipa: 'dʒə', example: 'ਜਲ', exampleMeaning: 'water' },
      { gurmukhi: 'ਝ', roman: 'jhajjhaa', ipa: 'dʒʱə', example: 'ਝੰਡਾ', exampleMeaning: 'flag' },
    ],
  },
  {
    id: 'retroflex',
    title: { pa: 'ਟ ਵਰਗ', en: 'Retroflex Sounds', hi: 'ट वर्ग' },
    description: { pa: 'ਟ, ਠ, ਡ, ਢ, ਣ — ਜੀਭ ਤਾਲੂ ਨੂੰ ਛੂੰਹਦੀ ਹੈ', en: 'Hard T sounds — tongue touches the palate', hi: 'ट, ठ, ड, ढ, ण — जीभ तालू को छूती है' },
    icon: 'ਟ',
    level: 'beginner',
    letters: [
      { gurmukhi: 'ਟ', roman: 'tainkaa', ipa: 'ʈə', example: 'ਟੱਬ', exampleMeaning: 'tub' },
      { gurmukhi: 'ਠ', roman: 'thaithaa', ipa: 'ʈʰə', example: 'ਠੰਡ', exampleMeaning: 'cold' },
      { gurmukhi: 'ਡ', roman: 'daddaa', ipa: 'ɖə', example: 'ਡੱਬ', exampleMeaning: 'box' },
      { gurmukhi: 'ਢ', roman: 'dhaddhaa', ipa: 'ɖʱə', example: 'ਢੋਲ', exampleMeaning: 'drum' },
      { gurmukhi: 'ਣ', roman: 'naanaa', ipa: 'ɳə', example: 'ਬਾਣ', exampleMeaning: 'arrow' },
    ],
  },
  {
    id: 'dental',
    title: { pa: 'ਤ ਵਰਗ', en: 'Dental Sounds', hi: 'त वर्ग' },
    description: { pa: 'ਤ, ਥ, ਦ, ਧ, ਨ — ਜੀਭ ਦੰਦਾਂ ਨੂੰ ਛੂੰਹਦੀ ਹੈ', en: 'Soft T sounds — tongue touches the teeth', hi: 'त, थ, द, ध, न — जीभ दाँतों को छूती है' },
    icon: 'ਤ',
    level: 'intermediate',
    letters: [
      { gurmukhi: 'ਤ', roman: 'tattaa', ipa: 'tə', example: 'ਤਾਰਾ', exampleMeaning: 'star' },
      { gurmukhi: 'ਥ', roman: 'thaththaa', ipa: 'tʰə', example: 'ਥਾਲ', exampleMeaning: 'plate' },
      { gurmukhi: 'ਦ', roman: 'daddaa', ipa: 'də', example: 'ਦਮ', exampleMeaning: 'breath' },
      { gurmukhi: 'ਧ', roman: 'dhaddhaa', ipa: 'dʱə', example: 'ਧਰਮ', exampleMeaning: 'faith' },
      { gurmukhi: 'ਨ', roman: 'nannaa', ipa: 'nə', example: 'ਨਾਮ', exampleMeaning: 'name' },
    ],
  },
  {
    id: 'p-b-sounds',
    title: { pa: 'ਪ ਵਰਗ', en: 'P & B Sounds', hi: 'प वर्ग' },
    description: { pa: 'ਪ, ਫ, ਬ, ਭ, ਮ ਅੱਖਰ ਸਿੱਖੋ', en: 'Learn the labial consonants', hi: 'प, फ, ब, भ, म अक्षर सीखें' },
    icon: 'ਪ',
    level: 'intermediate',
    letters: [
      { gurmukhi: 'ਪ', roman: 'pappaa', ipa: 'pə', example: 'ਪਾਣੀ', exampleMeaning: 'water' },
      { gurmukhi: 'ਫ', roman: 'phaphaa', ipa: 'pʰə', example: 'ਫੁੱਲ', exampleMeaning: 'flower' },
      { gurmukhi: 'ਬ', roman: 'babbaa', ipa: 'bə', example: 'ਬਾਗ', exampleMeaning: 'garden' },
      { gurmukhi: 'ਭ', roman: 'bhabhaa', ipa: 'bʱə', example: 'ਭਗਤ', exampleMeaning: 'devotee' },
      { gurmukhi: 'ਮ', roman: 'mammaa', ipa: 'mə', example: 'ਮਾਤਾ', exampleMeaning: 'mother' },
    ],
  },
  {
    id: 'final-letters',
    title: { pa: 'ਬਾਕੀ ਅੱਖਰ', en: 'Final Letters', hi: 'शेष अक्षर' },
    description: { pa: 'ਯ, ਰ, ਲ, ਵ, ੜ ਨਾਲ ਵਰਣਮਾਲਾ ਪੂਰੀ ਕਰੋ', en: 'Complete the alphabet with Y, R, L, V, Rh', hi: 'य, र, ल, व, ड़ से वर्णमाला पूरी करें' },
    icon: 'ਰ',
    level: 'intermediate',
    letters: [
      { gurmukhi: 'ਯ', roman: 'yayyaa', ipa: 'jə', example: 'ਯੋਧਾ', exampleMeaning: 'warrior' },
      { gurmukhi: 'ਰ', roman: 'raaraa', ipa: 'ɾə', example: 'ਰਾਜਾ', exampleMeaning: 'king' },
      { gurmukhi: 'ਲ', roman: 'lallaa', ipa: 'lə', example: 'ਲੋਕ', exampleMeaning: 'people' },
      { gurmukhi: 'ਵ', roman: 'vavvaa', ipa: 'ʋə', example: 'ਵਾਹਿਗੁਰੂ', exampleMeaning: 'Waheguru' },
      { gurmukhi: 'ੜ', roman: 'rharha', ipa: 'ɽə', example: 'ਘੋੜਾ', exampleMeaning: 'horse' },
    ],
  },
  {
    id: 'vowel-signs',
    title: { pa: 'ਲਗਾਂ ਮਾਤਰਾ', en: 'Vowel Signs', hi: 'स्वर चिह्न' },
    description: { pa: 'ਸਾਰੀਆਂ ਮਾਤਰਾਵਾਂ ਸਿੱਖੋ', en: 'Learn all vowel modifiers that change consonant sounds', hi: 'सभी स्वर चिह्न सीखें' },
    icon: 'ਾ',
    level: 'intermediate',
    letters: [
      { gurmukhi: 'ਾ', roman: 'kannaa', ipa: 'aː', example: 'ਕਾ', exampleMeaning: 'kaa sound' },
      { gurmukhi: 'ਿ', roman: 'sihaari', ipa: 'ɪ', example: 'ਕਿ', exampleMeaning: 'ki sound' },
      { gurmukhi: 'ੀ', roman: 'bihaari', ipa: 'iː', example: 'ਕੀ', exampleMeaning: 'kee sound' },
      { gurmukhi: 'ੁ', roman: 'aunkarh', ipa: 'ʊ', example: 'ਕੁ', exampleMeaning: 'ku sound' },
      { gurmukhi: 'ੂ', roman: 'dulankarh', ipa: 'uː', example: 'ਕੂ', exampleMeaning: 'koo sound' },
      { gurmukhi: 'ੇ', roman: 'laavaan', ipa: 'eː', example: 'ਕੇ', exampleMeaning: 'kay sound' },
      { gurmukhi: 'ੈ', roman: 'dulaavaan', ipa: 'æː', example: 'ਕੈ', exampleMeaning: 'kai sound' },
      { gurmukhi: 'ੋ', roman: 'horhaa', ipa: 'oː', example: 'ਕੋ', exampleMeaning: 'ko sound' },
      { gurmukhi: 'ੌ', roman: 'kanaura', ipa: 'ɔː', example: 'ਕੌ', exampleMeaning: 'kau sound' },
    ],
  },
  {
    id: 'first-words',
    title: { pa: 'ਪਹਿਲੇ ਸ਼ਬਦ', en: 'First Words', hi: 'पहले शब्द' },
    description: { pa: 'ਆਪਣੇ ਅੱਖਰ ਗਿਆਨ ਨਾਲ ਸ਼ਬਦ ਬਣਾਓ', en: 'Build your first Punjabi words from letters you know', hi: 'अपने अक्षर ज्ञान से शब्द बनाएँ' },
    icon: '📝',
    level: 'advanced',
    isWordUnit: true,
    words: [
      { gurmukhi: 'ਨਾਮ', roman: 'naam', meaning: { pa: 'ਨਾਂ', en: 'name', hi: 'नाम' } },
      { gurmukhi: 'ਗੁਰੂ', roman: 'guru', meaning: { pa: 'ਸਤਿਗੁਰ', en: 'teacher / spiritual guide', hi: 'गुरु' } },
      { gurmukhi: 'ਸੇਵਾ', roman: 'sewa', meaning: { pa: 'ਸੇਵਾ', en: 'selfless service', hi: 'सेवा' } },
      { gurmukhi: 'ਧਰਮ', roman: 'dharam', meaning: { pa: 'ਧਰਮ', en: 'righteousness / faith', hi: 'धर्म' } },
      { gurmukhi: 'ਮਾਤਾ', roman: 'maata', meaning: { pa: 'ਮਾਂ', en: 'mother', hi: 'माता' } },
      { gurmukhi: 'ਕਮਲ', roman: 'kamal', meaning: { pa: 'ਕੰਵਲ', en: 'lotus', hi: 'कमल' } },
      { gurmukhi: 'ਪਾਣੀ', roman: 'paani', meaning: { pa: 'ਜਲ', en: 'water', hi: 'पानी' } },
      { gurmukhi: 'ਤਾਰਾ', roman: 'taara', meaning: { pa: 'ਤਾਰਾ', en: 'star', hi: 'तारा' } },
    ],
  },
];

// All letters from all units (for generating wrong options)
export function getAllLetters(): LessonLetter[] {
  return LESSON_UNITS.flatMap(u => u.letters ?? []);
}

export function getAllWords(): LessonWord[] {
  return LESSON_UNITS.flatMap(u => u.words ?? []);
}
