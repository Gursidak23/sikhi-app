const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = [
    { name: 'Source', desc: 'Primary/secondary sources for citations', query: prisma.source.count() },
    { name: 'Citation', desc: 'Links content to source references', query: prisma.citation.count() },
    { name: 'Raag', desc: '31 Raags in Guru Granth Sahib Ji', query: prisma.raag.count() },
    { name: 'BaniAuthor', desc: 'Gurbani authors (Guru Sahibaan etc.)', query: prisma.baniAuthor.count() },
    { name: 'Shabad', desc: 'Individual shabads with Ang numbers', query: prisma.shabad.count() },
    { name: 'Pankti', desc: 'Lines of Gurbani within shabads', query: prisma.pankti.count() },
    { name: 'TeekaInterpretation', desc: 'Gurbani interpretations/commentaries', query: prisma.teekaInterpretation.count() },
    { name: 'Era', desc: 'Historical eras (Guru Period, Misl etc.)', query: prisma.era.count() },
    { name: 'Period', desc: 'Sub-periods within eras', query: prisma.period.count() },
    { name: 'HistoricalEvent', desc: 'Sikh historical events', query: prisma.historicalEvent.count() },
    { name: 'HistoricalFigure', desc: 'Notable Sikh historical figures', query: prisma.historicalFigure.count() },
    { name: 'HistoricalEventFigure', desc: 'Links figures to events', query: prisma.historicalEventFigure.count() },
    { name: 'EventInterpretation', desc: 'Different views on events', query: prisma.eventInterpretation.count() },
    { name: 'ContentAudit', desc: 'Audit trail for content changes', query: prisma.contentAudit.count() },
    { name: 'ScholarlyReviewRequest', desc: 'Review requests for content', query: prisma.scholarlyReviewRequest.count() },
    { name: 'Disclaimer', desc: 'Site disclaimers / notices', query: prisma.disclaimer.count() },
    { name: 'GurbaniAngCache', desc: 'Cached Ang pages from BaniDB', query: prisma.gurbaniAngCache.count() },
    { name: 'ChatUser', desc: 'Community chat users', query: prisma.chatUser.count() },
    { name: 'ChatRoom', desc: 'Chat rooms / channels', query: prisma.chatRoom.count() },
    { name: 'ChatRoomMember', desc: 'Room membership join table', query: prisma.chatRoomMember.count() },
    { name: 'ChatMessage', desc: 'Ephemeral chat messages (12h TTL)', query: prisma.chatMessage.count() },
    { name: 'SavedMessage', desc: 'Bookmarked messages (persist)', query: prisma.savedMessage.count() },
  ];

  const results = [];
  for (const t of tables) {
    results.push({ name: t.name, desc: t.desc, count: await t.query });
  }

  console.log('');
  console.log('Table'.padEnd(26) + 'Records'.padStart(8) + '  ' + 'Description');
  console.log('='.repeat(85));
  results.forEach(r => {
    console.log(r.name.padEnd(26) + String(r.count).padStart(8) + '  ' + r.desc);
  });
  console.log('='.repeat(85));
  console.log('TOTAL'.padEnd(26) + String(results.reduce((s, r) => s + r.count, 0)).padStart(8));
  console.log('');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
