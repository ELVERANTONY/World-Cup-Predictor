import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';
import { scoringService } from './scoring.service.js';

export class PredictionService {
  async create(userId: string, matchId: string, homeScore: number, awayScore: number) {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new AppError('Match not found.', 404);
    if (match.status !== 'SCHEDULED') {
      throw new AppError('Match has already started or finished.', 400);
    }

    const lockTime = new Date(match.date.getTime() - 10 * 60 * 1000);
    if (new Date() >= lockTime) {
      throw new AppError('Match is locked. Predictions are closed (10min before start).', 400);
    }

    const existing = await prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId } },
    });
    if (existing) {
      throw new AppError('You have already predicted this match.', 409);
    }

    if (homeScore < 0 || awayScore < 0) {
      throw new AppError('Scores cannot be negative.', 400);
    }

    const prediction = await prisma.prediction.create({
      data: { userId, matchId, homeScore, awayScore },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { predictionsCount: { increment: 1 } },
    });

    return prediction;
  }

  async update(userId: string, predictionId: string, homeScore: number, awayScore: number) {
    const prediction = await prisma.prediction.findUnique({
      where: { id: predictionId },
      include: { match: true },
    });
    if (!prediction) throw new AppError('Prediction not found.', 404);
    if (prediction.userId !== userId) {
      throw new AppError('This prediction does not belong to you.', 403);
    }
    if (prediction.match.status !== 'SCHEDULED') {
      throw new AppError('Match has already started or finished.', 400);
    }

    const lockTime = new Date(prediction.match.date.getTime() - 10 * 60 * 1000);
    if (new Date() >= lockTime) {
      throw new AppError('Match is locked. Predictions are closed (10min before start).', 400);
    }

    if (homeScore < 0 || awayScore < 0) {
      throw new AppError('Scores cannot be negative.', 400);
    }

    return prisma.prediction.update({
      where: { id: predictionId },
      data: { homeScore, awayScore },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    });
  }

  async getByUser(userId: string, filters?: { status?: string }) {
    const where: Record<string, unknown> = { userId };
    if (filters?.status) {
      where.match = { status: filters.status };
    }

    return prisma.prediction.findMany({
      where,
      include: {
        match: {
          include: { homeTeam: true, awayTeam: true, stadium: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByMatch(matchId: string) {
    return prisma.prediction.findMany({
      where: { matchId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getByRoom(roomId: string) {
    const roomMembers = await prisma.roomMember.findMany({
      where: { roomId },
      select: { userId: true },
    });
    const userIds = roomMembers.map((m) => m.userId);

    return prisma.prediction.findMany({
      where: { userId: { in: userIds } },
      include: {
        match: { include: { homeTeam: true, awayTeam: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async lockPredictions() {
    const now = new Date();
    const lockThreshold = new Date(now.getTime() + 10 * 60 * 1000);

    const matches = await prisma.match.findMany({
      where: {
        status: 'SCHEDULED',
        date: { lte: lockThreshold, gte: now },
      },
      include: { predictions: true },
    });

    return matches;
  }

  async scorePrediction(predictionId: string, actualHome: number, actualAway: number) {
    const prediction = await prisma.prediction.findUnique({
      where: { id: predictionId },
      include: { match: true },
    });
    if (!prediction) throw new AppError('Prediction not found.', 404);
    if (prediction.points !== null) {
      throw new AppError('Prediction already scored.', 400);
    }

    const result = scoringService.calculatePoints(
      actualHome,
      actualAway,
      prediction.homeScore,
      prediction.awayScore,
      prediction.match.date,
      prediction.createdAt,
    );

    await prisma.prediction.update({
      where: { id: predictionId },
      data: { points: result.points },
    });

    const user = await prisma.user.findUnique({ where: { id: prediction.userId } });
    if (user) {
      const userPredictions = await prisma.prediction.findMany({
        where: { userId: user.id, points: { not: null } },
      });

      const totalPoints = userPredictions.reduce((sum, p) => sum + (p.points || 0), 0);
      const scoredPredictions = userPredictions.filter((p) => p.points !== null);
      const correctPredictions = userPredictions.filter((p) => (p.points || 0) > 0);
      const accuracyRate = scoredPredictions.length > 0
        ? (correctPredictions.length / scoredPredictions.length) * 100
        : 0;

      let currentStreak = 0;
      let maxStreak = user.maxStreak;
      if (result.points > 0) {
        currentStreak = user.currentStreak + 1;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        await prisma.activity.create({
          data: {
            userId: user.id,
            type: 'prediction_correct',
            message: `Correct prediction! +${result.points} points`,
            metadata: { predictionId, points: result.points },
          },
        });
      } else {
        currentStreak = 0;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalPoints,
          accuracyRate,
          currentStreak,
          maxStreak,
          xp: { increment: result.points },
        },
      });
    }

    return { predictionId, points: result.points, details: result.details };
  }
}

export const predictionService = new PredictionService();
