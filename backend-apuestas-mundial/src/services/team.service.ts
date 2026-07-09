import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';

export class TeamService {
  async getAll(filters?: { group?: string }) {
    return prisma.team.findMany({
      where: filters?.group ? { group: filters.group } : undefined,
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });
  }

  async getById(id: string) {
    const team = await prisma.team.findUnique({
      where: { id },
      include: { _count: { select: { favoriteByUsers: true } } },
    });
    if (!team) throw new AppError('Team not found.', 404);
    return team;
  }

  async create(data: {
    name: string;
    shortName: string;
    flagUrl: string;
    group?: string;
    rank?: number;
  }) {
    const existing = await prisma.team.findFirst({
      where: { OR: [{ name: data.name }, { shortName: data.shortName }] },
    });
    if (existing) {
      throw new AppError('Team with this name or short name already exists.', 409);
    }

    return prisma.team.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      shortName: string;
      flagUrl: string;
      group: string;
      rank: number;
      points: number;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
    }>,
  ) {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new AppError('Team not found.', 404);
    return prisma.team.update({ where: { id }, data });
  }

  async delete(id: string) {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new AppError('Team not found.', 404);
    await prisma.team.delete({ where: { id } });
    return { message: 'Team deleted successfully.' };
  }
}

export const teamService = new TeamService();
