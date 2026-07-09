import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { Prisma } from '@prisma/client';

export class MatchService {
  async getAll(filters?: {
    stage?: string;
    status?: string;
    teamId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const where: Prisma.MatchWhereInput = {};

    if (filters?.stage) where.stage = filters.stage as never;
    if (filters?.status) where.status = filters.status as never;
    if (filters?.teamId) {
      where.OR = [
        { homeTeamId: filters.teamId },
        { awayTeamId: filters.teamId },
      ];
    }
    if (filters?.fromDate || filters?.toDate) {
      where.date = {};
      if (filters.fromDate) where.date = { ...where.date, gte: new Date(filters.fromDate) };
      if (filters.toDate) where.date = { ...where.date, lte: new Date(filters.toDate) };
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: true,
        awayTeam: true,
        stadium: true,
        _count: { select: { predictions: true } },
      },
      orderBy: { date: 'asc' },
    });

    return matches;
  }

  async getById(id: string) {
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        stadium: true,
        _count: { select: { predictions: true } },
      },
    });
    if (!match) throw new AppError('Match not found.', 404);
    return match;
  }

  async create(data: {
    homeTeamId: string;
    awayTeamId: string;
    date: string;
    stage: string;
    stadiumId?: string;
    referee?: string;
  }) {
    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findUnique({ where: { id: data.homeTeamId } }),
      prisma.team.findUnique({ where: { id: data.awayTeamId } }),
    ]);
    if (!homeTeam) throw new AppError('Home team not found.', 404);
    if (!awayTeam) throw new AppError('Away team not found.', 404);
    if (data.homeTeamId === data.awayTeamId) {
      throw new AppError('Home and away teams must be different.', 400);
    }

    return prisma.match.create({
      data: {
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        date: new Date(data.date),
        stage: data.stage,
        stadiumId: data.stadiumId,
        referee: data.referee,
      },
      include: { homeTeam: true, awayTeam: true, stadium: true },
    });
  }

  async update(
    id: string,
    data: Partial<{
      homeTeamId: string;
      awayTeamId: string;
      date: string;
      stage: string;
      stadiumId: string;
      referee: string;
      status: string;
    }>,
  ) {
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) throw new AppError('Match not found.', 404);

    const updateData: Record<string, unknown> = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    return prisma.match.update({
      where: { id },
      data: updateData,
      include: { homeTeam: true, awayTeam: true, stadium: true },
    });
  }

  async updateResult(
    id: string,
    data: {
      homeScore: number;
      awayScore: number;
      status?: string;
      extraTime?: boolean;
      penalties?: boolean;
    },
  ) {
    const match = await prisma.match.findUnique({
      where: { id },
      include: { predictions: true },
    });
    if (!match) throw new AppError('Match not found.', 404);
    if (match.status === 'FINISHED') {
      throw new AppError('Match result has already been submitted.', 400);
    }

    const updated = await prisma.match.update({
      where: { id },
      data: {
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        status: (data.status as never) || 'FINISHED',
        extraTime: data.extraTime ?? false,
        penalties: data.penalties ?? false,
      },
      include: { homeTeam: true, awayTeam: true },
    });

    return updated;
  }

  async delete(id: string) {
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) throw new AppError('Match not found.', 404);
    await prisma.match.delete({ where: { id } });
    return { message: 'Match deleted successfully.' };
  }
}

export const matchService = new MatchService();
