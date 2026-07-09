import fs from 'fs';

function parseDate(dateStr: string, timeStr?: string): Date {
  if (!timeStr) return new Date(`${dateStr}T12:00:00Z`);
  const tzMatch = timeStr.match(/UTC([+-]\d+)/);
  const cleanTime = timeStr.replace(/ UTC[+-]\d+/, '');
  if (tzMatch) return new Date(`${dateStr}T${cleanTime}:00${tzMatch[1]}:00`);
  return new Date(`${dateStr}T${cleanTime}:00Z`);
}

async function main() {
  const response = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json');
  const data = await response.json();
  
  for (const match of data.matches) {
    if (!match.team1 || !match.team2) continue;
    const matchDate = parseDate(match.date, match.time);
    if (isNaN(matchDate.getTime())) {
      console.log(`INVALID DATE: date="${match.date}", time="${match.time}"`);
    }
  }
  console.log("Done checking dates.");
}
main();
