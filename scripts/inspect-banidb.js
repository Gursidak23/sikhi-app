// Quick script to inspect BaniDB data structure
async function main() {
  const resp = await fetch('https://api.banidb.com/v2/angs/1/G');
  const d = await resp.json();
  
  console.log('Top-level keys:', Object.keys(d));
  console.log('Source:', JSON.stringify(d.source, null, 2));
  console.log('Count:', d.count);
  console.log('Navigation:', JSON.stringify(d.navigation, null, 2));
  console.log('First verse keys:', Object.keys(d.page[0]));
  console.log('First verse (truncated):', JSON.stringify(d.page[0], null, 2).substring(0, 2000));
  console.log('---');

  // Check shabadId grouping
  const shabads = {};
  d.page.forEach(v => {
    if (!shabads[v.shabadId]) shabads[v.shabadId] = [];
    shabads[v.shabadId].push(v.verseId);
  });
  console.log('Shabads on Ang 1:', Object.keys(shabads).length);
  console.log('Shabad groups:', JSON.stringify(shabads));

  // Writer and raag info
  console.log('Writer (verse 0):', JSON.stringify(d.page[0].writer));
  console.log('Raag (verse 0):', JSON.stringify(d.page[0].raag));

  // Check a middle ang for raag/writer variety
  const resp2 = await fetch('https://api.banidb.com/v2/angs/500/G');
  const d2 = await resp2.json();
  const shabads2 = {};
  d2.page.forEach(v => {
    if (!shabads2[v.shabadId]) shabads2[v.shabadId] = [];
    shabads2[v.shabadId].push(v.verseId);
  });
  console.log('\nAng 500:');
  console.log('Shabads:', Object.keys(shabads2).length);
  console.log('Writer (verse 0):', JSON.stringify(d2.page[0].writer));
  console.log('Raag (verse 0):', JSON.stringify(d2.page[0].raag));

  // Collect all unique writers across a few pages
  const writers = new Set();
  const raags = new Set();
  for (const v of [...d.page, ...d2.page]) {
    if (v.writer) writers.add(JSON.stringify(v.writer));
    if (v.raag) raags.add(JSON.stringify(v.raag));
  }
  console.log('\nUnique writers found:', writers.size);
  console.log('Unique raags found:', raags.size);
  writers.forEach(w => console.log('  Writer:', w));
  raags.forEach(r => console.log('  Raag:', r));
}

main().catch(console.error);
