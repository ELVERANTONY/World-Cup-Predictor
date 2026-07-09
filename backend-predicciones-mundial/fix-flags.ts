import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const isoMapping: Record<string, string> = {
  'RSA': 'za', 'KOR': 'kr', 'CZE': 'cz',
  'BIH': 'ba', 'KSA': 'sa', 'CIV': 'ci',
  'COD': 'cd', 'CPV': 'cv', 'NZL': 'nz',
  'MEX': 'mx', 'CAN': 'ca', 'USA': 'us',
  'BRA': 'br', 'ARG': 'ar', 'FRA': 'fr',
  'GER': 'de', 'ESP': 'es', 'ENG': 'gb-eng',
  'POR': 'pt', 'NED': 'nl', 'ITA': 'it',
  'URU': 'uy', 'BEL': 'be', 'CRO': 'hr',
  'JPN': 'jp', 'COL': 'co', 'CHI': 'cl',
  'NGA': 'ng', 'SEN': 'sn', 'MAR': 'ma',
  'EGY': 'eg', 'AUS': 'au', 'SUI': 'ch',
  'DEN': 'dk', 'POL': 'pl', 'SRB': 'rs',
  'CMR': 'cm', 'GHA': 'gh', 'IRN': 'ir',
  'PAR': 'py', 'TUR': 'tr', 'QAT': 'qa',
  'ECU': 'ec', 'SWE': 'se', 'TUN': 'tn',
  'ALG': 'dz', 'AUT': 'at', 'JOR': 'jo',
  'IRQ': 'iq', 'NOR': 'no', 'PAN': 'pa',
  'UZB': 'uz', 'CUR': 'cw', 'HAI': 'ht',
  'SCO': 'gb-sct', 'WAL': 'gb-wls', 'PER': 'pe'
};

async function fixFlags() {
  const teams = await prisma.team.findMany();
  for (const team of teams) {
    let twoLetter = isoMapping[team.shortName];
    if (!twoLetter) {
        // Try to guess from the URL if it was already 2 letter, else just take first 2 letters
        twoLetter = team.shortName.substring(0, 2).toLowerCase();
    }
    const newFlagUrl = `https://flagcdn.com/w320/${twoLetter}.png`;
    await prisma.team.update({
      where: { id: team.id },
      data: { flagUrl: newFlagUrl }
    });
    console.log(`Updated ${team.name} (${team.shortName}) to ${newFlagUrl}`);
  }
  console.log("Done fixing flags!");
}

fixFlags().finally(() => prisma.$disconnect());
