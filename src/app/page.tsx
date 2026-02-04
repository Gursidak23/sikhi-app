'use client';

// ============================================================================
// HOME PAGE - SIKHI VIDHYA
// ============================================================================
// Beautiful Sikh-themed landing page with Kesri and Neela colors
// Respectful presentation of Gurbani and History sections
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { HukamnamaSection } from '@/components/common/Hukamnama';
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
  const [language, setLanguage] = useState<Language>('pa');

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
  const isPunjabi = language === 'pa';

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigation
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="sikhi-hero py-20 md:py-32 relative">
          <div className="absolute inset-0 sikhi-pattern opacity-30" />
          
          <div className="container-content relative z-10 text-center">
            {/* Ik Onkar Symbol */}
            <div className="ik-onkar-hero mb-6">ੴ</div>
            
            {/* Main Title */}
            <h1 className={cn(
              'text-4xl md:text-6xl font-bold text-white mb-4',
              isPunjabi && 'font-gurmukhi'
            )}>
              {t.welcome}
            </h1>
            
            {/* Tagline */}
            <p className={cn(
              'text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8',
              isPunjabi && 'font-gurmukhi'
            )}>
              {t.tagline}
            </p>
            
            {/* Mool Mantar */}
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur rounded-lg border border-white/20 p-6">
              <p className="font-gurmukhi text-lg md:text-xl text-amber-100 leading-relaxed">
                {t.moolMantar}
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/gurbani" className="btn-neela inline-flex items-center gap-2">
                <span className={isPunjabi ? 'font-gurmukhi' : ''}>
                  {t.gurbaniTitle}
                </span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/itihaas" className="btn-kesri inline-flex items-center gap-2">
                <span className={isPunjabi ? 'font-gurmukhi' : ''}>
                  {t.itihaasTitle}
                </span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
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
        <section className="py-16 md:py-24 bg-[#FDF8F0]">
          <div className="container-content">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Gurbani Card */}
              <div className="sikhi-card sikhi-card-neela p-8 lg:p-10">
                <div className="sikhi-icon sikhi-icon-neela mb-6">
                  <span className="font-gurmukhi text-2xl">ੴ</span>
                </div>
                
                <h2 className={cn(
                  'text-2xl lg:text-3xl font-bold text-gray-900 mb-4',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {t.gurbaniTitle}
                </h2>
                
                <p className={cn(
                  'text-gray-600 text-lg mb-4',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {t.gurbaniDesc}
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
                  <p className={cn(
                    'text-blue-800 text-sm flex items-center gap-2',
                    isPunjabi && 'font-gurmukhi'
                  )}>
                    <span>📖</span> {t.gurbaniNote}
                  </p>
                </div>
                
                <Link
                  href="/gurbani"
                  className="btn-neela inline-flex items-center gap-2 w-full justify-center sm:w-auto"
                >
                  <span className={isPunjabi ? 'font-gurmukhi' : ''}>
                    {t.explore} {t.gurbaniTitle}
                  </span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              {/* History Card */}
              <div className="sikhi-card p-8 lg:p-10">
                <div className="sikhi-icon sikhi-icon-kesri mb-6">
                  <KhandaIcon className="w-8 h-8" />
                </div>
                
                <h2 className={cn(
                  'text-2xl lg:text-3xl font-bold text-gray-900 mb-4',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {t.itihaasTitle}
                </h2>
                
                <p className={cn(
                  'text-gray-600 text-lg mb-4',
                  isPunjabi && 'font-gurmukhi'
                )}>
                  {t.itihaasDesc}
                </p>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 mb-6">
                  <p className={cn(
                    'text-orange-800 text-sm flex items-center gap-2',
                    isPunjabi && 'font-gurmukhi'
                  )}>
                    <span>📜</span> {t.itihaasNote}
                  </p>
                </div>
                
                <Link
                  href="/itihaas"
                  className="btn-kesri inline-flex items-center gap-2 w-full justify-center sm:w-auto"
                >
                  <span className={isPunjabi ? 'font-gurmukhi' : ''}>
                    {t.explore} {t.itihaasTitle}
                  </span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
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
                isPunjabi && 'font-gurmukhi'
              )}>
                {isPunjabi ? 'ਅੱਜ ਦਾ ਹੁਕਮਨਾਮਾ' : "Today's Hukamnama"}
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
                <span className={cn('font-medium', isPunjabi && 'font-gurmukhi')}>
                  {isPunjabi ? 'ਨਿਤਨੇਮ ਬਾਣੀਆਂ ਪੜ੍ਹੋ' : 'Read Nitnem Banis'}
                </span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Principles Section */}
        <section className="py-16 bg-white">
          <div className="container-content">
            <h2 className={cn(
              'text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-12',
              isPunjabi && 'font-gurmukhi'
            )}>
              {t.principles}
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: '📚',
                  title: t.sourceFirst,
                  desc: t.sourceFirstDesc,
                  color: 'sikhi-icon-gold',
                },
                {
                  icon: '🔄',
                  title: t.multiView,
                  desc: t.multiViewDesc,
                  color: 'sikhi-icon-neela',
                },
                {
                  icon: '🙏',
                  title: t.respect,
                  desc: t.respectDesc,
                  color: 'sikhi-icon-kesri',
                },
                {
                  icon: '✓',
                  title: t.verified,
                  desc: t.verifiedDesc,
                  color: 'sikhi-icon-gold',
                },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 rounded-xl bg-gradient-to-b from-white to-gray-50 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className={cn('sikhi-icon mx-auto mb-4', item.color)}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <h3 className={cn(
                    'font-semibold text-gray-900 mb-2 text-lg',
                    isPunjabi && 'font-gurmukhi'
                  )}>
                    {item.title}
                  </h3>
                  <p className={cn(
                    'text-gray-600 text-sm',
                    isPunjabi && 'font-gurmukhi'
                  )}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-16 bg-gradient-to-b from-white to-[#FDF8F0]">
          <div className="container-content max-w-3xl">
            <div className="sikhi-frame rounded-lg text-center">
              <p className="font-gurmukhi text-2xl md:text-3xl text-gray-800 leading-relaxed mb-4">
                ਕਿਰਤ ਕਰੋ, ਨਾਮ ਜਪੋ, ਵੰਡ ਛਕੋ
              </p>
              <p className="text-gray-600 text-lg">
                Work honestly, Meditate on the Divine, Share with others
              </p>
              <div className="mt-4 text-amber-600 font-medium">
                — The Three Pillars of Sikhi
              </div>
            </div>
          </div>
        </section>
      </main>

      <ScrollToTop />
      <Footer language={language} />
    </div>
  );
}
