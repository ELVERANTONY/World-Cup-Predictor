import { prisma } from '../config/prisma.js';

export class StatisticsService {
  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        predictions: {
          include: { match: true },
          orderBy: { createdAt: 'desc' },
        },
        achievements: {
          include: { achievement: true },
        },
        _count: {
          select: { rooms: true, notifications: { where: { read: false } } },
        },
      },
    });

    if (!user) throw new Error('User not found.');

    const totalPredictions = user.predictions.length;
    const scoredPredictions = user.predictions.filter((p) => p.points !== null);
    const correctPredictions = scoredPredictions.filter((p) => (p.points || 0) > 0);

    const points = scoredPredictions.reduce((sum, p) => sum + (p.points || 0), 0);
    const accuracy = scoredPredictions.length > 0
      ? (correctPredictions.length / scoredPredictions.length) * 100
      : 0;

    const predictionsByStage: Record<string, number> = {};
    user.predictions.forEach((p) => {
      predictionsByStage[p.match.stage] = (predictionsByStage[p.match.stage] || 0) + 1;
    });

    return {
      predictionsCount: totalPredictions,
      totalPredictions,
      scoredPredictions: scoredPredictions.length,
      correctPredictions: correctPredictions.length,
      totalPoints: points,
      accuracyRate: accuracy,
      accuracy,
      rank: user.rank,
      currentStreak: user.currentStreak,
      maxStreak: user.maxStreak,
      level: user.level,
      xp: user.xp,
      predictionsByStage,
      achievements: user.achievements,
      roomsCount: user._count.rooms,
    };
  }

  async getGlobalStats() {
    const [totalUsers, totalPredictions, totalMatches, totalRooms] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.prediction.count(),
      prisma.match.count(),
      prisma.room.count(),
    ]);

    const finishedMatches = await prisma.match.findMany({
      where: { status: 'FINISHED' },
      include: { predictions: { where: { points: { not: null } } } },
    });

    const totalPointsAwarded = finishedMatches.reduce(
      (sum, match) => sum + match.predictions.reduce((s, p) => s + (p.points || 0), 0),
      0,
    );

    const topPredictor = await prisma.user.findFirst({
      where: { isActive: true },
      orderBy: { totalPoints: 'desc' },
      select: { id: true, name: true, avatarUrl: true, totalPoints: true },
    });

    const matchesByStage = await prisma.match.groupBy({
      by: ['stage'],
      _count: true,
    });

    return {
      totalUsers,
      totalPredictions,
      totalMatches,
      totalRooms,
      totalPointsAwarded,
      topPredictor,
      matchesByStage,
      finishedMatches: finishedMatches.length,
    };
  }

  async getMatchStats() {
    const matches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        _count: { select: { predictions: true } },
      },
      orderBy: { date: 'desc' },
    });

    return matches.map((match) => {
      return {
        id: match.id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        date: match.date,
        stage: match.stage,
        status: match.status,
        predictionsCount: match._count.predictions,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      };
    });
  }

  async getGroupStats() {
    const teams = await prisma.team.findMany({
      orderBy: [{ group: 'asc' }, { points: 'desc' }],
    });

    const groups: Record<string, typeof teams> = {};
    teams.forEach((team) => {
      const g = team.group || 'UNGROUPED';
      if (!groups[g]) groups[g] = [];
      groups[g].push(team);
    });

    return groups;
  }
}

export const statisticsService = new StatisticsService();
