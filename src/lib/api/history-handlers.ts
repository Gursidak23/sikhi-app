import prisma from '@/lib/db/prisma';

/**
 * History/Itihaas API Route Handlers
 * Uses the Prisma singleton to avoid connection exhaustion
 */

// Get the full timeline structure
export async function getTimeline() {
  const eras = await prisma.era.findMany({
    orderBy: { yearStart: 'asc' },
    include: {
      periods: {
        orderBy: { yearStart: 'asc' },
        include: {
          _count: {
            select: { events: true },
          },
        },
      },
    },
  });

  return {
    eras: eras.map((era) => ({
      id: era.id,
      name: {
        pa: era.nameGurmukhi,
        en: era.nameEnglish,
      },
      description: {
        pa: era.descriptionPunjabi,
        en: era.descriptionEnglish,
      },
      years: {
        start: era.yearStart,
        end: era.yearEnd,
      },
      eraType: era.eraType,
      isOngoing: era.isOngoing,
      periods: era.periods.map((period) => ({
        id: period.id,
        name: {
          pa: period.nameGurmukhi,
          en: period.nameEnglish,
        },
        years: {
          start: period.yearStart,
          end: period.yearEnd,
        },
        eventCount: period._count.events,
      })),
    })),
    disclaimer:
      'Every historical claim is attributed to its source. Contemporary events are evolving.',
  };
}

// Get a specific era with all events
export async function getEraWithEvents(eraId: string) {
  const era = await prisma.era.findUnique({
    where: { id: eraId },
    include: {
      periods: {
        orderBy: { yearStart: 'asc' },
        include: {
          events: {
            orderBy: { yearStart: 'asc' },
            include: {
              citations: {
                include: { source: true },
              },
              interpretations: true,
              figures: {
                include: { figure: true },
              },
            },
          },
        },
      },
    },
  });

  if (!era) {
    throw new Error('Era not found');
  }

  // Add contemporary disclaimer if applicable
  const response: Record<string, unknown> = {
    era: {
      id: era.id,
      name: {
        pa: era.nameGurmukhi,
        en: era.nameEnglish,
      },
      description: {
        pa: era.descriptionPunjabi,
        en: era.descriptionEnglish,
      },
      years: {
        start: era.yearStart,
        end: era.yearEnd,
      },
      eraType: era.eraType,
      isOngoing: era.isOngoing,
      periods: era.periods.map((period) => ({
        id: period.id,
        name: {
          pa: period.nameGurmukhi,
          en: period.nameEnglish,
        },
        description: {
          pa: period.descriptionPunjabi,
          en: period.descriptionEnglish,
        },
        years: {
          start: period.yearStart,
          end: period.yearEnd,
        },
        events: period.events.map((event) => formatEvent(event)),
      })),
    },
  };

  if (era.isOngoing) {
    response.contemporaryDisclaimer =
      'This is contemporary, evolving history that is not final. Information may be subject to revision.';
  }

  return response;
}

// Get a specific event with full details
export async function getEventById(eventId: string) {
  const event = await prisma.historicalEvent.findUnique({
    where: { id: eventId },
    include: {
      period: {
        include: {
          era: true,
        },
      },
      citations: {
        include: { source: true },
      },
      interpretations: true,
      figures: {
        include: { figure: true },
      },
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  return formatEvent(event);
}

// Get historical figure by ID
export async function getFigureById(figureId: string) {
  const figure = await prisma.historicalFigure.findUnique({
    where: { id: figureId },
    include: {
      events: {
        include: {
          event: {
            include: {
              period: {
                include: { era: true },
              },
            },
          },
        },
      },
    },
  });

  if (!figure) {
    throw new Error('Figure not found');
  }

  return {
    id: figure.id,
    name: {
      pa: figure.nameGurmukhi,
      en: figure.nameEnglish,
    },
    biography: {
      pa: figure.biographyPunjabi,
      en: figure.biographyEnglish,
    },
    lifespan: {
      birth: figure.birthYear,
      birthApprox: figure.birthYearApprox,
      death: figure.deathYear,
      deathApprox: figure.deathYearApprox,
    },
    isGuru: figure.isGuru,
    guruNumber: figure.guruNumber,
    events: figure.events.map((ef) => ({
      id: ef.event.id,
      title: {
        pa: ef.event.titleGurmukhi,
        en: ef.event.titleEnglish,
      },
      year: ef.event.yearStart,
      role: ef.role,
      period: ef.event.period.nameGurmukhi,
      era: ef.event.period.era.nameGurmukhi,
    })),
  };
}

// Get all Guru Sahibaan
export async function getGuruSahibaan() {
  const gurus = await prisma.historicalFigure.findMany({
    where: {
      isGuru: true,
      guruNumber: {
        not: null,
      },
    },
    orderBy: {
      guruNumber: 'asc',
    },
    include: {
      _count: {
        select: { events: true },
      },
    },
  });

  return gurus.map((guru) => ({
    id: guru.id,
    guruNumber: guru.guruNumber,
    name: {
      pa: guru.nameGurmukhi,
      en: guru.nameEnglish,
    },
    lifespan: {
      birth: guru.birthYear,
      death: guru.deathYear,
    },
    eventCount: guru._count.events,
  }));
}

// Get contemporary events (for special handling)
export async function getContemporaryEvents() {
  const contemporaryEras = await prisma.era.findMany({
    where: { isOngoing: true },
    include: {
      periods: {
        include: {
          events: {
            orderBy: { yearStart: 'desc' },
            include: {
              citations: {
                include: { source: true },
              },
            },
          },
        },
      },
    },
  });

  const events = contemporaryEras.flatMap((era) =>
    era.periods.flatMap((period) =>
      period.events.map((event) => ({
        id: event.id,
        title: {
          pa: event.titleGurmukhi,
          en: event.titleEnglish,
        },
        date: {
          type: event.dateType,
          year: event.yearStart,
        },
        isContemporary: event.isContemporary,
        warningNote: event.contemporaryNote,
        sources: event.citations.map((c) => ({
          title: c.source.titleEnglish,
          author: c.source.authorEnglish,
        })),
      }))
    )
  );

  return {
    events,
    mandatoryDisclaimer:
      'ਇਹ ਸਮਕਾਲੀ ਇਤਿਹਾਸ ਹੈ ਜੋ ਵਿਕਸਤ ਹੋ ਰਿਹਾ ਹੈ। / This is contemporary, evolving history that is not final.',
  };
}

// Search history
export async function searchHistory(query: string) {
  if (!query || query.length < 2) {
    throw new Error('Search query must be at least 2 characters');
  }

  const [events, figures] = await Promise.all([
    prisma.historicalEvent.findMany({
      where: {
        OR: [
          { titleGurmukhi: { contains: query } },
          { titleEnglish: { contains: query, mode: 'insensitive' } },
          { descriptionPunjabi: { contains: query } },
          { descriptionEnglish: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 25,
      include: {
        period: true,
      },
    }),
    prisma.historicalFigure.findMany({
      where: {
        OR: [
          { nameGurmukhi: { contains: query } },
          { nameEnglish: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 25,
    }),
  ]);

  return {
    events: events.map((e) => ({
      id: e.id,
      type: 'event',
      title: { pa: e.titleGurmukhi, en: e.titleEnglish },
      year: e.yearStart,
      period: e.period.nameGurmukhi,
    })),
    figures: figures.map((f) => ({
      id: f.id,
      type: 'figure',
      name: { pa: f.nameGurmukhi, en: f.nameEnglish },
      isGuru: f.isGuru,
    })),
  };
}

// Helper function to format event data
interface EventData {
  id: string;
  titleGurmukhi: string;
  titleEnglish: string;
  descriptionPunjabi: string;
  descriptionEnglish: string;
  dateType: string;
  yearStart: number;
  yearEnd: number | null;
  monthStart: number | null;
  dayStart: number | null;
  location: string | null;
  locationDetails: string | null;
  isContemporary: boolean;
  contemporaryNote: string | null;
  citations?: Array<{
    source: {
      id: string;
      titleGurmukhi: string;
      titleEnglish: string;
      authorEnglish: string | null;
      sourceType: string;
    };
    volume: string | null;
    chapter: string | null;
    page: string | null;
    originalQuote: string | null;
  }>;
  interpretations?: Array<{
    id: string;
    scholarName: string;
    workTitle: string;
    interpretationPunjabi: string | null;
    interpretationEnglish: string | null;
    perspectiveNotes: string | null;
  }>;
  figures?: Array<{
    figure: {
      id: string;
      nameGurmukhi: string;
      nameEnglish: string;
      isGuru: boolean;
    };
  }>;
}

function formatEvent(event: EventData) {
  const result: Record<string, unknown> = {
    id: event.id,
    title: {
      pa: event.titleGurmukhi,
      en: event.titleEnglish,
    },
    description: {
      pa: event.descriptionPunjabi,
      en: event.descriptionEnglish,
    },
    date: {
      type: event.dateType,
      yearStart: event.yearStart,
      yearEnd: event.yearEnd,
      monthStart: event.monthStart,
      dayStart: event.dayStart,
    },
    location: event.location,
    locationDetails: event.locationDetails,
    isContemporary: event.isContemporary,
    sources: event.citations?.map((citation) => ({
      id: citation.source.id,
      title: {
        pa: citation.source.titleGurmukhi,
        en: citation.source.titleEnglish,
      },
      author: citation.source.authorEnglish,
      type: citation.source.sourceType,
      reference: {
        volume: citation.volume,
        chapter: citation.chapter,
        page: citation.page,
        originalQuote: citation.originalQuote,
      },
    })),
    interpretations: event.interpretations?.map((interp) => ({
      id: interp.id,
      scholar: interp.scholarName,
      work: interp.workTitle,
      text: {
        pa: interp.interpretationPunjabi,
        en: interp.interpretationEnglish,
      },
      perspectiveNote: interp.perspectiveNotes,
    })),
    keyFigures: event.figures?.map((ef) => ({
      id: ef.figure.id,
      name: {
        pa: ef.figure.nameGurmukhi,
        en: ef.figure.nameEnglish,
      },
      isGuru: ef.figure.isGuru,
    })),
  };

  // Add warning for contemporary events
  if (event.isContemporary) {
    result.warningNote = {
      pa: event.contemporaryNote || 'ਇਹ ਸਮਕਾਲੀ ਇਤਿਹਾਸ ਹੈ ਜੋ ਵਿਕਸਤ ਹੋ ਰਿਹਾ ਹੈ।',
      en:
        event.contemporaryNote ||
        'This is contemporary, evolving history that is not final.',
    };
  }

  return result;
}
