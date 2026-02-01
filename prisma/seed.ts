// ============================================================================
// DATABASE SEED FILE
// ============================================================================
// Seeds the database with:
// 1. Authoritative sources (non-negotiable references)
// 2. Required disclaimers
// 3. Raags structure
// 4. Historical eras framework
// ============================================================================

import { PrismaClient, SourceType, HistoricalEra, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to batch async operations to avoid "too many connections" error
async function batchedPromiseAll<T>(
  operations: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(op => op()));
    results.push(...batchResults);
  }
  return results;
}

async function main() {
  console.log('🙏 ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਿਹ');
  console.log('Beginning database seed...\n');

  // ============================================================================
  // AUTHORITATIVE SOURCES (Sequential to avoid connection limits)
  // ============================================================================
  console.log('📚 Seeding authoritative sources...');

  // PRIMARY SPIRITUAL SOURCE
  await prisma.source.upsert({
    where: { id: 'sri-guru-granth-sahib-ji' },
    update: {},
    create: {
      id: 'sri-guru-granth-sahib-ji',
      titleGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ',
      titleEnglish: 'Sri Guru Granth Sahib Ji',
      titleHindi: 'श्री गुरु ग्रंथ साहिब जी',
      sourceType: SourceType.PRIMARY,
      yearComposed: 1604,
      reliabilityNotes: 'The eternal Guru of the Sikhs. Primary and final authority on all spiritual matters.',
    },
  });

  // CLASSICAL SIKH HISTORICAL GRANTHS
  await prisma.source.upsert({
    where: { id: 'gur-panth-prakash' },
    update: {},
    create: {
      id: 'gur-panth-prakash',
      titleGurmukhi: 'ਸ੍ਰੀ ਗੁਰ ਪੰਥ ਪ੍ਰਕਾਸ਼',
      titleEnglish: 'Sri Gur Panth Prakash',
      authorGurmukhi: 'ਭਾਈ ਰਤਨ ਸਿੰਘ ਭੰਗੂ',
      authorEnglish: 'Bhai Rattan Singh Bhangu',
      sourceType: SourceType.PRIMARY,
      yearComposed: 1841,
      reliabilityNotes: 'Written by a descendant of those who witnessed 18th century Sikh history. Primary source for Khalsa period.',
    },
  });

  await prisma.source.upsert({
    where: { id: 'suraj-prakash' },
    update: {},
    create: {
      id: 'suraj-prakash',
      titleGurmukhi: 'ਸੂਰਜ ਪ੍ਰਕਾਸ਼',
      titleEnglish: 'Suraj Prakash (Gur Pratap Suraj Granth)',
      authorGurmukhi: 'ਭਾਈ ਸੰਤੋਖ ਸਿੰਘ',
      authorEnglish: 'Bhai Santokh Singh',
      sourceType: SourceType.PRIMARY,
      yearComposed: 1843,
      reliabilityNotes: 'Comprehensive historical account in verse. Major source for Guru period history.',
      caveats: 'Rich but poetic — not literal history. Must be cross-referenced, not blindly quoted.',
    },
  });

  await prisma.source.upsert({
    where: { id: 'bansavalinama' },
    update: {},
    create: {
      id: 'bansavalinama',
      titleGurmukhi: 'ਬੰਸਾਵਲੀਨਾਮਾ',
      titleEnglish: 'Bansavalinama',
      authorGurmukhi: 'ਕੇਸਰ ਸਿੰਘ ਛਿੱਬੜ',
      authorEnglish: 'Kesar Singh Chhibber',
      sourceType: SourceType.PRIMARY,
      yearComposed: 1769,
      reliabilityNotes: 'Genealogies of Guru Sahiban and early Sikh tradition. Valuable for early Panth structure.',
    },
  });

  // EARLY NON-SIKH SOURCES (CORROBORATIVE)
  await prisma.source.upsert({
    where: { id: 'dabistan-i-mazahib' },
    update: {},
    create: {
      id: 'dabistan-i-mazahib',
      titleGurmukhi: 'ਦਬਿਸਤਾਨ-ਏ-ਮਜ਼ਾਹਿਬ',
      titleEnglish: 'Dabistan-i-Mazahib (School of Religions)',
      sourceType: SourceType.SECONDARY,
      yearComposed: 1655,
      reliabilityNotes: 'External observation of early Sikhs. Helpful for understanding how Sikhs were perceived.',
      caveats: 'Not spiritually authoritative. External perspective only - useful for corroboration.',
    },
  });

  await prisma.source.upsert({
    where: { id: 'persian-court-chronicles' },
    update: {},
    create: {
      id: 'persian-court-chronicles',
      titleGurmukhi: 'ਫ਼ਾਰਸੀ ਦਰਬਾਰੀ ਇਤਿਹਾਸ',
      titleEnglish: 'Persian Court Chronicles',
      sourceType: SourceType.SECONDARY,
      reliabilityNotes: 'Administrative and political records from Mughal and Afghan courts.',
      caveats: 'Used only for cross-checking dates and political events. Never used to interpret Sikh motives or theology.',
    },
  });

  // COLONIAL & MODERN ACADEMIC (Use with caution)
  await prisma.source.upsert({
    where: { id: 'macauliffe-sikh-religion' },
    update: {},
    create: {
      id: 'macauliffe-sikh-religion',
      titleGurmukhi: 'ਦ ਸਿੱਖ ਰਿਲੀਜਨ',
      titleEnglish: 'The Sikh Religion',
      authorEnglish: 'Max Arthur Macauliffe',
      sourceType: SourceType.SECONDARY,
      yearPublished: 1909,
      reliabilityNotes: 'One of the more respectful colonial works. Preserved many translations.',
      caveats: 'Still filtered through Christian/colonial worldview. Cross-reference with primary sources required.',
    },
  });

  await prisma.source.upsert({
    where: { id: 'khushwant-singh-history' },
    update: {},
    create: {
      id: 'khushwant-singh-history',
      titleGurmukhi: 'ਏ ਹਿਸਟਰੀ ਆਫ਼ ਦ ਸਿੱਖਸ',
      titleEnglish: 'A History of the Sikhs',
      authorEnglish: 'Khushwant Singh',
      sourceType: SourceType.SECONDARY,
      yearPublished: 1963,
      reliabilityNotes: 'Strong on chronology and political history.',
      caveats: 'Weak on spiritual depth. Must never be treated as final authority.',
    },
  });

  // TEEKA SOURCES
  await prisma.source.upsert({
    where: { id: 'faridkot-teeka' },
    update: {},
    create: {
      id: 'faridkot-teeka',
      titleGurmukhi: 'ਫ਼ਰੀਦਕੋਟ ਵਾਲਾ ਟੀਕਾ',
      titleEnglish: 'Faridkot Teeka',
      sourceType: SourceType.TEEKA,
      yearPublished: 1905,
      reliabilityNotes: 'Classical Teeka commissioned by Maharaja of Faridkot. Authoritative traditional interpretation.',
      caveats: 'Traditional, Sanatan-influenced. Must be labeled clearly as interpretation.',
    },
  });

  await prisma.source.upsert({
    where: { id: 'prof-sahib-singh-teeka' },
    update: {},
    create: {
      id: 'prof-sahib-singh-teeka',
      titleGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ',
      titleEnglish: 'Sri Guru Granth Sahib Darpan',
      authorGurmukhi: 'ਪ੍ਰੋ. ਸਾਹਿਬ ਸਿੰਘ',
      authorEnglish: 'Prof. Sahib Singh',
      sourceType: SourceType.TEEKA,
      yearPublished: 1962,
      reliabilityNotes: 'Most respected grammatical Gurbani framework. Reduces mythological interpolation. Essential for disciplined interpretation.',
    },
  });

  await prisma.source.upsert({
    where: { id: 'dr-manmohan-singh-translation' },
    update: {},
    create: {
      id: 'dr-manmohan-singh-translation',
      titleGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ (ਅੰਗਰੇਜ਼ੀ ਅਨੁਵਾਦ)',
      titleEnglish: 'Sri Guru Granth Sahib (English Interpretation)',
      authorEnglish: 'Dr. Manmohan Singh',
      sourceType: SourceType.TEEKA,
      yearPublished: 1962,
      reliabilityNotes: 'Widely used English meanings. Standard reference published by SGPC.',
      caveats: 'Interpretive, not literal. Must always be labeled as English interpretation.',
    },
  });

  await prisma.source.upsert({
    where: { id: 'bhai-vir-singh-works' },
    update: {},
    create: {
      id: 'bhai-vir-singh-works',
      titleGurmukhi: 'ਭਾਈ ਵੀਰ ਸਿੰਘ ਦੀਆਂ ਰਚਨਾਵਾਂ',
      titleEnglish: 'Works of Bhai Vir Singh',
      authorGurmukhi: 'ਭਾਈ ਵੀਰ ਸਿੰਘ',
      authorEnglish: 'Bhai Vir Singh',
      sourceType: SourceType.TEEKA,
      reliabilityNotes: 'Respected scholar and poet. Select works referenced for literary and spiritual interpretation.',
    },
  });

  await prisma.source.upsert({
    where: { id: 'sant-singh-maskeen-katha' },
    update: {},
    create: {
      id: 'sant-singh-maskeen-katha',
      titleGurmukhi: 'ਸੰਤ ਸਿੰਘ ਮਸਕੀਨ ਕਥਾ',
      titleEnglish: 'Sant Singh Maskeen Katha',
      authorGurmukhi: 'ਸੰਤ ਸਿੰਘ ਮਸਕੀਨ',
      authorEnglish: 'Sant Singh Maskeen',
      sourceType: SourceType.TEEKA,
      reliabilityNotes: 'Philosophical and ethical depth. Katha-based explanations for contextual understanding.',
      caveats: 'Not literal translation - vichaar (philosophical discourse) source only.',
    },
  });

  // INSTITUTIONAL SOURCES
  await prisma.source.upsert({
    where: { id: 'sikh-rehat-maryada' },
    update: {},
    create: {
      id: 'sikh-rehat-maryada',
      titleGurmukhi: 'ਸਿੱਖ ਰਹਿਤ ਮਰਯਾਦਾ',
      titleEnglish: 'Sikh Rehat Maryada',
      sourceType: SourceType.PRIMARY,
      yearPublished: 1950,
      publisher: 'SGPC',
      reliabilityNotes: 'Official Sikh code of conduct published by Shiromani Gurdwara Parbandhak Committee.',
    },
  });

  await prisma.source.upsert({
    where: { id: 'sgpc-publications' },
    update: {},
    create: {
      id: 'sgpc-publications',
      titleGurmukhi: 'ਸ਼੍ਰੋਮਣੀ ਗੁਰਦੁਆਰਾ ਪ੍ਰਬੰਧਕ ਕਮੇਟੀ ਪ੍ਰਕਾਸ਼ਨ',
      titleEnglish: 'SGPC Publications',
      sourceType: SourceType.PRIMARY,
      publisher: 'Shiromani Gurdwara Parbandhak Committee',
      reliabilityNotes: 'Official Sikh institutional publications and positions.',
      caveats: 'Not infallible, but authoritative within the Panth.',
    },
  });

  await prisma.source.upsert({
    where: { id: 'punjabi-university-patiala' },
    update: {},
    create: {
      id: 'punjabi-university-patiala',
      titleGurmukhi: 'ਪੰਜਾਬੀ ਯੂਨੀਵਰਸਿਟੀ ਪਟਿਆਲਾ',
      titleEnglish: 'Punjabi University Patiala',
      sourceType: SourceType.SECONDARY,
      reliabilityNotes: 'Sikh studies research, manuscript preservation, and academic publications including Encyclopedia of Sikhism.',
    },
  });

  await prisma.source.upsert({
    where: { id: 'sikh-reference-library' },
    update: {},
    create: {
      id: 'sikh-reference-library',
      titleGurmukhi: 'ਸਿੱਖ ਰੈਫ਼ਰੈਂਸ ਲਾਇਬ੍ਰੇਰੀ',
      titleEnglish: 'Sikh Reference Library',
      sourceType: SourceType.PRIMARY,
      reliabilityNotes: 'Historical manuscripts, Hukamnamas, and archival documents.',
      caveats: 'Many documents lost in 1984. Pre-1984 catalogues are critical references.',
    },
  });

  const sourceCount = await prisma.source.count();
  console.log(`✅ Seeded ${sourceCount} authoritative sources\n`);

  // ============================================================================
  // MANDATORY DISCLAIMERS
  // ============================================================================
  console.log('📜 Seeding required disclaimers...');

  await prisma.disclaimer.upsert({
    where: { key: 'gurbani_learning' },
    update: {},
    create: {
      key: 'gurbani_learning',
      textGurmukhi: 'ਇਹ ਪਲੇਟਫਾਰਮ ਸਿੱਖਿਆ ਅਤੇ ਵਿਚਾਰ ਲਈ ਹੈ। ਇਹ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਦੇ ਪ੍ਰਕਾਸ਼ ਜਾਂ ਧਾਰਮਿਕ ਅਭਿਆਸ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ। ਅਰਥ ਵੱਖ-ਵੱਖ ਟੀਕਿਆਂ ਤੋਂ ਲਏ ਗਏ ਹਨ ਅਤੇ ਹਮੇਸ਼ਾ ਸਰੋਤ ਦੱਸਿਆ ਗਿਆ ਹੈ।',
      textEnglish: 'This platform is for learning and reflection. It is not a replacement for the Prakash of Guru Granth Sahib Ji or religious practice. Meanings are derived from named Teekas, and attribution is always provided. The original Gurmukhi is authoritative; English text represents interpretation, not literal translation.',
      textHindi: 'यह प्लेटफॉर्म सीखने और विचार के लिए है। यह गुरु ग्रंथ साहिब जी के प्रकाश या धार्मिक अभ्यास का विकल्प नहीं है।',
      displayLocation: 'gurbani_header',
      requiresAck: true,
      isActive: true,
    },
  });

  await prisma.disclaimer.upsert({
    where: { key: 'interpretation_variation' },
    update: {},
    create: {
      key: 'interpretation_variation',
      textGurmukhi: 'ਗੁਰਬਾਣੀ ਦੇ ਅਰਥ ਵੱਖ-ਵੱਖ ਵਿਦਵਾਨਾਂ ਅਨੁਸਾਰ ਵੱਖਰੇ ਹੋ ਸਕਦੇ ਹਨ। ਜਿੱਥੇ ਕਈ ਵਿਆਖਿਆਵਾਂ ਮੌਜੂਦ ਹਨ, ਉਹ ਸਾਰੀਆਂ ਆਪਣੇ ਸਰੋਤ ਨਾਲ ਦਿਖਾਈਆਂ ਗਈਆਂ ਹਨ।',
      textEnglish: 'Meanings of Gurbani may vary according to different scholars. Where multiple interpretations exist, they are shown side-by-side with their source attribution.',
      displayLocation: 'gurbani_meaning',
      requiresAck: false,
      isActive: true,
    },
  });

  await prisma.disclaimer.upsert({
    where: { key: 'contemporary_history' },
    update: {},
    create: {
      key: 'contemporary_history',
      textGurmukhi: 'ਸਮਕਾਲੀ ਸਿੱਖ ਇਤਿਹਾਸ ਵਿਕਸਿਤ ਹੋ ਰਿਹਾ ਹੈ ਅਤੇ ਅੰਤਿਮ ਨਹੀਂ ਹੈ। ਹਾਲ ਦੀਆਂ ਘਟਨਾਵਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਨੂੰ ਵਿਕਾਸਸ਼ੀਲ ਇਤਿਹਾਸ ਵਜੋਂ ਸਮਝਿਆ ਜਾਣਾ ਚਾਹੀਦਾ ਹੈ।',
      textEnglish: 'Contemporary Sikh history is evolving and not final. Information about recent events should be understood as developing history that may be subject to revision as more information becomes available.',
      displayLocation: 'history_contemporary',
      requiresAck: true,
      isActive: true,
    },
  });

  await prisma.disclaimer.upsert({
    where: { key: 'source_attribution' },
    update: {},
    create: {
      key: 'source_attribution',
      textGurmukhi: 'ਹਰ ਇਤਿਹਾਸਕ ਦਾਅਵੇ ਦਾ ਸਰੋਤ ਦਿੱਤਾ ਗਿਆ ਹੈ। ਜਿੱਥੇ ਸਰੋਤ ਇਕ ਦੂਜੇ ਨਾਲ ਮੇਲ ਨਹੀਂ ਖਾਂਦੇ, ਵੱਖ-ਵੱਖ ਵਿਆਖਿਆਵਾਂ ਵੱਖਰੇ ਤੌਰ ਤੇ ਪੇਸ਼ ਕੀਤੀਆਂ ਗਈਆਂ ਹਨ।',
      textEnglish: 'Every historical claim is attributed to its source. Where sources conflict, different interpretations are presented separately, not merged. We are curators, not authorities.',
      displayLocation: 'history_general',
      requiresAck: false,
      isActive: true,
    },
  });

  const disclaimerCount = await prisma.disclaimer.count();
  console.log(`✅ Seeded ${disclaimerCount} disclaimers\n`);

  // ============================================================================
  // HISTORICAL ERAS
  // ============================================================================
  console.log('📅 Seeding historical eras...');

  const eras = await Promise.all([
    prisma.era.upsert({
      where: { id: 'guru-period' },
      update: {},
      create: {
        id: 'guru-period',
        nameGurmukhi: 'ਗੁਰੂ ਸਾਹਿਬਾਨ ਦਾ ਕਾਲ',
        nameEnglish: 'The Period of the Guru Sahibaan',
        nameHindi: 'गुरु साहिबान का काल',
        eraType: HistoricalEra.GURU_PERIOD,
        yearStart: 1469,
        yearEnd: 1708,
        descriptionPunjabi: 'ਸ੍ਰੀ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਦੇ ਪ੍ਰਗਟ ਹੋਣ ਤੋਂ ਲੈ ਕੇ ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਦੇ ਜੋਤੀ ਜੋਤ ਸਮਾਉਣ ਤੱਕ ਦਾ ਸਮਾਂ।',
        descriptionEnglish: 'From the Prakash of Sri Guru Nanak Dev Ji to the Joti Jot of Sri Guru Gobind Singh Ji.',
        isOngoing: false,
      },
    }),

    prisma.era.upsert({
      where: { id: 'khalsa-establishment' },
      update: {},
      create: {
        id: 'khalsa-establishment',
        nameGurmukhi: 'ਖਾਲਸਾ ਦੀ ਸਿਰਜਣਾ ਅਤੇ ਬੰਦਾ ਸਿੰਘ ਬਹਾਦਰ',
        nameEnglish: 'Khalsa Establishment and Banda Singh Bahadur',
        eraType: HistoricalEra.KHALSA_ESTABLISHMENT,
        yearStart: 1699,
        yearEnd: 1716,
        descriptionPunjabi: 'ਖਾਲਸੇ ਦੀ ਸਿਰਜਣਾ ਅਤੇ ਬੰਦਾ ਸਿੰਘ ਬਹਾਦਰ ਦੀ ਸ਼ਹਾਦਤ ਤੱਕ ਦਾ ਸਮਾਂ।',
        descriptionEnglish: 'From the creation of the Khalsa to the martyrdom of Banda Singh Bahadur.',
        isOngoing: false,
      },
    }),

    prisma.era.upsert({
      where: { id: 'misl-period' },
      update: {},
      create: {
        id: 'misl-period',
        nameGurmukhi: 'ਮਿਸਲਾਂ ਦਾ ਦੌਰ',
        nameEnglish: 'The Misl Period',
        eraType: HistoricalEra.MISL_PERIOD,
        yearStart: 1716,
        yearEnd: 1799,
        descriptionPunjabi: 'ਬਾਰਾਂ ਮਿਸਲਾਂ ਦੇ ਉਭਾਰ ਅਤੇ ਸੰਘਰਸ਼ ਦਾ ਸਮਾਂ।',
        descriptionEnglish: 'The era of the twelve Misls and their rise.',
        isOngoing: false,
      },
    }),

    prisma.era.upsert({
      where: { id: 'sikh-empire' },
      update: {},
      create: {
        id: 'sikh-empire',
        nameGurmukhi: 'ਸਿੱਖ ਰਾਜ',
        nameEnglish: 'The Sikh Empire',
        eraType: HistoricalEra.SIKH_EMPIRE,
        yearStart: 1799,
        yearEnd: 1849,
        descriptionPunjabi: 'ਮਹਾਰਾਜਾ ਰਣਜੀਤ ਸਿੰਘ ਦੀ ਅਗਵਾਈ ਹੇਠ ਸਿੱਖ ਰਾਜ ਦੀ ਸਥਾਪਨਾ ਅਤੇ ਪਤਨ।',
        descriptionEnglish: 'The establishment and fall of the Sikh Kingdom under Maharaja Ranjit Singh.',
        isOngoing: false,
      },
    }),

    prisma.era.upsert({
      where: { id: 'colonial-period' },
      update: {},
      create: {
        id: 'colonial-period',
        nameGurmukhi: 'ਬਸਤੀਵਾਦੀ ਕਾਲ',
        nameEnglish: 'The Colonial Period',
        eraType: HistoricalEra.COLONIAL_PERIOD,
        yearStart: 1849,
        yearEnd: 1947,
        descriptionPunjabi: 'ਬ੍ਰਿਟਿਸ਼ ਰਾਜ ਅਧੀਨ ਪੰਜਾਬ ਅਤੇ ਸਿੱਖ ਸੁਧਾਰ ਲਹਿਰਾਂ।',
        descriptionEnglish: 'Punjab under British rule and Sikh reform movements.',
        isOngoing: false,
      },
    }),

    prisma.era.upsert({
      where: { id: 'post-independence' },
      update: {},
      create: {
        id: 'post-independence',
        nameGurmukhi: 'ਆਜ਼ਾਦੀ ਤੋਂ ਬਾਅਦ',
        nameEnglish: 'Post-Independence Period',
        eraType: HistoricalEra.POST_INDEPENDENCE,
        yearStart: 1947,
        yearEnd: 1984,
        descriptionPunjabi: 'ਵੰਡ, ਪੰਜਾਬੀ ਸੂਬਾ ਲਹਿਰ, ਅਤੇ 1984 ਤੱਕ ਦਾ ਸਮਾਂ।',
        descriptionEnglish: 'Partition, Punjabi Suba movement, and events leading to 1984.',
        isOngoing: false,
      },
    }),

    prisma.era.upsert({
      where: { id: 'modern-period' },
      update: {},
      create: {
        id: 'modern-period',
        nameGurmukhi: 'ਆਧੁਨਿਕ ਕਾਲ',
        nameEnglish: 'The Modern Period',
        eraType: HistoricalEra.MODERN_PERIOD,
        yearStart: 1984,
        yearEnd: null,
        descriptionPunjabi: '1984 ਤੋਂ ਲੈ ਕੇ ਅੱਜ ਤੱਕ ਦਾ ਸਮਾਂ।',
        descriptionEnglish: 'From 1984 to the present day.',
        isOngoing: true,
      },
    }),

    prisma.era.upsert({
      where: { id: 'contemporary' },
      update: {},
      create: {
        id: 'contemporary',
        nameGurmukhi: 'ਸਮਕਾਲੀ ਘਟਨਾਵਾਂ',
        nameEnglish: 'Contemporary Events',
        eraType: HistoricalEra.CONTEMPORARY,
        yearStart: 2020,
        yearEnd: null,
        descriptionPunjabi: 'ਚੱਲ ਰਹੇ ਸਮਕਾਲੀ ਇਤਿਹਾਸ। ਇਹ ਜਾਣਕਾਰੀ ਵਿਕਾਸਸ਼ੀਲ ਹੈ ਅਤੇ ਅੰਤਿਮ ਨਹੀਂ ਹੈ।',
        descriptionEnglish: 'Ongoing contemporary history. This information is evolving and not final.',
        isOngoing: true,
      },
    }),
  ]);

  console.log(`✅ Seeded ${eras.length} historical eras\n`);

  // ============================================================================
  // RAAGS OF GURU GRANTH SAHIB JI
  // ============================================================================
  console.log('🎵 Seeding Raags of Sri Guru Granth Sahib Ji...');

  const raags = await batchedPromiseAll([
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਸ੍ਰੀ ਰਾਗੁ' },
      update: {},
      create: {
        nameGurmukhi: 'ਸ੍ਰੀ ਰਾਗੁ',
        nameEnglish: 'Sri Raag',
        orderInGranth: 1,
        angStart: 14,
        angEnd: 93,
        mood: 'Devotion, longing for the Divine',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਮਾਝ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਮਾਝ',
        nameEnglish: 'Raag Maajh',
        orderInGranth: 2,
        angStart: 94,
        angEnd: 150,
        mood: 'Joy in union with the Divine',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਗਉੜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਗਉੜੀ',
        nameEnglish: 'Raag Gauri',
        orderInGranth: 3,
        angStart: 151,
        angEnd: 346,
        mood: 'Seriousness, contemplation',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਆਸਾ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਆਸਾ',
        nameEnglish: 'Raag Aasaa',
        orderInGranth: 4,
        angStart: 347,
        angEnd: 488,
        mood: 'Hope, aspiration',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਗੂਜਰੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਗੂਜਰੀ',
        nameEnglish: 'Raag Gujri',
        orderInGranth: 5,
        angStart: 489,
        angEnd: 526,
        mood: 'Peace, serenity',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਦੇਵਗੰਧਾਰੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਦੇਵਗੰਧਾਰੀ',
        nameEnglish: 'Raag Devgandhari',
        orderInGranth: 6,
        angStart: 527,
        angEnd: 536,
        mood: 'Divine music',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਬਿਹਾਗੜਾ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਬਿਹਾਗੜਾ',
        nameEnglish: 'Raag Bihagra',
        orderInGranth: 7,
        angStart: 537,
        angEnd: 556,
        mood: 'Night, longing',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਵਡਹੰਸੁ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਵਡਹੰਸੁ',
        nameEnglish: 'Raag Vadhans',
        orderInGranth: 8,
        angStart: 557,
        angEnd: 594,
        mood: 'Transition, change',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਸੋਰਠਿ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਸੋਰਠਿ',
        nameEnglish: 'Raag Sorath',
        orderInGranth: 9,
        angStart: 595,
        angEnd: 659,
        mood: 'Courage, resolve',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਧਨਾਸਰੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਧਨਾਸਰੀ',
        nameEnglish: 'Raag Dhanasri',
        orderInGranth: 10,
        angStart: 660,
        angEnd: 695,
        mood: 'Gratitude, contentment',
      },
    }),
    // Continue with remaining Raags...
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਜੈਤਸਰੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਜੈਤਸਰੀ',
        nameEnglish: 'Raag Jaitsri',
        orderInGranth: 11,
        angStart: 696,
        angEnd: 710,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਟੋਡੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਟੋਡੀ',
        nameEnglish: 'Raag Todi',
        orderInGranth: 12,
        angStart: 711,
        angEnd: 718,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਬੈਰਾੜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਬੈਰਾੜੀ',
        nameEnglish: 'Raag Bairari',
        orderInGranth: 13,
        angStart: 719,
        angEnd: 720,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਤਿਲੰਗ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਤਿਲੰਗ',
        nameEnglish: 'Raag Tilang',
        orderInGranth: 14,
        angStart: 721,
        angEnd: 727,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਸੂਹੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਸੂਹੀ',
        nameEnglish: 'Raag Suhi',
        orderInGranth: 15,
        angStart: 728,
        angEnd: 794,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਬਿਲਾਵਲੁ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਬਿਲਾਵਲੁ',
        nameEnglish: 'Raag Bilawal',
        orderInGranth: 16,
        angStart: 795,
        angEnd: 858,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਗੋਂਡ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਗੋਂਡ',
        nameEnglish: 'Raag Gond',
        orderInGranth: 17,
        angStart: 859,
        angEnd: 875,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਰਾਮਕਲੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਰਾਮਕਲੀ',
        nameEnglish: 'Raag Ramkali',
        orderInGranth: 18,
        angStart: 876,
        angEnd: 974,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਨਟ ਨਾਰਾਇਨ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਨਟ ਨਾਰਾਇਨ',
        nameEnglish: 'Raag Nat Narayan',
        orderInGranth: 19,
        angStart: 975,
        angEnd: 983,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਮਾਲੀ ਗਉੜਾ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਮਾਲੀ ਗਉੜਾ',
        nameEnglish: 'Raag Mali Gaura',
        orderInGranth: 20,
        angStart: 984,
        angEnd: 988,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਮਾਰੂ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਮਾਰੂ',
        nameEnglish: 'Raag Maru',
        orderInGranth: 21,
        angStart: 989,
        angEnd: 1106,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਤੁਖਾਰੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਤੁਖਾਰੀ',
        nameEnglish: 'Raag Tukhari',
        orderInGranth: 22,
        angStart: 1107,
        angEnd: 1117,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਕੇਦਾਰਾ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਕੇਦਾਰਾ',
        nameEnglish: 'Raag Kedara',
        orderInGranth: 23,
        angStart: 1118,
        angEnd: 1124,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਭੈਰਉ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਭੈਰਉ',
        nameEnglish: 'Raag Bhairav',
        orderInGranth: 24,
        angStart: 1125,
        angEnd: 1167,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਬਸੰਤੁ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਬਸੰਤੁ',
        nameEnglish: 'Raag Basant',
        orderInGranth: 25,
        angStart: 1168,
        angEnd: 1196,
        season: 'Spring',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਸਾਰੰਗ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਸਾਰੰਗ',
        nameEnglish: 'Raag Sarang',
        orderInGranth: 26,
        angStart: 1197,
        angEnd: 1253,
        season: 'Monsoon',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਮਲਾਰ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਮਲਾਰ',
        nameEnglish: 'Raag Malaar',
        orderInGranth: 27,
        angStart: 1254,
        angEnd: 1293,
        season: 'Monsoon',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਕਾਨੜਾ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਕਾਨੜਾ',
        nameEnglish: 'Raag Kanra',
        orderInGranth: 28,
        angStart: 1294,
        angEnd: 1318,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਕਲਿਆਨ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਕਲਿਆਨ',
        nameEnglish: 'Raag Kalyan',
        orderInGranth: 29,
        angStart: 1319,
        angEnd: 1326,
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਪ੍ਰਭਾਤੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਪ੍ਰਭਾਤੀ',
        nameEnglish: 'Raag Prabhati',
        orderInGranth: 30,
        angStart: 1327,
        angEnd: 1351,
        timeOfDay: 'Early morning, before dawn',
      },
    }),
    () => prisma.raag.upsert({
      where: { nameGurmukhi: 'ਰਾਗੁ ਜੈਜਾਵੰਤੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਰਾਗੁ ਜੈਜਾਵੰਤੀ',
        nameEnglish: 'Raag Jaijavanti',
        orderInGranth: 31,
        angStart: 1352,
        angEnd: 1353,
      },
    }),
  ]);

  console.log(`✅ Seeded ${raags.length} Raags\n`);

  // ============================================================================
  // BANI AUTHORS - GURU SAHIBAAN
  // ============================================================================
  console.log('🙏 Seeding Guru Sahibaan...');

  const gurus = await batchedPromiseAll([
    () => prisma.baniAuthor.upsert({
      where: { nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ',
        nameEnglish: 'Sri Guru Nanak Dev Ji',
        nameHindi: 'श्री गुरु नानक देव जी',
        isGuru: true,
        guruNumber: 1,
        birthYear: 1469,
        deathYear: 1539,
        region: 'Talwandi (now Nankana Sahib)',
      },
    }),
    () => prisma.baniAuthor.upsert({
      where: { nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ',
        nameEnglish: 'Sri Guru Angad Dev Ji',
        nameHindi: 'श्री गुरु अंगद देव जी',
        isGuru: true,
        guruNumber: 2,
        birthYear: 1504,
        deathYear: 1552,
        region: 'Harike',
      },
    }),
    () => prisma.baniAuthor.upsert({
      where: { nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਅਮਰਦਾਸ ਜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਅਮਰਦਾਸ ਜੀ',
        nameEnglish: 'Sri Guru Amar Das Ji',
        nameHindi: 'श्री गुरु अमरदास जी',
        isGuru: true,
        guruNumber: 3,
        birthYear: 1479,
        deathYear: 1574,
        region: 'Basarke',
      },
    }),
    () => prisma.baniAuthor.upsert({
      where: { nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਰਾਮਦਾਸ ਜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਰਾਮਦਾਸ ਜੀ',
        nameEnglish: 'Sri Guru Ram Das Ji',
        nameHindi: 'श्री गुरु रामदास जी',
        isGuru: true,
        guruNumber: 4,
        birthYear: 1534,
        deathYear: 1581,
        region: 'Lahore',
      },
    }),
    () => prisma.baniAuthor.upsert({
      where: { nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ',
        nameEnglish: 'Sri Guru Arjan Dev Ji',
        nameHindi: 'श्री गुरु अर्जन देव जी',
        isGuru: true,
        guruNumber: 5,
        birthYear: 1563,
        deathYear: 1606,
        region: 'Goindval',
      },
    }),
    () => prisma.baniAuthor.upsert({
      where: { nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਗੋਬਿੰਦ ਜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਗੋਬਿੰਦ ਜੀ',
        nameEnglish: 'Sri Guru Hargobind Ji',
        nameHindi: 'श्री गुरु हरगोबिंद जी',
        isGuru: true,
        guruNumber: 6,
        birthYear: 1595,
        deathYear: 1644,
        region: 'Amritsar',
      },
    }),
    () => prisma.baniAuthor.upsert({
      where: { nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਰਾਇ ਜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਰਾਇ ਜੀ',
        nameEnglish: 'Sri Guru Har Rai Ji',
        nameHindi: 'श्री गुरु हर राय जी',
        isGuru: true,
        guruNumber: 7,
        birthYear: 1630,
        deathYear: 1661,
        region: 'Kiratpur Sahib',
      },
    }),
    () => prisma.baniAuthor.upsert({
      where: { nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਕ੍ਰਿਸ਼ਨ ਜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਹਰਿ ਕ੍ਰਿਸ਼ਨ ਜੀ',
        nameEnglish: 'Sri Guru Har Krishan Ji',
        nameHindi: 'श्री गुरु हर किशन जी',
        isGuru: true,
        guruNumber: 8,
        birthYear: 1656,
        deathYear: 1664,
        region: 'Kiratpur Sahib',
      },
    }),
    () => prisma.baniAuthor.upsert({
      where: { nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ',
        nameEnglish: 'Sri Guru Tegh Bahadur Ji',
        nameHindi: 'श्री गुरु तेग बहादुर जी',
        isGuru: true,
        guruNumber: 9,
        birthYear: 1621,
        deathYear: 1675,
        region: 'Amritsar',
      },
    }),
    () => prisma.baniAuthor.upsert({
      where: { nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ' },
      update: {},
      create: {
        nameGurmukhi: 'ਸ੍ਰੀ ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ',
        nameEnglish: 'Sri Guru Gobind Singh Ji',
        nameHindi: 'श्री गुरु गोबिंद सिंह जी',
        isGuru: true,
        guruNumber: 10,
        birthYear: 1666,
        deathYear: 1708,
        region: 'Patna Sahib',
      },
    }),
  ]);

  console.log(`✅ Seeded ${gurus.length} Guru Sahibaan\n`);

  console.log('🙏 ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ - Database seeding complete.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
