import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/types/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      // Sacred, minimal color palette
      colors: {
        // Primary - Deep Kesri (Saffron) - used sparingly
        kesri: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary kesri
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Neutral - For text and backgrounds
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Sacred blue - for Gurbani sections
        neela: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      // Typography - Gurmukhi-first
      fontFamily: {
        // Primary Gurmukhi font
        gurmukhi: [
          'Noto Sans Gurmukhi',
          'Raavi',
          'Mukta Mahee',
          'sans-serif',
        ],
        // For English/Hindi
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        // For sacred Gurbani display - more traditional
        gurbani: [
          'Anmol Lipi',
          'GurbaniAkhar',
          'Noto Sans Gurmukhi',
          'sans-serif',
        ],
      },
      // Spacing for Gurmukhi readability
      fontSize: {
        'gurbani-sm': ['1.125rem', { lineHeight: '2', letterSpacing: '0.025em' }],
        'gurbani-base': ['1.375rem', { lineHeight: '2.25', letterSpacing: '0.025em' }],
        'gurbani-lg': ['1.625rem', { lineHeight: '2.5', letterSpacing: '0.025em' }],
        'gurbani-xl': ['2rem', { lineHeight: '2.75', letterSpacing: '0.025em' }],
        'gurbani-2xl': ['2.5rem', { lineHeight: '3', letterSpacing: '0.025em' }],
      },
    },
  },
  plugins: [],
};

export default config;
