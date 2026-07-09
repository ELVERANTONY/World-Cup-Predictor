import { prisma } from '../config/prisma.js';

export class RankingService {
  async getGlobalRanking(limit = 50) {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { totalPoints: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        totalPoints: true,
        rank: true,
        accuracyRate: true,
        level: true,
        predictionsCount: true,
        currentStreak: true,
        maxStreak: true,
      },
    });

    return users.map((user, index) => ({ ...user, position: index + 1 }));
  }

  async getRoomRanking(roomId: string) {
    const members = await prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            totalPoints: true,
            accuracyRate: true,
          },
        },
      },
      orderBy: { points: 'desc' },
    });

    return members.map((member, index) => ({
      ...member,
      position: index + 1,
    }));
  }

  async getWeeklyRanking(limit = 50) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const predictions = await prisma.prediction.groupBy({
      by: ['userId'],
      where: {
        points: { not: null },
        match: { date: { gte: startOfWeek } },
      },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
    });

    const userIds = predictions.map((p) => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatarUrl: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return predictions.map((p, index) => ({
      userId: p.userId,
      user: userMap.get(p.userId) || null,
      weeklyPoints: p._sum.points || 0,
      position: index + 1,
    }));
  }

  async getMonthlyRanking(limit = 50) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const predictions = await prisma.prediction.groupBy({
      by: ['userId'],
      where: {
        points: { not: null },
        match: { date: { gte: startOfMonth } },
      },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
    });

    const userIds = predictions.map((p) => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, avatarUrl: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return predictions.map((p, index) => ({
      userId: p.userId,
      user: userMap.get(p.userId) || null,
      monthlyPoints: p._sum.points || 0,
      position: index + 1,
    }));
  }

  async getHistoricalRanking(limit = 100) {
    return this.getGlobalRanking(limit);
  }

  async recalculateAll() {
    const users = await prisma.user.findMany({
      include: {
        predictions: { where: { points: { not: null } } },
      },
    });

    for (const user of users) {
      const scoredPredictions = user.predictions;
      const totalPoints = scoredPredictions.reduce((sum, p) => sum + (p.points || 0), 0);
      const correctPredictions = scoredPredictions.filter((p) => (p.points || 0) > 0);
      const accuracyRate = scoredPredictions.length > 0
        ? (correctPredictions.length / scoredPredictions.length) * 100
        : 0;

      await prisma.user.update({
        where: { id: user.id },
        data: { totalPoints, accuracyRate },
      });
    }

    const rankedUsers = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { totalPoints: 'desc' },
    });

    for (let i = 0; i < rankedUsers.length; i++) {
      await prisma.user.update({
        where: { id: rankedUsers[i].id },
        data: { rank: i + 1 },
      });
    }

    const rooms = await prisma.room.findMany({
      include: { members: true },
    });

    for (const room of rooms) {
      const memberPoints = await Promise.all(
        room.members.map(async (member) => {
          const predictions = await prisma.prediction.findMany({
            where: {
              userId: member.userId,
              points: { not: null },
            },
          });
          const total = predictions.reduce((sum, p) => sum + (p.points || 0), 0);
          return { memberId: member.id, userId: member.userId, total };
        }),
      );

      memberPoints.sort((a, b) => b.total - a.total);

      for (let i = 0; i < memberPoints.length; i++) {
        await prisma.roomMember.update({
          where: { id: memberPoints[i].memberId },
          data: { points: memberPoints[i].total, rank: i + 1 },
        });
      }
    }

    return { message: 'Rankings recalculated successfully.' };
  }
}

export const rankingService = new RankingService();
