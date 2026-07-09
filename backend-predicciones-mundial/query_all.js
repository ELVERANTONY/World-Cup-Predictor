const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const matches = await prisma.match.findMany({
    where: { stage: { in: ['Round of 16', 'Quarter-final'] } },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { date: 'asc' }
  });
  matches.forEach(m => {
    console.log(`${m.stage}: ${m.homeTeam?.name || 'TBD'} vs ${m.awayTeam?.name || 'TBD'}`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
