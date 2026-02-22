const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Database size
  const dbSize = await prisma.$queryRaw`
    SELECT pg_size_pretty(pg_database_size(current_database())) AS database_size,
           current_database() AS database_name`;
  console.log('=== DATABASE SIZE ===');
  console.log(`Database: ${dbSize[0].database_name}`);
  console.log(`Total Size: ${dbSize[0].database_size}`);

  // Table sizes (using pg_class which is more reliable)
  const tables = await prisma.$queryRaw`
    SELECT 
      c.relname AS tablename,
      pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
      pg_total_relation_size(c.oid) AS total_bytes
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY pg_total_relation_size(c.oid) DESC`;
  console.log('\n=== TABLE SIZES ===');
  tables.forEach(t => console.log(`  ${t.tablename}: ${t.total_size}`));

  // Row counts
  const rowCounts = await prisma.$queryRaw`
    SELECT c.relname AS table_name, c.reltuples::bigint AS row_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.reltuples DESC`;
  console.log('\n=== ROW COUNTS (estimated) ===');
  rowCounts.forEach(r => console.log(`  ${r.table_name}: ${r.row_count}`));

  // Aiven free tier limit is typically 1 GB
  const rawSize = await prisma.$queryRaw`
    SELECT pg_database_size(current_database()) AS size_bytes`;
  const sizeBytes = Number(rawSize[0].size_bytes);
  const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
  const sizeGB = (sizeBytes / (1024 * 1024 * 1024)).toFixed(4);
  const freeLimit = 1024; // 1 GB in MB (Aiven free tier)
  const pctUsed = ((sizeBytes / (1024 * 1024 * 1024)) * 100).toFixed(2);

  console.log('\n=== STORAGE SUMMARY ===');
  console.log(`Used: ${sizeMB} MB (${sizeGB} GB)`);
  console.log(`Aiven free tier limit: ~1 GB`);
  console.log(`Usage: ~${pctUsed}% of 1 GB`);

  if (sizeBytes > 0.9 * 1024 * 1024 * 1024) {
    console.log('⚠️  WARNING: Database is over 90% full!');
  } else if (sizeBytes > 0.75 * 1024 * 1024 * 1024) {
    console.log('⚠️  CAUTION: Database is over 75% full.');
  } else {
    console.log('✅ Database storage looks healthy.');
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
