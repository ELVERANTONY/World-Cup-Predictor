import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';

export class StadiumService {
  async getAll() {
    return prisma.stadium.findMany({ orderBy: { name: 'asc' } });
  }

  async getById(id: string) {
    const stadium = await prisma.stadium.findUnique({ where: { id } });
    if (!stadium) throw new AppError('Stadium not found.', 404);
    return stadium;
  }

  async create(data: {
    name: string;
    city: string;
    country: string;
    capacity: number;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
    surface?: string;
  }) {
    return prisma.stadium.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      city: string;
      country: string;
      capacity: number;
      imageUrl: string;
      latitude: number;
      longitude: number;
      surface: string;
    }>,
  ) {
    const stadium = await prisma.stadium.findUnique({ where: { id } });
    if (!stadium) throw new AppError('Stadium not found.', 404);
    return prisma.stadium.update({ where: { id }, data });
  }

  async delete(id: string) {
    const stadium = await prisma.stadium.findUnique({ where: { id } });
    if (!stadium) throw new AppError('Stadium not found.', 404);
    await prisma.stadium.delete({ where: { id } });
    return { message: 'Stadium deleted successfully.' };
  }
}

export const stadiumService = new StadiumService();
