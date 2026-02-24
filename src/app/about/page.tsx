'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MainNavigation, Footer } from '@/components/layout/Navigation';
import { useLanguage } from '@/components/common/LanguageProvider';
import type { Language } from '@/types';

/**
 * About Page - Sikhi Themed Platform Information
 */
export default function AboutPage() {
  const { language, isPunjabi } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F0] dark:bg-neutral-950">
      <MainNavigation />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="sikhi-hero py-16 md:py-24 relative">
          <div className="absolute inset-0 sikhi-pattern opacity-20" />
          <div className="container-content relative z-10 text-center">
            <div className="ik-onkar-hero text-6xl mb-4">ੴ</div>
            <h1 className="text-4xl md:text-5xl font-gurmukhi text-white mb-4">
              ਸਿੱਖੀ ਵਿੱਦਿਆ ਬਾਰੇ
            </h1>
            <p className="text-xl text-blue-100">About Sikhi Vidhya</p>
            <p className="mt-6 text-lg text-blue-50 max-w-2xl mx-auto">
              A sacred platform for Sikh learning, history documentation, and
              Gurbani study — built on principles of accuracy, attribution, and
              reverence.
            </p>
          </div>
          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" className="w-full">
              <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" className="fill-[#FDF8F0] dark:fill-neutral-950"/>
            </svg>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 bg-[#FDF8F0] dark:bg-neutral-950">
          <div className="container-content max-w-4xl">
            <div className="text-center mb-12">
              <div className="sikhi-icon sikhi-icon-gold mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-gurmukhi text-gray-900 dark:text-amber-200 mb-2">
                ਸਾਡਾ ਮਿਸ਼ਨ
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Our Mission</p>
            </div>

            <div className="sikhi-card p-8">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                This platform serves as an educational resource for the global
                Sikh community, providing access to:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="sikhi-icon sikhi-icon-neela flex-shrink-0">
                    <span className="text-xl">📖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Gurbani Study</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Learning and reflection on Sri Guru Granth Sahib Ji, with
                      interpretations from recognized Teekas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
                  <div className="sikhi-icon sikhi-icon-kesri flex-shrink-0">
                    <span className="text-xl">📜</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-1">Sikh History</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Chronological, source-attributed documentation from 1469 to
                      present
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Important Disclaimer */}
        <section className="py-12 bg-amber-50 dark:bg-amber-950/30 border-y-2 border-amber-200 dark:border-amber-800">
          <div className="container-content max-w-4xl">
            <div className="sikhi-frame rounded-lg text-center">
              <div className="flex flex-col items-center gap-4">
                <span className="text-4xl">⚠️</span>
                <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-300">
                  Important Understanding
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
                  This platform supports learning and reflection.{' '}
                  <strong className="dark:text-white">
                    It is NOT a replacement for the Prakash of Sri Guru Granth
                    Sahib Ji or religious practice.
                  </strong>{' '}
                  For religious observances and ceremonies, please attend your
                  local Gurdwara Sahib.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="py-12 bg-white dark:bg-neutral-900">
          <div className="container-content max-w-5xl">
            <div className="text-center mb-12">
              <div className="sikhi-icon sikhi-icon-neela mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h2 className="text-2xl font-gurmukhi text-gray-900 dark:text-blue-200 mb-2">
                ਮੁੱਖ ਸਿਧਾਂਤ
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Core Principles</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  num: 1,
                  title: 'Source-First',
                  desc: 'Every claim and interpretation is attributed to its source. No anonymous narration.',
                  color: 'sikhi-icon-gold',
                },
                {
                  num: 2,
                  title: 'Multilingual Hierarchy',
                  desc: 'Punjabi (Gurmukhi) is primary. English provides interpretation. Hindi for accessibility.',
                  color: 'sikhi-icon-neela',
                },
                {
                  num: 3,
                  title: 'Preserve Interpretations',
                  desc: 'Conflicting views are presented side-by-side with attribution, never merged.',
                  color: 'sikhi-icon-kesri',
                },
                {
                  num: 4,
                  title: 'Contemporary Transparency',
                  desc: 'Modern events are marked as "evolving and not final" for ongoing revision.',
                  color: 'sikhi-icon-gold',
                },
                {
                  num: 5,
                  title: 'Sacred Content Discipline',
                  desc: 'No ads, comments, likes, or gamification in Gurbani. Respecting sacredness.',
                  color: 'sikhi-icon-neela',
                },
              ].map((item) => (
                <div key={item.num} className="sikhi-card p-6">
                  <div className={cn('sikhi-icon mb-4', item.color)}>
                    <span className="font-bold">{item.num}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sources Section */}
        <section className="py-12 bg-[#FDF8F0] dark:bg-neutral-950">
          <div className="container-content max-w-4xl">
            <div className="text-center mb-12">
              <div className="sikhi-icon sikhi-icon-gold mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h2 className="text-2xl font-gurmukhi text-gray-900 dark:text-amber-200 mb-2">
                ਸਰੋਤ
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Our Sources</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* History Sources */}
              <div className="sikhi-card p-6">
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-4 flex items-center gap-2">
                  <span>📜</span> Historical Sources
                </h3>
                <ul className="space-y-3">
                  {[
                    { name: 'Sri Gur Panth Prakash', author: 'Rattan Singh Bhangu (1841)' },
                    { name: 'Suraj Prakash', author: 'Bhai Santokh Singh (1843)' },
                    { name: 'The Sikh Religion', author: 'Max Arthur Macauliffe (1909)' },
                    { name: 'A History of the Sikhs', author: 'Khushwant Singh (1963)' },
                  ].map((source, i) => (
                    <li key={i} className="border-b border-gray-100 dark:border-neutral-700 pb-2 last:border-0">
                      <strong className="text-gray-800 dark:text-gray-200">{source.name}</strong>
                      <br />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{source.author}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gurbani Sources */}
              <div className="sikhi-card sikhi-card-neela p-6">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                  <span>📖</span> Gurbani Interpretation Sources
                </h3>
                <ul className="space-y-3">
                  {[
                    { name: 'Faridkot Teeka', author: 'ਫਰੀਦਕੋਟ ਵਾਲੀ ਟੀਕਾ (1905)' },
                    { name: 'Sri Guru Granth Sahib Darpan', author: 'Prof. Sahib Singh (1962)' },
                    { name: 'SGPC English Interpretation', author: 'Dr. Manmohan Singh' },
                    { name: 'Sant Singh Maskeen Katha', author: 'Recorded works' },
                  ].map((source, i) => (
                    <li key={i} className="border-b border-gray-100 dark:border-neutral-700 pb-2 last:border-0">
                      <strong className="text-gray-800 dark:text-gray-200">{source.name}</strong>
                      <br />
                      <span className="text-sm text-gray-500 dark:text-gray-400">{source.author}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* What We Don't Do */}
        <section className="py-12 bg-white dark:bg-neutral-900">
          <div className="container-content max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-gurmukhi text-red-800 dark:text-red-400 mb-2">
                ਕੀ ਅਸੀਂ ਨਹੀਂ ਕਰਦੇ
              </h2>
              <p className="text-gray-600 dark:text-gray-400">What We Do Not Do</p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
              <ul className="space-y-3">
                {[
                  { text: 'We do not create new interpretations', detail: 'all meanings come from recognized Teekas' },
                  { text: 'We do not accept user-submitted Gurbani arth', detail: 'only verified scholarly sources' },
                  { text: 'We do not call English text "translation"', detail: 'always labeled as "interpretation"' },
                  { text: 'We do not merge conflicting accounts', detail: 'each is presented with its source' },
                  { text: 'We do not use engagement-driven design', detail: 'no infinite scroll or gamification' },
                  { text: 'We do not place ads in Gurbani', detail: 'the sacred section remains pure' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>
                      <strong className="dark:text-gray-100">{item.text}</strong> — {item.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="py-12 bg-[#FDF8F0] dark:bg-neutral-950">
          <div className="container-content max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-xl text-gray-700 dark:text-gray-300">
                Begin your learning journey
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/gurbani"
                className="group sikhi-card sikhi-card-neela p-8 text-center"
              >
                <div className="sikhi-icon sikhi-icon-neela mx-auto mb-4">
                  <span className="font-gurmukhi text-2xl">ੴ</span>
                </div>
                <h3 className="text-2xl font-gurmukhi text-gray-900 dark:text-gray-100 mb-2">ਗੁਰਬਾਣੀ</h3>
                <p className="text-gray-600 dark:text-gray-400">Gurbani Study</p>
                <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                  Study Sri Guru Granth Sahib Ji with interpretations from recognized Teekas
                </p>
                <div className="mt-4">
                  <span className="btn-neela inline-flex items-center gap-2">
                    Explore <span>→</span>
                  </span>
                </div>
              </Link>

              <Link
                href="/itihaas"
                className="group sikhi-card p-8 text-center"
              >
                <div className="sikhi-icon sikhi-icon-kesri mx-auto mb-4">
                  <span className="text-2xl">📜</span>
                </div>
                <h3 className="text-2xl font-gurmukhi text-gray-900 dark:text-gray-100 mb-2">ਇਤਿਹਾਸ</h3>
                <p className="text-gray-600 dark:text-gray-400">Sikh History</p>
                <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">
                  Explore source-attributed history from 1469 to present
                </p>
                <div className="mt-4">
                  <span className="btn-kesri inline-flex items-center gap-2">
                    Explore <span>→</span>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
