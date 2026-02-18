import prisma from '@/lib/db/prisma';

/**
 * Gurbani API Route Handlers
 * These functions can be used in Next.js API routes
 * Uses the Prisma singleton to avoid connection exhaustion
 */

// Get content for a specific Ang
export async function getAngContent(angNumber: number) {
  if (angNumber < 1 || angNumber > 1430) {
    throw new Error('Ang number must be between 1 and 1430');
  }

  const shabads = await prisma.shabad.findMany({
    where: {
      angNumber: angNumber,
    },
    include: {
      author: true,
      raag: true,
      panktis: {
        orderBy: {
          lineNumber: 'asc',
        },
        include: {
          interpretations: {
            where: {
              status: 'PUBLISHED',
            },
            include: {
              source: true,
            },
          },
        },
      },
    },
    orderBy: {
      shabadNumber: 'asc',
    },
  });

  // Format for API response
  return {
    ang: angNumber,
    totalAngs: 1430,
    shabads: shabads.map((shabad) => ({
      id: shabad.id,
      shabadNumber: shabad.shabadNumber,
      author: shabad.author
        ? {
            id: shabad.author.id,
            name: {
              pa: shabad.author.nameGurmukhi,
              en: shabad.author.nameEnglish,
            },
            isGuru: shabad.author.isGuru,
            guruNumber: shabad.author.guruNumber,
          }
        : null,
      raag: shabad.raag
        ? {
            id: shabad.raag.id,
            name: {
              pa: shabad.raag.nameGurmukhi,
              en: shabad.raag.nameEnglish,
            },
          }
        : null,
      panktis: shabad.panktis.map((pankti) => ({
        id: pankti.id,
        lineNumber: pankti.lineNumber,
        gurmukhi: pankti.gurmukhiUnicode,
        transliteration: pankti.transliteration,
        interpretations: pankti.interpretations.map((interp) => ({
          id: interp.id,
          source: {
            id: interp.source.id,
            title: {
              pa: interp.source.titleGurmukhi,
              en: interp.source.titleEnglish,
            },
            author: interp.source.authorEnglish,
          },
          meaning: {
            pa: interp.arthPunjabi,
            en: interp.meaningEnglish,
            hi: interp.arthHindi,
          },
          padArth: interp.padArth,
        })),
      })),
    })),
    navigation: {
      previousAng: angNumber > 1 ? angNumber - 1 : null,
      nextAng: angNumber < 1430 ? angNumber + 1 : null,
    },
    disclaimer:
      'Meanings are interpretations from named sources, not literal translations.',
  };
}

// Get a specific Shabad by ID
export async function getShabadById(shabadId: string) {
  const shabad = await prisma.shabad.findUnique({
    where: { id: shabadId },
    include: {
      author: true,
      raag: true,
      panktis: {
        orderBy: { lineNumber: 'asc' },
        include: {
          interpretations: {
            where: { status: 'PUBLISHED' },
            include: { source: true },
          },
        },
      },
    },
  });

  if (!shabad) {
    throw new Error('Shabad not found');
  }

  return shabad;
}

// Get all Raags
export async function getRaags() {
  const raags = await prisma.raag.findMany({
    orderBy: { orderInGranth: 'asc' },
    include: {
      _count: {
        select: { shabads: true },
      },
    },
  });

  return raags.map((raag) => ({
    id: raag.id,
    name: {
      pa: raag.nameGurmukhi,
      en: raag.nameEnglish,
    },
    angRange: {
      start: raag.angStart,
      end: raag.angEnd,
    },
    orderInGranth: raag.orderInGranth,
    shabadCount: raag._count.shabads,
  }));
}

// Get Shabads by Raag
export async function getShabadsByRaag(raagId: string) {
  const raag = await prisma.raag.findUnique({
    where: { id: raagId },
    include: {
      shabads: {
        orderBy: { shabadNumber: 'asc' },
        include: {
          author: true,
          panktis: {
            take: 1,
            orderBy: { lineNumber: 'asc' },
          },
        },
      },
    },
  });

  if (!raag) {
    throw new Error('Raag not found');
  }

  return raag;
}

// Search Gurbani
export async function searchGurbani(query: string) {
  if (!query || query.length < 3) {
    throw new Error('Search query must be at least 3 characters');
  }

  const panktis = await prisma.pankti.findMany({
    where: {
      OR: [
        { gurmukhiUnicode: { contains: query } },
        { transliteration: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 50,
    include: {
      shabad: {
        include: {
          author: true,
          raag: true,
        },
      },
    },
  });

  return panktis.map((pankti) => ({
    id: pankti.id,
    gurmukhi: pankti.gurmukhiUnicode,
    transliteration: pankti.transliteration,
    angNumber: pankti.shabad.angNumber,
    shabad: {
      id: pankti.shabad.id,
      shabadNumber: pankti.shabad.shabadNumber,
      author: pankti.shabad.author?.nameGurmukhi,
      raag: pankti.shabad.raag?.nameGurmukhi,
    },
  }));
}
