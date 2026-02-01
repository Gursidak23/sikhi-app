// ============================================================================
// STRUCTURED DATA (JSON-LD)
// ============================================================================
// Schema.org structured data for SEO
// ============================================================================

import type { MultilingualText } from '@/types/api';

interface WebsiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  alternateName?: string;
  url: string;
  description: string;
  inLanguage: string[];
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    '@type': 'Person' | 'Organization';
    name: string;
  };
  publisher?: {
    '@type': 'Organization';
    name: string;
  };
}

interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

// ============================================================================
// GENERATORS
// ============================================================================

export function generateWebsiteSchema(): WebsiteSchema {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sikhividhya.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ਸਿੱਖੀ ਵਿੱਦਿਆ | Sikhi Vidhya',
    alternateName: 'Sikhi Vidhya Platform',
    url: baseUrl,
    description: 'A sacred platform for Sikh learning, Gurbani study, and historical documentation',
    inLanguage: ['pa', 'en', 'hi'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/gurbani?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema(): OrganizationSchema {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sikhividhya.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ਸਿੱਖੀ ਵਿੱਦਿਆ',
    url: baseUrl,
  };
}

export function generateGurbaniVerseSchema(
  verse: {
    gurmukhi: string;
    translation?: string;
    author?: string;
    raag?: string;
    angNumber: number;
  }
): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: verse.gurmukhi.substring(0, 100),
    description: verse.translation || `Gurbani verse from Ang ${verse.angNumber}`,
    author: verse.author
      ? { '@type': 'Person', name: verse.author }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'ਸਿੱਖੀ ਵਿੱਦਿਆ',
    },
  };
}

export function generateHistoricalEventSchema(
  event: {
    title: MultilingualText;
    description: MultilingualText;
    year: number;
  }
): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: event.title.en || event.title.pa,
    description: event.description.en || event.description.pa,
    datePublished: `${event.year}-01-01`,
    publisher: {
      '@type': 'Organization',
      name: 'ਸਿੱਖੀ ਵਿੱਦਿਆ',
    },
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ============================================================================
// SCRIPT TAG GENERATOR
// ============================================================================

/**
 * Generate JSON-LD script tag content
 * Use in Next.js head or layout:
 * <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateJsonLd(data) }} />
 */
export function generateJsonLd(data: object): string {
  return JSON.stringify(data);
}
