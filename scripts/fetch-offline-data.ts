// ============================================================================
// OFFLINE DATA FETCHER
// ============================================================================
// Downloads all Gurbani data from BaniDB API and saves as static JSON files
// for fully offline Capacitor APK builds.
//
// Run with: npx tsx scripts/fetch-offline-data.ts
// ============================================================================

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BANIDB_BASE_URL = 'https://api.banidb.com/v2';
const TOTAL_ANGS = 1430;
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 500;
const MAX_RETRIES = 3;

const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');

// Nitnem Bani IDs (matches NITNEM_BANIS_CONFIG in nitnem/page.tsx)
const NITNEM_BANI_IDS = [2, 4, 6, 9, 10, 21, 23, 31, 90];

function ensureDirs() {
  for (const sub of ['gurbani', 'nitnem', 'hukamnama', 'meta']) {
    const dir = join(OUTPUT_DIR, sub);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<unknown | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`  HTTP ${response.status} for ${url} (attempt ${attempt}/${retries})`);
        if (attempt < retries) await delay(1000 * attempt);
        continue;
      }
      return await response.json();
    } catch (error) {
      console.error(`  Network error for ${url} (attempt ${attempt}/${retries}):`, error);
      if (attempt < retries) await delay(1000 * attempt);
    }
  }
  return null;
}

// ── Fetch all 1430 Angs ──────────────────────────────────────────────────────

async function fetchAllAngs(): Promise<void> {
  console.log(`\n📖 Fetching all ${TOTAL_ANGS} Angs of Sri Guru Granth Sahib Ji...`);

  let success = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let batchStart = 1; batchStart <= TOTAL_ANGS; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, TOTAL_ANGS);
    const batch: number[] = [];
    for (let i = batchStart; i <= batchEnd; i++) batch.push(i);

    const results = await Promise.all(
      batch.map(async (angNumber) => {
        const outFile = join(OUTPUT_DIR, 'gurbani', `ang-${angNumber}.json`);
        // Skip if already downloaded
        if (existsSync(outFile)) {
          return { angNumber, ok: true, skipped: true };
        }
        const data = await fetchWithRetry(`${BANIDB_BASE_URL}/angs/${angNumber}/G`);
        if (data) {
          writeFileSync(outFile, JSON.stringify(data));
          return { angNumber, ok: true, skipped: false };
        }
        return { angNumber, ok: false, skipped: false };
      })
    );

    for (const r of results) {
      if (r.ok) success++;
      else errors++;
    }

    const progress = Math.round((batchEnd / TOTAL_ANGS) * 100);
    const skipped = results.filter(r => r.skipped).length;
    if (skipped === results.length) {
      // All skipped, no need to print or delay
    } else {
      console.log(`  ${progress}% — Angs ${batchStart}-${batchEnd} (${success} done, ${errors} errors)`);
      if (batchEnd < TOTAL_ANGS) await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`  ✅ Angs complete: ${success} saved, ${errors} errors (${elapsed}s)`);
}

// ── Fetch all Nitnem Banis ───────────────────────────────────────────────────

async function fetchAllBanis(): Promise<void> {
  console.log(`\n🙏 Fetching ${NITNEM_BANI_IDS.length} Nitnem Banis...`);

  for (const baniId of NITNEM_BANI_IDS) {
    const outFile = join(OUTPUT_DIR, 'nitnem', `bani-${baniId}.json`);
    if (existsSync(outFile)) {
      console.log(`  Bani ${baniId}: skipped (already exists)`);
      continue;
    }
    const data = await fetchWithRetry(`${BANIDB_BASE_URL}/banis/${baniId}`);
    if (data) {
      writeFileSync(outFile, JSON.stringify(data));
      console.log(`  Bani ${baniId}: ✅ saved`);
    } else {
      console.error(`  Bani ${baniId}: ❌ failed`);
    }
    await delay(300);
  }
}

// ── Fetch today's Hukamnama ──────────────────────────────────────────────────

async function fetchHukamnama(): Promise<void> {
  console.log(`\n📜 Fetching today's Hukamnama...`);

  const data = await fetchWithRetry(`${BANIDB_BASE_URL}/hukamnamas/today`);
  if (data) {
    writeFileSync(join(OUTPUT_DIR, 'hukamnama', 'latest.json'), JSON.stringify(data));
    console.log(`  ✅ Hukamnama saved`);
  } else {
    console.error(`  ❌ Hukamnama fetch failed`);
  }
}

// ── Fetch Raags and Writers metadata ─────────────────────────────────────────

async function fetchMeta(): Promise<void> {
  console.log(`\n📋 Fetching metadata (Raags, Writers)...`);

  const raags = await fetchWithRetry(`${BANIDB_BASE_URL}/raags`);
  if (raags) {
    writeFileSync(join(OUTPUT_DIR, 'meta', 'raags.json'), JSON.stringify(raags));
    console.log(`  ✅ Raags saved`);
  }

  await delay(300);

  const writers = await fetchWithRetry(`${BANIDB_BASE_URL}/writers`);
  if (writers) {
    writeFileSync(join(OUTPUT_DIR, 'meta', 'writers.json'), JSON.stringify(writers));
    console.log(`  ✅ Writers saved`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏗️  Sikhi Vidhya — Offline Data Fetch');
  console.log(`   Output: ${OUTPUT_DIR}`);

  ensureDirs();

  await fetchAllAngs();
  await fetchAllBanis();
  await fetchHukamnama();
  await fetchMeta();

  console.log('\n🎉 All offline data fetched!');
  console.log('ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫ਼ਤਿਹ\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
