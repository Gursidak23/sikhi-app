// ============================================================================
// DETAILED GURU SAHIBAAN DATA
// ============================================================================
// Comprehensive biographical information about all 10 Guru Sahibaan
// All information is source-attributed as per CONTENT_GUIDELINES.md
// Sources: Suraj Prakash (Bhai Santokh Singh), Sri Gur Panth Prakash (Rattan Singh Bhangu),
//          Bansavalinama (Kesar Singh Chhibber), SGPC Publications
// ============================================================================

import type { MultilingualText } from '@/types';

export interface GuruDetail {
  id: string;
  guruNumber: number;
  name: MultilingualText;
  birthYear: number;
  deathYear: number;
  birthPlace: MultilingualText;
  deathPlace: MultilingualText;
  fatherName: MultilingualText;
  motherName: MultilingualText;
  spouseName?: MultilingualText;
  children?: MultilingualText[];
  gurgaddiDate?: string; // Date of assuming Guruship
  gurgaddiAge?: number;
  biography: MultilingualText;
  keyContributions: {
    title: MultilingualText;
    description: MultilingualText;
    source: string;
  }[];
  majorEvents: {
    year: number;
    title: MultilingualText;
    description: MultilingualText;
    source: string;
  }[];
  baniContributed?: {
    shabadCount: number;
    salokCount?: number;
    description: MultilingualText;
  };
  sources: {
    name: string;
    author: string;
    year?: number;
    type: 'PRIMARY' | 'SECONDARY' | 'TEEKA';
  }[];
}

export const GURU_SAHIBAAN_DETAILS: GuruDetail[] = [
  // ========================================================================
  // SRI GURU NANAK DEV JI
  // ========================================================================
  {
    id: 'guru-nanak',
    guruNumber: 1,
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ',
      en: 'Sri Guru Nanak Dev Ji',
      hi: 'श्री गुरु नानक देव जी',
    },
    birthYear: 1469,
    deathYear: 1539,
    birthPlace: {
      pa: 'ਰਾਇ ਭੋਇ ਦੀ ਤਲਵੰਡੀ (ਨਨਕਾਣਾ ਸਾਹਿਬ)',
      en: 'Rai Bhoi di Talwandi (Nankana Sahib)',
    },
    deathPlace: {
      pa: 'ਕਰਤਾਰਪੁਰ ਸਾਹਿਬ',
      en: 'Kartarpur Sahib',
    },
    fatherName: {
      pa: 'ਮਹਿਤਾ ਕਾਲੂ ਜੀ',
      en: 'Mehta Kalu Ji',
    },
    motherName: {
      pa: 'ਮਾਤਾ ਤ੍ਰਿਪਤਾ ਜੀ',
      en: 'Mata Tripta Ji',
    },
    spouseName: {
      pa: 'ਮਾਤਾ ਸੁਲੱਖਣੀ ਜੀ',
      en: 'Mata Sulakhni Ji',
    },
    children: [
      { pa: 'ਬਾਬਾ ਸ੍ਰੀ ਚੰਦ ਜੀ', en: 'Baba Sri Chand Ji' },
      { pa: 'ਬਾਬਾ ਲਖਮੀ ਦਾਸ ਜੀ', en: 'Baba Lakhmi Das Ji' },
    ],
    biography: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਸਿੱਖ ਧਰਮ ਦੇ ਬਾਨੀ ਹਨ। ਆਪ ਜੀ ਨੇ ੧੪੬੯ ਵਿੱਚ ਕੱਤਕ ਦੀ ਪੂਰਨਮਾਸ਼ੀ ਨੂੰ ਪ੍ਰਕਾਸ਼ ਕੀਤਾ। ਆਪ ਜੀ ਨੇ ਇੱਕ ਓਅੰਕਾਰ ਦਾ ਸੰਦੇਸ਼ ਦਿੱਤਾ - ਕਿ ਪ੍ਰਮਾਤਮਾ ਇੱਕ ਹੈ ਅਤੇ ਸਾਰੀ ਮਨੁੱਖਤਾ ਬਰਾਬਰ ਹੈ। ਆਪ ਜੀ ਨੇ ਚਾਰ ਉਦਾਸੀਆਂ (ਯਾਤਰਾਵਾਂ) ਕੀਤੀਆਂ ਜੋ ਪੂਰਬ ਤੋਂ ਪੱਛਮ ਅਤੇ ਉੱਤਰ ਤੋਂ ਦੱਖਣ ਤੱਕ ਫੈਲੀਆਂ। ਆਪ ਜੀ ਨੇ ਕੀਰਤ ਕਰੋ, ਨਾਮ ਜਪੋ, ਵੰਡ ਛਕੋ ਦਾ ਸਿਧਾਂਤ ਦਿੱਤਾ।',
      en: 'Sri Guru Nanak Dev Ji is the founder of Sikhi. They manifested in 1469 on the full moon of Kattak. They gave the message of Ik Onkar - that the Divine is One and all humanity is equal. They undertook four Udasis (journeys) spanning from East to West and North to South. They established the principles of Kirat Karo (honest work), Naam Japo (remember the Divine), and Vand Chhako (share with others).',
    },
    keyContributions: [
      {
        title: { pa: 'ਸਿੱਖ ਧਰਮ ਦੀ ਸਥਾਪਨਾ', en: 'Foundation of Sikhi' },
        description: {
          pa: 'ਇੱਕ ਓਅੰਕਾਰ ਦੇ ਸਿਧਾਂਤ ਤੇ ਆਧਾਰਿਤ ਨਵੇਂ ਮਾਰਗ ਦੀ ਸਥਾਪਨਾ',
          en: 'Established a new path based on the principle of Ik Onkar',
        },
        source: 'Suraj Prakash, Bhai Santokh Singh',
      },
      {
        title: { pa: 'ਚਾਰ ਉਦਾਸੀਆਂ', en: 'Four Udasis (Journeys)' },
        description: {
          pa: 'ਪੂਰਬ ਵਿੱਚ ਅਸਾਮ, ਦੱਖਣ ਵਿੱਚ ਸ੍ਰੀਲੰਕਾ, ਪੱਛਮ ਵਿੱਚ ਮੱਕਾ-ਮਦੀਨਾ, ਅਤੇ ਉੱਤਰ ਵਿੱਚ ਤਿੱਬਤ ਤੱਕ ਯਾਤਰਾਵਾਂ',
          en: 'Journeys to Assam in East, Sri Lanka in South, Mecca-Medina in West, and Tibet in North',
        },
        source: 'Suraj Prakash, Bhai Santokh Singh',
      },
      {
        title: { pa: 'ਲੰਗਰ ਪ੍ਰਥਾ', en: 'Langar Institution' },
        description: {
          pa: 'ਸਾਂਝੀ ਰਸੋਈ ਦੀ ਸ਼ੁਰੂਆਤ ਜਿੱਥੇ ਸਾਰੇ ਬਰਾਬਰ ਬੈਠ ਕੇ ਖਾਂਦੇ ਹਨ',
          en: 'Established communal kitchen where all sit and eat as equals',
        },
        source: 'Suraj Prakash, Bhai Santokh Singh',
      },
      {
        title: { pa: 'ਸੰਗਤ ਅਤੇ ਪੰਗਤ', en: 'Sangat and Pangat' },
        description: {
          pa: 'ਇਕੱਠੇ ਬੈਠ ਕੇ ਭਗਤੀ ਅਤੇ ਇਕੱਠੇ ਬੈਠ ਕੇ ਖਾਣ ਦੀ ਪ੍ਰਥਾ',
          en: 'Congregation for worship and sitting together in rows to eat',
        },
        source: 'Suraj Prakash, Bhai Santokh Singh',
      },
    ],
    majorEvents: [
      {
        year: 1469,
        title: { pa: 'ਪ੍ਰਕਾਸ਼ ਦਿਹਾੜਾ', en: 'Birth/Prakash' },
        description: {
          pa: 'ਕੱਤਕ ਦੀ ਪੂਰਨਮਾਸ਼ੀ ਨੂੰ ਰਾਇ ਭੋਇ ਦੀ ਤਲਵੰਡੀ ਵਿੱਚ ਪ੍ਰਕਾਸ਼',
          en: 'Born on the full moon of Kattak in Rai Bhoi di Talwandi',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1499,
        title: { pa: 'ਵੇਈਂ ਵਾਲਾ ਸਾਕਾ', en: 'Revelation at Vein River' },
        description: {
          pa: 'ਸੁਲਤਾਨਪੁਰ ਲੋਧੀ ਵਿੱਚ ਵੇਈਂ ਨਦੀ ਵਿੱਚ ਅਲੋਪ ਹੋ ਕੇ ਤਿੰਨ ਦਿਨ ਬਾਅਦ ਪ੍ਰਗਟ ਹੋਏ',
          en: 'Disappeared in Vein river at Sultanpur Lodhi and emerged after three days with divine message',
        },
        source: 'Suraj Prakash, Janam Sakhis',
      },
      {
        year: 1521,
        title: { pa: 'ਬਾਬਰ ਦਾ ਹਮਲਾ', en: 'Babur\'s Invasion Witnessed' },
        description: {
          pa: 'ਐਮਨਾਬਾਦ (ਸੈਦਪੁਰ) ਵਿੱਚ ਬਾਬਰ ਦੇ ਹਮਲੇ ਦੇ ਗਵਾਹ ਬਣੇ, ਬਾਬਰਵਾਣੀ ਦੀ ਰਚਨਾ',
          en: 'Witnessed Babur\'s invasion at Emnabad (Saidpur), composed Babarvani',
        },
        source: 'Sri Guru Granth Sahib Ji (Babarvani)',
      },
      {
        year: 1539,
        title: { pa: 'ਜੋਤੀ ਜੋਤ', en: 'Joti Jot (Merging with Divine Light)' },
        description: {
          pa: 'ਕਰਤਾਰਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ ਨੂੰ ਗੁਰਗੱਦੀ ਸੌਂਪ ਕੇ ਜੋਤੀ ਜੋਤ ਸਮਾਏ',
          en: 'Merged with Divine Light at Kartarpur Sahib after passing Guruship to Guru Angad Dev Ji',
        },
        source: 'Suraj Prakash',
      },
    ],
    baniContributed: {
      shabadCount: 974,
      salokCount: 0,
      description: {
        pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਵਿੱਚ ੯੭੪ ਸ਼ਬਦ ਦਰਜ ਹਨ ਜਿਸ ਵਿੱਚ ਜਪੁ ਜੀ ਸਾਹਿਬ, ਆਸਾ ਦੀ ਵਾਰ, ਸਿਧ ਗੋਸ਼ਟਿ ਸ਼ਾਮਲ ਹਨ',
        en: '974 Shabads in Sri Guru Granth Sahib Ji including Japji Sahib, Asa di Var, Sidh Gosht',
      },
    },
    sources: [
      { name: 'Suraj Prakash', author: 'Bhai Santokh Singh', year: 1843, type: 'SECONDARY' },
      { name: 'Janam Sakhi Bhai Bala', author: 'Bhai Bala', type: 'PRIMARY' },
      { name: 'Sri Guru Granth Sahib Ji', author: 'Guru Sahibaan & Bhagats', type: 'PRIMARY' },
    ],
  },

  // ========================================================================
  // SRI GURU ANGAD DEV JI
  // ========================================================================
  {
    id: 'guru-angad',
    guruNumber: 2,
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ',
      en: 'Sri Guru Angad Dev Ji',
      hi: 'श्री गुरु अंगद देव जी',
    },
    birthYear: 1504,
    deathYear: 1552,
    birthPlace: {
      pa: 'ਹਰੀਕੇ, ਫਿਰੋਜ਼ਪੁਰ',
      en: 'Harike, Ferozepur',
    },
    deathPlace: {
      pa: 'ਖਡੂਰ ਸਾਹਿਬ',
      en: 'Khadur Sahib',
    },
    fatherName: {
      pa: 'ਭਾਈ ਫੇਰੂ ਮੱਲ ਜੀ',
      en: 'Bhai Pheru Mal Ji',
    },
    motherName: {
      pa: 'ਮਾਤਾ ਰਾਮੋ ਜੀ (ਸਭਰਾਈ)',
      en: 'Mata Ramo Ji (Sabhrai)',
    },
    spouseName: {
      pa: 'ਮਾਤਾ ਖੀਵੀ ਜੀ',
      en: 'Mata Khivi Ji',
    },
    children: [
      { pa: 'ਬਾਬਾ ਦਾਸੂ ਜੀ', en: 'Baba Dasu Ji' },
      { pa: 'ਬਾਬਾ ਦਾਤੂ ਜੀ', en: 'Baba Datu Ji' },
      { pa: 'ਬੀਬੀ ਅਮਰੋ ਜੀ', en: 'Bibi Amro Ji' },
      { pa: 'ਬੀਬੀ ਅਨੋਖੀ ਜੀ', en: 'Bibi Anokhi Ji' },
    ],
    gurgaddiDate: '1539',
    biography: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ ਦਾ ਮੂਲ ਨਾਮ ਭਾਈ ਲਹਿਣਾ ਜੀ ਸੀ। ਆਪ ਜੀ ਨੂੰ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਨੇ ਆਪਣੇ ਅੰਗ ਵਾਂਗ ਮੰਨ ਕੇ "ਅੰਗਦ" ਨਾਮ ਦਿੱਤਾ। ਆਪ ਜੀ ਨੇ ਗੁਰਮੁਖੀ ਲਿਪੀ ਨੂੰ ਵਿਕਸਿਤ ਕੀਤਾ ਅਤੇ ਮੱਲ ਅਖਾੜੇ ਸ਼ੁਰੂ ਕੀਤੇ। ਆਪ ਜੀ ਨੇ ਲੰਗਰ ਪ੍ਰਥਾ ਨੂੰ ਹੋਰ ਮਜ਼ਬੂਤ ਕੀਤਾ।',
      en: 'Sri Guru Angad Dev Ji\'s original name was Bhai Lehna Ji. Guru Nanak Dev Ji considered them as their own limb (ang) and named them "Angad". They developed the Gurmukhi script and started Mal Akhara (wrestling arenas). They further strengthened the Langar institution.',
    },
    keyContributions: [
      {
        title: { pa: 'ਗੁਰਮੁਖੀ ਲਿਪੀ', en: 'Gurmukhi Script' },
        description: {
          pa: 'ਗੁਰਮੁਖੀ ਲਿਪੀ ਨੂੰ ਮਿਆਰੀ ਰੂਪ ਦਿੱਤਾ ਜਿਸ ਵਿੱਚ ਗੁਰਬਾਣੀ ਲਿਖੀ ਗਈ',
          en: 'Standardized Gurmukhi script in which Gurbani was written',
        },
        source: 'Suraj Prakash',
      },
      {
        title: { pa: 'ਮੱਲ ਅਖਾੜੇ', en: 'Wrestling Arenas' },
        description: {
          pa: 'ਸਰੀਰਕ ਤੰਦਰੁਸਤੀ ਲਈ ਕੁਸ਼ਤੀ ਅਖਾੜਿਆਂ ਦੀ ਸ਼ੁਰੂਆਤ',
          en: 'Established wrestling arenas for physical fitness',
        },
        source: 'Suraj Prakash',
      },
      {
        title: { pa: 'ਲੰਗਰ ਦਾ ਵਿਸਤਾਰ', en: 'Expansion of Langar' },
        description: {
          pa: 'ਮਾਤਾ ਖੀਵੀ ਜੀ ਨਾਲ ਮਿਲ ਕੇ ਲੰਗਰ ਪ੍ਰਥਾ ਨੂੰ ਵਧਾਇਆ',
          en: 'Expanded Langar institution with Mata Khivi Ji',
        },
        source: 'Sri Guru Granth Sahib Ji (Balwand)',
      },
    ],
    majorEvents: [
      {
        year: 1504,
        title: { pa: 'ਪ੍ਰਕਾਸ਼', en: 'Birth/Prakash' },
        description: {
          pa: 'ਹਰੀਕੇ ਵਿੱਚ ਵੈਸਾਖ ਸੁਦੀ ੧ ਨੂੰ ਪ੍ਰਕਾਸ਼',
          en: 'Born at Harike on Vaisakh Sudi 1',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1539,
        title: { pa: 'ਗੁਰਗੱਦੀ', en: 'Guruship' },
        description: {
          pa: 'ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਤੋਂ ਗੁਰਗੱਦੀ ਪ੍ਰਾਪਤ ਕੀਤੀ',
          en: 'Received Guruship from Guru Nanak Dev Ji',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1552,
        title: { pa: 'ਜੋਤੀ ਜੋਤ', en: 'Joti Jot' },
        description: {
          pa: 'ਖਡੂਰ ਸਾਹਿਬ ਵਿੱਚ ਗੁਰੂ ਅਮਰਦਾਸ ਜੀ ਨੂੰ ਗੁਰਗੱਦੀ ਸੌਂਪ ਕੇ ਜੋਤੀ ਜੋਤ ਸਮਾਏ',
          en: 'Merged with Divine Light at Khadur Sahib after passing Guruship to Guru Amar Das Ji',
        },
        source: 'Suraj Prakash',
      },
    ],
    baniContributed: {
      shabadCount: 62,
      salokCount: 0,
      description: {
        pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਵਿੱਚ ੬੨ ਸਲੋਕ ਦਰਜ ਹਨ',
        en: '62 Saloks in Sri Guru Granth Sahib Ji',
      },
    },
    sources: [
      { name: 'Suraj Prakash', author: 'Bhai Santokh Singh', year: 1843, type: 'SECONDARY' },
      { name: 'Sri Guru Granth Sahib Ji', author: 'Guru Sahibaan & Bhagats', type: 'PRIMARY' },
    ],
  },

  // ========================================================================
  // SRI GURU AMAR DAS JI
  // ========================================================================
  {
    id: 'guru-amardas',
    guruNumber: 3,
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅਮਰਦਾਸ ਜੀ',
      en: 'Sri Guru Amar Das Ji',
      hi: 'श्री गुरु अमरदास जी',
    },
    birthYear: 1479,
    deathYear: 1574,
    birthPlace: {
      pa: 'ਬਾਸਰਕੇ ਗਿੱਲਾਂ, ਅੰਮ੍ਰਿਤਸਰ',
      en: 'Basarke Gillan, Amritsar',
    },
    deathPlace: {
      pa: 'ਗੋਇੰਦਵਾਲ ਸਾਹਿਬ',
      en: 'Goindwal Sahib',
    },
    fatherName: {
      pa: 'ਭਾਈ ਤੇਜ ਭਾਨ ਜੀ',
      en: 'Bhai Tej Bhan Ji',
    },
    motherName: {
      pa: 'ਮਾਤਾ ਲਖਮੀ ਜੀ (ਬਖਤ ਕੌਰ)',
      en: 'Mata Lakhmi Ji (Bakht Kaur)',
    },
    spouseName: {
      pa: 'ਮਾਤਾ ਮਨਸਾ ਦੇਵੀ ਜੀ',
      en: 'Mata Mansa Devi Ji',
    },
    children: [
      { pa: 'ਬਾਬਾ ਮੋਹਨ ਜੀ', en: 'Baba Mohan Ji' },
      { pa: 'ਬਾਬਾ ਮੋਹਰੀ ਜੀ', en: 'Baba Mohri Ji' },
      { pa: 'ਬੀਬੀ ਦਾਨੀ ਜੀ', en: 'Bibi Dani Ji' },
      { pa: 'ਬੀਬੀ ਭਾਨੀ ਜੀ', en: 'Bibi Bhani Ji' },
    ],
    gurgaddiDate: '1552',
    gurgaddiAge: 73,
    biography: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅਮਰਦਾਸ ਜੀ ਨੇ ੭੩ ਸਾਲ ਦੀ ਉਮਰ ਵਿੱਚ ਗੁਰਗੱਦੀ ਸੰਭਾਲੀ। ਆਪ ਜੀ ਨੇ ਮੰਜੀ ਪ੍ਰਥਾ ਅਤੇ ਪੀੜ੍ਹੀ ਪ੍ਰਥਾ ਸ਼ੁਰੂ ਕੀਤੀ। ਗੋਇੰਦਵਾਲ ਸਾਹਿਬ ਵਿੱਚ ਬਾਉਲੀ ਦਾ ਨਿਰਮਾਣ ਕਰਵਾਇਆ। ਆਪ ਜੀ ਨੇ ਸਤੀ ਪ੍ਰਥਾ ਅਤੇ ਪਰਦਾ ਪ੍ਰਥਾ ਦਾ ਵਿਰੋਧ ਕੀਤਾ।',
      en: 'Sri Guru Amar Das Ji assumed Guruship at age 73. They established the Manji system (diocesan organization) and Peehi system. They built the Baoli (step-well) at Goindwal Sahib. They opposed Sati (widow immolation) and Purdah (veil) practices.',
    },
    keyContributions: [
      {
        title: { pa: 'ਮੰਜੀ ਪ੍ਰਥਾ', en: 'Manji System' },
        description: {
          pa: '੨੨ ਮੰਜੀਆਂ (ਧਾਰਮਿਕ ਕੇਂਦਰ) ਸਥਾਪਿਤ ਕੀਤੇ',
          en: 'Established 22 Manjis (diocesan seats) for religious administration',
        },
        source: 'Suraj Prakash',
      },
      {
        title: { pa: 'ਗੋਇੰਦਵਾਲ ਬਾਉਲੀ', en: 'Goindwal Baoli' },
        description: {
          pa: '੮੪ ਪੌੜੀਆਂ ਵਾਲੀ ਬਾਉਲੀ ਦਾ ਨਿਰਮਾਣ',
          en: 'Built the Baoli (step-well) with 84 steps',
        },
        source: 'Suraj Prakash',
      },
      {
        title: { pa: 'ਅਨੰਦ ਕਾਰਜ', en: 'Anand Karaj' },
        description: {
          pa: 'ਸਿੱਖ ਵਿਆਹ ਦੀ ਮਰਿਆਦਾ ਦੀ ਨੀਂਹ ਰੱਖੀ',
          en: 'Laid the foundation for Sikh marriage ceremony',
        },
        source: 'Suraj Prakash',
      },
      {
        title: { pa: 'ਸਮਾਜਿਕ ਸੁਧਾਰ', en: 'Social Reforms' },
        description: {
          pa: 'ਸਤੀ ਪ੍ਰਥਾ ਅਤੇ ਪਰਦਾ ਪ੍ਰਥਾ ਦਾ ਵਿਰੋਧ',
          en: 'Opposed Sati and Purdah practices',
        },
        source: 'Suraj Prakash',
      },
    ],
    majorEvents: [
      {
        year: 1479,
        title: { pa: 'ਪ੍ਰਕਾਸ਼', en: 'Birth/Prakash' },
        description: {
          pa: 'ਵੈਸਾਖ ਸੁਦੀ ੧੪ ਨੂੰ ਬਾਸਰਕੇ ਗਿੱਲਾਂ ਵਿੱਚ ਪ੍ਰਕਾਸ਼',
          en: 'Born at Basarke Gillan on Vaisakh Sudi 14',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1552,
        title: { pa: 'ਗੁਰਗੱਦੀ', en: 'Guruship' },
        description: {
          pa: '੭੩ ਸਾਲ ਦੀ ਉਮਰ ਵਿੱਚ ਗੁਰਗੱਦੀ ਪ੍ਰਾਪਤ',
          en: 'Received Guruship at age 73',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1567,
        title: { pa: 'ਅਕਬਰ ਨਾਲ ਮੁਲਾਕਾਤ', en: 'Meeting with Akbar' },
        description: {
          pa: 'ਮੁਗਲ ਬਾਦਸ਼ਾਹ ਅਕਬਰ ਗੋਇੰਦਵਾਲ ਆਇਆ ਅਤੇ ਪੰਗਤ ਵਿੱਚ ਬੈਠ ਕੇ ਲੰਗਰ ਛਕਿਆ',
          en: 'Mughal Emperor Akbar visited Goindwal and sat in Pangat to partake Langar',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1574,
        title: { pa: 'ਜੋਤੀ ਜੋਤ', en: 'Joti Jot' },
        description: {
          pa: 'ਗੋਇੰਦਵਾਲ ਸਾਹਿਬ ਵਿੱਚ ਗੁਰੂ ਰਾਮਦਾਸ ਜੀ ਨੂੰ ਗੁਰਗੱਦੀ ਸੌਂਪ ਕੇ ਜੋਤੀ ਜੋਤ ਸਮਾਏ',
          en: 'Merged with Divine Light at Goindwal Sahib after passing Guruship to Guru Ram Das Ji',
        },
        source: 'Suraj Prakash',
      },
    ],
    baniContributed: {
      shabadCount: 907,
      description: {
        pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਵਿੱਚ ੯੦੭ ਸ਼ਬਦ ਦਰਜ ਹਨ ਜਿਸ ਵਿੱਚ ਅਨੰਦ ਸਾਹਿਬ ਸ਼ਾਮਲ ਹੈ',
        en: '907 Shabads in Sri Guru Granth Sahib Ji including Anand Sahib',
      },
    },
    sources: [
      { name: 'Suraj Prakash', author: 'Bhai Santokh Singh', year: 1843, type: 'SECONDARY' },
      { name: 'Sri Guru Granth Sahib Ji', author: 'Guru Sahibaan & Bhagats', type: 'PRIMARY' },
    ],
  },

  // ========================================================================
  // SRI GURU RAM DAS JI
  // ========================================================================
  {
    id: 'guru-ramdas',
    guruNumber: 4,
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਰਾਮਦਾਸ ਜੀ',
      en: 'Sri Guru Ram Das Ji',
      hi: 'श्री गुरु रामदास जी',
    },
    birthYear: 1534,
    deathYear: 1581,
    birthPlace: {
      pa: 'ਚੂਨਾ ਮੰਡੀ, ਲਾਹੌਰ',
      en: 'Chuna Mandi, Lahore',
    },
    deathPlace: {
      pa: 'ਅੰਮ੍ਰਿਤਸਰ',
      en: 'Amritsar',
    },
    fatherName: {
      pa: 'ਭਾਈ ਹਰਿਦਾਸ ਜੀ',
      en: 'Bhai Hari Das Ji',
    },
    motherName: {
      pa: 'ਮਾਤਾ ਦਇਆ ਕੌਰ ਜੀ (ਅਨੂਪ ਦੇਵੀ)',
      en: 'Mata Daya Kaur Ji (Anup Devi)',
    },
    spouseName: {
      pa: 'ਬੀਬੀ ਭਾਨੀ ਜੀ',
      en: 'Bibi Bhani Ji',
    },
    children: [
      { pa: 'ਬਾਬਾ ਪ੍ਰਿਥੀ ਚੰਦ ਜੀ', en: 'Baba Prithi Chand Ji' },
      { pa: 'ਬਾਬਾ ਮਹਾਦੇਵ ਜੀ', en: 'Baba Mahadev Ji' },
      { pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ', en: 'Sri Guru Arjan Dev Ji' },
    ],
    gurgaddiDate: '1574',
    biography: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਰਾਮਦਾਸ ਜੀ ਦਾ ਮੂਲ ਨਾਮ ਭਾਈ ਜੇਠਾ ਜੀ ਸੀ। ਆਪ ਜੀ ਨੇ ਅੰਮ੍ਰਿਤਸਰ ਨਗਰ ਦੀ ਸਥਾਪਨਾ ਕੀਤੀ ਅਤੇ ਸੰਤੋਖਸਰ ਅਤੇ ਅੰਮ੍ਰਿਤ ਸਰੋਵਰ ਦੀ ਖੁਦਾਈ ਸ਼ੁਰੂ ਕਰਵਾਈ। ਆਪ ਜੀ ਨੇ ਲਾਵਾਂ (ਅਨੰਦ ਕਾਰਜ ਦੀ ਬਾਣੀ) ਦੀ ਰਚਨਾ ਕੀਤੀ।',
      en: 'Sri Guru Ram Das Ji\'s original name was Bhai Jetha Ji. They founded the city of Amritsar and began the excavation of Santokhsar and Amrit Sarovar. They composed the Laavan (hymns for Sikh wedding ceremony).',
    },
    keyContributions: [
      {
        title: { pa: 'ਅੰਮ੍ਰਿਤਸਰ ਦੀ ਸਥਾਪਨਾ', en: 'Foundation of Amritsar' },
        description: {
          pa: 'ਅੰਮ੍ਰਿਤਸਰ (ਰਾਮਦਾਸਪੁਰ) ਸ਼ਹਿਰ ਵਸਾਇਆ',
          en: 'Founded the city of Amritsar (Ramdaspur)',
        },
        source: 'Suraj Prakash',
      },
      {
        title: { pa: 'ਲਾਵਾਂ', en: 'Laavan' },
        description: {
          pa: 'ਸਿੱਖ ਵਿਆਹ ਲਈ ਚਾਰ ਲਾਵਾਂ ਦੀ ਰਚਨਾ',
          en: 'Composed four Laavan for Sikh wedding ceremony',
        },
        source: 'Sri Guru Granth Sahib Ji',
      },
      {
        title: { pa: 'ਅੰਮ੍ਰਿਤ ਸਰੋਵਰ', en: 'Amrit Sarovar' },
        description: {
          pa: 'ਪਵਿੱਤਰ ਸਰੋਵਰ ਦੀ ਖੁਦਾਈ ਸ਼ੁਰੂ ਕੀਤੀ',
          en: 'Began excavation of the sacred pool',
        },
        source: 'Suraj Prakash',
      },
    ],
    majorEvents: [
      {
        year: 1534,
        title: { pa: 'ਪ੍ਰਕਾਸ਼', en: 'Birth/Prakash' },
        description: {
          pa: 'ਕੱਤਕ ਵਦੀ ੨ ਨੂੰ ਲਾਹੌਰ ਵਿੱਚ ਪ੍ਰਕਾਸ਼',
          en: 'Born at Lahore on Kattak Vadi 2',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1574,
        title: { pa: 'ਗੁਰਗੱਦੀ', en: 'Guruship' },
        description: {
          pa: 'ਗੁਰੂ ਅਮਰਦਾਸ ਜੀ ਤੋਂ ਗੁਰਗੱਦੀ ਪ੍ਰਾਪਤ ਕੀਤੀ',
          en: 'Received Guruship from Guru Amar Das Ji',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1577,
        title: { pa: 'ਅੰਮ੍ਰਿਤਸਰ ਦੀ ਸਥਾਪਨਾ', en: 'Foundation of Amritsar' },
        description: {
          pa: 'ਅੰਮ੍ਰਿਤਸਰ ਸ਼ਹਿਰ ਦੀ ਨੀਂਹ ਰੱਖੀ',
          en: 'Laid the foundation of Amritsar city',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1581,
        title: { pa: 'ਜੋਤੀ ਜੋਤ', en: 'Joti Jot' },
        description: {
          pa: 'ਅੰਮ੍ਰਿਤਸਰ ਵਿੱਚ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ ਨੂੰ ਗੁਰਗੱਦੀ ਸੌਂਪ ਕੇ ਜੋਤੀ ਜੋਤ ਸਮਾਏ',
          en: 'Merged with Divine Light at Amritsar after passing Guruship to Guru Arjan Dev Ji',
        },
        source: 'Suraj Prakash',
      },
    ],
    baniContributed: {
      shabadCount: 679,
      description: {
        pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਵਿੱਚ ੬੭੯ ਸ਼ਬਦ ਦਰਜ ਹਨ ਜਿਸ ਵਿੱਚ ਲਾਵਾਂ ਸ਼ਾਮਲ ਹਨ',
        en: '679 Shabads in Sri Guru Granth Sahib Ji including the Laavan',
      },
    },
    sources: [
      { name: 'Suraj Prakash', author: 'Bhai Santokh Singh', year: 1843, type: 'SECONDARY' },
      { name: 'Sri Guru Granth Sahib Ji', author: 'Guru Sahibaan & Bhagats', type: 'PRIMARY' },
    ],
  },

  // ========================================================================
  // SRI GURU ARJAN DEV JI
  // ========================================================================
  {
    id: 'guru-arjan',
    guruNumber: 5,
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ',
      en: 'Sri Guru Arjan Dev Ji',
      hi: 'श्री गुरु अर्जन देव जी',
    },
    birthYear: 1563,
    deathYear: 1606,
    birthPlace: {
      pa: 'ਗੋਇੰਦਵਾਲ ਸਾਹਿਬ',
      en: 'Goindwal Sahib',
    },
    deathPlace: {
      pa: 'ਲਾਹੌਰ',
      en: 'Lahore',
    },
    fatherName: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਰਾਮਦਾਸ ਜੀ',
      en: 'Sri Guru Ram Das Ji',
    },
    motherName: {
      pa: 'ਬੀਬੀ ਭਾਨੀ ਜੀ',
      en: 'Bibi Bhani Ji',
    },
    spouseName: {
      pa: 'ਮਾਤਾ ਗੰਗਾ ਜੀ',
      en: 'Mata Ganga Ji',
    },
    children: [
      { pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਗੋਬਿੰਦ ਜੀ', en: 'Sri Guru Hargobind Ji' },
    ],
    gurgaddiDate: '1581',
    biography: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ ਨੇ ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਦਾ ਨਿਰਮਾਣ ਕਰਵਾਇਆ ਅਤੇ ਆਦਿ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਾ ਸੰਕਲਨ ਕੀਤਾ। ਆਪ ਜੀ ਸਿੱਖੀ ਦੇ ਪਹਿਲੇ ਸ਼ਹੀਦ ਹਨ। ਮੁਗਲ ਬਾਦਸ਼ਾਹ ਜਹਾਂਗੀਰ ਦੇ ਹੁਕਮ ਤੇ ਲਾਹੌਰ ਵਿੱਚ ਤੱਤੀ ਤਵੀ ਤੇ ਬਿਠਾ ਕੇ ਅਤੇ ਸਿਰ ਉੱਤੇ ਗਰਮ ਰੇਤ ਪਾ ਕੇ ਸ਼ਹੀਦ ਕੀਤਾ ਗਿਆ।',
      en: 'Sri Guru Arjan Dev Ji constructed Sri Harmandir Sahib and compiled Adi Granth Sahib. They are the first Shaheed (martyr) of Sikhi. On the orders of Mughal Emperor Jahangir, they were martyred in Lahore by being made to sit on a burning hot plate and having hot sand poured on their head.',
    },
    keyContributions: [
      {
        title: { pa: 'ਆਦਿ ਗ੍ਰੰਥ ਦਾ ਸੰਕਲਨ', en: 'Compilation of Adi Granth' },
        description: {
          pa: '੧੬੦੪ ਵਿੱਚ ਭਾਈ ਗੁਰਦਾਸ ਜੀ ਦੀ ਸਹਾਇਤਾ ਨਾਲ ਆਦਿ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਾ ਸੰਕਲਨ',
          en: 'Compiled Adi Granth Sahib in 1604 with the help of Bhai Gurdas Ji',
        },
        source: 'Suraj Prakash, Sri Gur Panth Prakash',
      },
      {
        title: { pa: 'ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ', en: 'Sri Harmandir Sahib' },
        description: {
          pa: 'ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਦਾ ਨਿਰਮਾਣ ਅਤੇ ਨੀਂਹ ਸੂਫੀ ਸੰਤ ਮੀਆਂ ਮੀਰ ਜੀ ਤੋਂ ਰਖਵਾਈ',
          en: 'Built Sri Harmandir Sahib; foundation stone laid by Sufi saint Mian Mir Ji',
        },
        source: 'Suraj Prakash',
      },
      {
        title: { pa: 'ਸੁਖਮਨੀ ਸਾਹਿਬ', en: 'Sukhmani Sahib' },
        description: {
          pa: 'ਸੁਖਮਨੀ ਸਾਹਿਬ (ਸੁਖਾਂ ਦੀ ਮਣੀ) ਦੀ ਰਚਨਾ',
          en: 'Composed Sukhmani Sahib (Jewel of Bliss)',
        },
        source: 'Sri Guru Granth Sahib Ji',
      },
      {
        title: { pa: 'ਪਹਿਲੀ ਸ਼ਹਾਦਤ', en: 'First Shaheedi' },
        description: {
          pa: 'ਸਿੱਖੀ ਦੀ ਪਹਿਲੀ ਸ਼ਹਾਦਤ ਦਿੱਤੀ',
          en: 'Became the first martyr of Sikhi',
        },
        source: 'Suraj Prakash, Dabistan-i-Mazahib',
      },
    ],
    majorEvents: [
      {
        year: 1563,
        title: { pa: 'ਪ੍ਰਕਾਸ਼', en: 'Birth/Prakash' },
        description: {
          pa: 'ਵੈਸਾਖ ਸੁਦੀ ੭ ਨੂੰ ਗੋਇੰਦਵਾਲ ਸਾਹਿਬ ਵਿੱਚ ਪ੍ਰਕਾਸ਼',
          en: 'Born at Goindwal Sahib on Vaisakh Sudi 7',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1588,
        title: { pa: 'ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਦੀ ਨੀਂਹ', en: 'Foundation of Harmandir Sahib' },
        description: {
          pa: 'ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਦੀ ਨੀਂਹ ਮੀਆਂ ਮੀਰ ਜੀ ਤੋਂ ਰਖਵਾਈ',
          en: 'Foundation stone of Sri Harmandir Sahib laid by Mian Mir Ji',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1604,
        title: { pa: 'ਆਦਿ ਗ੍ਰੰਥ ਦੀ ਸੰਪੂਰਨਤਾ', en: 'Completion of Adi Granth' },
        description: {
          pa: 'ਆਦਿ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਾ ਸੰਕਲਨ ਪੂਰਾ ਹੋਇਆ ਅਤੇ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਵਿੱਚ ਪ੍ਰਕਾਸ਼ ਕੀਤਾ',
          en: 'Adi Granth Sahib compiled and installed at Harmandir Sahib',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1606,
        title: { pa: 'ਸ਼ਹੀਦੀ', en: 'Shaheedi (Martyrdom)' },
        description: {
          pa: 'ਜੇਠ ਸੁਦੀ ੪ ਨੂੰ ਲਾਹੌਰ ਵਿੱਚ ਸ਼ਹੀਦੀ। ਤੱਤੀ ਤਵੀ ਤੇ ਬਿਠਾਇਆ, ਗਰਮ ਰੇਤ ਸਿਰ ਤੇ ਪਾਈ',
          en: 'Martyred on Jeth Sudi 4 in Lahore. Made to sit on hot plate, hot sand poured on head',
        },
        source: 'Suraj Prakash, Dabistan-i-Mazahib',
      },
    ],
    baniContributed: {
      shabadCount: 2218,
      description: {
        pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਵਿੱਚ ਸਭ ਤੋਂ ਵੱਧ ੨੨੧੮ ਸ਼ਬਦ ਦਰਜ ਹਨ ਜਿਸ ਵਿੱਚ ਸੁਖਮਨੀ ਸਾਹਿਬ ਸ਼ਾਮਲ ਹੈ',
        en: 'Highest contribution with 2218 Shabads including Sukhmani Sahib',
      },
    },
    sources: [
      { name: 'Suraj Prakash', author: 'Bhai Santokh Singh', year: 1843, type: 'SECONDARY' },
      { name: 'Sri Guru Granth Sahib Ji', author: 'Guru Sahibaan & Bhagats', type: 'PRIMARY' },
      { name: 'Dabistan-i-Mazahib', author: 'Mohsin Fani', year: 1655, type: 'PRIMARY' },
    ],
  },

  // ========================================================================
  // SRI GURU HARGOBIND JI
  // ========================================================================
  {
    id: 'guru-hargobind',
    guruNumber: 6,
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਗੋਬਿੰਦ ਜੀ',
      en: 'Sri Guru Hargobind Ji',
      hi: 'श्री गुरु हरगोबिंद जी',
    },
    birthYear: 1595,
    deathYear: 1644,
    birthPlace: {
      pa: 'ਵਡਾਲੀ, ਅੰਮ੍ਰਿਤਸਰ',
      en: 'Wadali, Amritsar',
    },
    deathPlace: {
      pa: 'ਕੀਰਤਪੁਰ ਸਾਹਿਬ',
      en: 'Kiratpur Sahib',
    },
    fatherName: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ',
      en: 'Sri Guru Arjan Dev Ji',
    },
    motherName: {
      pa: 'ਮਾਤਾ ਗੰਗਾ ਜੀ',
      en: 'Mata Ganga Ji',
    },
    spouseName: {
      pa: 'ਮਾਤਾ ਦਮੋਦਰੀ ਜੀ, ਮਾਤਾ ਨਾਨਕੀ ਜੀ, ਮਾਤਾ ਮਹਾਦੇਵੀ ਜੀ',
      en: 'Mata Damodari Ji, Mata Nanaki Ji, Mata Mahadevi Ji',
    },
    children: [
      { pa: 'ਬਾਬਾ ਗੁਰਦਿੱਤਾ ਜੀ', en: 'Baba Gurditta Ji' },
      { pa: 'ਬਾਬਾ ਸੂਰਜ ਮੱਲ ਜੀ', en: 'Baba Suraj Mal Ji' },
      { pa: 'ਬਾਬਾ ਅਣੀ ਰਾਇ ਜੀ', en: 'Baba Ani Rai Ji' },
      { pa: 'ਬਾਬਾ ਅਟੱਲ ਰਾਇ ਜੀ', en: 'Baba Atal Rai Ji' },
      { pa: 'ਸ੍ਰੀ ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ', en: 'Sri Guru Tegh Bahadur Ji' },
      { pa: 'ਬੀਬੀ ਵੀਰੋ ਜੀ', en: 'Bibi Veero Ji' },
    ],
    gurgaddiDate: '1606',
    biography: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਗੋਬਿੰਦ ਜੀ ਨੇ ਮੀਰੀ-ਪੀਰੀ ਦਾ ਸਿਧਾਂਤ ਦਿੱਤਾ ਅਤੇ ਦੋ ਤਲਵਾਰਾਂ ਧਾਰਨ ਕੀਤੀਆਂ। ਆਪ ਜੀ ਨੇ ਅਕਾਲ ਤਖ਼ਤ ਸਾਹਿਬ ਦੀ ਸਥਾਪਨਾ ਕੀਤੀ ਅਤੇ ਸਿੱਖਾਂ ਨੂੰ ਸ਼ਸਤਰ ਵਿੱਦਿਆ ਸਿਖਾਈ। ਆਪ ਜੀ ਨੇ ਮੁਗਲਾਂ ਨਾਲ ਚਾਰ ਯੁੱਧ ਲੜੇ ਅਤੇ ਜਿੱਤੇ।',
      en: 'Sri Guru Hargobind Ji established the concept of Miri-Piri (temporal and spiritual authority) and wore two swords. They founded Akal Takht Sahib and trained Sikhs in martial arts. They fought and won four battles against the Mughals.',
    },
    keyContributions: [
      {
        title: { pa: 'ਮੀਰੀ-ਪੀਰੀ', en: 'Miri-Piri Concept' },
        description: {
          pa: 'ਦੋ ਤਲਵਾਰਾਂ - ਮੀਰੀ (ਦੁਨਿਆਵੀ ਅਧਿਕਾਰ) ਅਤੇ ਪੀਰੀ (ਅਧਿਆਤਮਿਕ ਅਧਿਕਾਰ) ਧਾਰਨ ਕੀਤੀਆਂ',
          en: 'Wore two swords - Miri (temporal authority) and Piri (spiritual authority)',
        },
        source: 'Suraj Prakash, Sri Gur Panth Prakash',
      },
      {
        title: { pa: 'ਅਕਾਲ ਤਖ਼ਤ ਸਾਹਿਬ', en: 'Akal Takht Sahib' },
        description: {
          pa: '੧੬੦੬ ਵਿੱਚ ਸ੍ਰੀ ਅਕਾਲ ਤਖ਼ਤ ਸਾਹਿਬ ਦੀ ਸਥਾਪਨਾ',
          en: 'Established Sri Akal Takht Sahib in 1606',
        },
        source: 'Suraj Prakash',
      },
      {
        title: { pa: 'ਸਿੱਖ ਫੌਜ', en: 'Sikh Army' },
        description: {
          pa: 'ਪਹਿਲੀ ਸਿੱਖ ਫੌਜ ਦੀ ਸਥਾਪਨਾ ਅਤੇ ਸ਼ਸਤਰ ਵਿੱਦਿਆ',
          en: 'Established first Sikh Army and martial training',
        },
        source: 'Sri Gur Panth Prakash',
      },
      {
        title: { pa: 'ਬੰਦੀ ਛੋੜ', en: 'Bandi Chhor (Liberator)' },
        description: {
          pa: 'ਗਵਾਲੀਅਰ ਕਿਲੇ ਤੋਂ ੫੨ ਰਾਜਿਆਂ ਨੂੰ ਆਜ਼ਾਦ ਕਰਵਾਇਆ',
          en: 'Freed 52 kings from Gwalior Fort',
        },
        source: 'Suraj Prakash',
      },
    ],
    majorEvents: [
      {
        year: 1595,
        title: { pa: 'ਪ੍ਰਕਾਸ਼', en: 'Birth/Prakash' },
        description: {
          pa: 'ਹਾੜ ਵਦੀ ੬ ਨੂੰ ਵਡਾਲੀ ਵਿੱਚ ਪ੍ਰਕਾਸ਼',
          en: 'Born at Wadali on Harh Vadi 6',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1606,
        title: { pa: 'ਗੁਰਗੱਦੀ ਅਤੇ ਅਕਾਲ ਤਖ਼ਤ', en: 'Guruship and Akal Takht' },
        description: {
          pa: 'ਗੁਰਗੱਦੀ ਪ੍ਰਾਪਤ ਕੀਤੀ ਅਤੇ ਅਕਾਲ ਤਖ਼ਤ ਸਾਹਿਬ ਦੀ ਸਥਾਪਨਾ ਕੀਤੀ',
          en: 'Received Guruship and established Akal Takht Sahib',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1619,
        title: { pa: 'ਬੰਦੀ ਛੋੜ ਦਿਵਸ', en: 'Bandi Chhor Divas' },
        description: {
          pa: 'ਗਵਾਲੀਅਰ ਕਿਲੇ ਤੋਂ ੫੨ ਰਾਜਿਆਂ ਸਮੇਤ ਰਿਹਾਈ',
          en: 'Released from Gwalior Fort along with 52 kings',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1628,
        title: { pa: 'ਅੰਮ੍ਰਿਤਸਰ ਦਾ ਯੁੱਧ', en: 'Battle of Amritsar' },
        description: {
          pa: 'ਮੁਗਲ ਫੌਜ ਨੂੰ ਹਰਾਇਆ',
          en: 'Defeated the Mughal army',
        },
        source: 'Sri Gur Panth Prakash',
      },
      {
        year: 1644,
        title: { pa: 'ਜੋਤੀ ਜੋਤ', en: 'Joti Jot' },
        description: {
          pa: 'ਕੀਰਤਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਗੁਰੂ ਹਰਿ ਰਾਇ ਜੀ ਨੂੰ ਗੁਰਗੱਦੀ ਸੌਂਪ ਕੇ ਜੋਤੀ ਜੋਤ ਸਮਾਏ',
          en: 'Merged with Divine Light at Kiratpur Sahib after passing Guruship to Guru Har Rai Ji',
        },
        source: 'Suraj Prakash',
      },
    ],
    sources: [
      { name: 'Suraj Prakash', author: 'Bhai Santokh Singh', year: 1843, type: 'SECONDARY' },
      { name: 'Sri Gur Panth Prakash', author: 'Rattan Singh Bhangu', year: 1841, type: 'SECONDARY' },
    ],
  },

  // ========================================================================
  // SRI GURU HAR RAI JI
  // ========================================================================
  {
    id: 'guru-har-rai',
    guruNumber: 7,
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਰਾਇ ਜੀ',
      en: 'Sri Guru Har Rai Ji',
      hi: 'श्री गुरु हर राय जी',
    },
    birthYear: 1630,
    deathYear: 1661,
    birthPlace: {
      pa: 'ਕੀਰਤਪੁਰ ਸਾਹਿਬ',
      en: 'Kiratpur Sahib',
    },
    deathPlace: {
      pa: 'ਕੀਰਤਪੁਰ ਸਾਹਿਬ',
      en: 'Kiratpur Sahib',
    },
    fatherName: {
      pa: 'ਬਾਬਾ ਗੁਰਦਿੱਤਾ ਜੀ',
      en: 'Baba Gurditta Ji',
    },
    motherName: {
      pa: 'ਮਾਤਾ ਨਿਹਾਲ ਕੌਰ ਜੀ (ਅਨੰਤੀ)',
      en: 'Mata Nihal Kaur Ji (Ananti)',
    },
    spouseName: {
      pa: 'ਮਾਤਾ ਕਿਸ਼ਨ ਕੌਰ ਜੀ (ਸੁਲੱਖਣੀ)',
      en: 'Mata Kishan Kaur Ji (Sulakhni)',
    },
    children: [
      { pa: 'ਬਾਬਾ ਰਾਮ ਰਾਇ ਜੀ', en: 'Baba Ram Rai Ji' },
      { pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਕ੍ਰਿਸ਼ਨ ਜੀ', en: 'Sri Guru Har Krishan Ji' },
    ],
    gurgaddiDate: '1644',
    biography: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਰਾਇ ਜੀ ਸ਼ਾਂਤੀ-ਪ੍ਰੇਮੀ ਅਤੇ ਕੁਦਰਤ-ਪ੍ਰੇਮੀ ਸਨ। ਆਪ ਜੀ ਨੇ ਜੜ੍ਹੀ-ਬੂਟੀਆਂ ਦੇ ਬਾਗ਼ ਲਗਾਏ ਅਤੇ ਮੁਫ਼ਤ ਦਵਾਈਆਂ ਵੰਡੀਆਂ। ਆਪ ਜੀ ਨੇ ੨੨੦੦ ਘੋੜਸਵਾਰਾਂ ਦੀ ਫੌਜ ਰੱਖੀ ਪਰ ਕਦੇ ਯੁੱਧ ਨਹੀਂ ਕੀਤਾ।',
      en: 'Sri Guru Har Rai Ji was peace-loving and nature-loving. They maintained herbal gardens and distributed free medicines. They kept an army of 2200 horsemen but never waged war.',
    },
    keyContributions: [
      {
        title: { pa: 'ਜੜ੍ਹੀ-ਬੂਟੀ ਬਾਗ਼', en: 'Herbal Gardens' },
        description: {
          pa: 'ਕੀਰਤਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਜੜ੍ਹੀ-ਬੂਟੀਆਂ ਦੇ ਬਾਗ਼ ਅਤੇ ਮੁਫ਼ਤ ਦਵਾਖਾਨਾ',
          en: 'Maintained herbal gardens and free dispensary at Kiratpur Sahib',
        },
        source: 'Suraj Prakash',
      },
      {
        title: { pa: 'ਕੁਦਰਤ ਪ੍ਰੇਮ', en: 'Love for Nature' },
        description: {
          pa: 'ਜੀਵ-ਜੰਤੂਆਂ ਅਤੇ ਪੌਦਿਆਂ ਪ੍ਰਤੀ ਪ੍ਰੇਮ ਅਤੇ ਸੇਵਾ',
          en: 'Love and service towards animals and plants',
        },
        source: 'Suraj Prakash',
      },
      {
        title: { pa: 'ਦਾਰਾ ਸ਼ਿਕੋਹ ਦੀ ਸਹਾਇਤਾ', en: 'Helped Dara Shikoh' },
        description: {
          pa: 'ਔਰੰਗਜ਼ੇਬ ਤੋਂ ਭੱਜਦੇ ਦਾਰਾ ਸ਼ਿਕੋਹ ਦੀ ਸਹਾਇਤਾ',
          en: 'Helped Dara Shikoh who was fleeing from Aurangzeb',
        },
        source: 'Suraj Prakash',
      },
    ],
    majorEvents: [
      {
        year: 1630,
        title: { pa: 'ਪ੍ਰਕਾਸ਼', en: 'Birth/Prakash' },
        description: {
          pa: 'ਮਾਘ ਸੁਦੀ ੧੪ ਨੂੰ ਕੀਰਤਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਪ੍ਰਕਾਸ਼',
          en: 'Born at Kiratpur Sahib on Magh Sudi 14',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1644,
        title: { pa: 'ਗੁਰਗੱਦੀ', en: 'Guruship' },
        description: {
          pa: '੧੪ ਸਾਲ ਦੀ ਉਮਰ ਵਿੱਚ ਗੁਰਗੱਦੀ ਪ੍ਰਾਪਤ',
          en: 'Received Guruship at age 14',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1661,
        title: { pa: 'ਜੋਤੀ ਜੋਤ', en: 'Joti Jot' },
        description: {
          pa: 'ਕੀਰਤਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਗੁਰੂ ਹਰਿ ਕ੍ਰਿਸ਼ਨ ਜੀ ਨੂੰ ਗੁਰਗੱਦੀ ਸੌਂਪ ਕੇ ਜੋਤੀ ਜੋਤ ਸਮਾਏ',
          en: 'Merged with Divine Light at Kiratpur Sahib after passing Guruship to Guru Har Krishan Ji',
        },
        source: 'Suraj Prakash',
      },
    ],
    sources: [
      { name: 'Suraj Prakash', author: 'Bhai Santokh Singh', year: 1843, type: 'SECONDARY' },
    ],
  },

  // ========================================================================
  // SRI GURU HAR KRISHAN JI
  // ========================================================================
  {
    id: 'guru-har-krishan',
    guruNumber: 8,
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਕ੍ਰਿਸ਼ਨ ਜੀ',
      en: 'Sri Guru Har Krishan Ji',
      hi: 'श्री गुरु हर किशन जी',
    },
    birthYear: 1656,
    deathYear: 1664,
    birthPlace: {
      pa: 'ਕੀਰਤਪੁਰ ਸਾਹਿਬ',
      en: 'Kiratpur Sahib',
    },
    deathPlace: {
      pa: 'ਦਿੱਲੀ',
      en: 'Delhi',
    },
    fatherName: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਰਾਇ ਜੀ',
      en: 'Sri Guru Har Rai Ji',
    },
    motherName: {
      pa: 'ਮਾਤਾ ਕਿਸ਼ਨ ਕੌਰ ਜੀ',
      en: 'Mata Kishan Kaur Ji',
    },
    gurgaddiDate: '1661',
    gurgaddiAge: 5,
    biography: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਕ੍ਰਿਸ਼ਨ ਜੀ "ਬਾਲ ਗੁਰੂ" ਵਜੋਂ ਜਾਣੇ ਜਾਂਦੇ ਹਨ। ਆਪ ਜੀ ਨੇ ੫ ਸਾਲ ਦੀ ਉਮਰ ਵਿੱਚ ਗੁਰਗੱਦੀ ਸੰਭਾਲੀ। ਦਿੱਲੀ ਵਿੱਚ ਚੇਚਕ ਦੀ ਮਹਾਮਾਰੀ ਸਮੇਂ ਲੋਕਾਂ ਦੀ ਸੇਵਾ ਕਰਦੇ ਹੋਏ ਆਪ ਵੀ ਬਿਮਾਰ ਹੋ ਗਏ। "ਬਾਬਾ ਬਕਾਲਾ" ਕਹਿ ਕੇ ਅਗਲੇ ਗੁਰੂ ਦਾ ਸੰਕੇਤ ਦਿੱਤਾ।',
      en: 'Sri Guru Har Krishan Ji is known as the "Child Guru". They assumed Guruship at age 5. While serving people during a smallpox epidemic in Delhi, they too became ill. They said "Baba Bakala" to indicate the next Guru.',
    },
    keyContributions: [
      {
        title: { pa: 'ਬਿਮਾਰਾਂ ਦੀ ਸੇਵਾ', en: 'Service to the Sick' },
        description: {
          pa: 'ਦਿੱਲੀ ਵਿੱਚ ਚੇਚਕ ਅਤੇ ਹੈਜ਼ੇ ਦੇ ਮਰੀਜ਼ਾਂ ਦੀ ਨਿਰਸੁਆਰਥ ਸੇਵਾ',
          en: 'Selfless service to smallpox and cholera patients in Delhi',
        },
        source: 'Suraj Prakash',
      },
      {
        title: { pa: 'ਬਾਬਾ ਬਕਾਲਾ', en: 'Baba Bakala' },
        description: {
          pa: 'ਜੋਤੀ ਜੋਤ ਸਮਾਉਣ ਸਮੇਂ "ਬਾਬਾ ਬਕਾਲਾ" ਕਹਿ ਕੇ ਅਗਲੇ ਗੁਰੂ ਦਾ ਸੰਕੇਤ',
          en: 'Indicated next Guru by saying "Baba Bakala" before merging with Divine Light',
        },
        source: 'Suraj Prakash',
      },
    ],
    majorEvents: [
      {
        year: 1656,
        title: { pa: 'ਪ੍ਰਕਾਸ਼', en: 'Birth/Prakash' },
        description: {
          pa: 'ਸਾਵਣ ਵਦੀ ੧੦ ਨੂੰ ਕੀਰਤਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਪ੍ਰਕਾਸ਼',
          en: 'Born at Kiratpur Sahib on Sawan Vadi 10',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1661,
        title: { pa: 'ਗੁਰਗੱਦੀ', en: 'Guruship' },
        description: {
          pa: '੫ ਸਾਲ ਦੀ ਉਮਰ ਵਿੱਚ ਸਭ ਤੋਂ ਛੋਟੀ ਉਮਰ ਵਿੱਚ ਗੁਰਗੱਦੀ ਪ੍ਰਾਪਤ',
          en: 'Received Guruship at age 5, the youngest to receive Guruship',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1664,
        title: { pa: 'ਜੋਤੀ ਜੋਤ', en: 'Joti Jot' },
        description: {
          pa: 'ਚੇਤ ਸੁਦੀ ੧੪ ਨੂੰ ਦਿੱਲੀ ਵਿੱਚ ੮ ਸਾਲ ਦੀ ਉਮਰ ਵਿੱਚ ਜੋਤੀ ਜੋਤ ਸਮਾਏ',
          en: 'Merged with Divine Light in Delhi on Chet Sudi 14 at age 8',
        },
        source: 'Suraj Prakash',
      },
    ],
    sources: [
      { name: 'Suraj Prakash', author: 'Bhai Santokh Singh', year: 1843, type: 'SECONDARY' },
    ],
  },

  // ========================================================================
  // SRI GURU TEGH BAHADUR JI
  // ========================================================================
  {
    id: 'guru-tegh-bahadur',
    guruNumber: 9,
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ',
      en: 'Sri Guru Tegh Bahadur Ji',
      hi: 'श्री गुरु तेग बहादुर जी',
    },
    birthYear: 1621,
    deathYear: 1675,
    birthPlace: {
      pa: 'ਅੰਮ੍ਰਿਤਸਰ',
      en: 'Amritsar',
    },
    deathPlace: {
      pa: 'ਚਾਂਦਨੀ ਚੌਕ, ਦਿੱਲੀ',
      en: 'Chandni Chowk, Delhi',
    },
    fatherName: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਗੋਬਿੰਦ ਜੀ',
      en: 'Sri Guru Hargobind Ji',
    },
    motherName: {
      pa: 'ਮਾਤਾ ਨਾਨਕੀ ਜੀ',
      en: 'Mata Nanaki Ji',
    },
    spouseName: {
      pa: 'ਮਾਤਾ ਗੁਜਰੀ ਜੀ',
      en: 'Mata Gujri Ji',
    },
    children: [
      { pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ', en: 'Sri Guru Gobind Singh Ji' },
    ],
    gurgaddiDate: '1664',
    biography: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ ਨੂੰ "ਹਿੰਦ ਦੀ ਚਾਦਰ" ਕਿਹਾ ਜਾਂਦਾ ਹੈ। ਆਪ ਜੀ ਨੇ ਕਸ਼ਮੀਰੀ ਪੰਡਿਤਾਂ ਦੇ ਧਰਮ ਦੀ ਰੱਖਿਆ ਲਈ ਆਪਣੀ ਸ਼ਹਾਦਤ ਦਿੱਤੀ। ਔਰੰਗਜ਼ੇਬ ਨੇ ਦਿੱਲੀ ਵਿੱਚ ਆਪ ਜੀ ਦਾ ਸੀਸ ਕਲਮ ਕਰਵਾਇਆ।',
      en: 'Sri Guru Tegh Bahadur Ji is called "Hind di Chadar" (Shield of India). They sacrificed their life to protect the religious freedom of Kashmiri Pandits. Aurangzeb had them beheaded in Delhi.',
    },
    keyContributions: [
      {
        title: { pa: 'ਧਰਮ ਦੀ ਆਜ਼ਾਦੀ', en: 'Religious Freedom' },
        description: {
          pa: 'ਕਸ਼ਮੀਰੀ ਪੰਡਿਤਾਂ ਦੇ ਧਾਰਮਿਕ ਅਧਿਕਾਰਾਂ ਲਈ ਸ਼ਹਾਦਤ',
          en: 'Martyrdom for religious rights of Kashmiri Pandits',
        },
        source: 'Suraj Prakash, Sri Gur Panth Prakash',
      },
      {
        title: { pa: 'ਬਾਣੀ ਰਚਨਾ', en: 'Bani Composition' },
        description: {
          pa: 'ਵਿਚਾਰ-ਪ੍ਰਧਾਨ ਅਧਿਆਤਮਿਕ ਬਾਣੀ ਦੀ ਰਚਨਾ',
          en: 'Composed deeply contemplative spiritual Bani',
        },
        source: 'Sri Guru Granth Sahib Ji',
      },
      {
        title: { pa: 'ਯਾਤਰਾਵਾਂ', en: 'Journeys' },
        description: {
          pa: 'ਬੰਗਾਲ, ਅਸਾਮ ਅਤੇ ਹੋਰ ਥਾਵਾਂ ਦੀ ਯਾਤਰਾ ਅਤੇ ਪ੍ਰਚਾਰ',
          en: 'Journeys to Bengal, Assam and other places for preaching',
        },
        source: 'Suraj Prakash',
      },
    ],
    majorEvents: [
      {
        year: 1621,
        title: { pa: 'ਪ੍ਰਕਾਸ਼', en: 'Birth/Prakash' },
        description: {
          pa: 'ਵੈਸਾਖ ਵਦੀ ੫ ਨੂੰ ਅੰਮ੍ਰਿਤਸਰ ਵਿੱਚ ਪ੍ਰਕਾਸ਼। ਮੂਲ ਨਾਮ ਤਿਆਗ ਮੱਲ',
          en: 'Born at Amritsar on Vaisakh Vadi 5. Original name Tyag Mal',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1664,
        title: { pa: 'ਗੁਰਗੱਦੀ', en: 'Guruship' },
        description: {
          pa: 'ਬਕਾਲਾ ਵਿੱਚ ਗੁਰਗੱਦੀ ਪ੍ਰਾਪਤ',
          en: 'Received Guruship at Bakala',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1675,
        title: { pa: 'ਸ਼ਹੀਦੀ', en: 'Shaheedi (Martyrdom)' },
        description: {
          pa: 'ਮੱਘਰ ਸੁਦੀ ੫ ਨੂੰ ਚਾਂਦਨੀ ਚੌਕ, ਦਿੱਲੀ ਵਿੱਚ ਸ਼ਹੀਦੀ। ਭਾਈ ਮਤੀ ਦਾਸ, ਭਾਈ ਸਤੀ ਦਾਸ ਅਤੇ ਭਾਈ ਦਿਆਲਾ ਜੀ ਵੀ ਸ਼ਹੀਦ ਹੋਏ',
          en: 'Martyred on Maghar Sudi 5 at Chandni Chowk, Delhi. Bhai Mati Das, Bhai Sati Das and Bhai Dayala Ji were also martyred',
        },
        source: 'Suraj Prakash, Sri Gur Panth Prakash',
      },
    ],
    baniContributed: {
      shabadCount: 116,
      salokCount: 57,
      description: {
        pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਵਿੱਚ ੧੧੬ ਸ਼ਬਦ ਅਤੇ ੫੭ ਸਲੋਕ ਦਰਜ ਹਨ',
        en: '116 Shabads and 57 Saloks in Sri Guru Granth Sahib Ji',
      },
    },
    sources: [
      { name: 'Suraj Prakash', author: 'Bhai Santokh Singh', year: 1843, type: 'SECONDARY' },
      { name: 'Sri Gur Panth Prakash', author: 'Rattan Singh Bhangu', year: 1841, type: 'SECONDARY' },
      { name: 'Sri Guru Granth Sahib Ji', author: 'Guru Sahibaan & Bhagats', type: 'PRIMARY' },
    ],
  },

  // ========================================================================
  // SRI GURU GOBIND SINGH JI
  // ========================================================================
  {
    id: 'guru-gobind-singh',
    guruNumber: 10,
    name: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ',
      en: 'Sri Guru Gobind Singh Ji',
      hi: 'श्री गुरु गोबिंद सिंह जी',
    },
    birthYear: 1666,
    deathYear: 1708,
    birthPlace: {
      pa: 'ਪਟਨਾ ਸਾਹਿਬ',
      en: 'Patna Sahib',
    },
    deathPlace: {
      pa: 'ਹਜ਼ੂਰ ਸਾਹਿਬ, ਨਾਂਦੇੜ',
      en: 'Hazur Sahib, Nanded',
    },
    fatherName: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ',
      en: 'Sri Guru Tegh Bahadur Ji',
    },
    motherName: {
      pa: 'ਮਾਤਾ ਗੁਜਰੀ ਜੀ',
      en: 'Mata Gujri Ji',
    },
    spouseName: {
      pa: 'ਮਾਤਾ ਜੀਤੋ ਜੀ, ਮਾਤਾ ਸੁੰਦਰੀ ਜੀ, ਮਾਤਾ ਸਾਹਿਬ ਕੌਰ ਜੀ',
      en: 'Mata Jito Ji, Mata Sundari Ji, Mata Sahib Kaur Ji',
    },
    children: [
      { pa: 'ਸਾਹਿਬਜ਼ਾਦਾ ਅਜੀਤ ਸਿੰਘ ਜੀ', en: 'Sahibzada Ajit Singh Ji' },
      { pa: 'ਸਾਹਿਬਜ਼ਾਦਾ ਜੁਝਾਰ ਸਿੰਘ ਜੀ', en: 'Sahibzada Jujhar Singh Ji' },
      { pa: 'ਸਾਹਿਬਜ਼ਾਦਾ ਜ਼ੋਰਾਵਰ ਸਿੰਘ ਜੀ', en: 'Sahibzada Zorawar Singh Ji' },
      { pa: 'ਸਾਹਿਬਜ਼ਾਦਾ ਫਤਿਹ ਸਿੰਘ ਜੀ', en: 'Sahibzada Fateh Singh Ji' },
    ],
    gurgaddiDate: '1675',
    gurgaddiAge: 9,
    biography: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਨੇ ੧੬੯੯ ਵਿੱਚ ਵੈਸਾਖੀ ਵਾਲੇ ਦਿਨ ਖਾਲਸਾ ਪੰਥ ਦੀ ਸਿਰਜਣਾ ਕੀਤੀ। ਪੰਜ ਪਿਆਰਿਆਂ ਨੂੰ ਅੰਮ੍ਰਿਤ ਛਕਾਇਆ ਅਤੇ ਫਿਰ ਆਪ ਉਨ੍ਹਾਂ ਤੋਂ ਅੰਮ੍ਰਿਤ ਛਕਿਆ। ਆਪ ਜੀ ਨੇ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਨੂੰ ਸਦੀਵੀ ਗੁਰੂ ਥਾਪਿਆ।',
      en: 'Sri Guru Gobind Singh Ji created the Khalsa Panth on Vaisakhi 1699. They administered Amrit to Panj Pyare and then received Amrit from them. They declared Sri Guru Granth Sahib Ji as the eternal Guru.',
    },
    keyContributions: [
      {
        title: { pa: 'ਖਾਲਸਾ ਪੰਥ ਦੀ ਸਿਰਜਣਾ', en: 'Creation of Khalsa Panth' },
        description: {
          pa: '੧੬੯੯ ਵਿੱਚ ਵੈਸਾਖੀ ਨੂੰ ਅਨੰਦਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਖਾਲਸਾ ਪੰਥ ਦੀ ਸਾਜਣਾ',
          en: 'Created Khalsa Panth on Vaisakhi 1699 at Anandpur Sahib',
        },
        source: 'Sri Gur Panth Prakash, Suraj Prakash',
      },
      {
        title: { pa: 'ਪੰਜ ਕਕਾਰ', en: 'Five Kakars' },
        description: {
          pa: 'ਕੇਸ, ਕੰਘਾ, ਕੜਾ, ਕਿਰਪਾਨ, ਕਛਹਿਰਾ - ਖਾਲਸੇ ਦੀ ਪਛਾਣ',
          en: 'Kesh, Kangha, Kara, Kirpan, Kachera - identity of Khalsa',
        },
        source: 'Sri Gur Panth Prakash',
      },
      {
        title: { pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਨੂੰ ਗੁਰਗੱਦੀ', en: 'Guruship to Sri Guru Granth Sahib Ji' },
        description: {
          pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਨੂੰ ਸਦੀਵੀ ਗੁਰੂ ਘੋਸ਼ਿਤ ਕੀਤਾ',
          en: 'Declared Sri Guru Granth Sahib Ji as the eternal Guru',
        },
        source: 'Sri Gur Panth Prakash',
      },
      {
        title: { pa: 'ਜ਼ਫ਼ਰਨਾਮਾ', en: 'Zafarnama' },
        description: {
          pa: 'ਔਰੰਗਜ਼ੇਬ ਨੂੰ ਲਿਖੀ ਚਿੱਠੀ ਜਿਸ ਵਿੱਚ ਉਸਦੀ ਬੇਈਮਾਨੀ ਅਤੇ ਜ਼ੁਲਮ ਦੀ ਨਿੰਦਾ ਕੀਤੀ',
          en: 'Letter written to Aurangzeb condemning his deceit and tyranny',
        },
        source: 'Sri Gur Panth Prakash',
      },
    ],
    majorEvents: [
      {
        year: 1666,
        title: { pa: 'ਪ੍ਰਕਾਸ਼', en: 'Birth/Prakash' },
        description: {
          pa: 'ਪੋਹ ਸੁਦੀ ੭ ਨੂੰ ਪਟਨਾ ਸਾਹਿਬ ਵਿੱਚ ਪ੍ਰਕਾਸ਼',
          en: 'Born at Patna Sahib on Poh Sudi 7',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1675,
        title: { pa: 'ਗੁਰਗੱਦੀ', en: 'Guruship' },
        description: {
          pa: '੯ ਸਾਲ ਦੀ ਉਮਰ ਵਿੱਚ ਗੁਰਗੱਦੀ ਪ੍ਰਾਪਤ',
          en: 'Received Guruship at age 9',
        },
        source: 'Suraj Prakash',
      },
      {
        year: 1699,
        title: { pa: 'ਖਾਲਸਾ ਸਾਜਣਾ', en: 'Creation of Khalsa' },
        description: {
          pa: 'ਵੈਸਾਖੀ ੧੬੯੯ ਨੂੰ ਅਨੰਦਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਖਾਲਸਾ ਪੰਥ ਦੀ ਸਿਰਜਣਾ',
          en: 'Created Khalsa Panth at Anandpur Sahib on Vaisakhi 1699',
        },
        source: 'Sri Gur Panth Prakash',
      },
      {
        year: 1704,
        title: { pa: 'ਚਮਕੌਰ ਸਾਹਿਬ ਦੀ ਜੰਗ', en: 'Battle of Chamkaur' },
        description: {
          pa: 'ਚਮਕੌਰ ਸਾਹਿਬ ਵਿੱਚ ਮੁਗਲਾਂ ਨਾਲ ਲੜਾਈ। ਸਾਹਿਬਜ਼ਾਦਾ ਅਜੀਤ ਸਿੰਘ ਅਤੇ ਜੁਝਾਰ ਸਿੰਘ ਸ਼ਹੀਦ',
          en: 'Battle against Mughals at Chamkaur. Sahibzada Ajit Singh and Jujhar Singh martyred',
        },
        source: 'Sri Gur Panth Prakash',
      },
      {
        year: 1704,
        title: { pa: 'ਸਰਹਿੰਦ ਦਾ ਸਾਕਾ', en: 'Tragedy of Sirhind' },
        description: {
          pa: 'ਛੋਟੇ ਸਾਹਿਬਜ਼ਾਦੇ ਜ਼ੋਰਾਵਰ ਸਿੰਘ ਅਤੇ ਫਤਿਹ ਸਿੰਘ ਨੂੰ ਕੰਧਾਂ ਵਿੱਚ ਚਿਣਿਆ ਗਿਆ। ਮਾਤਾ ਗੁਜਰੀ ਜੀ ਸ਼ਹੀਦ',
          en: 'Younger Sahibzadas Zorawar Singh and Fateh Singh were bricked alive. Mata Gujri Ji martyred',
        },
        source: 'Sri Gur Panth Prakash',
      },
      {
        year: 1708,
        title: { pa: 'ਜੋਤੀ ਜੋਤ', en: 'Joti Jot' },
        description: {
          pa: 'ਕੱਤਕ ਸੁਦੀ ੫ ਨੂੰ ਹਜ਼ੂਰ ਸਾਹਿਬ, ਨਾਂਦੇੜ ਵਿੱਚ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਨੂੰ ਗੁਰਗੱਦੀ ਸੌਂਪ ਕੇ ਜੋਤੀ ਜੋਤ ਸਮਾਏ',
          en: 'Merged with Divine Light at Hazur Sahib, Nanded on Kattak Sudi 5 after passing Guruship to Sri Guru Granth Sahib Ji',
        },
        source: 'Sri Gur Panth Prakash',
      },
    ],
    sources: [
      { name: 'Sri Gur Panth Prakash', author: 'Rattan Singh Bhangu', year: 1841, type: 'SECONDARY' },
      { name: 'Suraj Prakash', author: 'Bhai Santokh Singh', year: 1843, type: 'SECONDARY' },
    ],
  },
];
