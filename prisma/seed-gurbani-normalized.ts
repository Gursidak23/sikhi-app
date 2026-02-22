// ============================================================================
// GURBANI NORMALIZED DATA SEEDER (Option B)
// ============================================================================
// Parses cached GurbaniAngCache JSON → Raag, BaniAuthor, Shabad, Pankti,
// Source, TeekaInterpretation (normalized relational data)
//
// Run with: npx tsx prisma/seed-gurbani-normalized.ts
// Requires: Option A (GurbaniAngCache) already populated
// ============================================================================

import { PrismaClient, SourceType, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ── BaniDB Verse shape (matches banidb-client.ts) ──────────────────────────

interface BaniDBVerse {
  verseId: number;
  shabadId: number;
  verse: { gurmukhi: string; unicode: string };
  larivaar: { gurmukhi: string; unicode: string };
  translation: {
    en: { bdb: string | null; ms: string | null; ssk: string | null };
    pu: {
      bdb: string | { gurmukhi: string; unicode: string } | null;
      ss?: string | { gurmukhi: string; unicode: string } | null;
      ft?: string | { gurmukhi: string; unicode: string } | null;
      ms?: string | { gurmukhi: string; unicode: string } | null;
    };
    hi?: { ss?: string | null; sts?: string | null };
    es?: { sn?: string | null };
  };
  transliteration: {
    english: string; hindi: string; en: string; hi: string; ipa: string; ur: string;
  };
  pageNo: number;
  lineNo: number;
  updated: string;
  visraam: {
    sttm: Array<{ p: number; t: string }>;
    igurbani: Array<{ p: number; t: string }>;
    sttm2: Array<{ p: number; t: string }>;
  };
  writer?: {
    writerId: number | null;
    gurmukhi: string | null;
    unicode: string | null;
    english: string | null;
  };
  raag?: {
    raagId: number | null;
    gurmukhi: string | null;
    unicode: string | null;
    english: string | null;
    raagWithPage: string | null;
  };
}

// ── Raag metadata (complete list with musical info) ─────────────────────────

const RAAG_METADATA: Array<{
  id: number; pa: string; en: string; start: number; end: number;
  timeOfDay?: string; season?: string; mood?: string;
}> = [
  { id: 0,  pa: 'ਜਪੁ ਜੀ ਸਾਹਿਬ', en: 'Japji Sahib', start: 1, end: 8 },
  { id: 0,  pa: 'ਸੋ ਦਰੁ - ਸੋ ਪੁਰਖੁ', en: 'So Dar - So Purakh', start: 8, end: 12 },
  { id: 0,  pa: 'ਸੋਹਿਲਾ', en: 'Sohila', start: 12, end: 13 },
  { id: 2,  pa: 'ਸ੍ਰੀ ਰਾਗੁ', en: 'Sri Raag', start: 14, end: 93, timeOfDay: 'Evening', mood: 'Detachment' },
  { id: 3,  pa: 'ਰਾਗੁ ਮਾਝ', en: 'Raag Maajh', start: 94, end: 150, timeOfDay: 'Late night', mood: 'Yearning' },
  { id: 4,  pa: 'ਰਾਗੁ ਗਉੜੀ', en: 'Raag Gauri', start: 151, end: 346, timeOfDay: 'Early morning', mood: 'Seriousness' },
  { id: 5,  pa: 'ਰਾਗੁ ਆਸਾ', en: 'Raag Aasaa', start: 347, end: 488, timeOfDay: 'Late night - dawn', mood: 'Hope, yearning' },
  { id: 9,  pa: 'ਰਾਗੁ ਗੂਜਰੀ', en: 'Raag Gujri', start: 489, end: 526, timeOfDay: 'Early morning', mood: 'Peaceful contemplation' },
  { id: 10, pa: 'ਰਾਗੁ ਦੇਵਗੰਧਾਰੀ', en: 'Raag Devgandhari', start: 527, end: 536, timeOfDay: 'Morning', mood: 'Devotional tenderness' },
  { id: 11, pa: 'ਰਾਗੁ ਬਿਹਾਗੜਾ', en: 'Raag Bihagra', start: 537, end: 556, timeOfDay: 'Late night', mood: 'Love, separation' },
  { id: 12, pa: 'ਰਾਗੁ ਵਡਹੰਸੁ', en: 'Raag Vadhans', start: 557, end: 594, timeOfDay: 'Morning', mood: 'Ecstatic joy and separation' },
  { id: 13, pa: 'ਰਾਗੁ ਸੋਰਠਿ', en: 'Raag Sorath', start: 595, end: 659, timeOfDay: 'Evening', mood: 'Calm, steady contemplation' },
  { id: 14, pa: 'ਰਾਗੁ ਧਨਾਸਰੀ', en: 'Raag Dhanasri', start: 660, end: 695, timeOfDay: 'Afternoon', mood: 'Gratitude, contentment' },
  { id: 15, pa: 'ਰਾਗੁ ਜੈਤਸਰੀ', en: 'Raag Jaitsri', start: 696, end: 710, timeOfDay: 'Afternoon', mood: 'Pensive absorption' },
  { id: 16, pa: 'ਰਾਗੁ ਟੋਡੀ', en: 'Raag Todi', start: 711, end: 718, timeOfDay: 'Late morning', mood: 'Longing, pathos' },
  { id: 17, pa: 'ਰਾਗੁ ਬੈਰਾੜੀ', en: 'Raag Bairari', start: 719, end: 720, timeOfDay: 'Morning', mood: 'Bravery, heroic' },
  { id: 18, pa: 'ਰਾਗੁ ਤਿਲੰਗ', en: 'Raag Tilang', start: 721, end: 727, timeOfDay: 'Late night', mood: 'Romantic devotion' },
  { id: 19, pa: 'ਰਾਗੁ ਸੂਹੀ', en: 'Raag Suhi', start: 728, end: 794, timeOfDay: 'Late afternoon', mood: 'Blissful love' },
  { id: 20, pa: 'ਰਾਗੁ ਬਿਲਾਵਲੁ', en: 'Raag Bilaval', start: 795, end: 858, timeOfDay: 'Morning - noon', mood: 'Joy, celebration' },
  { id: 21, pa: 'ਰਾਗੁ ਗੋਂਡ', en: 'Raag Gond', start: 859, end: 875, timeOfDay: 'Late night', mood: 'Playful, joyful' },
  { id: 22, pa: 'ਰਾਗੁ ਰਾਮਕਲੀ', en: 'Raag Ramkali', start: 876, end: 974, timeOfDay: 'Early morning', mood: 'Solemn devotion' },
  { id: 23, pa: 'ਰਾਗੁ ਨਟ ਨਾਰਾਇਣ', en: 'Raag Nat Narayan', start: 975, end: 983, timeOfDay: 'Night', mood: 'Mystic, ecstatic' },
  { id: 24, pa: 'ਰਾਗੁ ਮਾਲੀ ਗਉੜਾ', en: 'Raag Mali Gaura', start: 984, end: 988, timeOfDay: 'Morning', mood: 'Gentle devotion' },
  { id: 25, pa: 'ਰਾਗੁ ਮਾਰੂ', en: 'Raag Maru', start: 989, end: 1106, timeOfDay: 'Afternoon', mood: 'Grandeur, vastness' },
  { id: 26, pa: 'ਰਾਗੁ ਤੁਖਾਰੀ', en: 'Raag Tukhari', start: 1107, end: 1117, timeOfDay: 'Autumn', season: 'Autumn', mood: 'Seasonal meditation' },
  { id: 27, pa: 'ਰਾਗੁ ਕੇਦਾਰਾ', en: 'Raag Kedara', start: 1118, end: 1124, timeOfDay: 'Night', mood: 'Deep contemplation' },
  { id: 28, pa: 'ਰਾਗੁ ਭੈਰਉ', en: 'Raag Bhairo', start: 1125, end: 1167, timeOfDay: 'Pre-dawn', mood: 'Fearful awe, reverence' },
  { id: 29, pa: 'ਰਾਗੁ ਬਸੰਤੁ', en: 'Raag Basant', start: 1168, end: 1196, timeOfDay: 'Spring', season: 'Spring', mood: 'Renewal, blossoming' },
  { id: 30, pa: 'ਰਾਗੁ ਸਾਰੰਗ', en: 'Raag Sarang', start: 1197, end: 1253, timeOfDay: 'Midday', mood: 'Longing for rain, thirst' },
  { id: 31, pa: 'ਰਾਗੁ ਮਲਾਰ', en: 'Raag Malaar', start: 1254, end: 1293, timeOfDay: 'Rainy season', season: 'Monsoon', mood: 'Yearning, fulfillment' },
  { id: 32, pa: 'ਰਾਗੁ ਕਾਨੜਾ', en: 'Raag Kanra', start: 1294, end: 1318, timeOfDay: 'Late night', mood: 'Deep meditation' },
  { id: 33, pa: 'ਰਾਗੁ ਕਲਿਆਣ', en: 'Raag Kalyan', start: 1319, end: 1326, timeOfDay: 'Evening', mood: 'Peaceful liberation' },
  { id: 34, pa: 'ਰਾਗੁ ਪ੍ਰਭਾਤੀ', en: 'Raag Parbhati', start: 1327, end: 1351, timeOfDay: 'Early morning', mood: 'Dawn devotion' },
  { id: 35, pa: 'ਰਾਗੁ ਜੈਜਾਵੰਤੀ', en: 'Raag Jaijavanti', start: 1352, end: 1353, timeOfDay: 'Night', mood: 'Victorious' },
  { id: 0,  pa: 'ਸਲੋਕ ਸਹਸਕ੍ਰਿਤੀ', en: 'Salok Sehskriti', start: 1353, end: 1360 },
  { id: 0,  pa: 'ਗਾਥਾ', en: 'Gaathaa', start: 1360, end: 1361 },
  { id: 0,  pa: 'ਫੁਨਹੇ', en: 'Phunhay', start: 1361, end: 1363 },
  { id: 0,  pa: 'ਚਉਬੋਲੇ', en: 'Chaubole', start: 1363, end: 1364 },
  { id: 0,  pa: 'ਸਲੋਕ ਕਬੀਰ ਜੀ', en: 'Salok Kabir Ji', start: 1364, end: 1377 },
  { id: 0,  pa: 'ਸਲੋਕ ਫਰੀਦ ਜੀ', en: 'Salok Farid Ji', start: 1377, end: 1384 },
  { id: 0,  pa: 'ਸਵਈਏ ਸ੍ਰੀ ਮੁਖਵਾਕ ਮਹਲਾ ੫', en: 'Savaiye Sri Mukhvaak Mehl 5', start: 1385, end: 1409 },
  { id: 0,  pa: 'ਸਲੋਕ ਵਾਰਾਂ ਤੇ ਵਧੀਕ', en: 'Salok Vaaraan Tay Vadhik', start: 1410, end: 1426 },
  { id: 0,  pa: 'ਸਲੋਕ ਮਹਲਾ ੯', en: 'Salok Mehl 9', start: 1426, end: 1429 },
  { id: 0,  pa: 'ਮੁੰਦਾਵਣੀ / ਰਾਗਮਾਲਾ', en: 'Mundavani / Raagmala', start: 1429, end: 1430 },
];

// ── Writer metadata (complete list of Gurbani authors) ──────────────────────

const WRITER_METADATA: Record<number, {
  pa: string; en: string; isGuru: boolean; guruNumber?: number;
  isBhagat: boolean; birthYear?: number; deathYear?: number; region?: string;
}> = {
  1:  { pa: 'ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ', en: 'Guru Nanak Dev Ji', isGuru: true, guruNumber: 1, isBhagat: false, birthYear: 1469, deathYear: 1539, region: 'Rai Bhoe Ki Talwandi (Nankana Sahib)' },
  2:  { pa: 'ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ', en: 'Guru Angad Dev Ji', isGuru: true, guruNumber: 2, isBhagat: false, birthYear: 1504, deathYear: 1552, region: 'Harike, Punjab' },
  3:  { pa: 'ਗੁਰੂ ਅਮਰ ਦਾਸ ਜੀ', en: 'Guru Amar Das Ji', isGuru: true, guruNumber: 3, isBhagat: false, birthYear: 1479, deathYear: 1574, region: 'Basarke, Punjab' },
  4:  { pa: 'ਗੁਰੂ ਰਾਮ ਦਾਸ ਜੀ', en: 'Guru Ram Das Ji', isGuru: true, guruNumber: 4, isBhagat: false, birthYear: 1534, deathYear: 1581, region: 'Chuna Mandi, Lahore' },
  5:  { pa: 'ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ', en: 'Guru Arjan Dev Ji', isGuru: true, guruNumber: 5, isBhagat: false, birthYear: 1563, deathYear: 1606, region: 'Goindval, Punjab' },
  9:  { pa: 'ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ', en: 'Guru Tegh Bahadur Ji', isGuru: true, guruNumber: 9, isBhagat: false, birthYear: 1621, deathYear: 1675, region: 'Amritsar' },
  // Bhagats
  10: { pa: 'ਭਗਤ ਕਬੀਰ ਜੀ', en: 'Bhagat Kabir Ji', isGuru: false, isBhagat: true, birthYear: 1398, deathYear: 1518, region: 'Varanasi' },
  11: { pa: 'ਭਗਤ ਤ੍ਰਿਲੋਚਨ ਜੀ', en: 'Bhagat Trilochan Ji', isGuru: false, isBhagat: true, region: 'Maharashtra' },
  12: { pa: 'ਭਗਤ ਨਾਮਦੇਵ ਜੀ', en: 'Bhagat Namdev Ji', isGuru: false, isBhagat: true, birthYear: 1270, deathYear: 1350, region: 'Maharashtra' },
  13: { pa: 'ਭਗਤ ਰਵਿਦਾਸ ਜੀ', en: 'Bhagat Ravidas Ji', isGuru: false, isBhagat: true, birthYear: 1377, deathYear: 1528, region: 'Varanasi' },
  14: { pa: 'ਸ਼ੇਖ਼ ਫ਼ਰੀਦ ਜੀ', en: 'Sheikh Farid Ji', isGuru: false, isBhagat: true, birthYear: 1173, deathYear: 1266, region: 'Multan' },
  15: { pa: 'ਭਗਤ ਭੀਖਨ ਜੀ', en: 'Bhagat Bheekhan Ji', isGuru: false, isBhagat: true, region: 'Lucknow' },
  16: { pa: 'ਭਗਤ ਸੈਣ ਜੀ', en: 'Bhagat Sain Ji', isGuru: false, isBhagat: true, region: 'Rewa' },
  17: { pa: 'ਭਗਤ ਧੰਨਾ ਜੀ', en: 'Bhagat Dhanna Ji', isGuru: false, isBhagat: true, birthYear: 1415, region: 'Rajasthan' },
  18: { pa: 'ਭਗਤ ਪੀਪਾ ਜੀ', en: 'Bhagat Pipa Ji', isGuru: false, isBhagat: true, region: 'Rajasthan' },
  19: { pa: 'ਭਗਤ ਸੂਰਦਾਸ ਜੀ', en: 'Bhagat Surdas Ji', isGuru: false, isBhagat: true, region: 'Uttar Pradesh' },
  20: { pa: 'ਭਗਤ ਜੈਦੇਵ ਜੀ', en: 'Bhagat Jaidev Ji', isGuru: false, isBhagat: true, birthYear: 1170, deathYear: 1245, region: 'Bengal' },
  21: { pa: 'ਭਗਤ ਰਾਮਾਨੰਦ ਜੀ', en: 'Bhagat Ramanand Ji', isGuru: false, isBhagat: true, birthYear: 1299, deathYear: 1411, region: 'Varanasi' },
  22: { pa: 'ਭਗਤ ਪਰਮਾਨੰਦ ਜੀ', en: 'Bhagat Parmanand Ji', isGuru: false, isBhagat: true, region: 'Maharashtra' },
  23: { pa: 'ਭਗਤ ਸਧਨਾ ਜੀ', en: 'Bhagat Sadhna Ji', isGuru: false, isBhagat: true, region: 'Sindh' },
  30: { pa: 'ਭੱਟ ਕਲ੍ਹ ਸਹਾਰ ਜੀ', en: 'Bhat Kal Sahar Ji', isGuru: false, isBhagat: false, region: 'Punjab' },
  31: { pa: 'ਭੱਟ ਜਲਪ ਜੀ', en: 'Bhat Jalap Ji', isGuru: false, isBhagat: false, region: 'Punjab' },
  32: { pa: 'ਭੱਟ ਕੀਰਤ ਜੀ', en: 'Bhat Kirat Ji', isGuru: false, isBhagat: false, region: 'Punjab' },
  33: { pa: 'ਭੱਟ ਭਿਖਾ ਜੀ', en: 'Bhat Bhikha Ji', isGuru: false, isBhagat: false, region: 'Punjab' },
  34: { pa: 'ਭੱਟ ਸਲ੍ਹ ਜੀ', en: 'Bhat Sal Ji', isGuru: false, isBhagat: false, region: 'Punjab' },
  35: { pa: 'ਭੱਟ ਬਲ੍ਹ ਜੀ', en: 'Bhat Bal Ji', isGuru: false, isBhagat: false, region: 'Punjab' },
  36: { pa: 'ਭੱਟ ਨਲ੍ਹ ਜੀ', en: 'Bhat Nal Ji', isGuru: false, isBhagat: false, region: 'Punjab' },
  37: { pa: 'ਭੱਟ ਗਯੰਦ ਜੀ', en: 'Bhat Gayand Ji', isGuru: false, isBhagat: false, region: 'Punjab' },
  38: { pa: 'ਭੱਟ ਮਥੁਰਾ ਜੀ', en: 'Bhat Mathura Ji', isGuru: false, isBhagat: false, region: 'Punjab' },
  39: { pa: 'ਭੱਟ ਹਰਬੰਸ ਜੀ', en: 'Bhat Harbans Ji', isGuru: false, isBhagat: false, region: 'Punjab' },
};

// ── Translation sources mapping ─────────────────────────────────────────────

const TRANSLATION_SOURCES = [
  { key: 'en_bdb', titlePa: 'ਬਾਣੀ ਡੀ ਬੀ ਅੰਗ੍ਰੇਜ਼ੀ', titleEn: 'BaniDB English Translation', type: SourceType.TEEKA },
  { key: 'en_ms',  titlePa: 'ਮਨਮੋਹਨ ਸਿੰਘ ਅੰਗ੍ਰੇਜ਼ੀ', titleEn: 'Manmohan Singh English Translation', type: SourceType.TEEKA },
  { key: 'en_ssk', titlePa: 'ਸੰਤ ਸਿੰਘ ਖਾਲਸਾ ਅੰਗ੍ਰੇਜ਼ੀ', titleEn: 'Sant Singh Khalsa English Translation', type: SourceType.TEEKA },
  { key: 'pu_ss',  titlePa: 'ਪ੍ਰੋ: ਸਾਹਿਬ ਸਿੰਘ - ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ', titleEn: 'Professor Sahib Singh - Sri Guru Granth Sahib Darpan', type: SourceType.TEEKA },
  { key: 'pu_ft',  titlePa: 'ਫ਼ਰੀਦਕੋਟ ਵਾਲੀ ਟੀਕਾ', titleEn: 'Faridkot Wali Teeka', type: SourceType.TEEKA },
  { key: 'hi_ss',  titlePa: 'ਸਾਹਿਬ ਸਿੰਘ ਹਿੰਦੀ', titleEn: 'Sahib Singh Hindi Translation', type: SourceType.TEEKA },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function extractPunjabiText(val: string | { gurmukhi: string; unicode: string } | null): { pa: string | null; en: string | null } {
  if (!val) return { pa: null, en: null };
  if (typeof val === 'string') return { pa: val, en: null };
  return { pa: val.unicode || val.gurmukhi, en: null };
}

function getRaagForAng(angNumber: number): typeof RAAG_METADATA[number] | undefined {
  return RAAG_METADATA.find(r => angNumber >= r.start && angNumber <= r.end);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Main ETL ────────────────────────────────────────────────────────────────

async function main() {
  console.log('🙏 Starting Gurbani Normalized Data Seeding (Option B)...');
  console.log('   Reading from GurbaniAngCache (Option A data)...\n');

  const startTime = Date.now();

  // ─── Step 1: Read all cached Angs ──────────────────────────────────────────
  console.log('📖 Step 1/6: Loading cached Ang data...');
  const cachedAngs = await prisma.gurbaniAngCache.findMany({
    orderBy: { angNumber: 'asc' },
  });
  console.log(`   Found ${cachedAngs.length} cached Angs`);

  if (cachedAngs.length === 0) {
    console.error('❌ No cached Angs found! Run Option A first (npm run seed:gurbani)');
    process.exit(1);
  }

  // Parse all verses from cached JSON
  const allVerses: Array<BaniDBVerse & { _angNumber: number }> = [];
  for (const ang of cachedAngs) {
    try {
      const verses = JSON.parse(ang.versesJson) as BaniDBVerse[];
      for (const v of verses) {
        allVerses.push({ ...v, _angNumber: ang.angNumber });
      }
    } catch (e) {
      console.error(`   ⚠️ Failed to parse Ang ${ang.angNumber}:`, e);
    }
  }
  console.log(`   Parsed ${allVerses.length} total verses\n`);

  // ─── Step 2: Seed Raags ────────────────────────────────────────────────────
  console.log('🎵 Step 2/6: Seeding Raags...');

  // Collect unique raags from data + metadata
  const raagMap = new Map<string, { pa: string; en: string; start: number; end: number; order: number; timeOfDay?: string; season?: string; mood?: string }>();
  let raagOrder = 1;

  for (const rm of RAAG_METADATA) {
    const key = `${rm.pa}_${rm.start}`;
    if (!raagMap.has(key)) {
      raagMap.set(key, {
        pa: rm.pa, en: rm.en,
        start: rm.start, end: rm.end,
        order: raagOrder++,
        timeOfDay: rm.timeOfDay, season: rm.season, mood: rm.mood,
      });
    }
  }

  // Clear existing normalized data (in order due to FK constraints)
  console.log('   Clearing existing normalized data...');
  await prisma.teekaInterpretation.deleteMany({});
  await prisma.pankti.deleteMany({});
  await prisma.shabad.deleteMany({});
  await prisma.baniAuthor.deleteMany({});
  await prisma.raag.deleteMany({});
  // Clean up orphan Sources of type TEEKA that we'll recreate
  await prisma.source.deleteMany({ where: { sourceType: SourceType.TEEKA } });

  const raagDbMap = new Map<string, string>(); // raagKey → DB id
  for (const [key, r] of Array.from(raagMap.entries())) {
    const created = await prisma.raag.create({
      data: {
        nameGurmukhi: r.pa,
        nameEnglish: r.en,
        orderInGranth: r.order,
        angStart: r.start,
        angEnd: r.end,
        timeOfDay: r.timeOfDay || null,
        season: r.season || null,
        mood: r.mood || null,
      },
    });
    raagDbMap.set(key, created.id);
  }
  console.log(`   ✅ Created ${raagDbMap.size} Raags\n`);

  // Helper: find Raag DB ID for an Ang number
  function findRaagId(angNumber: number): string {
    const rm = getRaagForAng(angNumber);
    if (rm) {
      const key = `${rm.pa}_${rm.start}`;
      return raagDbMap.get(key) || Array.from(raagDbMap.values())[0];
    }
    // Default to first raag
    return Array.from(raagDbMap.values())[0];
  }

  // ─── Step 3: Seed BaniAuthors ──────────────────────────────────────────────
  console.log('✍️  Step 3/6: Seeding BaniAuthors (Writers)...');

  // Collect unique writers from data
  const writerIds = new Set<number>();
  for (const v of allVerses) {
    if (v.writer?.writerId != null) {
      writerIds.add(v.writer.writerId);
    }
  }

  const authorDbMap = new Map<number, string>(); // BaniDB writerId → DB id

  // Create known authors
  for (const wId of Array.from(writerIds)) {
    const meta = WRITER_METADATA[wId];
    if (meta) {
      const created = await prisma.baniAuthor.create({
        data: {
          nameGurmukhi: meta.pa,
          nameEnglish: meta.en,
          isGuru: meta.isGuru,
          guruNumber: meta.guruNumber || null,
          isBhagat: meta.isBhagat,
          birthYear: meta.birthYear || null,
          deathYear: meta.deathYear || null,
          region: meta.region || null,
        },
      });
      authorDbMap.set(wId, created.id);
    } else {
      // Unknown writer — find name from data
      const sample = allVerses.find(v => v.writer?.writerId === wId);
      const created = await prisma.baniAuthor.create({
        data: {
          nameGurmukhi: sample?.writer?.unicode || sample?.writer?.gurmukhi || `ਲੇਖਕ ${wId}`,
          nameEnglish: sample?.writer?.english || `Writer ${wId}`,
          isGuru: false,
          isBhagat: false,
        },
      });
      authorDbMap.set(wId, created.id);
    }
  }

  // Create a fallback "Unknown" author for verses with null writer
  const unknownAuthor = await prisma.baniAuthor.create({
    data: {
      nameGurmukhi: 'ਅਗਿਆਤ',
      nameEnglish: 'Unknown / Multiple Authors',
      isGuru: false,
      isBhagat: false,
    },
  });
  const unknownAuthorId = unknownAuthor.id;

  console.log(`   ✅ Created ${authorDbMap.size + 1} BaniAuthors\n`);

  // ─── Step 4: Seed Sources (for Teeka translations) ─────────────────────────
  console.log('📚 Step 4/6: Seeding Translation Sources...');

  const sourceDbMap = new Map<string, string>(); // source key → DB id
  for (const src of TRANSLATION_SOURCES) {
    const created = await prisma.source.create({
      data: {
        titleGurmukhi: src.titlePa,
        titleEnglish: src.titleEn,
        sourceType: src.type,
        reliabilityNotes: 'Sourced from BaniDB (Khalis Foundation)',
      },
    });
    sourceDbMap.set(src.key, created.id);
  }
  console.log(`   ✅ Created ${sourceDbMap.size} Sources\n`);

  // ─── Step 5: Seed Shabads and Panktis ──────────────────────────────────────
  console.log('📖 Step 5/6: Seeding Shabads & Panktis...');

  // Group verses by shabadId
  const shabadGroups = new Map<number, Array<BaniDBVerse & { _angNumber: number }>>();
  for (const v of allVerses) {
    if (!shabadGroups.has(v.shabadId)) {
      shabadGroups.set(v.shabadId, []);
    }
    shabadGroups.get(v.shabadId)!.push(v);
  }
  console.log(`   Found ${shabadGroups.size} unique Shabads`);

  let shabadCount = 0;
  let panktiCount = 0;
  const shabadDbMap = new Map<number, string>(); // BaniDB shabadId → DB id

  // Process in batches of 50 shabads
  const shabadEntries = Array.from(shabadGroups.entries());
  const SHABAD_BATCH = 50;

  for (let i = 0; i < shabadEntries.length; i += SHABAD_BATCH) {
    const batch = shabadEntries.slice(i, i + SHABAD_BATCH);

    for (const [shabadId, verses] of batch) {
      // Sort verses by verseId (line order)
      verses.sort((a, b) => a.verseId - b.verseId);
      const firstVerse = verses[0];

      // Determine raag and author
      const raagId = findRaagId(firstVerse._angNumber);
      const writerId = firstVerse.writer?.writerId;
      const authorId = (writerId != null && authorDbMap.has(writerId))
        ? authorDbMap.get(writerId)!
        : unknownAuthorId;

      try {
        const shabad = await prisma.shabad.create({
          data: {
            angNumber: firstVerse.pageNo || firstVerse._angNumber,
            raagId,
            authorId,
            shabadNumber: shabadId,
          },
        });
        shabadDbMap.set(shabadId, shabad.id);
        shabadCount++;

        // Create Panktis for this Shabad
        for (let lineIdx = 0; lineIdx < verses.length; lineIdx++) {
          const v = verses[lineIdx];
          await prisma.pankti.create({
            data: {
              shabadId: shabad.id,
              lineNumber: lineIdx + 1,
              gurmukhiUnicode: v.verse?.unicode || '',
              gurmukhiAscii: v.verse?.gurmukhi || null,
              transliteration: v.transliteration?.en || v.transliteration?.english || null,
              vishraamPositions: v.visraam ? JSON.stringify(v.visraam) : null,
            },
          });
          panktiCount++;
        }
      } catch (err) {
        // Handle duplicate shabadNumber+angNumber (shabad spanning pages)
        const existing = await prisma.shabad.findFirst({
          where: { shabadNumber: shabadId },
        });
        if (existing) {
          shabadDbMap.set(shabadId, existing.id);
          // Still create panktis for the new page's verses
          const existingPanktis = await prisma.pankti.count({ where: { shabadId: existing.id } });
          for (let lineIdx = 0; lineIdx < verses.length; lineIdx++) {
            const v = verses[lineIdx];
            const lineNum = existingPanktis + lineIdx + 1;
            try {
              await prisma.pankti.create({
                data: {
                  shabadId: existing.id,
                  lineNumber: lineNum,
                  gurmukhiUnicode: v.verse?.unicode || '',
                  gurmukhiAscii: v.verse?.gurmukhi || null,
                  transliteration: v.transliteration?.en || v.transliteration?.english || null,
                  vishraamPositions: v.visraam ? JSON.stringify(v.visraam) : null,
                },
              });
              panktiCount++;
            } catch {
              // Skip duplicate panktis
            }
          }
        } else {
          console.error(`   ⚠️ Error creating Shabad ${shabadId}:`, err);
        }
      }
    }

    const progress = Math.round(((i + batch.length) / shabadEntries.length) * 100);
    process.stdout.write(`\r   Progress: ${progress}% (${shabadCount} shabads, ${panktiCount} panktis)`);
  }
  console.log(`\n   ✅ Created ${shabadCount} Shabads, ${panktiCount} Panktis\n`);

  // ─── Step 6: Seed TeekaInterpretations ─────────────────────────────────────
  console.log('📝 Step 6/6: Seeding Teeka Interpretations...');
  console.log('   (This is the largest step — processing translations for each Pankti)');

  let teekaCount = 0;
  const TEEKA_BATCH = 100; // Process 100 angs at a time

  for (let angStart = 1; angStart <= 1430; angStart += TEEKA_BATCH) {
    const angEnd = Math.min(angStart + TEEKA_BATCH - 1, 1430);
    const batchVerses = allVerses.filter(v => v._angNumber >= angStart && v._angNumber <= angEnd);

    // For each verse, find its Pankti and create interpretations
    for (const v of batchVerses) {
      const shabadDbId = shabadDbMap.get(v.shabadId);
      if (!shabadDbId) continue;

      // Find the pankti by matching Gurmukhi text
      const pankti = await prisma.pankti.findFirst({
        where: {
          shabadId: shabadDbId,
          gurmukhiUnicode: v.verse?.unicode || '',
        },
      });
      if (!pankti) continue;

      // Create interpretations for available translations
      const interpretations: Array<{
        panktiId: string; sourceId: string;
        arthPunjabi?: string | null; arthHindi?: string | null; meaningEnglish?: string | null;
      }> = [];

      // English translations
      if (v.translation?.en?.bdb && sourceDbMap.has('en_bdb')) {
        interpretations.push({
          panktiId: pankti.id,
          sourceId: sourceDbMap.get('en_bdb')!,
          meaningEnglish: v.translation.en.bdb,
        });
      }
      if (v.translation?.en?.ms && sourceDbMap.has('en_ms')) {
        interpretations.push({
          panktiId: pankti.id,
          sourceId: sourceDbMap.get('en_ms')!,
          meaningEnglish: v.translation.en.ms,
        });
      }
      if (v.translation?.en?.ssk && sourceDbMap.has('en_ssk')) {
        interpretations.push({
          panktiId: pankti.id,
          sourceId: sourceDbMap.get('en_ssk')!,
          meaningEnglish: v.translation.en.ssk,
        });
      }

      // Punjabi translations
      if (v.translation?.pu?.ss && sourceDbMap.has('pu_ss')) {
        const { pa } = extractPunjabiText(v.translation.pu.ss);
        if (pa) {
          interpretations.push({
            panktiId: pankti.id,
            sourceId: sourceDbMap.get('pu_ss')!,
            arthPunjabi: pa,
          });
        }
      }
      if (v.translation?.pu?.ft && sourceDbMap.has('pu_ft')) {
        const { pa } = extractPunjabiText(v.translation.pu.ft);
        if (pa) {
          interpretations.push({
            panktiId: pankti.id,
            sourceId: sourceDbMap.get('pu_ft')!,
            arthPunjabi: pa,
          });
        }
      }

      // Hindi translation
      if (v.translation?.hi?.ss && sourceDbMap.has('hi_ss')) {
        interpretations.push({
          panktiId: pankti.id,
          sourceId: sourceDbMap.get('hi_ss')!,
          arthHindi: v.translation.hi.ss,
        });
      }

      // Batch create interpretations
      for (const interp of interpretations) {
        try {
          await prisma.teekaInterpretation.create({
            data: {
              panktiId: interp.panktiId,
              sourceId: interp.sourceId,
              arthPunjabi: interp.arthPunjabi || null,
              arthHindi: interp.arthHindi || null,
              meaningEnglish: interp.meaningEnglish || null,
              status: ContentStatus.PUBLISHED,
            },
          });
          teekaCount++;
        } catch {
          // Skip duplicates
        }
      }
    }

    const progress = Math.round((angEnd / 1430) * 100);
    process.stdout.write(`\r   Progress: ${progress}% (${teekaCount} interpretations)`);
  }

  console.log(`\n   ✅ Created ${teekaCount} TeekaInterpretations\n`);

  // ─── Summary ───────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const dbSize = await prisma.$queryRaw<Array<{ db_size: string }>>`SELECT pg_size_pretty(pg_database_size(current_database())) as db_size`;

  console.log('🎉 Gurbani Normalized Data Seeding Complete!');
  console.log(`   ✅ Raags:            ${raagDbMap.size}`);
  console.log(`   ✅ BaniAuthors:      ${authorDbMap.size + 1}`);
  console.log(`   ✅ Sources:          ${sourceDbMap.size}`);
  console.log(`   ✅ Shabads:          ${shabadCount}`);
  console.log(`   ✅ Panktis:          ${panktiCount}`);
  console.log(`   ✅ Interpretations:  ${teekaCount}`);
  console.log(`   📊 Database size:    ${dbSize[0].db_size}`);
  console.log(`   ⏱️  Time elapsed:     ${elapsed}s`);
  console.log('');
  console.log('ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫ਼ਤਿਹ');
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
