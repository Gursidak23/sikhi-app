// ============================================================================
// OFFLINE SEARCH INDEX BUILDER
// ============================================================================
// Reads the downloaded Ang JSON files and builds a compact search index
// for client-side Gurbani search without network access.
//
// Run with: npx tsx scripts/build-search-index.ts
// (Must run AFTER scripts/fetch-offline-data.ts)
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(__dirname, '..', 'public', 'data');
const TOTAL_ANGS = 1430;

interface Verse {
  verseId: number;
  shabadId: number;
  verse: { gurmukhi: string; unicode: string };
  pageNo: number;
  writer?: { writerId: number; english: string };
  raag?: { english: string };
}

interface SearchEntry {
  i: number;   // verseId
  s: number;   // shabadId
  g: string;   // gurmukhi unicode text
  f: string;   // first letters (space-separated words → first char of each)
  p: number;   // pageNo (Ang)
}

function extractFirstLetters(gurmukhi: string): string {
  return gurmukhi
    .split(/\s+/)
    .map(w => w.charAt(0))
    .filter(c => c.length > 0)
    .join('');
}

async function main() {
  console.log('🔍 Building offline search index...');

  const entries: SearchEntry[] = [];
  let missingAngs = 0;

  for (let ang = 1; ang <= TOTAL_ANGS; ang++) {
    const file = join(DATA_DIR, 'gurbani', `ang-${ang}.json`);
    if (!existsSync(file)) {
      missingAngs++;
      continue;
    }

    const data = JSON.parse(readFileSync(file, 'utf-8'));
    const verses: Verse[] = data.page || [];

    for (const v of verses) {
      const unicode = v.verse?.unicode || '';
      if (!unicode.trim()) continue;

      entries.push({
        i: v.verseId,
        s: v.shabadId,
        g: unicode,
        f: extractFirstLetters(unicode),
        p: v.pageNo || ang,
      });
    }
  }

  if (missingAngs > 0) {
    console.warn(`  ⚠️  ${missingAngs} Ang files missing — run fetch-offline-data.ts first`);
  }

  const outFile = join(DATA_DIR, 'search-index.json');
  writeFileSync(outFile, JSON.stringify(entries));

  const sizeMB = (Buffer.byteLength(JSON.stringify(entries)) / 1024 / 1024).toFixed(1);
  console.log(`  ✅ Search index built: ${entries.length} verses, ${sizeMB} MB`);
  console.log(`  📁 ${outFile}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
