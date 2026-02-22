import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Gurmukhi, Noto_Sans_Devanagari } from 'next/font/google';
import '../styles/globals.css';
import { SkipLink } from '@/components/common/SkipLink';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { BookmarkProvider } from '@/components/common/BookmarkSystem';
import { FontSizeProvider } from '@/components/common/FontSizeControls';
import { ServiceWorkerRegistrar } from '@/components/common/ServiceWorkerRegistrar';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  subsets: ['gurmukhi'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-gurmukhi',
  display: 'swap',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1E3A8A' },
    { media: '(prefers-color-scheme: dark)', color: '#1E3A6E' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'ਸਿੱਖੀ ਵਿੱਦਿਆ | Sikhi Vidhya',
    template: '%s | ਸਿੱਖੀ ਵਿੱਦਿਆ',
  },
  description: 'A sacred platform for Sikh learning, history documentation, and Gurbani study. ਸਿੱਖ ਇਤਿਹਾਸ ਅਤੇ ਗੁਰਬਾਣੀ ਦੀ ਸਿੱਖਿਆ ਲਈ ਪਵਿੱਤਰ ਪਲੇਟਫਾਰਮ।',
  keywords: [
    'Sikh',
    'Sikhi',
    'Gurbani',
    'Guru Granth Sahib',
    'Sikh History',
    'ਸਿੱਖ',
    'ਗੁਰਬਾਣੀ',
    'ਇਤਿਹਾਸ',
  ],
  authors: [{ name: 'Sikhi Vidhya' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sikhi Vidhya',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'ਸਿੱਖੀ ਵਿੱਦਿਆ | Sikhi Vidhya',
    description: 'A sacred platform for Sikh learning and Gurbani study',
    type: 'website',
    locale: 'pa_IN',
    alternateLocale: ['en_US', 'hi_IN'],
    siteName: 'Sikhi Vidhya',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ਸਿੱਖੀ ਵਿੱਦਿਆ | Sikhi Vidhya',
    description: 'Learn Sikhi through primary sources - Sri Guru Granth Sahib Ji and documented history',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pa" dir="ltr" className={`${inter.variable} ${notoSansGurmukhi.variable} ${notoSansDevanagari.variable}`}>
      <head>
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        {/* Favicon - Ik Onkar Symbol */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" sizes="any" />
      </head>
      <body className="min-h-screen bg-neutral-50 dark:bg-neutral-950 antialiased font-sans transition-colors">
        <ThemeProvider>
          <BookmarkProvider>
            <FontSizeProvider>
              <SkipLink />
              <ServiceWorkerRegistrar />
              {children}
            </FontSizeProvider>
          </BookmarkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
