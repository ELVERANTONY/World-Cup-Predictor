const axios = require('axios');
async function main() {
  const res = await axios.get('http://localhost:3001/api/v1/matches', { params: { stage: 'Round of 16' } });
  const data = res.data.data;
  console.log('Total:', data.length);
  data.forEach((m, i) => {
    console.log(`[${i}] ${m.homeTeam?.name} vs ${m.awayTeam?.name}`);
  });
}
main().catch(console.error);
