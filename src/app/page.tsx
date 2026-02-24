'use client';

// ============================================================================
// HOME PAGE - SIKHI VIDHYA
// ============================================================================
// Beautiful Sikh-themed landing page with Kesri and Neela colors
// Respectful presentation of Gurbani and History sections
// ============================================================================

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { useLanguage } from '@/components/common/LanguageProvider';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { HukamnamaSection } from '@/components/common/Hukamnama';
import { WaheguruSimran } from '@/components/common/WaheguruSimran';
import { OfflineManager } from '@/components/common/OfflineManager';
import type { Language } from '@/types';

// Khanda SVG Component
function KhandaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <path d="M50 5 L50 95 M30 50 L70 50 M20 20 Q50 5 80 20 M20 80 Q50 95 80 80 M35 15 L50 30 L65 15 M35 85 L50 70 L65 85" 
        stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="50" cy="50" r="8" fill="currentColor"/>
    </svg>
  );
}

export default function HomePage() {
  const { language, isPunjabi } = useLanguage();
  const isHindi = language === 'hi';

  const content = {
    pa: {
      welcome: 'ਸਿੱਖੀ ਵਿੱਦਿਆ',
      tagline: 'ਸਿੱਖ ਸਿੱਖਿਆ ਅਤੇ ਵਿਰਸੇ ਦਾ ਪਵਿੱਤਰ ਪਲੇਟਫਾਰਮ',
      moolMantar: 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥',
      gurbaniTitle: 'ਗੁਰਬਾਣੀ',
      gurbaniDesc: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਦੀ ਸਿੱਖਿਆ ਅਤੇ ਵਿਚਾਰ',
      gurbaniNote: 'ਸਿੱਖਿਆ ਅਤੇ ਵਿਚਾਰ ਲਈ',
      itihaasTitle: 'ਇਤਿਹਾਸ',
      itihaasDesc: 'ਸਿੱਖ ਇਤਿਹਾਸ ਦੀ ਸਰੋਤ-ਆਧਾਰਿਤ ਦਸਤਾਵੇਜ਼',
      itihaasNote: 'ਹਰ ਦਾਅਵੇ ਦਾ ਸਰੋਤ',
      explore: 'ਵੇਖੋ',
      principles: 'ਸਾਡੇ ਅਸੂਲ',
      sourceFirst: 'ਸਰੋਤ-ਆਧਾਰਿਤ',
      sourceFirstDesc: 'ਹਰ ਦਾਅਵੇ ਦਾ ਸਰੋਤ ਦਿੱਤਾ ਗਿਆ ਹੈ',
      multiView: 'ਬਹੁ-ਵਿਆਖਿਆ',
      multiViewDesc: 'ਵੱਖ-ਵੱਖ ਵਿਆਖਿਆਵਾਂ ਵੱਖਰੀਆਂ ਦਿਖਾਈਆਂ',
      respect: 'ਸਤਿਕਾਰ',
      respectDesc: 'ਗੁਰਬਾਣੀ ਦਾ ਆਦਰ ਨਾਲ ਪੇਸ਼ਕਾਰੀ',
      verified: 'ਪ੍ਰਮਾਣਿਤ',
      verifiedDesc: 'ਵਿਦਵਾਨਾਂ ਦੁਆਰਾ ਪੁਸ਼ਟੀ',
    },
    en: {
      welcome: 'Sikhi Vidhya',
      tagline: 'A Sacred Platform for Sikh Learning & Heritage',
      moolMantar: 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥',
      gurbaniTitle: 'Gurbani',
      gurbaniDesc: 'Study and reflection on Sri Guru Granth Sahib Ji',
      gurbaniNote: 'For learning and reflection',
      itihaasTitle: 'History',
      itihaasDesc: 'Source-attributed documentation of Sikh history',
      itihaasNote: 'Every claim cited',
      explore: 'Explore',
      principles: 'Our Principles',
      sourceFirst: 'Source-First',
      sourceFirstDesc: 'Every claim cites its source',
      multiView: 'Multiple Views',
      multiViewDesc: 'Conflicting views shown separately',
      respect: 'Reverence',
      respectDesc: 'Sacred content handled with respect',
      verified: 'Verified',
      verifiedDesc: 'Scholarly review process',
    },
    hi: {
      welcome: 'सिखी विद्या',
      tagline: 'सिख शिक्षा और विरासत का पवित्र मंच',
      moolMantar: 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥',
      gurbaniTitle: 'गुरबाणी',
      gurbaniDesc: 'श्री गुरु ग्रंथ साहिब जी का अध्ययन और विचार',
      gurbaniNote: 'सीखने और विचार के लिए',
      itihaasTitle: 'इतिहास',
      itihaasDesc: 'स्रोत-आधारित सिख इतिहास का दस्तावेज़ीकरण',
      itihaasNote: 'हर दावे का स्रोत',
      explore: 'देखें',
      principles: 'हमारे सिद्धांत',
      sourceFirst: 'स्रोत-आधारित',
      sourceFirstDesc: 'हर दावे का स्रोत दिया गया है',
      multiView: 'बहु-व्याख्या',
      multiViewDesc: 'विभिन्न व्याख्याएं अलग से दिखाई गईं',
      respect: 'सम्मान',
      respectDesc: 'गुरबाणी का आदर के साथ प्रस्तुतीकरण',
      verified: 'प्रमाणित',
      verifiedDesc: 'विद्वानों द्वारा पुष्टि',
    },
  } as const;

  const langKey = language === 'pa-roman' ? 'pa' : language;
  const t = content[langKey as keyof typeof content] || content.pa;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      <MainNavigation />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="sikhi-hero py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 sikhi-pattern opacity-30" />
          {/* Floating decorative elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl" />
          
          <div className="container-content relative z-10 text-center">
            {/* Ik Onkar Symbol */}
            <div className="ik-onkar-hero mb-6 animate-in fade-in zoom-in-95 duration-500">ੴ</div>
            
            {/* Main Title */}
            <h1 className={cn(
              'text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {t.welcome}
            </h1>
            
            {/* Tagline */}
            <p className={cn(
              'text-xl md:text-2xl text-blue-100/90 max-w-3xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100',
              isPunjabi && 'font-gurmukhi',
              isHindi && 'font-devanagari'
            )}>
              {t.tagline}
            </p>
            
            {/* Mool Mantar */}
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 md:p-8 shadow-2xl shadow-black/10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <p className="font-gurmukhi text-lg md:text-xl text-amber-100 leading-relaxed">
                {t.moolMantar}
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <Link href="/gurbani" className="btn-neela inline-flex items-center gap-2 shadow-lg shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <span className={isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : ''}>
                  {t.gurbaniTitle}
                </span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/itihaas" className="btn-kesri inline-flex items-center gap-2 shadow-lg shadow-orange-900/30 hover:shadow-xl hover:shadow-orange-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <span className={isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : ''}>
                  {t.itihaasTitle}
                </span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/community" className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur text-white rounded-xl border border-white/20 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                <span className={isPunjabi ? 'font-gurmukhi' : language === 'hi' ? 'font-devanagari' : ''}>
                  {isPunjabi ? 'ਸੰਗਤ' : language === 'hi' ? 'संगत' : 'Community'}
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
              </Link>
            </div>
          </div>
          
          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#FDF8F0"/>
            </svg>
          </div>
        </section>

        {/* Main Sections */}
        <section className="py-16 md:py-24 bg-[#FDF8F0] dark:bg-neutral-950">
          <div className="container-content">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Gurbani Card */}
              <div className="sikhi-card sikhi-card-neela p-8 lg:p-10 group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                <div className="sikhi-icon sikhi-icon-neela mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="font-gurmukhi text-2xl">ੴ</span>
                </div>
                
                <h2 className={cn(
                  'text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4',
                  isPunjabi && 'font-gurmukhi',
                  isHindi && 'font-devanagari'
                )}>
                  {t.gurbaniTitle}
                </h2>
                
                <p className={cn(
                  'text-gray-600 dark:text-gray-400 text-lg mb-4',
                  isPunjabi && 'font-gurmukhi',
                  isHindi && 'font-devanagari'
                )}>
                  {t.gurbaniDesc}
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 mb-6">
                  <p className={cn(
                    'text-blue-800 dark:text-blue-300 text-sm flex items-center gap-2',
                    isPunjabi && 'font-gurmukhi',
                    isHindi && 'font-devanagari'
                  )}>
                    <span>📖</span> {t.gurbaniNote}
                  </p>
                </div>
                
                <Link
                  href="/gurbani"
                  className="btn-neela inline-flex items-center gap-2 w-full justify-center sm:w-auto group/btn"
                >
                  <span className={isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : ''}>
                    {t.explore} {t.gurbaniTitle}
                  </span>
                  <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* History Card */}
              <div className="sikhi-card p-8 lg:p-10 group hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
                <div className="sikhi-icon sikhi-icon-kesri mb-6 group-hover:scale-110 transition-transform duration-300">
                  <KhandaIcon className="w-8 h-8" />
                </div>
                
                <h2 className={cn(
                  'text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4',
                  isPunjabi && 'font-gurmukhi',
                  isHindi && 'font-devanagari'
                )}>
                  {t.itihaasTitle}
                </h2>
                
                <p className={cn(
                  'text-gray-600 dark:text-gray-400 text-lg mb-4',
                  isPunjabi && 'font-gurmukhi',
                  isHindi && 'font-devanagari'
                )}>
                  {t.itihaasDesc}
                </p>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3 mb-6">
                  <p className={cn(
                    'text-orange-800 dark:text-orange-300 text-sm flex items-center gap-2',
                    isPunjabi && 'font-gurmukhi',
                    isHindi && 'font-devanagari'
                  )}>
                    <span>📜</span> {t.itihaasNote}
                  </p>
                </div>
                
                <Link
                  href="/itihaas"
                  className="btn-kesri inline-flex items-center gap-2 w-full justify-center sm:w-auto group/btn"
                >
                  <span className={isPunjabi ? 'font-gurmukhi' : isHindi ? 'font-devanagari' : ''}>
                    {t.explore} {t.itihaasTitle}
                  </span>
                  <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* Community Card - NEW */}
              <div className="sikhi-card p-8 lg:p-10 group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 md:col-span-2 lg:col-span-1 relative overflow-hidden">
                {/* Subtle gradient background for distinction */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent pointer-events-none" />
                
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
                    <span className="text-2xl">🤝</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className={cn(
                      'text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white',
                      isPunjabi && 'font-gurmukhi',
                      language === 'hi' && 'font-devanagari'
                    )}>
                      {isPunjabi ? 'ਸੰਗਤ' : language === 'hi' ? 'संगत' : 'Sangat'}
                    </h2>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                    </span>
                  </div>
                  
                  <p className={cn(
                    'text-gray-600 dark:text-gray-400 text-lg mb-4',
                    isPunjabi && 'font-gurmukhi',
                    language === 'hi' && 'font-devanagari'
                  )}>
                    {isPunjabi
                      ? 'ਸਿੱਖ ਸੰਗਤ ਨਾਲ ਜੁੜੋ, ਵਿਚਾਰ ਕਰੋ ਅਤੇ ਸਿੱਖੋ'
                      : language === 'hi'
                        ? 'सिख संगत से जुड़ें, विचार करें और सीखें'
                      : 'Connect with the Sikh community, discuss and learn together'}
                  </p>
                  
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 mb-6">
                    <p className={cn(
                      'text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2',
                      isPunjabi && 'font-gurmukhi',
                      isHindi && 'font-devanagari'
                    )}>
                      <span>💬</span> {isPunjabi ? 'ਲਾਈਵ ਚੈਟ ਕਮਰੇ' : language === 'hi' ? 'लाइव चैट रूम' : 'Live chat rooms'}
                    </p>
                  </div>
                  
                  <Link
                    href="/community"
                    className="inline-flex items-center gap-2 w-full justify-center sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 group/btn"
                  >
                    <span className={isPunjabi ? 'font-gurmukhi' : language === 'hi' ? 'font-devanagari' : ''}>
                      {isPunjabi ? 'ਸੰਗਤ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ' : language === 'hi' ? 'संगत में शामिल हों' : 'Join Sangat'}
                    </span>
                    <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="sikhi-divider bg-white dark:bg-neutral-900">
          <span className="sikhi-divider-symbol font-gurmukhi text-3xl">☬</span>
        </div>

        {/* Daily Hukamnama Section - Beautiful saroop-style */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-[#fef9e7] via-[#fdf6e3] to-[#fef3c7] dark:from-[#1a1a1a] dark:via-[#1f1a14] dark:to-[#231a0f] relative">
          {/* Diamond pattern background */}
          <div 
            className="absolute inset-0 opacity-10 dark:opacity-5" 
            style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0L60 30L30 60L0 30z\' fill=\'none\' stroke=\'%23daa520\' stroke-width=\'1\'/%3E%3C/svg%3E")' 
            }}
          />
          
          <div className="container-content relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className={cn(
                'text-2xl lg:text-3xl font-bold text-amber-900 dark:text-[#daa520]',
                isPunjabi && 'font-gurmukhi',
                isHindi && 'font-devanagari'
              )}>
                {isPunjabi ? 'ਅੱਜ ਦਾ ਹੁਕਮਨਾਮਾ' : isHindi ? 'आज का हुकमनामा' : "Today's Hukamnama"}
              </h2>
            </div>
            
            {/* Hukamnama Display */}
            <HukamnamaSection language={language} />
            
            {/* Nitnem Link */}
            <div className="text-center mt-10">
              <Link
                href="/nitnem"
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-neela-600 to-neela-700 text-white rounded-xl hover:from-neela-700 hover:to-neela-800 transition-all shadow-lg hover:shadow-xl"
              >
                <span className="text-xl">🙏</span>
                <span className={cn('font-medium', isPunjabi && 'font-gurmukhi', isHindi && 'font-devanagari')}>
                  {isPunjabi ? 'ਨਿਤਨੇਮ ਬਾਣੀਆਂ ਪੜ੍ਹੋ' : isHindi ? 'नितनेम बाणियाँ पढ़ें' : 'Read Nitnem Banis'}
                </span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Principles Section */}
        <section className="py-16 md:py-20 bg-white dark:bg-neutral-900">
          <div className="container-content">
            <div className="text-center mb-12">
              <h2 className={cn(
                'text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3',
                isPunjabi && 'font-gurmukhi',
                isHindi && 'font-devanagari'
              )}>
                {t.principles}
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full" />
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: '📚',
                  title: t.sourceFirst,
                  desc: t.sourceFirstDesc,
                  color: 'from-amber-500 to-amber-600',
                  bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                },
                {
                  icon: '🔄',
                  title: t.multiView,
                  desc: t.multiViewDesc,
                  color: 'from-blue-500 to-blue-600',
                  bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                },
                {
                  icon: '🙏',
                  title: t.respect,
                  desc: t.respectDesc,
                  color: 'from-orange-500 to-orange-600',
                  bgColor: 'bg-orange-50 dark:bg-orange-900/20',
                },
                {
                  icon: '✓',
                  title: t.verified,
                  desc: t.verifiedDesc,
                  color: 'from-emerald-500 to-emerald-600',
                  bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 rounded-2xl bg-gradient-to-b from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-850 border border-gray-100 dark:border-neutral-700 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className={cn(
                    'w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300',
                    item.color
                  )}>
                    <span className="text-2xl text-white drop-shadow">{item.icon}</span>
                  </div>
                  <h3 className={cn(
                    'font-semibold text-gray-900 dark:text-white mb-2 text-lg',
                    isPunjabi && 'font-gurmukhi',
                    isHindi && 'font-devanagari'
                  )}>
                    {item.title}
                  </h3>
                  <p className={cn(
                    'text-gray-600 dark:text-gray-400 text-sm',
                    isPunjabi && 'font-gurmukhi',
                    isHindi && 'font-devanagari'
                  )}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-white to-[#FDF8F0] dark:from-neutral-900 dark:to-neutral-950 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-1/2 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl -translate-y-1/2" />
          
          <div className="container-content max-w-3xl relative">
            <div className="sikhi-frame rounded-2xl text-center shadow-lg">
              <p className="font-gurmukhi text-2xl md:text-3xl text-gray-800 dark:text-gray-100 leading-relaxed mb-4">
                ਕਿਰਤ ਕਰੋ, ਨਾਮ ਜਪੋ, ਵੰਡ ਛਕੋ
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Work honestly, Meditate on the Divine, Share with others
              </p>
              <div className="mt-4 text-amber-600 dark:text-amber-400 font-medium">
                — The Three Pillars of Sikhi
              </div>
            </div>
          </div>
        </section>

        {/* Waheguru Simran Counter */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-[#FDF8F0] via-white to-[#fef9e7]">
          <div className="container-content max-w-2xl">
            <div className="text-center mb-8">
              <h2 className={cn(
                'text-2xl lg:text-3xl font-bold text-neela-800 dark:text-blue-300',
                isPunjabi && 'font-gurmukhi',
                isHindi && 'font-devanagari'
              )}>
                {isPunjabi ? 'ਵਾਹਿਗੁਰੂ ਸਿਮਰਨ' : isHindi ? 'वाहेगुरू सिमरन' : 'Waheguru Simran'}
              </h2>
              <p className={cn(
                'text-neutral-600 dark:text-neutral-400 mt-2',
                isPunjabi && 'font-gurmukhi',
                isHindi && 'font-devanagari'
              )}>
                {isPunjabi ? 'ਨਾਮ ਜਪੋ — ਡਿਜੀਟਲ ਮਾਲਾ' : isHindi ? 'नाम जपो — डिजिटल माला काउंटर' : 'Naam Japo — Digital Mala Counter'}
              </p>
            </div>
            <WaheguruSimran language={language} />
          </div>
        </section>

        {/* Offline Content Manager */}
        <section className="py-12 bg-gradient-to-b from-[#fef9e7] to-white">
          <div className="container-content max-w-2xl">
            <OfflineManager language={language} />
          </div>
        </section>
      </main>

      <ScrollToTop />
      <Footer />
    </div>
  );
}
