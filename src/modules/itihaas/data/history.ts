// ============================================================================
// HISTORY (ITIHAAS) DATA ACCESS LAYER
// ============================================================================
// Provides data access functions for historical content
// Ensures all claims are source-attributed
// Conflicting interpretations are preserved, not merged
// ============================================================================

import prisma from '@/lib/db/prisma';
import type { Era, Period, HistoricalEvent, HistoricalFigure } from '@/types';

/**
 * Get all historical eras in chronological order
 */
export async function getAllEras() {
  return prisma.era.findMany({
    orderBy: { yearStart: 'asc' },
    include: {
      periods: {
        orderBy: { yearStart: 'asc' },
      },
    },
  });
}

/**
 * Get a specific era with all periods and events
 */
export async function getEraWithEvents(eraId: string) {
  return prisma.era.findUnique({
    where: { id: eraId },
    include: {
      periods: {
        orderBy: { yearStart: 'asc' },
        include: {
          events: {
            where: { status: 'PUBLISHED' },
            orderBy: { yearStart: 'asc' },
            include: {
              citations: {
                include: { source: true },
              },
              figures: {
                include: { figure: true },
              },
              interpretations: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get all periods for an era
 */
export async function getPeriodsForEra(eraId: string) {
  return prisma.period.findMany({
    where: { eraId },
    orderBy: { yearStart: 'asc' },
    include: {
      events: {
        where: { status: 'PUBLISHED' },
        orderBy: { yearStart: 'asc' },
      },
    },
  });
}

/**
 * Get a specific period with events
 */
export async function getPeriodWithEvents(periodId: string) {
  return prisma.period.findUnique({
    where: { id: periodId },
    include: {
      era: true,
      events: {
        where: { status: 'PUBLISHED' },
        orderBy: { yearStart: 'asc' },
        include: {
          citations: {
            include: { source: true },
          },
          figures: {
            include: { figure: true },
          },
          interpretations: true,
        },
      },
    },
  });
}

/**
 * Get a specific historical event with full details
 * Includes ALL interpretations (never merged)
 */
export async function getEventById(eventId: string) {
  return prisma.historicalEvent.findUnique({
    where: { id: eventId },
    include: {
      period: {
        include: { era: true },
      },
      citations: {
        include: { source: true },
      },
      figures: {
        include: { figure: true },
      },
      interpretations: {
        orderBy: [
          { isPrimarySource: 'desc' },
          { publicationYear: 'asc' },
        ],
      },
    },
  });
}

/**
 * Get events by year range
 */
export async function getEventsByYearRange(startYear: number, endYear: number) {
  return prisma.historicalEvent.findMany({
    where: {
      status: 'PUBLISHED',
      yearStart: {
        gte: startYear,
        lte: endYear,
      },
    },
    orderBy: { yearStart: 'asc' },
    include: {
      period: true,
      citations: {
        include: { source: true },
        take: 3,
      },
      figures: {
        include: { figure: true },
      },
    },
  });
}

/**
 * Get contemporary events (clearly marked as ongoing)
 */
export async function getContemporaryEvents() {
  return prisma.historicalEvent.findMany({
    where: {
      isContemporary: true,
      status: 'PUBLISHED',
    },
    orderBy: { yearStart: 'desc' },
    include: {
      period: true,
      citations: {
        include: { source: true },
      },
      figures: {
        include: { figure: true },
      },
      interpretations: true,
    },
  });
}

/**
 * Get all historical figures
 */
export async function getAllHistoricalFigures() {
  return prisma.historicalFigure.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [
      { isGuru: 'desc' },
      { guruNumber: 'asc' },
      { birthYear: 'asc' },
    ],
  });
}

/**
 * Get Guru Sahibaan (historical figures who are Gurus)
 */
export async function getGuruSahibaanFigures() {
  return prisma.historicalFigure.findMany({
    where: {
      isGuru: true,
      status: 'PUBLISHED',
    },
    orderBy: { guruNumber: 'asc' },
  });
}

/**
 * Get a specific historical figure
 */
export async function getHistoricalFigureById(figureId: string) {
  return prisma.historicalFigure.findUnique({
    where: { id: figureId },
    include: {
      events: {
        include: {
          event: {
            include: {
              period: true,
            },
          },
        },
        orderBy: {
          event: { yearStart: 'asc' },
        },
      },
    },
  });
}

/**
 * Get events involving a specific figure
 */
export async function getEventsForFigure(figureId: string) {
  return prisma.historicalEventFigure.findMany({
    where: { figureId },
    include: {
      event: {
        include: {
          period: true,
          citations: {
            include: { source: true },
            take: 2,
          },
        },
      },
    },
    orderBy: {
      event: { yearStart: 'asc' },
    },
  });
}

/**
 * Search historical events
 */
export async function searchHistoricalEvents(query: string, limit = 50) {
  return prisma.historicalEvent.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { titleGurmukhi: { contains: query } },
        { titleEnglish: { contains: query, mode: 'insensitive' } },
        { descriptionPunjabi: { contains: query } },
        { descriptionEnglish: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      period: {
        include: { era: true },
      },
      citations: {
        include: { source: true },
        take: 2,
      },
    },
    take: limit,
    orderBy: { yearStart: 'asc' },
  });
}

/**
 * Get all sources used in historical content
 */
export async function getAllHistoricalSources() {
  return prisma.source.findMany({
    where: {
      sourceType: {
        in: ['PRIMARY', 'SECONDARY', 'ORAL_TRADITION', 'CONTEMPORARY'],
      },
    },
    orderBy: [
      { sourceType: 'asc' },
      { yearPublished: 'asc' },
    ],
  });
}

/**
 * Get events with disputed dates
 */
export async function getEventsWithDisputedDates() {
  return prisma.historicalEvent.findMany({
    where: {
      dateType: 'disputed',
      status: 'PUBLISHED',
    },
    include: {
      interpretations: true,
      citations: {
        include: { source: true },
      },
    },
    orderBy: { yearStart: 'asc' },
  });
}

/**
 * Get events requiring scholarly review
 */
export async function getEventsRequiringReview() {
  return prisma.historicalEvent.findMany({
    where: {
      status: 'SCHOLARLY_REVIEW',
    },
    include: {
      period: true,
      citations: {
        include: { source: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

/**
 * Get timeline data for visualization
 */
export async function getTimelineData() {
  const eras = await prisma.era.findMany({
    orderBy: { yearStart: 'asc' },
    include: {
      periods: {
        orderBy: { yearStart: 'asc' },
        include: {
          events: {
            where: { status: 'PUBLISHED' },
            orderBy: { yearStart: 'asc' },
            select: {
              id: true,
              titleGurmukhi: true,
              titleEnglish: true,
              yearStart: true,
              yearEnd: true,
              isContemporary: true,
            },
          },
        },
      },
    },
  });

  return eras.map((era) => ({
    type: 'era' as const,
    id: era.id,
    title: {
      pa: era.nameGurmukhi,
      en: era.nameEnglish,
    },
    yearStart: era.yearStart,
    yearEnd: era.yearEnd,
    isContemporary: era.isOngoing,
    children: era.periods.map((period) => ({
      type: 'period' as const,
      id: period.id,
      title: {
        pa: period.nameGurmukhi,
        en: period.nameEnglish,
      },
      yearStart: period.yearStart,
      yearEnd: period.yearEnd,
      isContemporary: false,
      children: period.events.map((event) => ({
        type: 'event' as const,
        id: event.id,
        title: {
          pa: event.titleGurmukhi,
          en: event.titleEnglish,
        },
        yearStart: event.yearStart,
        yearEnd: event.yearEnd,
        isContemporary: event.isContemporary,
      })),
    })),
  }));
}
