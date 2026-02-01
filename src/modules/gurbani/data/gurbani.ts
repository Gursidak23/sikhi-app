// ============================================================================
// GURBANI DATA ACCESS LAYER
// ============================================================================
// Provides data access functions for Gurbani content
// Ensures all data includes proper source attribution
// ============================================================================

import prisma from '@/lib/db/prisma';
import type { Shabad, Pankti, Raag, BaniAuthor, TeekaInterpretation } from '@/types';

/**
 * Get all Raags with their Ang ranges
 */
export async function getAllRaags() {
  return prisma.raag.findMany({
    orderBy: { orderInGranth: 'asc' },
  });
}

/**
 * Get a specific Raag by ID
 */
export async function getRaagById(id: string) {
  return prisma.raag.findUnique({
    where: { id },
    include: {
      shabads: {
        take: 10,
        orderBy: { angNumber: 'asc' },
      },
    },
  });
}

/**
 * Get Shabads by Ang number
 */
export async function getShabadsByAng(angNumber: number) {
  return prisma.shabad.findMany({
    where: { angNumber },
    include: {
      raag: true,
      author: true,
      panktis: {
        orderBy: { lineNumber: 'asc' },
        include: {
          interpretations: {
            where: { status: 'PUBLISHED' },
            include: {
              source: true,
            },
          },
        },
      },
    },
    orderBy: { shabadNumber: 'asc' },
  });
}

/**
 * Get a specific Shabad by ID
 */
export async function getShabadById(id: string) {
  return prisma.shabad.findUnique({
    where: { id },
    include: {
      raag: true,
      author: true,
      panktis: {
        orderBy: { lineNumber: 'asc' },
        include: {
          interpretations: {
            where: { status: 'PUBLISHED' },
            include: {
              source: true,
            },
            orderBy: { source: { yearPublished: 'asc' } },
          },
        },
      },
    },
  });
}

/**
 * Get Panktis for a specific Ang with all interpretations
 */
export async function getPanktisByAng(angNumber: number) {
  const shabads = await getShabadsByAng(angNumber);
  
  // Flatten all panktis from all shabads on this ang
  const panktis: Pankti[] = [];
  for (const shabad of shabads) {
    for (const pankti of shabad.panktis) {
      panktis.push(pankti as unknown as Pankti);
    }
  }
  
  return panktis;
}

/**
 * Get all Bani authors (Guru Sahibaan and Bhagats)
 */
export async function getAllBaniAuthors() {
  return prisma.baniAuthor.findMany({
    orderBy: [
      { isGuru: 'desc' },
      { guruNumber: 'asc' },
      { nameEnglish: 'asc' },
    ],
  });
}

/**
 * Get Guru Sahibaan only
 */
export async function getGuruSahibaan() {
  return prisma.baniAuthor.findMany({
    where: { isGuru: true },
    orderBy: { guruNumber: 'asc' },
  });
}

/**
 * Get Bhagats only
 */
export async function getBhagats() {
  return prisma.baniAuthor.findMany({
    where: { isBhagat: true },
    orderBy: { nameEnglish: 'asc' },
  });
}

/**
 * Search Gurbani by Gurmukhi text
 * Note: This is a basic search - production would use full-text search
 */
export async function searchGurbani(query: string, limit = 50) {
  return prisma.pankti.findMany({
    where: {
      OR: [
        { gurmukhiUnicode: { contains: query } },
        { transliteration: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      shabad: {
        include: {
          raag: true,
          author: true,
        },
      },
      interpretations: {
        where: { status: 'PUBLISHED' },
        include: { source: true },
        take: 3,
      },
    },
    take: limit,
  });
}

/**
 * Get interpretations for a Pankti
 * Returns ALL interpretations with their sources (never merged)
 */
export async function getInterpretationsForPankti(panktiId: string) {
  return prisma.teekaInterpretation.findMany({
    where: {
      panktiId,
      status: 'PUBLISHED',
    },
    include: {
      source: true,
    },
    orderBy: [
      { source: { yearPublished: 'asc' } },
    ],
  });
}

/**
 * Get Shabads by Raag
 */
export async function getShabadsByRaag(raagId: string, skip = 0, take = 20) {
  return prisma.shabad.findMany({
    where: { raagId },
    include: {
      author: true,
      panktis: {
        take: 1, // Just first line for preview
        orderBy: { lineNumber: 'asc' },
      },
    },
    orderBy: { angNumber: 'asc' },
    skip,
    take,
  });
}

/**
 * Get Shabads by Author
 */
export async function getShabadsByAuthor(authorId: string, skip = 0, take = 20) {
  return prisma.shabad.findMany({
    where: { authorId },
    include: {
      raag: true,
      panktis: {
        take: 1,
        orderBy: { lineNumber: 'asc' },
      },
    },
    orderBy: { angNumber: 'asc' },
    skip,
    take,
  });
}

/**
 * Get total count of Shabads
 */
export async function getTotalShabadCount() {
  return prisma.shabad.count();
}

/**
 * Get Ang range for a Raag
 */
export async function getAngRangeForRaag(raagId: string) {
  const raag = await prisma.raag.findUnique({
    where: { id: raagId },
    select: { angStart: true, angEnd: true },
  });
  return raag;
}
