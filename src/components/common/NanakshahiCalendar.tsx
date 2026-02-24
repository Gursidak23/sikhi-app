'use client';

// ============================================================================
// NANAKSHAHI CALENDAR COMPONENT
// ============================================================================
// Sikh Calendar with Gurpurabs, Shaheedi Divas, and important dates
// ============================================================================

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

// Nanakshahi months
interface NanakshahiMonth {
  pa: string;
  en: string;
  hi?: string;
  days: number;
  gregorianStart: { month: number; day: number };
}

const NANAKSHAHI_MONTHS: NanakshahiMonth[] = [
  { pa: 'ਚੇਤ', en: 'Chet', days: 31, gregorianStart: { month: 2, day: 14 } }, // March 14
  { pa: 'ਵੈਸਾਖ', en: 'Vaisakh', days: 31, gregorianStart: { month: 3, day: 14 } }, // April 14
  { pa: 'ਜੇਠ', en: 'Jeth', days: 31, gregorianStart: { month: 4, day: 15 } }, // May 15
  { pa: 'ਹਾੜ', en: 'Harh', days: 31, gregorianStart: { month: 5, day: 15 } }, // June 15
  { pa: 'ਸਾਵਣ', en: 'Sawan', days: 31, gregorianStart: { month: 6, day: 16 } }, // July 16
  { pa: 'ਭਾਦੋਂ', en: 'Bhadon', days: 30, gregorianStart: { month: 7, day: 16 } }, // August 16
  { pa: 'ਅੱਸੂ', en: 'Assu', days: 30, gregorianStart: { month: 8, day: 15 } }, // September 15
  { pa: 'ਕੱਤਕ', en: 'Katak', days: 30, gregorianStart: { month: 9, day: 15 } }, // October 15
  { pa: 'ਮੱਘਰ', en: 'Maghar', days: 30, gregorianStart: { month: 10, day: 14 } }, // November 14
  { pa: 'ਪੋਹ', en: 'Poh', days: 30, gregorianStart: { month: 11, day: 14 } }, // December 14
  { pa: 'ਮਾਘ', en: 'Magh', days: 30, gregorianStart: { month: 0, day: 13 } }, // January 13
  { pa: 'ਫੱਗਣ', en: 'Phagan', days: 30, gregorianStart: { month: 1, day: 12 } }, // February 12
];

// Important Sikh dates (fixed in Nanakshahi calendar)
interface SikhEvent {
  type: 'gurpurab' | 'shaheedi' | 'historical';
  name: { pa: string; en: string; hi?: string };
  description?: { pa: string; en: string; hi?: string };
  nanakshahiMonth: number; // 0-indexed
  nanakshahiDay: number;
  icon: string;
}

const SIKH_EVENTS: SikhEvent[] = [
  // Gurpurabs (Birth/Joti Jot of Gurus)
  {
    type: 'gurpurab',
    name: { pa: 'ਵੈਸਾਖੀ - ਖਾਲਸਾ ਸਾਜਨਾ ਦਿਵਸ', en: 'Vaisakhi - Khalsa Creation Day' },
    description: { pa: '੧੬੯੯ ਵਿੱਚ ਖਾਲਸਾ ਪੰਥ ਦੀ ਸਿਰਜਨਾ', en: 'Creation of Khalsa Panth in 1699' },
    nanakshahiMonth: 1, // Vaisakh
    nanakshahiDay: 1,
    icon: '⚔️',
  },
  {
    type: 'gurpurab',
    name: { pa: 'ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਪ੍ਰਕਾਸ਼ ਪੁਰਬ', en: 'Guru Nanak Dev Ji Prakash Purab' },
    description: { pa: '੧੪੬੯ ਵਿੱਚ ਗੁਰੂ ਜੀ ਦਾ ਜਨਮ', en: 'Birth of Guru Ji in 1469' },
    nanakshahiMonth: 7, // Katak
    nanakshahiDay: 1,
    icon: '🙏',
  },
  {
    type: 'gurpurab',
    name: { pa: 'ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਪ੍ਰਕਾਸ਼ ਪੁਰਬ', en: 'Guru Gobind Singh Ji Prakash Purab' },
    description: { pa: '੧੬੬੬ ਵਿੱਚ ਗੁਰੂ ਜੀ ਦਾ ਜਨਮ', en: 'Birth of Guru Ji in 1666' },
    nanakshahiMonth: 9, // Poh
    nanakshahiDay: 23,
    icon: '⚔️',
  },
  {
    type: 'gurpurab',
    name: { pa: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਦਾ ਗੁਰਗੱਦੀ ਦਿਵਸ', en: 'Gurgaddi Diwas - Guru Granth Sahib Ji' },
    description: { pa: '੧੭੦੮ ਵਿੱਚ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਨੂੰ ਗੁਰਗੱਦੀ', en: 'Guru Granth Sahib Ji became eternal Guru in 1708' },
    nanakshahiMonth: 7, // Katak
    nanakshahiDay: 6,
    icon: '📖',
  },
  // Shaheedi Divas
  {
    type: 'shaheedi',
    name: { pa: 'ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ ਸ਼ਹੀਦੀ ਦਿਵਸ', en: 'Shaheedi Divas - Guru Arjan Dev Ji' },
    description: { pa: '੧੬੦੬ ਵਿੱਚ ਪਹਿਲੇ ਸ਼ਹੀਦ ਗੁਰੂ', en: 'First martyred Guru in 1606' },
    nanakshahiMonth: 2, // Jeth
    nanakshahiDay: 2,
    icon: '🕯️',
  },
  {
    type: 'shaheedi',
    name: { pa: 'ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ ਸ਼ਹੀਦੀ ਦਿਵਸ', en: 'Shaheedi Divas - Guru Tegh Bahadur Ji' },
    description: { pa: '੧੬੭੫ ਵਿੱਚ ਹਿੰਦ ਦੀ ਚਾਦਰ', en: 'Protector of Hindustan in 1675' },
    nanakshahiMonth: 8, // Maghar
    nanakshahiDay: 11,
    icon: '🕯️',
  },
  {
    type: 'shaheedi',
    name: { pa: 'ਸਾਹਿਬਜ਼ਾਦਿਆਂ ਦਾ ਸ਼ਹੀਦੀ ਦਿਵਸ', en: 'Shaheedi Divas - Sahibzade' },
    description: { pa: 'ਛੋਟੇ ਸਾਹਿਬਜ਼ਾਦੇ ਸਰਹਿੰਦ ਵਿੱਚ ਸ਼ਹੀਦ', en: 'Younger Sahibzade martyred at Sirhind' },
    nanakshahiMonth: 9, // Poh
    nanakshahiDay: 13,
    icon: '🧱',
  },
  {
    type: 'shaheedi',
    name: { pa: 'ਮਾਤਾ ਗੁਜਰੀ ਜੀ ਸ਼ਹੀਦੀ ਦਿਵਸ', en: 'Shaheedi Divas - Mata Gujri Ji' },
    description: { pa: 'ਸਾਹਿਬਜ਼ਾਦਿਆਂ ਦੀ ਦਾਦੀ ਮਾਂ', en: 'Grandmother of Sahibzade' },
    nanakshahiMonth: 9, // Poh
    nanakshahiDay: 13,
    icon: '🕯️',
  },
  {
    type: 'shaheedi',
    name: { pa: 'ਵੱਡੇ ਸਾਹਿਬਜ਼ਾਦਿਆਂ ਦਾ ਸ਼ਹੀਦੀ ਦਿਵਸ', en: 'Shaheedi Divas - Elder Sahibzade' },
    description: { pa: 'ਬਾਬਾ ਅਜੀਤ ਸਿੰਘ ਅਤੇ ਬਾਬਾ ਜੁਝਾਰ ਸਿੰਘ', en: 'Baba Ajit Singh and Baba Jujhar Singh' },
    nanakshahiMonth: 9, // Poh
    nanakshahiDay: 8,
    icon: '⚔️',
  },
  // Historical Events
  {
    type: 'historical',
    name: { pa: 'ਬੰਦੀ ਛੋੜ ਦਿਵਸ', en: 'Bandi Chhor Divas' },
    description: { pa: 'ਗੁਰੂ ਹਰਗੋਬਿੰਦ ਸਾਹਿਬ ਜੀ ਦੀ ਗਵਾਲੀਅਰ ਤੋਂ ਰਿਹਾਈ', en: 'Guru Hargobind Sahib Ji released from Gwalior' },
    nanakshahiMonth: 7, // Katak
    nanakshahiDay: 15,
    icon: '🪔',
  },
  {
    type: 'historical',
    name: { pa: 'ਹੋਲਾ ਮਹੱਲਾ', en: 'Hola Mohalla' },
    description: { pa: 'ਸਿੱਖ ਯੁੱਧ ਕਲਾ ਦਾ ਤਿਉਹਾਰ', en: 'Sikh martial arts festival' },
    nanakshahiMonth: 11, // Phagan
    nanakshahiDay: 30,
    icon: '🎭',
  },
  {
    type: 'historical',
    name: { pa: 'ਮਾਘੀ', en: 'Maghi' },
    description: { pa: 'ਚਾਲੀ ਮੁਕਤਿਆਂ ਦਾ ਦਿਵਸ', en: 'Day of the Forty Liberated' },
    nanakshahiMonth: 10, // Magh
    nanakshahiDay: 1,
    icon: '🏆',
  },
];

// Export constants and helper functions for use in Navigation
export { NANAKSHAHI_MONTHS };

// Convert Gregorian date to Nanakshahi date
export function gregorianToNanakshahi(date: Date): { month: number; day: number; year: number } {
  const year = date.getFullYear();
  const baseYear = 1469; // Guru Nanak Dev Ji's birth year
  
  let nanakshahiYear = year - baseYear + 1;
  let nanakshahiMonth = 0;
  let nanakshahiDay = 0;
  
  // Check each month to find where this date falls
  for (let i = 0; i < 12; i++) {
    const monthStart = NANAKSHAHI_MONTHS[i].gregorianStart;
    const monthDays = NANAKSHAHI_MONTHS[i].days;
    
    // Create date for start of this Nanakshahi month
    const startDate = new Date(year, monthStart.month, monthStart.day);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + monthDays - 1);
    
    if (date >= startDate && date <= endDate) {
      nanakshahiMonth = i;
      nanakshahiDay = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      break;
    }
  }
  
  // Handle year boundary (Chet starts in March)
  if (date.getMonth() < 2 || (date.getMonth() === 2 && date.getDate() < 14)) {
    nanakshahiYear--;
  }
  
  return { month: nanakshahiMonth, day: nanakshahiDay, year: nanakshahiYear };
}

// Get events for a specific Nanakshahi month
function getEventsForMonth(month: number): SikhEvent[] {
  return SIKH_EVENTS.filter(event => event.nanakshahiMonth === month);
}

// Enhanced Full Calendar with month grid and festivals
export function NanakshahiCalendarFull({ language, onClose }: { language: Language; onClose?: () => void }) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const nanakshahi = gregorianToNanakshahi(today);
    return nanakshahi.month;
  });
  
  const nanakshahiDate = useMemo(() => gregorianToNanakshahi(today), []);
  const monthEvents = useMemo(() => getEventsForMonth(selectedMonth), [selectedMonth]);
  
  const currentMonth = NANAKSHAHI_MONTHS[selectedMonth];
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';
  
  // Generate days grid for the month
  const daysInMonth = currentMonth.days;
  const weeksGrid = useMemo(() => {
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];
    
    // Get the day of week for the first day of this Nanakshahi month
    const gregorianYear = today.getFullYear();
    const startDate = new Date(gregorianYear, currentMonth.gregorianStart.month, currentMonth.gregorianStart.day);
    const startDayOfWeek = startDate.getDay(); // 0 = Sunday
    
    // Add empty cells for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Fill remaining cells in last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [selectedMonth, currentMonth, daysInMonth, today]);
  
  // Check if a day has an event
  const getEventForDay = (day: number): SikhEvent | undefined => {
    return monthEvents.find(event => event.nanakshahiDay === day);
  };
  
  const weekDays = isPunjabi 
    ? ['ਐਤ', 'ਸੋਮ', 'ਮੰਗਲ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕਰ', 'ਸ਼ਨੀ']
    : isHindi
    ? ['रवि', 'सोम', 'मंगल', 'बुध', 'वीर', 'शुक्र', 'शनि']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="bg-gradient-to-b from-[#fef9e7] to-white dark:from-neutral-900 dark:to-neutral-950 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-4 sm:p-6 relative">
        {/* Close button - positioned absolutely in top-right */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10"
            aria-label="Close calendar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <div className="flex items-start justify-between mb-4 pr-10">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-gurmukhi font-bold">
              {isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ ਕੈਲੰਡਰ' : isHindi ? 'नानकशाही कैलेंडर' : 'Nanakshahi Calendar'}
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm mt-1">
              {isPunjabi ? 'ਸਿੱਖ ਕੈਲੰਡਰ' : isHindi ? 'सिख कैलेंडर' : 'Sikh Calendar'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl sm:text-4xl font-bold">{nanakshahiDate.year}</p>
            <p className="text-xs sm:text-sm text-amber-100">
              {isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ' : isHindi ? 'नानकशाही' : 'Nanakshahi'}
            </p>
          </div>
        </div>
        
        {/* Today's Date */}
        <div className="bg-white/20 backdrop-blur rounded-xl p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-amber-100">
            {isPunjabi ? 'ਅੱਜ ਦੀ ਤਾਰੀਖ' : isHindi ? 'आज की तारीख' : "Today's Date"}
          </p>
          <p className="text-lg sm:text-xl font-gurmukhi font-semibold">
            {nanakshahiDate.day} {isPunjabi 
              ? NANAKSHAHI_MONTHS[nanakshahiDate.month].pa 
              : isHindi ? (NANAKSHAHI_MONTHS[nanakshahiDate.month].hi || NANAKSHAHI_MONTHS[nanakshahiDate.month].pa)
              : NANAKSHAHI_MONTHS[nanakshahiDate.month].en
            }, {nanakshahiDate.year}
          </p>
        </div>
      </div>
      
      {/* Month Navigator */}
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-amber-50 dark:bg-neutral-800 border-b border-amber-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1))}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-white dark:bg-neutral-700 hover:bg-amber-100 dark:hover:bg-neutral-600 transition-colors shadow-sm border border-amber-200 dark:border-neutral-600"
            aria-label="Previous month"
          >
            <svg className="w-4 h-4 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-gurmukhi font-bold text-amber-900 dark:text-amber-200">
              {isPunjabi ? currentMonth.pa : isHindi ? (currentMonth.hi || currentMonth.pa) : currentMonth.en}
            </h3>
            <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400">
              {currentMonth.days} {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}
            </p>
          </div>
          
          <button
            onClick={() => setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1))}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-white dark:bg-neutral-700 hover:bg-amber-100 dark:hover:bg-neutral-600 transition-colors shadow-sm border border-amber-200 dark:border-neutral-600"
            aria-label="Next month"
          >
            <svg className="w-4 h-4 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="p-2 sm:p-3 bg-white dark:bg-neutral-900">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days grid */}
        <div className="space-y-0.5">
          {weeksGrid.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-0.5">
              {week.map((day, dayIndex) => {
                const event = day ? getEventForDay(day) : undefined;
                const isToday = day === nanakshahiDate.day && selectedMonth === nanakshahiDate.month;
                
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      'relative min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center rounded-md text-xs sm:text-sm transition-colors',
                      day === null && 'bg-transparent',
                      day !== null && !isToday && !event && 'bg-amber-50 dark:bg-neutral-800 hover:bg-amber-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300',
                      isToday && 'bg-amber-500 text-white font-bold shadow-md',
                      event && !isToday && 'bg-amber-200 dark:bg-amber-900/40 font-semibold text-amber-900 dark:text-amber-200'
                    )}
                    title={event ? (isPunjabi ? event.name.pa : isHindi ? (event.name.hi || event.name.pa) : event.name.en) : undefined}
                  >
                    {day}
                    {event && (
                      <span className="absolute -top-0.5 -right-0.5 text-[8px] sm:text-[10px]">{event.icon}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Events for this month */}
      <div className="p-2.5 sm:p-3 border-t border-neutral-200 dark:border-neutral-700">
        <h4 className="text-[10px] sm:text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <span>📅</span>
          {isPunjabi ? 'ਇਸ ਮਹੀਨੇ ਦੇ ਦਿਹਾੜੇ' : isHindi ? 'इस महीने के दिहाड़े' : 'Events This Month'}
        </h4>
        
        {monthEvents.length > 0 ? (
          <div className="space-y-2">
            {monthEvents.map((event, index) => (
              <div
                key={index}
                className={cn(
                  'p-2 sm:p-3 rounded-lg sm:rounded-xl border-l-4 flex items-start gap-2 sm:gap-3',
                  event.type === 'gurpurab' && 'bg-amber-50 dark:bg-amber-900/20 border-amber-500',
                  event.type === 'shaheedi' && 'bg-red-50 dark:bg-red-900/20 border-red-500',
                  event.type === 'historical' && 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                )}
              >
                <span className="text-base sm:text-lg">{event.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-2">
                    <p className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
                      {isPunjabi ? event.name.pa : isHindi ? (event.name.hi || event.name.pa) : event.name.en}
                    </p>
                    <span className="text-[10px] sm:text-xs bg-white dark:bg-neutral-700 px-2 py-0.5 sm:py-1 rounded-full text-neutral-600 dark:text-neutral-300 whitespace-nowrap w-fit">
                      {event.nanakshahiDay} {isPunjabi ? currentMonth.pa : isHindi ? (currentMonth.hi || currentMonth.pa) : currentMonth.en}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {isPunjabi ? event.description.pa : isHindi ? (event.description.hi || event.description.pa) : event.description.en}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 py-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            {isPunjabi 
              ? 'ਇਸ ਮਹੀਨੇ ਕੋਈ ਦਿਹਾੜਾ ਨਹੀਂ' 
              : isHindi ? 'इस महीने कोई दिहाड़ा नहीं'
              : 'No events this month'
            }
          </p>
        )}
      </div>
      
      {/* Legend */}
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-wrap gap-3 sm:gap-4 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-400 rounded-full"></span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {isPunjabi ? 'ਗੁਰਪੁਰਬ' : isHindi ? 'गुरपुरब' : 'Gurpurab'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {isPunjabi ? 'ਸ਼ਹੀਦੀ ਦਿਵਸ' : isHindi ? 'शहीदी दिवस' : 'Shaheedi'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {isPunjabi ? 'ਇਤਿਹਾਸਕ' : isHindi ? 'ऐतिहासिक' : 'Historical'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-500 rounded-full"></span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {isPunjabi ? 'ਅੱਜ' : isHindi ? 'आज' : 'Today'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NanakshahiCalendar({ language }: { language: Language }) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const nanakshahi = gregorianToNanakshahi(today);
    return nanakshahi.month;
  });
  
  const nanakshahiDate = useMemo(() => gregorianToNanakshahi(today), []);
  const monthEvents = useMemo(() => getEventsForMonth(selectedMonth), [selectedMonth]);
  
  const currentMonth = NANAKSHAHI_MONTHS[selectedMonth];
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';
  
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-kesri-600 to-kesri-700 text-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-gurmukhi">
            {isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ ਕੈਲੰਡਰ' : isHindi ? 'नानकशाही कैलेंडर' : 'Nanakshahi Calendar'}
          </h2>
          <div className="text-right">
            <p className="text-2xl font-bold">{nanakshahiDate.year}</p>
            <p className="text-sm opacity-90">
              {isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ' : isHindi ? 'नानकशाही' : 'Nanakshahi'}
            </p>
          </div>
        </div>
        
        {/* Today's Date */}
        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <p className="text-sm opacity-90">
            {isPunjabi ? 'ਅੱਜ ਦੀ ਤਾਰੀਖ' : isHindi ? 'आज की तारीख' : "Today's Date"}
          </p>
          <p className="text-lg font-gurmukhi">
            {nanakshahiDate.day} {isPunjabi 
              ? NANAKSHAHI_MONTHS[nanakshahiDate.month].pa 
              : isHindi ? (NANAKSHAHI_MONTHS[nanakshahiDate.month].hi || NANAKSHAHI_MONTHS[nanakshahiDate.month].pa)
              : NANAKSHAHI_MONTHS[nanakshahiDate.month].en
            }, {nanakshahiDate.year}
          </p>
        </div>
      </div>
      
      {/* Month Selector */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1))}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h3 className="text-xl font-gurmukhi text-neutral-900 dark:text-neutral-100">
              {isPunjabi ? currentMonth.pa : isHindi ? (currentMonth.hi || currentMonth.pa) : currentMonth.en}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {currentMonth.days} {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}
            </p>
          </div>
          
          <button
            onClick={() => setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1))}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Month Events */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">
          {isPunjabi ? 'ਇਸ ਮਹੀਨੇ ਦੇ ਦਿਹਾੜੇ' : isHindi ? 'इस महीने के दिहाड़े' : 'Events This Month'}
        </h4>
        
        {monthEvents.length > 0 ? (
          <div className="space-y-3">
            {monthEvents.map((event, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-lg border-l-4',
                  event.type === 'gurpurab' && 'bg-amber-50 dark:bg-amber-900/20 border-amber-500',
                  event.type === 'shaheedi' && 'bg-red-50 dark:bg-red-900/20 border-red-500',
                  event.type === 'historical' && 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{event.icon}</span>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {isPunjabi ? event.name.pa : isHindi ? (event.name.hi || event.name.pa) : event.name.en}
                    </p>
                    {event.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        {isPunjabi ? event.description.pa : isHindi ? (event.description.hi || event.description.pa) : event.description.en}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2 font-gurmukhi">
                      {event.nanakshahiDay} {isPunjabi ? currentMonth.pa : isHindi ? (currentMonth.hi || currentMonth.pa) : currentMonth.en}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-6">
            {isPunjabi 
              ? 'ਇਸ ਮਹੀਨੇ ਕੋਈ ਦਿਹਾੜਾ ਨਹੀਂ' 
              : isHindi ? 'इस महीने कोई दिहाड़ा नहीं'
              : 'No events this month'
            }
          </p>
        )}
      </div>
      
      {/* Legend */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {isPunjabi ? 'ਗੁਰਪੁਰਬ' : isHindi ? 'गुरपुरब' : 'Gurpurab'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {isPunjabi ? 'ਸ਼ਹੀਦੀ ਦਿਵਸ' : isHindi ? 'शहीदी दिवस' : 'Shaheedi Divas'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="text-neutral-600 dark:text-neutral-400">
              {isPunjabi ? 'ਇਤਿਹਾਸਕ' : isHindi ? 'ऐतिहासिक' : 'Historical'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini version for sidebar
export function NanakshahiCalendarMini({ language }: { language: Language }) {
  const today = new Date();
  const nanakshahiDate = useMemo(() => gregorianToNanakshahi(today), []);
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';
  
  // Find upcoming events
  const upcomingEvents = useMemo(() => {
    const currentMonth = nanakshahiDate.month;
    const currentDay = nanakshahiDate.day;
    
    // Get events from current and next month
    const events: (SikhEvent & { daysAway: number })[] = [];
    
    for (let i = 0; i < 2; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const monthEvents = getEventsForMonth(monthIndex);
      
      monthEvents.forEach(event => {
        let daysAway: number;
        if (i === 0 && event.nanakshahiDay >= currentDay) {
          daysAway = event.nanakshahiDay - currentDay;
        } else if (i === 1) {
          daysAway = (NANAKSHAHI_MONTHS[currentMonth].days - currentDay) + event.nanakshahiDay;
        } else {
          daysAway = 999; // Skip past events
        }
        
        if (daysAway < 999) {
          events.push({ ...event, daysAway });
        }
      });
    }
    
    return events.sort((a, b) => a.daysAway - b.daysAway).slice(0, 3);
  }, [nanakshahiDate]);
  
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-kesri-500 to-kesri-600 text-white p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-90">
              {isPunjabi ? 'ਅੱਜ' : isHindi ? 'आज' : 'Today'}
            </p>
            <p className="text-lg font-gurmukhi">
              {nanakshahiDate.day} {isPunjabi 
                ? NANAKSHAHI_MONTHS[nanakshahiDate.month].pa 
                : isHindi ? (NANAKSHAHI_MONTHS[nanakshahiDate.month].hi || NANAKSHAHI_MONTHS[nanakshahiDate.month].pa)
                : NANAKSHAHI_MONTHS[nanakshahiDate.month].en
              }
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{nanakshahiDate.year}</p>
          </div>
        </div>
      </div>
      
      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="p-3">
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
            {isPunjabi ? 'ਆਉਣ ਵਾਲੇ ਦਿਹਾੜੇ' : isHindi ? 'आने वाले दिहाड़े' : 'Upcoming'}
          </p>
          <div className="space-y-2">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span>{event.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-neutral-800 dark:text-neutral-200">
                    {isPunjabi ? event.name.pa : isHindi ? (event.name.hi || event.name.pa) : event.name.en}
                  </p>
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                  {event.daysAway === 0 
                    ? (isPunjabi ? 'ਅੱਜ' : isHindi ? 'आज' : 'Today')
                    : event.daysAway === 1 
                      ? (isPunjabi ? 'ਕੱਲ੍ਹ' : isHindi ? 'कल' : 'Tomorrow')
                      : `${event.daysAway} ${isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}`
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Clickable Date Badge for top-right of sections
export function NanakshahiDateBadge({ 
  language, 
  onClick 
}: { 
  language: Language; 
  onClick?: () => void;
}) {
  const today = new Date();
  const nanakshahiDate = useMemo(() => gregorianToNanakshahi(today), []);
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';
  
  // Find next upcoming event
  const nextEvent = useMemo(() => {
    const currentMonth = nanakshahiDate.month;
    const currentDay = nanakshahiDate.day;
    
    const events: (SikhEvent & { daysAway: number })[] = [];
    
    for (let i = 0; i < 3; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const monthEvents = getEventsForMonth(monthIndex);
      
      monthEvents.forEach(event => {
        let daysAway: number;
        if (i === 0 && event.nanakshahiDay >= currentDay) {
          daysAway = event.nanakshahiDay - currentDay;
        } else if (i > 0) {
          let totalDays = 0;
          for (let j = 0; j < i; j++) {
            const mIdx = (currentMonth + j) % 12;
            if (j === 0) {
              totalDays += NANAKSHAHI_MONTHS[mIdx].days - currentDay;
            } else {
              totalDays += NANAKSHAHI_MONTHS[mIdx].days;
            }
          }
          daysAway = totalDays + event.nanakshahiDay;
        } else {
          daysAway = 999;
        }
        
        if (daysAway < 999 && daysAway >= 0) {
          events.push({ ...event, daysAway });
        }
      });
    }
    
    return events.sort((a, b) => a.daysAway - b.daysAway)[0] || null;
  }, [nanakshahiDate]);
  
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-kesri-500 to-kesri-600 hover:from-kesri-600 hover:to-kesri-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
      aria-label="Open Nanakshahi Calendar"
    >
      {/* Date */}
      <div className="text-left">
        <p className="text-xs opacity-90">
          {isPunjabi ? 'ਅੱਜ' : isHindi ? 'आज' : 'Today'}
        </p>
        <p className="text-sm font-gurmukhi font-medium">
          {nanakshahiDate.day} {isPunjabi 
            ? NANAKSHAHI_MONTHS[nanakshahiDate.month].pa 
            : isHindi ? (NANAKSHAHI_MONTHS[nanakshahiDate.month].hi || NANAKSHAHI_MONTHS[nanakshahiDate.month].pa)
            : NANAKSHAHI_MONTHS[nanakshahiDate.month].en
          }
        </p>
      </div>
      
      {/* Year Badge */}
      <div className="text-2xl font-bold border-l border-white/30 pl-3">
        {nanakshahiDate.year}
      </div>
      
      {/* Upcoming event hint */}
      {nextEvent && (
        <div className="hidden sm:flex items-center gap-2 text-xs border-l border-white/30 pl-3">
          <span>{nextEvent.icon}</span>
          <div>
            <p className="opacity-80">
              {isPunjabi ? 'ਆਉਣ ਵਾਲਾ' : isHindi ? 'आने वाला' : 'Upcoming'}
            </p>
            <p className="font-medium truncate max-w-[100px]">
              {nextEvent.daysAway === 0 
                ? (isPunjabi ? 'ਅੱਜ!' : isHindi ? 'आज!' : 'Today!')
                : `${nextEvent.daysAway} ${isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}`
              }
            </p>
          </div>
        </div>
      )}
      
      {/* Calendar icon */}
      <svg 
        className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </button>
  );
}
