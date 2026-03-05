'use client';

// ============================================================================
// NANAKSHAHI CALENDAR & GURPURAB EVENTS PAGE
// ============================================================================
// Full-page calendar with detailed Gurpurab information,
// upcoming events list, and Sikh event descriptions
// ============================================================================

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { useLanguage } from '@/components/common/LanguageProvider';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { NanakshahiCalendarFull, gregorianToNanakshahi, NANAKSHAHI_MONTHS, GREGORIAN_MONTH_NAMES } from '@/components/common/NanakshahiCalendar';
import type { Language } from '@/types';

// Comprehensive Sikh events data
interface GurpurabEvent {
  id: string;
  type: 'gurpurab' | 'shaheedi' | 'historical' | 'mela';
  name: { pa: string; en: string; hi?: string };
  description: { pa: string; en: string; hi?: string };
  history: { pa: string; en: string; hi?: string };
  nanakshahiMonth: number;
  nanakshahiDay: number;
  icon: string;
  color: string;
  year?: number;
}

const GURPURAB_EVENTS: GurpurabEvent[] = [
  {
    id: 'vaisakhi',
    type: 'mela',
    name: { pa: 'ਵੈਸਾਖੀ — ਖਾਲਸਾ ਸਾਜਨਾ ਦਿਵਸ', en: 'Vaisakhi — Khalsa Creation Day' },
    description: { pa: '੧੬੯੯ ਵਿੱਚ ਖਾਲਸਾ ਪੰਥ ਦੀ ਸਿਰਜਨਾ', en: 'Creation of Khalsa Panth in 1699' },
    history: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਨੇ ੧੬੯੯ ਵਿੱਚ ਅਨੰਦਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਵੈਸਾਖੀ ਵਾਲੇ ਦਿਨ ਖਾਲਸਾ ਪੰਥ ਦੀ ਸਿਰਜਨਾ ਕੀਤੀ। ਪੰਜ ਪਿਆਰਿਆਂ ਨੂੰ ਅੰਮ੍ਰਿਤ ਛਕਾ ਕੇ ਖਾਲਸੇ ਦੀ ਨੀਂਹ ਰੱਖੀ।',
      en: 'Sri Guru Gobind Singh Ji created the Khalsa Panth on Vaisakhi day in 1699 at Anandpur Sahib. By baptizing the Panj Piare (Five Beloved Ones), the foundation of the Khalsa was laid.',
    },
    nanakshahiMonth: 1,
    nanakshahiDay: 1,
    icon: '⚔️',
    color: 'from-amber-500 to-orange-600',
    year: 1699,
  },
  {
    id: 'guru-nanak-prakash',
    type: 'gurpurab',
    name: { pa: 'ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਪ੍ਰਕਾਸ਼ ਪੁਰਬ', en: 'Guru Nanak Dev Ji Prakash Purab' },
    description: { pa: '੧੪੬੯ ਵਿੱਚ ਗੁਰੂ ਜੀ ਦਾ ਜਨਮ', en: 'Birth of Guru Ji in 1469' },
    history: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਦਾ ਜਨਮ ੧੫ ਅਪ੍ਰੈਲ ੧੪੬੯ ਨੂੰ ਰਾਇ ਭੋਇ ਦੀ ਤਲਵੰਡੀ (ਨਨਕਾਣਾ ਸਾਹਿਬ) ਵਿੱਚ ਹੋਇਆ। ਆਪ ਜੀ ਨੇ ਇੱਕ ਰੱਬ, ਸੇਵਾ, ਸਿਮਰਨ ਅਤੇ ਸਮਾਨਤਾ ਦਾ ਸੰਦੇਸ਼ ਦਿੱਤਾ।',
      en: 'Sri Guru Nanak Dev Ji was born on April 15, 1469 at Rai Bhoi Di Talwandi (Nankana Sahib). He taught the message of One God, service, meditation, and equality.',
    },
    nanakshahiMonth: 7,
    nanakshahiDay: 15,
    icon: '🙏',
    color: 'from-amber-400 to-amber-600',
    year: 1469,
  },
  {
    id: 'guru-gobind-prakash',
    type: 'gurpurab',
    name: { pa: 'ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਪ੍ਰਕਾਸ਼ ਪੁਰਬ', en: 'Guru Gobind Singh Ji Prakash Purab' },
    description: { pa: '੧੬੬੬ ਵਿੱਚ ਗੁਰੂ ਜੀ ਦਾ ਜਨਮ', en: 'Birth of Guru Ji in 1666' },
    history: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਦਾ ਜਨਮ ੨੨ ਦਸੰਬਰ ੧੬੬੬ ਨੂੰ ਪਟਨਾ ਸਾਹਿਬ ਵਿੱਚ ਹੋਇਆ। ਆਪ ਜੀ ਸਿੱਖ ਧਰਮ ਦੇ ਦਸਵੇਂ ਗੁਰੂ ਹਨ ਅਤੇ ਖਾਲਸਾ ਪੰਥ ਦੇ ਸਿਰਜਣਹਾਰ ਹਨ।',
      en: 'Sri Guru Gobind Singh Ji was born on December 22, 1666 at Patna Sahib. He is the tenth Sikh Guru and the creator of the Khalsa Panth.',
    },
    nanakshahiMonth: 9,
    nanakshahiDay: 23,
    icon: '⚔️',
    color: 'from-blue-500 to-indigo-600',
    year: 1666,
  },
  {
    id: 'gurgaddi-diwas',
    type: 'historical',
    name: { pa: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਗੁਰਗੱਦੀ ਦਿਵਸ', en: 'Gurgaddi Diwas — Guru Granth Sahib Ji' },
    description: { pa: '੧੭੦੮ ਵਿੱਚ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਨੂੰ ਗੁਰਗੱਦੀ', en: 'Guru Granth Sahib Ji became eternal Guru in 1708' },
    history: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਨੇ ੧੭੦੮ ਵਿੱਚ ਆਪਣੇ ਜੋਤੀ ਜੋਤ ਸਮਾਉਣ ਤੋਂ ਪਹਿਲਾਂ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਨੂੰ ਸਦੀਵੀ ਗੁਰੂ ਥਾਪਿਆ। ਇਸ ਤੋਂ ਬਾਅਦ ਸਿੱਖਾਂ ਦਾ ਗੁਰੂ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਹਨ।',
      en: 'Before his passing in 1708, Sri Guru Gobind Singh Ji declared Sri Guru Granth Sahib Ji as the eternal Guru for all Sikhs.',
    },
    nanakshahiMonth: 7,
    nanakshahiDay: 6,
    icon: '📖',
    color: 'from-amber-600 to-amber-800',
    year: 1708,
  },
  {
    id: 'guru-arjan-shaheedi',
    type: 'shaheedi',
    name: { pa: 'ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ ਸ਼ਹੀਦੀ ਦਿਵਸ', en: 'Shaheedi Divas — Guru Arjan Dev Ji' },
    description: { pa: 'ਪਹਿਲੇ ਸ਼ਹੀਦ ਗੁਰੂ', en: 'First martyred Guru' },
    history: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ ਸਿੱਖ ਧਰਮ ਦੇ ਪਹਿਲੇ ਸ਼ਹੀਦ ਗੁਰੂ ਹਨ। ੧੬੦੬ ਵਿੱਚ ਮੁਗਲ ਸ਼ਾਸਕ ਜਹਾਂਗੀਰ ਦੇ ਹੁਕਮ ਨਾਲ ਆਪ ਜੀ ਨੂੰ ਤੱਤੀ ਤਵੀ ਅਤੇ ਉਬਲਦੇ ਪਾਣੀ ਦੀ ਤਸੀਹੇ ਦਿੱਤੇ ਗਏ।',
      en: 'Guru Arjan Dev Ji was the first Sikh Guru to be martyred. In 1606, on the orders of Mughal emperor Jahangir, he was tortured with hot plates and boiling water.',
    },
    nanakshahiMonth: 3,
    nanakshahiDay: 2,
    icon: '🕯️',
    color: 'from-red-500 to-red-700',
    year: 1606,
  },
  {
    id: 'guru-tegh-bahadur-shaheedi',
    type: 'shaheedi',
    name: { pa: 'ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ ਸ਼ਹੀਦੀ ਦਿਵਸ', en: 'Shaheedi Divas — Guru Tegh Bahadur Ji' },
    description: { pa: 'ਹਿੰਦ ਦੀ ਚਾਦਰ', en: 'Protector of Hindustan' },
    history: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ ਨੇ ੧੬੭੫ ਵਿੱਚ ਕਸ਼ਮੀਰੀ ਪੰਡਤਾਂ ਦੇ ਧਰਮ ਦੀ ਰੱਖਿਆ ਲਈ ਦਿੱਲੀ ਵਿੱਚ ਸ਼ਹੀਦੀ ਦਿੱਤੀ। ਉਹਨਾਂ ਨੂੰ "ਹਿੰਦ ਦੀ ਚਾਦਰ" ਕਿਹਾ ਜਾਂਦਾ ਹੈ।',
      en: 'Guru Tegh Bahadur Ji was martyred in 1675 in Delhi while protecting the religious freedom of Kashmiri Pandits. He is known as "Hind Di Chadar" (Shield of India).',
    },
    nanakshahiMonth: 8,
    nanakshahiDay: 11,
    icon: '🕯️',
    color: 'from-red-500 to-red-700',
    year: 1675,
  },
  {
    id: 'sahibzade-shaheedi',
    type: 'shaheedi',
    name: { pa: 'ਸਾਹਿਬਜ਼ਾਦਿਆਂ ਦਾ ਸ਼ਹੀਦੀ ਦਿਵਸ', en: 'Shaheedi Divas — Sahibzade' },
    description: { pa: 'ਚਾਰੇ ਸਾਹਿਬਜ਼ਾਦੇ ਅਤੇ ਮਾਤਾ ਗੁਜਰੀ ਜੀ', en: 'All four Sahibzade and Mata Gujri Ji' },
    history: {
      pa: 'ਛੋਟੇ ਸਾਹਿਬਜ਼ਾਦੇ ਬਾਬਾ ਜ਼ੋਰਾਵਰ ਸਿੰਘ (੯ ਸਾਲ) ਅਤੇ ਬਾਬਾ ਫ਼ਤਿਹ ਸਿੰਘ (੬ ਸਾਲ) ਨੂੰ ਸਰਹਿੰਦ ਵਿੱਚ ਨੀਹਾਂ ਵਿੱਚ ਚਿਣ ਕੇ ਸ਼ਹੀਦ ਕੀਤਾ ਗਿਆ। ਵੱਡੇ ਸਾਹਿਬਜ਼ਾਦੇ ਚਮਕੌਰ ਵਿੱਚ ਲੜਦੇ ਸ਼ਹੀਦ ਹੋਏ।',
      en: 'The younger Sahibzade, Baba Zorawar Singh (9) and Baba Fateh Singh (6), were bricked alive at Sirhind. The elder Sahibzade were martyred fighting at Chamkaur.',
    },
    nanakshahiMonth: 9,
    nanakshahiDay: 13,
    icon: '🧱',
    color: 'from-gray-700 to-gray-900',
    year: 1704,
  },
  {
    id: 'bandi-chhor',
    type: 'historical',
    name: { pa: 'ਬੰਦੀ ਛੋੜ ਦਿਵਸ', en: 'Bandi Chhor Divas' },
    description: { pa: 'ਗੁਰੂ ਹਰਗੋਬਿੰਦ ਸਾਹਿਬ ਜੀ ਦੀ ਗਵਾਲੀਅਰ ਤੋਂ ਰਿਹਾਈ', en: 'Guru Hargobind Sahib Ji freed from Gwalior' },
    history: {
      pa: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਗੋਬਿੰਦ ਸਾਹਿਬ ਜੀ ਨੇ ਗਵਾਲੀਅਰ ਦੇ ਕਿਲ੍ਹੇ ਤੋਂ ੫੨ ਹਿੰਦੂ ਰਾਜਿਆਂ ਨੂੰ ਨਾਲ ਰਿਹਾ ਕਰਵਾਇਆ। ਇਹ ਦਿਨ ਦੀਵਾਲੀ ਦੇ ਨੇੜੇ ਆਉਂਦਾ ਹੈ।',
      en: 'Guru Hargobind Sahib Ji secured the release of 52 Hindu kings from Gwalior Fort. This day falls around Diwali.',
    },
    nanakshahiMonth: 7,
    nanakshahiDay: 15,
    icon: '🪔',
    color: 'from-yellow-500 to-orange-500',
    year: 1619,
  },
  {
    id: 'hola-mohalla',
    type: 'mela',
    name: { pa: 'ਹੋਲਾ ਮਹੱਲਾ', en: 'Hola Mohalla' },
    description: { pa: 'ਸਿੱਖ ਯੁੱਧ ਕਲਾ ਦਾ ਤਿਉਹਾਰ', en: 'Sikh martial arts festival' },
    history: {
      pa: 'ਹੋਲਾ ਮਹੱਲਾ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਨੇ ੧੭੦੧ ਵਿੱਚ ਅਨੰਦਪੁਰ ਸਾਹਿਬ ਵਿੱਚ ਸ਼ੁਰੂ ਕੀਤਾ। ਇਹ ਸਿੱਖ ਸ਼ਕਤੀ, ਯੁੱਧ ਕਲਾ ਅਤੇ ਕੀਰਤਨ ਦਾ ਤਿਉਹਾਰ ਹੈ।',
      en: 'Hola Mohalla was started by Guru Gobind Singh Ji in 1701 at Anandpur Sahib. It is a festival of Sikh martial arts, strength, and kirtan.',
    },
    nanakshahiMonth: 0,
    nanakshahiDay: 1,
    icon: '🎭',
    color: 'from-purple-500 to-purple-700',
    year: 1701,
  },
  {
    id: 'maghi',
    type: 'historical',
    name: { pa: 'ਮਾਘੀ', en: 'Maghi' },
    description: { pa: 'ਚਾਲੀ ਮੁਕਤਿਆਂ ਦਾ ਦਿਵਸ', en: 'Day of the Forty Liberated' },
    history: {
      pa: 'ਮੁਕਤਸਰ ਦੀ ਲੜਾਈ ਵਿੱਚ ੪੦ ਸਿੱਖ ਜੋ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਨੂੰ ਛੱਡ ਗਏ ਸਨ, ਉਹ ਵਾਪਸ ਆ ਕੇ ਲੜੇ ਅਤੇ ਸ਼ਹੀਦ ਹੋਏ। ਗੁਰੂ ਜੀ ਨੇ ਉਹਨਾਂ ਨੂੰ "ਮੁਕਤ" ਕਹਿ ਕੇ ਮਾਫ਼ ਕੀਤਾ।',
      en: 'At the Battle of Muktsar, 40 Sikhs who had deserted returned to fight and were martyred. Guru Ji forgave them and called them "Muktas" (Liberated Ones).',
    },
    nanakshahiMonth: 10,
    nanakshahiDay: 1,
    icon: '🏆',
    color: 'from-teal-500 to-cyan-600',
    year: 1705,
  },
];

const typeColors = {
  gurpurab: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
  shaheedi: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  historical: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  mela: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
};

const typeLabels = {
  gurpurab: { pa: 'ਗੁਰਪੁਰਬ', en: 'Gurpurab', hi: 'गुरपुरब' },
  shaheedi: { pa: 'ਸ਼ਹੀਦੀ ਦਿਵਸ', en: 'Shaheedi Divas', hi: 'शहीदी दिवस' },
  historical: { pa: 'ਇਤਿਹਾਸਕ', en: 'Historical', hi: 'ऐतिहासिक' },
  mela: { pa: 'ਮੇਲਾ', en: 'Mela/Festival', hi: 'त्यौहार' },
};

export default function CalendarPage() {
  const { language, isPunjabi } = useLanguage();
  const isHindi = language === 'hi';
  const isEnglish = language === 'en';
  const [selectedEvent, setSelectedEvent] = useState<GurpurabEvent | null>(null);
  const [filter, setFilter] = useState<'all' | 'gurpurab' | 'shaheedi' | 'historical' | 'mela'>('all');
  const nanakshahiDate = useMemo(() => gregorianToNanakshahi(new Date()), []);

  const filteredEvents = filter === 'all' ? GURPURAB_EVENTS : GURPURAB_EVENTS.filter(e => e.type === filter);

  // Sort by month proximity to current Nanakshahi date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const aDist = ((a.nanakshahiMonth - nanakshahiDate.month + 12) % 12) * 31 + a.nanakshahiDay;
    const bDist = ((b.nanakshahiMonth - nanakshahiDate.month + 12) % 12) * 31 + b.nanakshahiDay;
    return aDist - bDist;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-white to-amber-50 dark:from-[#1a1a1a] dark:via-[#1e1e1e] dark:to-[#1a1a1a]">
      <MainNavigation />

      <main id="main-content" className="flex-1">
        {/* Header */}
        <section className="py-8 md:py-12 text-center">
          <div className="container-content">
            <div className="text-5xl mb-3">📅</div>
            <h1 className={cn('text-3xl md:text-4xl font-bold text-amber-900 dark:text-[#daa520]', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ ਕੈਲੰਡਰ' : isHindi ? 'नानकशाही कैलेंडर' : 'Sikh Calendar'}
            </h1>
            <p className={cn('text-amber-700 dark:text-amber-400 mt-2 text-lg', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi
                ? `${nanakshahiDate.day} ${NANAKSHAHI_MONTHS[nanakshahiDate.month].pa} ${nanakshahiDate.year} ਨਾਨਕਸ਼ਾਹੀ`
                : isHindi
                  ? `${nanakshahiDate.day} ${NANAKSHAHI_MONTHS[nanakshahiDate.month].hi || NANAKSHAHI_MONTHS[nanakshahiDate.month].en} ${nanakshahiDate.year} नानकशाही`
                  : `${GREGORIAN_MONTH_NAMES[new Date().getMonth()]} ${new Date().getDate()}, ${new Date().getFullYear()}`}
            </p>
          </div>
        </section>

        {/* Calendar Widget */}
        <section className="pb-8">
          <div className="container-content max-w-lg">
            <NanakshahiCalendarFull language={language} />
          </div>
        </section>

        {/* Events Section */}
        <section className="py-8 md:py-12 bg-white dark:bg-neutral-900/50">
          <div className="container-content max-w-5xl">
            <h2 className={cn('text-2xl font-bold text-center text-amber-900 dark:text-amber-200 mb-6', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
              {isPunjabi ? 'ਗੁਰਪੁਰਬ ਅਤੇ ਇਤਿਹਾਸਕ ਦਿਵਸ' : isHindi ? 'गुरपुरब और ऐतिहासिक दिवस' : 'Gurpurabs & Historical Events'}
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {(['all', 'gurpurab', 'shaheedi', 'historical', 'mela'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm transition-all min-h-[36px]',
                    filter === f
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  )}
                >
                  {f === 'all'
                    ? (isPunjabi ? 'ਸਾਰੇ' : isHindi ? 'सभी' : 'All')
                    : (isPunjabi ? typeLabels[f].pa : isHindi ? (typeLabels[f].hi || typeLabels[f].en) : typeLabels[f].en)}
                </button>
              ))}
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 text-left hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{event.icon}</span>
                    <span className={cn('text-xs px-2.5 py-1 rounded-full', typeColors[event.type])}>
                      {isPunjabi ? typeLabels[event.type].pa : isHindi ? (typeLabels[event.type].hi || typeLabels[event.type].en) : typeLabels[event.type].en}
                    </span>
                  </div>
                  <h3 className={cn('font-semibold text-neutral-900 dark:text-white mb-1', isPunjabi && 'font-gurmukhi text-lg', isHindi && 'font-devanagari text-lg')}>
                    {isPunjabi ? event.name.pa : isHindi ? (event.name.hi || event.name.en) : event.name.en}
                  </h3>
                  <p className={cn('text-sm text-neutral-600 dark:text-neutral-400', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                    {isPunjabi ? event.description.pa : isHindi ? (event.description.hi || event.description.en) : event.description.en}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <span className={cn(!isEnglish && 'font-gurmukhi')}>
                      {isEnglish 
                        ? (() => {
                            const d = new Date(new Date().getFullYear(), NANAKSHAHI_MONTHS[event.nanakshahiMonth].gregorianStart.month, NANAKSHAHI_MONTHS[event.nanakshahiMonth].gregorianStart.day + event.nanakshahiDay - 1);
                            return `${GREGORIAN_MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
                          })()
                        : `${event.nanakshahiDay} ${NANAKSHAHI_MONTHS[event.nanakshahiMonth].pa}`
                      }
                    </span>
                    {event.year && <span>• {event.year} CE</span>}
                  </div>
                  <span className="text-xs text-neela-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity mt-2 block">
                    {isPunjabi ? 'ਹੋਰ ਪੜ੍ਹੋ →' : isHindi ? 'और पढ़ें →' : 'Read more →'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className={cn('p-6 bg-gradient-to-r text-white', selectedEvent.color)}>
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{selectedEvent.icon}</span>
                  <button onClick={() => setSelectedEvent(null)} className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors min-h-[44px] min-w-[44px]">
                    ✕
                  </button>
                </div>
                <h2 className={cn('text-xl font-bold mt-4', isPunjabi && 'font-gurmukhi text-2xl', isHindi && 'font-devanagari text-2xl')}>
                  {isPunjabi ? selectedEvent.name.pa : isHindi ? (selectedEvent.name.hi || selectedEvent.name.en) : selectedEvent.name.en}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-sm text-white/80">
                  <span className={cn(!isEnglish && 'font-gurmukhi')}>
                    {isEnglish 
                      ? (() => {
                          const d = new Date(new Date().getFullYear(), NANAKSHAHI_MONTHS[selectedEvent.nanakshahiMonth].gregorianStart.month, NANAKSHAHI_MONTHS[selectedEvent.nanakshahiMonth].gregorianStart.day + selectedEvent.nanakshahiDay - 1);
                          return `${GREGORIAN_MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
                        })()
                      : `${selectedEvent.nanakshahiDay} ${NANAKSHAHI_MONTHS[selectedEvent.nanakshahiMonth].pa}`
                    }
                  </span>
                  {selectedEvent.year && <span>• {selectedEvent.year} CE</span>}
                </div>
              </div>
              <div className="p-6">
                <div className={cn('text-xs px-3 py-1 rounded-full inline-block mb-4', typeColors[selectedEvent.type])}>
                  {isPunjabi ? typeLabels[selectedEvent.type].pa : isHindi ? (typeLabels[selectedEvent.type].hi || typeLabels[selectedEvent.type].en) : typeLabels[selectedEvent.type].en}
                </div>
                <p className={cn('text-neutral-700 dark:text-neutral-300 leading-relaxed', isPunjabi && 'font-gurmukhi text-lg leading-loose', isHindi && 'font-devanagari text-lg leading-loose')}>
                  {isPunjabi ? selectedEvent.history.pa : isHindi ? (selectedEvent.history.hi || selectedEvent.history.en) : selectedEvent.history.en}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}
