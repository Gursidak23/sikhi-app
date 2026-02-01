// ============================================================================
// GURBANI CACHE SEEDER
// ============================================================================
// This script fetches all 1430 Angs from BaniDB and caches them in the database
// Run with: npx ts-node prisma/seed-gurbani-cache.ts
// Or: npm run seed:gurbani
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BANIDB_BASE_URL = 'https://api.banidb.com/v2';
const TOTAL_ANGS = 1430;
const BATCH_SIZE = 10; // Fetch 10 Angs at a time to avoid rate limiting
const DELAY_BETWEEN_BATCHES = 500; // 500ms delay between batches

// Raag ranges for metadata
const RAAG_RANGES = [
  { pa: 'ਜਪੁ ਜੀ ਸਾਹਿਬ', en: 'Japji Sahib', start: 1, end: 8 },
  { pa: 'ਸੋ ਦਰੁ - ਸੋ ਪੁਰਖੁ', en: 'So Dar - So Purakh', start: 8, end: 12 },
  { pa: 'ਸੋਹਿਲਾ', en: 'Sohila', start: 12, end: 13 },
  { pa: 'ਸ੍ਰੀ ਰਾਗੁ', en: 'Sri Raag', start: 14, end: 93 },
  { pa: 'ਰਾਗੁ ਮਾਝ', en: 'Raag Maajh', start: 94, end: 150 },
  { pa: 'ਰਾਗੁ ਗਉੜੀ', en: 'Raag Gauri', start: 151, end: 346 },
  { pa: 'ਰਾਗੁ ਆਸਾ', en: 'Raag Aasaa', start: 347, end: 488 },
  { pa: 'ਰਾਗੁ ਗੂਜਰੀ', en: 'Raag Gujri', start: 489, end: 526 },
  { pa: 'ਰਾਗੁ ਦੇਵਗੰਧਾਰੀ', en: 'Raag Devgandhari', start: 527, end: 536 },
  { pa: 'ਰਾਗੁ ਬਿਹਾਗੜਾ', en: 'Raag Bihagra', start: 537, end: 556 },
  { pa: 'ਰਾਗੁ ਵਡਹੰਸੁ', en: 'Raag Vadhans', start: 557, end: 594 },
  { pa: 'ਰਾਗੁ ਸੋਰਠਿ', en: 'Raag Sorath', start: 595, end: 659 },
  { pa: 'ਰਾਗੁ ਧਨਾਸਰੀ', en: 'Raag Dhanasri', start: 660, end: 695 },
  { pa: 'ਰਾਗੁ ਜੈਤਸਰੀ', en: 'Raag Jaitsri', start: 696, end: 710 },
  { pa: 'ਰਾਗੁ ਟੋਡੀ', en: 'Raag Todi', start: 711, end: 718 },
  { pa: 'ਰਾਗੁ ਬੈਰਾੜੀ', en: 'Raag Bairari', start: 719, end: 720 },
  { pa: 'ਰਾਗੁ ਤਿਲੰਗ', en: 'Raag Tilang', start: 721, end: 727 },
  { pa: 'ਰਾਗੁ ਸੂਹੀ', en: 'Raag Suhi', start: 728, end: 794 },
  { pa: 'ਰਾਗੁ ਬਿਲਾਵਲੁ', en: 'Raag Bilaval', start: 795, end: 858 },
  { pa: 'ਰਾਗੁ ਗੋਂਡ', en: 'Raag Gond', start: 859, end: 875 },
  { pa: 'ਰਾਗੁ ਰਾਮਕਲੀ', en: 'Raag Ramkali', start: 876, end: 974 },
  { pa: 'ਰਾਗੁ ਨਟ ਨਾਰਾਇਣ', en: 'Raag Nat Narayan', start: 975, end: 983 },
  { pa: 'ਰਾਗੁ ਮਾਲੀ ਗਉੜਾ', en: 'Raag Mali Gaura', start: 984, end: 988 },
  { pa: 'ਰਾਗੁ ਮਾਰੂ', en: 'Raag Maru', start: 989, end: 1106 },
  { pa: 'ਰਾਗੁ ਤੁਖਾਰੀ', en: 'Raag Tukhari', start: 1107, end: 1117 },
  { pa: 'ਰਾਗੁ ਕੇਦਾਰਾ', en: 'Raag Kedara', start: 1118, end: 1124 },
  { pa: 'ਰਾਗੁ ਭੈਰਉ', en: 'Raag Bhairo', start: 1125, end: 1167 },
  { pa: 'ਰਾਗੁ ਬਸੰਤੁ', en: 'Raag Basant', start: 1168, end: 1196 },
  { pa: 'ਰਾਗੁ ਸਾਰੰਗ', en: 'Raag Sarang', start: 1197, end: 1253 },
  { pa: 'ਰਾਗੁ ਮਲਾਰ', en: 'Raag Malaar', start: 1254, end: 1293 },
  { pa: 'ਰਾਗੁ ਕਾਨੜਾ', en: 'Raag Kanra', start: 1294, end: 1318 },
  { pa: 'ਰਾਗੁ ਕਲਿਆਣ', en: 'Raag Kalyan', start: 1319, end: 1326 },
  { pa: 'ਰਾਗੁ ਪ੍ਰਭਾਤੀ', en: 'Raag Parbhati', start: 1327, end: 1351 },
  { pa: 'ਰਾਗੁ ਜੈਜਾਵੰਤੀ', en: 'Raag Jaijavanti', start: 1352, end: 1353 },
  { pa: 'ਸਲੋਕ ਸਹਸਕ੍ਰਿਤੀ', en: 'Salok Sehskriti', start: 1353, end: 1360 },
  { pa: 'ਸਲੋਕ ਕਬੀਰ ਜੀ', en: 'Salok Kabir Ji', start: 1364, end: 1377 },
  { pa: 'ਸਲੋਕ ਫਰੀਦ ਜੀ', en: 'Salok Farid Ji', start: 1377, end: 1384 },
  { pa: 'ਸਵਈਏ', en: 'Savaiye', start: 1385, end: 1409 },
  { pa: 'ਸਲੋਕ ਮਹਲਾ ੯', en: 'Salok Mehl 9', start: 1426, end: 1429 },
  { pa: 'ਮੁੰਦਾਵਣੀ / ਰਾਗਮਾਲਾ', en: 'Mundavani / Raagmala', start: 1429, end: 1430 },
];

function getRaagForAng(angNumber: number): { pa: string; en: string } {
  const raag = RAAG_RANGES.find(r => angNumber >= r.start && angNumber <= r.end);
  return raag ? { pa: raag.pa, en: raag.en } : { pa: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ', en: 'Sri Guru Granth Sahib Ji' };
}

async function fetchAngFromBaniDB(angNumber: number): Promise<{ verses: unknown[]; count: number } | null> {
  try {
    const response = await fetch(`${BANIDB_BASE_URL}/angs/${angNumber}/G`);
    if (!response.ok) {
      console.error(`Failed to fetch Ang ${angNumber}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return {
      verses: data.page || [],
      count: data.count || 0,
    };
  } catch (error) {
    console.error(`Error fetching Ang ${angNumber}:`, error);
    return null;
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedGurbaniCache(): Promise<void> {
  console.log('🙏 Starting Gurbani Cache Seeding...');
  console.log(`   Total Angs to cache: ${TOTAL_ANGS}`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  // Process in batches
  for (let batchStart = 1; batchStart <= TOTAL_ANGS; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, TOTAL_ANGS);
    const batch = [];

    for (let angNumber = batchStart; angNumber <= batchEnd; angNumber++) {
      batch.push(angNumber);
    }

    console.log(`📖 Fetching Angs ${batchStart}-${batchEnd}...`);

    // Fetch all in batch concurrently
    const results = await Promise.all(
      batch.map(async (angNumber) => {
        const data = await fetchAngFromBaniDB(angNumber);
        return { angNumber, data };
      })
    );

    // Save to database
    for (const { angNumber, data } of results) {
      if (data) {
        try {
          const raag = getRaagForAng(angNumber);
          
          await prisma.gurbaniAngCache.upsert({
            where: { angNumber },
            update: {
              versesJson: JSON.stringify(data.verses),
              verseCount: data.count,
              raagName: raag.pa,
              raagNameEn: raag.en,
              fetchedAt: new Date(),
            },
            create: {
              angNumber,
              sourceId: 'G',
              versesJson: JSON.stringify(data.verses),
              verseCount: data.count,
              raagName: raag.pa,
              raagNameEn: raag.en,
              fetchedAt: new Date(),
            },
          });
          successCount++;
        } catch (error) {
          console.error(`   ❌ Error saving Ang ${angNumber}:`, error);
          errorCount++;
        }
      } else {
        errorCount++;
      }
    }

    // Progress update
    const progress = Math.round((batchEnd / TOTAL_ANGS) * 100);
    console.log(`   ✅ Progress: ${progress}% (${successCount} saved, ${errorCount} errors)`);

    // Delay between batches to avoid rate limiting
    if (batchEnd < TOTAL_ANGS) {
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('');
  console.log('🎉 Gurbani Cache Seeding Complete!');
  console.log(`   ✅ Successfully cached: ${successCount} Angs`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   ⏱️  Time elapsed: ${elapsed}s`);
  console.log('');
  console.log('ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫ਼ਤਿਹ');
}

// Main execution
seedGurbaniCache()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
