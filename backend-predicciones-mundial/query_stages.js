const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const matches = await prisma.match.findMany({ select: { stage: true } });
  const stages = [...new Set(matches.map(m => m.stage))];
  console.log(stages);
}
main().catch(console.error).finally(() => prisma.$disconnect());
