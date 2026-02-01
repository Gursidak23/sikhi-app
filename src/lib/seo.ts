// ============================================================================
// SEO UTILITIES
// ============================================================================
// Helper functions for generating SEO metadata
// ============================================================================

import type { Metadata } from 'next';

interface SeoParams {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  locale?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sikhividhya.com';

export function generateMetadata({
  title,
  description,
  keywords = [],
  path = '',
  image = '/og-image.png',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Sikhi Vidhya',
  locale = 'pa_IN',
}: SeoParams): Metadata {
  const url = `${BASE_URL}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  const baseKeywords = [
    'Sikh',
    'Sikhi',
    'Gurbani',
    'Guru Granth Sahib',
    'Sikh History',
    'ਸਿੱਖ',
    'ਗੁਰਬਾਣੀ',
    'ਇਤਿਹਾਸ',
    'Sri Guru Granth Sahib Ji',
    'Khalsa',
    'Waheguru',
  ];

  return {
    title,
    description,
    keywords: [...baseKeywords, ...keywords],
    authors: [{ name: author }],
    creator: author,
    publisher: 'Sikhi Vidhya',
    openGraph: {
      title,
      description,
      url,
      siteName: 'Sikhi Vidhya',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: type as 'website' | 'article',
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: [author],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
      languages: {
        'pa-IN': `${url}?lang=pa`,
        'en-US': `${url}?lang=en`,
        'hi-IN': `${url}?lang=hi`,
      },
    },
  };
}

// Generate JSON-LD structured data for SEO
export function generateJsonLd(params: {
  type: 'WebSite' | 'Article' | 'BreadcrumbList' | 'Organization';
  name?: string;
  description?: string;
  url?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  articleData?: {
    headline: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
  };
}) {
  const baseUrl = BASE_URL;

  if (params.type === 'WebSite') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: params.name || 'Sikhi Vidhya',
      description: params.description || 'Learn Sikhi through primary sources',
      url: params.url || baseUrl,
      inLanguage: ['pa-IN', 'en-US', 'hi-IN'],
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
  }

  if (params.type === 'BreadcrumbList' && params.breadcrumbs) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: params.breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${baseUrl}${item.url}`,
      })),
    };
  }

  if (params.type === 'Article' && params.articleData) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: params.articleData.headline,
      description: params.articleData.description,
      author: {
        '@type': 'Organization',
        name: params.articleData.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Sikhi Vidhya',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
      datePublished: params.articleData.datePublished,
      dateModified: params.articleData.dateModified || params.articleData.datePublished,
      image: params.articleData.image || `${baseUrl}/og-image.png`,
    };
  }

  if (params.type === 'Organization') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Sikhi Vidhya',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description: 'A platform dedicated to presenting authentic Sikh teachings from primary sources.',
      sameAs: [],
    };
  }

  return null;
}

// Component to render JSON-LD in head (use in Server Components)
export function generateJsonLdScript(data: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
