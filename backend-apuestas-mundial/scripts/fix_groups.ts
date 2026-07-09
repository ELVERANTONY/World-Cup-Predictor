import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function fixGroups() {
  const response = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json');
  const data = await response.json();
  
  const teamGroupMap = new Map<string, string>();
  for (const match of data.matches) {
    if (match.group) {
      if (match.team1 && !/^[WL]\d+$/.test(match.team1)) teamGroupMap.set(match.team1.replace(/\s+/g, ' ').trim(), match.group);
      if (match.team2 && !/^[WL]\d+$/.test(match.team2)) teamGroupMap.set(match.team2.replace(/\s+/g, ' ').trim(), match.group);
    }
  }

  const teams = await prisma.team.findMany();
  for (const team of teams) {
    const group = teamGroupMap.get(team.name);
    if (group) {
      await prisma.team.update({
        where: { id: team.id },
        data: { group }
      });
      console.log(`Updated ${team.name} to ${group}`);
    }
  }
}

fixGroups().then(() => process.exit(0)).catch(console.error);
