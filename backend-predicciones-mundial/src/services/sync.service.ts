import { prisma } from '../config/prisma.js';
import { logger } from '../middlewares/logger.js';

interface OpenFootballMatch {
  round: string;
  num?: number;
  date: string;
  time?: string;
  team1: string;
  team2: string;
  score?: {
    ft?: [number, number];
    ht?: [number, number];
    et?: [number, number];
    p?: [number, number];
  };
  group?: string;
  ground?: string;
  goals1?: Array<{ name: string; minute: string; penalty?: boolean; owngoal?: boolean }>;
  goals2?: Array<{ name: string; minute: string; penalty?: boolean; owngoal?: boolean }>;
}

interface OpenFootballData {
  name: string;
  matches: OpenFootballMatch[];
}

const KNOCKOUT_REFERENCE = /^[WL]\d+$/;

interface SyncResult {
  teams: number;
  stadiums: number;
  matches: number;
  updated: number;
  scoresCalculated: number;
}

const KNOWN_SHORT_NAMES: Record<string, string> = {
  'South Africa': 'RSA', 'South Korea': 'KOR', 'Czech Republic': 'CZE',
  'Bosnia & Herzegovina': 'BIH', 'Saudi Arabia': 'KSA', 'Ivory Coast': 'CIV',
  'DR Congo': 'COD', 'Cape Verde': 'CPV', 'New Zealand': 'NZL',
  'Mexico': 'MEX', 'Canada': 'CAN', 'USA': 'USA',
  'Brazil': 'BRA', 'Argentina': 'ARG', 'France': 'FRA',
  'Germany': 'GER', 'Spain': 'ESP', 'England': 'ENG',
  'Portugal': 'POR', 'Netherlands': 'NED', 'Italy': 'ITA',
  'Uruguay': 'URU', 'Belgium': 'BEL', 'Croatia': 'CRO',
  'Japan': 'JPN', 'Colombia': 'COL', 'Chile': 'CHI',
  'Nigeria': 'NGA', 'Senegal': 'SEN', 'Morocco': 'MAR',
  'Egypt': 'EGY', 'Australia': 'AUS', 'Switzerland': 'SUI',
  'Denmark': 'DEN', 'Poland': 'POL', 'Serbia': 'SRB',
  'Cameroon': 'CMR', 'Ghana': 'GHA', 'Iran': 'IRN',
  'Paraguay': 'PAR', 'Turkey': 'TUR', 'Qatar': 'QAT',
  'Ecuador': 'ECU', 'Sweden': 'SWE', 'Tunisia': 'TUN',
  'Algeria': 'ALG', 'Austria': 'AUT', 'Jordan': 'JOR',
  'Iraq': 'IRQ', 'Norway': 'NOR', 'Panama': 'PAN',
  'Uzbekistan': 'UZB', 'Curaçao': 'CUR', 'Haiti': 'HAI',
  'Scotland': 'SCO',
};

function parseCityFromGround(ground: string): { city: string; country: string } {
  const match = ground.match(/^(.+?)\s*\((.+?)\)$/);
  if (match) return { city: match[1].trim(), country: 'USA' };
  const conocidos: Record<string, string> = {
    'Mexico City': 'Mexico', 'Guadalajara (Zapopan)': 'Mexico',
    'Monterrey (Guadalupe)': 'Mexico', 'Toronto': 'Canada', 'Vancouver': 'Canada',
  };
  return { city: ground, country: conocidos[ground] || 'USA' };
}

function parseDate(dateStr: string, timeStr?: string): Date {
  if (!timeStr) return new Date(`${dateStr}T12:00:00Z`);
  const tzMatch = timeStr.match(/UTC([+-])(\d+)/);
  const cleanTime = timeStr.replace(/ UTC[+-]\d+/, '');
  if (tzMatch) {
    const sign = tzMatch[1];
    const hour = tzMatch[2].padStart(2, '0');
    return new Date(`${dateStr}T${cleanTime}:00${sign}${hour}:00`);
  }
  return new Date(`${dateStr}T${cleanTime}:00Z`);
}

function normalizeTeamName(name: string): string {
  return name.replace(/\s+/g, ' ').trim();
}

export class SyncService {
  async syncFromOpenFootball(): Promise<SyncResult> {
    logger.info('Starting OpenFootball sync...');

    const response = await fetch(
      'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenFootball data: ${response.statusText}`);
    }
    const data: OpenFootballData = await response.json();
    logger.info(`Fetched ${data.matches.length} matches from OpenFootball`);

    // Collect all unique teams and stadiums
    const teamSet = new Set<string>();
    const groundSet = new Set<string>();
    const groupSet = new Set<string>();
    const matchMap = new Map<string, OpenFootballMatch>();
    const teamToGroup = new Map<string, string>();

    for (const match of data.matches) {
      if (match.team1 && !KNOCKOUT_REFERENCE.test(match.team1)) {
        teamSet.add(normalizeTeamName(match.team1));
        if (match.group) teamToGroup.set(normalizeTeamName(match.team1), match.group);
      }
      if (match.team2 && !KNOCKOUT_REFERENCE.test(match.team2)) {
        teamSet.add(normalizeTeamName(match.team2));
        if (match.group) teamToGroup.set(normalizeTeamName(match.team2), match.group);
      }
      if (match.ground) groundSet.add(match.ground);
      if (match.group) groupSet.add(match.group);
      if (match.num) matchMap.set(String(match.num), match);
    }

    // Resolve knockout references (W97 = winner of match 97)
    const resolvedMatches = data.matches.filter(m => {
      if (!m.team1 || !m.team2) return false;
      const t1 = normalizeTeamName(m.team1);
      const t2 = normalizeTeamName(m.team2);
      if (KNOCKOUT_REFERENCE.test(t1) || KNOCKOUT_REFERENCE.test(t2)) {
        // Try to resolve from match numbers
        const ref1 = t1.match(/([WL])(\d+)/);
        const ref2 = t2.match(/([WL])(\d+)/);
        if (ref1 && ref2) {
          const m1 = matchMap.get(ref1[2]);
          const m2 = matchMap.get(ref2[2]);
          if (m1 && m2 && m1.score?.ft && m2.score?.ft) {
            // We could resolve but for now skip placeholders
            return false;
          }
        }
        return false;
      }
      return true;
    });

    logger.info(`Found ${teamSet.size} teams, ${groundSet.size} stadiums, ${groupSet.size} groups, ${resolvedMatches.length} resolvable matches`);

    // --- UPSERT TEAMS ---
    const iso2Map: Record<string, string> = {
      ARG: 'ar', BRA: 'br', FRA: 'fr', ENG: 'gb-eng', ESP: 'es', GER: 'de', POR: 'pt',
      NED: 'nl', BEL: 'be', ITA: 'it', URU: 'uy', COL: 'co', USA: 'us', MEX: 'mx',
      MAR: 'ma', CRO: 'hr', JPN: 'jp', SEN: 'sn', SUI: 'ch', ECU: 'ec', KOR: 'kr',
      CAN: 'ca', GHA: 'gh', AUS: 'au', PER: 'pe', CHI: 'cl', SWE: 'se', POL: 'pl',
      SRB: 'rs', IRN: 'ir', KSA: 'sa', QAT: 'qa', WAL: 'gb-wls', TUN: 'tn', CMR: 'cm',
      CRC: 'cr', EGY: 'eg', PAN: 'pa', NGA: 'ng', CIV: 'ci', DZA: 'dz', TUR: 'tr',
      NOR: 'no', PAR: 'py', VEN: 've', BOL: 'bo', JAM: 'jm', SLV: 'sv', HND: 'hn',
      NZL: 'nz', RSA: 'za', IRQ: 'iq', UAE: 'ae', CHN: 'cn', SYR: 'sy', OMN: 'om',
      UZB: 'uz', BHR: 'bh', JOR: 'jo', HAI: 'ht', CUR: 'cw', CZE: 'cz', SCO: 'gb-sct',
      AUT: 'at', BIH: 'ba', CPV: 'cv', COD: 'cd', ALG: 'dz'
    };

    let teamsCreated = 0;
    for (const teamName of teamSet) {
      const shortName = KNOWN_SHORT_NAMES[teamName] || teamName.substring(0, 3).toUpperCase();
      const group = teamToGroup.get(teamName) || null;
      const iso2 = iso2Map[shortName];
      const flagUrl = iso2 ? `https://flagcdn.com/w320/${iso2}.png` : '';

      const existing = await prisma.team.findFirst({
        where: { OR: [{ name: teamName }, { shortName }] },
      });
      if (!existing) {
        await prisma.team.create({
          data: { name: teamName, shortName, flagUrl, group },
        });
        teamsCreated++;
      } else {
        await prisma.team.update({
          where: { id: existing.id },
          data: { group, flagUrl },
        });
      }
    }
    logger.info(`Created ${teamsCreated} new teams and updated existing teams with groups/flags`);

    // --- UPSERT STADIUMS ---
    let stadiumsCreated = 0;
    for (const ground of groundSet) {
      const existing = await prisma.stadium.findFirst({ where: { name: ground } });
      if (!existing) {
        const { city, country } = parseCityFromGround(ground);
        await prisma.stadium.create({ data: { name: ground, city, country, capacity: 50000 } });
        stadiumsCreated++;
      }
    }
    logger.info(`Created ${stadiumsCreated} new stadiums`);

    // Get reference maps
    const allTeams = await prisma.team.findMany();
    const allStadiums = await prisma.stadium.findMany();
    const teamByName = new Map(allTeams.map(t => [t.name, t]));
    const stadiumByName = new Map(allStadiums.map(s => [s.name, s]));

    // --- UPSERT MATCHES ---
    let matchesCreated = 0;
    let matchesUpdated = 0;
    let scoresCalculated = 0;

    for (const match of resolvedMatches) {
      const team1 = normalizeTeamName(match.team1);
      const team2 = normalizeTeamName(match.team2);

      const homeTeam = teamByName.get(team1);
      const awayTeam = teamByName.get(team2);
      if (!homeTeam || !awayTeam) {
        logger.warn(`Skipping match: ${team1} vs ${team2} (unknown team)`);
        continue;
      }

      const matchDate = parseDate(match.date, match.time);
      const stage = match.group || match.round;
      const stadium = match.ground ? stadiumByName.get(match.ground) : null;
      const score = match.score;

      // Determine scores: use ft first, fall back to et, then null
      const homeScore = score?.ft?.[0] ?? (score?.et ? score.et[0] : null);
      const awayScore = score?.ft?.[1] ?? (score?.et ? score.et[1] : null);
      const extraTime = !!score?.et;
      const penalties = !!score?.p;

      // If scores exist, match is finished
      const status = (homeScore !== null && awayScore !== null) ? 'FINISHED' : 'SCHEDULED';

      // Upsert match: find by teams + date proximity
      const existingMatch = await prisma.match.findFirst({
        where: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          date: {
            gte: new Date(matchDate.getTime() - 7200000),
            lte: new Date(matchDate.getTime() + 7200000),
          },
        },
      });

      if (existingMatch) {
        const hadResult = existingMatch.status === 'FINISHED';
        await prisma.match.update({
          where: { id: existingMatch.id },
          data: {
            stage,
            stadiumId: stadium?.id ?? existingMatch.stadiumId,
            status: status as never,
            homeScore: homeScore ?? existingMatch.homeScore,
            awayScore: awayScore ?? existingMatch.awayScore,
            extraTime,
            penalties,
          },
        });

        // If match just got a result, calculate scores for predictions
        if (!hadResult && status === 'FINISHED' && homeScore !== null && awayScore !== null) {
          await this.calculateMatchScores(existingMatch.id, homeScore, awayScore);
          scoresCalculated++;
        }
        matchesUpdated++;
      } else {
        const created = await prisma.match.create({
          data: {
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            date: matchDate,
            stage,
            stadiumId: stadium?.id,
            status: status as never,
            homeScore,
            awayScore,
            extraTime,
            penalties,
          },
        });

        // If created with results, calculate scores
        if (status === 'FINISHED' && homeScore !== null && awayScore !== null) {
          await this.calculateMatchScores(created.id, homeScore, awayScore);
          scoresCalculated++;
        }
        matchesCreated++;
      }
    }

    logger.info(`Created ${matchesCreated}, updated ${matchesUpdated}, scored ${scoresCalculated} matches`);

    // --- UPDATE GROUP STANDINGS ---
    await this.updateGroupStandings();

    return {
      teams: teamsCreated,
      stadiums: stadiumsCreated,
      matches: matchesCreated,
      updated: matchesUpdated,
      scoresCalculated,
    };
  }

  private async calculateMatchScores(matchId: string, homeScore: number, awayScore: number) {
    const predictions = await prisma.prediction.findMany({
      where: { matchId },
    });

    if (predictions.length === 0) return;

    for (const prediction of predictions) {
      let points = 0;

      // Rule 1: Exact result = 5 points
      if (prediction.homeScore === homeScore && prediction.awayScore === awayScore) {
        points = 5;
      } else {
        // Rule 2: Correct winner = 3 points
        const actualResult = homeScore > awayScore ? 'H' : awayScore > homeScore ? 'A' : 'D';
        const predictedResult = prediction.homeScore > prediction.awayScore ? 'H' 
          : prediction.awayScore > prediction.homeScore ? 'A' : 'D';
        
        if (actualResult === predictedResult) {
          points = 3;
        }

        // Rule 3: Correct goal difference = 2 points (only if not exact and winner is correct)
        if (actualResult === predictedResult && points === 3) {
          const actualDiff = Math.abs(homeScore - awayScore);
          const predictedDiff = Math.abs(prediction.homeScore - prediction.awayScore);
          if (actualDiff === predictedDiff && actualDiff > 0) {
            points = 5; // winner + diff = 5 (max without exact)
          }
        }
      }

      // Rule 4: Early prediction bonus = +1 (predicted >= 24h before match)
      const match = await prisma.match.findUnique({ where: { id: matchId } });
      if (match) {
        const hoursBefore = (match.date.getTime() - prediction.createdAt.getTime()) / 3600000;
        if (hoursBefore >= 24) {
          points += 1;
        }
      }

      // Rule 5: Streak bonus = +2 (if user has 3+ consecutive correct)
      // Check user's last 2 predictions before this one
      if (points >= 3) {
        const userPredictions = await prisma.prediction.findMany({
          where: { userId: prediction.userId, points: { not: null } },
          orderBy: { createdAt: 'desc' },
          take: 3,
        });
        
        // Count consecutive correct
        let streak = 0;
        for (const p of userPredictions) {
          if (p.points && p.points >= 3) streak++;
          else break;
        }
        if (streak >= 2) points += 2; // bonus after 3 consecutive (current + 2 previous)
      }

      // Cap at 10
      points = Math.min(points, 10);

      await prisma.prediction.update({
        where: { id: prediction.id },
        data: { points },
      });

      // Update user stats
      await this.updateUserStats(prediction.userId);
    }
  }

  private async updateUserStats(userId: string) {
    const predictions = await prisma.prediction.findMany({
      where: { userId, points: { not: null } },
    });

    const totalPredictions = predictions.length;
    const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);
    const correctPredictions = predictions.filter(p => (p.points || 0) >= 3).length;
    const accuracyRate = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0;

    // Calculate streak
    const ordered = [...predictions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    let currentStreak = 0;
    let maxStreak = 0;
    for (const p of ordered) {
      if ((p.points || 0) >= 3) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints,
        predictionsCount: totalPredictions,
        accuracyRate,
        currentStreak,
        maxStreak: Math.max(maxStreak, (await prisma.user.findUnique({ where: { id: userId } }))?.maxStreak || 0),
      },
    });
  }

  private async updateGroupStandings() {
    const finishedMatches = await prisma.match.findMany({
      where: { status: 'FINISHED', homeScore: { not: null }, awayScore: { not: null } },
      include: { homeTeam: true, awayTeam: true },
    });

    const teamStats = new Map<string, { played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number }>();

    for (const match of finishedMatches) {
      const home = teamStats.get(match.homeTeamId) || { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
      const away = teamStats.get(match.awayTeamId) || { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };

      home.played++;
      away.played++;
      home.goalsFor += match.homeScore!;
      home.goalsAgainst += match.awayScore!;
      away.goalsFor += match.awayScore!;
      away.goalsAgainst += match.homeScore!;

      if (match.homeScore! > match.awayScore!) {
        home.won++; home.points += 3;
        away.lost++;
      } else if (match.homeScore! < match.awayScore!) {
        away.won++; away.points += 3;
        home.lost++;
      } else {
        home.drawn++; home.points += 1;
        away.drawn++; away.points += 1;
      }

      teamStats.set(match.homeTeamId, home);
      teamStats.set(match.awayTeamId, away);
    }

    for (const [teamId, stats] of teamStats) {
      await prisma.team.update({
        where: { id: teamId },
        data: {
          played: stats.played,
          won: stats.won,
          drawn: stats.drawn,
          lost: stats.lost,
          goalsFor: stats.goalsFor,
          goalsAgainst: stats.goalsAgainst,
          points: stats.points,
        },
      });
    }

    logger.info(`Updated group standings for ${teamStats.size} teams`);
  }
}

export const syncService = new SyncService();
